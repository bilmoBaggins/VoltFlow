/**
 * Login — VoltFlow fleet charging portal
 * Mockup: docs/mockups/voltflow-login.png
 * Auth: JWT-lite demo login (no backend endpoint yet) — accepts the demo
 * admin credentials and stores a lightweight session flag locally.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const DEMO_EMAIL = "admin@voltflow.com";
const DEMO_PASSWORD = "voltflow-demo";
const AUTH_STORAGE_KEY = "voltflow_demo_auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    if (
      email.trim().toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      navigate("/sessions");
      return;
    }

    setError("Invalid email or password. Use the demo admin credentials.");
    setSubmitting(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <svg
            className="login-brand-mark"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="volt-mark-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6fd6c9" />
                <stop offset="1" stopColor="#199c8b" />
              </linearGradient>
            </defs>
            <path
              d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
              fill="url(#volt-mark-grad)"
            />
          </svg>
          <span className="login-brand-name">VoltFlow</span>
        </div>
        <p className="login-subtitle">Fleet charging portal</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-email">
            Email
          </label>
          <div className="login-input-wrap">
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="admin@voltflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <svg
              className="login-input-icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                d="M3 5h14v10H3z M3 5l7 6 7-6"
              />
            </svg>
          </div>

          <label className="login-label" htmlFor="login-password">
            Password
          </label>
          <div className="login-input-wrap">
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <svg
              className="login-input-icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                d="M5 9V6a5 5 0 0 1 10 0v3 M4 9h12v8H4z"
              />
            </svg>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <hr className="login-divider" />

        <p className="login-note">
          <svg
            className="login-note-icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M10 9v4.5 M10 6.5v.01"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Use demo admin credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
      </div>
    </div>
  );
}
