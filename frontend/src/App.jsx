import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Investigations from "./pages/Investigations";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Layout from "./components/Layout";

import {
  Threats,
} from "./pages/SecurityPages";

import "./index.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* LOGIN - NO SIDEBAR */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* APPLICATION WITH SIDEBAR */}
          <Route
            element={<Layout />}
          >

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/activities"
              element={<Activities />}
            />

            <Route
              path="/threats"
              element={<Threats />}
            />

            <Route
              path="/investigations"
              element={<Investigations />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/audit-logs"
              element={<AuditLogs />}
            />

          </Route>

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;