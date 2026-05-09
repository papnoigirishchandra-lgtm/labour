import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Calendar, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { bookingSchema, type BookingFormData } from "@/lib/validationSchemas";
import { ErrorCard } from "@/components/ErrorCard";
import { getSupabaseErrorMessage } from "@/lib/errors";
import { BOOKING_TIME_SLOTS, BOOKING_SERVICE_FEE, BOOKING_STATUS } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";
import { addDemoBooking } from "@/data/demoBookings";
import { findExampleWorkerById, isExampleWorkerId } from "@/data/exampleWorkers";
import { getDemoWorkerById } from "@/data/demoWorkers";

type Worker = Tables<"workers"> & { source?: "supabase" | "example" | "demo" };

const Booking = () => {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const minDate = getMinDate();

  const validateForm = (): boolean => {
    try {
      bookingSchema.parse({
        selectedDate,
        selectedSlot,
        address,
        description,
      });
      setErrors({});
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && "errors" in err) {
        const zodErrors = (err as Record<string, unknown>).errors as Array<{ path: string[]; message: string }>;
        const newErrors: Record<string, string> = {};
        zodErrors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  useEffect(() => {
    const fetchWorker = async () => {
      if (!workerId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("workers").select("*").eq("id", workerId).maybeSingle();
      const exampleWorker = findExampleWorkerById(workerId);
      const resolvedWorker =
        (data ? { ...data, source: "supabase" as const } : null) ??
        getDemoWorkerById(workerId) ??
        (exampleWorker ? { ...exampleWorker, source: "example" as const } : null);

      setWorker(resolvedWorker);
      setLoading(false);
    };

    void fetchWorker();
  }, [workerId]);

  const handleBooking = async () => {
    setApiError(null);

    if (!user) {
      toast({ title: "Please log in to book", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!worker) {
      toast({ title: "Worker not found", variant: "destructive" });
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);

    if (worker.source === "demo" || worker.source === "example" || isExampleWorkerId(worker.id)) {
      addDemoBooking({
        id: `demo-booking-${crypto.randomUUID()}`,
        user_id: user.uid,
        worker_id: worker.id,
        service: worker.skill,
        booking_date: selectedDate,
        time_slot: selectedSlot,
        address,
        description,
        latitude: null,
        longitude: null,
        status: "pending",
        total_price: worker.price + BOOKING_SERVICE_FEE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        workers: {
          name: worker.name,
          skill: worker.skill,
          photo: worker.photo ?? null,
        },
        source: "demo",
      });
      setSubmitting(false);
      toast({ title: "Demo booking confirmed!", description: "Your booking was saved locally because Supabase has not been seeded yet." });
      navigate("/dashboard");
    } else {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.uid,
        worker_id: worker.id,
        service: worker.skill,
        booking_date: selectedDate,
        time_slot: selectedSlot,
        address,
        description,
        total_price: worker.price + BOOKING_SERVICE_FEE,
      });
      setSubmitting(false);

      if (error) {
        const friendlyMessage = getSupabaseErrorMessage(error);
        setApiError(friendlyMessage);
        toast({ title: "Booking failed", description: friendlyMessage, variant: "destructive" });
      } else {
        toast({ title: "Booking confirmed!", description: "Check your dashboard for details." });
        navigate("/dashboard");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <p className="text-muted-foreground">Worker not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <Link
            to={`/worker/${worker.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to profile
          </Link>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold mb-8">
            Book <span className="gradient-text">{worker.name}</span>
          </motion.h1>

          {apiError && <ErrorCard message={apiError} onDismiss={() => setApiError(null)} className="mb-6" />}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Select Date
                </h3>
                <div>
                  <input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (errors.selectedDate) setErrors({ ...errors, selectedDate: "" });
                    }}
                    className={`w-full glass rounded-xl px-4 py-3 bg-transparent text-foreground text-sm outline-none transition-colors ${
                      errors.selectedDate ? "ring-2 ring-destructive" : ""
                    }`}
                  />
                  {errors.selectedDate && <p className="text-xs text-destructive mt-1">{errors.selectedDate}</p>}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Select Time
                </h3>
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BOOKING_TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setSelectedSlot(slot);
                          if (errors.selectedSlot) setErrors({ ...errors, selectedSlot: "" });
                        }}
                        className={`text-xs px-3 py-2.5 rounded-xl transition-all ${
                          selectedSlot === slot
                            ? "bg-primary text-primary-foreground"
                            : "glass glass-hover text-muted-foreground"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.selectedSlot && <p className="text-xs text-destructive mt-2">{errors.selectedSlot}</p>}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 space-y-4"
              >
                <h3 className="font-display font-semibold">Details</h3>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Address *</label>
                  <input
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                    className={`w-full glass rounded-xl px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground transition-colors ${
                      errors.address ? "ring-2 ring-destructive" : ""
                    }`}
                  />
                  {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Problem Description</label>
                  <textarea
                    placeholder="Describe the work you need done..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: "" });
                    }}
                    rows={4}
                    className={`w-full glass rounded-xl px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground resize-none transition-colors ${
                      errors.description ? "ring-2 ring-destructive" : ""
                    }`}
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl p-5 sticky top-24">
                <img
                  src={worker.photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"}
                  alt={worker.name}
                  className="w-full aspect-square object-cover rounded-xl mb-4"
                />
                <h3 className="font-display font-semibold">{worker.name}</h3>
                <p className="text-sm text-primary">{worker.skill}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {worker.rating || "N/A"}
                  <MapPin className="w-3 h-3 ml-2" /> {worker.location}
                </div>

                <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Rate</span>
                    <span>Rs. {worker.price}/hr</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service fee</span>
                    <span>Rs. {BOOKING_SERVICE_FEE}</span>
                  </div>
                  <div className="flex justify-between font-display font-bold text-foreground text-base border-t border-border pt-2">
                    <span>Total</span>
                    <span>Rs. {worker.price + BOOKING_SERVICE_FEE}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={submitting || !selectedDate || !selectedSlot || !address}
                  className="w-full mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary disabled:opacity-50"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Booking;
