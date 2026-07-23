import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbReport } from "@/types/database";
import type { ReportItem } from "@/types";
import { getReportsList } from "@/services/mockData";

export const reportService = {
  /**
   * Fetch reports list from Supabase reports table.
   * Fallback to generated reports list if Supabase is offline or empty.
   */
  async getReports(): Promise<ReportItem[]> {
    if (!isSupabaseConfigured) {
      return getReportsList();
    }

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("generated_at", { ascending: false });

      if (error || !data || data.length === 0) {
        if (error) console.warn("⚠️ Report fetch notice:", error.message);
        return getReportsList();
      }

      return (data as DbReport[]).map((row) => {
        const genDate = new Date(row.generated_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        return {
          id: row.id,
          title: row.title,
          description: `Generated ${row.report_type} energy performance assessment and analytical breakdown.`,
          generatedDate: genDate,
          category: row.report_type,
          fileSize: "2.5 MB",
        };
      });
    } catch (err) {
      console.warn("⚠️ Exception fetching reports:", err);
      return getReportsList();
    }
  },
};
