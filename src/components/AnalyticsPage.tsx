import { useEffect, useState } from "react";
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
import type { Currency } from "../lib/groupUtils";
import { Skeleton } from "./ui/skeleton";
import {
  selectAnalyticsCache,
  setAnalyticsLoading,
  setAnalyticsData,
  setAnalyticsError,
  isCacheValid,
  selectDefaultCurrency,
} from "../lib/appSlice";
import { secureLog } from "../lib/utils";
import { convertCurrency, formatCurrencySimple } from "../lib/currencyUtils";

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
  currency: Currency;
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
    <div className="space-y-4 max-w-full">
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
            <div className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </div>
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
            <div className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </div>
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
            <div className="text-xs text-muted-foreground">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="groups">Group Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
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
  const defaultCurrency: Currency = useSelector(selectDefaultCurrency);
  const dispatch = useDispatch();
  const { data, loading, error, lastFetched } =
    useSelector(selectAnalyticsCache);
  const [convertedData, setConvertedData] = useState<any>(null);

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

  // Convert all amounts to user's preferred currency
  useEffect(() => {
    async function convertAmounts() {
      if (!data) return;

      try {
        const convertedExpenses = await Promise.all(
          data.map(async (expense: Expense) => {
            const convertedAmount = await convertCurrency(
              expense.amount,
              expense.currency,
              defaultCurrency
            );
            return {
              ...expense,
              amount: convertedAmount,
              currency: defaultCurrency as Currency,
            };
          })
        );

        setConvertedData(convertedExpenses);
      } catch (error) {
        secureLog.error("Error converting currencies", error);
        // Fallback to original data if conversion fails
        setConvertedData(data);
      }
    }

    convertAmounts();
  }, [data, defaultCurrency]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!convertedData) {
    return null;
  }

  // Calculate total expenses across all groups
  const totalExpenses = convertedData.reduce(
    (sum: number, expense: Expense) => sum + expense.amount,
    0
  );

  // Calculate monthly spending trends
  const monthlyTrends = convertedData.reduce(
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
  const groupSpending = convertedData.reduce(
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
  const categoryData = convertedData.reduce((acc: CategoryData[], expense: Expense) => {
    const category = expense.category || "Uncategorized";
    const existingCategory = acc.find((item) => item.name === category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: category, value: expense.amount });
    }
    return acc;
  }, []);

  const currencySymbol = formatCurrencySimple(0, defaultCurrency).replace(/[\d.,]/g, '').trim();

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
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
              {formatCurrencySimple(totalExpenses, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {convertedData.length} transactions
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
              {formatCurrencySimple(
                totalExpenses / Math.max(monthlyTrendsData.length, 1),
                defaultCurrency
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="groups">Group Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${currencySymbol}${value}`} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrencySimple(value, defaultCurrency),
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

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupSpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${currencySymbol}${value}`} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrencySimple(value, defaultCurrency),
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry.name}: ${formatCurrencySimple(entry.value, defaultCurrency)}`
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
                      formatter={(value: number) => formatCurrencySimple(value, defaultCurrency)}
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
