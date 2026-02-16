/**
 * @fileoverview AuthProvider component.
 * Wraps the application with authentication context, synchronizing Firebase user
 * with backend role and MongoDB ID. Handles:
 * - Firebase redirect results
 * - Authentication state changes
 * - Socket events for role updates
 *
 * @module context/AuthProvider
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "../firebase/auth.js";
import { AuthContext } from "./AuthContext.jsx";
import { initSocket } from "../services/socket.js";
import { syncUserAndRedirect } from "../utils/syncUserAndRedirect.js";
import { useNavigate } from "react-router-dom";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userMongoId, setUserMongoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 🔑 control explícito
  const socketRef = useRef(null);

  const navigate = useNavigate();

  const handleAuthSync = async (firebaseUser) => {
    if (!firebaseUser) return;

    const data = await syncUserAndRedirect(
      firebaseUser,
      navigate,
      setUser,
      setRole,
      "/dashboard",
      null
    );

    if (data?._id) {
      setUserMongoId(data._id);
    }
  };

  // 🔀 Handle redirect results after login
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await handleAuthSync(result.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("❌ Redirect error:", err.message);
      }
    };
    checkRedirect();
  }, []);

  // 🔀 Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleAuthSync(firebaseUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setRole(null);
        setUserMongoId(null);
        localStorage.removeItem("token");
        setIsAuthenticated(false); 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔀 Setup socket connection for role updates
  useEffect(() => {
    const setupSocket = async () => {
      if (socketRef.current || !user) return;

      const socket = await initSocket();
      if (!socket) return;

      socketRef.current = socket;

      socket.on("roleChanged", async ({ uid }) => {
        if (uid === user.uid) {
          await handleAuthSync(user);
        }
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("roleChanged");
        socketRef.current = null;
      }
    };
  }, [user]);

  // ✅ Memoized context value
  const value = useMemo(
    () => ({
      user,
      setUser,
      role,
      setRole,
      userMongoId,
      firebaseUid: user?.uid || null,
      isAuthenticated,
      loading,
    }),
    [user, role, userMongoId, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
