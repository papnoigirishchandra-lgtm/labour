import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Settings, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { BOOKING_STATUS, STATUS_COLORS } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";
import { getDemoBookingsForUser } from "@/data/demoBookings";

type Booking = Tables<"bookings"> & {
  workers: { name: string; skill: string; photo: string | null } | null;
  source?: "supabase" | "demo";
};

const Dashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    bookingId: "",
    isLoading: false,
  });

  const fetchBookings = useCallback(async () => {
    if (!user) return;

    const [{ data }, demoBookings] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, workers(name, skill, photo)")
        .eq("user_id", user.uid)
        .order("booking_date", { ascending: false }),
      getDemoBookingsForUser(user.uid),
    ]);

    const liveBookings = ((data as Booking[]) || []).map((booking) => ({ ...booking, source: "supabase" as const }));
    setBookings([...demoBookings, ...liveBookings].sort((a, b) => b.booking_date.localeCompare(a.booking_date)));
  }, [user]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setAddress(profile?.address || "");
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address })
      .eq("user_id", user!.uid);
    await refreshProfile();
    setSaving(false);
    setEditMode(false);
  };

  const handleUnbookConfirm = async () => {
    const { bookingId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      setConfirmDialog((prev) => ({ ...prev, open: false, isLoading: false }));
      return;
    }

    if (booking.source === "demo") {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } else {
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      await fetchBookings();
    }

    setConfirmDialog((prev) => ({ ...prev, open: false, isLoading: false }));
  };

  const handleUnbook = (bookingId: string) => {
    setConfirmDialog({
      open: true,
      bookingId,
      isLoading: false,
    });
  };

  const upcoming = bookings.filter((booking) =>
    [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS].includes(booking.status),
  );
  const past = bookings.filter((booking) =>
    [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED].includes(booking.status)
  );
  const displayBookings = tab === "upcoming" ? upcoming : past;

  const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "";
  };

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold mb-8">
            My <span className="gradient-text">Dashboard</span>
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 lg:col-span-1 self-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{profile?.full_name || "User"}</h3>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full glass rounded-xl px-3 py-2 bg-transparent text-sm text-foreground outline-none"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full glass rounded-xl px-3 py-2 bg-transparent text-sm text-foreground outline-none"
                  />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full glass rounded-xl px-3 py-2 bg-transparent text-sm text-foreground outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex-1 px-4 py-2 rounded-xl glass text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {profile?.phone && <p>Phone: {profile.phone}</p>}
                  {profile?.address && <p>Address: {profile.address}</p>}
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-primary text-xs mt-2">
                    <Settings className="w-3 h-3" /> Edit Profile
                  </button>
                </div>
              )}

              <button
                onClick={() => void signOut()}
                className="w-full mt-4 flex items-center justify-center gap-2 glass glass-hover rounded-xl px-4 py-2 text-xs text-muted-foreground"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex gap-2">
                {(["upcoming", "past"] as const).map((section) => (
                  <button
                    key={section}
                    onClick={() => setTab(section)}
                    className={`text-xs px-4 py-2 rounded-xl transition-all capitalize ${
                      tab === section ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                    }`}
                  >
                    {section} ({section === "upcoming" ? upcoming.length : past.length})
                  </button>
                ))}
              </div>

              {displayBookings.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                  <p>No {tab} bookings.</p>
                </div>
              ) : (
                displayBookings.map((booking) => (
                  <div key={booking.id} className="glass rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display font-semibold">{booking.workers?.name || "Worker"}</h4>
                        <p className="text-xs text-primary">{booking.service}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm font-display font-bold">Rs. {booking.total_price}</div>
                      {[BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status) && (
                        <button
                          onClick={() => handleUnbook(booking.id)}
                          className="text-xs px-3 py-1 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />

      <ConfirmationDialog
        open={confirmDialog.open}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        action="Cancel Booking"
        onConfirm={handleUnbookConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        isDestructive={true}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
};

export default Dashboard;
