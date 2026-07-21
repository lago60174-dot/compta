"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProjectionChart({ data }: { data: { label: string; solde: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DDE1D6" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#5B6B78" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: "#5B6B78" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
          width={56}
        />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("fr-FR") + " FCFA"}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#DDE1D6" }}
        />
        <Area
          type="monotone"
          dataKey="solde"
          stroke="#2E5C73"
          fill="#2E5C73"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
