"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface MonthlyPoint {
  mois: string;
  recettes: number;
  depenses: number;
}

export function MonthlyBarChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DDE1D6" vertical={false} />
        <XAxis
          dataKey="mois"
          tick={{ fontSize: 11, fill: "#5B6B78" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#5B6B78" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v.toLocaleString("fr-FR")}
          width={56}
        />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("fr-FR") + " FCFA"}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#DDE1D6" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="recettes" name="Recettes" fill="#1F6F54" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="depenses" name="Dépenses" fill="#A8442F" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
