"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Award, FileText, CheckCircle2 } from "lucide-react";

export default function StudentMarksPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarks() {
      try {
        const res = await fetch("/api/student/marks");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load marks", e);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
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

  const { marks, assignmentResults, chartData } = data || {};

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Academic Performance & Marks
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Internal assessments, class tests, mid-semester evaluations, and auto-graded quizzes
          </p>
        </div>

        {/* Comparison Bar Chart */}
        <Card>
          <CardHeader
            title="Subject-Wise Examination Comparison"
            subtitle="Percentage scored across examination tiers"
          />
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223B" />
                <XAxis dataKey="subject" stroke="#A39B8B" fontSize={11} />
                <YAxis stroke="#A39B8B" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#101A2E",
                    borderColor: "#223356",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#EDE7DA",
                  }}
                  formatter={(val) => [`${val}%`, ""]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  formatter={(value) => {
                    if (value === "ct") return "Class Test (CT)";
                    if (value === "midsem") return "Mid-Semester";
                    if (value === "endsem") return "End-Semester";
                    if (value === "assignment") return "Assignments";
                    return value;
                  }}
                />
                <Bar dataKey="ct" fill="#C9A227" radius={[4, 4, 0, 0]} />
                <Bar dataKey="midsem" fill="#5B2333" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assignment" fill="#6B8F71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Detailed Marks Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Internal Examinations Table */}
          <Card>
            <CardHeader
              title="Official Internal Evaluation Records"
              subtitle="Verified by departmental faculty"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/80 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                  <tr>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Exam Type</th>
                    <th className="py-3 px-3 text-right">Score</th>
                    <th className="py-3 px-3 text-right">Max</th>
                    <th className="py-3 px-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                  {marks?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ivory-400 italic">
                        No marks logged yet
                      </td>
                    </tr>
                  ) : (
                    marks?.map((m: any) => {
                      const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                      return (
                        <tr key={m.id} className="hover:bg-navy-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-gold-400">
                            {m.subject?.code}
                          </td>
                          <td className="py-3 px-3 text-ivory-300">
                            {m.examType === "CT"
                              ? "Class Test"
                              : m.examType === "MIDSEM"
                              ? "Mid-Semester"
                              : "Assignment Evaluation"}
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

          {/* Objective Auto-Graded Results */}
          <Card>
            <CardHeader
              title="Instant Auto-Graded Quizzes"
              subtitle="Objective MCQ tests scored automatically on submission"
            />
            <div className="space-y-3">
              {assignmentResults?.length === 0 ? (
                <p className="text-xs text-ivory-400 italic py-6 text-center">
                  No auto-graded quiz attempts yet
                </p>
              ) : (
                assignmentResults?.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded bg-navy-900 border border-navy-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gold-400">
                          {r.assignment?.subject?.code}
                        </span>
                        <Badge variant="sage" size="sm">
                          Instant Auto-Graded
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-ivory-100">
                        {r.assignment?.title}
                      </h4>
                      <p className="text-[11px] text-ivory-400 mt-0.5">
                        Scored on {new Date(r.calculatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif text-lg font-bold text-emerald-400 block leading-tight">
                        {r.obtainedMarks} / {r.totalMarks}
                      </span>
                      <span className="text-[11px] font-mono text-ivory-400">
                        {Math.round(r.percentage)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
