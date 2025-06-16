import type { SplitMethod, Currency } from "../../../../lib/groupUtils";

/**
 * Represents a complete expense record in the system
 * Contains all details about an expense including split configuration and optional metadata
 */
export interface Expense {
  /** Unique identifier for the expense */
  id: string;
  /** Description of what the expense was for */
  description: string;
  /** Total amount of the expense */
  amount: number;
  /** Currency code for the expense amount */
  currency: Currency;
  /** ID of the user who paid for the expense */
  paidBy: string;
  /** Configuration for how the expense is split between members */
  splitConfig: {
    /** Method used to split the expense (equal, percentage, etc.) */
    method: SplitMethod;
    /** Optional: Number of shares per member for share-based splitting */
    shares?: Record<string, number>;
    /** Optional: Percentage allocation per member for percentage-based splitting */
    percentages?: Record<string, number>;
    /** Optional: Manual amount allocation per member */
    manual?: Record<string, number>;
  };
  /** Optional: Category for expense classification */
  category?: string;
  /** Date when the expense occurred */
  date: string;
  /** Timestamp when the expense was created in the system */
  createdAt: string;
  /** Optional: Array of attachment URLs */
  attachments?: string[];
  /** Optional: Tax amount included in the total */
  tax?: number;
  /** Optional: Discount amount applied to the total */
  discount?: number;
  /** Optional: Detailed breakdown of items in the expense */
  items?: Array<{
    description: string;
    amount: number;
    splitBetween: string[];
  }>;
}

/**
 * Represents the data structure for creating a new expense
 * Uses string types for numeric fields to handle form input
 */
export interface NewExpense {
  description: string;
  /** Amount as string to handle form input */
  amount: string;
  currency: Currency;
  splitMethod: SplitMethod;
  category: string;
  date: string;
  /** Tax amount as string to handle form input */
  tax: string;
  /** Discount amount as string to handle form input */
  discount: string;
  /** Detailed items with string amounts for form handling */
  items: Array<{
    description: string;
    amount: string;
    splitBetween: string[];
  }>;
  splitConfig: {
    method: SplitMethod;
    shares: Record<string, number>;
    percentages: Record<string, number>;
    manual: Record<string, number>;
  };
}

/**
 * Filter criteria for querying expenses
 * All fields are optional and can be used to filter the expense list
 */
export interface ExpenseFilters {
  /** Filter by expense category */
  category: string;
  /** Start date for date range filter */
  startDate: string;
  /** End date for date range filter */
  endDate: string;
  /** Minimum amount filter as string */
  minAmount: string;
  /** Maximum amount filter as string */
  maxAmount: string;
  /** Filter by currency type */
  currency: Currency | "";
}
