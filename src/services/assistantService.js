import axios from "axios";
import { getUserToken } from "../utils/userToken.js";

const BASE_URL = import.meta.env.VITE_FASTAPI_URL;
if (!BASE_URL) {
  throw new Error("Missing environment variable: VITE_FASTAPI_URL");
}

/**
 * @fileoverview Assistant API client.
 * Provides functions to interact with the FastAPI backend for assistant-related operations:
 * - Request replies (mentor mode, code-only mode)
 * - Refactor code
 * - Classify text
 * - Retrieve metrics
 *
 * All requests require a valid Firebase ID token for authentication.
 *
 * @module services/assistantService
 */

/**
 * Request assistant reply in mentor mode.
 *
 * @async
 * @function getAssistantReply
 * @param {Object} payload - Request payload containing user input.
 * @returns {Promise<string>} Assistant reply as plain text.
 *
 * @throws {Error} Throws if no authenticated user or request fails.
 *
 * @example
 * const reply = await getAssistantReply({ prompt: "Explain recursion" });
 * console.log(reply);
 */
export async function getAssistantReply(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/reply`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 120000,
  });
  return data.reply;
}

/**
 * Request assistant reply in code-only mode.
 *
 * @async
 * @function getAssistantCodeReply
 * @param {Object} payload - Request payload containing user input.
 * @returns {Promise<string>} Assistant reply containing only code.
 *
 * @example
 * const code = await getAssistantCodeReply({ prompt: "Write a bubble sort in Python" });
 * console.log(code);
 */
export async function getAssistantCodeReply(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/reply-code-only`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 120000,
  });
  return data.code;
}

/**
 * Refactor code.
 *
 * @async
 * @function refactorCode
 * @param {Object} payload - Request payload containing code to refactor.
 * @returns {Promise<Object>} Refactored code response.
 *
 * @example
 * const result = await refactorCode({ code: "function add(a,b){return a+b}" });
 * console.log(result.refactored);
 */
export async function refactorCode(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/refactor`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

/**
 * Perform basic text classification.
 *
 * @async
 * @function classifyText
 * @param {string} text - Text to classify.
 * @returns {Promise<string>} Classification result.
 *
 * @example
 * const category = await classifyText("This is a positive review");
 * console.log(category); // "positive"
 */
export async function classifyText(text) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(
    `${BASE_URL}/classify`,
    { text },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data.classification;
}

/**
 * Retrieve assistant metrics.
 *
 * @async
 * @function getMetrics
 * @param {number} [limit=10] - Number of metrics to retrieve.
 * @returns {Promise<Array>} List of user interactions.
 *
 * @example
 * const metrics = await getMetrics(5);
 * console.log(metrics);
 */
export async function getMetrics(limit = 10) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.get(`${BASE_URL}/metrics?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.interactions;
}

export async function generateCodeSnippet(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/generate`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.code;
}

export async function getAutocompleteSuggestion(payload) {
  const token = await getUserToken(true);
  if (!token) throw new Error("No authenticated user");

  const { data } = await axios.post(`${BASE_URL}/autocomplete`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.suggestion;
}
