import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import {
  Activities,
  Threats,
  Investigations,
  Reports,
  AuditLogs,
} from "./pages/SecurityPages";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* SentinelFlow Security Modules */}
          <Route path="/activities" element={<Activities />} />

          <Route path="/threats" element={<Threats />} />

          <Route
            path="/investigations"
            element={<Investigations />}
          />

          <Route path="/reports" element={<Reports />} />

          <Route path="/audit-logs" element={<AuditLogs />} />

          {/* Unknown URL */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;