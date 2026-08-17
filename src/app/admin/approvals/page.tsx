"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals");
      if (res.ok) {
        const json = await res.json();
        setRequests(json);
      }
    } catch (e) {
      console.error("Failed to load approvals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = async (requestId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(requestId);
    const note = notesInput[requestId] || "";

    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          notes: note,
        }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        alert(
          action === "APPROVE"
            ? "Proposal approved! Full permissions unlocked and faculty member notified."
            : "Proposal declined and teacher notified."
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process approval");
      }
    } catch (e) {
      console.error("Decision error", e);
      alert("An unexpected error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
              Administrative Gatekeeper
            </span>
            <Badge variant="maroon" size="sm">
              Section 5B Governance
            </Badge>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Faculty Paper Self-Assignment Approvals Queue
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Authorize self-proposed papers to unlock assignment creation and grading permissions
          </p>
        </div>

        {/* Informational Card */}
        <div className="p-4 rounded-lg bg-navy-850 border border-navy-750 flex items-start gap-3">
          <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          <div className="text-xs text-ivory-300 leading-relaxed">
            <strong>System Rule (Section 5B):</strong> When a teacher self-proposes to take a paper,
            they are immediately allowed to mark attendance to avoid classroom downtime. Full
            assignment creation, marks entry, and question bank permissions remain locked until you
            sign off here.
          </div>
        </div>

        {/* Requests Queue */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-ivory-400">Loading pending requests...</div>
          ) : requests.length === 0 ? (
            <Card className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-serif text-base font-bold text-ivory-100">
                Approvals Queue Clean
              </h3>
              <p className="text-xs text-ivory-400 mt-1 max-w-sm mx-auto">
                No faculty self-assignment requests are pending administrator sign-off.
              </p>
            </Card>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-navy-850 border border-gold-500/30 rounded-xl p-5 shadow-aristocrat space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-750">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-900 border border-gold-500/40 flex items-center justify-center font-serif text-gold-400 font-bold">
                      {req.teacher?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-ivory-100">
                        {req.teacher?.user?.name}
                      </h4>
                      <p className="text-xs text-ivory-400">
                        {req.teacher?.department} • {req.teacher?.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="maroon" size="sm">
                      PENDING APPROVAL
                    </Badge>
                    <span className="text-[11px] text-ivory-400 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Proposed Subject Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded bg-navy-900 border border-navy-750">
                    <span className="text-ivory-400 block mb-0.5">Proposed Paper:</span>
                    <span className="font-mono text-gold-400 font-bold mr-1">
                      {req.subject?.code}
                    </span>
                    <span className="text-ivory-100 font-medium">{req.subject?.name}</span>
                  </div>

                  <div className="p-3 rounded bg-navy-900 border border-navy-750">
                    <span className="text-ivory-400 block mb-0.5">Class & Section:</span>
                    <span className="text-ivory-100 font-medium">
                      {req.subject?.class?.name} • {req.section?.name}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-navy-900 border border-navy-750">
                    <span className="text-ivory-400 block mb-0.5">Academic Term:</span>
                    <span className="text-ivory-100 font-medium">
                      {req.subject?.semester?.label}
                    </span>
                  </div>
                </div>

                {req.notes && (
                  <div className="p-3 rounded bg-navy-900/60 border border-navy-800 text-xs text-ivory-300">
                    <strong className="text-gold-400 block mb-0.5">Faculty Proposal Note:</strong>
                    "{req.notes}"
                  </div>
                )}

                {/* Admin Note input & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Optional feedback / admin note for faculty member..."
                    value={notesInput[req.id] || ""}
                    onChange={(e) =>
                      setNotesInput({ ...notesInput, [req.id]: e.target.value })
                    }
                    className="flex-1 bg-navy-950 border border-navy-700 rounded px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
                  />

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={processingId === req.id}
                      onClick={() => handleDecision(req.id, "REJECT")}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Decline Proposal
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={processingId === req.id}
                      onClick={() => handleDecision(req.id, "APPROVE")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Unlock
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
