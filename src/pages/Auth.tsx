
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
