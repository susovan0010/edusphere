"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Users, Search, AlertTriangle, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("/api/teacher/students");
        if (res.ok) {
          const json = await res.json();
          setStudents(json);
        }
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.sectionName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory-100">
              Student Directory & Academic Records
            </h1>
            <p className="text-xs text-ivory-400 mt-0.5">
              Monitor individual attendance ratios, evaluation records, and at-risk students
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ivory-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-850 border border-navy-700 rounded-md pl-9 pr-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 text-ivory-400 uppercase text-[10px] border-b border-navy-700">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4 text-center">Attendance Rate</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750/50 text-ivory-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ivory-400">
                      Loading student roster...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ivory-400">
                      No matching students found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                        {s.rollNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-ivory-100 block">{s.name}</span>
                        <span className="text-[11px] text-ivory-400 font-mono">{s.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-ivory-300">
                        {s.className} • {s.sectionName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            s.attendancePercentage >= 75 ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s.isAtRisk ? (
                          <Badge variant="rust" size="sm">
                            <AlertTriangle className="w-3 h-3 mr-1" /> At-Risk (&lt;75%)
                          </Badge>
                        ) : (
                          <Badge variant="sage" size="sm">
                            Good Standing
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/teacher/students/${s.id}`}>
                          <Button variant="outline" size="sm">
                            Report Card <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
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
