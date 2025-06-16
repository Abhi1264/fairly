import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

/**
 * User interface representing a user in the application
 */
interface User {
  uid: string;
  phoneNumber: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * AppState interface defining the shape of the application state
 * Includes user data, authentication state, and various cache objects
 */
interface AppState {
  count: number;
  user: User | null;
  authLoading: boolean;
  cache: {
    // Cache for groups data
    groups: {
      data: any[] | null;
      loading: boolean;
      error: string | null;
      lastFetched: number | null;
    };
    // Cache for expenses data, organized by group ID
    expenses: {
      data: Record<string, any[]> | null;
      loading: boolean;
      error: string | null;
      lastFetched: number | null;
    };
    // Cache for detailed group information
    groupDetails: {
      data: Record<string, any> | null;
      loading: boolean;
      error: string | null;
      lastFetched: number | null;
    };
    // Cache for dashboard data including groups, expenses, balances and totals
    dashboard: {
      data: {
        groups: any[] | null;
        expenses: any[] | null;
        balances: Record<string, any> | null;
        totals: {
          owed: number;
          owe: number;
        } | null;
      };
      loading: boolean;
      error: string | null;
      lastFetched: number | null;
    };
    // Cache for user data
    users: {
      data: Record<string, User> | null;
      loading: boolean;
      error: string | null;
      lastFetched: number | null;
    };
  };
}

/**
 * Initial state for the application
 * Sets up empty/null values for all state properties
 */
const initialState: AppState = {
  count: 0,
  user: null,
  authLoading: true,
  cache: {
    groups: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    expenses: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    groupDetails: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    dashboard: {
      data: {
        groups: null,
        expenses: null,
        balances: null,
        totals: null,
      },
      loading: false,
      error: null,
      lastFetched: null,
    },
    users: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
  },
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Redux slice for managing application state
 * Includes reducers for user management, authentication, and data caching
 */
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Basic counter reducers
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },

    // User management reducers
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },

    // Groups cache reducers
    setGroupsLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.groups.loading = action.payload;
    },
    setGroupsData: (state, action: PayloadAction<any[]>) => {
      state.cache.groups.data = action.payload;
      state.cache.groups.lastFetched = Date.now();
      state.cache.groups.error = null;
    },
    setGroupsError: (state, action: PayloadAction<string>) => {
      state.cache.groups.error = action.payload;
      state.cache.groups.loading = false;
    },

    // Expenses cache reducers
    setExpensesLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.expenses.loading = action.payload;
    },
    setExpensesData: (
      state,
      action: PayloadAction<{ groupId: string; data: any[] }>
    ) => {
      if (!state.cache.expenses.data) {
        state.cache.expenses.data = {};
      }
      state.cache.expenses.data[action.payload.groupId] = action.payload.data;
      state.cache.expenses.lastFetched = Date.now();
      state.cache.expenses.error = null;
    },
    setExpensesError: (state, action: PayloadAction<string>) => {
      state.cache.expenses.error = action.payload;
      state.cache.expenses.loading = false;
    },

    // Group details cache reducers
    setGroupDetailsLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.groupDetails.loading = action.payload;
    },
    setGroupDetailsData: (
      state,
      action: PayloadAction<{ groupId: string; data: any }>
    ) => {
      if (!state.cache.groupDetails.data) {
        state.cache.groupDetails.data = {};
      }
      state.cache.groupDetails.data[action.payload.groupId] =
        action.payload.data;
      state.cache.groupDetails.lastFetched = Date.now();
      state.cache.groupDetails.error = null;
    },
    setGroupDetailsError: (state, action: PayloadAction<string>) => {
      state.cache.groupDetails.error = action.payload;
      state.cache.groupDetails.loading = false;
    },

    // Cache management
    clearCache: (state) => {
      state.cache = initialState.cache;
    },

    // Dashboard cache reducers
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.dashboard.loading = action.payload;
    },
    setDashboardData: (
      state,
      action: PayloadAction<{
        groups: any[];
        expenses: any[];
        balances: Record<string, any>;
        totals: {
          owed: number;
          owe: number;
        };
      }>
    ) => {
      state.cache.dashboard.data = action.payload;
      state.cache.dashboard.lastFetched = Date.now();
      state.cache.dashboard.error = null;
    },
    setDashboardError: (state, action: PayloadAction<string>) => {
      state.cache.dashboard.error = action.payload;
      state.cache.dashboard.loading = false;
    },

    // Users cache reducers
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.users.loading = action.payload;
    },
    setUsersData: (state, action: PayloadAction<Record<string, User>>) => {
      if (!state.cache.users.data) {
        state.cache.users.data = {};
      }
      state.cache.users.data = {
        ...state.cache.users.data,
        ...action.payload,
      };
      state.cache.users.lastFetched = Date.now();
      state.cache.users.error = null;
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.cache.users.error = action.payload;
      state.cache.users.loading = false;
    },
  },
});

// Export all actions
export const {
  increment,
  decrement,
  setCount,
  setUser,
  clearUser,
  setAuthLoading,
  setGroupsLoading,
  setGroupsData,
  setGroupsError,
  setExpensesLoading,
  setExpensesData,
  setExpensesError,
  setGroupDetailsLoading,
  setGroupDetailsData,
  setGroupDetailsError,
  clearCache,
  setDashboardLoading,
  setDashboardData,
  setDashboardError,
  setUsersLoading,
  setUsersData,
  setUsersError,
} = appSlice.actions;

/**
 * Selectors for accessing cache data from the Redux store
 */
export const selectGroupsCache = (state: RootState) => state.app.cache.groups;
export const selectExpensesCache = (state: RootState) =>
  state.app.cache.expenses;
export const selectGroupDetailsCache = (state: RootState) =>
  state.app.cache.groupDetails;
export const selectDashboardCache = (state: RootState) =>
  state.app.cache.dashboard;
export const selectUsersCache = (state: RootState) => state.app.cache.users;

/**
 * Helper function to check if cached data is still valid
 * @param lastFetched - Timestamp of when the data was last fetched
 * @returns boolean indicating if the cache is still valid
 */
export const isCacheValid = (lastFetched: number | null) => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};

export default appSlice.reducer;
