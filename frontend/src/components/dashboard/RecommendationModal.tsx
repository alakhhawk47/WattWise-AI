// AI Recommendation Detail Modal — Phase 5
// Displays full breakdown of an AI recommendation with ESC key listener, aria dialog attributes & smooth animations

import { useEffect } from "react";
import { X, AlertCircle, Lightbulb, CheckCircle2, Zap, Target, TrendingDown, ArrowRight } from "lucide-react";
import type { Recommendation } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  optimization: {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    label: "Optimization",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-500/15",
    label: "Alert",
  },
  positive: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    label: "Positive",
  },
} as const;

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  Critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

interface RecommendationModalProps {
  recommendation: Recommendation;
  onClose: () => void;
}

export function RecommendationModal({ recommendation, onClose }: RecommendationModalProps) {
  const config = TYPE_CONFIG[recommendation.type];
  const Icon = config.icon;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rec-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-xl p-2.5", config.bg)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <h3 id="rec-modal-title" className="text-base font-bold text-foreground">AI Recommendation</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", config.bg, config.color)}>
                  {config.label}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", PRIORITY_COLORS[recommendation.priority])}>
                  {recommendation.priority} Priority
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/90 leading-relaxed border-l-2 border-primary/30 pl-3">
          {recommendation.message}
        </p>

        {/* Detail Grid */}
        <div className="space-y-3">
          {/* Problem */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              Problem Detected
            </div>
            <p className="text-sm text-foreground">{recommendation.problem}</p>
          </div>

          {/* Reason */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Target className="h-3.5 w-3.5 text-violet-500" />
              Root Cause
            </div>
            <p className="text-sm text-foreground">{recommendation.reason}</p>
          </div>

          {/* Suggested Action */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
              <ArrowRight className="h-3.5 w-3.5" />
              Suggested Action
            </div>
            <p className="text-sm text-foreground font-medium">{recommendation.suggestedAction}</p>
          </div>

          {/* Savings & Impact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Est. Saving
              </div>
              <p className="text-lg font-bold text-foreground font-mono">{recommendation.estimatedSaving}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                Impact
              </div>
              <p className="text-xs text-foreground leading-relaxed">{recommendation.expectedImpact}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
