import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, MapPin, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterFormData, checkPasswordStrength } from "@/lib/validationSchemas";
import { ErrorCard } from "@/components/ErrorCard";
import { getSupabaseErrorMessage } from "@/lib/errors";
import { registerUser } from "@/integrations/firebase.auth";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "", isStrong: false });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

  const validateForm = (): boolean => {
    try {
      registerSchema.parse({
        fullName,
        phone,
        email,
        address,
        password,
        confirmPassword,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setLoading(true);
    const result = await registerUser(email, password, fullName);
    setLoading(false);

    if (result.success && result.user) {
      // Store additional user data in Supabase
      try {
        await supabase.from("profiles").upsert({
          user_id: result.user.uid,
          full_name: fullName,
          phone: phone || null,
          address: address || null,
        });
      } catch (profileError) {
        console.warn("Could not save profile data:", profileError);
      }

      toast({ title: "Account created!", description: "Welcome to Krishiseva!" });
      navigate("/dashboard");
    } else {
      setApiError(result.error || "Registration failed");
      toast({ title: "Registration failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-hero bg-glow flex items-center justify-center px-4 py-28">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="font-display text-2xl font-bold text-center mb-2">Create <span className="gradient-text">Account</span></h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Join Krishiseva today</p>

        {apiError && <ErrorCard message={apiError} onDismiss={() => setApiError(null)} className="mb-6" />}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.fullName ? "ring-2 ring-destructive" : ""
            }`}>
              <User className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.phone ? "ring-2 ring-destructive" : ""
            }`}>
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.email ? "ring-2 ring-destructive" : ""
            }`}>
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.address ? "ring-2 ring-destructive" : ""
            }`}>
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: "" });
                }}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
          </div>

          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.password ? "ring-2 ring-destructive" : ""
            }`}>
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength.score ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-colors ${
              errors.confirmPassword ? "ring-2 ring-destructive" : ""
            }`}>
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-primary disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
