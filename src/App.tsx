import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import { PWAManager } from "@/components/pwa/PWAManager";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import AppWithRouting from "./components/AppWithRouting";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <OnboardingWrapper>
            <PWAManager />
            <NotificationManager />
            <AppWithRouting />
          </OnboardingWrapper>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;