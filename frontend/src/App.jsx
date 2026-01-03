import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LanguageProvider } from "./i18n/LanguageContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Footer from "./components/Footer";

import BLOLogin from "./pages/BLOLogin";
import BLODashboard from "./pages/BLODashboard";
import AuditLogs from "./pages/AuditLogs";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Header />

        <Routes>
          <Route path="/" element={<><Hero /><About /><Services /></>} />
          <Route path="/blo-login" element={<BLOLogin />} />

          <Route
            path="/blo/dashboard"
            element={
              <ProtectedRoute>
                <BLODashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blo/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Footer />
      </AuthProvider>
    </LanguageProvider>
  );
}
