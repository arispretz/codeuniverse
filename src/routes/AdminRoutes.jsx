import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser.jsx';
import { CircularProgress, Box } from '@mui/material';

/**
 * @fileoverview AdminRoutes component.
 * Protects routes that require admin privileges.
 * - Shows a loading spinner while authentication state is being resolved.
 * - Redirects unauthorized users to the "/unauthorized" page.
 *
 * @module routes/AdminRoutes
 */

/**
 * AdminRoutes Component
 *
 * @function AdminRoutes
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Protected content to render if authorized.
 * @returns {JSX.Element} Either the protected content, a loading spinner, or a redirect.
 *
 * @example
 * import { AdminRoutes } from './routes/AdminRoutes';
 *
 * <Route
 *   path="/admin/*"
 *   element={
 *     <AdminRoutes>
 *       <AdminDashboard />
 *     </AdminRoutes>
 *   }
 * />
 */
export const AdminRoutes = ({ children }) => {
  const { role, loading, isAuthenticated } = useUser();

  // ⏳ Show spinner while authentication state is loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 🚫 Redirect if user is not authenticated or not an admin
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Render protected content if authorized
  return children;
};
