import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  roles: string[];
}

const RoleRoute = ({ children, roles }: Props) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("User:", user);
  console.log("User Role:", user.role);
  console.log("Allowed Roles:", roles);

  if (!user?.role) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!roles.includes(user.role)) {
    console.log("Redirect to dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;