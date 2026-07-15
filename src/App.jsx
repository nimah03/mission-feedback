import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import FormPage from "./pages/FormPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import "./App.css";

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">✝</span>
          <span>성결대 유학생 단기선교 피드백</span>
        </Link>
        <nav className="app-nav">
          {!isDashboard && (
            <Link
              to="/"
              className={
                location.pathname === "/" ? "nav-link active" : "nav-link"
              }
            >
              피드백 작성
            </Link>
          )}
          {isDashboard && (
            <Link to="/" className="nav-link">
              피드백 작성으로
            </Link>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>성결대 유학생 단기선교 · 2026</p>
      </footer>
    </div>
  );
}
