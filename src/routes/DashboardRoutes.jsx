import React, { lazy } from 'react';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import PrivateLayout from '../layouts/PrivateLayout.jsx';

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
    element: (
      // ✅ Solo verifica autenticación, no roles
      <ProtectedRoute>
        <PrivateLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      // Developer routes
      {
        path: 'my-projects',
        element: (
          <ProtectedRoute allowedRoles={['developer', 'admin']}>
            <MyProjects />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personal-tasks',
        element: (
          <ProtectedRoute allowedRoles={['developer', 'admin']}>
            <PersonalTaskBoard />
          </ProtectedRoute>
        ),
      },

      // Manager routes
      {
        path: 'project-dashboard',
        element: (
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ProjectDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager/projects',
        element: (
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
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
          <ProtectedRoute allowedRoles={['guest', 'developer', 'manager', 'admin']}>
            <QuickStartGuide />
          </ProtectedRoute>
        ),
      },

      // Common routes (todos los roles autenticados)
      { path: 'team-chat', element: <TeamChatModule /> },
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
      { path: 'project-docs', element: <ProjectDocumentation /> },
      { path: 'code-review', element: <CodeReviewPanel /> },
      { path: 'editor', element: <ProjectSelector /> },
      { path: 'projects/:id/editor', element: <CollaborativeCodeEditor /> },
      { path: 'kanban', element: <KanbanBoard /> },
      { path: 'local-task-board', element: <LocalTaskBoard /> },
      { path: 'projects/:id', element: <TasksPage /> },
    ],
  },
];
