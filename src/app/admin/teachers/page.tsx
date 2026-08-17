"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: "Assistant Professor",
    temporaryPassword: "Teacher@123",
    assignSubjectId: "",
    assignSectionId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/teachers");
      if (res.ok) {
        const json = await res.json();
        setTeachers(json.teachers || []);
        setSubjects(json.subjects || []);
        setSections(json.sections || []);
      }
    } catch (e) {
      console.error("Failed to load teachers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "Electronics & Communication Engineering",
      designation: "Associate Professor",
      temporaryPassword: "Teacher@123",
      assignSubjectId: subjects[0]?.id || "",
      assignSectionId: sections[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.user.name,
      email: teacher.user.email,
      department: teacher.department,
      designation: teacher.designation,
      temporaryPassword: "",
      assignSubjectId: "",
      assignSectionId: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/teachers";
      const method = editingTeacher ? "PUT" : "POST";
      const payload = editingTeacher
        ? { id: editingTeacher.id, ...formData }
        : {
            ...formData,
            assignments: formData.assignSubjectId
              ? [{ subjectId: formData.assignSubjectId, sectionId: formData.assignSectionId }]
              : [],
          };

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
        setError(data.error || "Failed to save faculty record.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;

    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Collegiate Faculty Directory
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Appoint professors, edit designations, and assign current-semester papers (Section 5C)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-navy-850 border border-navy-700 rounded-md pl-9 pr-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <Button variant="primary" size="md" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" /> Appoint Faculty
            </Button>
          </div>
        </div>

        {/* Teachers Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Department & Designation</th>
                  <th className="py-3 px-4">Assigned Papers</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ivory-400">
                      Loading faculty directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ivory-400">
                      No faculty records found. Click "Appoint Faculty" to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-ivory-100 block">{t.user?.name}</span>
                        <span className="text-[11px] text-ivory-400 font-mono">{t.user?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-ivory-200 font-medium block">{t.department}</span>
                        <span className="text-[11px] text-gold-400/90">{t.designation}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {t.subjectsTaught?.length === 0 ? (
                            <span className="text-ivory-400 italic">None assigned</span>
                          ) : (
                            t.subjectsTaught?.map((st: any) => (
                              <Badge
                                key={st.id}
                                variant={st.status === "APPROVED" ? "navy" : "maroon"}
                                size="sm"
                              >
                                {st.subject?.code} ({st.section?.name}){" "}
                                {st.status === "PENDING" ? "[Pending]" : ""}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 rounded hover:bg-navy-800 text-gold-400 hover:text-gold-300"
                            title="Edit Faculty Record & Assignments"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded hover:bg-navy-800 text-rose-400 hover:text-rose-300"
                            title="Delete Faculty"
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

        {/* Modal: Create / Edit Faculty */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-750">
                <h3 className="font-serif text-lg font-bold text-ivory-100">
                  {editingTeacher ? "Edit Faculty & Assignments (Section 5C)" : "Appoint New Faculty"}
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sunita Banerjee"
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
                      placeholder="faculty@edusphere.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-ivory-300 font-semibold uppercase mb-1">
                      Academic Designation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Senior Professor"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ivory-300 font-semibold uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Electronics & Communication Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
                  />
                </div>

                {/* Subject Assignment picker */}
                <div className="p-3 rounded bg-navy-950 border border-navy-800 space-y-3">
                  <span className="text-[11px] font-semibold text-gold-400 uppercase block">
                    {editingTeacher ? "Assign Additional Paper (Optional):" : "Initial Paper Assignment:"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-ivory-400 uppercase mb-1">Paper</label>
                      <select
                        value={formData.assignSubjectId}
                        onChange={(e) =>
                          setFormData({ ...formData, assignSubjectId: e.target.value })
                        }
                        className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-ivory-100"
                      >
                        <option value="">-- Select Paper --</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-ivory-400 uppercase mb-1">
                        Section
                      </label>
                      <select
                        value={formData.assignSectionId}
                        onChange={(e) =>
                          setFormData({ ...formData, assignSectionId: e.target.value })
                        }
                        className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-ivory-100"
                      >
                        <option value="">-- Select Section --</option>
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} ({sec.class?.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {!editingTeacher && (
                  <div className="p-3 rounded bg-navy-950 border border-gold-500/30 text-[11px] text-ivory-300">
                    One-Time Credential: <strong className="font-mono">Teacher@123</strong> (User must change password on first login).
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
                    {editingTeacher ? "Save Changes" : "Appoint Faculty"}
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
