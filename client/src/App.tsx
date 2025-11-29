import { Switch, Route, Link, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, Video, BarChart3, Activity, LogOut, User } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

import HomePage from "@/pages/home";
import Setup from "@/pages/setup";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import MobileDashboard from "@/pages/mobile-dashboard";
import TvDashboard from "@/pages/tv-dashboard";
import AdminProfile from "@/pages/admin-profile";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (adminOnly && user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return <Component />;
}

function Router() {
  const [isMobileLive] = useRoute("/mobile-live");
  const { user, logoutMutation } = useAuth();

  // Mobile-only view without header/footer
  if (isMobileLive) {
    return (
      <div className="min-h-screen bg-background">
        <ProtectedRoute component={MobileDashboard} />
      </div>
    );
  }

  // Desktop view with full navigation
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer hover-elevate">
                QueueGuidance
              </h1>
            </Link>
            <nav className="flex gap-2 items-center">
              <ThemeToggle />
              {user && (
                <>
                  <Link href="/">
                    <Button variant="ghost" size="sm" data-testid="link-home" className="hover-elevate active-elevate-2">
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/setup">
                      <Button variant="ghost" size="sm" data-testid="link-setup" className="hover-elevate active-elevate-2">
                        <Video className="w-4 h-4 mr-2" />
                        Setup
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" data-testid="link-dashboard" className="hover-elevate active-elevate-2">
                      <Activity className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="ghost" size="sm" data-testid="link-analytics" className="hover-elevate active-elevate-2">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/admin/profile">
                    <Button variant="ghost" size="sm" className="hover-elevate active-elevate-2">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="hover-elevate active-elevate-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/">
            {() => <ProtectedRoute component={HomePage} />}
          </Route>
          <Route path="/setup">
            {() => <ProtectedRoute component={Setup} adminOnly />}
          </Route>
          <Route path="/dashboard">
            {() => <ProtectedRoute component={Dashboard} />}
          </Route>
          <Route path="/analytics">
            {() => <ProtectedRoute component={Analytics} />}
          </Route>
          <Route path="/tv-dashboard">
            {() => <ProtectedRoute component={TvDashboard} />}
          </Route>
          <Route path="/admin/profile">
            {() => <ProtectedRoute component={AdminProfile} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 QueueGuidance. AI-Powered Queue Management System
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Real-time Analytics</span>
              <span>•</span>
              <span>Multi-language Support</span>
              <span>•</span>
              <span>WebSocket Live Updates</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
