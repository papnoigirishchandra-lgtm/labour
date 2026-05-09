import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireWorker?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin, requireWorker }: Props) => {
  const { user, loading, isAdmin, isWorker } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireWorker && !isWorker) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
