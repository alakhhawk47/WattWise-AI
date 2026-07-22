// TopNav component with global search, notifications dropdown, theme toggle, and fixed sign out

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  Zap,
  Check,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { getInitials } from "@/utils";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onMenuToggle: () => void;
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SEVERITY_BADGES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export function TopNav({ onMenuToggle }: TopNavProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { classrooms, alerts, searchQuery, setSearchQuery, markAllAlertsRead, clearAllAlerts } = useApp();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const userName = user?.user_metadata?.full_name || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      navigate("/", { replace: true });
    }
  }, [signOut, navigate]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered search results — supports room number, status, "alert" keyword
  const matchingClassrooms = searchQuery.trim()
    ? classrooms.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesBasic =
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q);
        const matchesAlert =
          q === "alert" || q === "alerts"
            ? alerts.some((a) => a.roomId === c.id)
            : false;
        const matchesHigh = q.includes("high") && c.status === "high-usage";
        return matchesBasic || matchesAlert || matchesHigh;
      })
    : [];

  // Auto-navigate when exactly one room matches a 3-digit room number
  useEffect(() => {
    if (!searchQuery.trim() || !showSearchResults) return;
    const q = searchQuery.trim().toLowerCase();
    const isRoomNumber = /^\d{3}$/.test(q);
    if (isRoomNumber && matchingClassrooms.length === 1) {
      const timer = setTimeout(() => {
        navigate(`/classrooms/${matchingClassrooms[0].id}`);
        setSearchQuery("");
        setShowSearchResults(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, matchingClassrooms, showSearchResults, navigate, setSearchQuery]);

  const handleSelectRoom = (roomId: string) => {
    navigate(`/classrooms/${roomId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleAlertClick = (roomId: string) => {
    navigate(`/classrooms/${roomId}`);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">WattWise</span>
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search rooms, status, alerts..."
            aria-label="Search classrooms, status or alerts"
            className="h-9 w-64 rounded-lg border border-input bg-muted/50 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 focus:w-72"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Dropdown Results */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-xl z-50 animate-slide-up">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Classroom Results ({matchingClassrooms.length})
              </p>
              {matchingClassrooms.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {matchingClassrooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-muted transition-colors text-xs focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{room.name}</span>
                        <span className="ml-2 text-muted-foreground font-mono">{room.currentPower} kW</span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase font-mono",
                          room.status === "high-usage" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                          room.status === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                          room.status === "normal" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        )}
                      >
                        {room.status}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground text-center">
                  No matching classrooms found
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notification button & dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label={`Notifications: ${unreadCount} unread`}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse-live">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={markAllAlertsRead}
                    aria-label="Mark all alerts as read"
                    className="p-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                    title="Mark all as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clearAllAlerts}
                    aria-label="Clear all notifications"
                    className="p-1 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="max-h-72 overflow-y-auto space-y-2 py-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => {
                    const icons = {
                      critical: <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />,
                      warning: <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />,
                      info: <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />,
                    };
                    return (
                      <button
                        key={alert.id}
                        onClick={() => handleAlertClick(alert.roomId)}
                        className={cn(
                          "w-full flex items-start gap-2.5 rounded-lg p-2.5 text-xs text-left transition-colors cursor-pointer hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary",
                          alert.isRead ? "bg-card" : "bg-muted/60 font-medium"
                        )}
                      >
                        {icons[alert.severity]}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{alert.roomName}</p>
                            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase font-mono", SEVERITY_BADGES[alert.severity])}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 leading-snug">{alert.message}</p>
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(alert.timestamp)}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="py-6 text-center text-xs text-muted-foreground">No recent notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* User avatar & sign out */}
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="h-8 w-8 rounded-full border border-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {getInitials(userName)}
            </div>
          )}

          <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground md:block">
            {userName}
          </span>

          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
