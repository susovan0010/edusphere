"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function ProposePaperPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch("/api/teacher/papers/propose");
        if (res.ok) {
          const json = await res.json();
          setSubjects(json.subjects || []);
          setSections(json.sections || []);
          if (json.subjects?.length > 0) setSelectedSubjectId(json.subjects[0].id);
          if (json.sections?.length > 0) setSelectedSectionId(json.sections[0].id);
        }
      } catch (e) {
        console.error("Failed to load options", e);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSubjectId || !selectedSectionId) {
      setError("Please select both a subject and section.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/papers/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          sectionId: selectedSectionId,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          "Paper self-assignment proposal submitted! You can start taking attendance immediately. Full grading and assignment permissions will unlock upon Admin approval."
        );
        router.push("/teacher/dashboard");
      } else {
        setError(data.error || "Failed to submit proposal.");
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.back()}
          className="text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
              Faculty Self-Proposal
            </span>
            <Badge variant="maroon" size="sm">
              Section 5B Protocol
            </Badge>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Propose to Teach a Paper
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Submit a self-assignment proposal for the active academic semester
          </p>
        </div>

        {/* Section 5B Guidance Alert */}
        <div className="p-4 rounded-lg bg-navy-850 border border-gold-500/30 flex items-start gap-3">
          <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-ivory-100">
              Immediate Attendance Enabled, Full Access on Approval
            </h4>
            <p className="text-ivory-300/80 leading-relaxed">
              Upon submitting this proposal, a <strong>PENDING</strong> record will be created in the
              Admin Approvals queue. <strong>Attendance marking will be immediately unlocked</strong> for
              your classes; full assignment creation and marks entry will activate as soon as the Admin
              signs off.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rust-500/20 border border-rust-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-ivory-300 font-semibold uppercase mb-1.5">
                Subject / Paper
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-md p-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.class?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ivory-300 font-semibold uppercase mb-1.5">
                Target Section
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-md p-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.class?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ivory-300 font-semibold uppercase mb-1.5">
                Proposal Justification / Note for Admin
              </label>
              <textarea
                rows={4}
                placeholder="State your rationale, specialization, or departmental scheduling context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-md p-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
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
                className="font-serif font-bold"
              >
                Submit Proposal to Admin <FolderPlus className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
