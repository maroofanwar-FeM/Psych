import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const OCCASIONS = [
  { value: "MONDAY_MOTIVATION", label: "Monday Motivation" },
  { value: "SESSION_REMINDER", label: "Session Reminder" },
  { value: "THANK_YOU_FOLLOWUP", label: "Thank-You Follow-Up" },
  { value: "CUSTOM", label: "Custom" },
];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("MONDAY_MOTIVATION");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);

  const [draftContext, setDraftContext] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftText, setDraftText] = useState(null);
  const [draftError, setDraftError] = useState(null);

  async function load() {
    setTemplates(await api.getTemplates());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.createTemplate({ title, occasion, body });
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(template) {
    // CLAUDE.md hard rule: never delete a template without asking first.
    if (!window.confirm(`Delete template "${template.title}"? This cannot be undone.`)) return;
    await api.deleteTemplate(template.id);
    await load();
  }

  async function handleDraft() {
    setDrafting(true);
    setDraftError(null);
    setDraftText(null);
    try {
      const res = await api.draftMessage({ occasion, context: draftContext });
      setDraftText(res.draft);
    } catch (err) {
      setDraftError(err.message);
    } finally {
      setDrafting(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h2>New Template</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="tpl-title">Title</label>
              <input
                id="tpl-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="tpl-occasion">Occasion</label>
              <select
                id="tpl-occasion"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              >
                {OCCASIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>AI draft helper (optional)</label>
            <div className="form-row">
              <input
                placeholder="Any context? e.g. school name, date, topic"
                value={draftContext}
                onChange={(e) => setDraftContext(e.target.value)}
              />
              <button
                type="button"
                className="secondary"
                onClick={handleDraft}
                disabled={drafting}
                style={{ flex: "0 0 auto" }}
              >
                {drafting ? "Drafting..." : "Draft with AI"}
              </button>
            </div>
            {draftError && <div className="error-banner">{draftError}</div>}
            {draftText && (
              <div className="variant-block">
                {draftText}
                <div style={{ marginTop: "0.6rem" }}>
                  <button type="button" className="secondary" onClick={() => setBody(draftText)}>
                    Use this as the message body
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="tpl-body">Message body</label>
            <textarea
              id="tpl-body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <button type="submit">Save Template</button>
        </form>
      </div>

      <div className="card">
        <h2>Your Templates ({templates.length})</h2>
        {templates.length === 0 ? (
          <p className="empty-state">No templates yet — create your first one above.</p>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}
            >
              <strong>{t.title}</strong>{" "}
              <span className="empty-state">
                — {OCCASIONS.find((o) => o.value === t.occasion)?.label ?? t.occasion}
              </span>
              <div className="variant-block">{t.body}</div>
              <div className="row-actions">
                <button className="danger" onClick={() => handleDelete(t)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
