import axios from "axios";

const BASE_URL = import.meta.env.VITE_EXPRESS_URL;
if (!BASE_URL) {
  throw new Error("Missing environment variable: VITE_EXPRESS_URL");
}

/**
 * Synchronizes the Firebase user with the backend, registers if needed,
 * updates context, and handles redirection logic.
 *
 * Key improvements:
 * - Prevents forced redirection back to `/dashboard` when already inside a dashboard subroute.
 * - Uses `fromPath` to return the user to the route they originally attempted to access.
 */
export async function syncUserAndRedirect(
  firebaseUser,
  navigate,
  setUser,
  setRole,
  fallbackPath,
  fromPath
) {
  try {
    // 🔑 Get Firebase ID token and store it locally
    const token = await firebaseUser.getIdToken();
    localStorage.setItem("token", token);

    let userData;
    try {
      // 📡 Attempt to fetch user from backend
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      userData = res.data;
    } catch (err) {
      // 🆕 Register user if not found (404)
      if (err.response?.status === 404) {
        const registerRes = await axios.post(
          `${BASE_URL}/register`,
          {
            idToken: token,
            username: firebaseUser.displayName || firebaseUser.email,
            team: null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        userData = { role: registerRes.data.role, ...registerRes.data.user };
      } else {
        throw err;
      }
    }

    // ✅ Validate role
    if (!userData?.role || typeof userData.role !== "string") {
      throw new Error("Invalid role");
    }

    // 🧩 Update context with user and role
    setUser({ ...firebaseUser, role: userData.role });
    setRole(userData.role);

    // 🔀 Redirection logic
    const currentPath = window.location.pathname;
    const isAuthPage = ["/sign-in", "/register"].includes(currentPath);
    const isDashboardSubroute = currentPath.startsWith("/dashboard");

    /**
     * Redirect rules:
     * - If `fromPath` exists, go back to that route (user tried to access a protected page).
     * - If not on an auth page AND not already inside a dashboard subroute,
     *   redirect to the fallback (usually `/dashboard`).
     * - Otherwise, stay where you are.
     */
    const redirectTarget =
      fromPath || (!isAuthPage && !isDashboardSubroute ? fallbackPath : null);

    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
    }

    return userData;
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    setUser(null);
    setRole(null);
    localStorage.removeItem("token");
    return null;
  }
}
