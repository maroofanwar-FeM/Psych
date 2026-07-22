import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Logs from "./pages/Logs.jsx";
import Schedule from "./pages/Schedule.jsx";
import Schools from "./pages/Schools.jsx";
import Templates from "./pages/Templates.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null; // still loading
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="schools" element={<Schools />} />
        <Route path="templates" element={<Templates />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}
