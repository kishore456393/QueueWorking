import { PropsWithChildren, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BarChart3, Home, LogOut, Settings, Tv, User, Video, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/setup", label: "Setup", icon: Video },
  { href: "/dashboard", label: "Queue Monitoring", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/tv-dashboard", label: "TV Mode", icon: Tv },
  { href: "/settings", label: "Settings", icon: Settings },
];

const EXTRA_ROUTE_LABELS: Record<string, string> = {
  "/admin/profile": "Profile",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "U";
}

export function AppShell({ children }: PropsWithChildren) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeNav = useMemo(() => {
    const extra = EXTRA_ROUTE_LABELS[location];
    if (extra) return extra;
    const match = navItems
      .filter((i) => (i.href === "/" ? location === "/" : location.startsWith(i.href)))
      .sort((a, b) => b.href.length - a.href.length)[0];
    return match?.label ?? "Dashboard";
  }, [location]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300",
            isCollapsed ? "w-16" : "w-56"
          )}
        >
          {/* Logo & Toggle */}
          <div className="flex h-14 items-center justify-between border-b border-border px-3">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  Q
                </span>
                <span className="font-semibold text-foreground">QueueGuidance</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", isCollapsed && "mx-auto")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const active =
                item.href === "/" ? location === "/" : location.startsWith(item.href);
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>

          {/* User Section at Bottom */}
          <div className="border-t border-border p-2">
            {/* User Info */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/profile"
                    className="flex justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials(user?.username || user?.email || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {user?.username || user?.email || "User"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/admin/profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials(user?.username || user?.email || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-foreground">
                    {user?.firstName || user?.username || "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </Link>
            )}

            {/* Sign Out */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="flex w-full justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300",
            isCollapsed ? "ml-16" : "ml-56"
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <h1 className="text-lg font-semibold text-foreground">{activeNav}</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/admin/profile">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials(user?.username || user?.email || "User")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
