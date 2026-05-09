/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthChange, logoutUser } from "@/integrations/firebase.auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getDemoWorkerForUser, isMissingWorkersTableError } from "@/data/demoWorkers";

type Profile = Tables<"profiles">;
type AppRole = "admin" | "moderator" | "user";

interface AuthContextType {
  user: FirebaseUser | null;
  session: null; // Firebase doesn't use sessions like Supabase
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isWorker: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWorker, setIsWorker] = useState(false);

  const getProfileSeed = useCallback((currentUser: FirebaseUser) => {
    return {
      user_id: currentUser.uid,
      full_name: currentUser.displayName || currentUser.email?.split("@")[0] || null,
      phone: null,
      address: null,
      avatar_url: currentUser.photoURL || null,
    };
  }, []);

  const ensureBootstrapRecords = useCallback(async (currentUser: FirebaseUser) => {
    const [{ data: existingProfile }, { data: existingRoles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", currentUser.uid).maybeSingle(),
      supabase.from("user_roles").select("id").eq("user_id", currentUser.uid).eq("role", "user"),
    ]);

    if (!existingProfile) {
      const { error } = await supabase.from("profiles").insert(getProfileSeed(currentUser));
      if (error) {
        console.warn("Could not create profile row for current user", error);
      }
    } else {
      const seed = getProfileSeed(currentUser);
      const updates: Partial<typeof seed> = {};

      if (!existingProfile.full_name && seed.full_name) updates.full_name = seed.full_name;
      if (!existingProfile.avatar_url && seed.avatar_url) updates.avatar_url = seed.avatar_url;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", currentUser.uid);
        if (error) {
          console.warn("Could not backfill profile row for current user", error);
        }
      }
    }

    if ((existingRoles?.length || 0) === 0) {
      const { error } = await supabase.from("user_roles").insert({
        user_id: currentUser.uid,
        role: "user",
      });
      if (error) {
        console.warn("Could not create default user role", error);
      }
    }
  }, [getProfileSeed]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data?.map((r) => r.role) || []);
  }, []);

  const checkWorker = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("workers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setIsWorker(true);
      return;
    }

    const hasLocalWorker = !!getDemoWorkerForUser(userId);
    if (hasLocalWorker || isMissingWorkersTableError(error)) {
      setIsWorker(hasLocalWorker);
      return;
    }

    setIsWorker(false);
  }, []);

  const loadUserState = useCallback(async (currentUser: FirebaseUser | null) => {
    if (!currentUser) {
      setProfile(null);
      setRoles([]);
      setIsWorker(false);
      setLoading(false);
      return;
    }

    await ensureBootstrapRecords(currentUser);
    await Promise.all([
      fetchProfile(currentUser.uid),
      fetchRoles(currentUser.uid),
      checkWorker(currentUser.uid),
    ]);
    setLoading(false);
  }, [checkWorker, ensureBootstrapRecords, fetchProfile, fetchRoles]);

  const refreshProfile = async () => {
    await loadUserState(user);
  };

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      setTimeout(() => {
        void loadUserState(currentUser);
      }, 0);
    });

    return () => unsubscribe();
  }, [loadUserState]);

  const signOut = async () => {
    await logoutUser();
  };

  const isAdmin = roles.includes("admin");

  return (
    <AuthContext.Provider value={{ user, session: null, profile, roles, loading, isAdmin, isWorker, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
