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

// Persist auth data to localStorage
const saveAuth = (token: string, user: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Clear auth data from localStorage
const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Register
export const registerUser = async (data: RegisterData) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// Login (email + password)
export const loginUser = async (data: LoginData) => {
  const response = await API.post("/auth/login", data);

  // Save JWT token and user details
  saveAuth(response.data.token, response.data.user);

  return response.data;
};

// Google Login
export const googleLogin = async (data: GoogleLoginData) => {
  const response = await API.post("/auth/google", data);

  // If login/creation succeeded, persist auth
  if (response.data.token && response.data.user) {
    saveAuth(response.data.token, response.data.user);
  }

  return response.data;
};

// Update Wallet Address
export const updateWallet = async (walletAddress: string) => {
  const response = await API.put("/user/wallet", {
    walletAddress,
  });

  // Update user in localStorage
  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

// Logout
export const logoutUser = () => {
  clearAuth();
};

// Check Login
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};