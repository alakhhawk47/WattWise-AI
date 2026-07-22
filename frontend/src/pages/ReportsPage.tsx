// Reports Page — Phase 3
// Campus energy report generation and PDF downloads with interactive toast notifications

import { FileText, Download, Calendar, HardDrive, CheckCircle } from "lucide-react";
import { getReportsList } from "@/services/mockData";
import { useToast } from "@/components/ui/Toast";

export function ReportsPage() {
  const reports = getReportsList();
  const { showToast } = useToast();

  const handleDownload = (title: string) => {
    showToast({
      title: "Download Started",
      message: `"${title}" downloaded successfully.`,
      type: "success",
      duration: 3500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Energy & Sustainability Reports</h1>
          <p className="text-sm text-muted-foreground">
            Download automated PDF audits, weekly energy summaries, and carbon offset statements.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 transition-all space-y-4"
          >
            <div className="space-y-3">
              {/* Category Badge & Icon */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {report.category}
                </span>
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-foreground">{report.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{report.description}</p>
            </div>

            {/* Metadata Footer & Download Button */}
            <div className="pt-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{report.generatedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{report.fileSize}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownload(report.title)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Generation Banner */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Scheduled Automated Reports</h4>
            <p className="text-xs text-muted-foreground">
              WattWise AI compiles weekly & monthly PDF summaries automatically every Sunday at midnight.
            </p>
          </div>
        </div>
        <button
          onClick={() => showToast({ message: "Custom report generation scheduled.", type: "info" })}
          className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shrink-0"
        >
          Schedule Custom Audit
        </button>
      </div>
    </div>
  );
}
