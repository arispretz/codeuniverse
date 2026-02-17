/**
 * @fileoverview Dashboard component.
 * Displays project summaries, personal tasks, local tasks, and Kanban previews.
 * Provides role-based views and task detail modal.
 *
 * @module pages/Dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Snackbar,
  Alert,
  Button,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useUser } from '../hooks/useUser.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import ProjectSummaryDashboard from '../components/ProjectSummaryDashboard.jsx';
import PersonalTaskPreview from '../components/PersonalTaskPreview.jsx';
import LocalTaskPanel from '../components/LocalTaskPanel.jsx';
import KanbanTaskPreview from '../components/KanbanTaskPreview.jsx';
import { getCurrentUser } from '../services/userService.js';
import { getUserToken } from "../utils/userToken.js";

/**
 * Dashboard component.
 * Renders the main dashboard with project summaries, personal tasks,
 * local tasks, Kanban previews, and a task detail modal.
 *
 * @function Dashboard
 * @returns {JSX.Element} Dashboard layout
 */
const Dashboard = () => {
  const { role, refreshUserRole } = useUser();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [viewingTask, setViewingTask] = useState(null);

  useEffect(() => {
    const fetchUserDbId = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUserId(data._id);
      } catch {
        console.error('Error fetching current user');
      }
    };
    if (user) fetchUserDbId();
  }, [user]);

  /**
   * Refreshes user role and permissions.
   */
  const handleRefresh = async () => {
    try {
      await refreshUserRole();
      setRefreshMessage('✅ Permissions refreshed');
      setSnackbarSeverity('success');
    } catch {
      setRefreshMessage('❌ Failed to refresh permissions');
      setSnackbarSeverity('error');
    }
    setShowSnackbar(true);
    setTimeout(() => setRefreshMessage(''), 3000);
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome {user?.displayName} ({role})
      </Typography>

      {/* Active projects with progress */}
      <ProjectSummaryDashboard role={role} onSelectProject={setSelectedProjectId} />

      {/* Personal tasks preview (not for guest) */}
      {role !== 'guest' && (
      <Box sx={{ mt: 3 }}>
        {!selectedProjectId && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Select a project to view your tasks.
        </Typography>
        )}
        <Typography variant="h6">🧍 Your personal tasks</Typography>
          {selectedProjectId ? (
        <PersonalTaskPreview previewCount={3} onView={(task) => setViewingTask(task)} />
        ) : null}

        <Button
          variant="text"
          sx={{ mt: 1 }}
          onClick={() => navigate('/dashboard/personal-tasks')}
        >
          View all my tasks
        </Button>
      </Box>
      )}

      {/* Local and Kanban tasks preview (only for developers) */}
      {role === 'developer' && currentUserId && (
        <>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">📋 Your local tasks</Typography>
            {selectedProjectId ? (
              <LocalTaskPanel
                previewCount={3}
                userMongoId={currentUserId}
                firebaseUid={user?.uid}
                projectId={selectedProjectId}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a project to view your local tasks.
              </Typography>
            )}
            <Button
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate('/dashboard/local-task-board')}
            >
              View all my local tasks
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">🧱 Your Kanban tasks</Typography>
            {selectedProjectId ? (
              <KanbanTaskPreview
                previewCount={3}
                selectedProjectId={selectedProjectId}
                userMongoId={currentUserId}
                firebaseUid={user?.uid}
                onView={(task) => setViewingTask(task)}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Select a project to view your Kanban tasks.
              </Typography>
            )}
            <Button
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate(`/dashboard/projects/${selectedProjectId}/kanban`)}
              disabled={!selectedProjectId}
            >
              View full board
            </Button>
          </Box>
        </>
      )}

      <Button variant="outlined" onClick={handleRefresh} sx={{ mt: 3, mr: 2 }}>
        🔄 Refresh Permissions
      </Button>

      {refreshMessage && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
          {refreshMessage}
        </Typography>
      )}

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {refreshMessage}
        </Alert>
      </Snackbar>

      <Typography variant="body2">
        Logged in as: <strong>{user?.email}</strong>
      </Typography>

      {/* Task detail modal */}
      <Dialog open={!!viewingTask} onClose={() => setViewingTask(null)}>
        <DialogTitle>Task details</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">{viewingTask?.title}</Typography>
          <Typography variant="body2">{viewingTask?.description}</Typography>
          <Typography variant="body2">Status: {viewingTask?.status}</Typography>
          <Typography variant="body2">
            Deadline:{' '}
            {viewingTask?.deadline
              ? new Date(viewingTask.deadline).toLocaleDateString()
              : 'N/A'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
