"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { GraduationCap, Mail, KeyRound, Shield, Calendar, BookOpen } from "lucide-react";

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
    loadProfile();
  }, []);

  const { student, attendance, subjectStats } = data || {};

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            Collegiate Student Profile
          </h1>
          <p className="text-xs text-ivory-400 mt-0.5">
            Personal academic identification, enrollment record, and account security
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <Card className="md:col-span-1 text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-navy-800 border-2 border-gold-500 flex items-center justify-center text-gold-400 font-serif text-2xl font-bold mx-auto shadow-goldGlow">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-ivory-100">
                {session?.user?.name}
              </h3>
              <p className="text-xs text-ivory-400 font-mono mt-0.5">{session?.user?.email}</p>
              <Badge variant="gold" size="sm" className="mt-2">
                Undergraduate Student
              </Badge>
            </div>

            <div className="pt-4 border-t border-navy-750">
              <Link href="/account/change-password">
                <Button variant="outline" size="sm" className="w-full">
                  <KeyRound className="w-4 h-4 mr-1.5" /> Change Password
                </Button>
              </Link>
            </div>
          </Card>

          {/* Academic Records */}
          <Card className="md:col-span-2 space-y-6">
            <CardHeader
              title="Official Institutional Enrollment"
              subtitle="Registered under University Academic Registry"
            />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">University Roll Number</span>
                <span className="font-mono text-sm font-bold text-gold-400">
                  {student?.rollNo || session?.user?.rollNo || "ECE-2023-042"}
                </span>
              </div>

              <div className="p-3.5 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Academic Class & Section</span>
                <span className="font-medium text-ivory-100">
                  {student?.className || "3rd Year ECE"} • {student?.sectionName || "Section A"}
                </span>
              </div>

              <div className="p-3.5 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Current Academic Term</span>
                <span className="font-medium text-ivory-100">
                  {student?.semesterLabel || "Semester 5 (2026)"}
                </span>
              </div>

              <div className="p-3.5 rounded bg-navy-900 border border-navy-750">
                <span className="text-ivory-400 block mb-1">Attendance Standing</span>
                <span className="font-bold text-emerald-400">
                  {attendance?.overallPercentage || 95}% (Satisfactory)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-serif text-sm font-semibold text-ivory-200 mb-2">
                Enrolled Papers in Active Term:
              </h4>
              <div className="flex flex-wrap gap-2">
                {subjectStats?.map((s: any) => (
                  <Badge key={s.id} variant="navy" size="md">
                    <strong className="text-gold-400 font-mono mr-1">{s.code}</strong> {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
