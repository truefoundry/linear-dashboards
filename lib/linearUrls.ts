const BASE = "https://linear.app";

function encode(filter: object) {
  return encodeURIComponent(JSON.stringify(filter));
}

/** All issues for a team, optionally filtered. */
export function teamIssuesUrl(org: string, teamKey: string, filter?: object) {
  const base = `${BASE}/${org}/team/${teamKey}/all`;
  return filter ? `${base}?filter=${encode(filter)}` : base;
}

/** All completed issues for a team in a specific calendar week. */
export function weeklyCompletedUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    completedAt: { gte: weekStartISO, lte: weekEndISO },
  });
}

/** Completed issues late (completed after due date) in a week. */
export function weeklyLateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    dueDate: { lt: weekStartISO }, // due before the week they were closed → late
  });
}

/** Completed issues that were on-time in a week. */
export function weeklyOnTimeUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    dueDate: { gte: weekStartISO }, // due date within or after the window they closed in
  });
}

/** Direct link to a project's issues. */
export function projectUrl(org: string, projectId: string) {
  return `${BASE}/${org}/project/${projectId}/issues`;
}

/** Completed issues for a specific assignee across the whole period. */
export function devIssuesUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  afterISO: string,
  beforeISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: afterISO, lte: beforeISO },
  });
}

/** Completed issues for an assignee in a specific week. */
export function devWeekUrl(
  org: string,
  teamKey: string,
  assigneeId: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    assignee: { id: { eq: assigneeId } },
    completedAt: { gte: weekStartISO, lte: weekEndISO },
  });
}

/** Completed issues missing story point estimation (estimate is null). */
export function missingEstimateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    estimate: { null: true },
  });
}

/** Completed issues missing a due date. */
export function missingDueDateUrl(
  org: string,
  teamKey: string,
  weekStartISO: string,
  weekEndISO: string
) {
  return teamIssuesUrl(org, teamKey, {
    completedAt: { gte: weekStartISO, lte: weekEndISO },
    dueDate: { null: true },
  });
}
