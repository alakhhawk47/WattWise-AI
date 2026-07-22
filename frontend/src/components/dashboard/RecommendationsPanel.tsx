// AI Recommendations Panel — displays AI-generated suggestions
// Reusable recommendation cards with type-based styling
// Clickable cards open the RecommendationModal for full details

import { useState } from "react";
import { Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";
import { RecommendationModal } from "./RecommendationModal";

const TYPE_CONFIG = {
  optimization: {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    border: "border-amber-200/60 dark:border-amber-500/15",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-500/15",
    border: "border-red-200/60 dark:border-red-500/15",
  },
  positive: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    border: "border-emerald-200/60 dark:border-emerald-500/15",
  },
} as const;

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-violet-100 p-1.5 dark:bg-violet-500/20">
          <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
          <p className="text-xs text-muted-foreground">Smart suggestions from WattWise AI</p>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {recommendations.map((rec) => {
          const config = TYPE_CONFIG[rec.type];
          const Icon = config.icon;
          return (
            <button
              key={rec.id}
              onClick={() => setSelectedRec(rec)}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/50 hover:shadow-sm cursor-pointer",
                config.border
              )}
            >
              <div className={cn("mt-0.5 shrink-0 rounded-lg p-1.5", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                {rec.message}
              </p>
            </button>
          );
        })}
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRec && (
        <RecommendationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}
    </div>
  );
}
