/**
 * DigiAuth - Authentication & Role Management for Digis Digital
 * Roles: admin, manager, teamwork
 * Permissions:
 *   admin    - full access (users, all content)
 *   manager  - content management (no user management)
 *   teamwork - view dashboard only, limited content editing
 */
const DigiAuth = (() => {
  const SESSION_KEY = 'digis_session';

  const PERMISSIONS = {
    admin: {
      canManageUsers: true,
      canEditContent: true,
      canViewMessages: true,
      canManageServices: true,
      canViewAnalytics: true,
    },
    manager: {
      canManageUsers: false,
      canEditContent: true,
      canViewMessages: true,
      canManageServices: true,
      canViewAnalytics: true,
    },
    teamwork: {
      canManageUsers: false,
      canEditContent: false,
      canViewMessages: true,
      canManageServices: false,
      canViewAnalytics: false,
    },
  };

  async function login(username, password) {
    const user = await DigiDB.get(DigiDB.STORES.USERS, username);
    if (!user) return { success: false, error: 'User not found' };
    if (user.password !== password) return { success: false, error: 'Invalid password' };
    const session = {
      username: user.username,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  }

  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function requireAuth(allowedRoles) {
    const session = getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      window.location.href = 'login.html';
      return null;
    }
    return session;
  }

  function can(permission) {
    const session = getSession();
    if (!session) return false;
    const perms = PERMISSIONS[session.role];
    return perms ? !!perms[permission] : false;
  }

  function getPermissions(role) {
    return PERMISSIONS[role] || {};
  }

  return { login, logout, getSession, requireAuth, can, getPermissions, PERMISSIONS };
})();
