import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {

  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;

};

export default ProtectedRoute;