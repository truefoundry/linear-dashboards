const LINEAR_API = "https://api.linear.app/graphql";

async function gql(token: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Linear API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function getViewer(token: string) {
  const data = await gql(token, `{
    viewer { organization { urlKey } }
  }`);
  return data.viewer as { organization: { urlKey: string } };
}

export async function getTeams(token: string) {
  const data = await gql(token, `{
    teams { nodes { id name key } }
  }`);
  return data.teams.nodes as { id: string; name: string; key: string }[];
}

export interface WorkflowState {
  id: string;
  name: string;
  type: string; // "triage" | "backlog" | "unstarted" | "started" | "completed" | "cancelled"
  color: string;
}

export async function getTeamStates(token: string, teamId: string): Promise<WorkflowState[]> {
  const data = await gql(
    token,
    `query($teamId: String!) {
      team(id: $teamId) {
        states { nodes { id name type color } }
      }
    }`,
    { teamId }
  );
  return data.team.states.nodes as WorkflowState[];
}

export async function getTeamMembers(token: string, teamId: string) {
  const data = await gql(
    token,
    `query($teamId: String!) {
      team(id: $teamId) {
        members { nodes { id name email avatarUrl } }
      }
    }`,
    { teamId }
  );
  return data.team.members.nodes as { id: string; name: string; email: string; avatarUrl?: string }[];
}

export interface LinearIssue {
  id: string;
  title: string;
  state: { name: string; type: string };
  estimate: number | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  assignee: { id: string; name: string; email: string } | null;
  project: { id: string; name: string } | null;
  cycle: { id: string; name: string; number: number } | null;
}

export async function getCompletedIssues(
  token: string,
  teamId: string,
  after: string,
  before: string
): Promise<LinearIssue[]> {
  const allIssues: LinearIssue[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const data = await gql(
      token,
      `query($after: String, $filter: IssueFilter) {
        issues(
          filter: $filter
          first: 250
          after: $after
          orderBy: updatedAt
        ) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id title
            state { name type }
            estimate
            dueDate
            completedAt
            createdAt
            assignee { id name email }
            project { id name }
            cycle { id name number }
          }
        }
      }`,
      {
        after: cursor,
        filter: {
          team: { id: { eq: teamId } },
          completedAt: { gte: after, lte: before },
        },
      }
    );

    const page = data.issues;
    allIssues.push(...page.nodes);
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return allIssues;
}

export async function getInProgressIssues(
  token: string,
  teamId: string,
  after: string,
  before: string
): Promise<LinearIssue[]> {
  const data = await gql(
    token,
    `query($filter: IssueFilter) {
      issues(filter: $filter, first: 250, orderBy: updatedAt) {
        nodes {
          id title
          state { name type }
          estimate
          completedAt
          createdAt
          assignee { id name }
          project { id name }
          cycle { id name number }
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: teamId } },
        state: { type: { in: ["started", "inProgress"] } },
        createdAt: { gte: after, lte: before },
      },
    }
  );
  return data.issues.nodes;
}
