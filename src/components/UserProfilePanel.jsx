/**
 * @fileoverview UserProfilePanel component.
 * Displays the user's profile information and preferred coding style.
 * Allows updating the preferred coding style via a dropdown selector.
 *
 * Integrates with `profileService` to:
 * - Fetch user profile data (`getUserProfile`)
 * - Update preferred coding style (`updateUserStyle`)
 *
 * @module components/UserProfilePanel
 */

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";

import {
  getUserProfile,
  updateUserStyle,
} from "../services/profileService.js";

/**
 * UserProfilePanel Component
 *
 * @function UserProfilePanel
 * @returns {JSX.Element} User profile panel component.
 *
 * @example
 * <UserProfilePanel />
 */
const UserProfilePanel = () => {
  const [profile, setProfile] = useState(null);
  const [style, setStyle] = useState("");

  useEffect(() => {
    /**
     * Fetches user profile from backend service.
     *
     * @async
     * @function fetchData
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
        setStyle(profileData.preferred_style);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
    };
    fetchData();
  }, []);

  /**
   * Handles updating the user's preferred style.
   *
   * @async
   * @function handleStyleChange
   * @param {Object} e - Event object from Select component.
   * @returns {Promise<void>}
   */
  const handleStyleChange = async (e) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    try {
      await updateUserStyle(newStyle);
    } catch (err) {
      console.error("❌ Error updating style:", err);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6">👤 Your Profile</Typography>
      {profile && (
        <>
          {/* Preferred language */}
          <Typography variant="body1" sx={{ mt: 2 }}>
            Preferred language: <strong>{profile.preferred_language}</strong>
          </Typography>

          {/* Preferred style selector */}
          <Typography variant="body1" sx={{ mt: 1 }}>
            Preferred style:
          </Typography>
          <Select
            value={style}
            onChange={handleStyleChange}
            sx={{ mt: 1, mb: 2 }}
          >
            <MenuItem value="functional">Functional</MenuItem>
            <MenuItem value="imperative">Imperative</MenuItem>
            <MenuItem value="object-oriented">Object-Oriented</MenuItem>
          </Select>

          {/* Last used timestamp */}
          <Typography variant="body2" color="text.secondary">
            Last used: {new Date(profile.last_used).toLocaleString()}
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default UserProfilePanel;
