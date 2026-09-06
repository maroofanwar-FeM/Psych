import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { requireAuth } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { logsRouter } from "./routes/logs.js";
import { messagesRouter } from "./routes/messages.js";
import { scheduleRouter } from "./routes/schedule.js";
import { schoolsRouter } from "./routes/schools.js";
import { templatesRouter } from "./routes/templates.js";
import { whatsappRouter } from "./routes/whatsapp.js";
import { bootstrapAdmin } from "./services/bootstrapAdmin.js";
import { startScheduler } from "./services/scheduler.js";
import { whatsappService } from "./services/whatsappService.js";

// Safety net: an async event listener that throws (e.g. inside whatsappService's
// Baileys handlers) becomes an unhandled rejection, and Node terminates the whole
// process on those by default — silently losing state (like an unsaved WhatsApp
// session) with it. Log instead of dying; every call site we control already has
// its own try/catch, so anything reaching here is unexpected and worth knowing
// about without taking the backend down for it.
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
});

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/schools", requireAuth, schoolsRouter);
app.use("/api/templates", requireAuth, templatesRouter);
app.use("/api/schedule", requireAuth, scheduleRouter);
app.use("/api/whatsapp", requireAuth, whatsappRouter);
app.use("/api/messages", requireAuth, messagesRouter);
app.use("/api/logs", requireAuth, logsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const port = process.env.PORT || 4000;

async function main() {
  await bootstrapAdmin();
  whatsappService.init();
  startScheduler();

  app.listen(port, () => {
    console.log(`CoachConnect backend listening on http://localhost:${port}`);
  });
}

main();
