// Import required dependencies
import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../lib/store";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { PlusIcon, ArrowLeftIcon, FilterIcon } from "lucide-react";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseCard } from "./components/ExpenseCard";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { BalancesTab } from "./components/BalancesTab";
import { AddEditExpenseDialog } from "./components/AddEditExpenseDialog";
import { useGroup } from "./hooks/useGroup";
import { useExpenses } from "./hooks/useExpenses";

/**
 * GroupDetails component displays the details of a group including expenses, analytics, and balances
 * Provides functionality to add, edit, and delete expenses
 */
export function GroupDetails() {
  // Navigation and user state
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.app.user);
  const [showFilters, setShowFilters] = useState(false);

  // Group data and expense management hooks
  const {
    group,
    expenses,
    loading,
    error,
    filters,
    setFilters,
    refreshExpenses,
  } = useGroup();

  // Expense operations hook
  const {
    showAddExpense,
    setShowAddExpense,
    editingExpense,
    handleAddExpense,
    handleDeleteExpense,
    handleEditExpense,
  } = useExpenses(refreshExpenses);

  // Show loading state while data is being fetched
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show error state if group not found or error occurred
  if (error || !group) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-600">{error || "Group not found"}</div>
        <Button onClick={() => navigate("/groups")} className="mt-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Header section with back button and group name */}
      <div className="flex flex-col gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="w-fit"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-fit"
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Expense filters section */}
      {showFilters && (
        <ExpenseFilters filters={filters} onFilterChange={setFilters} />
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger
            value="expenses"
            className="w-full sm:w-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="w-full sm:w-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="w-full sm:w-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Balances
          </TabsTrigger>
        </TabsList>

        {/* Expenses tab content */}
        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No expenses found
            </p>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                currentUserId={user?.uid || ""}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            ))
          )}
        </TabsContent>

        {/* Analytics tab content */}
        <TabsContent value="analytics">
          <AnalyticsTab expenses={expenses} />
        </TabsContent>

        {/* Balances tab content */}
        <TabsContent value="balances">
          <BalancesTab
            expenses={expenses}
            members={group.members}
            currentUserId={user?.uid || ""}
          />
        </TabsContent>
      </Tabs>

      {/* Floating action button to add new expense */}
      <Button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-6 right-6 rounded-lg h-14 w-14 shadow-lg"
      >
        <PlusIcon className="h-10 w-10" />
      </Button>

      {/* Dialog for adding/editing expenses */}
      <AddEditExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        expense={editingExpense}
        groupMembers={group.members}
        onSave={handleAddExpense}
      />
    </div>
  );
}
