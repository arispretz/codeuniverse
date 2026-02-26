import axios from "axios";
import { getUserToken } from "../utils/userToken.js";

const BASE_URL = import.meta.env.VITE_EXPRESS_URL;
if (!BASE_URL) {
  throw new Error("Missing environment variable: VITE_EXPRESS_URL");
}

/**
 * @fileoverview User Profile API client.
 * Provides functions to interact with the Express backend for user profile management:
 * - Fetch user profile by UID
 * - Fetch personalized tips
 * - Update preferred coding style
 *
 * All requests require a valid Firebase ID token for authentication.
 *
 * @module services/profileService
 */

/**
 * Fetch user profile by UID.
 *
 * @async
 * @function getUserProfile
 * @param {string} uid - Firebase UID of the user.
 * @returns {Promise<Object>} User profile data object.
 * @throws {Error} If user is not authenticated or request fails.
 *
 * @example
 * const profile = await getUserProfile("uid123");
 * console.log(profile.name);
 */
export async function getUserProfile(uid) {
  const token = await getUserToken(true);
  if (!token) throw new Error("User not authenticated");

  const { data } = await axios.get(`${BASE_URL}/api/user/profile/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/**
 * Update user's preferred coding style.
 *
 * @async
 * @function updateUserStyle
 * @param {string} uid - Firebase UID of the user.
 * @param {string} newStyle - New preferred coding style (e.g., "functional", "object-oriented").
 * @returns {Promise<Object>} Updated user profile data.
 * @throws {Error} If user is not authenticated or request fails.
 *
 * @example
 * const updatedProfile = await updateUserStyle("uid123", "functional");
 * console.log(updatedProfile.preferred_style);
 */
export async function updateUserStyle(uid, newStyle) {
  const token = await getUserToken(true);
  if (!token) throw new Error("User not authenticated");

  const { data } = await axios.post(
    `${BASE_URL}/api/user/profile/update`,
    { user_id: uid, preferred_style: newStyle },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
