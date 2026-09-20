import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const STATUS_LABELS = {
  READY: "Connected",
  QR: "Scan the QR code",
  AUTHENTICATED: "Connecting...",
  DISCONNECTED: "Not connected",
  AUTH_FAILURE: "Connection failed",
};

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [groups, setGroups] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [sendBody, setSendBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const data = await api.getWhatsappStatus();
        if (!cancelled) setStatus(data);
      } catch {
        // status polling failures are quiet — the pill just won't update this tick
      }
      try {
        const { groups } = await api.getWhatsappGroups();
        if (!cancelled) setGroups(groups);
      } catch {
        // same — the list just won't update this tick
      }
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleCopy(id) {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleSendNow(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.sendNow({ body: sendBody });
      setResult(res.results);
      setSendBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const statusKey = status?.status?.toLowerCase() ?? "disconnected";

  return (
    <div>
      <div className="card">
        <h2>WhatsApp Connection</h2>
        <p>
          <span className={`status-pill ${statusKey}`}>
            {STATUS_LABELS[status?.status] ?? "Checking..."}
          </span>
        </p>
        {status?.status === "QR" && status?.qrDataUrl && (
          <div className="qr-box">
            <img src={status.qrDataUrl} alt="Scan this QR code with the CoachConnect SIM" />
            <p className="empty-state">
              Open WhatsApp on the <strong>CoachConnect SIM</strong> — never your personal
              number — and scan this from Linked Devices.
            </p>
          </div>
        )}
        {status?.status === "DISCONNECTED" && (
          <p className="empty-state">Waiting for the backend to generate a QR code...</p>
        )}
      </div>

      <div className="card">
        <h2>Discovered WhatsApp Groups</h2>
        <p className="empty-state">
          WhatsApp never shows a group's internal ID — it only appears here once a message
          has been sent or received in that group since the connection opened. If a school's
          group isn't listed yet, send any message in that group first, then check back.
        </p>
        {groups.length === 0 ? (
          <p className="empty-state">No groups seen yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Group name</th>
                <th>Group ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td>{g.name ?? "(name not seen yet)"}</td>
                  <td><code>{g.id}</code></td>
                  <td className="row-actions">
                    <button type="button" className="secondary" onClick={() => handleCopy(g.id)}>
                      {copiedId === g.id ? "Copied!" : "Copy ID"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Send Now</h2>
        <p className="empty-state">
          Broadcast one message immediately to every connected school group. Sends are
          staggered automatically so it doesn't look automated.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSendNow}>
          <div className="field">
            <label htmlFor="send-now-body">Message</label>
            <textarea
              id="send-now-body"
              rows={3}
              value={sendBody}
              onChange={(e) => setSendBody(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={sending || status?.status !== "READY"}>
            {sending ? "Sending..." : "Send to all schools"}
          </button>
        </form>
        {result && (
          <div style={{ marginTop: "1rem" }}>
            {result.map((r) => (
              <div key={r.schoolId} className="empty-state">
                School #{r.schoolId}: {r.ok ? "sent" : `failed — ${r.error}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
