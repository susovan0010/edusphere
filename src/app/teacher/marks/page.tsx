"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
} from "lucide-react";

export default function TeacherMarksEntryPage() {
  const [subjectsTaught, setSubjectsTaught] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [examType, setExamType] = useState<"CT" | "MIDSEM" | "ENDSEM" | "ASSIGNMENT">("CT");
  const [defaultMaxMarks, setDefaultMaxMarks] = useState(25);

  const [students, setStudents] = useState<any[]>([]);
  const [marksState, setMarksState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load teacher subjects
  useEffect(() => {
    async function loadSubjects() {
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
    loadSubjects();
  }, []);

  // Adjust default max marks when exam type changes
  useEffect(() => {
    if (examType === "CT") setDefaultMaxMarks(25);
    else if (examType === "MIDSEM") setDefaultMaxMarks(50);
    else if (examType === "ENDSEM") setDefaultMaxMarks(100);
    else if (examType === "ASSIGNMENT") setDefaultMaxMarks(25);
  }, [examType]);

  // Load marks list when subject/section/examType changes
  useEffect(() => {
    async function loadMarks() {
      if (!selectedSubjectId || !selectedSectionId) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/teacher/marks?subjectId=${selectedSubjectId}&sectionId=${selectedSectionId}&examType=${examType}`
        );
        if (res.ok) {
          const json = await res.json();
          setStudents(json);

          const initial: Record<string, string> = {};
          json.forEach((s: any) => {
            initial[s.studentId] = s.marksObtained !== "" ? String(s.marksObtained) : "";
          });
          setMarksState(initial);
        }
      } catch (e) {
        console.error("Failed to load marks", e);
      } finally {
        setLoading(false);
      }
    }

    loadMarks();
  }, [selectedSubjectId, selectedSectionId, examType]);

  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);

    const marksList = students.map((s) => ({
      studentId: s.studentId,
      marksObtained: marksState[s.studentId],
      maxMarks: defaultMaxMarks,
    }));

    try {
      const res = await fetch("/api/teacher/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId,
          examType,
          marksList,
          defaultMaxMarks,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Marks saved and audited successfully for ${examType}!`,
        });
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Failed to save marks.",
        });
      }
    } catch (e) {
      setFeedback({
        type: "error",
        text: "Network error occurred while saving marks.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Examination Marks Entry
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Record Class Tests (CT), Mid-Semester, and Final examination grades with audit tracking
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-lg text-xs flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "bg-sage-500/20 border border-sage-500/40 text-emerald-300"
                : "bg-rust-500/20 border border-rust-500/40 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Filter Card */}
        <Card className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                Target Subject
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                Examination Tier
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              >
                <option value="CT">Class Test (CT)</option>
                <option value="MIDSEM">Mid-Semester Exam</option>
                <option value="ENDSEM">End-Semester Exam</option>
                <option value="ASSIGNMENT">Assignment Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                Maximum Scaled Marks
              </label>
              <input
                type="number"
                value={defaultMaxMarks}
                onChange={(e) => setDefaultMaxMarks(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </Card>

        {/* Student Marks Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Max Marks</th>
                  <th className="py-3 px-4 text-right w-40">Marks Scored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ivory-400">
                      Loading class roster...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ivory-400">
                      No students enrolled in this section.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.studentId} className="hover:bg-navy-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                        {s.rollNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ivory-100">{s.name}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-ivory-400">
                        {defaultMaxMarks}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <input
                          type="number"
                          max={defaultMaxMarks}
                          min={0}
                          placeholder="Score"
                          value={marksState[s.studentId] ?? ""}
                          onChange={(e) =>
                            setMarksState({ ...marksState, [s.studentId]: e.target.value })
                          }
                          className="w-24 text-right bg-navy-950 border border-navy-700 rounded px-2.5 py-1.5 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-500"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-navy-900 border-t border-navy-750 flex items-center justify-between">
            <span className="text-xs text-ivory-400">
              {students.length} students enrolled in class
            </span>
            <Button
              variant="primary"
              size="md"
              isLoading={saving}
              onClick={handleSaveAll}
            >
              <Save className="w-4 h-4 mr-1.5" /> Save & Audit Marks
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
