import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, Video, BarChart3, Activity } from "lucide-react";

import HomePage from "@/pages/home";
import Setup from "@/pages/setup";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
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
            <nav className="flex gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-home" className="hover-elevate active-elevate-2">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="ghost" size="sm" data-testid="link-setup" className="hover-elevate active-elevate-2">
                  <Video className="w-4 h-4 mr-2" />
                  Setup
                </Button>
              </Link>
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
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-background">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/setup" component={Setup} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
