
import React from "react";
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => String(value),
  className
}: BarChartProps) {
  // Create a config object for the chart colors
  const config = categories.reduce((acc, category, i) => {
    acc[category] = { color: colors[i] || "#1EAEDB" };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer className={className} config={config}>
      <RechartBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={index} 
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          width={30}
        />
        <Tooltip 
          formatter={(value: number) => [valueFormatter(value), ""]}
          labelFormatter={(label) => `${label}`}
        />
        {categories.map((category, i) => (
          <Bar 
            key={category}
            dataKey={category}
            fill={colors[i] || "#1EAEDB"}
            radius={[4, 4, 0, 0]}
            name={data.find(item => item[category] !== undefined)?.name || category}
          />
        ))}
      </RechartBarChart>
    </ChartContainer>
  );
}
