import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./components/dashboard";
import NotFound from "./components/not-found/NotFoundPage";
import { useAppSelector } from "./reducers/store";
import type { JSX } from "react";

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
          <Route path="/curriculum" element={<div>Curriculum</div>} />
          <Route path="/insights" element={<div>Insights</div>} />
          <Route path="/assign-time" element={<p>Assign Time</p>} />
          <Route path="/assignment" element={<p>Assignment</p>} />
          <Route path="/generate-questions" element={<div>Generate Questions</div>} />
          <Route path="/library" element={<div>Library</div>} />
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
