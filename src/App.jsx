import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import DiagnosePage from "./pages/DiagnosePage";
import AIResultPage from "./pages/AIResultPage";
import HumanReviewPage from "./pages/HumanReviewPage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Operator Monitor Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Form diagnostics */}
          <Route path="/diagnose" element={<DiagnosePage />} />

          {/* Diagnostic Result breakdown */}
          <Route path="/result/:id" element={<AIResultPage />} />

          {/* Human Review panel */}
          <Route path="/review/:id" element={<HumanReviewPage />} />

          {/* Table history logs */}
          <Route path="/history" element={<HistoryPage />} />

          {/* Product description page */}
          <Route path="/about" element={<AboutPage />} />

          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
