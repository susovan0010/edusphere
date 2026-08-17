"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Calendar,
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Subject Modal state
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    credits: 4,
    classId: "",
    semesterId: "",
  });

  // Create Modal state
  const [createType, setCreateType] = useState<"SUBJECT" | "CLASS" | "SEMESTER" | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newSemLabel, setNewSemLabel] = useState("");
  const [newSemYear, setNewSemYear] = useState(2026);
  const [newSemIsCurrent, setNewSemIsCurrent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/classes");
      if (res.ok) {
        const json = await res.json();
        setClasses(json.classes || []);
        setSemesters(json.semesters || []);
        setSubjects(json.subjects || []);
      }
    } catch (e) {
      console.error("Failed to load classes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditSubject = (sub: any) => {
    setEditingSubject(sub);
    setSubjectForm({
      code: sub.code,
      name: sub.name,
      credits: sub.credits,
      classId: sub.classId,
      semesterId: sub.semesterId,
    });
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/classes";
      const method = editingSubject ? "PUT" : "POST";
      const payload = editingSubject
        ? { entity: "SUBJECT", id: editingSubject.id, ...subjectForm }
        : { entity: "SUBJECT", ...subjectForm };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setEditingSubject(null);
        setCreateType(null);
        loadData();
      } else {
        setError(data.error || "Failed to update subject.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCurrentSemester = async (sem: any) => {
    try {
      await fetch("/api/admin/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "SEMESTER",
          id: sem.id,
          label: sem.label,
          academicYear: sem.academicYear,
          isCurrent: !sem.isCurrent,
        }),
      });
      loadData();
    } catch (e) {
      console.error("Failed to toggle semester", e);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Academic Curriculum, Classes & Semesters
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Full edit authority over Paper Codes (e.g. ECE301), Paper Titles, Credits, and Active Term (Section 5C)
          </p>
        </div>

        {/* Semesters Card */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-navy-700/80 mb-4">
            <div>
              <h3 className="font-serif text-base font-semibold text-ivory-100">
                Academic Semesters / Terms
              </h3>
              <p className="text-xs text-ivory-400">
                The active semester drives the dynamic "My Papers" navigation across all faculty & student portals
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateType("SEMESTER")}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Semester
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {semesters.map((sem) => (
              <div
                key={sem.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  sem.isCurrent
                    ? "bg-gold-500/10 border-gold-500/50 shadow-sm"
                    : "bg-navy-900 border-navy-750"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-semibold text-ivory-100">
                      {sem.label}
                    </span>
                    {sem.isCurrent && (
                      <Badge variant="gold" size="sm">
                        CURRENT ACTIVE
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-ivory-400 font-mono">
                    Year {sem.academicYear}
                  </span>
                </div>

                <Button
                  variant={sem.isCurrent ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCurrentSemester(sem)}
                >
                  {sem.isCurrent ? "Active" : "Set Active"}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Subjects & Papers Master Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-navy-850 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Curriculum Subjects & Paper Codes
              </h3>
              <p className="text-xs text-ivory-400">
                Paper code and paper name are editable anytime even after term starts (Section 5C)
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingSubject(null);
                setSubjectForm({
                  code: "",
                  name: "",
                  credits: 4,
                  classId: classes[0]?.id || "",
                  semesterId: semesters[0]?.id || "",
                });
                setCreateType("SUBJECT");
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add New Subject
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Paper Code</th>
                  <th className="py-3 px-4">Paper Title / Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-navy-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-400 text-sm">
                      {s.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ivory-100">{s.name}</td>
                    <td className="py-3.5 px-4 text-ivory-300">{s.class?.name}</td>
                    <td className="py-3.5 px-4 text-ivory-400">{s.semester?.label}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {s.credits}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditSubject(s)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Paper
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Edit / Add Subject */}
        {(editingSubject || createType === "SUBJECT") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-750">
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  {editingSubject ? `Edit Paper ${editingSubject.code}` : "Add New Subject"}
                </h3>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setCreateType(null);
                  }}
                  className="text-ivory-400 hover:text-ivory-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded bg-rust-500/20 border border-rust-500/40 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Paper Code (e.g. ECE301)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ECE301"
                    value={subjectForm.code}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Paper Title / Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Digital Signal Processing"
                    value={subjectForm.name}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, name: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Academic Credits
                    </label>
                    <input
                      type="number"
                      required
                      value={subjectForm.credits}
                      onChange={(e) =>
                        setSubjectForm({
                          ...subjectForm,
                          credits: Number(e.target.value),
                        })
                      }
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Semester
                    </label>
                    <select
                      value={subjectForm.semesterId}
                      onChange={(e) =>
                        setSubjectForm({ ...subjectForm, semesterId: e.target.value })
                      }
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                    >
                      {semesters.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                          {sem.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Enrolled Class
                  </label>
                  <select
                    value={subjectForm.classId}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, classId: e.target.value })
                    }
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-navy-750">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingSubject(null);
                      setCreateType(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submitting}
                  >
                    Save Paper Details
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
