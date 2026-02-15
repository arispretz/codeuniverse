import React, { useContext, useState, Suspense, lazy } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../services/auth/logoutRequest.js";

/**
 * @fileoverview ModalRoutes configuration.
 * Defines modal routes for rendering modal components based on path.
 * Components are lazy-loaded to optimize performance.
 *
 * @module routes/ModalRoutes
 */

// Lazy-loaded modal components for performance optimization
const LogoutModal = lazy(() => import("../components/modals/LogoutModal"));

const LogoutModalWrapper = () => {
  const { setUser, setRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutRequest(setUser, setRole);
      navigate("/sign-in");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // go back if cancel
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogoutModal
        open={true}
        onCancel={handleCancel}
        loading={loading}
        onConfirm={handleLogout}
      />
    </Suspense>
  );
};

export const ModalRoutes = [
  {
    path: "logout",
    element: <LogoutModalWrapper />,
  },
];
