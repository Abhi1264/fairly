// Import UI components for card layout
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";

// Import chart components from recharts library
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Import expense type definition
import type { Expense } from "../types/expense";

// Props interface for the AnalyticsTab component
interface AnalyticsTabProps {
  expenses: Expense[];
}

// Chart colors using CSS variables for theme support
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

export function AnalyticsTab({ expenses }: AnalyticsTabProps) {
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate average expense
  const avgExpense = totalExpenses / expenses.length || 0;

  // Calculate category breakdown
  const categoryData = expenses.reduce(
    (acc: { name: string; value: number }[], expense) => {
      const category = expense.category || "Uncategorized";
      const existingCategory = acc.find((item) => item.name === category);
      if (existingCategory) {
        existingCategory.value += expense.amount;
      } else {
        acc.push({ name: category, value: expense.amount });
      }
      return acc;
    },
    []
  );

  // Calculate top spenders
  const spenderData = expenses
    .reduce((acc: { name: string; amount: number }[], expense) => {
      const existingSpender = acc.find((item) => item.name === expense.paidBy);
      if (existingSpender) {
        existingSpender.amount += expense.amount;
      } else {
        acc.push({ name: expense.paidBy, amount: expense.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Transform expense data for the trend chart
  const trendData = expenses
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
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {expenses.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique expense categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Expense Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="spenders">Top Spenders</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
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
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value}`, "Amount"]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--primary)" }}
                      activeDot={{ r: 6, fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) =>
                        `${entry.name}: $${entry.value.toFixed(2)}`
                      }
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spenders">
          <Card>
            <CardHeader>
              <CardTitle>Top Spenders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spenderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Amount",
                      ]}
                    />
                    <Bar dataKey="amount">
                      {spenderData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
