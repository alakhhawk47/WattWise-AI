// Energy Consumption Breakdown — Pie Chart
// Shows percentage breakdown by category with rotating entry animation

import { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ConsumptionBreakdownPoint } from "@/types";

interface ConsumptionPieChartProps {
  data: ConsumptionBreakdownPoint[];
}

export const ConsumptionPieChart = memo(function ConsumptionPieChart({ data }: ConsumptionPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-hover">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Energy Consumption</h3>
        <p className="text-xs text-muted-foreground">Breakdown by category</p>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => {
                const num = Number(value);
                return [
                  `${num.toFixed(1)} kWh (${((num / total) * 100).toFixed(0)}%)`,
                  "",
                ];
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: "0.7rem", paddingTop: "4px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
