// Import statements for React and UI components
import { useState, useEffect, useRef } from "react";
import { TrashIcon } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { DatePicker } from "../../../ui/date-picker";

// Import types and utilities
import type { Expense, NewExpense } from "../types/expense";
import type { Currency, SplitMethod } from "../../../../lib/groupUtils";
import { getCurrencySymbol } from "../../../../lib/currencyUtils";
import { useSelector, useDispatch } from "react-redux";
import { getUserById } from "../../../../lib/groupUtils";
import {
  setUsersLoading,
  setUsersData,
  setUsersError,
  selectUsersCache,
  isCacheValid,
} from "../../../../lib/appSlice";
import { extractTextFromImage } from "@/lib/ocrUtils";

// Type definitions
interface User {
  uid: string;
  phoneNumber: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AddEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  groupMembers: string[];
  onSave: (expenseData: Omit<Expense, "id" | "createdAt">) => Promise<void>;
}

// Initial state for new expense
const initialExpense: NewExpense = {
  description: "",
  amount: "",
  currency: "INR",
  splitMethod: "equal",
  category: "",
  date: new Date().toISOString(),
  tax: "",
  discount: "",
  items: [],
  splitConfig: {
    method: "equal",
    shares: {},
    percentages: {},
    manual: {},
  },
};

export function AddEditExpenseDialog({
  open,
  onOpenChange,
  expense,
  groupMembers,
  onSave,
}: AddEditExpenseDialogProps) {
  // State management
  const [newExpense, setNewExpense] = useState<NewExpense>(initialExpense);
  const dispatch = useDispatch();
  const { data: usersCache, lastFetched: usersLastFetched } =
    useSelector(selectUsersCache);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Effect to fetch user information for group members
  useEffect(() => {
    const fetchUserInfo = async () => {
      // Skip if cache is still valid
      if (isCacheValid(usersLastFetched)) {
        return;
      }

      dispatch(setUsersLoading(true));
      try {
        // Filter members that need to be fetched
        const membersToFetch = groupMembers.filter(
          (memberId) => !usersCache?.[memberId]
        );

        if (membersToFetch.length === 0) {
          return;
        }

        // Fetch user data for each member
        const userPromises = membersToFetch.map(async (memberId) => {
          const userData = await getUserById(memberId);
          if (!userData) return null;

          // Transform user data for Redux store
          const user: User = {
            uid: userData.id,
            phoneNumber: userData.phoneNumber || null,
            displayName: userData.displayName || null,
            photoURL: userData.photoURL || null,
          };
          return { [memberId]: user };
        });

        // Process fetched user data
        const userResults = await Promise.all(userPromises);
        const newUsers = userResults.reduce<Record<string, User>>(
          (acc, user) => {
            if (user) {
              return { ...acc, ...user };
            }
            return acc;
          },
          {}
        );

        // Update Redux store if new users were fetched
        if (Object.keys(newUsers).length > 0) {
          dispatch(setUsersData(newUsers));
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        dispatch(
          setUsersError(
            error instanceof Error ? error.message : "Failed to fetch user info"
          )
        );
      } finally {
        dispatch(setUsersLoading(false));
      }
    };

    fetchUserInfo();
  }, [groupMembers, usersCache, usersLastFetched, dispatch]);

  // Helper function to get member display name
  const getMemberDisplayName = (memberId: string) => {
    const user = usersCache?.[memberId];
    if (user) {
      return user.displayName || user.phoneNumber || memberId;
    }
    return memberId;
  };

  // Effect to initialize or update expense data
  useEffect(() => {
    if (expense) {
      // Transform existing expense data for editing
      setNewExpense({
        description: expense.description,
        amount: expense.amount.toString(),
        currency: expense.currency,
        splitMethod: expense.splitConfig.method,
        category: expense.category || "",
        date: expense.date,
        tax: expense.tax?.toString() || "",
        discount: expense.discount?.toString() || "",
        items:
          expense.items?.map((item) => ({
            description: item.description,
            amount: item.amount.toString(),
            splitBetween: item.splitBetween,
          })) || [],
        splitConfig: {
          method: expense.splitConfig.method,
          shares: expense.splitConfig.shares || {},
          percentages: expense.splitConfig.percentages || {},
          manual: expense.splitConfig.manual || {},
        },
      });
    } else {
      // Reset to initial state for new expense
      setNewExpense(initialExpense);
    }
  }, [expense]);

  // Handle expense save/update
  const handleSave = async () => {
    try {
      // Validate expense data
      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!newExpense.description.trim()) {
        throw new Error("Please enter a description");
      }

      // Prepare expense data for saving
      const expenseData = {
        description: newExpense.description,
        amount,
        currency: newExpense.currency,
        paidBy: "", // Will be set by backend
        splitConfig: newExpense.splitConfig,
        category: newExpense.category,
        date: newExpense.date,
        tax: newExpense.tax.trim()
          ? isNaN(parseFloat(newExpense.tax))
            ? undefined
            : parseFloat(newExpense.tax)
          : undefined,
        discount: newExpense.discount.trim()
          ? isNaN(parseFloat(newExpense.discount))
            ? undefined
            : parseFloat(newExpense.discount)
          : undefined,
        items: newExpense.items.map((item) => ({
          description: item.description,
          amount: parseFloat(item.amount),
          splitBetween: item.splitBetween,
        })),
      };

      await onSave(expenseData);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Update split configuration when method changes
  const updateSplitConfig = (method: SplitMethod) => {
    setNewExpense((prev) => ({
      ...prev,
      splitMethod: method,
      splitConfig: {
        method,
        shares: {},
        percentages: {},
        manual: {},
      },
    }));
  };

  // Update individual member's split amount
  const updateMemberSplit = (memberId: string, value: string) => {
    setNewExpense((prev) => {
      const newConfig = { ...prev.splitConfig };
      const numValue = parseFloat(value);

      // Update split configuration based on selected method
      switch (prev.splitMethod) {
        case "equal":
          newConfig.shares = { ...newConfig.shares, [memberId]: 1 };
          break;
        case "percentage":
          newConfig.percentages = {
            ...newConfig.percentages,
            [memberId]: numValue,
          };
          break;
        case "shares":
          newConfig.shares = { ...newConfig.shares, [memberId]: numValue };
          break;
        case "manual":
          newConfig.manual = { ...newConfig.manual, [memberId]: numValue };
          break;
      }

      return {
        ...prev,
        splitConfig: newConfig,
      };
    });
  };

  // Item management functions
  const addItem = () => {
    setNewExpense((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "", splitBetween: [] }],
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setNewExpense((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setNewExpense((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleScanReceipt = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await extractTextFromImage(file);
      // Simple parsing logic
      const amountMatch = text.match(/\$?([0-9]+(?:\.[0-9]{2})?)/);
      const dateMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/);
      const merchantMatch = text.split("\n")[0];
      if (amountMatch) setAmount(amountMatch[1]);
      if (dateMatch) setDate(new Date(dateMatch[1]));
      if (merchantMatch) setMerchant(merchantMatch);
    } catch (err) {
      alert("Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render dialog component
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] rounded-lg w-[95vw] sm:w-full flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="What's this expense for?"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newExpense.category}
                onValueChange={(value) =>
                  setNewExpense((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(newExpense.currency)}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="pl-8"
                  />
                </div>
                <Select
                  value={newExpense.currency}
                  onValueChange={(value: Currency) =>
                    setNewExpense((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <DatePicker
                date={new Date(newExpense.date)}
                onSelect={(date) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    date: date.toISOString(),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tax & Discount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Tax"
                  value={newExpense.tax}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      tax: e.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Discount"
                  value={newExpense.discount}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Split Method</label>
            <Select
              value={newExpense.splitMethod}
              onValueChange={(value: SplitMethod) => updateSplitConfig(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal Split</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
                <SelectItem value="manual">Manual Amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Split Between</label>
            <div className="grid gap-2">
              {groupMembers.map((memberId) => (
                <div key={memberId} className="flex items-center gap-2">
                  <span className="flex-1">
                    {getMemberDisplayName(memberId)}
                  </span>
                  <Input
                    type="number"
                    placeholder={
                      newExpense.splitMethod === "percentage"
                        ? "0-100"
                        : newExpense.splitMethod === "shares"
                        ? "Shares"
                        : newExpense.splitMethod === "manual"
                        ? "Amount"
                        : "1"
                    }
                    value={
                      newExpense.splitMethod === "percentage"
                        ? newExpense.splitConfig.percentages?.[memberId] || ""
                        : newExpense.splitMethod === "shares"
                        ? newExpense.splitConfig.shares?.[memberId] || ""
                        : newExpense.splitMethod === "manual"
                        ? newExpense.splitConfig.manual?.[memberId] || ""
                        : "1"
                    }
                    onChange={(e) =>
                      updateMemberSplit(memberId, e.target.value)
                    }
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Items (Optional)</label>
              <Button variant="outline" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>
            {newExpense.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
              >
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="flex-1 min-w-96"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateItem(index, "amount", e.target.value)}
                  className="w-24"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleScanReceipt} variant="outline">Scan Receipt</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button onClick={handleSave}>
              {expense ? "Update Expense" : "Add Expense"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
