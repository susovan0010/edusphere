"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Menu,
  KeyRound,
  LogOut,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { Badge } from "../ui/Badge";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkDrive() {
      if (session?.user) {
        try {
          const res = await fetch("/api/gdrive/status");
          if (res.ok) {
            const data = await res.json();
            setDriveConnected(data.connected);
          }
        } catch (e) {
          console.error("Failed to check Google Drive status", e);
        }
      }
    }
    checkDrive();
  }, [session]);

  const handleConnectDrive = async () => {
    try {
      const res = await fetch("/api/gdrive/auth-url");
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (e) {
      console.error("Failed to initiate Drive OAuth", e);
    }
  };

  const handleDisconnectDrive = async () => {
    if (confirm("Disconnect Google Drive from your account?")) {
      try {
        const res = await fetch("/api/gdrive/status", { method: "DELETE" });
        if (res.ok) {
          setDriveConnected(false);
        }
      } catch (e) {
        console.error("Failed to disconnect Drive", e);
      }
    }
  };

  const roleVariant =
    session?.user?.role === "ADMIN"
      ? "maroon"
      : session?.user?.role === "TEACHER"
      ? "gold"
      : "sage";

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-700/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md lg:hidden text-ivory-300 hover:text-gold-400 hover:bg-navy-800"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-navy-950 shadow-sm">
            <GraduationCap className="w-5 h-5 font-bold" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wide text-ivory-100 block leading-tight">
              EduSphere
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold-400/90 font-medium block">
              College Management
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Active Semester Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-navy-800 border border-navy-700 text-xs text-ivory-300">
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
          <span className="font-medium text-ivory-200">Semester 5</span>
          <span className="text-ivory-400">• 2026 Term</span>
        </div>

        {/* Google Drive Status Button / Indicator */}
        <div className="relative">
          {driveConnected === true ? (
            <button
              onClick={handleDisconnectDrive}
              title="Google Drive Connected (Click to manage)"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-750 border border-sage-500/40 text-xs text-emerald-400 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive Synced</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </button>
          ) : driveConnected === false ? (
            <button
              onClick={handleConnectDrive}
              title="Connect Google Drive for personal document storage"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-800 hover:bg-gold-500/10 border border-gold-500/30 text-xs text-gold-400 transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect Drive</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : null}
        </div>

        {/* Top-Bar Notification Bell */}
        <NotificationBell />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-md hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <div className="w-8 h-8 rounded-full bg-navy-800 border border-gold-500/40 flex items-center justify-center text-gold-400 font-serif text-sm font-semibold">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-ivory-100 max-w-[120px] truncate leading-tight">
                {session?.user?.name || "User"}
              </p>
              <Badge variant={roleVariant} size="sm">
                {session?.user?.role}
              </Badge>
            </div>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-navy-850 border border-navy-700 rounded-lg shadow-2xl z-50 p-2 divide-y divide-navy-750"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2.5">
                <p className="font-serif text-sm font-semibold text-ivory-100 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-ivory-400 truncate">{session?.user?.email}</p>
                {session?.user?.rollNo && (
                  <p className="text-[11px] text-gold-400/90 mt-1 font-mono">
                    Roll: {session.user.rollNo}
                  </p>
                )}
                {session?.user?.department && (
                  <p className="text-[11px] text-gold-400/90 mt-1">
                    Dept: {session.user.department}
                  </p>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/account/change-password");
                  }}
                  className="w-full px-3 py-2 text-xs text-ivory-200 hover:bg-navy-800 hover:text-gold-400 flex items-center gap-2 rounded transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-gold-400" />
                  Change Password
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-rust-500/10 flex items-center gap-2 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
