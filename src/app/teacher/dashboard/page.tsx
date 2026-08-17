"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  FileText,
  BookOpen,
  ArrowRight,
  Plus,
  TrendingUp,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/teacher/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load teacher dashboard", e);
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
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    );
  }

  const { teacher, stats, assignedPapers, assignments } = data || {};

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 relative overflow-hidden shadow-aristocrat">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                  Faculty Workspace
                </span>
                <Badge variant="gold" size="sm">
                  {teacher?.designation || "Professor"}
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
                {teacher?.name}
              </h1>
              <p className="text-xs text-ivory-400 mt-1">
                Department of {teacher?.department}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/teacher/attendance">
                <Button variant="primary" size="sm">
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                  Take Attendance
                </Button>
              </Link>
              <Link href="/teacher/assignments/new">
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Assignment
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Students Taught
                </p>
                <h3 className="text-2xl font-serif font-bold text-ivory-100 mt-1">
                  {stats?.totalStudentsTaught}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Across assigned sections</p>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Average Attendance
                </p>
                <h3 className="text-2xl font-serif font-bold text-emerald-400 mt-1">
                  {stats?.averageAttendance}%
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Lecture turnout rate</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Assigned Papers
                </p>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mt-1">
                  {stats?.totalSubjectsCount}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">
                  {stats?.pendingProposalsCount > 0
                    ? `${stats.pendingProposalsCount} proposal awaiting approval`
                    : "Fully authorized"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-maroon-500/10 text-maroon-300 border border-maroon-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Active Assignments
                </p>
                <h3 className="text-2xl font-serif font-bold text-ivory-100 mt-1">
                  {stats?.activeAssignmentsCount}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Issued to classes</p>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Papers & Recent Assignments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Papers */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ivory-100">
                Current Semester Papers Taught
              </h2>
              <Link href="/teacher/papers/propose">
                <Button variant="outline" size="sm">
                  + Propose a Paper
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {assignedPapers?.map((paper: any) => (
                <div
                  key={paper.id}
                  className="bg-navy-850 border border-navy-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-navy-900 border border-gold-500/30 flex items-center justify-center font-mono font-bold text-gold-400 text-xs shrink-0">
                      {paper.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-semibold text-ivory-100">
                          {paper.name}
                        </h4>
                        {paper.status === "PENDING" && (
                          <Badge variant="maroon" size="sm">
                            Awaiting Approval
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ivory-400 mt-0.5">
                        {paper.className} • {paper.sectionName} ({paper.studentCount} Students)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Link href={`/teacher/papers/${paper.code}`}>
                      <Button variant="secondary" size="sm">
                        Manage Paper <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Assignments */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Recent Assignments"
                subtitle="Issued tests and lab reports"
                action={
                  <Link href="/teacher/assignments">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                }
              />
              <div className="space-y-3">
                {assignments?.length === 0 ? (
                  <p className="text-xs text-ivory-400 italic py-4 text-center">
                    No assignments issued yet
                  </p>
                ) : (
                  assignments?.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-3 rounded bg-navy-900 border border-navy-750 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-gold-400 font-bold">
                            {a.subject?.code}
                          </span>
                          <Badge
                            variant={a.type === "OBJECTIVE" ? "sage" : "maroon"}
                            size="sm"
                          >
                            {a.type === "OBJECTIVE" ? "MCQ" : "Descriptive"}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-semibold text-ivory-100 line-clamp-1">
                          {a.title}
                        </h4>
                        <span className="text-[10px] text-ivory-400 font-mono">
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <Link href="/teacher/assignments">
                        <Button variant="outline" size="sm" className="text-xs">
                          Submissions
                        </Button>
                      </Link>
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
