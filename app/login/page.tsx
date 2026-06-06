"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 p-10 w-full max-w-sm text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <svg className="w-10 h-10 text-violet-400" viewBox="0 0 100 100" fill="currentColor">
            <path d="M1.2 61.5 L38.6 98.8 C39.6 99.8 41.3 99.1 41.3 97.7 L41.3 62.8 C41.3 62.1 40.8 61.5 40.1 61.5 Z" />
            <path d="M1.2 38.5 L61.5 98.8 C62.5 99.8 64.2 99.1 64.2 97.7 L64.2 39.8 C64.2 39.1 63.7 38.5 63 38.5 Z" />
            <path d="M2.3 15.1 C1.2 16.2 1.2 17.9 2.3 19 L81 97.7 C82.1 98.8 83.8 98.8 84.9 97.7 C86 96.6 86 94.9 84.9 93.8 L6.2 15.1 C5.1 14 3.4 14 2.3 15.1 Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Linear Productivity</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Connect your Linear workspace to view team velocity and productivity metrics.
          </p>
        </div>
        <button
          onClick={() => signIn("linear", { callbackUrl: "/dashboard" })}
          className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 100 100" fill="currentColor">
            <path d="M1.2 61.5 L38.6 98.8 C39.6 99.8 41.3 99.1 41.3 97.7 L41.3 62.8 C41.3 62.1 40.8 61.5 40.1 61.5 Z" />
            <path d="M1.2 38.5 L61.5 98.8 C62.5 99.8 64.2 99.1 64.2 97.7 L64.2 39.8 C64.2 39.1 63.7 38.5 63 38.5 Z" />
            <path d="M2.3 15.1 C1.2 16.2 1.2 17.9 2.3 19 L81 97.7 C82.1 98.8 83.8 98.8 84.9 97.7 C86 96.6 86 94.9 84.9 93.8 L6.2 15.1 C5.1 14 3.4 14 2.3 15.1 Z" />
          </svg>
          Sign in with Linear
        </button>
        <p className="text-xs text-slate-500">
          OAuth read-only access · credentials are never stored
        </p>
      </div>
    </div>
  );
}
