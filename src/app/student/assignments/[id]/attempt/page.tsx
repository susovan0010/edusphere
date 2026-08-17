"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function ObjectiveAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadAttempt() {
      try {
        const res = await fetch(`/api/student/assignments/${assignmentId}`);
        if (res.ok) {
          const json = await res.json();
          setAssignment(json.assignment);
          setQuestions(json.questions || []);
          if (json.result) {
            setResult(json.result);
          }
        }
      } catch (e) {
        console.error("Failed to load attempt", e);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [assignmentId]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (result) return; // Locked if already submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C9A227", "#6B8F71", "#EDE7DA"],
        });
      } else {
        alert(data.error || "Failed to submit quiz");
      }
    } catch (e) {
      console.error("Submit error", e);
      alert("An unexpected error occurred during submission.");
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

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-navy-850 border border-navy-700/80 rounded-xl p-5 shadow-aristocrat">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-gold-400">
                  {assignment?.subjectCode}
                </span>
                <Badge variant="sage" size="sm">
                  Objective MCQ • Instant Auto-Graded
                </Badge>
                {result && (
                  <Badge variant="rust" size="sm">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-xl font-bold text-ivory-100">
                {assignment?.title}
              </h1>
              <p className="text-xs text-ivory-400 mt-0.5">{assignment?.description}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-ivory-400 block">Maximum Marks</span>
              <span className="font-serif text-xl font-bold text-gold-400 font-mono">
                {assignment?.maxMarks} pts
              </span>
            </div>
          </div>
        </div>

        {/* If already submitted: Result Card */}
        {result ? (
          <div className="bg-gradient-to-br from-navy-900 to-navy-850 border border-gold-500/40 rounded-xl p-8 text-center space-y-4 shadow-aristocrat animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-ivory-100">
                Quiz Evaluation Complete
              </h2>
              <p className="text-xs text-ivory-400 mt-1">
                Your responses have been locked and auto-graded server-side.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-navy-950 border border-navy-750 max-w-xs mx-auto">
              <span className="text-xs text-ivory-400 uppercase tracking-wider block">
                Score Earned
              </span>
              <span className="font-serif text-4xl font-bold text-emerald-400 block my-1">
                {result.obtainedMarks} / {result.totalMarks}
              </span>
              <Badge variant="sage" size="md">
                {Math.round(result.percentage)}% Performance
              </Badge>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                onClick={() => router.push("/student/assignments")}
              >
                Back to Assignments
              </Button>
            </div>
          </div>
        ) : (
          /* Active Attempt Stepper */
          <div className="space-y-6">
            {/* Question Progress bar */}
            <div className="flex items-center justify-between text-xs text-ivory-300">
              <span>
                Question <strong>{currentIdx + 1}</strong> of {questions.length}
              </span>
              <span className="font-mono text-gold-400">
                {answeredCount} of {questions.length} answered
              </span>
            </div>

            <div className="w-full bg-navy-950 rounded-full h-1.5 border border-navy-800">
              <div
                className="bg-gold-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question Card */}
            {currentQ && (
              <Card className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-mono font-bold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded border border-gold-500/20">
                    Q{currentIdx + 1} ({currentQ.marks} Marks)
                  </span>
                  <span className="text-[11px] text-ivory-400 italic">
                    Shuffled unique order
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-ivory-100 leading-relaxed">
                  {currentQ.questionText}
                </h3>

                {/* Shuffled Options */}
                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt: string, optIdx: number) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, opt)}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? "bg-gold-500/20 border-gold-500 text-ivory-100 shadow-sm"
                            : "bg-navy-900 border-navy-700/80 text-ivory-300 hover:bg-navy-800 hover:text-ivory-100 hover:border-navy-600"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-gold-500 text-navy-950"
                              : "bg-navy-950 text-ivory-400 border border-navy-700"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm font-medium leading-normal">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="md"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Question
              </Button>

              {currentIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Complete & Submit Quiz <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal Before Final Submit */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-gold-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  Submit & Auto-Grade Quiz?
                </h3>
              </div>

              <p className="text-xs text-ivory-300 leading-relaxed">
                You have answered <strong>{answeredCount}</strong> of{" "}
                <strong>{questions.length}</strong> questions.
              </p>

              <div className="p-3 rounded bg-navy-950 border border-navy-750 text-xs text-ivory-400">
                <strong className="text-rose-400 block mb-1">Important Rule:</strong>
                Objective submissions are permanent and <strong>cannot be edited</strong>. Your test
                will be scored immediately upon submission.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Review Answers
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  onClick={handleFinalSubmit}
                >
                  Confirm & Grade Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
