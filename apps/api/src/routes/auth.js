import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import { prisma } from "../db.js";
import { sendOtpEmail } from "../mailer.js";

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
