"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Download, CheckSquare, Users, Award, AlertTriangle } from "lucide-react";

export default function TeacherReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, dRes] = await Promise.all([
          fetch("/api/teacher/students"),
          fetch("/api/teacher/dashboard"),
        ]);
        if (sRes.ok) setStudents(await sRes.json());
        if (dRes.ok) setDashboardData(await dRes.json());
      } catch (e) {
        console.error("Failed to load reports", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    );
  }

  // Attendance distribution histogram data
  const attendanceBins = [
    { range: "< 60%", count: students.filter((s) => s.attendancePercentage < 60).length, fill: "#A6453A" },
    { range: "60-74%", count: students.filter((s) => s.attendancePercentage >= 60 && s.attendancePercentage < 75).length, fill: "#E3C570" },
    { range: "75-89%", count: students.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90).length, fill: "#6B8F71" },
    { range: "90-100%", count: students.filter((s) => s.attendancePercentage >= 90).length, fill: "#C9A227" },
  ];

  const handleExportCSV = () => {
    const headers = "Roll Number,Student Name,Email,Class,Section,Attendance %\n";
    const rows = students
      .map(
        (s) =>
          `"${s.rollNo}","${s.name}","${s.email}","${s.className}","${s.sectionName}",${s.attendancePercentage}%`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Class_Academic_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Faculty Analytics & Departmental Reports
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Attendance distributions, at-risk flags, and CSV spreadsheet exports
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" /> Export Class Records (.CSV)
          </Button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Distribution */}
          <Card>
            <CardHeader
              title="Attendance Distribution Histogram"
              subtitle="Student headcount across attendance brackets"
            />
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceBins} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" />
                  <XAxis dataKey="range" stroke="#A39B8B" fontSize={11} />
                  <YAxis stroke="#A39B8B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101A2E",
                      borderColor: "#223356",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#EDE7DA",
                    }}
                    formatter={(val) => [`${val} Students`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {attendanceBins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Assigned Papers Performance Summary */}
          <Card>
            <CardHeader
              title="Assigned Papers Overview"
              subtitle="Current enrollment & authorized status"
            />
            <div className="space-y-3">
              {dashboardData?.assignedPapers?.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded bg-navy-900 border border-navy-750 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold-400">
                        {p.code}
                      </span>
                      <h4 className="text-xs font-semibold text-ivory-100">{p.name}</h4>
                    </div>
                    <p className="text-[11px] text-ivory-400 mt-0.5">
                      {p.className} • {p.sectionName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={p.status === "PENDING" ? "maroon" : "sage"} size="sm">
                      {p.status}
                    </Badge>
                    <span className="text-[10px] text-ivory-400 block mt-1 font-mono">
                      {p.studentCount} Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
