/**
 * @fileoverview Simplified Admin User Panel.
 * Allows administrators to:
 * - List all users
 * - Change user roles with confirmation dialogs
 * - Change user teams with confirmation dialogs
 *
 * @module pages/AdminUserPanel
 */

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Select, MenuItem, Typography, Dialog, DialogActions,
  DialogTitle, Button, TablePagination, Snackbar, Alert
} from '@mui/material';
import { getAllUsers, updateUserRole, updateUserTeam } from '../services/userService.js';

const validRoles = ['admin', 'manager', 'developer', 'guest', 'ai_assistant'];
const validTeams = ['Development Team A', 'Development Team B', 'Marketing Team'];

const AdminUserPanel = ({ idToken, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Role dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Team dialog states
  const [selectedTeamUser, setSelectedTeamUser] = useState(null);
  const [newTeam, setNewTeam] = useState('');
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [confirmingTeam, setConfirmingTeam] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      console.log('Users from API:', res);
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
      setSnack({ open: true, message: 'Failed to load users', severity: 'error' });
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Role change
  const confirmRoleChange = (user, role) => {
    if (user.firebaseUid === currentUser?.uid && role !== 'admin') {
      setSnack({ open: true, message: 'You cannot remove your own admin role', severity: 'warning' });
      return;
    }

    if (!validRoles.includes(role)) {
      setSnack({ open: true, message: `Invalid role: ${role}`, severity: 'error' });
      return;
    }

    setSelectedUser(user);
    setNewRole(role);
    setOpenDialog(true);
  };

  const handleConfirmRole = async () => {
    setConfirming(true);
    try {
      await updateUserRole(selectedUser.firebaseUid, newRole);
      setSnack({ open: true, message: 'Role updated successfully', severity: 'success' });
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update role';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setConfirming(false);
    }
  };

  // Team change
  const confirmTeamChange = (user, team) => {
    setSelectedTeamUser(user);
    setNewTeam(team);
    setOpenTeamDialog(true);
  };

  const handleConfirmTeam = async () => {
    setConfirmingTeam(true);
    try {
      await updateUserTeam(selectedTeamUser.firebaseUid, newTeam);
      setSnack({ open: true, message: 'Team updated successfully', severity: 'success' });
      setOpenTeamDialog(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update team';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setConfirmingTeam(false);
    }
  };

  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ p: 2 }}>👥 User Management Panel</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Profile Complete</TableCell>
            <TableCell>Current Role</TableCell>
            <TableCell>Change Role</TableCell>
            <TableCell>Current Team</TableCell>
            <TableCell>Change Team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.username || user.email}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username ? '✅ Yes' : '❌ No'}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => confirmRoleChange(user, e.target.value)}
                    variant="standard"
                  >
                    {validRoles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>{user.team || '—'}</TableCell>
                <TableCell>
                  <Select
                    value={user.team || ''}
                    onChange={(e) => confirmTeamChange(user, e.target.value)} 
                  >
                  <MenuItem value="">None</MenuItem>
                    {validTeams.map(team => (
                  <MenuItem key={team} value={team}>{team}</MenuItem>
                ))}
                    </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />

      {/* Role confirmation dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Confirm changing role of <strong>{selectedUser?.username || selectedUser?.email}</strong> 
          {` to `}<strong>{newRole}</strong>?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmRole} variant="contained" color="primary" disabled={confirming}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team confirmation dialog */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)}>
        <DialogTitle>
          Confirm changing team of <strong>{selectedTeamUser?.username || selectedTeamUser?.email}</strong> 
          {` to `}<strong>{newTeam || 'None'}</strong>?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmTeam} variant="contained" color="primary" disabled={confirmingTeam}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

AdminUserPanel.propTypes = {
  idToken: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }),
};

export default AdminUserPanel;
