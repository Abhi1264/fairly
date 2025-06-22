// Import UI components for card layout
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
// Import types and utility functions
import type { Expense } from "../types/expense";
import { calculateSplitAmounts } from "../../../../lib/groupUtils";
import { formatCurrencySimple } from "../../../../lib/currencyUtils";
import { useSelector } from "react-redux";
import { selectDefaultCurrency } from "../../../../lib/appSlice";

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
  const defaultCurrency = useSelector(selectDefaultCurrency);

  // Calculate balances for each member
  const balances = members.map((memberId) => {
    let balance = 0;

    expenses.forEach((expense) => {
      const splits = calculateSplitAmounts(expense);
      const memberShare = splits[memberId] || 0;

      if (expense.paidBy === memberId) {
        // Member paid for this expense
        balance += expense.amount;
      }
      // Member owes their share
      balance -= memberShare;
    });

    return {
      memberId,
      balance,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {members.map((memberId) => {
            const balance =
              balances.find((b) => b.memberId === memberId)?.balance || 0;

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
                  {formatCurrencySimple(Math.abs(balance), defaultCurrency)}
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
