"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  FileText,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  ExternalLink,
  Award,
  X,
} from "lucide-react";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submissions review modal state
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [gradeInput, setGradeInput] = useState<Record<string, string>>({});
  const [gradeSaving, setGradeSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await fetch("/api/teacher/assignments");
        if (res.ok) {
          const json = await res.json();
          setAssignments(json);
        }
      } catch (e) {
        console.error("Failed to load assignments", e);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const openSubmissionsModal = async (id: string) => {
    setActiveReviewId(id);
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/teacher/assignments/${id}/submissions`);
      if (res.ok) {
        const json = await res.json();
        setReviewData(json);
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSaveGrade = async (studentId: string) => {
    const marks = gradeInput[studentId];
    if (marks === undefined || marks === "") return;

    setGradeSaving(studentId);
    try {
      const res = await fetch(`/api/teacher/assignments/${activeReviewId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          marksObtained: marks,
        }),
      });

      if (res.ok) {
        alert("Grade recorded and student notified!");
      }
    } catch (e) {
      console.error("Grading failed", e);
    } finally {
      setGradeSaving(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Assignment & Quiz Management
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Issue dual-mode assignments, configure question banks, and review submissions
            </p>
          </div>

          <Link href="/teacher/assignments/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" /> Issue New Assignment
            </Button>
          </Link>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : assignments.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-ivory-400 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-ivory-100">
              No assignments published yet
            </h3>
            <p className="text-xs text-ivory-400 mt-1 max-w-sm mx-auto">
              Create an objective MCQ quiz or descriptive coursework assignment for your class.
            </p>
            <div className="mt-4">
              <Link href="/teacher/assignments/new">
                <Button variant="primary" size="sm">
                  Create First Assignment
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="bg-navy-850 border border-navy-700/80 rounded-lg p-5 hover:border-gold-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                      {a.subject?.code}
                    </span>
                    <Badge
                      variant={a.type === "OBJECTIVE" ? "sage" : "maroon"}
                      size="sm"
                    >
                      {a.type === "OBJECTIVE" ? "Objective MCQ" : "Descriptive File/Text"}
                    </Badge>
                    <span className="text-xs text-ivory-400">
                      {a.section?.class?.name} • {a.section?.name}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-semibold text-ivory-100">
                    {a.title}
                  </h3>
                  <p className="text-xs text-ivory-300/80 leading-relaxed line-clamp-2">
                    {a.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-ivory-400 pt-1">
                    <span>Max: {a.maxMarks} Marks</span>
                    <span>•</span>
                    <span>{a._count?.questions || 0} Questions</span>
                    <span>•</span>
                    <span className="font-mono text-rose-300">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 self-end md:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openSubmissionsModal(a.id)}
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    Review Submissions (
                    {a.type === "OBJECTIVE"
                      ? a.assignmentResults?.length
                      : a.submissions?.length}
                    )
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submissions Review Modal */}
        {activeReviewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-navy-700/80">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ivory-100">
                    Submissions: {reviewData?.assignment?.title}
                  </h3>
                  <p className="text-xs text-ivory-400">
                    {reviewData?.assignment?.type === "OBJECTIVE"
                      ? "Instant auto-graded multiple-choice response records"
                      : "Descriptive student uploads stored in your Google Drive folder"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveReviewId(null)}
                  className="p-1.5 rounded-md hover:bg-navy-800 text-ivory-400 hover:text-ivory-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {reviewLoading ? (
                  <div className="py-12 text-center text-ivory-400 text-xs">
                    Loading student responses...
                  </div>
                ) : (
                  reviewData?.students?.map((s: any) => (
                    <div
                      key={s.studentId}
                      className="p-4 rounded-lg bg-navy-850 border border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gold-400 font-bold">
                            {s.rollNo}
                          </span>
                          <span className="font-semibold text-ivory-100">{s.studentName}</span>
                          {s.submitted ? (
                            <Badge variant="sage" size="sm">
                              Submitted
                            </Badge>
                          ) : (
                            <Badge variant="rust" size="sm">
                              Pending
                            </Badge>
                          )}
                        </div>

                        {/* Objective details */}
                        {s.objectiveResult && (
                          <div className="mt-1 text-emerald-400 font-mono font-semibold">
                            Score: {s.objectiveResult.obtainedMarks} /{" "}
                            {s.objectiveResult.totalMarks} (
                            {Math.round(s.objectiveResult.percentage)}%)
                          </div>
                        )}

                        {/* Descriptive details */}
                        {s.descriptiveSubmission && (
                          <div className="mt-1 text-ivory-300 space-y-0.5">
                            <p className="line-clamp-2 italic text-ivory-400">
                              "{s.descriptiveSubmission.textContent || "Uploaded document"}"
                            </p>
                            <p className="text-[11px] text-gold-400 font-mono">
                              Edits: {s.descriptiveSubmission.editCount}/2 • Status:{" "}
                              {s.descriptiveSubmission.status}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action / Descriptive manual grading */}
                      {reviewData?.assignment?.type === "DESCRIPTIVE" && s.descriptiveSubmission && (
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <input
                            type="number"
                            placeholder="Marks"
                            value={gradeInput[s.studentId] ?? ""}
                            onChange={(e) =>
                              setGradeInput({ ...gradeInput, [s.studentId]: e.target.value })
                            }
                            className="w-20 bg-navy-950 border border-navy-700 rounded px-2.5 py-1 text-xs text-ivory-100 font-mono"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={gradeSaving === s.studentId}
                            onClick={() => handleSaveGrade(s.studentId)}
                          >
                            Grade
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
