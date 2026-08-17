"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CheckSquare, XCircle, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch("/api/student/attendance");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load attendance", e);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
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

  const { summary, pieData, timeline, subjectBreakdown } = data || {};

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Attendance Analytics
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Detailed lecture logs, attendance ratios, and subject breakdown
          </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart Card (1 col) */}
          <Card className="flex flex-col items-center justify-center">
            <CardHeader
              title="Attendance Distribution"
              subtitle="Present vs Absent Ratio"
              className="w-full"
            />
            <div className="w-full h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101A2E",
                      borderColor: "#223356",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#EDE7DA",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-serif text-2xl font-bold text-ivory-100">
                  {summary?.percentage}%
                </span>
                <span className="text-[10px] text-ivory-400 uppercase tracking-wider">
                  Overall
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sage-500"></span>
                <span className="text-ivory-300">Present ({summary?.present})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rust-500"></span>
                <span className="text-ivory-300">Absent ({summary?.absent})</span>
              </div>
            </div>
          </Card>

          {/* Timeline Trend Line Chart (2 cols) */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Attendance Trajectory"
              subtitle="Chronological attendance rate across all lectures"
            />
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" />
                  <XAxis
                    dataKey="date"
                    stroke="#A39B8B"
                    fontSize={11}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis stroke="#A39B8B" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101A2E",
                      borderColor: "#223356",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#EDE7DA",
                    }}
                    formatter={(val) => [`${val}%`, "Attendance"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#C9A227"
                    strokeWidth={2.5}
                    dot={{ fill: "#C9A227", r: 4 }}
                    activeDot={{ r: 6, fill: "#E3C570" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Subject-Wise Breakdown Table */}
        <Card>
          <CardHeader
            title="Subject-Wise Attendance Breakdown"
            subtitle="Minimum institutional requirement: 75%"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900/80 text-ivory-400 uppercase tracking-wider text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Paper Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4 text-center">Lectures Held</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {subjectBreakdown?.map((sub: any) => (
                  <tr key={sub.subjectId} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ivory-100">
                      {sub.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{sub.total}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-400">
                      {sub.present}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-rose-400">
                      {sub.absent}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                      <span className={sub.percentage >= 75 ? "text-emerald-400" : "text-rose-400"}>
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.percentage >= 75 ? (
                        <Badge variant="sage" size="sm">
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="rust" size="sm">
                          Shortage
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
