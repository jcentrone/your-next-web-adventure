
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RootLayout from "./layouts/RootLayout";
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const lazyLoad = (
  loader: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const C = React.lazy(loader);
  return (
    <React.Suspense fallback={null}>
      <C />
    </React.Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={lazyLoad(() => import("./pages/Dashboard"))} />
              <Route path="/auth" element={lazyLoad(() => import("./pages/Auth"))} />
              <Route path="/reports" element={lazyLoad(() => import("./pages/ReportsList"))} />
              <Route path="/reports/new" element={lazyLoad(() => import("./pages/ReportNew"))} />
              <Route path="/reports/:id" element={lazyLoad(() => import("./pages/ReportEditor"))} />
              <Route path="/reports/:id/preview" element={lazyLoad(() => import("./pages/ReportPreview"))} />
              <Route path="/contacts" element={lazyLoad(() => import("./pages/Contacts"))} />
              <Route path="/contacts/:id" element={lazyLoad(() => import("./pages/ContactDetail"))} />
              <Route path="/calendar" element={lazyLoad(() => import("./pages/Calendar"))} />
              <Route path="/tasks" element={lazyLoad(() => import("./pages/Tasks"))} />
              <Route path="/defects-admin" element={lazyLoad(() => import("./pages/DefectsAdmin"))} />
              <Route path="/section-manager" element={lazyLoad(() => import("./pages/SectionManager"))} />
              <Route path="/profile" element={lazyLoad(() => import("./pages/Profile"))} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
