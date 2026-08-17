"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function NewAssignmentPage() {
  const router = useRouter();

  const [subjectsTaught, setSubjectsTaught] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"DESCRIPTIVE" | "OBJECTIVE">("OBJECTIVE");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [maxMarks, setMaxMarks] = useState(25);

  // Question Bank integration
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  // Custom questions
  const [customQuestions, setCustomQuestions] = useState<
    Array<{ text: string; marks: number; options: string[]; correctAnswer: string }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load teacher subjects
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/teacher/attendance");
        if (res.ok) {
          const json = await res.json();
          const approved = (json.subjectsTaught || []).filter((ts: any) => ts.status === "APPROVED");
          setSubjectsTaught(approved);

          if (approved.length > 0) {
            setSelectedSubjectId(approved[0].subjectId);
            setSelectedSectionId(approved[0].sectionId);
          }
        }
      } catch (e) {
        console.error("Failed to load subjects", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load Question Bank when subject changes
  useEffect(() => {
    async function loadBank() {
      if (!selectedSubjectId) return;
      try {
        const res = await fetch(`/api/teacher/question-bank?subjectId=${selectedSubjectId}`);
        if (res.ok) {
          const json = await res.json();
          setBankQuestions(json.questions || []);
        }
      } catch (e) {
        console.error("Failed to load question bank", e);
      }
    }
    loadBank();
  }, [selectedSubjectId]);

  const handleAddCustomQuestion = () => {
    setCustomQuestions((prev) => [
      ...prev,
      {
        text: "",
        marks: 5,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
      },
    ]);
  };

  const handleRemoveCustomQuestion = (index: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleBankQuestion = (id: string) => {
    setSelectedBankIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSubjectId || !selectedSectionId) {
      setError("Please select a valid approved subject and section.");
      return;
    }

    if (!title) {
      setError("Please provide an assignment title.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId,
          title,
          description,
          type,
          dueDate,
          maxMarks,
          questionBankIds: selectedBankIds,
          customQuestions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `Assignment published! ${data.notifiedStudentsCount} students have been notified.`
        );
        router.push("/teacher/assignments");
      } else {
        setError(data.error || "Failed to publish assignment.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
          className="text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Assignments
        </Button>

        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Issue New Assignment / Quiz
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Configure dual-mode evaluations with per-student question shuffling and auto-grading
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rust-500/20 border border-rust-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Configuration Card */}
          <Card className="p-6 space-y-5">
            <CardHeader
              title="1. Core Evaluation Parameters"
              subtitle="Target subject, delivery mode, and deadlines"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject/Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Target Subject & Class
                </label>
                <select
                  value={`${selectedSubjectId}__${selectedSectionId}`}
                  onChange={(e) => {
                    const [subId, secId] = e.target.value.split("__");
                    setSelectedSubjectId(subId);
                    setSelectedSectionId(secId);
                  }}
                  className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
                >
                  {subjectsTaught.map((ts) => (
                    <option key={ts.id} value={`${ts.subjectId}__${ts.sectionId}`}>
                      {ts.subject.code} - {ts.subject.name} ({ts.section.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Evaluation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("OBJECTIVE")}
                    className={`p-2 rounded border text-xs font-semibold transition-all ${
                      type === "OBJECTIVE"
                        ? "bg-gold-500 text-navy-950 border-gold-500 shadow-sm"
                        : "bg-navy-950 text-ivory-300 border-navy-700 hover:bg-navy-800"
                    }`}
                  >
                    Objective (MCQ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("DESCRIPTIVE")}
                    className={`p-2 rounded border text-xs font-semibold transition-all ${
                      type === "DESCRIPTIVE"
                        ? "bg-maroon-500 text-ivory-100 border-maroon-500 shadow-sm"
                        : "bg-navy-950 text-ivory-300 border-navy-700 hover:bg-navy-800"
                    }`}
                  >
                    Descriptive / File
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DSP Quiz 2: Discrete Fourier Transform & FIR Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-md px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Instructions & Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide examination directives, references, or submission expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-md p-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
                ></textarea>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Max Marks */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                  Total Maximum Marks
                </label>
                <input
                  type="number"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </Card>

          {/* Question Selection Card (Question Bank + Custom) */}
          <Card className="p-6 space-y-5">
            <CardHeader
              title="2. Questions & Auto-Shuffle Pool"
              subtitle="Pull from Question Bank or craft custom questions"
            />

            {/* Question Bank Pool */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                Select from Subject Question Bank ({bankQuestions.length} available)
              </h4>

              {bankQuestions.length === 0 ? (
                <p className="text-xs text-ivory-400 italic py-2">
                  No questions in question bank for this subject. You can add questions below or
                  via Question Bank manager.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bankQuestions.map((q) => {
                    const isChecked = selectedBankIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleBankQuestion(q.id)}
                        className={`p-3 rounded border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? "bg-gold-500/15 border-gold-500 text-ivory-100"
                            : "bg-navy-950 border-navy-800 text-ivory-300 hover:bg-navy-900"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-navy-700 text-gold-500 focus:ring-gold-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={q.type === "MCQ" ? "sage" : "maroon"} size="sm">
                              {q.type}
                            </Badge>
                            <span className="font-mono text-[10px] text-ivory-400">
                              {q.defaultMarks} Marks
                            </span>
                          </div>
                          <p className="text-xs text-ivory-200 line-clamp-2">{q.questionText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Questions Section */}
            <div className="space-y-4 pt-4 border-t border-navy-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                  Custom Questions ({customQuestions.length})
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomQuestion}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Question
                </Button>
              </div>

              {customQuestions.map((cq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-navy-950 border border-navy-750 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gold-400">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomQuestion(idx)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter question statement..."
                    value={cq.text}
                    onChange={(e) => {
                      const updated = [...customQuestions];
                      updated[idx].text = e.target.value;
                      setCustomQuestions(updated);
                    }}
                    className="w-full bg-navy-900 border border-navy-700 rounded p-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
                  />

                  {type === "OBJECTIVE" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {cq.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-1.5">
                          <span className="text-ivory-400 font-mono text-[10px]">
                            {String.fromCharCode(65 + optIdx)}:
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...customQuestions];
                              updated[idx].options[optIdx] = e.target.value;
                              setCustomQuestions(updated);
                            }}
                            className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-xs text-ivory-100"
                          />
                        </div>
                      ))}

                      <div className="col-span-2 pt-1">
                        <label className="block text-[10px] text-ivory-400 uppercase mb-1">
                          Correct Answer (for auto-grading):
                        </label>
                        <select
                          value={cq.correctAnswer}
                          onChange={(e) => {
                            const updated = [...customQuestions];
                            updated[idx].correctAnswer = e.target.value;
                            setCustomQuestions(updated);
                          }}
                          className="w-full bg-navy-900 border border-navy-700 rounded px-2 py-1 text-xs text-ivory-100"
                        >
                          {cq.options.map((opt, optIdx) => (
                            <option key={optIdx} value={opt}>
                              {String.fromCharCode(65 + optIdx)}: {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="font-serif font-bold text-sm"
            >
              Publish & Notify All Enrolled Students <CheckCircle2 className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
