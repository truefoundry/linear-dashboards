import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompletedIssues, LinearIssue } from "@/lib/linear";
import {
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  format,
  parseISO,
  isWithinInterval,
} from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const weeks = parseInt(searchParams.get("weeks") ?? "6", 10);

  if (!teamId) {
    return NextResponse.json({ error: "teamId required" }, { status: 400 });
  }

  const now = new Date();
  const before = endOfWeek(now, { weekStartsOn: 1 });
  const after = startOfWeek(
    new Date(now.getTime() - (weeks - 1) * 7 * 24 * 60 * 60 * 1000),
    { weekStartsOn: 1 }
  );

  const afterISO = after.toISOString();
  const beforeISO = before.toISOString();

  const issues = await getCompletedIssues(
    session.accessToken,
    teamId,
    afterISO,
    beforeISO
  );

  const weekIntervals = eachWeekOfInterval(
    { start: after, end: before },
    { weekStartsOn: 1 }
  );

  // ── velocity trend ──────────────────────────────────────────────────────────
  const velocityTrend = weekIntervals.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekIssues = issues.filter((i) => {
      if (!i.completedAt) return false;
      const d = parseISO(i.completedAt);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
    return {
      week: format(weekStart, "MMM d"),
      count: weekIssues.length,
      points: weekIssues.reduce((s, i) => s + (i.estimate ?? 0), 0),
    };
  });

  // ── project allocation ───────────────────────────────────────────────────────
  const projectMap = new Map<string, { name: string; count: number; points: number }>();
  for (const issue of issues) {
    const key = issue.project?.id ?? "__no_project__";
    const name = issue.project?.name ?? "No Project";
    const existing = projectMap.get(key) ?? { name, count: 0, points: 0 };
    projectMap.set(key, {
      name,
      count: existing.count + 1,
      points: existing.points + (issue.estimate ?? 0),
    });
  }
  const projectAllocation = Array.from(projectMap.values()).sort(
    (a, b) => b.points - a.points
  );

  // ── efficiency trend: on-time completion rate ───────────────────────────────
  // Only considers issues that have a dueDate set.
  // "On time" = completedAt <= dueDate (date comparison, time ignored).
  const efficiencyTrend = weekIntervals.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekIssues = issues.filter((i) => {
      if (!i.completedAt) return false;
      const d = parseISO(i.completedAt);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
    // Only issues that had a due date set
    const withDueDate = weekIssues.filter((i) => i.dueDate != null);
    const onTime = withDueDate.filter((i) => {
      // dueDate is YYYY-MM-DD; completedAt is ISO datetime — compare date parts
      const completedDay = i.completedAt!.slice(0, 10);
      return completedDay <= i.dueDate!;
    });
    const late = withDueDate.length - onTime.length;
    return {
      week: format(weekStart, "MMM d"),
      withDueDate: withDueDate.length,
      onTime: onTime.length,
      late,
      onTimeRate: withDueDate.length
        ? Math.round((onTime.length / withDueDate.length) * 100)
        : null,
    };
  });

  // ── data quality trend: % issues missing story points or due date ────────────
  const dataQualityTrend = weekIntervals.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekIssues = issues.filter((i) => {
      if (!i.completedAt) return false;
      const d = parseISO(i.completedAt);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
    // 0 is a valid estimate; only null means "not set"
    const missingPoints = weekIssues.filter((i) => i.estimate == null).length;
    const missingDueDate = weekIssues.filter((i) => i.dueDate == null).length;
    const missingBoth = weekIssues.filter(
      (i) => i.estimate == null && i.dueDate == null
    ).length;
    const total = weekIssues.length;
    return {
      week: format(weekStart, "MMM d"),
      total,
      missingPoints,
      missingDueDate,
      missingBoth,
      missingPointsPct: total ? Math.round((missingPoints / total) * 100) : 0,
      missingDueDatePct: total ? Math.round((missingDueDate / total) * 100) : 0,
    };
  });

  // ── per-developer velocity ───────────────────────────────────────────────────
  const devMap = new Map<
    string,
    { name: string; weeks: Map<string, { count: number; points: number }> }
  >();

  for (const issue of issues) {
    if (!issue.assignee || !issue.completedAt) continue;
    const { id, name } = issue.assignee;
    if (!devMap.has(id)) devMap.set(id, { name, weeks: new Map() });
    const dev = devMap.get(id)!;

    const d = parseISO(issue.completedAt);
    const ws = format(startOfWeek(d, { weekStartsOn: 1 }), "MMM d");
    const prev = dev.weeks.get(ws) ?? { count: 0, points: 0 };
    dev.weeks.set(ws, {
      count: prev.count + 1,
      points: prev.points + (issue.estimate ?? 0),
    });
  }

  const weekLabels = weekIntervals.map((w) => format(w, "MMM d"));
  const devVelocity = Array.from(devMap.entries()).map(([id, dev]) => ({
    id,
    name: dev.name,
    data: weekLabels.map((w) => ({
      week: w,
      count: dev.weeks.get(w)?.count ?? 0,
      points: dev.weeks.get(w)?.points ?? 0,
    })),
    totalCount: Array.from(dev.weeks.values()).reduce((s, v) => s + v.count, 0),
    totalPoints: Array.from(dev.weeks.values()).reduce((s, v) => s + v.points, 0),
  }));

  devVelocity.sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json({
    period: { from: afterISO, to: beforeISO, weeks },
    totalIssues: issues.length,
    totalPoints: issues.reduce((s, i) => s + (i.estimate ?? 0), 0),
    velocityTrend,
    projectAllocation,
    efficiencyTrend,
    dataQualityTrend,
    devVelocity,
    weekLabels,
  });
}
