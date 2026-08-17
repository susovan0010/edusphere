"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Cloud,
  FileCheck,
} from "lucide-react";

export default function DescriptiveSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadAssignment() {
      try {
        const res = await fetch(`/api/student/assignments/${assignmentId}`);
        if (res.ok) {
          const json = await res.json();
          setAssignment(json.assignment);
          if (json.submission) {
            setSubmission(json.submission);
            setTextContent(json.submission.textContent || "");
          }
        }
      } catch (e) {
        console.error("Failed to load assignment", e);
      } finally {
        setLoading(false);
      }
    }
    loadAssignment();
  }, [assignmentId]);

  const editCount = submission?.editCount ?? 0;
  const isLocked = submission?.status === "LOCKED" || editCount >= 2;
  const remainingEdits = Math.max(0, 2 - editCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent,
          fileName: selectedFile ? selectedFile.name : `submission_${Date.now()}.txt`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmission(data.submission);
        setMessage({
          type: "success",
          text: `Submission uploaded to Teacher's Google Drive! (${data.remainingEdits} edits remaining)`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to submit assignment.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred during upload.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Assignment Briefing Card */}
        <div className="bg-navy-850 border border-navy-700/80 rounded-xl p-6 shadow-aristocrat">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-gold-400">
                  {assignment?.subjectCode}
                </span>
                <Badge variant="maroon" size="sm">
                  Descriptive Coursework
                </Badge>
                {isLocked ? (
                  <Badge variant="rust" size="sm">
                    <Lock className="w-3 h-3 mr-1" /> Locked (Max Edits)
                  </Badge>
                ) : (
                  <Badge variant="gold" size="sm">
                    {submission ? `Edit Mode (${remainingEdits} left)` : "Initial Attempt"}
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-xl font-bold text-ivory-100">
                {assignment?.title}
              </h1>
              <p className="text-xs text-ivory-300/90 mt-1 leading-relaxed">
                {assignment?.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-ivory-400 block">Due Date</span>
              <span className="text-xs font-mono text-rose-300 font-bold block">
                {new Date(assignment?.dueDate).toLocaleDateString()}
              </span>
              <span className="text-xs text-gold-400 font-mono mt-1 block">
                Max {assignment?.maxMarks} Marks
              </span>
            </div>
          </div>
        </div>

        {/* 2-Edit Policy Alert Bar */}
        <div className="p-4 rounded-lg bg-navy-900 border border-gold-500/30 flex items-start gap-3">
          <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-ivory-100">
              Institutional Submission Rule (Max 2 Edits)
            </h4>
            <p className="text-ivory-300/80 leading-relaxed">
              You may submit your work, then edit up to <strong>two times total</strong> if you spot
              mistakes. After the 2nd edit, the submission is permanently locked and final. Files are
              automatically routed and saved in the <strong>Teacher's Google Drive</strong>.
            </p>
            <div className="pt-1 font-mono text-gold-400 font-semibold">
              Status: Attempt {editCount + (submission ? 1 : 0)} of 3 •{" "}
              {isLocked
                ? "Locked (No more edits permitted)"
                : `${remainingEdits} edit(s) remaining`}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-xs flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-sage-500/20 border border-sage-500/40 text-emerald-300"
                : "bg-rust-500/20 border border-rust-500/40 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submission Form */}
        <Card className="p-6 md:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-2 uppercase tracking-wider">
                Descriptive Answer / Report Notes
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                disabled={isLocked}
                rows={8}
                placeholder="Write or paste your comprehensive long-form solution, derivation, or lab analysis..."
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-4 text-xs font-sans text-ivory-100 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-2 uppercase tracking-wider">
                Attach Document / PDF File
              </label>
              <div className="border-2 border-dashed border-navy-700 hover:border-gold-500/40 rounded-lg p-6 text-center bg-navy-950 transition-colors">
                <Cloud className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                <p className="text-xs text-ivory-200">
                  {selectedFile ? selectedFile.name : "Select PDF report or code archive to upload"}
                </p>
                <p className="text-[11px] text-ivory-400 mt-1">
                  File will be saved in Teacher's Drive under `CollegeApp/Assignments/{assignment?.title}`
                </p>
                <input
                  type="file"
                  id="file-upload"
                  disabled={isLocked}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                {!isLocked && (
                  <label
                    htmlFor="file-upload"
                    className="inline-block mt-3 px-4 py-2 rounded bg-navy-800 hover:bg-navy-750 text-gold-400 text-xs font-medium cursor-pointer border border-navy-700"
                  >
                    Browse Local File
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => router.push("/student/assignments")}
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLocked}
                isLoading={submitting}
              >
                {isLocked
                  ? "Submission Locked"
                  : submission
                  ? `Save Edit (${remainingEdits} left)`
                  : "Submit to Teacher"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
