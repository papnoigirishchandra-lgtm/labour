import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getServiceIcon } from "@/lib/service-icons";
import { exampleServices } from "@/data/exampleWorkers";

const Services = () => {
  const [services, setServices] = useState<Tables<"services">[]>([]);

  useEffect(() => {
    supabase.from("services").select("*").order("title").then(({ data }) => {
      setServices((data && data.length > 0 ? data : exampleServices) || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Our <span className="gradient-text">Services</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Browse all available services and find the right professional for your needs.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-stretch">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={getServiceIcon(service.title, service.icon)}
                description={service.description || ""}
                delay={index * 0.1}
              />
            ))}
          </div>
          {services.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              No services found in Supabase yet.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Services;
