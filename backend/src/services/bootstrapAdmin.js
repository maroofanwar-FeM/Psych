import bcrypt from "bcryptjs";
import { prisma } from "../db/client.js";

// CoachConnect is single-user for now (Step 5 multi-coach support comes later),
// so there's no public signup route — the one admin account is seeded from env vars.
export async function bootstrapAdmin() {
  const existing = await prisma.user.findFirst();
  if (existing) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[bootstrapAdmin] No user exists yet and ADMIN_EMAIL/ADMIN_PASSWORD are not set — set them in .env and restart."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash } });
  console.log(`[bootstrapAdmin] Created admin user ${email}`);
}
