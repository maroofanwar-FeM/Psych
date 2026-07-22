import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.getLogs().then(setLogs);
  }, []);

  return (
    <div className="card">
      <h2>Sent Log</h2>
      {logs.length === 0 ? (
        <p className="empty-state">Nothing sent yet — logs show up here once a message goes out.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>School</th>
              <th>Triggered By</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.sentAt).toLocaleString()}</td>
                <td>{log.school?.name}</td>
                <td>{log.triggeredBy}</td>
                <td>
                  <span className={`status-pill ${log.status === "SENT" ? "ready" : "disconnected"}`}>
                    {log.status}
                  </span>
                </td>
                <td>{log.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
