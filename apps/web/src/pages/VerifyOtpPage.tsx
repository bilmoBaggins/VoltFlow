/**
 * Verify email — VoltFlow fleet charging portal
 * Confirms the 6-digit code emailed by POST /auth/register (or the
 * requiresVerification challenge from POST /auth/login), then signs in.
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resendOtp, verifyOtp } from "../api/client";
import { storeAuth } from "../api/auth";
import "./LoginPage.css";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const auth = await verifyOtp(email.trim().toLowerCase(), otp.trim());
      storeAuth(auth);
      navigate("/sessions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not verify that code.",
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
      await resendOtp(email.trim().toLowerCase());
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
                id="volt-mark-grad-verify"
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
              fill="url(#volt-mark-grad-verify)"
            />
          </svg>
          <span className="login-brand-name">VoltFlow</span>
        </div>
        <p className="login-subtitle">
          Enter the 6-digit code we emailed you to verify your account.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="verify-email">
            Email
          </label>
          <div className="login-input-wrap">
            <input
              id="verify-email"
              type="email"
              className="login-input"
              placeholder="you@voltflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label className="login-label" htmlFor="verify-otp">
            Verification code
          </label>
          <div className="login-input-wrap">
            <input
              id="verify-otp"
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
            {submitting ? "Verifying…" : "Verify email"}
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
