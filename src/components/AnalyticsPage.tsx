import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../lib/store";
import { getUserGroups, getGroupExpenses } from "../lib/groupUtils";
import { Skeleton } from "./ui/skeleton";
import {
  selectAnalyticsCache,
  setAnalyticsLoading,
  setAnalyticsData,
  setAnalyticsError,
  isCacheValid,
} from "../lib/appSlice";
import { secureLog } from "../lib/utils";

// Chart colors using CSS variables for theme support
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

// Types for analytics data
interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category?: string;
  groupId: string;
}

interface ChartDataPoint {
  month: string;
  amount: number;
}

interface GroupSpending {
  name: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Your Overall Analytics</h2>

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
              <Skeleton className="h-8 w-24" />
            </div>
            <p className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Skeleton className="h-8 w-24" />
            </div>
            <p className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Skeleton className="h-8 w-24" />
            </div>
            <p className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="groups">Group Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AnalyticsPage() {
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch();
  const { data, loading, error, lastFetched } =
    useSelector(selectAnalyticsCache);

  useEffect(() => {
    async function fetchAnalyticsData() {
      if (!user?.uid) return;
      if (isCacheValid(lastFetched)) return;

      dispatch(setAnalyticsLoading(true));
      try {
        // Get all groups the user is part of
        const groups = await getUserGroups(user.uid);

        // Fetch expenses from all groups
        const expensePromises = groups.map((group) =>
          getGroupExpenses(group.id)
        );

        const groupExpenses = await Promise.all(expensePromises);
        const allExpensesData = groupExpenses.flat();

        dispatch(setAnalyticsData(allExpensesData));
      } catch (error) {
        secureLog.error("Error fetching expenses", error);
        dispatch(
          setAnalyticsError(
            error instanceof Error
              ? error.message
              : "Failed to fetch analytics data"
          )
        );
      }
    }

    fetchAnalyticsData();
  }, [user?.uid, dispatch, lastFetched]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!data) {
    return null;
  }

  // Calculate total expenses across all groups
  const totalExpenses = data.reduce(
    (sum: number, expense: Expense) => sum + expense.amount,
    0
  );

  // Calculate monthly spending trends
  const monthlyTrends = data.reduce(
    (acc: Record<string, ChartDataPoint>, expense: Expense) => {
      const date = new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!acc[date]) {
        acc[date] = { month: date, amount: 0 };
      }
      acc[date].amount += expense.amount;
      return acc;
    },
    {}
  );

  const monthlyTrendsData: ChartDataPoint[] = Object.values(monthlyTrends);
  monthlyTrendsData.sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Calculate spending by group
  const groupSpending = data.reduce(
    (acc: GroupSpending[], expense: Expense) => {
      const groupId = expense.groupId;
      const existingGroup = acc.find((g) => g.name === groupId);

      if (existingGroup) {
        existingGroup.amount += expense.amount;
      } else {
        acc.push({ name: groupId, amount: expense.amount });
      }
      return acc;
    },
    []
  );

  // Calculate category breakdown across all groups
  const categoryData = data.reduce((acc: CategoryData[], expense: Expense) => {
    const category = expense.category || "Uncategorized";
    const existingCategory = acc.find((item) => item.name === category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: category, value: expense.amount });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Your Overall Analytics</h2>

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
              Across {data.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(totalExpenses / Math.max(monthlyTrendsData.length, 1)).toFixed(
                2
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupSpending.length}</div>
            <p className="text-xs text-muted-foreground">
              With recent transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="groups">Group Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Amount",
                      ]}
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

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupSpending}>
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
                      {groupSpending.map((_: unknown, index: number) => (
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

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
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
                      {categoryData.map((_: unknown, index: number) => (
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
      </Tabs>
    </div>
  );
}
