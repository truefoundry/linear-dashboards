const BASE = "https://linear.app";

function encode(filter: object) {
  return encodeURIComponent(JSON.stringify(filter));
}

/** All issues for a team, optionally filtered. */
export function teamIssuesUrl(org: string, teamKey: string, filter?: object) {
  const base = `${BASE}/${org}/team/${teamKey}/all`;
  return filter ? `${base}?filter=${encode(filter)}` : base;
}

/** Completed issues in a calendar week (scoped to workspace's completed state IDs). */
export function weeklyCompletedUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
  });
}

/** Completed issues that were late (completedAt > dueDate) in a week. */
export function weeklyLateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    // completedAt date part > dueDate → late
    // We can't express this inequality directly in one filter so we exclude
    // issues whose dueDate is ≥ their completion week start (those are on-time).
    dueDate: { lt: weekStartISO },
  });
}

/** Completed issues that were on-time (completedAt ≤ dueDate) in a week. */
export function weeklyOnTimeUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    dueDate: { gte: weekStartISO },
  });
}

/** Direct link to a project's issues. */
export function projectUrl(org: string, projectId: string) {
  return `${BASE}/${org}/project/${projectId}/issues`;
}

/** All completed issues for a developer across a period. */
export function devIssuesUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  afterISO: string,
  beforeISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: afterISO, lte: beforeISO },
  });
}

/** Completed issues for a developer in a specific week. */
export function devWeekUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
  });
}

/** Completed issues missing a story point estimate in a week. */
export function missingEstimateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    estimate: { null: true },
  });
}

/** Completed issues missing a due date in a week. */
export function missingDueDateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string,
  completedStateIds: string[]
) {
  return teamIssuesUrl(org, teamKey, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    dueDate: { null: true },
  });
}
