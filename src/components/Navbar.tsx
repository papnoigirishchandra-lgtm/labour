import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, Briefcase, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading, isAdmin, isWorker, signOut } = useAuth();
  const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`;

  const navLinks = [
    { label: "Services", path: "/services" },
    { label: "Find Workers", path: "/workers" },
    ...(user ? [{ label: "Dashboard", path: "/dashboard" }] : []),
    { label: "Developer", path: "/developer" },
    ...(user && !isWorker ? [{ label: "Become a Worker", path: "/become-worker" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoSrc} alt="Krishiseva logo" className="w-9 h-9 rounded-lg shadow-sm" />
          <span className="font-display font-bold text-xl text-foreground">Krishiseva</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              {isWorker && (
                <Link to="/worker-dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Worker
                </Link>
              )}
              <button
                onClick={() => void signOut()}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link to="/register" className="text-sm font-medium px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Sign Up</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-strong border-t border-border overflow-hidden">
            <div className="flex flex-col gap-4 p-4">
              {navLinks.map((l) => (
                <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-primary">{l.label}</Link>
              ))}
              {user ? (
                <>
                  {isWorker && <Link to="/worker-dashboard" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Worker Dashboard</Link>}
                  {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Admin Panel</Link>}
                  <button onClick={() => { signOut(); setOpen(false); }} className="text-sm text-muted-foreground hover:text-destructive text-left">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="text-sm px-5 py-2 rounded-lg bg-primary text-primary-foreground text-center">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
