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
import { TrendingUp, Download, CheckSquare, GraduationCap, Users } from "lucide-react";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load admin reports", e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
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

  const { stats } = data || {};

  const departmentData = [
    { name: "Electronics (ECE)", students: 45, attendance: 92, fill: "#C9A227" },
    { name: "Computer Science (CSE)", students: 60, attendance: 88, fill: "#5B2333" },
    { name: "Applied Maths", students: 30, attendance: 95, fill: "#6B8F71" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Institution-Wide Academic Reports
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Cross-departmental attendance metrics, student capacity, and performance indicators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Attendance Comparison */}
          <Card>
            <CardHeader
              title="Departmental Attendance Rate"
              subtitle="Comparison across academic branches"
            />
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16223B" />
                  <XAxis dataKey="name" stroke="#A39B8B" fontSize={11} />
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
                  <Bar dataKey="attendance" fill="#C9A227" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Institutional Stats Summary */}
          <Card>
            <CardHeader
              title="Registry Key Performance Indicators"
              subtitle="Real-time database aggregated metrics"
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Total Enrolled Students</span>
                <span className="font-serif text-2xl font-bold text-gold-400">
                  {stats?.totalStudents}
                </span>
              </div>

              <div className="p-4 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Faculty Strength</span>
                <span className="font-serif text-2xl font-bold text-ivory-100">
                  {stats?.totalTeachers}
                </span>
              </div>

              <div className="p-4 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Global Turnout Average</span>
                <span className="font-serif text-2xl font-bold text-emerald-400">
                  {stats?.globalAttendanceRate}%
                </span>
              </div>

              <div className="p-4 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Active Academic Term</span>
                <span className="font-serif text-lg font-bold text-gold-300">
                  {stats?.currentSemester}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
