// Classroom Detail Page — placeholder for Phase 2B
// Navigation target for classroom card clicks

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, School } from "lucide-react";

export function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <School className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Classroom {id?.replace("room-", "")}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed monitoring and analytics
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
        <div className="text-center">
          <School className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            Classroom Details — Coming in Phase 2B
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Detailed analytics, device controls, and real-time monitoring will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
