import { Navigate } from "react-router-dom";

export default function AdminRoute({ user, children }) {
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/" replace />;
  }
  return children;
}