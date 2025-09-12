import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import RootLayout from "@/layouts/RootLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PWAManager } from "@/components/pwa/PWAManager";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import GoogleCallback from "@/pages/oauth/GoogleCallback";
import OutlookCallback from "@/pages/oauth/OutlookCallback";
import AppleCallback from "@/pages/oauth/AppleCallback";
import ShowingTimeCallback from "@/pages/oauth/ShowingTimeCallback";
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

const lazyLoad = (
  loader: () => Promise<{ default: React.ComponentType<unknown> }>
) => {
  const C = React.lazy(loader);
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingFallback />}>
        <C />
      </React.Suspense>
    </ErrorBoundary>
  );
};

const AppWithRouting: React.FC = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
        <Routes>
          <Route path="/oauth/google" element={<GoogleCallback />} />
          <Route path="/oauth/outlook" element={<OutlookCallback />} />
          <Route path="/oauth/apple" element={<AppleCallback />} />
          <Route path="/oauth/showingtime" element={<ShowingTimeCallback />} />
          <Route path="/book/:slug" element={lazyLoad(() => import("@/pages/BookingPage"))} />
          <Route element={<RootLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={lazyLoad(() => import("@/pages/Features"))} />
          <Route path="/pricing" element={lazyLoad(() => import("@/pages/Pricing"))} />
        <Route path="/dashboard" element={lazyLoad(() => import("@/pages/Dashboard"))} />
        <Route path="/auth" element={lazyLoad(() => import("@/pages/Auth"))} />
        <Route path="/auth/confirm" element={lazyLoad(() => import("@/pages/AuthConfirm"))} />
        <Route path="/auth/forgot-password" element={lazyLoad(() => import("@/pages/ForgotPassword"))} />
        <Route path="/auth/reset-password" element={lazyLoad(() => import("@/pages/ResetPassword"))} />
          <Route path="/reports" element={lazyLoad(() => import("@/pages/ReportsList"))} />
        <Route path="/reports/select-type" element={lazyLoad(() => import("@/pages/ReportTypeSelection"))} />
          <Route path="/reports/new" element={lazyLoad(() => import("@/pages/ReportNew"))} />
          <Route path="/reports/new/home-inspection" element={lazyLoad(() => import("@/pages/HomeInspectionNew"))} />
            <Route path="/reports/new/wind-mitigation" element={lazyLoad(() => import("@/pages/WindMitigationNew"))} />
            <Route path="/reports/new/fl-four-point" element={lazyLoad(() => import("@/pages/FlFourPointNew"))} />
            
            <Route path="/reports/new/ca-wildfire" element={lazyLoad(() => import("@/pages/CaWildfireNew"))} />
            <Route path="/reports/new/roof-certification" element={lazyLoad(() => import("@/pages/RoofCertificationNew"))} />
            <Route path="/reports/new/manufactured-home" element={lazyLoad(() => import("@/pages/ManufacturedHomeNew"))} />
            <Route path="/reports/new/:reportType" element={lazyLoad(() => import("@/pages/GenericReportNew"))} />
          <Route path="/reports/:id" element={lazyLoad(() => import("@/pages/ReportEditor"))} />
          <Route path="/reports/:id/preview" element={lazyLoad(() => import("@/pages/ReportPreview"))} />
          
    <Route path="/contacts" element={lazyLoad(() => import("@/pages/Contacts"))} />
    <Route path="/contacts/new" element={lazyLoad(() => import("@/pages/ContactNew"))} />
    <Route path="/contacts/:id" element={lazyLoad(() => import("@/pages/ContactDetail"))} />
    <Route path="/accounts" element={lazyLoad(() => import("@/pages/Accounts"))} />
    <Route path="/accounts/new" element={lazyLoad(() => import("@/pages/AccountNew"))} />
    <Route path="/accounts/:id" element={lazyLoad(() => import("@/pages/AccountDetail"))} />
    <Route path="/analytics" element={lazyLoad(() => import("@/pages/Analytics"))} />
          <Route path="/calendar" element={lazyLoad(() => import("@/components/calendar/CalendarWrapper"))} />
          <Route path="/routes" element={lazyLoad(() => import("@/pages/Routes"))} />
          <Route path="/route/:routeId" element={lazyLoad(() => import("@/pages/RouteView"))} />
          <Route path="/tasks" element={lazyLoad(() => import("@/pages/Tasks"))} />
          <Route path="/expenses" element={lazyLoad(() => import("@/pages/Expenses"))} />
          <Route path="/support" element={lazyLoad(() => import("@/pages/ContactSupport"))} />
          <Route path="/documentation" element={lazyLoad(() => import("@/pages/Documentation"))} />
          <Route path="/internachi-standards" element={lazyLoad(() => import("@/pages/InternachiSOP"))} />
          <Route path="/defects-admin" element={lazyLoad(() => import("@/pages/DefectsAdmin"))} />
          <Route path="/support-logs" element={lazyLoad(() => import("@/pages/SupportLogs"))} />
          <Route path="/report-builder" element={lazyLoad(() => import("@/pages/ReportBuilder"))} />
          <Route path="/settings/*" element={lazyLoad(() => import("@/pages/Settings"))} />
          <Route path="/sample-reports" element={lazyLoad(() => import("@/pages/SampleReports"))} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </BrowserRouter>
  );
};

export default AppWithRouting;