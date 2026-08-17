"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ChangePasswordPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      await update({ mustChangePassword: false });

      // Redirect to correct role landing page after 1.5 seconds
      setTimeout(() => {
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (session?.user?.role === "TEACHER") {
          router.push("/teacher/attendance");
        } else {
          router.push("/student/dashboard");
        }
        router.refresh();
      }, 1200);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory-100">
            {session?.user?.mustChangePassword ? "Mandatory Password Setup" : "Update Your Password"}
          </h1>
          <p className="text-xs text-ivory-400 mt-1 max-w-xs mx-auto">
            {session?.user?.mustChangePassword
              ? "Your administrator generated a temporary credential. Please establish your personal secure password to continue."
              : "Choose a strong password to protect your collegiate account."}
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-6 sm:p-8 shadow-aristocrat">
          {error && (
            <div className="mb-5 p-3 rounded bg-rust-500/15 border border-rust-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded bg-sage-500/15 border border-sage-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Password updated! Redirecting to your portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5 uppercase tracking-wider">
                New Password (Min 6 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3.5 py-2.5 text-sm text-ivory-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-navy-700 rounded-md px-3.5 py-2.5 text-sm text-ivory-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading || success}
              className="w-full mt-2 font-serif"
            >
              Set New Password <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
