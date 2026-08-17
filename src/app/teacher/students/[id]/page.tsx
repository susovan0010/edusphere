"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  CheckSquare,
  FileText,
  ArrowLeft,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export default function StudentDetailReportPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch(`/api/teacher/students/${studentId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load student details", e);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    );
  }

  if (!data || !data.student) {
    return (
      <AppShell>
        <Card className="text-center py-12">
          <h3 className="font-serif text-lg font-bold text-ivory-100">Student Not Found</h3>
        </Card>
      </AppShell>
    );
  }

  const { student, attendances, marks, results, submissions } = data;

  return (
    <AppShell>
      <div className="space-y-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
          className="text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Student Roster
        </Button>

        {/* Header Profile */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 rounded-xl p-6 shadow-aristocrat">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-navy-900 border border-gold-500/40 flex items-center justify-center text-gold-400 font-serif text-2xl font-bold shadow-sm">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                    {student.rollNo}
                  </span>
                  <Badge variant="gold" size="sm">
                    Admission Year: {student.admissionYear}
                  </Badge>
                </div>
                <h1 className="font-serif text-2xl font-bold text-ivory-100">{student.name}</h1>
                <p className="text-xs text-ivory-400 mt-0.5">
                  {student.className} • {student.sectionName} • {student.email}
                </p>
              </div>
            </div>

            <div className="bg-navy-950 border border-navy-750 rounded-lg p-4 text-center shrink-0">
              <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">
                Overall Attendance
              </span>
              <span
                className={`font-serif text-3xl font-bold block my-0.5 ${
                  student.attendancePercentage >= 75 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {student.attendancePercentage}%
              </span>
              {student.attendancePercentage < 75 ? (
                <span className="text-[10px] text-rose-300 font-semibold block">
                  Shortage Flagged
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  Satisfactory
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recorded Examination Marks */}
          <Card>
            <CardHeader
              title="Official Examination Scores"
              subtitle="All internal tests & evaluations"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/80 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Exam Type</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                    <th className="py-2.5 px-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                  {marks?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ivory-400 italic">
                        No marks logged for this student yet
                      </td>
                    </tr>
                  ) : (
                    marks?.map((m: any) => {
                      const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                      return (
                        <tr key={m.id} className="hover:bg-navy-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-gold-400">
                            {m.subject?.code}
                          </td>
                          <td className="py-2.5 px-3 text-ivory-300">
                            {m.examType === "CT"
                              ? "Class Test"
                              : m.examType === "MIDSEM"
                              ? "Mid-Sem"
                              : "Assignment"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-ivory-100">
                            {m.marksObtained}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-ivory-400">
                            {m.maxMarks}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
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

          {/* Objective Auto-Graded Results & Submissions */}
          <Card>
            <CardHeader
              title="Coursework & Auto-Graded Quizzes"
              subtitle="All submitted assignment records"
            />
            <div className="space-y-3">
              {results?.length === 0 && submissions?.length === 0 ? (
                <p className="text-xs text-ivory-400 italic py-6 text-center">
                  No submissions or quiz results logged yet
                </p>
              ) : (
                <>
                  {results?.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3 rounded bg-navy-900 border border-navy-750 flex items-center justify-between"
                    >
                      <div>
                        <Badge variant="sage" size="sm" className="mb-1">
                          Objective MCQ
                        </Badge>
                        <h4 className="text-xs font-semibold text-ivory-100">
                          {r.assignment?.title}
                        </h4>
                        <span className="text-[10px] text-ivory-400 font-mono">
                          Auto-Graded: {new Date(r.calculatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold text-sm block">
                          {r.obtainedMarks} / {r.totalMarks}
                        </span>
                        <span className="text-[10px] text-ivory-400 font-mono">
                          {Math.round(r.percentage)}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {submissions?.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-3 rounded bg-navy-900 border border-navy-750 flex items-center justify-between"
                    >
                      <div>
                        <Badge variant="maroon" size="sm" className="mb-1">
                          Descriptive Submission
                        </Badge>
                        <h4 className="text-xs font-semibold text-ivory-100">
                          {s.assignment?.title}
                        </h4>
                        <span className="text-[10px] text-gold-400 font-mono">
                          Edits used: {s.editCount}/2 • Status: {s.status}
                        </span>
                      </div>

                      {s.driveFileLink && (
                        <a
                          href={s.driveFileLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-gold-400 hover:text-gold-300"
                        >
                          View in Drive
                        </a>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
