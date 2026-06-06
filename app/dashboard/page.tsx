"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import VelocityChart from "@/components/VelocityChart";
import ProjectAllocationChart from "@/components/ProjectAllocationChart";
import EfficiencyChart from "@/components/EfficiencyChart";
import DataQualityChart from "@/components/DataQualityChart";
import DevVelocityChart from "@/components/DevVelocityChart";
import StatCard from "@/components/StatCard";

interface Team {
  id: string;
  name: string;
  key: string;
}

interface DashboardData {
  orgUrlKey: string;
  teamKey: string;
  teamUrl: string;
  completedStateIds: string[];
  period: { from: string; to: string; weeks: number };
  totalIssues: number;
  totalPoints: number;
  velocityTrend: { week: string; weekStartISO: string; weekEndISO: string; count: number; points: number }[];
  projectAllocation: { id: string | null; name: string; count: number; points: number }[];
  efficiencyTrend: {
    week: string;
    weekStartISO: string;
    weekEndISO: string;
    withDueDate: number;
    onTime: number;
    late: number;
    onTimeRate: number | null;
  }[];
  dataQualityTrend: {
    week: string;
    weekStartISO: string;
    weekEndISO: string;
    total: number;
    missingPoints: number;
    missingDueDate: number;
    missingBoth: number;
    missingPointsPct: number;
    missingDueDatePct: number;
  }[];
  devVelocity: {
    id: string;
    name: string;
    email: string;
    data: { week: string; weekStartISO: string; weekEndISO: string; count: number; points: number }[];
    totalCount: number;
    totalPoints: number;
  }[];
  weekLabels: string[];
}

const WEEK_OPTIONS = [2, 4, 6, 8, 12];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [weeks, setWeeks] = useState(6);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/linear/teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data);
        if (data.length > 0) setSelectedTeam(data[0].id);
      })
      .catch(() => setError("Failed to load teams"));
  }, [status]);

  const loadDashboard = useCallback(() => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/linear/dashboard?teamId=${selectedTeam}&weeks=${weeks}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDashboard(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTeam, weeks]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-[#0f1117]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-violet-400" viewBox="0 0 100 100" fill="currentColor">
              <path d="M1.2 61.5 L38.6 98.8 C39.6 99.8 41.3 99.1 41.3 97.7 L41.3 62.8 C41.3 62.1 40.8 61.5 40.1 61.5 Z" />
              <path d="M1.2 38.5 L61.5 98.8 C62.5 99.8 64.2 99.1 64.2 97.7 L64.2 39.8 C64.2 39.1 63.7 38.5 63 38.5 Z" />
              <path d="M2.3 15.1 C1.2 16.2 1.2 17.9 2.3 19 L81 97.7 C82.1 98.8 83.8 98.8 84.9 97.7 C86 96.6 86 94.9 84.9 93.8 L6.2 15.1 C5.1 14 3.4 14 2.3 15.1 Z" />
            </svg>
            <span className="font-semibold text-base text-slate-100">Linear Productivity</span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <span className="text-sm text-slate-400">{session.user.name}</span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 min-w-[180px]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-800">
                  {t.name} ({t.key})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">Timeline</label>
            <select
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40"
            >
              {WEEK_OPTIONS.map((w) => (
                <option key={w} value={w} className="bg-slate-800">
                  {w} weeks
                </option>
              ))}
            </select>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 pb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-500" />
              Loading…
            </div>
          )}
          {error && (
            <p className="text-sm text-red-400 pb-2">Error: {error}</p>
          )}
        </div>

        {dashboard && !loading && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Issues Completed"
                value={dashboard.totalIssues}
                sub={`last ${weeks} weeks`}
              />
              <StatCard
                label="Story Points"
                value={dashboard.totalPoints}
                sub={`last ${weeks} weeks`}
              />
              <StatCard
                label="Projects Active"
                value={dashboard.projectAllocation.length}
              />
              <StatCard
                label="Contributors"
                value={dashboard.devVelocity.length}
              />
            </div>

            {/* Velocity Trend */}
            <section className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">Team Velocity Trend</h2>
              <p className="text-xs text-slate-500 mb-4">Issues completed and story points delivered per week · click a bar to open in Linear</p>
              <VelocityChart data={dashboard.velocityTrend} teamUrl={dashboard.teamUrl} completedStateIds={dashboard.completedStateIds} />
            </section>

            {/* Two-column row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Project Allocation</h2>
                <p className="text-xs text-slate-500 mb-4">Issues and points per project · click a bar to open in Linear</p>
                <ProjectAllocationChart data={dashboard.projectAllocation} org={dashboard.orgUrlKey} />
              </section>
              <section className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-1">On-Time Completion</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Issues closed on or before due date · excludes issues with no due date
                </p>
                <EfficiencyChart data={dashboard.efficiencyTrend} teamUrl={dashboard.teamUrl} completedStateIds={dashboard.completedStateIds} />
              </section>
            </div>

            {/* Data quality */}
            <section className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">Data Quality</h2>
              <p className="text-xs text-slate-500 mb-4">
                % of completed issues missing story points or due date — lower is better
              </p>
              <DataQualityChart data={dashboard.dataQualityTrend} teamUrl={dashboard.teamUrl} completedStateIds={dashboard.completedStateIds} />
            </section>

            {/* Per-developer velocity */}
            <section className="bg-slate-800/60 rounded-xl border border-slate-700/60 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">Per-Developer Velocity</h2>
              <p className="text-xs text-slate-500 mb-4">Weekly throughput by team member</p>
              <DevVelocityChart
                devVelocity={dashboard.devVelocity}
                weekLabels={dashboard.weekLabels}
                teamUrl={dashboard.teamUrl}
                completedStateIds={dashboard.completedStateIds}
                periodStart={dashboard.period.from}
                periodEnd={dashboard.period.to}
              />
            </section>
          </>
        )}

        {!dashboard && !loading && !error && (
          <div className="text-center text-slate-500 py-20">
            Select a team to load the dashboard.
          </div>
        )}
      </main>
    </div>
  );
}
