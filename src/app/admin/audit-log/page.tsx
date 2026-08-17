"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  History,
  Shield,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [tableFilter, setTableFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/audit-log?action=${actionFilter}&table=${tableFilter}`
      );
      if (res.ok) {
        const json = await res.json();
        setLogs(json);
      }
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, tableFilter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Administrative & Security Audit Trail
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Traceable records of marks changes, attendance modifications, paper edits, and credential updates (Section 2A)
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Log Feed
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-ivory-300 font-semibold uppercase mb-1">
                Filter by Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="GRADE">GRADE</option>
                <option value="ATTENDANCE_MARK">ATTENDANCE_MARK</option>
                <option value="APPROVAL">APPROVAL</option>
                <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
              </select>
            </div>

            <div>
              <label className="block text-ivory-300 font-semibold uppercase mb-1">
                Filter by Target Table
              </label>
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-ivory-100"
              >
                <option value="ALL">All Entities / Tables</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Subject">Subject</option>
                <option value="TeacherSubject">TeacherSubject</option>
                <option value="Attendance">Attendance</option>
                <option value="Mark">Mark</option>
                <option value="Submission">Submission</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Log Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User / Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Modifications / Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ivory-400 font-sans">
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ivory-400 font-sans">
                      No matching audit log entries.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-navy-800/40">
                      <td className="py-3 px-4 text-ivory-400 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-ivory-100">
                        {log.user?.name || "System"}{" "}
                        <span className="text-ivory-400 text-[10px] block font-mono">
                          {log.user?.email}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <Badge
                          variant={
                            log.action === "CREATE" || log.action === "APPROVAL"
                              ? "sage"
                              : log.action === "DELETE"
                              ? "rust"
                              : "gold"
                          }
                          size="sm"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gold-400 font-semibold">{log.targetTable}</td>
                      <td className="py-3 px-4 text-[11px] text-ivory-300 font-mono max-w-xs truncate">
                        {log.newValue || log.oldValue || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
