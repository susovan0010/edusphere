"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  FileText,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Lock,
} from "lucide-react";

export default function TeacherPaperDetailPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaper() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/papers/${code}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load paper detail", e);
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      loadPaper();
    }
  }, [code]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    );
  }

  if (!data || !data.subject) {
    return (
      <AppShell>
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-ivory-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ivory-100">Paper Not Found</h3>
          <p className="text-xs text-ivory-400 mt-1">
            You are not assigned to paper <span className="font-mono text-gold-400">{code}</span> in the current semester.
          </p>
        </Card>
      </AppShell>
    );
  }

  const { subject, stats, enrolledStudents, status, notes } = data;
  const isPending = status === "PENDING";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Paper Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 shadow-aristocrat">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/30">
                  {subject.code}
                </span>
                <Badge variant={isPending ? "maroon" : "gold"} size="sm">
                  {isPending ? "Awaiting Admin Approval" : "Authorized & Active"}
                </Badge>
                <span className="text-xs text-ivory-400">• {subject.semesterLabel}</span>
              </div>

              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
                {subject.name}
              </h1>

              <p className="text-xs text-ivory-300 mt-1">
                Taught to: <strong className="text-ivory-100">{subject.className}</strong> •{" "}
                <strong className="text-ivory-100">{subject.sectionName}</strong> ({stats.studentCount} Students Enrolled)
              </p>
            </div>

            <div className="bg-navy-950 border border-navy-750 rounded-lg p-4 text-center shrink-0">
              <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">
                Class Attendance
              </span>
              <span className="font-serif text-3xl font-bold text-emerald-400 block my-0.5">
                {stats.averageAttendance}%
              </span>
              <span className="text-[10px] text-ivory-400 block">Lecture Turnout Rate</span>
            </div>
          </div>
        </div>

        {/* Section 5B: PENDING Feature Gating Banner */}
        {isPending && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-maroon-500/20 via-navy-900 to-navy-900 border border-maroon-500/40 space-y-2">
            <div className="flex items-center gap-2.5 text-maroon-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <h3 className="font-serif font-bold text-sm text-ivory-100">
                Self-Assignment Pending Admin Approval (Section 5B Rule)
              </h3>
            </div>
            <p className="text-xs text-ivory-300 leading-relaxed">
              You proposed to teach this paper. <strong>Attendance marking is fully enabled</strong> so
              classroom sessions are uninterrupted. However, creating assignments, entering marks,
              and question bank management for this paper remain locked until Admin signs off.
            </p>
            {notes && (
              <p className="text-[11px] text-gold-400/90 font-mono pt-1">
                Proposal Note: "{notes}"
              </p>
            )}
          </div>
        )}

        {/* Quick Action Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Take Attendance (Always allowed even while PENDING) */}
          <Link href="/teacher/attendance" className="block">
            <Card className="hover:border-gold-500/40 transition-all p-5 h-full flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-lg bg-gold-500/10 text-gold-400 w-fit mb-3 border border-gold-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-semibold text-ivory-100">
                  Take Attendance
                </h4>
                <p className="text-xs text-ivory-400 mt-1">
                  Mark daily attendance for {subject.code}
                </p>
              </div>
              <span className="text-xs text-gold-400 font-semibold flex items-center gap-1 mt-4">
                Open Attendance Sheet <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>

          {/* Create Assignment (Gated if PENDING) */}
          {isPending ? (
            <div className="opacity-60 cursor-not-allowed">
              <Card className="p-5 h-full flex flex-col justify-between border-dashed">
                <div>
                  <div className="p-3 rounded-lg bg-navy-800 text-ivory-400 w-fit mb-3 border border-navy-700">
                    <Lock className="w-5 h-5 text-rose-400" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-ivory-300">
                    Assignments (Locked)
                  </h4>
                  <p className="text-xs text-ivory-400 mt-1">
                    Unlocks upon Admin approval
                  </p>
                </div>
                <span className="text-xs text-rose-400 font-mono mt-4 block">
                  Awaiting Approval
                </span>
              </Card>
            </div>
          ) : (
            <Link href="/teacher/assignments/new" className="block">
              <Card className="hover:border-gold-500/40 transition-all p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-sage-500/10 text-emerald-400 w-fit mb-3 border border-sage-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-ivory-100">
                    Issue Assignment
                  </h4>
                  <p className="text-xs text-ivory-400 mt-1">
                    Create MCQ quiz or descriptive task
                  </p>
                </div>
                <span className="text-xs text-gold-400 font-semibold flex items-center gap-1 mt-4">
                  New Assignment <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Card>
            </Link>
          )}

          {/* Marks Entry (Gated if PENDING) */}
          {isPending ? (
            <div className="opacity-60 cursor-not-allowed">
              <Card className="p-5 h-full flex flex-col justify-between border-dashed">
                <div>
                  <div className="p-3 rounded-lg bg-navy-800 text-ivory-400 w-fit mb-3 border border-navy-700">
                    <Lock className="w-5 h-5 text-rose-400" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-ivory-300">
                    Marks Entry (Locked)
                  </h4>
                  <p className="text-xs text-ivory-400 mt-1">
                    Unlocks upon Admin approval
                  </p>
                </div>
                <span className="text-xs text-rose-400 font-mono mt-4 block">
                  Awaiting Approval
                </span>
              </Card>
            </div>
          ) : (
            <Link href="/teacher/marks" className="block">
              <Card className="hover:border-gold-500/40 transition-all p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-lg bg-maroon-500/10 text-maroon-300 w-fit mb-3 border border-maroon-500/20">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-ivory-100">
                    Enter Marks
                  </h4>
                  <p className="text-xs text-ivory-400 mt-1">
                    Record CT and Mid-Semester evaluations
                  </p>
                </div>
                <span className="text-xs text-gold-400 font-semibold flex items-center gap-1 mt-4">
                  Marks Portal <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Card>
            </Link>
          )}
        </div>

        {/* Enrolled Students Roster */}
        <Card>
          <CardHeader
            title={`Enrolled Students (${enrolledStudents.length})`}
            subtitle={`Registered under ${subject.className} - ${subject.sectionName}`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Collegiate Email</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {enrolledStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-navy-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-gold-400">{s.rollNo}</td>
                    <td className="py-3 px-4 font-semibold text-ivory-100">{s.name}</td>
                    <td className="py-3 px-4 text-ivory-400 font-mono">{s.email}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/teacher/students/${s.id}`}>
                        <Button variant="ghost" size="sm">
                          View Academic Profile
                        </Button>
                      </Link>
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
