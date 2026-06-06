/**
 * URL builder for Linear web app deep links.
 *
 * teamUrl comes from team.url in the GraphQL API (e.g. "https://linear.app/org/team/KEY").
 * We derive view URLs from it so the base path is always correct.
 *
 * Linear's documented views:
 *   {teamUrl}/active      - in progress
 *   {teamUrl}/backlog     - backlog
 *   {teamUrl}/completed   - completed (all time)
 *   {teamUrl}/all         - all issues
 *
 * For date/assignee/quality filtering we use Linear's undocumented but stable
 * ?filter= param with base64-encoded JSON matching the IssueFilter GraphQL type.
 * (URL-encoded JSON was tried and does not work; base64 is the correct encoding.)
 */

function encodeFilter(filter: object): string {
  // Linear's web app reads the filter param as base64-encoded JSON
  return btoa(JSON.stringify(filter));
}

function withFilter(base: string, filter: object): string {
  return `${base}?filter=${encodeFilter(filter)}`;
}


/** Completed issues in a calendar week (YYYY-MM-DD). */
export function weeklyCompletedUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
  });
}

/** Completed issues that were late in a week. */
export function weeklyLateUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { lt: weekStart },
  });
}

/** Completed issues that were on-time in a week. */
export function weeklyOnTimeUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { gte: weekStart },
  });
}

/** Direct link to a project's issues (uses projectId from the API). */
export function projectUrl(org: string, projectId: string): string {
  return `https://linear.app/${org}/project/${projectId}/issues`;
}

/** All completed issues for a developer across a period. */
export function devIssuesUrl(
  teamUrl: string,
  assigneeEmail: string,
  periodStart: string,
  periodEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    assignee: { email: { eq: assigneeEmail } },
    completedAt: { gte: periodStart, lte: periodEnd },
  });
}

/** Completed issues for a developer in a specific week. */
export function devWeekUrl(
  teamUrl: string,
  assigneeEmail: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    assignee: { email: { eq: assigneeEmail } },
    completedAt: { gte: weekStart, lte: weekEnd },
  });
}

/** Completed issues missing a story point estimate in a week. */
export function missingEstimateUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    estimate: { null: true },
  });
}

/** Completed issues missing a due date in a week. */
export function missingDueDateUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    dueDate: { null: true },
  });
}

/** Completed issues missing both estimate and due date in a week. */
export function missingBothUrl(
  teamUrl: string,
  weekStart: string,
  weekEnd: string,
  completedStateIds: string[]
): string {
  return withFilter(`${teamUrl}/all`, {
    state: { id: { in: completedStateIds } },
    completedAt: { gte: weekStart, lte: weekEnd },
    estimate: { null: true },
    dueDate: { null: true },
  });
}

