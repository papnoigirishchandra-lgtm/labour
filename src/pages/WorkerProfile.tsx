import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ArrowLeft, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { findExampleWorkerById, getExampleReviews, isExampleWorkerId } from "@/data/exampleWorkers";
import { getDemoWorkerById } from "@/data/demoWorkers";

type Worker = Tables<"workers">;
type Review = Tables<"reviews">;

const WorkerProfile = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data: workerRecord } = await supabase.from("workers").select("*").eq("id", id).maybeSingle();
      const resolvedWorker =
        workerRecord ??
        getDemoWorkerById(id) ??
        (isExampleWorkerId(id) ? findExampleWorkerById(id) : null);
      setWorker(resolvedWorker);

      if (resolvedWorker && workerRecord) {
        const { data: reviewRecords } = await supabase
          .from("reviews")
          .select("*")
          .eq("worker_id", resolvedWorker.id)
          .order("created_at", { ascending: false });
        setReviews(reviewRecords || []);
      } else if (resolvedWorker) {
        setReviews(getExampleReviews(resolvedWorker.id));
      }

      setLoading(false);
    };

    void fetchWorkerProfile();
  }, [id]);

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

  const fakeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const availableSlots = worker.available_slots?.length ? worker.available_slots : fakeSlots;
  const mapWorkers =
    worker.latitude && worker.longitude
      ? [
          {
            id: worker.id,
            name: worker.name,
            skill: worker.skill,
            lat: worker.latitude,
            lng: worker.longitude,
            rating: worker.rating,
            price: worker.price,
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/workers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to workers
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src={worker.photo || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"}
                  alt={worker.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="p-8 md:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold">{worker.name}</h1>
                    <p className="text-primary font-medium">{worker.skill}</p>
                    {worker.is_verified && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="w-5 h-5 fill-primary" />
                    <span className="font-display font-bold text-lg">{worker.rating || "N/A"}</span>
                    <span className="text-sm text-muted-foreground">
                      ({worker.reviews_count || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {worker.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {worker.experience} experience
                  </span>
                </div>

                {worker.bio && (
                  <div className="mb-6">
                    <h3 className="font-display font-semibold mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{worker.bio}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Available Slots
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        className="text-xs px-4 py-2 rounded-xl glass glass-hover text-muted-foreground hover:text-foreground transition-all"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <span className="font-display text-2xl font-bold">
                    Rs. {worker.price}
                    <span className="text-sm text-muted-foreground font-normal">/hr</span>
                  </span>
                  <Link
                    to={`/booking/${worker.id}`}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {mapWorkers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6"
            >
              <h3 className="font-display font-semibold mb-3">Service Area</h3>
              <MapView
                workers={mapWorkers}
                center={[worker.latitude!, worker.longitude!]}
                zoom={12}
                showServiceArea={true}
                className="h-[300px] w-full rounded-2xl overflow-hidden border border-border"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8 mt-6"
          >
            <h3 className="font-display text-xl font-semibold mb-6">Reviews ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
              {reviews.map((review) => (
                <div key={review.id} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-3.5 h-3.5 ${
                          index < review.rating ? "fill-primary text-primary" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Customer</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default WorkerProfile;
