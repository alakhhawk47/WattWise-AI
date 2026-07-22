// Analytics Page — Phase 3
// Comprehensive campus energy analytics, trend charts, rankings, and risk distribution

import { BarChart3, TrendingUp, Leaf, Users, ShieldAlert, PieChart as PieIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { generateAnalyticsData } from "@/services/mockData";

export function AnalyticsPage() {
  const { classrooms, chartData } = useApp();
  const analytics = generateAnalyticsData();

  // Sort classrooms by current power usage
  const sortedByPower = [...classrooms].sort((a, b) => b.currentPower - a.currentPower);
  const highestEnergyRooms = sortedByPower.slice(0, 5);
  const lowestEnergyRooms = sortedByPower.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campus Energy Analytics</h1>
          <p className="text-sm text-muted-foreground">
            In-depth consumption patterns, anomaly risk distribution, and room rankings.
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Carbon Savings Total */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total Carbon Saved</span>
            <Leaf className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.carbonSavedTotal} kg</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            +14% vs last month
          </p>
        </div>

        {/* Avg Occupancy */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Average Occupancy</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.avgOccupancy} students</p>
          <p className="text-xs text-muted-foreground mt-1">Per active classroom</p>
        </div>

        {/* Peak Demand */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Peak Campus Power</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">38.4 kW</p>
          <p className="text-xs text-muted-foreground mt-1">Recorded at 14:00 today</p>
        </div>

        {/* High Risk Rooms */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">High Risk Classrooms</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {classrooms.filter((c) => c.status === "high-usage").length} Rooms
          </p>
          <p className="text-xs text-red-500 font-semibold mt-1">Requires facility action</p>
        </div>
      </div>

      {/* Row 1: Daily Energy Trend & Risk Distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Daily Energy Trend */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Energy Consumption Trend</h3>
            <p className="text-xs text-muted-foreground">Hourly actual energy vs AI predicted model (kWh)</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyEnergy} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: "0.75rem" }} />
                <Line type="monotone" dataKey="actual" name="Actual Usage" stroke="hsl(142, 55%, 42%)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="predicted" name="AI Target" stroke="hsl(80, 75%, 50%)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-primary" />
              Classroom Risk Distribution
            </h3>
            <p className="text-xs text-muted-foreground">Breakdown of 20 classrooms by risk status</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.riskDistribution} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {analytics.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "0.7rem", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Weekly Consumption & Monthly Consumption */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly Consumption */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Weekly Consumption Breakdown</h3>
            <p className="text-xs text-muted-foreground">Actual vs Target consumption by day (kWh)</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Bar dataKey="actual" name="Actual (kWh)" fill="hsl(142, 55%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target (kWh)" fill="hsl(80, 75%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Consumption */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Monthly Consumption & Savings</h3>
            <p className="text-xs text-muted-foreground">Monthly kWh consumption and energy saved</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Bar dataKey="consumption" name="Consumed (kWh)" fill="hsl(200, 70%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saved" name="Saved (kWh)" fill="hsl(142, 55%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Highest vs Lowest Energy Classrooms */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Highest Energy Rooms */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span>Highest Energy Consuming Rooms</span>
            <span className="text-xs text-red-500 font-normal">Top 5</span>
          </h3>

          <div className="space-y-2">
            {highestEnergyRooms.map((room, idx) => (
              <div key={room.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 font-bold text-red-600 dark:text-red-400">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{room.name}</p>
                    <p className="text-muted-foreground">{room.occupancy} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{room.currentPower} kW</p>
                  <p className="text-[10px] text-red-500 font-medium">Risk Score: {room.riskScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Energy Rooms */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span>Most Efficient (Lowest Energy) Rooms</span>
            <span className="text-xs text-emerald-500 font-normal">Top 5</span>
          </h3>

          <div className="space-y-2">
            {lowestEnergyRooms.map((room, idx) => (
              <div key={room.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 font-bold text-emerald-600 dark:text-emerald-400">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{room.name}</p>
                    <p className="text-muted-foreground">{room.occupancy} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{room.currentPower} kW</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Risk Score: {room.riskScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
