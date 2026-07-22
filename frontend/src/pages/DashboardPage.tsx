// Dashboard Page — Phase 2A + Phase 4 Polish
// Full SaaS-style energy monitoring dashboard with live data, interactive cards, modals, and refresh UX

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ClassroomGrid } from "@/components/dashboard/ClassroomGrid";
import { EnergyLineChart } from "@/components/dashboard/EnergyLineChart";
import { PowerBarChart } from "@/components/dashboard/PowerBarChart";
import { ConsumptionPieChart } from "@/components/dashboard/ConsumptionPieChart";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { AIHealthModal } from "@/components/dashboard/AIHealthModal";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const {
    classrooms,
    alerts,
    recommendations,
    summaryCards,
    chartData,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
  } = useDashboardData();

  const { settings } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showAIHealthModal, setShowAIHealthModal] = useState(false);

  const handleRefresh = () => {
    refresh();
    // Show toast after data refresh completes
    setTimeout(() => {
      showToast({
        title: "Data Refreshed",
        message: "Data updated successfully",
        type: "success",
        duration: 2500,
      });
    }, 600);
  };

  // Summary card click handlers
  const cardClickHandlers: Record<string, () => void> = {
    "Today's Energy": () => navigate("/analytics"),
    "Carbon Saved": () => navigate("/reports"),
    "Active Alerts": () => {
      // Scroll to alerts section
      document.getElementById("alerts-section")?.scrollIntoView({ behavior: "smooth" });
    },
    "AI Health Score": () => setShowAIHealthModal(true),
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Campus overview with live classroom monitoring and energy metrics.
            </p>
          </div>
        </div>

        {/* Live indicator + Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            {settings.autoRefreshEnabled ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-pulse-live" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">LIVE</span>
                <span className="text-xs text-muted-foreground">
                  · Updating every {settings.refreshInterval}s
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "rounded-lg border border-border bg-card p-2 text-muted-foreground",
              "hover:bg-muted hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Refresh data"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.title}
            data={card}
            onClick={cardClickHandlers[card.title]}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EnergyLineChart data={chartData.dailyEnergy} />
        <PowerBarChart data={chartData.powerDistribution} />
        <ConsumptionPieChart data={chartData.consumptionBreakdown} />
      </div>

      {/* Live Campus Overview */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Live Campus Overview</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {classrooms.length} Rooms
          </span>
        </div>
        <ClassroomGrid classrooms={classrooms} />
      </div>

      {/* Alerts + AI Recommendations Row */}
      <div id="alerts-section" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertsPanel alerts={alerts} />
        <RecommendationsPanel recommendations={recommendations} />
      </div>

      {/* AI Health Modal */}
      {showAIHealthModal && (
        <AIHealthModal onClose={() => setShowAIHealthModal(false)} />
      )}
    </div>
  );
}
