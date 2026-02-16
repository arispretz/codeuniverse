import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser.jsx';
import { CircularProgress, Box } from '@mui/material';

/**
 * FullScreenSpinner Component
 * Displays a centered loading spinner covering the entire viewport.
 */
export const FullScreenSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * ProtectedRoute Component
 * Restricts access to child components based on authentication and role.
 * - Shows spinner while authentication state is loading.
 * - Redirects unauthenticated users to `/sign-in`, preserving the original path in `state.from`.
 * - Redirects authenticated users without the required role to `/unauthorized`.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, loading, isAuthenticated } = useUser();
  const location = useLocation();

  // ⏳ Show spinner while authentication state is loading or role not yet available
  if (loading || !role) return <FullScreenSpinner />;

  // 🚫 Redirect unauthenticated users to sign-in, preserving attempted path
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/sign-in"
        state={{ from: location.pathname }} // ✅ pass attempted path
        replace
      />
    );
  }

  // Normalize role for case-insensitive comparison
  const normalizedRole = role.toLowerCase();
  const hasAccess =
    allowedRoles.length === 0 ||
    allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole);

  // 🚫 Redirect if user does not have required role
  if (!hasAccess) return <Navigate to="/unauthorized" replace />;

  // ✅ Render protected content, injecting user prop into child
  return React.cloneElement(children, { user });
};
