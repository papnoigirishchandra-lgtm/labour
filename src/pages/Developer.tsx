import { useEffect, useState, type ChangeEvent } from "react";
import { Code2, Globe, ImagePlus, RotateCcw, Sparkles, UserRound } from "lucide-react";
import Footer from "@/components/Footer";

const defaultDeveloperImage = `${import.meta.env.BASE_URL}girish-chandra.svg`;
const imageStorageKey = "krishiseva-developer-image";

const highlights = [
  {
    title: "Name",
    value: "Girish Chandra",
    icon: UserRound,
  },
  {
    title: "Role",
    value: "Developer of Krishiseva",
    icon: Code2,
  },
  {
    title: "Focus",
    value: "Clean UI, reliable booking flows, and worker-friendly experiences",
    icon: Sparkles,
  },
  {
    title: "Project",
    value: "Krishiseva web platform",
    icon: Globe,
  },
];

const Developer = () => {
  const [developerImage, setDeveloperImage] = useState(defaultDeveloperImage);

  useEffect(() => {
    const savedImage = window.localStorage.getItem(imageStorageKey);
    if (savedImage) {
      setDeveloperImage(savedImage);
    }
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setDeveloperImage(result);
      window.localStorage.setItem(imageStorageKey, result);
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    window.localStorage.removeItem(imageStorageKey);
    setDeveloperImage(defaultDeveloperImage);
  };

  return (
    <div className="min-h-screen bg-hero bg-glow text-foreground">
      <section className="relative z-10 px-4 pb-20 pt-28">
        <div className="container mx-auto grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Developer</p>
            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Built by <span className="gradient-text">Girish Chandra</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              This page introduces the developer behind Krishiseva. It is ready to show your photo and can be updated anytime with more personal details, contact links, or portfolio work.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.title} className="glass rounded-2xl p-5">
                  <item.icon className="mb-4 h-6 w-6 text-primary" />
                  <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.title}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong mx-auto w-full max-w-md rounded-[2rem] p-6">
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
              <img
                src={developerImage}
                alt="Portrait placeholder for Girish Chandra"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Developer;
