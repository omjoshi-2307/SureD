export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'landlord';
  walletAddress?: string;
  provider?: string;
}

export function useAuth(): { user: AuthUser | null } {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: {
          id: parsed.id || "",
          email: parsed.email || "",
          name: parsed.name || "",
          role: parsed.role || "student",
          walletAddress: parsed.walletAddress || "",
          provider: parsed.provider || "email",
        },
      };
    }
  } catch {}
  return { user: null };
}
