"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckSquare,
  XSquare,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  rollNo: string;
  currentStatus: "PRESENT" | "ABSENT";
}

export default function TeacherAttendancePage() {
  const [subjectsTaught, setSubjectsTaught] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load teacher's subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/teacher/attendance");
        if (res.ok) {
          const json = await res.json();
          setSubjectsTaught(json.subjectsTaught || []);

          if (json.subjectsTaught && json.subjectsTaught.length > 0) {
            // Default to first subject
            const first = json.subjectsTaught[0];
            setSelectedSubjectId(first.subjectId);
            setSelectedSectionId(first.sectionId);
          }
        }
      } catch (e) {
        console.error("Failed to load teacher subjects", e);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  // Load students when subject/section/date changes
  useEffect(() => {
    async function loadClassStudents() {
      if (!selectedSubjectId || !selectedSectionId) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/teacher/attendance?subjectId=${selectedSubjectId}&sectionId=${selectedSectionId}&date=${date}`
        );
        if (res.ok) {
          const json = await res.json();
          setStudents(json.students || []);

          // Initialize attendance map
          const initialMap: Record<string, "PRESENT" | "ABSENT"> = {};
          json.students?.forEach((s: StudentItem) => {
            initialMap[s.id] = s.currentStatus || "PRESENT";
          });
          setAttendanceMap(initialMap);
        }
      } catch (e) {
        console.error("Failed to load class students", e);
      } finally {
        setLoading(false);
      }
    }

    loadClassStudents();
  }, [selectedSubjectId, selectedSectionId, date]);

  const handleToggleStatus = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, "PRESENT" | "ABSENT"> = {};
    students.forEach((s) => (updated[s.id] = "PRESENT"));
    setAttendanceMap(updated);
  };

  const markAllAbsent = () => {
    const updated: Record<string, "PRESENT" | "ABSENT"> = {};
    students.forEach((s) => (updated[s.id] = "ABSENT"));
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId,
          date,
          attendanceMap,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Attendance saved successfully for ${date}! (${
            Object.values(attendanceMap).filter((v) => v === "PRESENT").length
          } Present / ${
            Object.values(attendanceMap).filter((v) => v === "ABSENT").length
          } Absent)`,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Failed to record attendance.",
        });
      }
    } catch (e) {
      setFeedback({
        type: "error",
        text: "Network error occurred while recording attendance.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === "ABSENT").length;

  return (
    <AppShell>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                Daily Classroom Action
              </span>
              <Badge variant="gold" size="sm">
                Mobile-First
              </Badge>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ivory-100">
              Take Lecture Attendance
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Rapid tap toggles for fast classroom roll-call with audit traceability
            </p>
          </div>

          {/* Quick counts */}
          <div className="flex items-center gap-3 bg-navy-850 p-2 rounded-lg border border-navy-700">
            <div className="text-center px-3 border-r border-navy-750">
              <span className="text-[10px] text-ivory-400 uppercase block">Present</span>
              <span className="font-serif font-bold text-emerald-400 text-lg">
                {presentCount}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-ivory-400 uppercase block">Absent</span>
              <span className="font-serif font-bold text-rose-400 text-lg">{absentCount}</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-lg text-xs flex items-center gap-2.5 shadow-sm ${
              feedback.type === "success"
                ? "bg-sage-500/20 border border-sage-500/40 text-emerald-300"
                : "bg-rust-500/20 border border-rust-500/40 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
        )}

        {/* Filters Card */}
        <Card className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject / Paper Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                Subject & Class
              </label>
              <select
                value={`${selectedSubjectId}__${selectedSectionId}`}
                onChange={(e) => {
                  const [subId, secId] = e.target.value.split("__");
                  setSelectedSubjectId(subId);
                  setSelectedSectionId(secId);
                }}
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              >
                {subjectsTaught.map((ts) => (
                  <option
                    key={ts.id}
                    value={`${ts.subjectId}__${ts.sectionId}`}
                  >
                    {ts.subject.code} - {ts.subject.name} ({ts.section.name}) {ts.status === "PENDING" ? "[Awaiting Approval]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory-300 mb-1.5">
                Lecture Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 font-mono"
              />
            </div>

            {/* Bulk Fast Buttons */}
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={markAllPresent}
                className="flex-1 text-xs py-2.5"
              >
                <CheckSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                All Present
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={markAllAbsent}
                className="flex-1 text-xs py-2.5 text-rose-300"
              >
                <XSquare className="w-3.5 h-3.5 mr-1 text-rose-400" />
                All Absent
              </Button>
            </div>
          </div>
        </Card>

        {/* Student Attendance List (Big-Tap Target Rows) */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-ivory-400 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-ivory-100">
              No students enrolled in this section
            </h3>
            <p className="text-xs text-ivory-400 mt-1">
              Select another subject or assign students via Admin portal.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {students.map((student, idx) => {
              const status = attendanceMap[student.id] || "PRESENT";
              const isPresent = status === "PRESENT";

              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStatus(student.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-4 ${
                    isPresent
                      ? "bg-navy-850 hover:bg-navy-800 border-navy-700/90"
                      : "bg-rust-500/10 hover:bg-rust-500/15 border-rust-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-navy-900 border border-navy-700 text-ivory-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="font-serif text-sm font-semibold text-ivory-100 truncate">
                        {student.name}
                      </h4>
                      <p className="text-[11px] font-mono text-gold-400">
                        Roll: {student.rollNo}
                      </p>
                    </div>
                  </div>

                  {/* Big Thumb Toggle Target */}
                  <div className="shrink-0">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-sage-500/20 text-emerald-300 border border-sage-500/40 font-semibold text-xs shadow-sm">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        PRESENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-rust-500/30 text-rose-300 border border-rust-500/60 font-semibold text-xs shadow-sm">
                        <XSquare className="w-4 h-4 text-rose-400" />
                        ABSENT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fixed Bottom Action Bar for One-Handed Smartphone Operation */}
        {students.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-950/95 border-t border-navy-800 backdrop-blur-md z-40 lg:pl-72 shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="text-xs hidden sm:block">
                <span className="text-ivory-300">
                  Ready to submit: <strong>{presentCount}</strong> Present, <strong>{absentCount}</strong> Absent
                </span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={submitting}
                onClick={handleSubmitAttendance}
                className="w-full sm:w-auto font-serif text-sm font-bold tracking-wide shadow-goldGlow"
              >
                Submit Lecture Attendance <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
