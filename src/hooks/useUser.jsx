import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * @fileoverview useUser hook.
 * Provides a convenient way to access user-related data from the authentication context.
 * Returns the authenticated user object, role, loading state, and setter functions.
 *
 * @module hooks/useUser
 */

/**
 * Custom hook to access user data from AuthContext.
 *
 * @function useUser
 * @throws {Error} If used outside of an AuthProvider.
 * @returns {Object} User context values
 * @property {Object|null} user - Authenticated user object or `null` if not logged in.
 * @property {string} role - Role of the user (defaults to `"guest"` if not set).
 * @property {boolean} loading - Whether user data is still loading.
 * @property {Function} setUser - Function to update user state.
 * @property {Function} setRole - Function to update user role.
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated.
 *
 * @example
 * import { useUser } from '../hooks/useUser';
 *
 * const Profile = () => {
 *   const { user, role, loading, isAuthenticated } = useUser();
 *
 *   if (loading) return <p>Loading...</p>;
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <h1>Welcome {user.displayName} ({role})</h1>
 *       ) : (
 *         <h1>Please log in</h1>
 *       )}
 *     </div>
 *   );
 * };
 */

/**
 * Custom hook to access user data from AuthContext.
 */
export function useUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }

  const { user, role, loading, setUser, setRole, isAuthenticated } = context;

  return {
    user,
    role: role || 'guest',
    loading,
    setUser,
    setRole,
    isAuthenticated,
  };
}


