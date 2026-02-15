/**
 * @fileoverview CollaborativeCodeEditor component.
 * Provides a real-time collaborative code editing environment with:
 * - File tree navigation
 * - Editor panel
 * - Assistant sidebar
 * - Output/console/profile tabs
 * - User profile integration
 *
 * @module pages/CollaborativeCodeEditor
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import EditorPanel from '../components/EditorPanel.jsx';
import AssistantSidebar from '../components/AssistantSidebar.jsx';
import UserProfilePanel from '../components/UserProfilePanel.jsx';
import FileTree from '../components/FileTree.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import TerminalPanel from '../components/TerminalPanel.jsx';
import { useParams } from 'react-router-dom';
import { getProjectFile, updateProjectFile } from '../services/fileService.js';

/**
 * CollaborativeCodeEditor Component
 *
 * @function CollaborativeCodeEditor
 * @description Renders the main collaborative coding interface with editor, file tree,
 * assistant sidebar, and tabs for output, console, and profile.
 * @returns {JSX.Element} Collaborative code editor layout
 */
const CollaborativeCodeEditor = () => {
  // 🔹 State management
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('javascript');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [executionResult, setExecutionResult] = useState('');
  const { id: projectId } = useParams();
  const [currentFileId, setCurrentFileId] = useState(null);
  const [assistantMode, setAssistantMode] = useState('mentor');
  const editorRef = useRef(null);

  /**
   * Displays a snackbar notification.
   * @param {string} message - Message to display
   * @param {string} severity - Severity level ("info" | "success" | "error")
   */
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  /**
   * Handles opening a file from the file tree.
   * @async
   * @param {object} file - File object containing metadata
   */
  const handleOpenFile = async (file) => {
    try {
      const data = await getProjectFile(file._id);
      setCode(data.content);
      setCurrentFileId(data._id);
      showSnackbar(`📂 File "${data.name}" opened`, 'success');
    } catch {
      showSnackbar('❌ Error opening file', 'error');
    }
  };

  /**
   * Handles saving the current file.
   * @async
   */
  const handleSaveFile = async () => {
    if (!currentFileId) return;
    try {
      await updateProjectFile(currentFileId, { content: code });
      showSnackbar('💾 File saved', 'success');
    } catch {
      showSnackbar('❌ Error saving file', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 📂 File Tree */}
      <Box sx={{ width: 200, borderRight: '1px solid #444', overflowY: 'auto' }}>
        <FileTree
          projectId={projectId}
          onOpenFile={handleOpenFile}
          setCurrentFileId={setCurrentFileId}
          setCode={setCode}
        />
      </Box>

      {/* 📝 Main Panel */}
      <Box sx={{ width: 700, flex: 1.5, px: 3, py: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🧑‍💻 Code together, anywhere.
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Work together live on code with teammates in Code Editor.
        </Typography>

        {/* Editor */}
        <Box sx={{ flex: 1, border: '1px solid #ddd', borderRadius: 2, mb: 2, minHeight: 400 }}>
          <EditorPanel
            code={code}
            setCode={setCode}
            language={language}
            editorRef={editorRef}
            showSnackbar={showSnackbar}
            setExecutionResult={setExecutionResult}
            projectId={projectId}
            currentFileId={currentFileId}
          />
        </Box>

        <Button variant="outlined" onClick={handleSaveFile} sx={{ mt: 2, alignSelf: 'flex-start' }}>
          💾 Save
        </Button>

        {/* Tabs */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 2 }}>
            <Tab label="Output" />
            <Tab label="Console" />
            <Tab label="Profile" />
          </Tabs>

          {activeTab === 0 && <OutputPanel executionResult={executionResult} />}
          {activeTab === 1 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 🔹 Pass active prop to TerminalPanel for resizing */}
              <TerminalPanel projectId={projectId} wsPath="/terminal-audit" active={activeTab === 1} />
            </Box>
          )}
          {activeTab === 2 && <UserProfilePanel />}
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
      </Box>

      {/* 🤖 Assistant Sidebar */}
      <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #444', overflowY: 'auto' }}>
        <AssistantSidebar
          language={language}
          setLanguage={setLanguage}
          showSnackbar={showSnackbar}
          code={code}
          setCode={setCode}
          assistantMode={assistantMode}
          setAssistantMode={setAssistantMode}
        />
      </Box>
    </Box>
  );
};

export default CollaborativeCodeEditor;
