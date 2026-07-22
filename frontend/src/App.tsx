import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";

// Lazy-loaded heavy pages for performance
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const ClassroomsPage = lazy(() => import("@/pages/ClassroomsPage").then((m) => ({ default: m.ClassroomsPage })));
const ClassroomDetailPage = lazy(() => import("@/pages/ClassroomDetailPage").then((m) => ({ default: m.ClassroomDetailPage })));
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function LazyFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes with app layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<Suspense fallback={<LazyFallback />}><AnalyticsPage /></Suspense>} />
                <Route path="/classrooms" element={<Suspense fallback={<LazyFallback />}><ClassroomsPage /></Suspense>} />
                <Route path="/classrooms/:id" element={<Suspense fallback={<LazyFallback />}><ClassroomDetailPage /></Suspense>} />
                <Route path="/reports" element={<Suspense fallback={<LazyFallback />}><ReportsPage /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<LazyFallback />}><SettingsPage /></Suspense>} />
              </Route>
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
