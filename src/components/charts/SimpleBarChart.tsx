
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SimpleBarChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: SimpleBarChartProps) {
  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            height={40}
          />
          <YAxis 
            width={30}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [value, '']}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Bar
            dataKey="value"
            fill="#1EAEDB"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
