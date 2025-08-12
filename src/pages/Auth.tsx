
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const AuthPage: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const redirectTo =
    new URLSearchParams(location.search).get("redirectTo") || "/";

  // Allow deep-linking to signup: /auth?mode=signup
  React.useEffect(() => {
    const m = new URLSearchParams(location.search).get("mode");
    if (m === "signup" || m === "signin") {
      setMode(m);
    }
  }, [location.search]);

  React.useEffect(() => {
    if (!loading && user) {
      nav(redirectTo, { replace: true });
    }
  }, [user, loading, nav, redirectTo]);

  const onSignIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message });
      return;
    }
    toast({ title: "Signed in" });
    nav(redirectTo, { replace: true });
  };

  const onSignUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message });
      return;
    }
    toast({
      title: "Check your email",
      description: "Confirm your email to complete signup, then sign in.",
    });
  };

  const onGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setBusy(false);
      toast({ title: "Google sign-in failed", description: error.message });
      return;
    }
    // On success, Supabase redirects to Google; when it comes back, onAuthStateChange will handle.
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-1">{mode === "signin" ? "Sign in" : "Create an account"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? (
            <>Don&apos;t have an account?{" "}
              <button className="underline" onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account?{" "}
              <button className="underline" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </p>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={onGoogle} disabled={busy}>
            {/* Simple Google "G" icon SVG */}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.6l2.7-2.6C16.9 2.7 14.7 1.8 12 1.8 6.9 1.8 2.8 5.9 2.8 11s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.2-1.5H12z"/>
            </svg>
            {busy ? "Redirecting..." : "Continue with Google"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {mode === "signin" ? (
            <Button className="w-full" onClick={onSignIn} disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>
          ) : (
            <Button className="w-full" onClick={onSignUp} disabled={busy}>
              {busy ? "Creating account..." : "Sign up"}
            </Button>
          )}
          <div className="text-xs text-muted-foreground text-center">
            <Link to="/">Back to home</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
