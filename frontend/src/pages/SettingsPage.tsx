// Settings Page — Phase 3 + Phase 5 Final Polish
// Full application settings persisted in localStorage with theme controls, auto refresh rate, dev mode, toast feedback, and about section

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  RefreshCw,
  Clock,
  LogOut,
  User as UserIcon,
  Save,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { storageService } from "@/services/storageService";
import { getInitials } from "@/utils";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, updateProfileState, signOut } = useAuth();
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const googleAvatar = (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || "";
  const activeAvatar = previewUrl || avatarUrl || googleAvatar;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setAvatarUrl(profile.avatar_url || "");
    } else if (user) {
      setFullName((user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "");
      setEmail(user.email || "");
      setAvatarUrl((user.user_metadata?.avatar_url as string) || (user.user_metadata?.picture as string) || "");
    }
  }, [profile, user]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      showToast({
        title: "Authentication Required",
        message: "You must be signed in to upload a profile picture.",
        type: "error",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploadingAvatar(true);
    try {
      const uploadResult = await storageService.uploadAvatar(user.id, file);

      setAvatarUrl(uploadResult.url);
      await updateProfileState({ avatar_url: uploadResult.url });

      showToast({
        title: uploadResult.verified ? "Avatar Uploaded & Verified" : "Avatar Uploaded",
        message: uploadResult.verified
          ? "Profile picture stored and verified in Supabase Storage."
          : "Your profile picture has been updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Avatar upload error:", err);
      setPreviewUrl(null);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload avatar image.";
      showToast({
        title: "Upload Failed",
        message: errorMessage,
        type: "error",
        duration: 4500,
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!avatarUrl && !previewUrl) return;

    setIsDeletingAvatar(true);
    try {
      if (avatarUrl) {
        await storageService.deleteAvatar(avatarUrl);
      }
      setAvatarUrl("");
      setPreviewUrl(null);
      await updateProfileState({ avatar_url: "" });

      showToast({
        title: "Avatar Removed",
        message: "Profile picture has been deleted.",
        type: "info",
      });
    } catch (err: unknown) {
      console.error("Avatar deletion error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete avatar.";
      showToast({
        title: "Delete Failed",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfileState({
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl,
      });
      showToast({
        title: "Profile Updated",
        message: "Your user profile has been saved successfully.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Failed to update profile in database.",
        type: "error",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

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
        {/* User Profile Section */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-hover">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <UserIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">User Profile</h3>
          </div>

          {/* Profile Picture Management Component */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div className="relative group shrink-0">
              {activeAvatar ? (
                <img
                  src={activeAvatar}
                  alt="Profile Avatar"
                  className="h-20 w-20 rounded-full border-2 border-primary/30 object-cover shadow-sm"
                  onError={() => {
                    if (previewUrl) {
                      setPreviewUrl(null);
                    } else if (avatarUrl && googleAvatar) {
                      setAvatarUrl("");
                    }
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-dashed border-primary/30 text-lg font-bold text-primary">
                  {fullName ? getInitials(fullName) : <UserIcon className="h-8 w-8 text-primary" />}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h4 className="text-xs font-semibold text-foreground">Profile Picture</h4>
              <p className="text-[11px] text-muted-foreground">
                Upload a custom profile photo. Max size 5MB (JPEG, PNG, WebP).
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                  id="avatarFileInput"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar || isDeletingAvatar}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : previewUrl || avatarUrl ? (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Replace Image
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload Picture
                    </>
                  )}
                </button>

                {(avatarUrl || previewUrl) && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar || isDeletingAvatar}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 px-3 py-1.5 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    {isDeletingAvatar ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Image
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullNameInput" className="text-xs font-medium text-foreground">
                  Display Name
                </label>
                <input
                  id="fullNameInput"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="emailInput" className="text-xs font-medium text-foreground">
                  Email
                </label>
                <input
                  id="emailInput"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border/50">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Save className="h-3.5 w-3.5" />
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

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

        {/* Account & Sign Out */}
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
