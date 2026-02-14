/**
 * @fileoverview OutputPanel component.
 * Provides a panel to display the execution result of code with options to:
 * - Copy to clipboard
 * - Clear output
 * - Download as text file
 * - Expand/Collapse view
 *
 * Supports syntax highlighting via `react-syntax-highlighter` and visually highlights errors.
 *
 * @module components/OutputPanel
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * OutputPanel Component
 *
 * @function OutputPanel
 * @param {Object} props - Component props.
 * @param {string|Object} props.executionResult - The result of code execution (string or object).
 * @param {string} [props.language="javascript"] - Programming language for syntax highlighting.
 * @returns {JSX.Element} Output panel component with syntax highlighting and action buttons.
 *
 * @example
 * <OutputPanel
 *   executionResult={"console.log('Hello World');"}
 *   language="javascript"
 * />
 */
const OutputPanel = ({ executionResult, language = "javascript" }) => {
  const [expanded, setExpanded] = useState(true);
  const [output, setOutput] = useState(executionResult || "");

  useEffect(() => {
    setOutput(executionResult || "");
  }, [executionResult]);

  /**
   * Copies the output to clipboard.
   *
   * @function handleCopy
   * @returns {void}
   */
  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  /**
   * Clears the output.
   *
   * @function handleClear
   * @returns {void}
   */
  const handleClear = () => {
    setOutput("");
  };

  /**
   * Downloads the output as a text file.
   *
   * @function handleDownload
   * @returns {void}
   */
  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "execution_output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

const isError = output && output.toLowerCase().startsWith("error:");

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", overflow: "auto" }}>
      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">📤 Output</Typography>
        <Box>
          <Tooltip title="Copy">
            <IconButton onClick={handleCopy}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton onClick={handleClear}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />

      {/* Output content */}
      {expanded && (
        <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
          {output ? (
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              wrapLongLines
              showLineNumbers
              customStyle={{
                backgroundColor: isError ? "#2d1f1f" : "#1e1e1e",
                color: isError ? "#ff6b6b" : "#cccccc",
              }}
            >
              {typeof output === "string"
                ? output
                : JSON.stringify(output, null, 2)}
            </SyntaxHighlighter>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No results yet...
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default OutputPanel;
