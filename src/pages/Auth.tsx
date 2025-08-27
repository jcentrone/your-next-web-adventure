
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
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
  
  // Signup form fields
  const [signupType, setSignupType] = React.useState<"individual" | "organization">("individual");
  const [fullName, setFullName] = React.useState("");
  const [organizationName, setOrganizationName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [verificationStatus, setVerificationStatus] = React.useState<"pending" | "success" | "error" | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirectTo") || "/";
  const inviteToken = searchParams.get("token");

  // Allow deep-linking to signup: /auth?mode=signup
  React.useEffect(() => {
    const m = searchParams.get("mode");
    const type = searchParams.get("type");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");
    
    // Handle email verification callback
    if (type === "signup" && !error) {
      setVerificationStatus("success");
      toast({
        title: "Email verified!",
        description: "Your account has been created successfully. Please sign in."
      });
    } else if (error) {
      setVerificationStatus("error");
      toast({
        title: "Verification failed",
        description: error_description || "There was an issue verifying your email.",
        variant: "destructive"
      });
    }
    
    if (m === "signup" || m === "signin") {
      setMode(m);
    }
    
    // If there's an invite token, switch to signup mode
    if (inviteToken) {
      setMode("signup");
      setSignupType("individual"); // Invites are for joining existing orgs
    }
  }, [location.search, inviteToken]);

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
    
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone: phone,
            license_number: licenseNumber,
            // Store organization intent for after email confirmation
            ...(signupType === "organization" && {
              organization_name: organizationName,
              is_organization_admin: true
            })
          }
        },
      });

      if (authError) throw authError;

      if (authData.user && !authData.user.email_confirmed_at) {
        // User needs to verify email first
        setVerificationStatus("pending");
        toast({
          title: "Check your email",
          description: `We've sent you a confirmation link. ${signupType === "organization" ? "Your organization will be set up after verification." : "Please verify your email to complete signup."}`
        });
      } else if (authData.user?.email_confirmed_at) {
        // Email already confirmed (shouldn't happen in signup flow)
        toast({
          title: "Account already verified",
          description: "Please sign in with your credentials."
        });
        setMode("signin");
      }
    } catch (error: any) {
      toast({ title: "Sign up failed", description: error.message });
    } finally {
      setBusy(false);
    }
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
      <Card className="w-full max-w-lg p-6">
        <h1 className="text-xl font-semibold mb-1">
          {mode === "signin" ? "Sign in" : inviteToken ? "Accept Invitation" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? (
            <>Don&apos;t have an account?{" "}
              <button className="underline" onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account?{" "}
              <button className="underline" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </p>

        {/* Verification Status Messages */}
        {verificationStatus === "pending" && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please check your email and click the verification link to complete your account setup.
            </AlertDescription>
          </Alert>
        )}
        
        {verificationStatus === "success" && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your email has been verified successfully! You can now sign in.
            </AlertDescription>
          </Alert>
        )}
        
        {verificationStatus === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an issue verifying your email. Please try signing up again or contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={onGoogle} disabled={busy}>
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

          {mode === "signup" && !inviteToken && (
            <Tabs value={signupType} onValueChange={(value) => setSignupType(value as "individual" | "organization")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">Individual Inspector</TabsTrigger>
                <TabsTrigger value="organization">Organization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="organization" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="adminName">Your Full Name</Label>
                  <Input
                    id="adminName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="license">License Number (Optional)</Label>
                <Input
                  id="license"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Your license number"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
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
              {busy ? "Creating account..." : 
                inviteToken ? "Accept & Join" :
                signupType === "organization" ? "Create Organization" : "Sign up"}
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
