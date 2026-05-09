import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Briefcase, DollarSign, MapPin } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { exampleServices } from "@/data/exampleWorkers";
import { isMissingWorkersTableError, upsertDemoWorker } from "@/data/demoWorkers";

const defaultSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

const BecomeWorker = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [availableSlots, setAvailableSlots] = useState(defaultSlots.join(", "));
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Tables<"services">[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from("services").select("*").order("title");
      setServices((data && data.length > 0 ? data : exampleServices) || []);
    };

    void fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!name || !selectedSkill || !price) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const parsedSlots = availableSlots
      .split(",")
      .map((slot) => slot.trim())
      .filter(Boolean);

    if (parsedSlots.length === 0) {
      toast({ title: "Please add at least one available slot", variant: "destructive" });
      return;
    }

    setLoading(true);
    const workerPayload = {
      user_id: user.uid,
      name,
      phone,
      skill: selectedSkill,
      experience: experience ? `${experience} yrs` : null,
      price: parseInt(price, 10),
      location,
      bio,
      available_slots: parsedSlots,
    };

    const { error } = await supabase.from("workers").insert(workerPayload);
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "You already have a worker profile", variant: "destructive" });
      } else if (isMissingWorkersTableError(error)) {
        const demoWorker = upsertDemoWorker({
          userId: user.uid,
          name,
          phone,
          skill: selectedSkill,
          experience: experience ? `${experience} yrs` : "",
          price: parseInt(price, 10),
          location,
          bio,
          availableSlots: parsedSlots,
        });
        await refreshProfile();
        toast({
          title: "Application saved locally",
          description: "Supabase is missing the workers table, so your profile was stored in demo mode.",
        });
        navigate("/worker-dashboard");
      } else {
        toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      }
    } else {
      await refreshProfile();
      toast({ title: "Application submitted!", description: "Your profile is pending verification." });
      navigate("/worker-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-hero bg-glow">
      <section className="pt-28 pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold mb-3">
              Become a <span className="gradient-text">Worker</span>
            </h1>
            <p className="text-muted-foreground">Join our platform and start earning. Fill out the form below to apply.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-8 space-y-5"
            onSubmit={handleSubmit}
          >
            {[
              { icon: User, label: "Full Name *", placeholder: "Your name", value: name, setter: setName, type: "text" },
              { icon: Phone, label: "Phone Number", placeholder: "+91...", value: phone, setter: setPhone, type: "tel" },
            ].map(({ icon: Icon, label, placeholder, value, setter, type }) => (
              <div key={label}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <div className="glass rounded-xl flex items-center gap-3 px-4 py-3">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Skill *</label>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedSkill(service.title)}
                    className={`text-xs px-4 py-2 rounded-xl transition-all ${
                      selectedSkill === service.title
                        ? "bg-primary text-primary-foreground"
                        : "glass glass-hover text-muted-foreground"
                    }`}
                  >
                    {service.title}
                  </button>
                ))}
              </div>
              {services.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Services will appear here after Supabase is seeded.
                </p>
              )}
            </div>

            {[
              { icon: Briefcase, label: "Experience (years)", placeholder: "e.g., 5", value: experience, setter: setExperience, type: "number" },
              { icon: DollarSign, label: "Price per hour (Rs.) *", placeholder: "e.g., 400", value: price, setter: setPrice, type: "number" },
              { icon: MapPin, label: "Location", placeholder: "e.g., Mumbai", value: location, setter: setLocation, type: "text" },
            ].map(({ icon: Icon, label, placeholder, value, setter, type }) => (
              <div key={label}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                <div className="glass rounded-xl flex items-center gap-3 px-4 py-3">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bio</label>
              <textarea
                placeholder="Tell customers about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full glass rounded-xl px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Available Slots *</label>
              <input
                type="text"
                placeholder="9:00 AM, 10:00 AM, 2:00 PM"
                value={availableSlots}
                onChange={(e) => setAvailableSlots(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">Separate each time slot with a comma.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </motion.form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeWorker;
