// Import UI icons and components
import { UsersIcon, EditIcon, TrashIcon } from "lucide-react";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
// Import types and utilities
import type { Expense } from "../types/expense";
import { getCurrencySymbol } from "../../../../lib/currencyUtils";

// Props interface for the ExpenseCard component
interface ExpenseCardProps {
  expense: Expense; // The expense data to display
  currentUserId: string; // ID of the currently logged-in user
  onEdit: (expense: Expense) => void; // Callback for editing the expense
  onDelete: (expenseId: string) => void; // Callback for deleting the expense
}

export function ExpenseCard({
  expense,
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <Card>
      {/* Card header with title, date, category and action buttons */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              {expense.description}
            </CardTitle>
            <CardDescription>
              {new Date(expense.date).toLocaleDateString()} • {expense.category}
            </CardDescription>
          </div>
          {/* Edit and delete action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(expense)}
              className="h-8 w-8"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(expense.id)}
              className="h-8 w-8"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main expense details: amount, payer and split method */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {getCurrencySymbol(expense.currency)}
              {expense.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Paid by{" "}
              {expense.paidBy === currentUserId ? "you" : expense.paidBy}
            </p>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <UsersIcon className="mr-1 h-4 w-4" />
            Split {expense.splitConfig.method}
          </div>
        </div>
        {/* Optional items list section */}
        {expense.items && expense.items.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Items</h4>
            <div className="space-y-1">
              {expense.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1"
                >
                  <span className="truncate">{item.description}</span>
                  <span className="whitespace-nowrap">
                    {getCurrencySymbol(expense.currency)}
                    {item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
