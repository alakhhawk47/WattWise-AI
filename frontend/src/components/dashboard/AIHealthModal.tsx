// AI Health Details Modal — Phase 5
// Displays comprehensive AI system health breakdown with prediction metrics, room status counts, ESC listener & backdrop blur

import { useEffect } from "react";
import { X, Brain, ShieldCheck, AlertTriangle, ShieldAlert, Activity, BarChart3, Cpu } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface AIHealthModalProps {
  onClose: () => void;
}

export function AIHealthModal({ onClose }: AIHealthModalProps) {
  const { classrooms, summaryCards } = useApp();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Compute room counts from live data
  const healthyRooms = classrooms.filter((c) => c.status === "normal").length;
  const warningRooms = classrooms.filter((c) => c.status === "warning").length;
  const highRiskRooms = classrooms.filter((c) => c.status === "high-usage").length;

  // Extract AI health score from summary cards
  const aiHealthCard = summaryCards.find((c) => c.title === "AI Health Score");
  const aiScore = aiHealthCard ? parseInt(aiHealthCard.value) : 94;

  const predictionConfidence = Math.min(99, aiScore + 2);
  const avgAccuracy = Math.min(98, aiScore - 1);

  const aiStatus = aiScore >= 90 ? "Optimal" : aiScore >= 80 ? "Good" : "Degraded";
  const statusColor =
    aiScore >= 90
      ? "text-emerald-500"
      : aiScore >= 80
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-health-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 dark:bg-violet-500/20 p-2.5">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 id="ai-health-modal-title" className="text-base font-bold text-foreground">AI Health Details</h3>
              <p className="text-xs text-muted-foreground">WattWise AI prediction engine status</p>
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

        {/* AI Score Hero */}
        <div className="text-center py-3 space-y-1">
          <p className="text-5xl font-bold text-foreground font-mono">{aiScore}%</p>
          <p className={cn("text-sm font-semibold", statusColor)}>
            {aiStatus} — {aiStatus === "Optimal" ? "All systems running smoothly" : aiStatus === "Good" ? "Minor calibration needed" : "Attention required"}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Prediction Confidence */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Activity className="h-3 w-3 text-primary" />
              Prediction Confidence
            </div>
            <p className="text-xl font-bold text-foreground font-mono">{predictionConfidence}%</p>
          </div>

          {/* Average Accuracy */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <BarChart3 className="h-3 w-3 text-blue-500" />
              Avg Accuracy
            </div>
            <p className="text-xl font-bold text-foreground font-mono">{avgAccuracy}%</p>
          </div>
        </div>

        {/* Room Status Breakdown */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Status Breakdown</p>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">Healthy Rooms</span>
            </div>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{healthyRooms}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-amber-200/50 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Warning Rooms</span>
            </div>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{warningRooms}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-200/50 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-foreground">High Risk Rooms</span>
            </div>
            <span className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">{highRiskRooms}</span>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-medium text-foreground">Current AI Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", aiScore >= 90 ? "bg-emerald-500 animate-pulse-live" : aiScore >= 80 ? "bg-amber-500" : "bg-red-500")} />
            <span className={cn("text-xs font-semibold", statusColor)}>{aiStatus}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
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
