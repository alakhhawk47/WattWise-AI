// Alerts Panel — displays recent system alerts
// Scrollable list with severity icons and relative timestamps

import { AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";
import type { Alert } from "@/types";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-500/15",
    border: "border-red-200 dark:border-red-500/20",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    border: "border-amber-200 dark:border-amber-500/20",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-500/15",
    border: "border-blue-200 dark:border-blue-500/20",
  },
} as const;

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

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
          <p className="text-xs text-muted-foreground">{alerts.length} active alerts</p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
          {alerts.filter((a) => a.severity === "critical").length}
        </span>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50",
                config.border
              )}
            >
              <div className={cn("mt-0.5 rounded-lg p-1.5", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {alert.roomName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.message}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                  <Clock className="h-3 w-3" />
                  {getRelativeTime(alert.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
