import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState(null);

  async function load() {
    setSchools(await api.getSchools());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.createSchool({ name, groupId: groupId || undefined });
      setName("");
      setGroupId("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(school) {
    // CLAUDE.md: always ask before deleting a scheduled message or template — extend
    // the same courtesy to schools, since removing one drops its schedule/logs too.
    if (!window.confirm(`Remove "${school.name}"? This cannot be undone.`)) return;
    await api.deleteSchool(school.id);
    await load();
  }

  async function handleGroupIdChange(school, value) {
    await api.updateSchool(school.id, { groupId: value || null });
    await load();
  }

  return (
    <div>
      <div className="card">
        <h2>Add a School</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleAdd} className="form-row">
          <div className="field">
            <label htmlFor="school-name">School name</label>
            <input
              id="school-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="school-group">WhatsApp group ID (optional)</label>
            <input
              id="school-group"
              placeholder="e.g. 1203630...@g.us"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
            <button type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Your Schools ({schools.length})</h2>
        {schools.length === 0 ? (
          <p className="empty-state">No schools yet — add your first one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>WhatsApp Group ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>
                    <input
                      defaultValue={school.groupId ?? ""}
                      placeholder="not set — paste group ID once connected"
                      onBlur={(e) => handleGroupIdChange(school, e.target.value)}
                    />
                  </td>
                  <td className="row-actions">
                    <button className="danger" onClick={() => handleDelete(school)}>
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
