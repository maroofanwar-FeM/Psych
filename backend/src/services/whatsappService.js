import { EventEmitter } from "node:events";
import QRCode from "qrcode";
import pino from "pino";
import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import { useDBAuthState } from "./baileysAuthState.js";

// Baileys drives the WhatsApp multi-device protocol directly over a WebSocket —
// no browser/Chromium involved (unlike the whatsapp-web.js this replaced), which is
// what makes this reliable to run on a low-memory (e.g. 512MB free tier) host.
// Session state is persisted to Postgres (see baileysAuthState.js) rather than local
// disk, so it survives restarts/redeploys on hosts with no persistent disk.
const logger = pino({ level: "silent" });

// Never send from a personal number — this session must only ever be scanned in with
// the dedicated CoachConnect SIM (see CLAUDE.md / planning.md "golden rule").
class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.status = "DISCONNECTED"; // DISCONNECTED | QR | AUTHENTICATED | READY | AUTH_FAILURE
    this.qrDataUrl = null;
    this.sock = null;
    // group JID -> name, filled in as messages arrive.
    this.seenGroups = new Map();
  }

  async init() {
    if (this.sock) return;

    try {
      const { state, saveCreds } = await useDBAuthState();

      this.sock = makeWASocket({ auth: state, logger });

      // Event listeners here are called by Baileys without anyone awaiting or
      // catching their returned promises — an async listener that throws becomes an
      // unhandled rejection, and Node terminates the process by default on those.
      // Every listener below is wrapped so a failure just logs instead of killing
      // the whole backend (which was silently losing the session before it could
      // even get saved).
      this.sock.ev.on("creds.update", () => {
        console.log("[whatsappService] creds.update fired — saving session to DB");
        saveCreds()
          .then(() => console.log("[whatsappService] session saved to DB"))
          .catch((err) => console.error("[whatsappService] saveCreds failed:", err));
      });

      this.sock.ev.on("connection.update", (update) => {
        Promise.resolve()
          .then(async () => {
            const { connection, lastDisconnect, qr } = update;
            console.log("[whatsappService] connection.update:", connection ?? "(qr)");

            if (qr) {
              this.status = "QR";
              this.qrDataUrl = await QRCode.toDataURL(qr);
              this.emit("status", this.status);
            }

            if (connection === "open") {
              this.status = "READY";
              this.qrDataUrl = null;
              this.emit("status", this.status);
            }

            if (connection === "close") {
              const statusCode = lastDisconnect?.error?.output?.statusCode;
              const loggedOut = statusCode === DisconnectReason.loggedOut;
              console.log(
                "[whatsappService] connection closed, statusCode:",
                statusCode,
                "loggedOut:",
                loggedOut
              );
              this.status = loggedOut ? "AUTH_FAILURE" : "DISCONNECTED";
              this.qrDataUrl = null;
              this.emit("status", this.status);
              this.sock = null;

              // Any close reason other than an explicit logout (dropped connection,
              // "restart required", etc.) is recoverable — reconnect on our own
              // rather than forcing a fresh QR scan every time.
              if (!loggedOut) {
                this.init().catch((err) =>
                  console.error("[whatsappService] reconnect failed:", err.message)
                );
              }
            }
          })
          .catch((err) => console.error("[whatsappService] connection.update handler failed:", err));
      });

      // Discover group IDs/names from any message seen in a group. groupMetadata()
      // is a direct protocol call — more reliable than scraping WhatsApp Web's own
      // (frequently-changing) internal JS the way whatsapp-web.js's getChats() did.
      this.sock.ev.on("messages.upsert", ({ messages }) => {
        Promise.resolve()
          .then(async () => {
            for (const msg of messages) {
              const groupId = msg.key?.remoteJid;
              if (!groupId?.endsWith("@g.us") || this.seenGroups.has(groupId)) continue;
              try {
                const metadata = await this.sock.groupMetadata(groupId);
                this.seenGroups.set(groupId, metadata.subject);
              } catch (err) {
                this.seenGroups.set(groupId, null);
                console.error("[whatsappService] group metadata lookup failed:", err.message);
              }
            }
          })
          .catch((err) => console.error("[whatsappService] messages.upsert handler failed:", err));
      });
    } catch (err) {
      console.error("[whatsappService] initialize failed:", err.message);
      this.status = "AUTH_FAILURE";
      this.emit("status", this.status);
    }
  }

  getStatus() {
    return { status: this.status, qrDataUrl: this.qrDataUrl };
  }

  async sendToGroup(groupId, message) {
    if (this.status !== "READY") {
      throw new Error(`WhatsApp is not connected (status: ${this.status}).`);
    }
    return this.sock.sendMessage(groupId, { text: message });
  }

  // WhatsApp's own UI never shows a group's internal ID — this is the only way to
  // find the value that belongs in a School's groupId field. Populated from the
  // "messages.upsert" event (see init()).
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
