import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Secure logging utility that only logs in development mode
 * Sanitizes sensitive data to prevent exposure in production
 */
export const secureLog = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data);
    }
  },

  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    // Always log errors, but sanitize sensitive data
    const sanitizedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: import.meta.env.DEV ? error.stack : undefined,
          }
        : error;

    console.error(`[ERROR] ${message}`, sanitizedError);
  },

  // Sanitize user data for logging
  sanitizeUser: (user: any) => {
    if (!user) return null;
    return {
      uid: user.uid ? `${user.uid.substring(0, 8)}...` : null,
      hasDisplayName: !!user.displayName,
      hasEmail: !!user.email,
    };
  },

  // Sanitize group data for logging
  sanitizeGroups: (groups: any[]) => {
    if (!groups) return null;
    return groups.map((group) => ({
      id: group.id ? `${group.id.substring(0, 8)}...` : null,
      name: group.name,
      memberCount: group.members?.length || 0,
      currency: group.currency,
    }));
  },

  // Sanitize expense data for logging
  sanitizeExpenses: (expenses: any[]) => {
    if (!expenses) return null;
    return {
      count: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
      currencies: [...new Set(expenses.map((exp) => exp.currency))],
    };
  },
};
