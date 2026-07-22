// Reports Page — Phase 3 + Phase 5 Final Polish
// Campus energy report generation with real downloadable PDF files via jspdf, card-hover elevation, and toasts

import { useState } from "react";
import { FileText, Download, Calendar, HardDrive, CheckCircle, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { getReportsList } from "@/services/mockData";
import { useToast } from "@/components/ui/Toast";
import type { ReportItem } from "@/types";

function generateReportPDF(report: ReportItem) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(22, 78, 46);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("WattWise AI", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Smart Classroom Energy Monitoring Dashboard", 15, 27);

  // Report title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(report.title, 15, 50);

  // Report metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${report.generatedDate}`, 15, 60);
  doc.text(`Category: ${report.category}`, 15, 67);
  doc.text(`Report ID: ${report.id.toUpperCase()}`, 15, 74);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 80, pageWidth - 15, 80);

  // Description
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.text("Report Summary", 15, 90);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(report.description, pageWidth - 30);
  doc.text(descLines, 15, 98);

  // Simulated data table
  let yPos = 115;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Key Metrics", 15, yPos);
  yPos += 10;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Metric", 20, yPos + 1);
  doc.text("Value", 90, yPos + 1);
  doc.text("Status", 140, yPos + 1);
  yPos += 12;

  // Table rows
  const metrics = [
    { metric: "Total Energy Consumed", value: `${(Math.random() * 200 + 300).toFixed(1)} kWh`, status: "Normal" },
    { metric: "Peak Power Demand", value: `${(Math.random() * 20 + 25).toFixed(1)} kW`, status: "Monitored" },
    { metric: "Average Occupancy", value: `${Math.floor(Math.random() * 15 + 20)} students`, status: "Active" },
    { metric: "Carbon Offset", value: `${(Math.random() * 30 + 40).toFixed(1)} kg CO₂`, status: "Positive" },
    { metric: "Energy Waste Detected", value: `${(Math.random() * 40 + 10).toFixed(1)} kWh`, status: "Warning" },
    { metric: "AI Prediction Accuracy", value: `${Math.floor(Math.random() * 5 + 93)}%`, status: "Optimal" },
    { metric: "Active Alerts Resolved", value: `${Math.floor(Math.random() * 8 + 5)} / ${Math.floor(Math.random() * 3 + 10)}`, status: "In Progress" },
    { metric: "Rooms Monitored", value: "20", status: "Active" },
  ];

  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  metrics.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(15, yPos - 5, pageWidth - 30, 9, "F");
    }
    doc.text(row.metric, 20, yPos);
    doc.text(row.value, 90, yPos);
    doc.text(row.status, 140, yPos);
    yPos += 9;
  });

  // Recommendations section
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("AI Recommendations", 15, yPos);
  yPos += 8;

  const recommendations = [
    "Implement after-hours auto-shutoff for classrooms in Block B to reduce 12% energy waste.",
    "Room 305 shows consistent over-consumption. Consider HVAC recalibration.",
    "Occupancy-based fan control could save approximately 8.5 kWh/day campus-wide.",
  ];

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  recommendations.forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, 20, yPos);
    yPos += 7;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("WattWise AI — Automated Energy Report", 15, footerY);
  doc.text(`Page 1 of 1`, pageWidth - 35, footerY);

  const fileName = `${report.category}_Report.pdf`;
  doc.save(fileName);
}

export function ReportsPage() {
  const reports = getReportsList();
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (report: ReportItem) => {
    setDownloadingId(report.id);

    setTimeout(() => {
      try {
        generateReportPDF(report);
        showToast({
          title: "Report Downloaded",
          message: `"${report.title}" downloaded successfully`,
          type: "success",
          duration: 3500,
        });
      } catch (e) {
        console.error("PDF generation error:", e);
        showToast({
          title: "Download Failed",
          message: "Failed to generate PDF. Please try again.",
          type: "error",
          duration: 3500,
        });
      } finally {
        setDownloadingId(null);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm card-hover space-y-4"
          >
            <div className="space-y-3">
              {/* Category Badge & Icon */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary font-mono">
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
                  <span className="font-mono">{report.fileSize}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownload(report)}
                disabled={downloadingId === report.id}
                aria-label={`Download ${report.title} PDF`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloadingId === report.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Generation Banner */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 card-hover">
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
          onClick={() => showToast({ title: "Custom Audit Scheduled", message: "Custom report generation scheduled for next cycle.", type: "info" })}
          aria-label="Schedule custom energy audit"
          className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-primary"
        >
          Schedule Custom Audit
        </button>
      </div>
    </div>
  );
}
