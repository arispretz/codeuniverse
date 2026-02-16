/**
 * @fileoverview PrivateLayout component.
 * Provides the main layout for authenticated users, including:
 * - AppBar with logo, workspace title, user greeting, avatar, theme toggle, and user menu
 * - Sidebar navigation filtered by role
 * - Main content area with React Router Outlet
 *
 * @module layouts/PrivateLayout
 */

import React, { useState, useRef, useContext } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard,
  People,
  Code,
  Assignment,
  HelpOutline,
  BarChart,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Link, useNavigate, Outlet } from "react-router-dom";
import ThemeToggleButton from "../ThemeToggleButton";
import Logo from "../components/Logo.jsx";
import { useTheme } from "@mui/material/styles";
import { AuthContext } from "../context/AuthContext.jsx";
import { logoutRequest } from "../services/auth/logoutRequest.js";

const drawerWidth = 200;

/**
 * Sidebar items with explicit allowed roles.
 */
const getSidebarItems = (role) => {
  const items = [
    { label: "Dashboard", to: "", icon: <Dashboard />, roles: ["admin","manager","developer","guest"] },
    { label: "Kanban Board", to: "kanban", icon: <Assignment />, roles: ["admin","manager","developer"] },
    { label: "Local Task Board", to: "local-task-board", icon: <Assignment />, roles: ["admin","manager","developer"] },
    { label: "Personal Tasks", to: "personal-tasks", icon: <Assignment />, roles: ["admin","developer"] },
    { label: "Collaborative Code Editor", to: "editor", icon: <Assignment />, roles: ["admin","developer"] },
    { label: "Team Chat", to: "team-chat", icon: <People />, roles: ["admin","manager","developer"] },
    { label: "Code Review Panel", to: "code-review", icon: <Code />, roles: ["admin","developer"] },
    { label: "Project Documentation", to: "project-docs", icon: <Code />, roles: ["admin","manager","developer"] },

    // Admin-only routes
    { label: "Project Dashboard", to: "project-dashboard", icon: <BarChart />, roles: ["admin"] },
    { label: "Project Management Dashboard", to: "manager/projects", icon: <Code />, roles: ["admin"] },
    { label: "Admin User Panel", to: "admin-user-panel", icon: <BarChart />, roles: ["admin"] },

    // Manager-only routes
    { label: "Project Dashboard", to: "project-dashboard", icon: <BarChart />, roles: ["manager"] },
    { label: "Project Management Dashboard", to: "manager/projects", icon: <Code />, roles: ["manager"] },

    // Developer-only routes
    { label: "My Projects", to: "my-projects", icon: <Assignment />, roles: ["developer"] },

    // Guest-only routes
    { label: "Quick Start Guide", to: "quick-start-guide", icon: <HelpOutline />, roles: ["guest"] },
  ];

  return items.filter(item => item.roles.includes(role));
};

export function PrivateLayout({ children }) {
  const { user, setUser, setRole } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();
  const avatarButtonRef = useRef();

  // Handle opening and closing of the user menu
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    avatarButtonRef.current?.focus();
  };

  // Handle logout using centralized logoutRequest
  const handleLogout = async () => {
    try {
      await logoutRequest(setUser, setRole);
      navigate("/sign-in");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Normalize role to lowercase and default to "guest"
  const normalizedRole = user?.role?.toLowerCase().trim() || "guest";
  const sidebarItems = getSidebarItems(normalizedRole);

  // Show loading spinner if user data is not yet available
  if (!user || !user.role) {
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading workspace...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Top AppBar with logo, workspace title, greeting, avatar, and theme toggle */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.navbar?.background || theme.palette.primary.main,
          color: theme.palette.navbar?.background || theme.palette.secondary.main,
        }}
      >
        <Toolbar sx={{ minHeight: 50, height: 85, px: 3, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <Logo />
            <Typography variant="h6" noWrap sx={{ fontSize: "1.25rem" }}>
              My Workspace
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
              Hi, {user?.displayName || "Guest"}!
            </Typography>
            <IconButton
              ref={avatarButtonRef}
              onClick={handleMenuOpen}
              aria-label="Open user menu"
            >
              <Avatar src={user?.photoURL || ""} alt={user?.displayName || "Guest"} />
            </IconButton>
            <ThemeToggleButton />
          </Box>

          {/* User dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            disableAutoFocusItem
            disableEnforceFocus
            MenuListProps={{ autoFocus: false }}
          >
            {sidebarItems.map(({ label, to }, index) => (
              <MenuItem
                key={index}
                component={Link}
                to={to} 
                onClick={handleMenuClose}
                autoFocus={false}
              >
                {label}
              </MenuItem>
            ))}

            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/modal/logout"); 
              }}
              sx={{ color: "error.main" }}
              autoFocus={false}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer with navigation based on role */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List sx={{ mt: 2 }}>
          {sidebarItems.map(({ label, to, icon }, index) => (
            <ListItemButton
              key={index}
              component={Link}
              to={to} 
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  sx: { color: "text.primary" },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 5,
          pr: 20,
          maxWidth: `calc(100% - ${drawerWidth}px)`,
          overflowX: "hidden",
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

PrivateLayout.propTypes = {
  children: PropTypes.node,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default PrivateLayout;
