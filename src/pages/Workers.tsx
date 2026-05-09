import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Map as MapIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import WorkerCard from "@/components/WorkerCard";
import MapView from "@/components/MapView";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { exampleServices, exampleWorkers } from "@/data/exampleWorkers";
import { getAllDemoWorkers } from "@/data/demoWorkers";

type Worker = Tables<"workers">;

const normalizeServiceParam = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const Workers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<Worker[]>(exampleWorkers);
  const [services, setServices] = useState<Tables<"services">[]>(exampleServices);
  const [selectedService, setSelectedService] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const requestedService = searchParams.get("service");
    const requestedLocation = searchParams.get("location");
    setSelectedService(requestedService ? normalizeServiceParam(requestedService) : "All");
    setSelectedLocation(requestedLocation ? requestedLocation.trim() : "");
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const [workersResponse, servicesResponse] = await Promise.all([
        supabase.from("workers").select("*"),
        supabase.from("services").select("*").order("title"),
      ]);

      const liveWorkers = workersResponse.data && workersResponse.data.length > 0 ? workersResponse.data : exampleWorkers;
      const localWorkers = getAllDemoWorkers();
      const mergedWorkers = [...liveWorkers, ...localWorkers].filter(
        (worker, index, array) => array.findIndex((candidate) => candidate.id === worker.id) === index,
      );

      setWorkers(mergedWorkers || []);
      setServices((servicesResponse.data && servicesResponse.data.length > 0 ? servicesResponse.data : exampleServices) || []);
    };

    void fetchData();
  }, []);

  const serviceOptions = useMemo(() => {
    const titles = new Set<string>(["All"]);
    services.forEach((service) => titles.add(service.title));
    workers.forEach((worker) => titles.add(worker.skill));
    return Array.from(titles);
  }, [services, workers]);

  const filtered = useMemo(() => {
    const list = workers.filter((worker) => {
      if (selectedService !== "All" && worker.skill !== selectedService) return false;
      if ((worker.rating || 0) < minRating) return false;
      if (selectedLocation && !(worker.location || "").toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }
      return true;
    });

    if (sortBy === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list.sort((a, b) => b.price - a.price);

    return list;
  }, [workers, selectedService, selectedLocation, minRating, sortBy]);

  const activeFilterCount =
    (selectedService !== "All" ? 1 : 0) + (minRating > 0 ? 1 : 0) + (selectedLocation ? 1 : 0);

  const mapWorkers = filtered
    .filter((worker) => worker.latitude && worker.longitude)
    .map((worker) => ({
      id: worker.id,
      name: worker.name,
      skill: worker.skill,
      lat: worker.latitude!,
      lng: worker.longitude!,
      rating: worker.rating,
      price: worker.price,
    }));

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Find <span className="gradient-text">Workers</span>
            </h1>
            <p className="text-muted-foreground">Browse verified professionals near you</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
            <div className="flex gap-2 flex-wrap justify-center">
              {serviceOptions.map((service) => (
                <button
                  key={service}
                  onClick={() => {
                    setSelectedService(service);
                    const nextParams = new URLSearchParams(searchParams);
                    if (service === "All") nextParams.delete("service");
                    else nextParams.set("service", service.toLowerCase().replace(/\s+/g, "-"));
                    setSearchParams(nextParams, { replace: true });
                  }}
                  className={`text-xs px-4 py-2 rounded-xl transition-all ${
                    selectedService === service ? "bg-primary text-primary-foreground" : "glass glass-hover text-muted-foreground"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass text-xs px-4 py-2 rounded-xl bg-transparent text-muted-foreground outline-none cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowMap(!showMap)}
              className="glass glass-hover text-xs px-4 py-2 rounded-xl text-muted-foreground flex items-center gap-1"
            >
              <MapIcon className="w-3.5 h-3.5" /> {showMap ? "Hide Map" : "Show Map"}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="glass glass-hover text-xs px-4 py-2 rounded-xl text-muted-foreground flex items-center gap-1 md:hidden"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>

          {showMap && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8">
              <MapView
                workers={mapWorkers}
                showServiceArea={true}
                className="h-[400px] w-full rounded-2xl overflow-hidden border border-border"
              />
            </motion.div>
          )}

          <div className="flex gap-8">
            <aside className={`w-56 shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
              <div className="glass rounded-2xl p-5 sticky top-24">
                <h3 className="font-display font-semibold text-sm mb-4">Filters</h3>
                {selectedLocation && (
                  <div className="mb-4 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
                    Location: {selectedLocation}
                  </div>
                )}
                <div className="mb-5">
                  <label className="text-xs text-muted-foreground mb-2 block">Min Rating</label>
                  <div className="flex gap-1">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          minRating === rating ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                        }`}
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                <p>
                  Showing <span className="text-foreground font-semibold">{filtered.length}</span> of{" "}
                  <span className="text-foreground font-semibold">{workers.length}</span> workers
                </p>
                {activeFilterCount > 0 && <p>{activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}</p>}
              </div>

              <div className="grid grid-cols-1 items-stretch sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
                {filtered.map((worker, index) => (
                  <WorkerCard
                    key={worker.id}
                    id={worker.id}
                    name={worker.name}
                    photo={worker.photo || ""}
                    rating={Number(worker.rating) || 0}
                    reviews={worker.reviews_count || 0}
                    experience={worker.experience || ""}
                    price={worker.price}
                    skill={worker.skill}
                    location={worker.location || ""}
                    delay={index * 0.06}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-20 text-muted-foreground">
                    <p>
                      {workers.length === 0
                        ? "Worker profiles will appear here after Supabase is seeded."
                        : "No workers found matching your criteria."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Workers;
