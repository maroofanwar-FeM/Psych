import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.coachconnect_session;
  if (!token) {
    return res.status(401).json({ error: "Not signed in." });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Session expired, please sign in again." });
  }
}
