/**
 * Forgot password — VoltFlow fleet charging portal
 * Asks POST /auth/forgot-password to email a one-time reset code, then hands
 * off to /reset-password where the code is exchanged for a new password.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../api/client";
import "./LoginPage.css";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await requestPasswordReset(normalizedEmail);
      navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send a reset code.",
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
                id="volt-mark-grad-forgot"
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
              fill="url(#volt-mark-grad-forgot)"
            />
          </svg>
          <span className="login-brand-name">VoltFlow</span>
        </div>
        <p className="login-subtitle">
          Enter your email and we&apos;ll send you a code to reset your
          password.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="forgot-email">
            Email
          </label>
          <div className="login-input-wrap">
            <input
              id="forgot-email"
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

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Sending code…" : "Send reset code"}
          </button>
        </form>

        <hr className="login-divider" />

        <p className="login-note">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
