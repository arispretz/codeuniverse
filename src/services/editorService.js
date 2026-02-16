import axios from "axios";
import { getUserToken } from "../utils/userToken.js";

const EXPRESS_URL = import.meta.env.VITE_EXPRESS_URL;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

if (!EXPRESS_URL) {
  throw new Error("Missing environment variable: VITE_EXPRESS_URL");
}
if (!RAPIDAPI_KEY) {
  throw new Error("Missing environment variable: VITE_RAPIDAPI_KEY");
}

/**
 * @fileoverview Code services client.
 * Provides functions to interact with different backends for code-related tasks:
 * - Linting code (Express backend)
 * - Running code (Judge0 via RapidAPI)
 * - Autocompleting code (Express backend → FastAPI)
 *
 * All requests require authentication (Firebase ID token or RapidAPI key).
 *
 * @module services/editorServices
 */

/**
 * Lint code using Express backend.
 */
export async function lintCodeService(code, language) {
  const token = await getUserToken(true);
  if (!token) throw new Error("User not authenticated");

  const { data } = await axios.post(
    `${EXPRESS_URL}/api/lint`,
    { code, language },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

/**
 * Execute code using Judge0 (RapidAPI).
 */
export async function runCodeService(code, languageId) {
  const { data } = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      source_code: code,
      language_id: languageId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    }
  );
  return data;
}

/**
 * Autocomplete code using Express backend (which proxies to FastAPI).
 */
export async function autocompleteService(code, language) {
  const token = await getUserToken(true);
  if (!token) throw new Error("User not authenticated");

  const { data } = await axios.post(
    `${EXPRESS_URL}/api/assistant/autocomplete`,
    { code, language },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
