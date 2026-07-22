import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/schools", label: "Schools" },
  { to: "/templates", label: "Templates" },
  { to: "/schedule", label: "Schedule" },
  { to: "/logs", label: "Sent Log" },
];

export default function Layout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">CoachConnect</div>
        <nav className="topbar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user?.email}</span>
          <button className="secondary" onClick={logout}>
            Sign out
          </button>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
