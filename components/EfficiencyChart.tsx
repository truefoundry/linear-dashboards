"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  week: string;
  withDueDate: number;
  onTime: number;
  late: number;
  onTimeRate: number | null;
}

interface Props {
  data: DataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: DataPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DataPoint;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm space-y-1 shadow-xl">
      <p className="font-semibold text-slate-100">{label}</p>
      <p className="text-slate-400">With due date: <span className="text-slate-200">{d.withDueDate}</span></p>
      <p className="text-emerald-400">On time: <span className="text-slate-200">{d.onTime}</span></p>
      <p className="text-rose-400">Late: <span className="text-slate-200">{d.late}</span></p>
      <p className="text-amber-400">
        On-time rate:{" "}
        <span className="text-slate-200">
          {d.onTimeRate != null ? `${d.onTimeRate}%` : "—"}
        </span>
      </p>
      {d.withDueDate === 0 && (
        <p className="text-slate-500 italic text-xs">No issues had a due date</p>
      )}
    </div>
  );
}

export default function EfficiencyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#475569" }} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
        <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="onTime" name="On Time" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
        <Bar yAxisId="left" dataKey="late" name="Late" stackId="a" fill="#E11D48" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="onTimeRate"
          name="On-Time Rate %"
          stroke="#FBBF24"
          strokeWidth={2}
          dot={{ r: 4, fill: "#FBBF24", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
