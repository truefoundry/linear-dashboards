"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeekBucket {
  week: string;
  count: number;
}

interface Props {
  data: WeekBucket[];
  orgUrlKey: string;
}

const BAR_COLOR = "#818cf8"; // indigo-400

export default function ProjectsClosedChart({ data, orgUrlKey }: Props) {
  const projectsUrl = `https://linear.app/${orgUrlKey}/projects/all`;

  const handleClick = () => {
    window.open(projectsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#cbd5e1", fontSize: 12 }}
          itemStyle={{ color: "#e2e8f0", fontSize: 12 }}
          formatter={(v) => [v, "Projects closed"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer" onClick={handleClick}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
