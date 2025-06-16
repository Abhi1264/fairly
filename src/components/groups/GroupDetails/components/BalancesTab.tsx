// Import UI components for card layout
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
// Import types and utility functions
import type { Expense } from "../types/expense";
import { calculateSplitAmounts } from "../../../../lib/groupUtils";
import { getCurrencySymbol } from "../../../../lib/currencyUtils";

// Props interface for the BalancesTab component
interface BalancesTabProps {
  expenses: Expense[]; // List of all expenses in the group
  members: string[]; // List of member IDs in the group
  currentUserId: string; // ID of the currently logged-in user
}

export function BalancesTab({
  expenses,
  members,
  currentUserId,
}: BalancesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((memberId) => {
            // Get expenses paid by this member
            const memberExpenses = expenses.filter(
              (exp) => exp.paidBy === memberId
            );
            // Get expenses where this member has a share
            const memberShares = expenses.filter(
              (exp) =>
                exp.splitConfig.shares?.[memberId] ||
                exp.splitConfig.percentages?.[memberId] ||
                exp.splitConfig.manual?.[memberId]
            );

            // Calculate total amount paid by member
            const paid = memberExpenses.reduce(
              (sum, exp) => sum + exp.amount,
              0
            );
            // Calculate total amount owed by member
            const owes = memberShares.reduce((sum, exp) => {
              const splits = calculateSplitAmounts(exp);
              return sum + (splits[memberId] || 0);
            }, 0);

            // Calculate final balance (positive = to receive, negative = to pay)
            const balance = paid - owes;

            return (
              <div
                key={memberId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg bg-muted/50"
              >
                {/* Display member name (or "You" for current user) */}
                <span className="font-medium">
                  {memberId === currentUserId ? "You" : memberId}
                </span>
                {/* Display balance with appropriate color and label */}
                <span
                  className={`font-semibold ${
                    balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {getCurrencySymbol("INR")}
                  {Math.abs(balance).toFixed(2)}
                  <span className="text-muted-foreground ml-1">
                    {balance >= 0 ? "to receive" : "to pay"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
