"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  CheckSquare,
  Award,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  GraduationCap,
  Calendar,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load student dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-serif text-ivory-300">Retrieving Collegiate Records...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const { student, attendance, subjectStats, recentMarks, assignments } = data || {};

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 relative overflow-hidden shadow-aristocrat">
          <div className="absolute top-0 right-0 w-64 h-full bg-gold-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                  Academic Overview
                </span>
                <span className="text-navy-600">•</span>
                <Badge variant="gold" size="sm">
                  {student?.semesterLabel || "Active Semester"}
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
                Welcome, {student?.name}
              </h1>
              <p className="text-xs text-ivory-400 mt-1">
                {student?.className} • {student?.sectionName} • Roll: <span className="font-mono text-gold-400">{student?.rollNo}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/student/assignments">
                <Button variant="primary" size="sm">
                  <FileText className="w-4 h-4 mr-1.5" />
                  View Assignments ({assignments?.pendingCount || 0})
                </Button>
              </Link>
              <Link href="/student/attendance">
                <Button variant="secondary" size="sm">
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                  Full Attendance
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Attendance */}
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Attendance
                </p>
                <h3 className="text-2xl font-serif font-bold text-ivory-100 mt-1">
                  {attendance?.overallPercentage}%
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">
                  {attendance?.presentCount} of {attendance?.totalCount} lectures attended
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Enrolled Papers */}
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Enrolled Papers
                </p>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mt-1">
                  {subjectStats?.length || 0}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">
                  Active in current semester
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Pending Tests / Work
                </p>
                <h3 className="text-2xl font-serif font-bold text-rose-300 mt-1">
                  {assignments?.pendingCount || 0}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">
                  {assignments?.completedCount || 0} already submitted
                </p>
              </div>
              <div className="p-3 rounded-lg bg-maroon-500/20 border border-maroon-500/30 text-rose-400">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Academic Standing */}
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Standing Status
                </p>
                <h3 className="text-2xl font-serif font-bold text-emerald-400 mt-1">
                  Good Standing
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">
                  No attendance shortages
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Papers Drill-Down Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subjects Table (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-ivory-100">
                  Semester Papers & Performance
                </h2>
                <p className="text-xs text-ivory-400">
                  Click any paper code for the complete master-detail breakdown
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {subjectStats?.map((sub: any) => (
                <div
                  key={sub.id}
                  className="bg-navy-850 border border-navy-700/80 rounded-lg p-4 hover:border-gold-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-navy-900 border border-gold-500/30 flex items-center justify-center font-mono font-bold text-gold-400 text-xs shrink-0">
                      {sub.code}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-ivory-100">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-ivory-400 mt-0.5">
                        {sub.teacherName} • <span className="text-gold-400">{sub.credits} Credits</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-ivory-400 block">Attendance</span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          sub.attendancePercentage >= 75 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {sub.attendancePercentage}%
                      </span>
                    </div>

                    <Link href={`/student/papers/${sub.code}`}>
                      <Button variant="outline" size="sm">
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks & Recent Marks (1 col) */}
          <div className="space-y-6">
            {/* Urgent Assignments Card */}
            <Card>
              <CardHeader
                title="Actionable Deadlines"
                subtitle="Upcoming tests and submissions"
              />
              <div className="space-y-3">
                {assignments?.pendingList?.length === 0 ? (
                  <p className="text-xs text-ivory-400 italic py-4 text-center">
                    All assignments and tests completed!
                  </p>
                ) : (
                  assignments?.pendingList?.map((assign: any) => (
                    <div
                      key={assign.id}
                      className="p-3 rounded bg-navy-900 border border-navy-700 flex items-start justify-between gap-2"
                    >
                      <div>
                        <Badge
                          variant={assign.type === "OBJECTIVE" ? "sage" : "gold"}
                          size="sm"
                          className="mb-1"
                        >
                          {assign.type === "OBJECTIVE" ? "MCQ Quiz" : "Descriptive"}
                        </Badge>
                        <h4 className="text-xs font-semibold text-ivory-100 line-clamp-1">
                          {assign.title}
                        </h4>
                        <p className="text-[11px] text-ivory-400 mt-0.5 font-mono">
                          Due: {new Date(assign.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        href={
                          assign.type === "OBJECTIVE"
                            ? `/student/assignments/${assign.id}/attempt`
                            : `/student/assignments/${assign.id}/submit`
                        }
                      >
                        <Button variant="primary" size="sm" className="shrink-0 text-xs">
                          {assign.type === "OBJECTIVE" ? "Attempt" : "Submit"}
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Marks */}
            <Card>
              <CardHeader
                title="Recent Evaluations"
                subtitle="Latest recorded test scores"
              />
              <div className="space-y-2.5">
                {recentMarks?.length === 0 ? (
                  <p className="text-xs text-ivory-400 italic py-4 text-center">
                    No evaluated marks posted yet
                  </p>
                ) : (
                  recentMarks?.slice(0, 4).map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded bg-navy-900/60 border border-navy-750 text-xs"
                    >
                      <div>
                        <span className="font-mono text-gold-400 font-semibold mr-2">
                          {m.subject?.code}
                        </span>
                        <span className="text-ivory-300">
                          {m.examType === "CT"
                            ? "Class Test"
                            : m.examType === "MIDSEM"
                            ? "Mid-Semester"
                            : "Assignment"}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-ivory-100">
                        {m.marksObtained} / {m.maxMarks}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
