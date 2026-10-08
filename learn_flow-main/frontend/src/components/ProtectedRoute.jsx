import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext.jsx";

import Loading from "./Loading.jsx";

export default function ProtectedRoute({
  allowedRoles = [],
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <Loading label="Checking your session" />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const hasRoleRestriction =
    allowedRoles.length > 0;

  const isRoleAllowed =
    allowedRoles.includes(
      user.role,
    );

  if (
    hasRoleRestriction &&
    !isRoleAllowed
  ) {
    return (
      <Navigate
        to={
          user.role === "admin"
            ? "/admin/approvals"
            : "/"
        }
        replace
      />
    );
  }

  return <Outlet />;
}