
import React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/upsertProfile";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isNewUser: boolean;
  markUserAsReturning: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isNewUser, setIsNewUser] = React.useState(false);

  React.useEffect(() => {
    // Setup listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email || "no user");
      const prevSession = session;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Mark as new user if this is a first time sign in (no previous session)
      if (event === 'SIGNED_IN' && !prevSession && newSession?.user) {
        // Check if user was created recently (within last 5 minutes)
        const userCreatedAt = new Date(newSession.user.created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (userCreatedAt > fiveMinutesAgo) {
          setIsNewUser(true);
        }
      }
      
      // Defer supabase calls to avoid deadlocks in the callback
      if (newSession?.user) {
        setTimeout(() => upsertProfile(newSession), 0);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        setTimeout(() => upsertProfile(data.session), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("signOut function called");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      } else {
        console.log("Sign out successful");
      }
    } catch (err) {
      console.error("Sign out exception:", err);
    }
    setIsNewUser(false);
  };

  const markUserAsReturning = () => {
    setIsNewUser(false);
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signOut,
    isNewUser,
    markUserAsReturning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
