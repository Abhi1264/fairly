// Import UI components for card layout
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

// Import chart components from recharts library
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Import expense type definition
import type { Expense } from "../types/expense";

// Props interface for the AnalyticsTab component
interface AnalyticsTabProps {
  expenses: Expense[];
}

export function AnalyticsTab({ expenses }: AnalyticsTabProps) {
  // Transform expense data for the chart:
  // 1. Group expenses by date
  // 2. Sum amounts for each date
  // 3. Sort chronologically
  const chartData = expenses
    .reduce((acc: any[], expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      const existingData = acc.find((d) => d.date === date);
      if (existingData) {
        existingData.amount += expense.amount;
      } else {
        acc.push({ date, amount: expense.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container with fixed height */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              {/* Grid lines for better readability */}
              <CartesianGrid strokeDasharray="3 3" />

              {/* X-axis: Date formatting */}
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              {/* Y-axis: Amount formatting with dollar sign */}
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />

              {/* Tooltip: Shows detailed information on hover */}
              <Tooltip
                formatter={(value: number) => [`$${value}`, "Amount"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />

              {/* Line: Main chart line with styling */}
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
