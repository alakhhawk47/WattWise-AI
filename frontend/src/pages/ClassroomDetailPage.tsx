// Classroom Detail Page — Phase 3 + Phase 5 Final Polish
// Comprehensive individual classroom overview with real-time metrics, interactive device toggles, power diff, trend chart, and last updated timestamp

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  School,
  Users,
  Thermometer,
  Droplets,
  Zap,
  Lightbulb,
  Fan,
  AlertTriangle,
  Brain,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { generateDailyEnergyData } from "@/services/mockData";
import { cn } from "@/lib/utils";

export function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClassroomById, toggleDevice, alerts, recommendations, lastUpdated } = useApp();

  const classroom = getClassroomById(id || "");
  const roomTrendData = generateDailyEnergyData();

  if (!classroom) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 animate-fade-in">
        <School className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground">Classroom Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested classroom ID "{id}" could not be found.
        </p>
        <button
          onClick={() => navigate("/classrooms")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
        >
          Back to Classrooms
        </button>
      </div>
    );
  }

  const powerDiff = Math.round((classroom.currentPower - classroom.expectedPower) * 10) / 10;
  const isOverPower = powerDiff > 0;
  const roomAlerts = alerts.filter((a) => a.roomName === classroom.name);
  const roomRecs = recommendations.filter((r) => r.message.includes(classroom.name));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/classrooms")}
          aria-label="Back to Classrooms Overview"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classrooms
        </button>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider font-mono",
            classroom.status === "high-usage" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
            classroom.status === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
            classroom.status === "normal" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
          )}
        >
          {classroom.status}
        </span>
      </div>

      {/* Header Info */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <School className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
          <p className="text-sm text-muted-foreground">
            Real-time IoT sensors and device control simulator
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Occupancy */}
        <div className="rounded-2xl border border-border bg-card p-5 card-hover">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Occupancy</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">{classroom.occupancy} / 45</p>
          <p className="text-xs text-muted-foreground mt-1">Students present</p>
        </div>

        {/* Temperature */}
        <div className="rounded-2xl border border-border bg-card p-5 card-hover">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Temperature</span>
            <Thermometer className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">{classroom.temperature}°C</p>
          <p className="text-xs text-muted-foreground mt-1">Ambient climate</p>
        </div>

        {/* Humidity */}
        <div className="rounded-2xl border border-border bg-card p-5 card-hover">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Humidity</span>
            <Droplets className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">{classroom.humidity}%</p>
          <p className="text-xs text-muted-foreground mt-1">Relative humidity</p>
        </div>

        {/* Risk Score */}
        <div className="rounded-2xl border border-border bg-card p-5 card-hover">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Risk Score</span>
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground font-mono">{classroom.riskScore}</p>
            <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
          </div>
          <p
            className={cn(
              "text-xs font-medium mt-1",
              classroom.riskScore > 70 ? "text-red-500" : classroom.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
            )}
          >
            {classroom.riskScore > 70 ? "Critical Waste Risk" : classroom.riskScore > 40 ? "Moderate Risk" : "Optimal Efficiency"}
          </p>
        </div>
      </div>

      {/* Power Breakdown Card & Interactive Control Simulator */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Power Metrics */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 card-hover">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Power Metrics
          </h3>

          <div className="space-y-3 divide-y divide-border">
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">Current Power</span>
              <span className="text-sm font-bold text-foreground font-mono">{classroom.currentPower} kW</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">Expected Power</span>
              <span className="text-sm font-bold text-foreground font-mono">{classroom.expectedPower} kW</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">Power Difference</span>
              <span
                className={cn(
                  "text-sm font-bold font-mono",
                  isOverPower ? "text-red-500" : "text-emerald-500"
                )}
              >
                {isOverPower ? `+${powerDiff}` : `${powerDiff}`} kW
              </span>
            </div>
          </div>
        </div>

        {/* Device Controls Simulator */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 lg:col-span-2 card-hover">
          <h3 className="text-sm font-semibold text-foreground">Interactive Device Controls</h3>
          <p className="text-xs text-muted-foreground">
            Toggle classroom devices to simulate live sensor feedback and power changes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Lights Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2.5 transition-colors",
                    classroom.lightsOn ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Classroom Lights</p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold">{classroom.lightsOn ? "ON" : "OFF"}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleDevice(classroom.id, "lightsOn")}
                aria-label={`Toggle Classroom Lights ${classroom.lightsOn ? "Off" : "On"}`}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  classroom.lightsOn ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    classroom.lightsOn ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Fans Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2.5 transition-colors",
                    classroom.fansOn ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Fan className="h-5 w-5 animate-spin" style={{ animationDuration: classroom.fansOn ? "3s" : "0s" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ceiling Fans</p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold">{classroom.fansOn ? "ON" : "OFF"}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleDevice(classroom.id, "fansOn")}
                aria-label={`Toggle Ceiling Fans ${classroom.fansOn ? "Off" : "On"}`}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  classroom.fansOn ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    classroom.fansOn ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Trend Chart */}
      <div className="rounded-2xl border border-border bg-card p-5 card-hover">
        <h3 className="text-sm font-semibold text-foreground mb-1">Energy Trend Chart (24h)</h3>
        <p className="text-xs text-muted-foreground mb-4">Actual power usage vs expected baseline for {classroom.name}</p>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roomTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "0.75rem",
                }}
              />
              <Line type="monotone" dataKey="actual" name="Actual (kW)" stroke="hsl(142, 55%, 42%)" strokeWidth={2.5} dot={false} isAnimationActive={true} animationDuration={800} />
              <Line type="monotone" dataKey="predicted" name="Expected (kW)" stroke="hsl(80, 75%, 50%)" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={true} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendation & Recent Alerts for Room */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recommendation */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 card-hover">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-500" />
            AI Recommendation for {classroom.name}
          </h3>

          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-500/10 dark:border-amber-500/20 p-4 text-xs text-foreground leading-relaxed">
            {roomRecs.length > 0 ? (
              roomRecs[0].message
            ) : (
              `WattWise AI suggests keeping ${classroom.name} settings on automatic eco mode to optimize lighting & HVAC.`
            )}
          </div>
        </div>

        {/* Room Alerts */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 card-hover">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Recent Alerts for {classroom.name}
          </h3>

          {roomAlerts.length > 0 ? (
            <div className="space-y-2">
              {roomAlerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
                  <p className="font-semibold text-foreground">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">Severity: {alert.severity.toUpperCase()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No active alerts for this room.</p>
          )}
        </div>
      </div>

      {/* Last Updated Footer */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-4 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono">
          Last updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} — {lastUpdated.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
