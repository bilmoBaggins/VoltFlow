import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import { prisma } from "../db.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../mailer.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "voltflow-dev-secret";
const JWT_EXPIRES_IN = "7d";
const OTP_TTL_MS = 10 * 60 * 1000;

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function issueOtp(user) {
  const otp = generateOtp();
  const otpCodeHash = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCodeHash, otpExpiresAt },
  });

  await sendOtpEmail(user.email, otp);
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "driver",
        emailVerified: false,
      },
    });

    await issueOtp(user);

    res.status(201).json({
      requiresVerification: true,
      email: user.email,
      message: "Enter the verification code we emailed you to finish signing up.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }
    if (!user.otpCodeHash || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ error: "No verification code pending. Request a new one." });
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ error: "Verification code expired. Request a new one." });
    }

    const valid = await bcrypt.compare(String(otp), user.otpCodeHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect verification code" });
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCodeHash: null, otpExpiresAt: null },
    });

    const token = signToken(verifiedUser);
    res.json({ token, user: toPublicUser(verifiedUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    await issueOtp(user);
    res.json({ message: "A new verification code has been sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always answer the same way, so this endpoint can't be used to discover
    // which email addresses have accounts.
    const response = {
      message: "If that email has an account, a reset code is on its way.",
    };
    if (!user) return res.json(response);

    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash: await bcrypt.hash(otp, 10),
        resetExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    await sendPasswordResetEmail(user.email, otp);

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body || {};
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ error: "Email, code and new password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.resetCodeHash || !user.resetExpiresAt) {
      return res
        .status(400)
        .json({ error: "No reset code pending. Request a new one." });
    }
    if (user.resetExpiresAt.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ error: "Reset code expired. Request a new one." });
    }

    const valid = await bcrypt.compare(String(otp), user.resetCodeHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect reset code" });
    }

    // Receiving the code proves they control the inbox, so an account that
    // never finished sign-up verification is verified by the same token.
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
        resetCodeHash: null,
        resetExpiresAt: null,
        emailVerified: true,
        otpCodeHash: null,
        otpExpiresAt: null,
      },
    });

    const token = signToken(updated);
    res.json({ token, user: toPublicUser(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before signing in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
