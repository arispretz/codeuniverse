import axios from "axios";
import { getUserToken } from "../utils/userToken.js";

const BASE_URL = import.meta.env.VITE_EXPRESS_URL;
if (!BASE_URL) {
  throw new Error("Missing environment variable: VITE_EXPRESS_URL");
}

/**
 * @fileoverview Assistant API client.
 * Provides functions to interact with the Express backend for assistant-related operations:
 * - Request replies (mentor mode, code-only mode)
 * - Generate code
 * - Autocomplete code
 *
 * All requests require a valid Firebase ID token for authentication.
 *
 * @module services/assistantService
 */

/**
 * Request assistant reply in mentor mode.
 */
export async function getAssistantReply(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/api/assistant/reply`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 120000,
  });
  return data.response || data.reply;
}

/**
 * Request assistant reply in code-only mode.
 */
export async function getAssistantCodeReply(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/api/assistant/reply-code-only`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 120000,
  });
  return data.code;
}

/**
 * Generate code snippet.
 */
export async function generateCodeSnippet(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/api/assistant/generate`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.code;
}

/**
 * Get autocomplete suggestion.
 */
export async function getAutocompleteSuggestion(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/api/assistant/autocomplete`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.suggestion;
}
