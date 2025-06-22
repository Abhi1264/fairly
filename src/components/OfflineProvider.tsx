import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNetworkStatus } from "../lib/useNetworkStatus";
import { offlineSync } from "../lib/offlineSync";
import { offlineStorage } from "../lib/offlineStorage";
import {
  setNetworkStatus,
  setSyncStatus,
  setPendingOperations,
  setLastSync,
  setStorageInfo,
} from "../lib/appSlice";

interface OfflineProviderProps {
  children: React.ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const dispatch = useDispatch();
  const { isOnline, isReconnecting } = useNetworkStatus();

  // Sync network status with Redux
  useEffect(() => {
    dispatch(setNetworkStatus({ isOnline, isReconnecting }));
  }, [dispatch, isOnline, isReconnecting]);

  // Listen to sync status changes
  useEffect(() => {
    const unsubscribe = offlineSync.addSyncListener((isSyncing) => {
      dispatch(setSyncStatus(isSyncing));
    });

    return unsubscribe;
  }, [dispatch]);

  // Update offline state periodically
  useEffect(() => {
    const updateOfflineState = () => {
      const queue = offlineStorage.getOperationQueue();
      const lastSync = offlineStorage.getLastSync();
      const storageInfo = offlineStorage.getStorageInfo();

      dispatch(setPendingOperations(queue.length));
      dispatch(setLastSync(lastSync));
      dispatch(setStorageInfo(storageInfo));
    };

    // Update immediately
    updateOfflineState();

    // Update every 5 seconds
    const interval = setInterval(updateOfflineState, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !isReconnecting) {
      const queue = offlineStorage.getOperationQueue();
      if (queue.length > 0) {
        // Small delay to ensure network is stable
        const timeout = setTimeout(() => {
          offlineSync.syncOfflineOperations();
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [isOnline, isReconnecting]);

  return <>{children}</>;
}

export default OfflineProvider; 