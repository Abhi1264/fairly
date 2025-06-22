import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { Currency } from "./groupUtils";

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
 * User preferences interface
 */
interface UserPreferences {
  defaultCurrency: Currency;
}

/**
 * Offline state interface
 */
interface OfflineState {
  isOnline: boolean;
  isReconnecting: boolean;
  isSyncing: boolean;
  pendingOperations: number;
  lastSync: number;
  storageInfo: {
    used: number;
    available: number;
    percentage: number;
  };
}

/**
 * AppState interface defining the shape of the application state
 * Includes user data, authentication state, and various cache objects
 */
interface AppState {
  count: number;
  user: User | null;
  authLoading: boolean;
  preferences: UserPreferences;
  offline: OfflineState;
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
    // Cache for analytics data
    analytics: {
      data: any[] | null;
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
  preferences: {
    defaultCurrency: "INR",
  },
  offline: {
    isOnline: navigator.onLine,
    isReconnecting: false,
    isSyncing: false,
    pendingOperations: 0,
    lastSync: 0,
    storageInfo: {
      used: 0,
      available: 5 * 1024 * 1024, // 5MB estimate
      percentage: 0,
    },
  },
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
    analytics: {
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

    // User preferences reducers
    setDefaultCurrency: (state, action: PayloadAction<Currency>) => {
      state.preferences.defaultCurrency = action.payload;
    },
    setUserPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Offline state reducers
    setNetworkStatus: (
      state,
      action: PayloadAction<{ isOnline: boolean; isReconnecting: boolean }>
    ) => {
      state.offline.isOnline = action.payload.isOnline;
      state.offline.isReconnecting = action.payload.isReconnecting;
    },
    setSyncStatus: (state, action: PayloadAction<boolean>) => {
      state.offline.isSyncing = action.payload;
    },
    setPendingOperations: (state, action: PayloadAction<number>) => {
      state.offline.pendingOperations = action.payload;
    },
    setLastSync: (state, action: PayloadAction<number>) => {
      state.offline.lastSync = action.payload;
    },
    setStorageInfo: (
      state,
      action: PayloadAction<{
        used: number;
        available: number;
        percentage: number;
      }>
    ) => {
      state.offline.storageInfo = action.payload;
    },
    updateOfflineState: (
      state,
      action: PayloadAction<Partial<OfflineState>>
    ) => {
      state.offline = { ...state.offline, ...action.payload };
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

    // Dashboard cache reducers
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.dashboard.loading = action.payload;
    },
    setDashboardData: (state, action: PayloadAction<any>) => {
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
      state.cache.users.data = action.payload;
      state.cache.users.lastFetched = Date.now();
      state.cache.users.error = null;
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.cache.users.error = action.payload;
      state.cache.users.loading = false;
    },

    // Analytics cache reducers
    setAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.cache.analytics.loading = action.payload;
    },
    setAnalyticsData: (state, action: PayloadAction<any[]>) => {
      state.cache.analytics.data = action.payload;
      state.cache.analytics.loading = false;
      state.cache.analytics.lastFetched = Date.now();
      state.cache.analytics.error = null;
    },
    setAnalyticsError: (state, action: PayloadAction<string>) => {
      state.cache.analytics.error = action.payload;
      state.cache.analytics.loading = false;
    },

    // Clear cache reducers
    clearGroupsCache: (state) => {
      state.cache.groups = {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearExpensesCache: (state) => {
      state.cache.expenses = {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearGroupDetailsCache: (state) => {
      state.cache.groupDetails = {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearDashboardCache: (state) => {
      state.cache.dashboard = {
        data: {
          groups: null,
          expenses: null,
          balances: null,
          totals: null,
        },
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearUsersCache: (state) => {
      state.cache.users = {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearAnalyticsCache: (state) => {
      state.cache.analytics = {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      };
    },
    clearAllCache: (state) => {
      state.cache = {
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
        analytics: {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        },
      };
    },
  },
});

// Export actions
export const {
  increment,
  decrement,
  setCount,
  setUser,
  clearUser,
  setAuthLoading,
  setDefaultCurrency,
  setUserPreferences,
  setNetworkStatus,
  setSyncStatus,
  setPendingOperations,
  setLastSync,
  setStorageInfo,
  updateOfflineState,
  setGroupsLoading,
  setGroupsData,
  setGroupsError,
  setExpensesLoading,
  setExpensesData,
  setExpensesError,
  setGroupDetailsLoading,
  setGroupDetailsData,
  setGroupDetailsError,
  setDashboardLoading,
  setDashboardData,
  setDashboardError,
  setUsersLoading,
  setUsersData,
  setUsersError,
  setAnalyticsLoading,
  setAnalyticsData,
  setAnalyticsError,
  clearGroupsCache,
  clearExpensesCache,
  clearGroupDetailsCache,
  clearDashboardCache,
  clearUsersCache,
  clearAnalyticsCache,
  clearAllCache,
} = appSlice.actions;

// Export reducer
export default appSlice.reducer;

// Export selectors
export const selectCount = (state: RootState) => state.app.count;
export const selectUser = (state: RootState) => state.app.user;
export const selectAuthLoading = (state: RootState) => state.app.authLoading;
export const selectUserPreferences = (state: RootState) =>
  state.app.preferences;
export const selectDefaultCurrency = (state: RootState) =>
  state.app.preferences.defaultCurrency;
export const selectOfflineState = (state: RootState) => state.app.offline;
export const selectIsOnline = (state: RootState) => state.app.offline.isOnline;
export const selectIsSyncing = (state: RootState) =>
  state.app.offline.isSyncing;
export const selectPendingOperations = (state: RootState) =>
  state.app.offline.pendingOperations;
export const selectLastSync = (state: RootState) => state.app.offline.lastSync;
export const selectStorageInfo = (state: RootState) =>
  state.app.offline.storageInfo;

export const selectGroupsCache = (state: RootState) => state.app.cache.groups;
export const selectExpensesCache = (state: RootState) =>
  state.app.cache.expenses;
export const selectGroupDetailsCache = (state: RootState) =>
  state.app.cache.groupDetails;
export const selectDashboardCache = (state: RootState) =>
  state.app.cache.dashboard;
export const selectUsersCache = (state: RootState) => state.app.cache.users;
export const selectAnalyticsCache = (state: RootState) =>
  state.app.cache.analytics;

// Cache validation utility
export const isCacheValid = (lastFetched: number | null) => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_DURATION;
};
