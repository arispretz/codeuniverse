/**
 * @fileoverview KanbanBoard component 🗂️
 * Main board component that manages:
 * - Project tasks
 * - Kanban lists and columns
 * - Filters and sorting
 * - Drag & Drop functionality
 * - Task creation, update, and deletion
 * - Real-time updates via socket.io
 *
 * @module pages/KanbanBoard
 */

import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  Button,
  LinearProgress,
  Typography,
} from "@mui/material";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase/auth.js";
import TaskFilters from "../components/TaskFilters.jsx";
import Column from "../components/Column.jsx";
import KanbanOverlay from "../components/KanbanOverlay.jsx";
import KanbanModals from "../components/KanbanModals.jsx";

import {
  STATUSES,
  getIdStr,
  isSameId,
  normalizeStatus,
  statusLabels,
} from "../components/KanbanUtils.jsx";

import {
  getKanbanColumns,
  createKanbanTask,
  updateKanbanTask,
  deleteKanbanTask,
  moveKanbanTask,
} from "../services/kanbanService.js";

import { useSnackbar } from "notistack";
import { getProjects, getKanbanLists } from "../services/projectService.js";
import { getPublicUsers } from "../services/userService.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { isUserAssigned } from "../utils/taskUtils.js";

// ✅ Ensure environment variable is defined
if (!import.meta.env.VITE_EXPRESS_URL) {
  throw new Error("Environment variable VITE_EXPRESS_URL must be defined");
}
const BASE_URL = import.meta.env.VITE_EXPRESS_URL;

const KanbanBoard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const { id: projectId } = useParams(); 

  // Authentication context
  const { role, userMongoId, firebaseUid } = useContext(AuthContext);
  const [user] = useAuthState(auth);
  const { enqueueSnackbar } = useSnackbar();

  // Source of truth: all project tasks
  const [allTasks, setAllTasks] = useState([]);

  // Kanban lists
  const [lists, setLists] = useState([]);

  // Filtered view: tasks grouped by status
  const [columns, setColumns] = useState(() =>
    STATUSES.reduce((acc, s) => {
      acc[s] = [];
      return acc;
    }, {})
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  // Filters
  const [selectedUser, setSelectedUser] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedListId, setSelectedListId] = useState("");
  const [projects, setProjects] = useState([]);
  const [platformUsers, setPlatformUsers] = useState([]);

  const [activeProjectId, setActiveProjectId] = useState(projectId || "");

  // Snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (msg, sev = "success") => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setSnackbarOpen(true);
  };

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const canEditOrDelete = (task) => {
    if (role === "manager" || role === "admin") return true;
    if (role === "developer") {
      return isUserAssigned(task, userMongoId, firebaseUid);
    }
    return false;
  };

  // ✅ Fetch tasks for the active project
  const fetchProjectTasks = async () => {
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const data = await getKanbanColumns({ projectId: activeProjectId });
      const normalized = Object.values(data || {})
        .flat()
        .map((t) => ({ ...t, status: normalizeStatus(t.status || "to do") }));
      setAllTasks(normalized);
      setLastSync(new Date());
    } catch (err) {
      console.error("Error loading project tasks:", err);
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (tasks) => {
    let arr = Array.isArray(tasks) ? [...tasks] : [];
    if (selectedListId) {
      arr = arr.filter((t) => t.listId === selectedListId);
    }
    if (selectedUser) {
      arr = arr.filter(
        (t) =>
          (t.assignees || []).some((a) => a._id === selectedUser) ||
          t.assignedTo === selectedUser
      );
    }
    if (priorityFilter) {
      arr = arr.filter(
        (t) => (t.priority || "").toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    return arr;
  };

  useEffect(() => {
    const tasks = applyFilters(allTasks);
    const grouped = STATUSES.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => normalizeStatus(t.status) === status);
      return acc;
    }, {});
    setColumns(grouped);
  }, [allTasks, selectedListId, selectedUser, priorityFilter, sortBy, sortOrder]);

  const handleDragStart = (event) => {
    setActiveTask(event.active?.data?.current?.task || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const sourceCol = active?.data?.current?.containerId;
    const destCol = normalizeStatus(over?.data?.current?.containerId || over.id);

    const activeIdStr = String(active.id);
    const overTaskId = over?.data?.current?.task
      ? getIdStr(over.data.current.task)
      : null;

    if (!sourceCol || !destCol) return;

    const sourceTasks = [...(columns[sourceCol] || [])];
    const destTasks = [...(columns[destCol] || [])];

    const oldIndex = sourceTasks.findIndex((t) =>
      isSameId(getIdStr(t), activeIdStr)
    );
    if (oldIndex < 0) return;

    const [moved] = sourceTasks.splice(oldIndex, 1);
    const optimisticMoved = { ...moved, status: destCol };

    destTasks.splice(
      overTaskId
        ? destTasks.findIndex((t) => isSameId(getIdStr(t), overTaskId))
        : destTasks.length,
      0,
      optimisticMoved
    );

    const snapshot = columns;
    const nextColumns = {
      ...columns,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    };

    setColumns(nextColumns);
    setAllTasks((prev) =>
      prev.map((t) =>
        isSameId(getIdStr(t), activeIdStr) ? { ...t, status: destCol } : t
      )
    );

    try {
      const taskId = moved._id || moved.id;
      await moveKanbanTask(taskId, destCol);
      enqueueSnackbar(`Task moved to "${statusLabels[destCol]}" ✅`, {
        variant: "success",
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      enqueueSnackbar("Error updating task status", { variant: "error" });
      setColumns(snapshot);
      setAllTasks((prev) =>
        prev.map((t) =>
          isSameId(getIdStr(t), activeIdStr) ? { ...t, status: sourceCol } : t
        )
      );
    }
  };

  const deleteTask = async (task) => {
    try {
      await deleteKanbanTask(task._id);
      setAllTasks((prev) => prev.filter((t) => t._id !== task._id));
      enqueueSnackbar(`Task "${task.title}" deleted ✅`, { variant: "success" });
    } catch (err) {
      console.error("Error deleting task:", err);
      enqueueSnackbar("Error deleting the task", { variant: "error" });
    }
  };

  /**
   * Socket.io effects for real-time task updates
   */
  useEffect(() => {
    if (!user || !activeProjectId) return;

    let socket;

    const initSocket = async () => {
      try {
        const token = await user.getIdToken();
        socket = io(BASE_URL, {
          transports: ["polling", "websocket"],
          auth: { token },
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          enqueueSnackbar("✅ Socket connected", { variant: "success" });
        });

        socket.on("disconnect", () => {
          enqueueSnackbar("⚠️ Socket disconnected", { variant: "warning" });
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          enqueueSnackbar("Error connecting to socket server", { variant: "error" });
        });

        socket.on("taskCreated", (task) => {
          if (task.projectId !== activeProjectId) return;
          const normalized = {
            ...task,
            status: normalizeStatus(task.status),
            listId: task.listId || selectedListId,
          };
          setAllTasks((prev) => [normalized, ...prev]);
        });

        socket.on("taskUpdated", (task) => {
          if (task.projectId !== activeProjectId) return;
          const normalized = {
            ...task,
            status: normalizeStatus(task.status),
            listId: task.listId || selectedListId,
          };
          setAllTasks((prev) =>
            prev.map((t) => (t._id === normalized._id ? normalized : t))
          );
        });

        socket.on("taskDeleted", (task) => {
          if (task.projectId !== activeProjectId) return;
          setAllTasks((prev) =>
            prev.filter((t) => !isSameId(getIdStr(t), getIdStr(task)))
          );
        });
      } catch (err) {
        console.error("Error initializing socket:", err);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.off();
        socket.disconnect();
      }
    };
  }, [user, activeProjectId]);

  /**
   * Calculate overall project progress percentage
   */
  const calculateGeneralProgress = () => {
    if (allTasks.length === 0) return 0;
    const completed = allTasks.filter((t) => normalizeStatus(t.status) === "done").length;
    return Math.round((completed / allTasks.length) * 100);
  };

  // --- Effects: Load public users ---
  useEffect(() => {
    getPublicUsers()
      .then(setPlatformUsers)
      .catch(() => setPlatformUsers([]));
  }, []);

  // --- Effects: Load projects ---
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const items = await getProjects({ page: 1, limit: 10 });
        setProjects(items.projects || []);
      } catch (err) {
        console.error("Error loading projects:", err);
        setProjects([]);
      }
    };
    fetchProjects();
  }, [user]);

  // --- Effects: Load Kanban lists ---
  useEffect(() => {
    const fetchLists = async () => {
      if (!activeProjectId || !user) return;
      try {
        const listsData = await getKanbanLists({ projectId: activeProjectId });
        if (listsData === null) return;
        const items = Array.isArray(listsData) ? listsData : listsData?.lists || [];
        setLists(items);
        if (!selectedListId) {
          const firstId = items[0]?._id || items[0]?.id;
          setSelectedListId(firstId ? String(firstId) : "");
        }
      } catch (err) {
        console.error("Error loading lists:", err);
        setLists([]);
      }
    };
    fetchLists();
  }, [activeProjectId, user]);

  // --- Effects: Load tasks when project changes ---
  useEffect(() => {
    if (activeProjectId && user) {
      fetchProjectTasks();
    }
  }, [activeProjectId, user]);

  // --- Render ---
  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh", p: 2 }}>
      {(role === "manager" || role === "admin") && (
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => setActiveModal("create")}
        >
          ➕ Create Kanban Task
        </Button>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2">
          Overall progress: {calculateGeneralProgress()}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={calculateGeneralProgress()}
          sx={{ height: 8, borderRadius: 5 }}
        />
      </Box>

      <TaskFilters
        lists={lists}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={(id) => {
          setActiveProjectId(id);
          navigate(`/dashboard/projects/${id}/kanban`);
        }}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        userOptions={projects.find(p => p._id === activeProjectId)?.members || []} 
        setSelectedUser={setSelectedUser}
        fetchTasks={fetchProjectTasks}
        loading={loading}
        lastSync={lastSync}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={3}>
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={columns[status] || []}
              role={role}
              userMongoId={userMongoId}
              firebaseUid={firebaseUid}
              canEditOrDelete={canEditOrDelete}
              setViewingTask={setViewingTask}
              setEditingTask={setEditingTask}
              setTaskToDelete={setTaskToDelete}
              setActiveModal={setActiveModal}
              enqueueSnackbar={enqueueSnackbar}
              getProgress={(tasks) => {
                if (!tasks || tasks.length === 0) return 0;
                const completed = tasks.filter(
                  (t) => normalizeStatus(t.status) === "done"
                ).length;
                return Math.round((completed / tasks.length) * 100);
              }}
            />
          ))}
        </Grid>
        <KanbanOverlay activeTask={activeTask} />
      </DndContext>

      <KanbanModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        taskToDelete={taskToDelete}
        insertTask={createKanbanTask}
        selectedListId={selectedListId}
        activeProjectId={activeProjectId}
        projects={projects}
        setProjects={setProjects}
        lists={lists}
        setLists={setLists}
        setSelectedListId={setSelectedListId}
        viewingTask={viewingTask}
        setViewingTask={setViewingTask}
        platformUsers={platformUsers}
        handleTaskUpdated={updateKanbanTask}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        handleDelete={deleteTask}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoard;
