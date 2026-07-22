async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  getSchools: () => request("/schools"),
  createSchool: (data) => request("/schools", { method: "POST", body: JSON.stringify(data) }),
  updateSchool: (id, data) =>
    request(`/schools/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSchool: (id) => request(`/schools/${id}`, { method: "DELETE" }),

  getTemplates: () => request("/templates"),
  createTemplate: (data) => request("/templates", { method: "POST", body: JSON.stringify(data) }),
  updateTemplate: (id, data) =>
    request(`/templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: "DELETE" }),

  getSchedule: () => request("/schedule"),
  createScheduleEntry: (data) =>
    request("/schedule", { method: "POST", body: JSON.stringify(data) }),
  updateScheduleEntry: (id, data) =>
    request(`/schedule/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteScheduleEntry: (id) => request(`/schedule/${id}`, { method: "DELETE" }),

  getWhatsappStatus: () => request("/whatsapp/status"),
  sendNow: (data) => request("/whatsapp/send-now", { method: "POST", body: JSON.stringify(data) }),

  draftMessage: (data) => request("/messages/draft", { method: "POST", body: JSON.stringify(data) }),

  getLogs: () => request("/logs"),
};
