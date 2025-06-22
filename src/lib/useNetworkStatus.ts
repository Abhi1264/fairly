import { useState, useEffect, useCallback } from "react";
import { offlineStorage } from "./offlineStorage";

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnline: number | null;
  lastOffline: number | null;
}

/**
 * Custom hook to detect and manage network status
 * Provides real-time online/offline detection with reconnection handling
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    // Initialize with current network status
    const isOnline = navigator.onLine;
    const storedStatus = offlineStorage.getNetworkStatus();

    return {
      isOnline,
      isReconnecting: false,
      lastOnline: storedStatus?.isOnline ? storedStatus.timestamp : null,
      lastOffline: !storedStatus?.isOnline
        ? storedStatus?.timestamp || null
        : null,
    };
  });

  // Update network status
  const updateStatus = useCallback((isOnline: boolean) => {
    const now = Date.now();

    setStatus((prev) => {
      const newStatus: NetworkStatus = {
        isOnline,
        isReconnecting: !isOnline && prev.isOnline, // Set reconnecting when going offline
        lastOnline: isOnline ? now : prev.lastOnline,
        lastOffline: !isOnline ? now : prev.lastOffline,
      };

      // Store in offline storage
      offlineStorage.setNetworkStatus(isOnline);

      return newStatus;
    });

    // Clear reconnecting state after a delay
    if (!isOnline) {
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, isReconnecting: false }));
      }, 3000);
    }
  }, []);

  // Handle online event
  const handleOnline = useCallback(() => {
    updateStatus(true);
  }, [updateStatus]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    updateStatus(false);
  }, [updateStatus]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    updateStatus(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline, updateStatus]);

  return status;
}

/**
 * Hook to get a simple boolean for online status
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}

/**
 * Hook to check if the app is reconnecting
 */
export function useIsReconnecting(): boolean {
  const { isReconnecting } = useNetworkStatus();
  return isReconnecting;
}
