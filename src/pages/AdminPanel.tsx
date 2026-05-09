import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, CheckCircle, XCircle, Shield, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type Worker = Tables<"workers">;
type Booking = Tables<"bookings">;

const AdminPanel = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"workers" | "bookings" | "users">("workers");
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);

  useEffect(() => {
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    const [workersResponse, bookingsResponse, profilesResponse] = await Promise.all([
      supabase.from("workers").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setWorkers(workersResponse.data || []);
    setBookings(bookingsResponse.data || []);
    setProfiles(profilesResponse.data || []);
  };

  const toggleVerification = async (workerId: string, currentStatus: boolean | null) => {
    await supabase.from("workers").update({ is_verified: !currentStatus }).eq("id", workerId);
    await fetchAll();
  };

  const stats = [
    { icon: Users, label: "Total Users", value: profiles.length },
    { icon: Briefcase, label: "Workers", value: workers.length },
    { icon: CheckCircle, label: "Verified", value: workers.filter((worker) => worker.is_verified).length },
    { icon: Calendar, label: "Bookings", value: bookings.length },
  ];

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold mb-8">
            <Shield className="inline w-8 h-8 text-primary mr-2" />
            Admin <span className="gradient-text">Panel</span>
          </motion.h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            {(["workers", "bookings", "users"] as const).map((section) => (
              <button
                key={section}
                onClick={() => setTab(section)}
                className={`text-xs px-4 py-2 rounded-xl transition-all capitalize ${
                  tab === section ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {tab === "workers" && (
            <div className="space-y-3">
              {workers.map((worker) => (
                <div key={worker.id} className="glass rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {worker.photo ? (
                      <img src={worker.photo} alt={worker.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-display font-semibold">{worker.name}</h4>
                      <p className="text-xs text-primary">{worker.skill}</p>
                      <p className="text-xs text-muted-foreground">
                        {worker.location} | Rs. {worker.price}/hr
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleVerification(worker.id, worker.is_verified)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      worker.is_verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {worker.is_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Unverified
                      </>
                    )}
                  </button>
                </div>
              ))}
              {workers.length === 0 && <p className="text-center text-muted-foreground py-12">No workers yet.</p>}
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display font-semibold">{booking.service}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {booking.booking_date} | {booking.time_slot}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        booking.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "cancelled"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-primary"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {booking.address}
                  </p>
                  <p className="text-sm font-display font-bold mt-2">Rs. {booking.total_price}</p>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-center text-muted-foreground py-12">No bookings yet.</p>}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div key={profile.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm">{profile.full_name || "Unnamed"}</h4>
                    <p className="text-xs text-muted-foreground">
                      {profile.phone || "No phone"} | {profile.address || "No address"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && <p className="text-center text-muted-foreground py-12">No users yet.</p>}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminPanel;
