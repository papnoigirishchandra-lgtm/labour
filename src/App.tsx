import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Workers = lazy(() => import("./pages/Workers"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const Booking = lazy(() => import("./pages/Booking"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const BecomeWorker = lazy(() => import("./pages/BecomeWorker"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Developer = lazy(() => import("./pages/Developer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

const PageLoader = () => (
  <div className="min-h-screen bg-hero flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <Router>
          <AuthProvider>
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/worker/:id" element={<WorkerProfile />} />
                <Route path="/booking/:workerId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/become-worker" element={<ProtectedRoute><BecomeWorker /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/worker-dashboard" element={<ProtectedRoute requireWorker><WorkerDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
                <Route path="/developer" element={<Developer />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
