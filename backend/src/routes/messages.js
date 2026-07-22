import { Router } from "express";
import { draftMessage } from "../services/aiDraft.js";

export const messagesRouter = Router();

messagesRouter.post("/draft", async (req, res) => {
  const { occasion, context } = req.body ?? {};
  if (!occasion) return res.status(400).json({ error: "Occasion is required." });

  try {
    const draft = await draftMessage({ occasion, context });
    res.json({ draft });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});
