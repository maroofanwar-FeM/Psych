# Agent Loop — CoachConnect

## Chatbot vs. Agent

A **chatbot** only responds within a single turn: you ask, it answers, and nothing
happens unless you ask again. It has no goal of its own, takes no actions in the
world, and doesn't persist state between conversations on its own.

An **agent** pursues a goal across multiple cycles without a human prompting every
step: it perceives the current state, decides what to do, takes a real action using
tools, checks the result, and repeats — on its own schedule, not just when spoken to.

CoachConnect has both, and it's worth telling them apart:
- The **AI draft helper** (Templates page) is chatbot-like — you ask for a message
  draft, it replies, done. No memory, no autonomous action.
- The **scheduler + whatsapp-web.js service** (`backend/src/services/scheduler.js`)
  is a real agent — it wakes up every minute on its own, decides which messages are
  due, sends them via WhatsApp, logs the outcome, and loops again. No one has to ask.

## The Five-Step Loop

1. **Perceive** — read the current state. For the scheduler, that's "what time is it,
   and which `ScheduleEntry` rows match right now?" (`scheduler.js`, checked every
   minute via `node-cron`).
2. **Plan** — decide what needs to happen based on that state: which template, which
   schools (all, or one specific group), in what order.
3. **Act** — take the real action: send the WhatsApp message through
   `whatsappService.sendToGroup()`, staggered so it doesn't look automated.
4. **Reflect** — check what actually happened: did the send succeed or fail? Recorded
   either way in `MessageLog` (`status: SENT` or `FAILED`, with the error if any).
5. **Learn** — use that outcome to improve the next cycle: a failed send might mean
   the WhatsApp session dropped (check the Dashboard status pill); a message that
   landed well is a signal to reuse that template. Lessons that matter beyond one
   cycle get written down in `notes/memory.md` or `notes/decisions.md` — then the
   loop repeats from Step 1.

This is the same loop planning.md describes in plain language (send → observe →
adjust → repeat) — the fifth step here just makes explicit that reflection and
learning are separate: reflecting is *checking what happened*, learning is *deciding
what to change because of it*.
