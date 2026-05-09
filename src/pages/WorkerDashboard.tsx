import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, DollarSign, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";
import { getDemoBookingsForWorker, removeDemoBookingsForWorker, updateDemoBookingStatus } from "@/data/demoBookings";
import { getDemoWorkerForUser, isMissingWorkersTableError, removeDemoWorkerForUser } from "@/data/demoWorkers";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Booking = Tables<"bookings">;
type Worker = Tables<"workers"> & { source?: "supabase" | "demo" };

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"pending" | "active" | "completed">("pending");
  const [removing, setRemoving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: workerRecord, error } = await supabase.from("workers").select("*").eq("user_id", user.uid).maybeSingle();
    const localWorker = getDemoWorkerForUser(user.uid);
    const resolvedWorker = (workerRecord ? { ...workerRecord, source: "supabase" as const } : null) ?? localWorker;

    if (resolvedWorker) {
      setWorker(resolvedWorker);
      if (resolvedWorker.source === "demo" || isMissingWorkersTableError(error)) {
        setBookings(getDemoBookingsForWorker(resolvedWorker.id) as Booking[]);
      } else {
        const { data: bookingRecords } = await supabase
          .from("bookings")
          .select("*")
          .eq("worker_id", resolvedWorker.id)
          .order("booking_date", { ascending: false });
        setBookings(bookingRecords || []);
      }
      return;
    }

    setWorker(null);
    setBookings([]);
  }, [user]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "in_progress" | "completed" | "cancelled",
  ) => {
    if (worker?.source === "demo") {
      updateDemoBookingStatus(bookingId, status);
      await fetchData();
      return;
    }

    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    await fetchData();
  };

  const handleRemoveProfile = async () => {
    if (!user || !worker) return;

    const confirmed = window.confirm(
      "Remove your labour profile from the website? This will hide your profile and delete related worker bookings.",
    );
    if (!confirmed) return;

    setRemoving(true);

    if (worker.source === "demo") {
      removeDemoBookingsForWorker(worker.id);
      removeDemoWorkerForUser(user.uid);
      await fetchData();
      setRemoving(false);
      toast({ title: "Profile removed", description: "Your demo labour profile has been removed from the website." });
      navigate("/dashboard");
      return;
    }

    const { error } = await supabase.from("workers").delete().eq("id", worker.id);
    setRemoving(false);

    if (error) {
      toast({ title: "Could not remove profile", description: error.message, variant: "destructive" });
      return;
    }

    await fetchData();
    toast({ title: "Profile removed", description: "Your labour profile has been removed from the website." });
    navigate("/dashboard");
  };

  const pending = bookings.filter((booking) => booking.status === "pending");
  const active = bookings.filter((booking) => ["confirmed", "in_progress"].includes(booking.status));
  const completed = bookings.filter((booking) => ["completed", "cancelled"].includes(booking.status));
  const displayBookings = tab === "pending" ? pending : tab === "active" ? active : completed;
  const totalEarnings = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.total_price, 0);

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold mb-8">
            Worker <span className="gradient-text">Dashboard</span>
          </motion.h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Briefcase, label: "Total Jobs", value: bookings.length },
              { icon: Clock, label: "Pending", value: pending.length },
              { icon: CheckCircle, label: "Completed", value: completed.filter((booking) => booking.status === "completed").length },
              { icon: DollarSign, label: "Earnings", value: `Rs. ${totalEarnings}` },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {worker && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleRemoveProfile}
                disabled={removing}
                className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove Labour Profile"}
              </button>
            </div>
          )}

          {!worker && (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground mb-6">
              Create a worker profile first to manage jobs from this dashboard.
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {(["pending", "active", "completed"] as const).map((section) => (
              <button
                key={section}
                onClick={() => setTab(section)}
                className={`text-xs px-4 py-2 rounded-xl transition-all capitalize ${
                  tab === section ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {section} ({section === "pending" ? pending.length : section === "active" ? active.length : completed.length})
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {displayBookings.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                No {tab} bookings.
              </div>
            ) : (
              displayBookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-display font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Customer
                      </h4>
                      <p className="text-xs text-primary">{booking.service}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {booking.booking_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {booking.time_slot}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {booking.address}
                    </span>
                  </div>
                  {booking.description && (
                    <p className="text-xs text-muted-foreground mb-3">Details: {booking.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold">Rs. {booking.total_price}</span>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 text-xs"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-destructive/20 text-destructive text-xs"
                        >
                          <XCircle className="w-3 h-3" /> Decline
                        </button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, "in_progress")}
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                      >
                        Start Job
                      </button>
                    )}
                    {booking.status === "in_progress" && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, "completed")}
                        className="px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 text-xs font-semibold"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default WorkerDashboard;
