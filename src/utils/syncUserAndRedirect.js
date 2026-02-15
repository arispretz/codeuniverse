import axios from "axios";

const BASE_URL = import.meta.env.VITE_EXPRESS_URL;
if (!BASE_URL) {
  throw new Error("Missing environment variable: VITE_EXPRESS_URL");
}

/**
 * Synchronizes Firebase user with backend, registers if needed, and redirects based on role.
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
    // 🔑 Get Firebase ID token and store in localStorage
    const token = await firebaseUser.getIdToken(true);
    localStorage.setItem("token", token);

    let userData;
    try {
      // 📡 Try to fetch user from backend
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      userData = res.data;
    } catch (err) {
      // 🆕 Register user if not found
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

    // 🔀 Handle redirection logic
    const currentPath = window.location.pathname;
    const isAuthPage = ["/sign-in", "/register"].includes(currentPath);
    const redirectTarget = fromPath || (isAuthPage ? fallbackPath : null);

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
