/**
 * Register — VoltFlow fleet charging portal
 * Auth: calls POST /auth/register on the API, which emails a one-time
 * verification code; the new user finishes sign-up on /verify-email.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/client";
import "./LoginPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await registerUser(name.trim(), normalizedEmail, password);
      navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create your account.",
      );
    } finally {
      setSubmitting(false);
    }
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
              <linearGradient
                id="volt-mark-grad-register"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0" stopColor="#6fd6c9" />
                <stop offset="1" stopColor="#199c8b" />
              </linearGradient>
            </defs>
            <path
              d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
              fill="url(#volt-mark-grad-register)"
            />
          </svg>
          <span className="login-brand-name">VoltFlow</span>
        </div>
        <p className="login-subtitle">Create your fleet portal account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="register-name">
            Full name
          </label>
          <div className="login-input-wrap">
            <input
              id="register-name"
              type="text"
              className="login-input"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <label className="login-label" htmlFor="register-email">
            Email
          </label>
          <div className="login-input-wrap">
            <input
              id="register-email"
              type="email"
              className="login-input"
              placeholder="you@voltflow.com"
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

          <label className="login-label" htmlFor="register-password">
            Password
          </label>
          <div className="login-input-wrap">
            <input
              id="register-password"
              type="password"
              className="login-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
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

          <label className="login-label" htmlFor="register-confirm-password">
            Confirm password
          </label>
          <div className="login-input-wrap">
            <input
              id="register-confirm-password"
              type="password"
              className="login-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <hr className="login-divider" />

        <p className="login-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
