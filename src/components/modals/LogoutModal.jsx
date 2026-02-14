/**
 * @fileoverview LogoutModal component.
 * Provides a confirmation dialog for user logout.
 * Displays a message asking the user to confirm logout, with options to proceed or cancel.
 * Shows a loading state while the logout process is in progress.
 *
 * @module components/modals/LogoutModal
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/auth"; 

/**
 * LogoutModal Component
 *
 * @function LogoutModal
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Controls whether the modal is open.
 * @param {Function} props.onCancel - Callback triggered when the user cancels logout.
 * @param {boolean} props.loading - Indicates whether the logout process is in progress.
 * @returns {JSX.Element} A modal dialog component for logout confirmation.
 *
 * @example
 * <LogoutModal
 *   open={isModalOpen}
 *   onCancel={handleCancel}
 *   loading={isLoggingOut}
 * />
 */
const LogoutModal = ({ open, onCancel, loading }) => {
  const handleConfirmLogout = async () => {
    try {
      // Trigger Firebase logout
      await signOut(auth);
      // No need to manually clear context here — AuthProvider handles it
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="logout-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          boxShadow: 5,
          transition: "all 0.3s ease",
        },
      }}
    >
      {/* Dialog title */}
      <DialogTitle id="logout-dialog-title">🔒 Log out</DialogTitle>

      {/* Dialog content */}
      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(4, 3, 60, 0.85)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
          }}
        >
          ⚠️ Are you sure you want to log out?
        </Typography>
      </DialogContent>

      {/* Dialog actions */}
      <DialogActions>
        <Button
          onClick={handleConfirmLogout}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          aria-label="Confirm logout"
        >
          {loading ? "⏳ Logging out..." : "✅ Yes, log me out"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="primary"
          disabled={loading}
          aria-label="Cancel logout"
        >
          ❌ Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
