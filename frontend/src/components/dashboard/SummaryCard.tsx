// Summary Card — reusable dashboard metric card with count-up KPI animation & hover elevation

import { Zap, Leaf, AlertTriangle, Brain, type LucideIcon } from "lucide-react";
import type { SummaryCardData } from "@/types";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Leaf,
  AlertTriangle,
  Brain,
};

const COLOR_STYLES: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
  emerald: {
    bg: "from-emerald-500/5 to-emerald-500/0 dark:from-emerald-500/10 dark:to-emerald-500/0",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/50 dark:border-emerald-500/20",
  },
  green: {
    bg: "from-green-500/5 to-green-500/0 dark:from-green-500/10 dark:to-green-500/0",
    iconBg: "bg-green-100 dark:bg-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    border: "border-green-200/50 dark:border-green-500/20",
  },
  amber: {
    bg: "from-amber-500/5 to-amber-500/0 dark:from-amber-500/10 dark:to-amber-500/0",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/50 dark:border-amber-500/20",
  },
  violet: {
    bg: "from-violet-500/5 to-violet-500/0 dark:from-violet-500/10 dark:to-violet-500/0",
    iconBg: "bg-violet-100 dark:bg-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200/50 dark:border-violet-500/20",
  },
};

interface SummaryCardProps {
  data: SummaryCardData;
  onClick?: () => void;
}

export function SummaryCard({ data, onClick }: SummaryCardProps) {
  const Icon = ICON_MAP[data.icon] || Zap;
  const colors = COLOR_STYLES[data.color] || COLOR_STYLES.emerald;

  // Extract numeric value and unit for count-up animation
  const numericMatch = data.value.match(/^([\d.]+)\s*(.*)$/);
  const rawNum = numericMatch ? parseFloat(numericMatch[1]) : parseFloat(data.value) || 0;
  const unit = numericMatch ? numericMatch[2] : "";

  const animatedValue = useAnimatedCounter(rawNum, 700);

  const formattedDisplayValue = numericMatch
    ? `${Number.isInteger(rawNum) ? Math.round(animatedValue) : animatedValue.toFixed(1)}${unit ? " " + unit : ""}`
    : data.value;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${data.title}: ${data.value}`}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300",
        "bg-card hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:-translate-y-0.5 hover:scale-[1.015]",
        onClick && "cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        colors.border,
        colors.bg
      )}
    >
      {/* Decorative gradient orb */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]",
          colors.iconColor.replace("text-", "bg-")
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{data.title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {formattedDisplayValue}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-transform duration-200 group-hover:scale-105",
                data.changeType === "positive" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                data.changeType === "negative" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                data.changeType === "neutral" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              )}
            >
              {data.change}
            </span>
            {data.changeLabel && (
              <span className="text-xs text-muted-foreground">{data.changeLabel}</span>
            )}
          </div>
        </div>

        <div className={cn("rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110", colors.iconBg)}>
          <Icon className={cn("h-5 w-5", colors.iconColor)} />
        </div>
      </div>
    </div>
  );
}
