import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              System configuration, notification preferences, and account
              settings.
            </p>
          </div>
        </div>
      </div>

      {/* Empty Content Section */}
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <div className="text-center">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            Settings Coming Soon
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Theme preferences, notification settings, and account management
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
