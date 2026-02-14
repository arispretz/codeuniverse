/**
 * @fileoverview AssistantSidebar component.
 * Provides an interactive sidebar with a code assistant that can act as a mentor
 * (explaining code) or generate code snippets directly. Includes chat history,
 * language selection, user level selection, and assistant mode toggling.
 *
 * @module components/AssistantSidebar
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
  Divider,
  TextField,
} from "@mui/material";
import ReactMarkdown from "react-markdown";

import {
  getAssistantReply,
  getAssistantCodeReply,
  generateCodeSnippet,
  getAutocompleteSuggestion,
} from "../services/assistantService.js";

import { cleanMentorOutput } from "../utils/cleanMentorOutput";

/**
 * AssistantSidebar Component
 *
 * @function AssistantSidebar
 * @param {Object} props - Component props.
 * @param {string} props.language - Current programming language selected.
 * @param {Function} props.setLanguage - Setter function to update the programming language.
 * @param {Function} props.showSnackbar - Function to show notifications.
 * @param {string} props.code - Current code in the editor.
 * @param {Function} props.setCode - Setter function to update the code in the editor.
 * @param {string} props.assistantMode - Current mode of the assistant ("mentor" or "code").
 * @param {Function} props.setAssistantMode - Setter function to update the assistant mode.
 * @returns {JSX.Element} Sidebar component with assistant chat and controls.
 *
 * @example
 * <AssistantSidebar
 *   language="javascript"
 *   setLanguage={setLanguage}
 *   showSnackbar={showSnackbar}
 *   code={editorCode}
 *   setCode={setEditorCode}
 *   assistantMode="mentor"
 *   setAssistantMode={setAssistantMode}
 * />
 */
const AssistantSidebar = ({
  language,
  setLanguage,
  showSnackbar,
  code,
  setCode,
  assistantMode,
  setAssistantMode,
}) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "👋 Hello, how can I help you with your code?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [userLevel, setUserLevel] = useState("intermediate");

  /**
   * Sends a request to the assistant service based on the current mode.
   * In "mentor" mode, returns explanations and guidance.
   * In "code" mode, generates and applies code directly to the editor.
   *
   * @async
   * @function handleAssistantRequest
   * @returns {Promise<void>} Resolves when the assistant response is processed.
   */
  const handleAssistantRequest = async () => {
  if (!chatInput.trim()) return;
  setIsTyping(true);

  try {
    const userId = import.meta.env.VITE_ASSISTANT_USER_ID;
    if (!userId) throw new Error("Missing environment variable: VITE_ASSISTANT_USER_ID");

    const payload = {
      prompt: chatInput,
      code,
      language,
      user_id: userId,
      user_level: userLevel,
    };

    const userMessage = { role: "user", content: chatInput };
    let assistantMessage = { role: "assistant", content: "" };

    if (assistantMode === "mentor") {
      const replyText = await getAssistantReply(payload);
      const safeText =
        typeof replyText === "string" && replyText.startsWith("⚠️")
          ? "Step 1: Summarize the goal of the code.\nStep 2: Explain the main flow.\nStep 3: Mention edge cases.\n\nLimitation: May not handle invalid inputs."
          : replyText;
      assistantMessage.content = cleanMentorOutput(safeText);
    } else if (assistantMode === "code") {
      let codeReply = await getAssistantCodeReply(payload);
      if (!codeReply) {
        // fallback automático a /generate
        codeReply = await generateCodeSnippet(payload);
      }
      if (codeReply) {
        setCode(codeReply);
        showSnackbar("✨ Code inserted into the editor");
        assistantMessage.content = "✅ Code generated and applied in the editor.";
      } else {
        assistantMessage.content = "❌ Could not generate code.";
      }
    }

    setChatHistory((prev) => [...prev, userMessage, assistantMessage]);
  } catch (error) {
    console.error("❌ Error in assistant:", error);
    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "❌ Error generating response." },
    ]);
  } finally {
    setIsTyping(false);
    setChatInput("");
  }
};

  return (
    <Box
      sx={{
        mt: 3,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Typography variant="subtitle1">🧠 Code Assistant</Typography>

      {/* User level selector */}
      <Select
        value={userLevel}
        onChange={(e) => setUserLevel(e.target.value)}
        sx={{ mt: 2 }}
      >
        <MenuItem value="beginner">Beginner</MenuItem>
        <MenuItem value="intermediate">Intermediate</MenuItem>
        <MenuItem value="advanced">Advanced</MenuItem>
      </Select>

      {/* Language selector */}
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        sx={{ mt: 2 }}
      >
        <MenuItem value="javascript">JavaScript</MenuItem>
        <MenuItem value="python">Python</MenuItem>
        <MenuItem value="cpp">C++</MenuItem>
        <MenuItem value="java">Java</MenuItem>
      </Select>

      {/* Assistant mode toggle */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <Typography variant="subtitle2">Assistant Mode:</Typography>
        <Button
          variant={assistantMode === "mentor" ? "contained" : "outlined"}
          onClick={() => setAssistantMode("mentor")}
          sx={{ mr: 1 }}
        >
          Mentor
        </Button>
        <Button
          variant={assistantMode === "code" ? "contained" : "outlined"}
          onClick={() => setAssistantMode("code")}
        >
          Code Only
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">💬 Assistant Chat</Typography>

      {/* Chat history */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          flex: 1,
          maxHeight: 300,
          overflowY: "auto",
          mb: 2,
        }}
      >
        {chatHistory.map((msg, i) => (
          <Box
            key={i}
            sx={{
              textAlign: msg.role === "user" ? "right" : "left",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                bgcolor: msg.role === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.role === "user" ? "#fff" : "#000",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "80%",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </Box>
          </Box>
        ))}
        {isTyping && (
          <Typography variant="body2" color="text.secondary">
            🧠 The assistant is thinking...
          </Typography>
        )}
      </Paper>

      {/* Chat input */}
      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          size="small"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAssistantRequest();
          }}
        />
        <Button variant="contained" onClick={handleAssistantRequest}>
          {assistantMode === "code" ? "✨ Generate" : "🧠 Send"}
        </Button>
      </Box>
    </Box>
  );
};

export default AssistantSidebar;
