import { createContext } from 'react';

/**
 * @fileoverview Authentication context.
 * Provides global access to user session state across the application.
 * Includes user information, authentication status, loading state, and role management.
 *
 * @module context/AuthContext
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user - Authenticated user object or `null` if not logged in.
 * @property {boolean} isAuthenticated - Whether the user is currently logged in.
 * @property {boolean} loading - Whether authentication is still being resolved.
 * @property {Function} setUser - Function to manually update user state.
 * @property {string|null} role - Current user's role (`"admin"`, `"manager"`, etc.) or `null`.
 * @property {Function} setRole - Function to manually update user role.
 * @property {string|null} userMongoId - User's MongoDB ID if available.
 */

/**
 * Authentication context instance.
 *
 * @type {React.Context<AuthContextValue>}
 *
 * @example
 * import { useContext } from 'react';
 * import { AuthContext } from './AuthContext';
 *
 * const MyComponent = () => {
 *   const { user, isAuthenticated, setUser } = useContext(AuthContext);
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? `Welcome ${user.name}` : "Please log in"}
 *     </div>
 *   );
 * };
 */

/**
 * Authentication context instance.
 */
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,  
  loading: true,
  setUser: () => {},
  role: null,
  setRole: () => {},
  userMongoId: null,
});
