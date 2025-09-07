import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'signup';
        const next = searchParams.get('next') || '/dashboard';

        if (!token_hash) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
          return;
        }

        // Handle different confirmation types
        let confirmationType: 'signup' | 'magiclink' | 'email_change';
        
        switch (type) {
          case 'magiclink':
            confirmationType = 'magiclink';
            break;
          case 'email_change':
            confirmationType = 'email_change';
            break;
          default:
            confirmationType = 'signup';
        }

        // Verify the confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: confirmationType,
        });

        if (error) {
          console.error('Confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm. Please try again.');
          
          toast({
            title: "Confirmation Failed",
            description: error.message || 'Failed to confirm.',
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          setStatus('success');
          
          // Set appropriate success message based on type
          let successMessage = '';
          let toastTitle = '';
          
          switch (confirmationType) {
            case 'signup':
              successMessage = 'Your email has been confirmed successfully! Redirecting to your dashboard...';
              toastTitle = 'Email Confirmed';
              break;
            case 'magiclink':
              successMessage = 'Signed in successfully! Redirecting to your dashboard...';
              toastTitle = 'Signed In';
              break;
            case 'email_change':
              successMessage = 'Your email address has been updated successfully!';
              toastTitle = 'Email Updated';
              break;
          }
          
          setMessage(successMessage);
          
          toast({
            title: toastTitle,
            description: confirmationType === 'signup' ? 
              "Welcome to HomeReport Pro! Your account is now active." : 
              successMessage,
          });

          // Redirect after a short delay
          setTimeout(() => {
            navigate(next);
          }, 2000);
        }
      } catch (err) {
        console.error('Unexpected error during confirmation:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleConfirmation();
  }, [searchParams, navigate, toast]);

  const handleReturnToLogin = () => {
    navigate('/auth');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'error' && (
            <Button onClick={handleReturnToLogin} className="w-full">
              Return to Login
            </Button>
          )}
          {status === 'success' && (
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
          )}
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your account...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthConfirm;