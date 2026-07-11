import API from "../api/axios";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  credential: string;
  name?: string;
  email?: string;
  picture?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  walletAddress?: string;
  provider?: string;
  username?: string;
  bio?: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  isWalletConnected?: boolean;
  walletType?: string;
  network?: string;
  emailVerified?: boolean;
  walletVerified?: boolean;
  kycStatus?: string;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  theme?: string;
  notifications?: boolean;
  language?: string;
  privacyPreferences?: string;
  createdAt?: string;
}

export interface ProfileStats {
  escrowsCreated: number;
  escrowsCompleted: number;
  escrowsPending: number;
  totalDepositValue: number;
  totalReleased: number;
  successRate: number;
  averageCompletionTime: string;
  lastTransactionDate: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  status: string;
  transactionLink?: string;
  icon?: string;
}

export interface ProfileResponse {
  success: boolean;
  user: UserProfile;
  stats: ProfileStats;
  activity: ActivityItem[];
}

export interface ProfileUpdatePayload {
  fullName?: string;
  name?: string;
  username?: string;
  bio?: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  theme?: string;
  notifications?: boolean;
  language?: string;
  privacyPreferences?: string;
}

export interface WalletUpdatePayload {
  walletAddress?: string;
  isWalletConnected?: boolean;
  walletType?: string;
  network?: string;
  walletVerified?: boolean;
}

const saveAuth = (token: string, user: UserProfile) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const registerUser = async (data: RegisterData) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginData) => {
  const response = await API.post("/auth/login", data);
  saveAuth(response.data.token, response.data.user);
  return response.data;
};

export const googleLogin = async (data: GoogleLoginData) => {
  const response = await API.post("/auth/google", data);

  if (response.data.token && response.data.user) {
    saveAuth(response.data.token, response.data.user);
  }

  return response.data;
};

export const fetchUserProfile = async (): Promise<ProfileResponse> => {
  const response = await API.get<ProfileResponse>("/user/profile");
  if (response.data.user) {
    const existing = localStorage.getItem("user");
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem("user", JSON.stringify({ ...parsed, ...response.data.user }));
  }
  return response.data;
};

export const updateUserProfile = async (data: ProfileUpdatePayload): Promise<ProfileResponse | { success: boolean; message: string; user: UserProfile }> => {
  const response = await API.put("/user/profile", data);
  if (response.data.user) {
    const existing = localStorage.getItem("user");
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem("user", JSON.stringify({ ...parsed, ...response.data.user }));
  }
  return response.data;
};

export const updateWallet = async (walletAddress: string) => {
  const response = await API.put("/user/wallet", {
    walletAddress,
  });

  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const syncWallet = async (payload: WalletUpdatePayload) => {
  const response = await API.put("/user/wallet", payload);
  if (response.data.user) {
    const existing = localStorage.getItem("user");
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem("user", JSON.stringify({ ...parsed, ...response.data.user }));
  }
  return response.data;
};

export const logoutUser = () => {
  clearAuth();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};