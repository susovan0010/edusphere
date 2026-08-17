import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-navy-900 border border-rust-500/30 rounded-xl p-8 shadow-aristocrat space-y-4">
        <div className="w-16 h-16 rounded-full bg-rust-500/10 border border-rust-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-2xl font-bold text-ivory-100">
          Access Restricted
        </h1>

        <p className="text-xs text-ivory-300 leading-relaxed">
          You do not possess the necessary collegiate role credentials to access this administrative route.
        </p>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to My Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
