
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
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const lazyLoad = (
  loader: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const C = React.lazy(loader);
  return (
    <ErrorBoundary>
      <React.Suspense fallback={null}>
        <C />
      </React.Suspense>
    </ErrorBoundary>
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
              <Route path="/reports/select-type" element={lazyLoad(() => import("./components/reports/ReportTypeSelector"))} />
              <Route path="/reports/new" element={lazyLoad(() => import("./pages/ReportNew"))} />
              <Route path="/reports/new/home-inspection" element={lazyLoad(() => import("./pages/HomeInspectionNew"))} />
              <Route path="/reports/new/wind-mitigation" element={lazyLoad(() => import("./pages/WindMitigationNew"))} />
              <Route path="/reports/:id" element={lazyLoad(() => import("./pages/ReportEditor"))} />
              <Route path="/reports/:id/preview" element={lazyLoad(() => import("./pages/ReportPreview"))} />
              <Route path="/reports/:reportId/annotate/:findingId/:mediaId" element={lazyLoad(() => import("./pages/ImageAnnotation"))} />
              <Route path="/contacts" element={lazyLoad(() => import("./pages/Contacts"))} />
              <Route path="/contacts/new" element={lazyLoad(() => import("./pages/ContactNew"))} />
              <Route path="/contacts/:id" element={lazyLoad(() => import("./pages/ContactDetail"))} />
              <Route path="/calendar" element={lazyLoad(() => import("./pages/Calendar"))} />
              <Route path="/tasks" element={lazyLoad(() => import("./pages/Tasks"))} />
              <Route path="/defects-admin" element={lazyLoad(() => import("./pages/DefectsAdmin"))} />
              <Route path="/section-manager" element={lazyLoad(() => import("./pages/SectionManager"))} />
              <Route path="/cover-page-manager" element={lazyLoad(() => import("./pages/CoverPageManager"))} />
              <Route
                path="/cover-page-manager/new"
                element={lazyLoad(() => import("./pages/CoverPageEditorPage"))}
              />
              <Route
                path="/cover-page-manager/:id"
                element={lazyLoad(() => import("./pages/CoverPageEditorPage"))}
              />
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
