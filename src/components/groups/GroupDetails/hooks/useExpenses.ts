// Import required dependencies
import { useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../lib/store";
import {
  addExpense,
  updateExpense,
  deleteExpense,
} from "../../../../lib/groupUtils";
import { toast } from "sonner";
import type { Expense } from "../types/expense";

/**
 * Custom hook to manage expense operations (add, edit, delete)
 * @param refreshExpenses - Callback function to refresh the expenses list
 * @returns Object containing expense management functions and state
 */
export function useExpenses(refreshExpenses: () => Promise<void>) {
  // Get group ID from URL params and current user from Redux store
  const { groupId } = useParams();
  const user = useSelector((state: RootState) => state.app.user);

  // State for managing expense dialog and editing
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  /**
   * Handles adding a new expense or updating an existing one
   * @param expenseData - The expense data to add/update (excluding id and createdAt)
   */
  const handleAddExpense = async (
    expenseData: Omit<Expense, "id" | "createdAt">
  ) => {
    if (!user || !groupId) return;

    try {
      if (editingExpense) {
        // Update existing expense
        await updateExpense(groupId, editingExpense.id, expenseData);
        toast.success("Expense updated successfully!");
      } else {
        // Add new expense
        await addExpense({ ...expenseData, groupId });
        toast.success("Expense added successfully!");
      }

      // Refresh expenses list and reset state
      await refreshExpenses();
      setShowAddExpense(false);
      setEditingExpense(null);
    } catch (err) {
      toast.error((err as any).message);
    }
  };

  /**
   * Handles deleting an expense
   * @param expenseId - ID of the expense to delete
   */
  const handleDeleteExpense = async (expenseId: string) => {
    if (!groupId) return;
    try {
      await deleteExpense(groupId, expenseId);
      toast.success("Expense deleted successfully!");
      await refreshExpenses();
    } catch (err) {
      toast.error("Error deleting expense");
    }
  };

  /**
   * Initiates expense editing by setting the expense to edit and showing the dialog
   * @param expense - The expense to edit
   */
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  // Return expense management functions and state
  return {
    showAddExpense,
    setShowAddExpense,
    editingExpense,
    handleAddExpense,
    handleDeleteExpense,
    handleEditExpense,
  };
}
