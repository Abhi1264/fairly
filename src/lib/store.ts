import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";

/**
 * Redux store configuration
 * Combines all reducers into a single store
 */
export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

/**
 * Type definitions for Redux state and dispatch
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
