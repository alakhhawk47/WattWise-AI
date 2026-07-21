import { useCallback } from "react";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { getInitials } from "@/utils";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onMenuToggle: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userName =
    user?.user_metadata?.full_name || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [signOut]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
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
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search classrooms, alerts..."
            disabled
            className="h-9 w-64 rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notification button */}
        <button
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

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

          <span
            className={cn(
              "hidden max-w-[120px] truncate text-sm font-medium text-foreground md:block"
            )}
          >
            {userName}
          </span>

          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
