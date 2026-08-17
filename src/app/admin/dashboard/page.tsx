"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  CheckSquare,
  History,
  ArrowRight,
  ShieldAlert,
  Sliders,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load admin stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
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

  const { stats, recentAudits } = data || {};

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 relative overflow-hidden shadow-aristocrat">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                  Collegiate Administration
                </span>
                <Badge variant="maroon" size="sm">
                  {stats?.currentSemester || "Active Term"}
                </Badge>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
                Institutional Control Centre
              </h1>
              <p className="text-xs text-ivory-400 mt-1">
                University Registry • Access Control & Security Auditing
              </p>
            </div>

            <div className="flex items-center gap-3">
              {stats?.pendingApprovals > 0 && (
                <Link href="/admin/approvals">
                  <Button variant="maroon" size="sm" className="animate-pulse">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    {stats.pendingApprovals} Pending Approvals
                  </Button>
                </Link>
              )}
              <Link href="/admin/students">
                <Button variant="primary" size="sm">
                  Manage Students
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Total Students
                </p>
                <h3 className="text-2xl font-serif font-bold text-ivory-100 mt-1">
                  {stats?.totalStudents}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Enrolled across classes</p>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card accent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                  Faculty Members
                </p>
                <h3 className="text-2xl font-serif font-bold text-gold-400 mt-1">
                  {stats?.totalTeachers}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Across all departments</p>
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
                  Global Attendance
                </p>
                <h3 className="text-2xl font-serif font-bold text-emerald-400 mt-1">
                  {stats?.globalAttendanceRate}%
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Institution-wide average</p>
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
                  Pending Approvals
                </p>
                <h3 className="text-2xl font-serif font-bold text-rose-300 mt-1">
                  {stats?.pendingApprovals}
                </h3>
                <p className="text-[11px] text-ivory-400 mt-1">Teacher self-assigned papers</p>
              </div>
              <div className="p-3 rounded-lg bg-maroon-500/20 text-rose-400 border border-maroon-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Approvals Banner (if any) */}
        {stats?.pendingApprovals > 0 && (
          <div className="p-5 rounded-xl bg-gradient-to-r from-maroon-500/20 via-navy-900 to-navy-900 border border-maroon-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-300">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-sm text-ivory-100">
                  {stats.pendingApprovals} Teacher Self-Assignment Proposal(s) Awaiting Sign-Off
                </h4>
                <p className="text-xs text-ivory-300/90 mt-0.5">
                  Teachers are currently taking attendance while waiting for your review. Approve to
                  unlock grading and assignment permissions.
                </p>
              </div>
            </div>

            <Link href="/admin/approvals" className="shrink-0">
              <Button variant="maroon" size="sm">
                Open Approvals Queue <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Nav Cards & Recent Audits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Management Links */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-ivory-100">Registry Modules</h2>

            <Link href="/admin/students" className="block">
              <Card className="hover:border-gold-500/40 transition-all p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-navy-900 border border-navy-700 text-gold-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory-100">
                      Students Directory
                    </h4>
                    <p className="text-[11px] text-ivory-400">
                      Enroll, edit roll numbers, move sections
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ivory-400" />
              </Card>
            </Link>

            <Link href="/admin/teachers" className="block">
              <Card className="hover:border-gold-500/40 transition-all p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-navy-900 border border-navy-700 text-gold-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory-100">
                      Faculty Directory
                    </h4>
                    <p className="text-[11px] text-ivory-400">
                      Add professors, assign subjects & sections
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ivory-400" />
              </Card>
            </Link>

            <Link href="/admin/classes" className="block">
              <Card className="hover:border-gold-500/40 transition-all p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-navy-900 border border-navy-700 text-maroon-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory-100">
                      Classes, Semesters & Papers
                    </h4>
                    <p className="text-[11px] text-ivory-400">
                      Edit Paper codes/names, toggle active semester
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ivory-400" />
              </Card>
            </Link>
          </div>

          {/* Recent Audit Trail (2 cols) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recent Administrative & Security Audit Trail"
                subtitle="Traceable history of changes to marks, attendance, and paper codes"
                action={
                  <Link href="/admin/audit-log">
                    <Button variant="ghost" size="sm">
                      View All Logs
                    </Button>
                  </Link>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target Table</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                    {recentAudits?.map((log: any) => (
                      <tr key={log.id} className="hover:bg-navy-800/40">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-ivory-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-ivory-100">
                          {log.user?.name || "System"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              log.action === "CREATE"
                                ? "sage"
                                : log.action === "DELETE"
                                ? "rust"
                                : "gold"
                            }
                            size="sm"
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gold-400">
                          {log.targetTable}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
