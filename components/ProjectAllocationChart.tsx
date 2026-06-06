"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { projectUrl } from "@/lib/linearUrls";

interface ProjectPoint {
  id: string | null;
  name: string;
  count: number;
  points: number;
}

interface Props {
  data: ProjectPoint[];
  org: string;          // still needed for projectUrl (uses org slug)
}

const PROJECT_COLORS = [
  "#7C3AED", "#2563EB", "#0891B2", "#059669", "#D97706",
  "#DC2626", "#9333EA", "#0284C7", "#10B981", "#F59E0B",
];

function CustomLegend() {
  return (
    <div className="flex gap-5 justify-center mt-2 text-xs text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg,#7C3AED,#2563EB)" }} />
        Story Points
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" />
        Issues
      </span>
    </div>
  );
}

function openLinear(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function ProjectAllocationChart({ data, org }: Props) {
  const top = data.slice(0, 10);

  const handleClick = (data: unknown) => {
    const entry = data as ProjectPoint;
    // If the issue has a project, go to that project's issues page.
    // For "No Project" issues there's no good filter URL; fall through to the project url which will 404 gracefully.
    const url = entry.id ? projectUrl(org, entry.id) : `https://linear.app/${org}`;
    openLinear(url);
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, top.length * 52)}>
      <BarChart data={top} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#CBD5E1", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" }}
          labelStyle={{ color: "#E2E8F0", fontWeight: 600 }}
          itemStyle={{ color: "#CBD5E1" }}
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
        />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="points" name="Story Points" radius={[0, 4, 4, 0]} cursor="pointer" onClick={handleClick}>
          {top.map((_, i) => (
            <Cell key={i} fill={PROJECT_COLORS[i % PROJECT_COLORS.length]} />
          ))}
        </Bar>
        <Bar dataKey="count" name="Issues" fill="#94A3B8" radius={[0, 4, 4, 0]} cursor="pointer" onClick={handleClick} />
      </BarChart>
    </ResponsiveContainer>
  );
}
