// Classrooms Page — Phase 3
// Full campus classrooms monitoring with filtering and search

import { useState } from "react";
import { School, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ClassroomCard } from "@/components/dashboard/ClassroomCard";
import type { ClassroomStatus } from "@/types";
import { cn } from "@/lib/utils";

export function ClassroomsPage() {
  const { classrooms, searchQuery, setSearchQuery } = useApp();
  const [statusFilter, setStatusFilter] = useState<ClassroomStatus | "all">("all");

  const filteredClassrooms = classrooms.filter((room) => {
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classrooms Overview</h1>
            <p className="text-sm text-muted-foreground">
              Monitor real-time occupancy, power usage, and risk scores across all 20 campus classrooms.
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                statusFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({classrooms.length})
            </button>
            <button
              onClick={() => setStatusFilter("normal")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                statusFilter === "normal" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Normal ({classrooms.filter((c) => c.status === "normal").length})
            </button>
            <button
              onClick={() => setStatusFilter("warning")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                statusFilter === "warning" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Warning ({classrooms.filter((c) => c.status === "warning").length})
            </button>
            <button
              onClick={() => setStatusFilter("high-usage")}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                statusFilter === "high-usage" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              High Usage ({classrooms.filter((c) => c.status === "high-usage").length})
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Cards Grid */}
      {filteredClassrooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClassrooms.map((room) => (
            <ClassroomCard key={room.id} classroom={room} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground">No classrooms match filters</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try resetting your status filter or search query.
          </p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
