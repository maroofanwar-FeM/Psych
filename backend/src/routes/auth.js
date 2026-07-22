import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const COOKIE_NAME = "coachconnect_session";
// Frontend and backend are separate hosts in production (e.g. two Railway services),
// so the session cookie must be SameSite=None — which browsers only allow over HTTPS.
// Local dev stays same-origin (Vite's dev-server proxy), so it doesn't need this.
const crossOrigin = process.env.COOKIE_CROSS_ORIGIN === "true";

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: crossOrigin,
    sameSite: crossOrigin ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ email: user.email });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ email: req.user.email });
});
