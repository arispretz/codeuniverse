/**
 * @fileoverview Custom React hook that consumes AuthContext.
 * Provides the authenticated user enriched with role and other context values.
 *
 * @module auth/useFirebaseAuth
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useFirebaseAuth hook.
 *
 * @function useFirebaseAuth
 * @returns {Object} The authenticated user object with role and other context values.
 *
 * @example
 * const { user, role, isAuthenticated } = useFirebaseAuth();
 * if (isAuthenticated) {
 *   console.log(user.email, role);
 * }
 */
export const useFirebaseAuth = () => {
  const { user, role, isAuthenticated, loading } = useContext(AuthContext);
  return { user, role, isAuthenticated, loading };
};
