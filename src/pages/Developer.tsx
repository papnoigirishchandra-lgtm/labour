import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { Code2, Globe, ImagePlus, RotateCcw, Sparkles, UserRound, Mail, Send } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
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
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSending(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      toast.success("Message sent successfully! I'll get back to you soon.");
      formRef.current.reset();
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
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

      <section id="contact" className="relative z-10 px-4 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-[2rem] p-8 md:p-12">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="font-display text-3xl font-bold">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Have a question about Krishiseva or want to discuss a project? 
                  Fill out the form and I'll get back to you as soon as possible.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Response time: Within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Focus: Custom web development</span>
                  </div>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="user_name" className="text-sm font-medium">Name</label>
                  <input
                    id="user_name"
                    name="user_name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="user_email" className="text-sm font-medium">Email</label>
                  <input
                    id="user_email"
                    name="user_email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="How can I help you?"
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 glow-primary"
                >
                  {isSending ? (
                    <div className="h-5 w-5 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Developer;
