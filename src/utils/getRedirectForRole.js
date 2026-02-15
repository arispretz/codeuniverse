/**
 * Maps user roles to their corresponding redirect paths.
 */
const roleRedirects = {
  admin: "/admin-user-panel",
  manager: "/dashboard",
  developer: "/dashboard",
  ai_assistant: "/dashboard/chat",
  guest: "/dashboard", 
};

/**
 * Returns the redirect path for a given user role.
 */
export const getRedirectForRole = (role) => {
  if (!role || typeof role !== "string") return "/dashboard";
  const normalized = role.trim().toLowerCase();
  return roleRedirects[normalized] || "/dashboard";
};
