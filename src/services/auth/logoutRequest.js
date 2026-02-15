import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/auth.js';

/**
 * @fileoverview logoutRequest utility.
 * Handles signing out the current Firebase user.
 * - Calls `signOut` from Firebase Auth.
 * - Clears localStorage.
 * - Resets the user and role context.
 *
 * @module services/auth/logoutRequest
 */

/**
 * logoutRequest
 *
 * @async
 * @function logoutRequest
 * @param {Function} setUser - Setter to clear the user in context.
 * @param {Function} setRole - Setter to clear the role in context.
 * @returns {Promise<void>} Resolves when the user has been successfully signed out.
 */
export const logoutRequest = async (setUser, setRole) => {
  try {
    await signOut(auth);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    console.log('✅ User successfully logged out');
  } catch (error) {
    console.error('❌ Error while logging out:', error.message);
    throw error;
  }
};
