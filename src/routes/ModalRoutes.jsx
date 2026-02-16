import React, { useContext, useState, Suspense, lazy } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../services/auth/logoutRequest.js";

const LogoutModal = lazy(() => import("../components/modals/LogoutModal"));

export const LogoutModalWrapper = () => {
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
    navigate("/dashboard");   
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
    path: "dashboard/logout",   
    element: <LogoutModalWrapper />,
  },
];
