
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
  const config = categories.reduce((acc, category, i) => {
    acc[category] = { color: colors[i] || "#1EAEDB" };
    return acc;
  }, {} as Record<string, { color: string }>);
  
  const hasData = data.some(item => 
    categories.some(category => item[category] !== undefined && item[category] > 0)
  );

  return (
    <div className="relative">
      <ChartContainer className={className} config={config}>
        <RechartBarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={index}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            width={30}
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip 
            formatter={(value: number) => [valueFormatter(value), ""]}
            labelFormatter={(label) => String(label)}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          {categories.map((category, i) => (
            <Bar 
              key={category}
              dataKey={category}
              fill={colors[i] || "#1EAEDB"}
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            />
          ))}
        </RechartBarChart>
      </ChartContainer>
      
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 text-muted-foreground text-sm">
          Sem dados para exibir
        </div>
      )}
    </div>
  );
}
