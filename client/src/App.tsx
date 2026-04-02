import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

import HomePage from "@/pages/home";
import Setup from "@/pages/setup";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import MobileDashboard from "@/pages/mobile-dashboard";
import TvDashboard from "@/pages/tv-dashboard";
import AdminProfile from "@/pages/admin-profile";
import SettingsPage from "@/pages/settings";

function Router() {
  const [isMobileLive] = useRoute("/mobile-live");
  const [isAuthPage] = useRoute("/auth");
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show auth page (without app shell)
  if (!user) {
    return <AuthPage />;
  }

  // Mobile-only view without header/footer
  if (isMobileLive) {
    return (
      <div className="min-h-screen bg-background">
        <MobileDashboard />
      </div>
    );
  }

  // Desktop app shell (sidebar + topbar) - only for logged-in users
  return (
    <AppShell>
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>
          <Route path="/setup">
            <Setup />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/analytics">
            <Analytics />
          </Route>
          <Route path="/settings">
            <SettingsPage />
          </Route>
          <Route path="/tv-dashboard">
            <TvDashboard />
          </Route>
          <Route path="/admin/profile">
            <AdminProfile />
          </Route>
          <Route component={NotFound} />
        </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="queueguidance-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
