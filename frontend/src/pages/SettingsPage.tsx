// Settings Page — Phase 3 + Phase 5 Final Polish
// Full application settings persisted in localStorage with theme controls, auto refresh rate, dev mode, toast feedback, and about section

import { useNavigate } from "react-router-dom";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  RefreshCw,
  Clock,
  Terminal,
  LogOut,
  Zap,
  Code2,
  Layers,
  Server,
  Gauge,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleToggleTheme = () => {
    toggleTheme();
    const nextTheme = theme === "light" ? "Dark" : "Light";
    showToast({
      title: "Theme Changed",
      message: `Switched to ${nextTheme} mode`,
      type: "info",
      duration: 2000,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings & Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Configure application theme, telemetry refresh rate, notifications, and developer options.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Appearance & Theme */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Sun className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Application Theme</p>
              <p className="text-xs text-muted-foreground">
                Currently set to <span className="font-semibold capitalize">{theme}</span> mode.
              </p>
            </div>
            <button
              onClick={handleToggleTheme}
              aria-label={`Toggle theme to ${theme === "light" ? "dark" : "light"} mode`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Toggle to {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* Real-time Data & Refresh Rate */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Data Telemetry & Refresh</h3>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Refresh Data</p>
              <p className="text-xs text-muted-foreground">
                Automatically fetch and update classroom IoT telemetry in background.
              </p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.autoRefreshEnabled;
                updateSettings({ autoRefreshEnabled: updated });
                showToast({
                  title: "Settings Saved",
                  message: `Auto refresh ${updated ? "enabled" : "disabled"}`,
                  type: "success",
                });
              }}
              aria-label="Toggle auto refresh data"
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                settings.autoRefreshEnabled ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  settings.autoRefreshEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Refresh Interval Selector */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Refresh Interval</p>
                <p className="text-xs text-muted-foreground">Select telemetry update frequency.</p>
              </div>
            </div>
            <select
              value={settings.refreshInterval}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateSettings({ refreshInterval: val });
                showToast({
                  title: "Settings Saved",
                  message: `Refresh interval set to ${val} seconds`,
                  type: "success",
                });
              }}
              aria-label="Select refresh interval"
              className="rounded-lg border border-input bg-muted/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={3}>Every 3 seconds</option>
              <option value={5}>Every 5 seconds (Default)</option>
              <option value={10}>Every 10 seconds</option>
              <option value={30}>Every 30 seconds</option>
            </select>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Notifications & Alerts</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notification Alerts</p>
              <p className="text-xs text-muted-foreground">Receive pop-up alerts for high energy usage events.</p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.notificationsEnabled;
                updateSettings({ notificationsEnabled: updated });
                showToast({
                  title: "Settings Saved",
                  message: `Notifications ${updated ? "enabled" : "disabled"}`,
                  type: "success",
                });
              }}
              aria-label="Toggle notifications"
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                settings.notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  settings.notificationsEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Developer Options */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Developer Options</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Developer Mode</p>
              <p className="text-xs text-muted-foreground">Show simulated telemetry diagnostics and mock bypass info.</p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.devMode;
                updateSettings({ devMode: updated });
                showToast({
                  title: "Settings Saved",
                  message: `Developer mode ${updated ? "enabled" : "disabled"}`,
                  type: "info",
                });
              }}
              aria-label="Toggle developer mode"
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                settings.devMode ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  settings.devMode ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* About & Project Info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 card-hover">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">WattWise AI</h4>
                <p className="text-xs text-muted-foreground">Smart Classroom Energy Monitoring Dashboard</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary font-mono">
              v1.2.0-MVP
            </span>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">Tech Stack</h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "React",
                "TypeScript",
                "Vite",
                "Tailwind CSS",
                "Recharts",
                "Supabase Ready Architecture",
              ].map((tech) => (
                <div
                  key={tech}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-foreground text-center"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Build Info */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">Build Info</h5>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium text-foreground font-mono">1.2.0-MVP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Build</span>
                <span className="font-medium text-foreground font-mono text-[10px]">
                  {`build-${Date.now().toString(36).slice(-8)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Developer Mode</span>
                <span className={cn("font-semibold", settings.devMode ? "text-emerald-500" : "text-muted-foreground")}>
                  {settings.devMode ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Environment</span>
                <div className="flex items-center gap-1.5">
                  <Server className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">Development</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Architecture</span>
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">Client-Side SPA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            aria-label="Sign out of application"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Application
          </button>
        </div>
      </div>
    </div>
  );
}
