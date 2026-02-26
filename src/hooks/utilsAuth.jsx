/**
 * @fileoverview Utility to retrieve user object from localStorage.
 * Safely parses JSON and returns `null` if the value is missing or invalid.
 *
 * @module hooks/utilsAuth
 */

/**
 * Retrieves the user object from localStorage.
 *
 * @function getUserFromStorage
 * @returns {Object|null} Parsed user object if available, otherwise `null`.
 *
 * @example
 * // Save user to localStorage
 * localStorage.setItem('user', JSON.stringify({ name: "Ariana", role: "admin" }));
 *
 * // Retrieve user
 * const user = getUserFromStorage();
 * console.log(user?.name); 
 */
export const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('⚠️ Failed to parse user from localStorage:', error);
    return null;
  }
};
