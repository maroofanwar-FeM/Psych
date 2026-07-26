import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DATA_PATH = path.join(__dirname, "..", "..", "data", "wwebjs_auth");

const SINGLETON_LOCK_NAMES = new Set(["SingletonLock", "SingletonCookie", "SingletonSocket"]);

// On a container restart/redeploy, Chromium's previous process never got to clean up
// its own profile lock — since this is always a fresh process, any lock left over from
// before is guaranteed stale, and leaving it in place makes Chromium refuse to launch.
function clearStaleChromiumLocks(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // directory doesn't exist yet — nothing to clean
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (SINGLETON_LOCK_NAMES.has(entry.name)) {
      fs.rmSync(fullPath, { force: true });
    } else if (entry.isDirectory()) {
      clearStaleChromiumLocks(fullPath);
    }
  }
}

// Never send from a personal number — this session must only ever be scanned in with
// the dedicated CoachConnect SIM (see CLAUDE.md / planning.md "golden rule").
class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.status = "DISCONNECTED"; // DISCONNECTED | QR | AUTHENTICATED | READY | AUTH_FAILURE
    this.qrDataUrl = null;
    this.client = null;
    // group JID -> name, filled in as messages arrive. getChats() evaluates WhatsApp
    // Web's own (frequently-changing, minified) internal JS and breaks unpredictably;
    // reading IDs off the already-hydrated Message objects from the "message" event
    // avoids that entirely.
    this.seenGroups = new Map();
  }

  init() {
    if (this.client) return;

    clearStaleChromiumLocks(AUTH_DATA_PATH);

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: AUTH_DATA_PATH }),
      puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });

    this.client.on("qr", async (qr) => {
      this.status = "QR";
      this.qrDataUrl = await QRCode.toDataURL(qr);
      this.emit("status", this.status);
    });

    this.client.on("authenticated", () => {
      this.status = "AUTHENTICATED";
      this.qrDataUrl = null;
      this.emit("status", this.status);
    });

    this.client.on("ready", () => {
      this.status = "READY";
      this.emit("status", this.status);
    });

    this.client.on("auth_failure", () => {
      this.status = "AUTH_FAILURE";
      this.emit("status", this.status);
    });

    this.client.on("disconnected", () => {
      this.status = "DISCONNECTED";
      this.qrDataUrl = null;
      this.emit("status", this.status);
    });

    // "message" only fires for messages received from others; a message the
    // CoachConnect number sends itself only fires "message_create" — needed since
    // the natural way to "ping" a group to discover its ID is to send a test message.
    this.client.on("message_create", async (msg) => {
      const groupId = [msg.from, msg.to].find((id) => id?.endsWith("@g.us"));
      if (!groupId || this.seenGroups.has(groupId)) return;
      try {
        const chat = await msg.getChat();
        this.seenGroups.set(groupId, chat.name);
      } catch (err) {
        // Name lookup can hit the same WhatsApp Web fragility as getChats() —
        // fall back to just the ID so the group is still discoverable.
        this.seenGroups.set(groupId, null);
        console.error("[whatsappService] chat name lookup failed:", err.message);
      }
    });

    this.client.initialize().catch((err) => {
      console.error("[whatsappService] initialize failed:", err.message);
      this.status = "AUTH_FAILURE";
      this.emit("status", this.status);
    });
  }

  getStatus() {
    return { status: this.status, qrDataUrl: this.qrDataUrl };
  }

  async sendToGroup(groupId, message) {
    if (this.status !== "READY") {
      throw new Error(`WhatsApp is not connected (status: ${this.status}).`);
    }
    return this.client.sendMessage(groupId, message);
  }

  // WhatsApp's own UI never shows a group's internal ID — this is the only way to
  // find the value that belongs in a School's groupId field. Populated from the
  // "message" event (see init()) rather than getChats(), which is unreliable.
  listGroups() {
    return [...this.seenGroups.entries()].map(([id, name]) => ({ id, name }));
  }
}

export const whatsappService = new WhatsAppService();

// Small random gap so a broadcast doesn't blast every group in the same second —
// planning.md's safety checklist calls this out explicitly.
export function staggerDelay(minMs = 3000, maxMs = 8000) {
  return new Promise((resolve) =>
    setTimeout(resolve, minMs + Math.random() * (maxMs - minMs))
  );
}
