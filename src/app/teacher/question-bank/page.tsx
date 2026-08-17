"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

export default function TeacherQuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [approvedSubjects, setApprovedSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [newType, setNewType] = useState<"MCQ" | "DESCRIPTIVE">("MCQ");
  const [newText, setNewText] = useState("");
  const [newMarks, setNewMarks] = useState(5);
  const [newOptions, setNewOptions] = useState<string[]>([
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ]);
  const [newCorrect, setNewCorrect] = useState("Option A");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBank() {
      try {
        const res = await fetch("/api/teacher/question-bank");
        if (res.ok) {
          const json = await res.json();
          setQuestions(json.questions || []);
          setApprovedSubjects(json.approvedSubjects || []);
          if (json.approvedSubjects?.length > 0) {
            setSelectedSubjectId(json.approvedSubjects[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load question bank", e);
      } finally {
        setLoading(false);
      }
    }
    loadBank();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          questionText: newText,
          type: newType,
          options: newType === "MCQ" ? newOptions : null,
          correctAnswer: newType === "MCQ" ? newCorrect : null,
          defaultMarks: newMarks,
        }),
      });

      if (res.ok) {
        setIsCreating(false);
        setNewText("");
        // Reload questions
        const refresh = await fetch(`/api/teacher/question-bank?subjectId=${selectedSubjectId}`);
        const data = await refresh.json();
        setQuestions(data.questions || []);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create question");
      }
    } catch (e) {
      console.error("Error creating question", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question from bank?")) return;

    try {
      const res = await fetch(`/api/teacher/question-bank?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Subject Question Bank
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Reusable question repository for auto-generating randomized student assignment sets
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {isCreating ? "Cancel" : "Add Question to Bank"}
          </Button>
        </div>

        {/* Create Question Modal/Card */}
        {isCreating && (
          <Card className="p-6 space-y-4 border-gold-500/40 animate-fade-in">
            <CardHeader
              title="Add New Question to Bank"
              subtitle="Will be stored in subject repository for future quizzes"
            />

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Subject Repository
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  >
                    {approvedSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Question Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="DESCRIPTIVE">Descriptive Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Default Marks
                  </label>
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ivory-300 font-semibold uppercase mb-1">
                  Question Statement
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter problem statement..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded p-3 text-ivory-100"
                ></textarea>
              </div>

              {newType === "MCQ" && (
                <div className="space-y-3 pt-2">
                  <label className="block text-ivory-300 font-semibold uppercase">
                    Answer Options:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {newOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx] = e.target.value;
                          setNewOptions(updated);
                        }}
                        className="bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Correct Answer for Auto-Grading:
                    </label>
                    <select
                      value={newCorrect}
                      onChange={(e) => setNewCorrect(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                    >
                      {newOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  Save to Question Bank
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-ivory-400">Loading Question Bank...</div>
          ) : questions.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-12 h-12 text-ivory-400 mx-auto mb-3" />
              <h3 className="font-serif text-base font-bold text-ivory-100">
                No questions in repository yet
              </h3>
              <p className="text-xs text-ivory-400 mt-1">
                Add questions to build your subject's randomized evaluation pool.
              </p>
            </Card>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-lg bg-navy-850 border border-navy-700 flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                      {q.subject?.code}
                    </span>
                    <Badge variant={q.type === "MCQ" ? "sage" : "maroon"} size="sm">
                      {q.type}
                    </Badge>
                    <span className="text-xs text-ivory-400 font-mono">
                      {q.defaultMarks} Marks
                    </span>
                  </div>

                  <h3 className="font-serif text-sm font-semibold text-ivory-100">
                    {q.questionText}
                  </h3>

                  {q.type === "MCQ" && q.options && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      {JSON.parse(q.options).map((opt: string, optIdx: number) => (
                        <span
                          key={optIdx}
                          className={`px-2 py-1 rounded border ${
                            opt === q.correctAnswer
                              ? "bg-sage-500/20 text-emerald-300 border-sage-500/40 font-bold"
                              : "bg-navy-900 text-ivory-300 border-navy-750"
                          }`}
                        >
                          {opt} {opt === q.correctAnswer ? "✓ (Correct)" : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 rounded hover:bg-navy-800"
                  title="Delete from Question Bank"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
