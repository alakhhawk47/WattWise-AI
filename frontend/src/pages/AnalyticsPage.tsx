import { BarChart3 } from "lucide-react";

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              AI insights, anomaly rankings, and energy waste pattern analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Empty Content Section */}
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            Analytics Coming Soon
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Energy trends, risk distributions, and AI-powered insights will
            appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
