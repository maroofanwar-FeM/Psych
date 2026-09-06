import { proto, initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import { prisma } from "../db/client.js";

// Baileys' reference useMultiFileAuthState() stores the session (creds + a growing
// set of signal keys) as one JSON file per key, on local disk. We mirror that exact
// shape here but persist to the WhatsappAuthState table in Postgres instead — free
// hosts (Render's free tier, etc.) wipe local disk on every restart/redeploy, but the
// database survives, so the session (and the one-time QR scan) survives with it.

async function readValue(key) {
  const row = await prisma.whatsappAuthState.findUnique({ where: { key } });
  if (!row) return null;
  // Round-trip through BufferJSON's reviver to turn the {type:"Buffer",...}
  // markers (written by writeValue below) back into real Buffer instances.
  return JSON.parse(JSON.stringify(row.value), BufferJSON.reviver);
}

async function writeValue(key, data) {
  const value = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
  await prisma.whatsappAuthState.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function removeValue(key) {
  await prisma.whatsappAuthState.delete({ where: { key } }).catch(() => {});
}

export async function useDBAuthState() {
  const creds = (await readValue("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readValue(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeValue(key, value) : removeValue(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeValue("creds", creds),
  };
}
