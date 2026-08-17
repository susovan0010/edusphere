"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  Award,
  ExternalLink,
} from "lucide-react";

export default function StudentAssignmentsPage() {
  const [data, setData] = useState<{ pending: any[]; submitted: any[] }>({
    pending: [],
    submitted: [],
  });
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await fetch("/api/student/assignments");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load assignments", e);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
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

  const { pending, submitted } = data;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Assignments & Examinations
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Submit descriptive coursework or attempt objective auto-graded multiple-choice quizzes
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-navy-850 border border-navy-700 w-fit">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-gold-500 text-navy-950 font-bold shadow-sm"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({pending.length})
            </button>

            <button
              onClick={() => setActiveTab("submitted")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "submitted"
                  ? "bg-gold-500 text-navy-950 font-bold shadow-sm"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Submitted ({submitted.length})
            </button>
          </div>
        </div>

        {/* Content List */}
        {activeTab === "pending" ? (
          <div className="space-y-4">
            {pending.length === 0 ? (
              <Card className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  You're all caught up!
                </h3>
                <p className="text-xs text-ivory-400 mt-1 max-w-sm mx-auto">
                  There are no pending assignments or quizzes requiring your submission at this time.
                </p>
              </Card>
            ) : (
              pending.map((item) => (
                <div
                  key={item.id}
                  className="bg-navy-850 border border-navy-700 rounded-lg p-5 hover:border-gold-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                        {item.subjectCode}
                      </span>
                      <Badge
                        variant={item.type === "OBJECTIVE" ? "sage" : "maroon"}
                        size="sm"
                      >
                        {item.type === "OBJECTIVE" ? "Objective (MCQ)" : "Descriptive File/Text"}
                      </Badge>
                      <span className="text-xs text-ivory-400">
                        Max Marks: <strong className="text-ivory-200">{item.maxMarks}</strong>
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-ivory-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-ivory-300/80 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-ivory-400 pt-1">
                      <span>Faculty: {item.teacherName}</span>
                      <span>•</span>
                      <span className="font-mono text-rose-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 self-end md:self-center">
                    <Link
                      href={
                        item.type === "OBJECTIVE"
                          ? `/student/assignments/${item.id}/attempt`
                          : `/student/assignments/${item.id}/submit`
                      }
                    >
                      <Button variant="primary" size="md">
                        {item.type === "OBJECTIVE" ? "Attempt Quiz" : "Submit Assignment"}{" "}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {submitted.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-ivory-400/40 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  No submissions yet
                </h3>
                <p className="text-xs text-ivory-400 mt-1 max-w-sm mx-auto">
                  Completed coursework and auto-graded tests will appear here with verification receipts.
                </p>
              </Card>
            ) : (
              submitted.map((item) => (
                <div
                  key={item.id}
                  className="bg-navy-850 border border-navy-700/80 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold-400">
                        {item.subjectCode}
                      </span>
                      <Badge variant="sage" size="sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Submitted
                      </Badge>
                      {item.submission?.status === "LOCKED" && (
                        <Badge variant="rust" size="sm">
                          <Lock className="w-3 h-3" /> Locked
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif text-base font-semibold text-ivory-100">
                      {item.title}
                    </h3>

                    {/* Objective Score vs Descriptive edit info */}
                    {item.type === "OBJECTIVE" && item.result && (
                      <div className="p-3 rounded bg-navy-900 border border-navy-750 flex items-center justify-between text-xs max-w-md">
                        <div>
                          <span className="text-ivory-400 block">Instant Auto-Grade Score:</span>
                          <span className="font-mono text-emerald-400 font-bold text-base">
                            {item.result.obtainedMarks} / {item.result.totalMarks} ({Math.round(item.result.percentage)}%)
                          </span>
                        </div>
                        <Badge variant="sage" size="sm">
                          Locked on Submit
                        </Badge>
                      </div>
                    )}

                    {item.type === "DESCRIPTIVE" && item.submission && (
                      <div className="text-xs text-ivory-300 space-y-1">
                        <p className="text-ivory-400">
                          Submitted on: {new Date(item.submission.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-gold-400/90 font-medium">
                          Edit attempts used: {item.submission.editCount} of 2 allowed (
                          {item.submission.editCount >= 2
                            ? "Submission permanently locked"
                            : `${2 - item.submission.editCount} edit(s) remaining`}
                          )
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action / Re-edit button for descriptive if remaining edits > 0 */}
                  <div className="shrink-0 flex items-center gap-3 self-end md:self-center">
                    {item.type === "DESCRIPTIVE" &&
                      item.submission &&
                      item.submission.editCount < 2 && (
                        <Link href={`/student/assignments/${item.id}/submit`}>
                          <Button variant="outline" size="sm">
                            Edit Submission ({2 - item.submission.editCount} left)
                          </Button>
                        </Link>
                      )}

                    {item.submission?.driveFileLink && (
                      <a
                        href={item.submission.driveFileLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                      >
                        Teacher Drive File <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
