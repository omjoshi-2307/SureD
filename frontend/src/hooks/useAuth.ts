/**
 * useAuth — Demo stub hook.
 *
 * Currently returns a hard-coded null user so the app works without any
 * backend. Replace the internals here when adding real JWT / Stellar auth.
 *
 * Expected future shape:
 *   { user: { id, email, role }, token, login(), logout() }
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord';
}

export function useAuth(): { user: AuthUser | null } {
  // TODO: read from localStorage / JWT / context when auth is added
  return { user: null };
}
