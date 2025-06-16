// Import required dependencies
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../lib/store";
import { getGroupById, getGroupExpenses } from "../../../../lib/groupUtils";
import { toast } from "sonner";
import type {
  Expense,
  ExpenseFilters as ExpenseFiltersType,
} from "../types/expense";
import debounce from "lodash/debounce";

// Define the Group interface to type the group data
interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom hook to manage group data and expenses
 * Handles loading group details, managing expenses, and applying filters
 * @returns Object containing group data, expenses, loading state, and management functions
 */
export function useGroup() {
  // Get group ID from URL params and current user from Redux store
  const { groupId } = useParams();
  const user = useSelector((state: RootState) => state.app.user);

  // State management for group data, expenses, and UI states
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize expense filters with default empty values
  const [filters, setFilters] = useState<ExpenseFiltersType>({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    currency: "",
  });

  // Load initial group data when component mounts or groupId/user changes
  useEffect(() => {
    async function loadGroup() {
      if (!groupId || !user) return;
      setLoading(true);
      try {
        const groupData = await getGroupById(groupId);
        if (!groupData) {
          throw new Error("Group not found");
        }
        setGroup(groupData as Group);
      } catch (err) {
        setError((err as any).message);
        toast.error("Error loading group");
      } finally {
        setLoading(false);
      }
    }
    loadGroup();
  }, [groupId, user]);

  /**
   * Debounced function to load expenses with current filters
   * Prevents excessive API calls when filters change rapidly
   */
  const loadExpenses = useCallback(
    debounce(async (currentFilters: ExpenseFiltersType) => {
      if (!groupId) return;
      try {
        // Transform filter values and fetch expenses
        const expensesData = await getGroupExpenses(groupId, {
          ...currentFilters,
          minAmount: currentFilters.minAmount
            ? parseFloat(currentFilters.minAmount)
            : undefined,
          maxAmount: currentFilters.maxAmount
            ? parseFloat(currentFilters.maxAmount)
            : undefined,
          currency: currentFilters.currency || undefined,
        });
        setExpenses(expensesData);
      } catch (err) {
        console.error("Error loading expenses:", err);
        toast.error("Error applying filters");
      }
    }, 300),
    [groupId]
  );

  // Load expenses when filters change and cleanup on unmount
  useEffect(() => {
    loadExpenses(filters);
    return () => {
      loadExpenses.cancel();
    };
  }, [filters, loadExpenses]);

  /**
   * Manually refresh expenses with current filters
   * Used after expense modifications (add/edit/delete)
   */
  const refreshExpenses = async () => {
    if (!groupId) return;
    try {
      const expensesData = await getGroupExpenses(groupId, {
        ...filters,
        minAmount: filters.minAmount
          ? parseFloat(filters.minAmount)
          : undefined,
        maxAmount: filters.maxAmount
          ? parseFloat(filters.maxAmount)
          : undefined,
        currency: filters.currency || undefined,
      });
      setExpenses(expensesData);
    } catch (err) {
      toast.error("Error refreshing expenses");
    }
  };

  // Return group data and management functions
  return {
    group,
    expenses,
    loading,
    error,
    filters,
    setFilters,
    refreshExpenses,
  };
}
