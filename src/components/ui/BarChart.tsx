
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

  // Transform data to prevent label duplication
  const transformedData = data.map(item => {
    // Create a new object with the same properties
    const newItem = { ...item };
    
    // Use a single label property for display
    if (newItem.name) {
      newItem.displayName = newItem.name;
    }
    
    return newItem;
  });

  return (
    <ChartContainer className={className} config={config}>
      <RechartBarChart 
        data={transformedData} 
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
          // Ensure that each label appears only once
          tickFormatter={(value) => {
            // Clean up duplicate text in labels
            if (typeof value === 'string') {
              if (value.includes(' ')) {
                // Return only the first word if there are duplicates
                return value.split(' ')[0];
              }
            }
            return value;
          }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          width={30}
        />
        <Tooltip 
          formatter={(value: number) => [valueFormatter(value), ""]}
          labelFormatter={(label) => {
            // Clean up the label for tooltip display
            if (typeof label === 'string') {
              if (label.includes(' ')) {
                // Get the first meaningful part of the label
                return label.split(' ')[0];
              }
            }
            return `${label}`;
          }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        {categories.map((category, i) => (
          <Bar 
            key={category}
            dataKey={category}
            fill={colors[i] || "#1EAEDB"}
            radius={[4, 4, 0, 0]}
            name={
              // Use a consistent name for each bar without duplicates
              data.find(item => item[category] !== undefined)?.displayName || 
              category
            }
          />
        ))}
      </RechartBarChart>
    </ChartContainer>
  );
}
