import React from "react";
import { useNetworkStatus } from "../lib/useNetworkStatus";
import { offlineSync } from "../lib/offlineSync";
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className = "", showDetails = false }: OfflineIndicatorProps) {
  const { isOnline, isReconnecting } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStats, setSyncStats] = React.useState(() => offlineSync.getSyncStats());

  // Listen to sync status changes
  React.useEffect(() => {
    const unsubscribe = offlineSync.addSyncListener(setIsSyncing);
    return unsubscribe;
  }, []);

  // Update sync stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSyncStats(offlineSync.getSyncStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  React.useEffect(() => {
    if (isOnline && syncStats.pendingOperations > 0 && !isSyncing) {
      // Small delay to ensure network is stable
      const timeout = setTimeout(() => {
        handleSync();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, syncStats.pendingOperations, isSyncing]);

  const handleSync = async () => {
    try {
      await offlineSync.syncOfflineOperations();
      setSyncStats(offlineSync.getSyncStats());
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all offline data? This cannot be undone.")) {
      offlineSync.clearAllOfflineData();
      setSyncStats(offlineSync.getSyncStats());
      toast.success("Offline data cleared");
    }
  };

  if (isOnline && syncStats.pendingOperations === 0 && !showDetails) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Network Status Icon */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Status Text */}
      <span className="text-sm font-medium">
        {isReconnecting ? "Reconnecting..." : isOnline ? "Online" : "Offline"}
      </span>

      {/* Pending Operations Badge */}
      {syncStats.pendingOperations > 0 && (
        <Badge variant="secondary" className="text-xs">
          {syncStats.pendingOperations} pending
        </Badge>
      )}

      {/* Sync Status */}
      {isSyncing && (
        <div className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-xs text-blue-600">Syncing...</span>
        </div>
      )}

      {/* Manual Sync Button */}
      {isOnline && syncStats.pendingOperations > 0 && !isSyncing && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          className="h-6 px-2 text-xs"
        >
          Sync Now
        </Button>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="ml-4 border-l pl-4">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <span>Last sync:</span>
              {syncStats.lastSync > 0 ? (
                <span>{new Date(syncStats.lastSync).toLocaleTimeString()}</span>
              ) : (
                <span className="text-red-500">Never</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <span>Storage:</span>
              <span>{syncStats.storageInfo.percentage.toFixed(1)}% used</span>
            </div>

            {syncStats.pendingOperations > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                <span>{syncStats.pendingOperations} operations queued</span>
              </div>
            )}

            {syncStats.pendingOperations === 0 && syncStats.lastSync > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>All changes synced</span>
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearData}
              className="h-5 px-1 text-xs text-red-600 hover:text-red-700"
            >
              Clear Data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfflineIndicator; 