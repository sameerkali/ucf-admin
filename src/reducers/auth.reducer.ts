import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

interface LoginPayload {
  token: string;
  user: User;
}

const loadAuthState = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    return {
      isAuthenticated: Boolean(token && isAuthenticated),
      token: token || null,
      user: userData ? JSON.parse(userData) : null,
    };
  } catch (error) {
    console.error("Error loading auth state:", error);
    return {
      isAuthenticated: false,
      token: null,
      user: null,
    };
  }
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("userData", JSON.stringify(action.payload.user));
      localStorage.setItem("isAuthenticated", "true");
      
      if (typeof window !== 'undefined') {
        import('axios').then(axios => {
          axios.default.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        });
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("isAuthenticated");
      
      if (typeof window !== 'undefined') {
        import('axios').then(axios => {
          delete axios.default.defaults.headers.common['Authorization'];
        });
      }
    },
    clearAuthError: (state) => {
      // For future error handling
    },
  },
});

export const { login, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
