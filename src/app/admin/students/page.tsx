"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  KeyRound,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    classId: "",
    sectionId: "",
    admissionYear: 2026,
    temporaryPassword: "Student@123",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        const json = await res.json();
        setStudents(json.students || []);
        setClasses(json.classes || []);

        if (json.classes?.length > 0 && !formData.classId) {
          const firstClass = json.classes[0];
          setFormData((prev) => ({
            ...prev,
            classId: firstClass.id,
            sectionId: firstClass.sections[0]?.id || "",
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load students", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      rollNo: "",
      classId: classes[0]?.id || "",
      sectionId: classes[0]?.sections[0]?.id || "",
      admissionYear: 2026,
      temporaryPassword: "Student@123",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.user.name,
      email: student.user.email,
      rollNo: student.rollNo,
      classId: student.classId,
      sectionId: student.sectionId,
      admissionYear: student.admissionYear,
      temporaryPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/students";
      const method = editingStudent ? "PUT" : "POST";
      const payload = editingStudent ? { id: editingStudent.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        loadData();
      } else {
        setError(data.error || "Failed to save student record.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this student?")) return;

    try {
      const res = await fetch(`/api/admin/students?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete student", e);
    }
  };

  const currentClassSections =
    classes.find((c) => c.id === formData.classId)?.sections || [];

  const filtered = students.filter(
    (s) =>
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.class?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Collegiate Student Directory
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Enroll new students, modify section allocations, and adjust roll numbers (Full CRUD & Edit)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-navy-850 border border-navy-700 rounded-md pl-9 pr-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <Button variant="primary" size="md" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" /> Enroll Student
            </Button>
          </div>
        </div>

        {/* Student Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Collegiate Email</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4 text-center">Batch</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ivory-400">
                      Loading registry records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ivory-400">
                      No students found. Click "Enroll Student" to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-navy-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                        {s.rollNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ivory-100">{s.user?.name}</td>
                      <td className="py-3.5 px-4 text-ivory-400 font-mono">{s.user?.email}</td>
                      <td className="py-3.5 px-4 text-ivory-300">
                        {s.class?.name} • {s.section?.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">{s.admissionYear}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded hover:bg-navy-800 text-gold-400 hover:text-gold-300"
                            title="Edit Student Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded hover:bg-navy-800 text-rose-400 hover:text-rose-300"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Enroll / Edit Student */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-750">
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  {editingStudent ? "Edit Student Record (Section 5C)" : "Enroll New Student"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-ivory-400 hover:text-ivory-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded bg-rust-500/20 border border-rust-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suman Sen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@edusphere.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ECE-2023-045"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Class
                    </label>
                    <select
                      value={formData.classId}
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        const matchingSections =
                          classes.find((c) => c.id === newClassId)?.sections || [];
                        setFormData({
                          ...formData,
                          classId: newClassId,
                          sectionId: matchingSections[0]?.id || "",
                        });
                      }}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Section
                    </label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                    >
                      {currentClassSections.map((sec: any) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!editingStudent && (
                  <div className="p-3 rounded bg-navy-950 border border-gold-500/30 space-y-1">
                    <span className="text-[11px] text-gold-400 font-semibold block">
                      Default One-Time Credential (Section 2A):
                    </span>
                    <p className="text-[11px] text-ivory-300">
                      Temporary Password: <strong className="font-mono">Student@123</strong> (User will be forced to change password on first login).
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-750">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submitting}
                  >
                    {editingStudent ? "Save Changes" : "Enroll Student"}
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
