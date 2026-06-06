const BASE = "https://linear.app";

function encode(filter: object) {
  return encodeURIComponent(JSON.stringify(filter));
}

/** All issues for a team, optionally filtered. */
export function teamIssuesUrl(org: string, teamKey: string, filter?: object) {
  const base = `${BASE}/${org}/team/${teamKey}/all`;
  return filter ? `${base}?filter=${encode(filter)}` : base;
}

/**
 * Completed issues in a calendar week.
 * weekStart / weekEnd are YYYY-MM-DD strings (e.g. "2025-05-12" / "2025-05-18").
 */
export function weeklyCompletedUrl(
  org: string,
  teamKey: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
  });
}

/**
 * Completed issues that were late (closed after their due date) in a week.
 * "Late" = dueDate < completedAt, approximated as dueDate < weekStart
 * (i.e. the due date had already passed before the week the issue was closed).
 */
export function weeklyLateUrl(
  org: string,
  teamKey: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { lt: weekStart },
  });
}

/**
 * Completed issues that were on-time (closed on or before their due date) in a week.
 * "On time" = dueDate >= completedAt, approximated as dueDate >= weekStart.
 */
export function weeklyOnTimeUrl(
  org: string,
  teamKey: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { gte: weekStart },
  });
}

/** Direct link to a project's issues. */
export function projectUrl(org: string, projectId: string) {
  return `${BASE}/${org}/project/${projectId}/issues`;
}

/** All completed issues for a developer across a period (YYYY-MM-DD bounds). */
export function devIssuesUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  periodStart: string,
  periodEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: periodStart, lte: periodEnd },
  });
}

/** Completed issues for a developer in a specific week (YYYY-MM-DD bounds). */
export function devWeekUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: weekStart, lte: weekEnd },
  });
}

/** Completed issues missing a story point estimate in a week. */
export function missingEstimateUrl(
  org: string,
  teamKey: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    estimate: { null: true },
  });
}

/** Completed issues missing a due date in a week. */
export function missingDueDateUrl(
  org: string,
  teamKey: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { null: true },
  });
}
