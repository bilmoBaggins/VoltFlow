/**
 * Reset password — VoltFlow fleet charging portal
 * Exchanges the code emailed by POST /auth/forgot-password for a new password,
 * then signs the user straight in with the returned JWT.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../api/client";
import { storeAuth } from "../api/auth";
import "./LoginPage.css";

const RESEND_COOLDOWN_SECONDS = 30;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

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
      const auth = await resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        password,
      );
      storeAuth(auth);
      navigate("/sessions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return;
    setError(null);
    setNotice(null);

    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setNotice("A new code is on its way to your inbox.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      const timer = setInterval(() => {
        setResendCooldown((seconds) => {
          if (seconds <= 1) {
            clearInterval(timer);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resend the code.",
      );
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
                id="volt-mark-grad-reset"
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
              fill="url(#volt-mark-grad-reset)"
            />
          </svg>
          <span className="login-brand-name">VoltFlow</span>
        </div>
        <p className="login-subtitle">
          Enter the code we emailed you and choose a new password.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="reset-email">
            Email
          </label>
          <div className="login-input-wrap">
            <input
              id="reset-email"
              type="email"
              className="login-input"
              placeholder="you@voltflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label className="login-label" htmlFor="reset-otp">
            Reset code
          </label>
          <div className="login-input-wrap">
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              className="login-input"
              placeholder="123456"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              autoComplete="one-time-code"
              required
            />
          </div>

          <label className="login-label" htmlFor="reset-password">
            New password
          </label>
          <div className="login-input-wrap">
            <input
              id="reset-password"
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

          <label className="login-label" htmlFor="reset-confirm-password">
            Confirm new password
          </label>
          <div className="login-input-wrap">
            <input
              id="reset-confirm-password"
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
          {notice && !error && <p className="login-note">{notice}</p>}

          <button
            type="submit"
            className="login-submit"
            disabled={submitting || otp.length !== 6}
          >
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <hr className="login-divider" />

        <p className="login-note">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            className="login-link-button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || !email}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
          </button>
        </p>
        <p className="login-note">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
