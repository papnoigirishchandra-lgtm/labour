import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Map,
  ShieldCheck,
  Star,
  CreditCard,
  ArrowRight,
  Quote,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getServiceIcon } from "@/lib/service-icons";
import { exampleServices } from "@/data/exampleWorkers";
import { testimonials as mockTestimonials } from "@/data/mockData";
import MapView from "@/components/MapView";
import { DEFAULT_LOCATION, geocodeLocation, getBrowserLocation, reverseGeocodeLocation } from "@/lib/location";

const steps = [
  { num: "01", title: "Search", desc: "Enter your location and select the service you need." },
  { num: "02", title: "Choose", desc: "Browse verified workers, compare ratings and prices." },
  { num: "03", title: "Book", desc: "Pick a time slot and confirm your booking instantly." },
];

type Service = Tables<"services">;
type ReviewWithWorker = Tables<"reviews"> & {
  workers: Pick<Tables<"workers">, "location"> | null;
};

const Index = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [selectedService, setSelectedService] = useState("All Services");
  const [services, setServices] = useState<Service[]>(exampleServices);
  const [testimonials, setTestimonials] = useState<
    Array<{ id: string; name: string; text: string; rating: number; location: string }>
  >(mockTestimonials);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const geocodeRequestId = useRef(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      const [servicesResponse, reviewsResponse] = await Promise.all([
        supabase.from("services").select("*").order("title"),
        supabase
          .from("reviews")
          .select("id, comment, rating, workers(location)")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      setServices((servicesResponse.data && servicesResponse.data.length > 0 ? servicesResponse.data : exampleServices) || []);

      const normalizedTestimonials = ((reviewsResponse.data || []) as ReviewWithWorker[])
        .filter((review) => review.comment)
        .map((review, index) => ({
          id: review.id,
          name: `Verified Customer ${index + 1}`,
          text: review.comment || "",
          rating: review.rating,
          location: review.workers?.location || "Krishiseva",
        }));

      setTestimonials(normalizedTestimonials.length > 0 ? normalizedTestimonials : mockTestimonials);
    };

    void fetchHomeData();
  }, []);

  useEffect(() => {
    const query = location.trim();
    if (query.length < 3) return;

    const timeout = window.setTimeout(() => {
      const requestId = ++geocodeRequestId.current;

      void (async () => {
        const result = await geocodeLocation(query);
        if (requestId !== geocodeRequestId.current || !result) return;

        setMapCenter([result.lat, result.lng]);
        setSelectedLocation(result);
      })();
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [location]);

  const serviceOptions = useMemo(() => ["All Services", ...services.map((service) => service.title)], [services]);

  const openLocationMap = async () => {
    setIsMapOpen(true);
    setMapLoading(true);

    const liveCoordinates = await getBrowserLocation();
    if (liveCoordinates) {
      setMapCenter([liveCoordinates.lat, liveCoordinates.lng]);
      setSelectedLocation({
        lat: liveCoordinates.lat,
        lng: liveCoordinates.lng,
        label: "Your live location",
      });
      if (!location.trim()) {
        const liveLabel = await reverseGeocodeLocation(liveCoordinates);
        if (liveLabel) {
          setLocation(liveLabel);
          setSelectedLocation({
            lat: liveCoordinates.lat,
            lng: liveCoordinates.lng,
            label: liveLabel,
          });
        }
      }
    }

    setMapLoading(false);
  };

  const handleMapClick = async ({ lat, lng }: { lat: number; lng: number }) => {
    const label = await reverseGeocodeLocation({ lat, lng });
    setMapCenter([lat, lng]);
    setSelectedLocation({
      lat,
      lng,
      label: label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    });
    setLocation(label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  const handleFindWorkers = () => {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (selectedService !== "All Services") {
      params.set("service", selectedService.toLowerCase().replace(/\s+/g, "-"));
    }

    navigate({
      pathname: "/workers",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="relative pt-32 pb-20 px-4">
        <div className="relative z-10 container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Book Trusted <span className="gradient-text">Labour</span>
              <br />Near You
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Find verified professionals for every job. From electricians to carpenters,
              skilled workers at your doorstep.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-strong rounded-2xl p-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="flex items-center gap-2 flex-1 bg-muted/30 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Enter your location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setIsMapOpen(true);
                }}
                onFocus={() => setIsMapOpen(true)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
              <button
                type="button"
                onClick={() => void openLocationMap()}
                className="ml-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary"
                aria-label="Open map"
                title="Open map"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
            <label className="flex items-center gap-2 flex-1 bg-muted/30 rounded-xl px-4 py-3 cursor-pointer">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service} className="bg-slate-900">
                    {service}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleFindWorkers}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 glow-primary"
            >
              Find Workers
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {isMapOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 px-4 py-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-strong mx-auto w-full max-w-5xl rounded-3xl p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold">Pick your location</h3>
                <p className="text-sm text-muted-foreground">
                  Type an address, click the map, or use your live location.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="rounded-xl glass px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                {mapLoading && (
                  <div className="rounded-2xl glass p-4 text-xs text-muted-foreground">
                    Getting your live location...
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search a city, area, or landmark"
                    className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void openLocationMap()}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Use my live location
                </button>

                <div className="rounded-2xl glass p-4 text-sm text-muted-foreground">
                  {selectedLocation ? (
                    <>
                      <p className="font-medium text-foreground">Selected location</p>
                      <p className="mt-1">{selectedLocation.label || `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`}</p>
                    </>
                  ) : (
                    <p>Click a spot on the map to fill the location field.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="w-full rounded-xl glass px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  Add location
                </button>
              </div>

              <MapView
                center={mapCenter}
                zoom={selectedLocation ? 14 : 5}
                selectedLocation={selectedLocation}
                onMapClick={handleMapClick}
                className="h-[420px] w-full overflow-hidden rounded-3xl border border-border"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Popular <span className="gradient-text">Services</span>
            </h2>
            <p className="text-muted-foreground">Choose from our most requested services</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={getServiceIcon(service.title, service.icon)}
                description={service.description || ""}
                delay={index * 0.08}
              />
            ))}
          </div>
          {services.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Services will appear here after Supabase is seeded.
            </p>
          )}
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="glass rounded-2xl p-8 text-center relative"
              >
                <span className="font-display text-5xl font-bold text-primary/20 absolute top-4 right-6">
                  {step.num}
                </span>
                <h3 className="font-display text-xl font-semibold mb-2 mt-4">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Why Choose <span className="gradient-text">Us</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Workers",
                desc: "Every worker is background-checked and ID verified for your safety.",
              },
              {
                icon: Star,
                title: "Rated and Reviewed",
                desc: "Transparent ratings and reviews from real customers.",
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                desc: "Pay securely through the platform. No cash hassles.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="glass glass-hover rounded-2xl p-8 text-center transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              What People <span className="gradient-text">Say</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{testimonial.text}</p>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-display font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
              </motion.div>
            ))}
          </div>
          {testimonials.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Customer reviews will appear here after people start booking and leaving feedback.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
