import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Schedule() {
  const [entries, setEntries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [schools, setSchools] = useState([]);

  const [templateId, setTemplateId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [hour, setHour] = useState("8");
  const [minute, setMinute] = useState("0");
  const [error, setError] = useState(null);

  async function load() {
    const [e, t, s] = await Promise.all([api.getSchedule(), api.getTemplates(), api.getSchools()]);
    setEntries(e);
    setTemplates(t);
    setSchools(s);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    if (!templateId) {
      setError("Choose a template first.");
      return;
    }
    try {
      await api.createScheduleEntry({
        templateId: Number(templateId),
        schoolId: schoolId ? Number(schoolId) : null,
        dayOfWeek: Number(dayOfWeek),
        hour: Number(hour),
        minute: Number(minute),
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(entry) {
    await api.updateScheduleEntry(entry.id, { active: !entry.active });
    await load();
  }

  async function handleDelete(entry) {
    if (!window.confirm("Remove this scheduled send? This cannot be undone.")) return;
    await api.deleteScheduleEntry(entry.id);
    await load();
  }

  return (
    <div>
      <div className="card">
        <h2>New Scheduled Send</h2>
        <p className="empty-state">
          e.g. "Every Monday at 8:00, send Monday Motivation to all schools."
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="sched-template">Template</label>
              <select
                id="sched-template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">Choose a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sched-school">School</label>
              <select
                id="sched-school"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              >
                <option value="">All schools</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="sched-day">Day</label>
              <select id="sched-day" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sched-hour">Hour (0-23)</label>
              <input
                id="sched-hour"
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="sched-minute">Minute</label>
              <input
                id="sched-minute"
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              />
            </div>
          </div>
          <button type="submit">Add to Schedule</button>
        </form>
      </div>

      <div className="card">
        <h2>Scheduled Sends ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="empty-state">Nothing scheduled yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Template</th>
                <th>School</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {DAYS[entry.dayOfWeek]} {String(entry.hour).padStart(2, "0")}:
                    {String(entry.minute).padStart(2, "0")}
                  </td>
                  <td>{entry.template?.title}</td>
                  <td>{entry.school?.name ?? "All schools"}</td>
                  <td>
                    <button className="secondary" onClick={() => handleToggle(entry)}>
                      {entry.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="row-actions">
                    <button className="danger" onClick={() => handleDelete(entry)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
