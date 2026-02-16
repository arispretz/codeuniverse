/**
 * @fileoverview Dashboard routes configuration for protected access.
 * Provides lazy-loaded components and role-based route protection.
 * @module routes/DashboardRoutes
 */

import React, { lazy } from 'react';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import PrivateLayout from '../layouts/PrivateLayout.jsx';
import { LogoutModalWrapper } from './ModalRoutes.jsx'; 

// Lazy-loaded route components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MyProjects = lazy(() => import('../pages/MyProjects'));
const KanbanBoard = lazy(() => import('../pages/KanbanBoard'));
const TeamChatModule = lazy(() => import('../pages/TeamChatModule'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));
const ProjectDashboard = lazy(() => import('../pages/ProjectDashboard'));
const CollaborativeCodeEditor = lazy(() => import('../pages/CollaborativeCodeEditor'));
const ProjectManagementDashboard = lazy(() => import('../pages/ProjectManagementDashboard'));
const ProjectDocumentation = lazy(() => import('../pages/ProjectDocumentation'));
const PersonalTaskBoard = lazy(() => import('../pages/PersonalTaskBoard'));
const LocalTaskBoard = lazy(() => import('../pages/LocalTaskBoard'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const CodeReviewPanel = lazy(() => import('../pages/CodeReviewPanel'));
const ProjectSelector = lazy(() => import('../components/ProjectSelector'));
const AdminUserPanel = lazy(() => import("../pages/AdminUserPanel"));
const QuickStartGuide = lazy(() => import("../pages/docs/QuickStartGuide"));

export const DashboardRoutes = [
  {
    path: 'dashboard',
    element: <PrivateLayout />,
    children: [
      { 
        index: true, 
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer','guest']}>
            <Dashboard />
          </ProtectedRoute>
        ) 
      },

      // Developer routes
      {
        path: 'my-projects',
        element: (
          <ProtectedRoute allowedRoles={['developer','admin']}>
            <MyProjects />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personal-tasks',
        element: (
          <ProtectedRoute allowedRoles={['developer','admin']}>
            <PersonalTaskBoard />
          </ProtectedRoute>
        ),
      },

      // Manager routes
      {
        path: 'project-dashboard',
        element: (
          <ProtectedRoute allowedRoles={['manager','admin']}>
            <ProjectDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/projects',
        element: (
          <ProtectedRoute allowedRoles={['manager','admin']}>
            <ProjectManagementDashboard />
          </ProtectedRoute>
        ),
      },

      // Admin routes
      {
        path: 'admin-user-panel',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUserPanel />
          </ProtectedRoute>
        ),
      },

      // Guest routes
      {
        path: 'quick-start-guide',
        element: (
          <ProtectedRoute allowedRoles={['guest','developer','manager','admin']}>
            <QuickStartGuide />
          </ProtectedRoute>
        ),
      },

      // Common routes
      {
        path: 'team-chat',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <TeamChatModule />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer','guest']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer','guest']}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'project-docs',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <ProjectDocumentation />
          </ProtectedRoute>
        ),
      },
      {
        path: 'code-review',
        element: (
          <ProtectedRoute allowedRoles={['admin','developer']}>
            <CodeReviewPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: 'editor',
        element: (
          <ProtectedRoute allowedRoles={['admin','developer']}>
            <ProjectSelector />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/editor',
        element: (
          <ProtectedRoute allowedRoles={['admin','developer']}>
            <CollaborativeCodeEditor />
          </ProtectedRoute>
        ),
      },
      {
        path: 'kanban',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <KanbanBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'local-task-board',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <LocalTaskBoard />
          </ProtectedRoute>
        ),
      },

      // Project-specific routes
      {
        path: 'projects/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/kanban',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <KanbanBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/local-tasks',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <LocalTaskBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/lists/:listId/tasks',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/lists/:listId/local-tasks',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <LocalTaskBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/lists/:listId/kanban',
        element: (
          <ProtectedRoute allowedRoles={['admin','manager','developer']}>
            <KanbanBoard />
          </ProtectedRoute>
        ),
      },

      // ✅ Logout route
      {
        path: 'logout',
        element: <LogoutModalWrapper />,
      },
    ],
  },
];
