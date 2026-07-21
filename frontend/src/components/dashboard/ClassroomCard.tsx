// Classroom Card — displays individual classroom status
// Shows room name, occupancy, power, and status badge
// Clickable — navigates to /classrooms/:id

import { useNavigate } from "react-router-dom";
import { Users, Zap, Thermometer } from "lucide-react";
import type { Classroom } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  normal: {
    label: "Normal",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  warning: {
    label: "Warning",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  "high-usage": {
    label: "High Usage",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    ring: "ring-red-500/20",
  },
} as const;

interface ClassroomCardProps {
  classroom: Classroom;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[classroom.status];

  const occupancyPercent = Math.min(100, Math.round((classroom.occupancy / 45) * 100));

  return (
    <button
      onClick={() => navigate(`/classrooms/${classroom.id}`)}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-card p-4 text-left",
        "transition-all duration-300 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:-translate-y-0.5 hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {/* Status indicator line at top */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 transition-all duration-300 group-hover:h-1",
          config.dot
        )}
      />

      {/* Header: Room name + Status badge */}
      <div className="flex items-center justify-between mb-3 pt-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {classroom.name}
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            config.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
          {config.label}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="space-y-2.5">
        {/* Occupancy */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Occupancy</span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {classroom.occupancy}/45
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                occupancyPercent > 80
                  ? "bg-red-500"
                  : occupancyPercent > 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Power + Temperature row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="font-medium text-foreground">
              {classroom.currentPower} kW
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Thermometer className="h-3 w-3 text-blue-500" />
            <span className="font-medium text-foreground">
              {classroom.temperature}°C
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
