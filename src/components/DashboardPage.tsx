import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowRightLeft, UsersIcon } from "lucide-react";
import { CreateGroupModal } from "./CreateGroupModal";
import { CurrencyConverter } from "./CurrencyConverter";
import { Button } from "./ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getUserGroups,
  getGroupExpenses,
  getGroupBalances,
  type Currency,
} from "../lib/groupUtils";
import { getCurrencySymbol } from "../lib/currencyUtils";
import { Skeleton } from "./ui/skeleton";
import {
  selectDashboardCache,
  setDashboardLoading,
  setDashboardData,
  setDashboardError,
  isCacheValid,
} from "../lib/appSlice";
import { secureLog } from "../lib/utils";

// Interface definitions for core data structures
interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  currency: Currency;
  description?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  paidBy: string;
  date: string;
  groupId: string;
  category?: string;
}

// Data structure for expense trend chart
interface ChartDataPoint {
  date: string;
  amount: number;
}

export function DashboardPage() {
  // Redux hooks for state management
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.app.user);
  const { data, loading, error, lastFetched } =
    useSelector(selectDashboardCache);

  // Secure debug logging - only in development and sanitized
  useEffect(() => {
    secureLog.debug("Dashboard state changed", {
      user: secureLog.sanitizeUser(user),
      hasData: !!data,
      dataSummary: data
        ? {
            groupCount: data.groups?.length || 0,
            expenseCount: data.expenses?.length || 0,
            hasBalances: !!data.balances,
            totals: data.totals
              ? {
                  owed: data.totals.owed,
                  owe: data.totals.owe,
                }
              : null,
          }
        : null,
      loading,
      error,
      lastFetched: lastFetched ? new Date(lastFetched).toISOString() : null,
    });
  }, [user, data, loading, error, lastFetched]);

  // Main data fetching function that populates the dashboard
  const fetchData = async () => {
    if (!user) {
      secureLog.debug("No user, skipping dashboard fetch");
      return;
    }

    // Use cached data if it's still valid
    if (isCacheValid(lastFetched)) {
      secureLog.debug("Using cached dashboard data");
      return;
    }

    secureLog.info("Fetching dashboard data", {
      userId: secureLog.sanitizeUser(user),
    });
    dispatch(setDashboardLoading(true));
    try {
      // Fetch all required data in parallel for better performance
      const [userGroups, allExpenses, allBalances] = await Promise.all([
        getUserGroups(user.uid),
        Promise.all(
          (
            await getUserGroups(user.uid)
          ).map((group) =>
            getGroupExpenses(group.id).then((expenses) =>
              expenses.map((exp) => ({ ...exp, groupId: group.id }))
            )
          )
        ),
        Promise.all(
          (
            await getUserGroups(user.uid)
          ).map((group) => getGroupBalances(group.id))
        ),
      ]);

      const flattenedExpenses = allExpenses.flat();

      // Calculate total amounts owed and owing across all currencies
      let owed = 0;
      let owe = 0;
      allBalances.forEach((groupBalances) => {
        const userBalance = groupBalances[user.uid] || {
          USD: 0,
          INR: 0,
          EUR: 0,
          GBP: 0,
        };
        Object.values(userBalance).forEach((amount) => {
          if (amount > 0) {
            owed += amount;
          } else {
            owe += Math.abs(amount);
          }
        });
      });

      // Update Redux store with fetched data
      dispatch(
        setDashboardData({
          groups: userGroups,
          expenses: flattenedExpenses,
          balances: allBalances.reduce(
            (acc, balance) => ({ ...acc, ...balance }),
            {}
          ),
          totals: { owed, owe },
        })
      );

      secureLog.info("Dashboard data fetched successfully", {
        groupCount: userGroups.length,
        expenseCount: flattenedExpenses.length,
        balanceCount: allBalances.length,
      });
    } catch (error) {
      secureLog.error("Error fetching dashboard data", error);
      dispatch(
        setDashboardError(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data"
        )
      );
    } finally {
      dispatch(setDashboardLoading(false));
    }
  };

  // Fetch data when component mounts or when user/lastFetched changes
  useEffect(() => {
    fetchData();
  }, [user, dispatch, lastFetched]);

  // Transform expense data for the trend chart
  // Memoized to prevent unnecessary recalculations on re-renders
  const chartData = useMemo(
    () =>
      (data?.expenses || [])
        .reduce((acc: ChartDataPoint[], expense: Expense) => {
          // Group expenses by date and sum amounts
          const date = new Date(expense.date).toLocaleDateString();
          const existingData = acc.find((d) => d.date === date);
          if (existingData) {
            existingData.amount += expense.amount;
          } else {
            acc.push({ date, amount: expense.amount });
          }
          return acc;
        }, [])
        .sort(
          (a: ChartDataPoint, b: ChartDataPoint) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    [data?.expenses]
  );

  // Loading state UI with skeleton components
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Overview cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of loading UI */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40" />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI with retry functionality
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h3 className="font-semibold">Error loading dashboard</h3>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              dispatch(setDashboardLoading(true));
              dispatch(setDashboardError(""));
              // Retry fetch
              if (user) {
                fetchData();
              }
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state UI when no groups exist
  if (!data?.groups || data.groups.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center">
          <UsersIcon className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Create a group to start tracking expenses
          </p>
          <CreateGroupModal />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.groups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.expenses?.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {getCurrencySymbol("INR")}
              {data.totals?.owe.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {getCurrencySymbol("INR")}
              {data.totals?.owed.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Expense trends */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-88">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick currency converter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Currency Converter</h2>
            <Link
              to="/currency-converter"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Full Converter
              <ArrowRightLeft className="h-4 w-4" />
            </Link>
          </div>
          <CurrencyConverter compact />
        </div>
      </div>

      {/* Recent groups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Groups</CardTitle>
          <CreateGroupModal />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.groups?.map((group: Group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="block transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.members.length} members • {group.currency}
                      {group.description && (
                        <span className="ml-2">• {group.description}</span>
                      )}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {data?.groups?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 font-medium">No groups yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a group to start tracking expenses
                </p>
                <CreateGroupModal />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
