import { School } from "lucide-react";

export function ClassroomsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classrooms</h1>
            <p className="text-sm text-muted-foreground">
              Live status of all monitored classrooms with occupancy and device
              data.
            </p>
          </div>
        </div>
      </div>

      {/* Empty Content Section */}
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <div className="text-center">
          <School className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            Classrooms Coming Soon
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/70">
            ECE-201 through ECE-205 classroom cards with live sensor data will
            appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
