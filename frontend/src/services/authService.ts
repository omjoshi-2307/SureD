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

// Register
export const registerUser = async (data: RegisterData) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// Login
export const loginUser = async (data: LoginData) => {
  const response = await API.post("/auth/login", data);

  // Save JWT token and user details
  localStorage.setItem("token", response.data.token);
  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
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
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check Login
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};