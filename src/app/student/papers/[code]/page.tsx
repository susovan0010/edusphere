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
  Award,
  FileText,
  User,
  Mail,
  GraduationCap,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function StudentPaperDetailPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaperDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/papers/${code}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load paper details", e);
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      loadPaperDetail();
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
            No paper matching code <span className="font-mono text-gold-400">{code}</span> in the current semester.
          </p>
        </Card>
      </AppShell>
    );
  }

  const { subject, attendance, marks, assignments } = data;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Paper Master Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 relative overflow-hidden shadow-aristocrat">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/30">
                  {subject.code}
                </span>
                <Badge variant="gold" size="sm">
                  {subject.credits} Academic Credits
                </Badge>
                <span className="text-xs text-ivory-400">• {subject.semesterLabel}</span>
              </div>

              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
                {subject.name}
              </h1>

              <div className="flex items-center gap-4 mt-2 text-xs text-ivory-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  Faculty: <strong className="text-ivory-100">{subject.teacherName}</strong>
                </span>
                {subject.teacherEmail && (
                  <span className="flex items-center gap-1.5 text-ivory-400">
                    <Mail className="w-3.5 h-3.5" />
                    {subject.teacherEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Attendance Gauge Pill */}
            <div className="bg-navy-950 border border-navy-750 rounded-lg p-4 text-center shrink-0">
              <span className="text-[11px] text-ivory-400 uppercase tracking-wider block">
                Subject Attendance
              </span>
              <span
                className={`font-serif text-3xl font-bold block my-0.5 ${
                  attendance.percentage >= 75 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {attendance.percentage}%
              </span>
              <span className="text-[10px] text-ivory-400 block font-mono">
                {attendance.present} of {attendance.total} lectures attended
              </span>
            </div>
          </div>
        </div>

        {/* Paper Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Marks Breakdown for this Paper */}
          <Card>
            <CardHeader
              title="Evaluation Breakdown"
              subtitle={`Marks scored in ${subject.code}`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/80 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                  <tr>
                    <th className="py-3 px-3">Assessment</th>
                    <th className="py-3 px-3 text-right">Score</th>
                    <th className="py-3 px-3 text-right">Max</th>
                    <th className="py-3 px-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                  {marks?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-ivory-400 italic">
                        No marks logged for this paper yet
                      </td>
                    </tr>
                  ) : (
                    marks?.map((m: any) => {
                      const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                      return (
                        <tr key={m.id} className="hover:bg-navy-800/40">
                          <td className="py-3 px-3 font-medium text-ivory-100">
                            {m.examType === "CT"
                              ? "Class Test (CT)"
                              : m.examType === "MIDSEM"
                              ? "Mid-Semester"
                              : "Assignment"}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-ivory-100">
                            {m.marksObtained}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-ivory-400">
                            {m.maxMarks}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Assignments for this Paper */}
          <Card>
            <CardHeader
              title="Open Assignments & Quizzes"
              subtitle={`Coursework assigned for ${subject.code}`}
            />
            <div className="space-y-3">
              {assignments?.length === 0 ? (
                <p className="text-xs text-ivory-400 italic py-6 text-center">
                  No assignments posted for this paper yet
                </p>
              ) : (
                assignments?.map((a: any) => {
                  const hasSubmitted =
                    a.type === "OBJECTIVE"
                      ? a.assignmentResults?.length > 0
                      : a.submissions?.length > 0;

                  return (
                    <div
                      key={a.id}
                      className="p-3.5 rounded bg-navy-900 border border-navy-700 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={a.type === "OBJECTIVE" ? "sage" : "maroon"}
                            size="sm"
                          >
                            {a.type === "OBJECTIVE" ? "MCQ Quiz" : "Descriptive"}
                          </Badge>
                          {hasSubmitted && (
                            <Badge variant="sage" size="sm">
                              Submitted
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-ivory-100">{a.title}</h4>
                        <p className="text-[11px] text-ivory-400 font-mono">
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Link
                          href={
                            a.type === "OBJECTIVE"
                              ? `/student/assignments/${a.id}/attempt`
                              : `/student/assignments/${a.id}/submit`
                          }
                        >
                          <Button
                            variant={hasSubmitted ? "outline" : "primary"}
                            size="sm"
                          >
                            {hasSubmitted ? "View" : "Open"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
