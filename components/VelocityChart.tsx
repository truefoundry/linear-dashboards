"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { weeklyCompletedUrl } from "@/lib/linearUrls";

interface DataPoint {
  week: string;
  weekStartISO: string;
  weekEndISO: string;
  count: number;
  points: number;
}

interface Props {
  data: DataPoint[];
  teamUrl: string;
  completedStateIds: string[];
}

function openLinear(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function ClickableDot(props: {
  cx?: number; cy?: number; payload?: DataPoint;
  teamUrl: string; completedStateIds: string[];
}) {
  const { cx = 0, cy = 0, payload, teamUrl, completedStateIds } = props;
  if (!payload) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill="#34D399" strokeWidth={0} style={{ cursor: "pointer" }}
      onClick={() => openLinear(weeklyCompletedUrl(teamUrl, payload.weekStartISO, payload.weekEndISO, completedStateIds))}
    />
  );
}

export default function VelocityChart({ data, teamUrl, completedStateIds }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" }}
          labelStyle={{ color: "#E2E8F0", fontWeight: 600 }}
          itemStyle={{ color: "#CBD5E1" }}
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
        />
        <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="count" name="Issues" fill="#7C3AED" radius={[4, 4, 0, 0]} cursor="pointer"
          onClick={(data: unknown) => {
            const d = data as DataPoint;
            openLinear(weeklyCompletedUrl(teamUrl, d.weekStartISO, d.weekEndISO, completedStateIds));
          }}
        />
        <Line
          yAxisId="right" type="monotone" dataKey="points" name="Story Points"
          stroke="#34D399" strokeWidth={2}
          dot={(props: object) => <ClickableDot {...(props as Parameters<typeof ClickableDot>[0])} teamUrl={teamUrl} completedStateIds={completedStateIds} />}
          activeDot={{ r: 7 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
