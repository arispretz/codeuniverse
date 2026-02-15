/**
 * @fileoverview PrivateLayout component.
 * Provides the main layout for authenticated users, including:
 * - AppBar with logo, workspace title, user greeting, avatar, theme toggle, and user menu
 * - Sidebar navigation with role-based items
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

const getSidebarItems = (role) => {
  const common = [
    { label: "Dashboard", to: "/dashboard", icon: <Dashboard /> },
    { label: "Kanban Board", to: "/dashboard/kanban", icon: <Assignment /> },
    { label: "Local Task Board", to: "/dashboard/local-task-board", icon: <Assignment /> },
    { label: "Personal Tasks", to: "/dashboard/personal-tasks", icon: <Assignment /> },
    { label: "Collaborative Code Editor", to: "/dashboard/editor", icon: <Assignment /> },
    { label: "Team Chat", to: "/dashboard/team-chat", icon: <People /> },
    { label: "Code Review Panel", to: "/dashboard/code-review", icon: <Code /> },
    { label: "Project Documentation", to: "/dashboard/project-docs", icon: <Code /> },
  ];

  const adminExtras = [
    { label: "Project Dashboard", to: "/dashboard/project-dashboard", icon: <BarChart /> },
    { label: "Project Management Dashboard", to: "/dashboard/manager/projects", icon: <Code /> },
    { label: "Admin User Panel", to: "/dashboard/admin-user-panel", icon: <BarChart /> },
  ];

  const managerExtras = [
    { label: "Project Dashboard", to: "/dashboard/project-dashboard", icon: <BarChart /> },
    { label: "Project Management Dashboard", to: "/dashboard/manager/projects", icon: <Code /> },
  ];

  const developerExtras = [
    { label: "My Projects", to: "/dashboard/my-projects", icon: <Assignment /> },
  ];

  const guestExtras = [
    { label: "Quick Start Guide", to: "/dashboard/quick-start-guide", icon: <HelpOutline /> },
  ];

  switch (role) {
    case "admin":
      return [...common, ...adminExtras];
    case "manager":
      return [...common, ...managerExtras];
    case "developer":
      return [...common, ...developerExtras];
    case "guest":
      return [
        { label: "Dashboard", to: "/dashboard", icon: <Dashboard /> },
        ...guestExtras
      ];
    default:
      return guestExtras;
  }
};

export function PrivateLayout({ children }) {
  const { user, setUser, setRole } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();
  const avatarButtonRef = useRef();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    avatarButtonRef.current?.focus();
  };

  /**
   * Handles user logout using centralized logoutRequest.
   */
  const handleLogout = async () => {
    try {
      await logoutRequest(setUser, setRole);
      navigate("/sign-in");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const normalizedRole = user?.role?.toLowerCase().trim() || "guest";
  const sidebarItems = getSidebarItems(normalizedRole);

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

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            disableAutoFocusItem
            disableEnforceFocus
            MenuListProps={{ autoFocus: false }}
          >
            {(user?.role !== "guest"
              ? [
                  { label: "Profile", to: "/dashboard/profile" },
                  { label: "Settings", to: "/dashboard/settings" },
                  { label: "My Projects", to: "/dashboard/my-projects" },
                  { label: "Personal Tasks", to: "/dashboard/personal-tasks" },
                ]
              : [
                  { label: "Quick Start Guide", to: "docs/quick-start" },
                ]
            ).map(({ label, to }, index) => (
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
            <ListItemButton key={index} component={Link} to={to}>
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
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default PrivateLayout;
