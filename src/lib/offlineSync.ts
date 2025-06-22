import { offlineStorage, type OfflineOperation } from "./offlineStorage";
import { toast } from "sonner";

// Import Firebase functions for syncing
import { firestore } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

/**
 * Offline sync service for handling queued operations
 */
class OfflineSyncService {
  private static instance: OfflineSyncService;
  private isSyncing = false;
  private syncListeners: Array<(isSyncing: boolean) => void> = [];

  private constructor() {}

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Add a sync status listener
   */
  addSyncListener(listener: (isSyncing: boolean) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of sync status change
   */
  private notifySyncStatus(isSyncing: boolean): void {
    this.syncListeners.forEach(listener => listener(isSyncing));
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): boolean {
    return this.isSyncing;
  }

  /**
   * Sync all queued operations
   */
  async syncOfflineOperations(): Promise<void> {
    if (this.isSyncing) {
      console.log("Sync already in progress");
      return;
    }

    const queue = offlineStorage.getOperationQueue();
    if (queue.length === 0) {
      console.log("No operations to sync");
      return;
    }

    this.isSyncing = true;
    this.notifySyncStatus(true);

    try {
      console.log(`Starting sync of ${queue.length} operations`);
      
      let successCount = 0;
      let errorCount = 0;

      for (const operation of queue) {
        try {
          await this.processOperation(operation);
          offlineStorage.removeFromQueue(operation.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          
          // Increment retry count
          const newRetryCount = operation.retryCount + 1;
          offlineStorage.updateOperationRetry(operation.id, newRetryCount);

          // Remove operation if it has been retried too many times
          if (newRetryCount >= 3) {
            console.warn(`Removing operation ${operation.id} after ${newRetryCount} failed attempts`);
            offlineStorage.removeFromQueue(operation.id);
          }
          
          errorCount++;
        }
      }

      // Update last sync timestamp
      offlineStorage.setLastSync(Date.now());

      console.log(`Sync completed: ${successCount} successful, ${errorCount} failed`);

      if (successCount > 0) {
        toast.success(`Synced ${successCount} offline changes`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} operations failed to sync`);
      }

    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to sync offline changes");
    } finally {
      this.isSyncing = false;
      this.notifySyncStatus(false);
    }
  }

  /**
   * Process a single offline operation
   */
  private async processOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case "CREATE":
        await this.processCreateOperation(operation);
        break;
      case "UPDATE":
        await this.processUpdateOperation(operation);
        break;
      case "DELETE":
        await this.processDeleteOperation(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Process CREATE operation
   */
  private async processCreateOperation(operation: OfflineOperation): Promise<void> {
    if (!operation.data) {
      throw new Error("CREATE operation missing data");
    }

    const collectionRef = collection(firestore, operation.collection);
    const docRef = await addDoc(collectionRef, operation.data);
    
    // Update cached data with the new document ID
    offlineStorage.cacheDocument(operation.collection, docRef.id, {
      ...operation.data,
      id: docRef.id,
    });
  }

  /**
   * Process UPDATE operation
   */
  private async processUpdateOperation(operation: OfflineOperation): Promise<void> {
    if (!operation.documentId) {
      throw new Error("UPDATE operation missing document ID");
    }

    const docRef = doc(firestore, operation.collection, operation.documentId);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Document ${operation.documentId} not found`);
    }

    // Update the document
    await updateDoc(docRef, operation.data || {});
    
    // Update cached data
    if (operation.data) {
      const cachedData = offlineStorage.getCachedDocument(operation.collection, operation.documentId);
      if (cachedData) {
        offlineStorage.cacheDocument(operation.collection, operation.documentId, {
          ...cachedData,
          ...operation.data,
        });
      }
    }
  }

  /**
   * Process DELETE operation
   */
  private async processDeleteOperation(operation: OfflineOperation): Promise<void> {
    if (!operation.documentId) {
      throw new Error("DELETE operation missing document ID");
    }

    const docRef = doc(firestore, operation.collection, operation.documentId);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Document already deleted, just remove from cache
      offlineStorage.removeCachedDocument(operation.collection, operation.documentId);
      return;
    }

    // Delete the document
    await deleteDoc(docRef);
    
    // Remove from cache
    offlineStorage.removeCachedDocument(operation.collection, operation.documentId);
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    pendingOperations: number;
    lastSync: number;
    storageInfo: { used: number; available: number; percentage: number };
  } {
    const queue = offlineStorage.getOperationQueue();
    const lastSync = offlineStorage.getLastSync();
    const storageInfo = offlineStorage.getStorageInfo();

    return {
      pendingOperations: queue.length,
      lastSync,
      storageInfo,
    };
  }

  /**
   * Clear all offline data and queue
   */
  clearAllOfflineData(): void {
    offlineStorage.clearAll();
    console.log("All offline data cleared");
  }
}

export const offlineSync = OfflineSyncService.getInstance(); 