import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./components/dashboard";
import NotFound from "./components/not-found/NotFoundPage";
import { useAppSelector } from "./reducers/store";
import type { JSX } from "react";
import POS from "./components/pos";
import Farmer from "./components/farmer";
import Faq from "./components/content/Faq";
import Content from "./components/content";

// Protects private routes
function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Redirects if already authenticated
function PublicRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public (Login) Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Private Layout Routes */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS/>} />
          <Route path="/farmer" element={<Farmer/>} />
          <Route path="/content" element={<Content/>} />
          <Route path="/faq" element={<Faq/>} />
        </Route>

        {/* Profile Page (also private) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <p>Profile</p>
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
