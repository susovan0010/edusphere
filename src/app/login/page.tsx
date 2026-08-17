"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-navy-950 flex items-center justify-center text-ivory-300">Loading EduSphere Portal...</div>}>
      <LoginFormContent />
    </React.Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Refresh to allow middleware to route to role default landing page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 selection:bg-gold-500/30 selection:text-gold-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Crest & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 via-gold-600 to-gold-700 text-navy-950 shadow-goldGlow mb-4">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-ivory-100">
            EduSphere
          </h1>
          <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mt-1">
            Collegiate Management System
          </p>
          <div className="w-16 h-0.5 bg-gold-500/60 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Login Card */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-xl p-6 sm:p-8 shadow-aristocrat">
          <h2 className="font-serif text-xl font-semibold text-ivory-100 mb-1">Sign In</h2>
          <p className="text-xs text-ivory-400 mb-6">
            Enter your collegiate credentials to access your portal
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded bg-rust-500/15 border border-rust-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5 uppercase tracking-wider">
                Collegiate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ivory-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@edusphere.edu"
                  className="w-full bg-navy-950 border border-navy-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-ivory-100 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ivory-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-navy-950 border border-navy-700 rounded-md pl-10 pr-4 py-2.5 text-sm text-ivory-100 placeholder-navy-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-serif text-sm font-bold tracking-wide"
            >
              Sign In to Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-navy-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400/90 mb-3">
              One-Click Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("admin@edusphere.edu", "Admin@123")}
                className="p-2 rounded bg-navy-950 hover:bg-navy-800 border border-navy-700/80 text-left transition-colors"
              >
                <span className="font-semibold text-maroon-300 block">Admin</span>
                <span className="text-[10px] text-ivory-400 font-mono">admin@edusphere.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("prof.sharma@edusphere.edu", "Teacher@123")}
                className="p-2 rounded bg-navy-950 hover:bg-navy-800 border border-navy-700/80 text-left transition-colors"
              >
                <span className="font-semibold text-gold-400 block">Faculty (ECE)</span>
                <span className="text-[10px] text-ivory-400 font-mono">prof.sharma@edusphere.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("rohit.sen@edusphere.edu", "Student@123")}
                className="p-2 rounded bg-navy-950 hover:bg-navy-800 border border-navy-700/80 text-left transition-colors"
              >
                <span className="font-semibold text-emerald-400 block">Student (ECE)</span>
                <span className="text-[10px] text-ivory-400 font-mono">rohit.sen@edusphere.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("new.student@edusphere.edu", "Temp@123")}
                className="p-2 rounded bg-navy-950 hover:bg-navy-800 border border-navy-700/80 text-left transition-colors"
              >
                <span className="font-semibold text-amber-300 block">First-Login Gate</span>
                <span className="text-[10px] text-ivory-400 font-mono">new.student@edusphere.edu</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-ivory-400/60 mt-6 font-serif">
          EduSphere Collegiate Architecture • Secure TLS & JWT Authentication
        </p>
      </div>
    </div>
  );
}
