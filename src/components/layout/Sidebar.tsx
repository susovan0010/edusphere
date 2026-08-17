"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Users,
  GraduationCap,
  Award,
  ShieldCheck,
  History,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { Badge } from "../ui/Badge";

interface SidebarProps {
  onCloseMobile?: () => void;
}

interface PaperItem {
  id: string;
  code: string;
  name: string;
  status?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [papersOpen, setPapersOpen] = useState(true);
  const [myPapers, setMyPapers] = useState<PaperItem[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const role = session?.user?.role;

  useEffect(() => {
    async function loadSidebarData() {
      if (!session?.user) return;

      // 1. Fetch dynamic "My Papers" for current semester
      try {
        const res = await fetch("/api/papers/current");
        if (res.ok) {
          const data = await res.json();
          setMyPapers(data.papers || []);
        }
      } catch (e) {
        console.error("Failed to load papers list", e);
      }

      // 2. If Admin, fetch pending approvals count
      if (session.user.role === "ADMIN") {
        try {
          const res = await fetch("/api/admin/approvals/count");
          if (res.ok) {
            const data = await res.json();
            setPendingApprovalsCount(data.count || 0);
          }
        } catch (e) {
          console.error("Failed to load approvals count", e);
        }
      }
    }

    loadSidebarData();
  }, [session, pathname]);

  const handleNavClick = (href: string) => {
    router.push(href);
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (href: string) => {
    if (href === "/student/dashboard" || href === "/teacher/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col h-full select-none">
      {/* Sidebar Header / Sub-crest */}
      <div className="p-4 border-b border-navy-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-gold-500 rounded-sm"></div>
          <div>
            <p className="font-serif text-sm font-semibold text-ivory-100 uppercase tracking-wider">
              {role === "ADMIN" ? "Admin Portal" : role === "TEACHER" ? "Faculty Portal" : "Student Portal"}
            </p>
            <p className="text-[10px] text-gold-400 font-mono tracking-tight">Active Academic Session</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* ================= STUDENT NAVIGATION ================= */}
        {role === "STUDENT" && (
          <>
            {/* 1. Results / Dashboard (Default) */}
            <button
              onClick={() => handleNavClick("/student/dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/student/dashboard")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
              <span>Dashboard / Results</span>
            </button>

            {/* 2. Attendance */}
            <button
              onClick={() => handleNavClick("/student/attendance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/student/attendance")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Attendance Analytics</span>
            </button>

            {/* 3. Marks */}
            <button
              onClick={() => handleNavClick("/student/marks")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/student/marks")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <Award className="w-4 h-4 text-gold-300" />
              <span>Academic Marks</span>
            </button>

            {/* 4. Assignments */}
            <button
              onClick={() => handleNavClick("/student/assignments")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/student/assignments")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Assignments & Tests</span>
            </button>

            {/* 5. My Papers (Master-Detail Dynamic Group) */}
            <div className="pt-2 pb-1">
              <button
                onClick={() => setPapersOpen(!papersOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-ivory-400 hover:text-gold-400 transition-colors uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-400" />
                  My Papers
                </span>
                {papersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-ivory-400" />}
              </button>

              {papersOpen && (
                <div className="mt-1 pl-4 space-y-1 border-l border-navy-800 ml-3">
                  {myPapers.length === 0 ? (
                    <p className="text-[11px] text-ivory-400/60 py-1.5 px-2 italic">
                      No papers enrolled
                    </p>
                  ) : (
                    myPapers.map((paper) => (
                      <button
                        key={paper.id}
                        onClick={() => handleNavClick(`/student/papers/${paper.code}`)}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors flex items-center justify-between ${
                          pathname === `/student/papers/${paper.code}`
                            ? "bg-gold-500/20 text-gold-400 font-semibold"
                            : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
                        }`}
                      >
                        <span className="truncate">{paper.code}</span>
                        <span className="text-[10px] font-sans text-ivory-400 truncate max-w-[85px]">
                          {paper.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 6. Profile */}
            <button
              onClick={() => handleNavClick("/student/profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/student/profile")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-maroon-300" />
              <span>Student Profile</span>
            </button>
          </>
        )}

        {/* ================= TEACHER NAVIGATION ================= */}
        {role === "TEACHER" && (
          <>
            {/* 1. Take Attendance (TOP PRIORITY & DEFAULT LANDING) */}
            <button
              onClick={() => handleNavClick("/teacher/attendance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                isActive("/teacher/attendance")
                  ? "bg-gold-500 text-navy-950 font-bold shadow-goldGlow"
                  : "text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Take Attendance</span>
            </button>

            {/* 2. Dashboard / Results */}
            <button
              onClick={() => handleNavClick("/teacher/dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/dashboard")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
              <span>Class Dashboard</span>
            </button>

            {/* 3. My Students */}
            <button
              onClick={() => handleNavClick("/teacher/students")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/students")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <Users className="w-4 h-4 text-maroon-300" />
              <span>My Students</span>
            </button>

            {/* 4. Assignments */}
            <button
              onClick={() => handleNavClick("/teacher/assignments")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/assignments")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Assignments</span>
            </button>

            {/* 5. Marks Entry */}
            <button
              onClick={() => handleNavClick("/teacher/marks")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/marks")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Marks Entry</span>
            </button>

            {/* 6. Question Bank */}
            <button
              onClick={() => handleNavClick("/teacher/question-bank")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/question-bank")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <BookOpen className="w-4 h-4 text-gold-300" />
              <span>Question Bank</span>
            </button>

            {/* 7. My Papers (Master-Detail Dynamic Group + Propose Action) */}
            <div className="pt-2 pb-1">
              <button
                onClick={() => setPapersOpen(!papersOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-ivory-400 hover:text-gold-400 transition-colors uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-400" />
                  My Papers
                </span>
                {papersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-ivory-400" />}
              </button>

              {papersOpen && (
                <div className="mt-1 pl-4 space-y-1 border-l border-navy-800 ml-3">
                  {myPapers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => handleNavClick(`/teacher/papers/${paper.code}`)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors flex items-center justify-between ${
                        pathname === `/teacher/papers/${paper.code}`
                          ? "bg-gold-500/20 text-gold-400 font-semibold"
                          : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
                      }`}
                    >
                      <span className="truncate">{paper.code}</span>
                      {paper.status === "PENDING" && (
                        <span className="text-[9px] bg-maroon-500/30 text-rose-300 px-1 py-0.2 rounded border border-maroon-500/40">
                          Pending
                        </span>
                      )}
                    </button>
                  ))}

                  {/* + Propose a Paper action */}
                  <button
                    onClick={() => handleNavClick("/teacher/papers/propose")}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs font-sans text-gold-400 hover:text-gold-300 hover:bg-gold-500/10 transition-colors flex items-center gap-1.5 mt-1"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Propose Paper</span>
                  </button>
                </div>
              )}
            </div>

            {/* 8. Reports & Analytics */}
            <button
              onClick={() => handleNavClick("/teacher/reports")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/teacher/reports")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Reports & Analytics</span>
            </button>
          </>
        )}

        {/* ================= ADMIN NAVIGATION ================= */}
        {role === "ADMIN" && (
          <>
            {/* 1. Dashboard / Results (Default) */}
            <button
              onClick={() => handleNavClick("/admin/dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
              <span>Institution Dashboard</span>
            </button>

            {/* 2. Students CRUD */}
            <button
              onClick={() => handleNavClick("/admin/students")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/students")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Students Directory</span>
            </button>

            {/* 3. Teachers CRUD */}
            <button
              onClick={() => handleNavClick("/admin/teachers")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/teachers")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <Users className="w-4 h-4 text-gold-300" />
              <span>Faculty Directory</span>
            </button>

            {/* 4. Classes & Subjects CRUD */}
            <button
              onClick={() => handleNavClick("/admin/classes")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/classes")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <BookOpen className="w-4 h-4 text-maroon-300" />
              <span>Classes & Subjects</span>
            </button>

            {/* 5. Approvals Queue */}
            <button
              onClick={() => handleNavClick("/admin/approvals")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/approvals")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Paper Approvals</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <Badge variant="maroon" size="sm">
                  {pendingApprovalsCount}
                </Badge>
              )}
            </button>

            {/* 6. Reports */}
            <button
              onClick={() => handleNavClick("/admin/reports")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/reports")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Global Reports</span>
            </button>

            {/* 7. Settings & Audit Log */}
            <button
              onClick={() => handleNavClick("/admin/audit-log")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive("/admin/audit-log")
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-ivory-300 hover:text-ivory-100 hover:bg-navy-850"
              }`}
            >
              <History className="w-4 h-4 text-ivory-400" />
              <span>Audit Log</span>
            </button>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-navy-800 text-center">
        <p className="text-[11px] text-ivory-400/80 font-serif">EduSphere • Aristocratic CMS</p>
        <p className="text-[9px] text-gold-500/70 mt-0.5">Vercel Serverless Ready</p>
      </div>
    </aside>
  );
};
