/**
 * @fileoverview ProjectDetailModal component.
 * Provides a modal dialog to display detailed information about a project,
 * including local lists, Kanban lists, tasks, comments, and change history.
 *
 * @module components/modals/ProjectDetailModal
 */

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { getProjectFullById } from "../../services/projectService.js";

const ProjectDetailModal = ({ open, onClose, projectId }) => {
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const data = await getProjectFullById(projectId);
        setProject(data);
      } catch (err) {
        console.error("❌ Error fetching project details:", err);
        setProject(null);
      }
    };
    if (open) fetchProject();
  }, [open, projectId]);

  const CustomDialogTitle = ({ children }) => (
    <DialogTitle sx={{ m: 0, p: 2 }}>
      {children}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );

  const getChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "success";
      case "in progress":
        return "warning";
      case "review":
        return "info";
      case "to do":
        return "default";
      default:
        return "default";
    }
  };

  if (!project) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <CustomDialogTitle>📊 Project Details</CustomDialogTitle>
        <DialogContent>
          <Typography variant="body2">⏳ Loading or no data available...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>❌ Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <CustomDialogTitle>{project.name}</CustomDialogTitle>
      <DialogContent dividers>
        {/* Project description and progress */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {project.description}
        </Typography>
        <Typography variant="subtitle1">
          📈 Progress: {project.progress != null ? Math.round(project.progress) : 0}%
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Local lists */}
        <Typography variant="h6">📋 Local Lists</Typography>
        {project.localLists?.map((list, listIndex) => (
          <Card key={list._id ?? `local-${listIndex}`} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {list.name}
              </Typography>
              <List dense>
                {Array.isArray(list.tasks) &&
                  list.tasks.map((task, taskIndex) => (
                    <ListItem
                      key={task._id ?? `task-${taskIndex}`}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <ListItemText primary={task.title} />
                      <Chip
                        label={task.status}
                        color={getChipColor(task.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Kanban lists */}
        <Typography variant="h6">🧱 Kanban Lists</Typography>
        {project.kanbanLists?.map((list, listIndex) => (
          <Paper key={list._id ?? `kanban-${listIndex}`} sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {list.name}
            </Typography>

            {Array.isArray(list.tasks) ? (
              <List dense>
                {list.tasks.map((task, taskIndex) => (
                  <ListItem
                    key={task._id ?? `task-${taskIndex}`}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <ListItemText primary={task.title} />
                    <Chip
                      label={task.status}
                      color={getChipColor(task.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              Object.entries(list.tasks || {}).map(([status, tasks], statusIndex) => (
                <Box key={`${list._id ?? listIndex}-${status}-${statusIndex}`} sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    {status.toUpperCase()}
                  </Typography>
                  <List dense>
                    {Array.isArray(tasks) &&
                      tasks.map((task, taskIndex) => (
                        <ListItem
                          key={task._id ?? `${status}-${taskIndex}`}
                          sx={{ display: "flex", justifyContent: "space-between" }}
                        >
                          <ListItemText primary={task.title} />
                          <Chip
                            label={status}
                            color={getChipColor(status)}
                            size="small"
                          />
                        </ListItem>
                      ))}
                  </List>
                </Box>
              ))
            )}
          </Paper>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Comments */}
        {project.comments?.length > 0 && (
          <Box>
            <Typography variant="h6">💬 Comments</Typography>
            {project.comments.map((c, i) => (
              <Box key={c._id ?? `comment-${i}`} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{c.author?.name || "User"}:</strong> {c.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Change history */}
        {project.history?.length > 0 && (
          <Box>
            <Typography variant="h6">📜 Change History</Typography>
            {project.history.map((h, i) => (
              <Box key={h._id ?? `history-${i}`} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{h.changedBy?.name || "User"}:</strong> {h.change}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(h.changedAt), "dd/MM/yyyy HH:mm")}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>❌ Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDetailModal;
