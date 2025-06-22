import { nanoid } from "nanoid";

// Types for offline operations
export interface OfflineOperation {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  collection: string;
  documentId?: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  groups: Record<string, any>;
  expenses: Record<string, any[]>;
  users: Record<string, any>;
  lastSync: number;
}

// Storage keys
const STORAGE_KEYS = {
  OFFLINE_DATA: "fairly_offline_data",
  OPERATION_QUEUE: "fairly_operation_queue",
  NETWORK_STATUS: "fairly_network_status",
  LAST_SYNC: "fairly_last_sync",
} as const;

/**
 * Offline storage utility for managing local data and operation queue
 */
class OfflineStorage {
  private static instance: OfflineStorage;

  private constructor() {}

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get offline data from localStorage
   */
  getOfflineData(): OfflineData {
    if (!this.isStorageAvailable()) {
      return {
        groups: {},
        expenses: {},
        users: {},
        lastSync: 0,
      };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      return data
        ? JSON.parse(data)
        : {
            groups: {},
            expenses: {},
            users: {},
            lastSync: 0,
          };
    } catch {
      return {
        groups: {},
        expenses: {},
        users: {},
        lastSync: 0,
      };
    }
  }

  /**
   * Save offline data to localStorage
   */
  saveOfflineData(data: Partial<OfflineData>): void {
    if (!this.isStorageAvailable()) return;

    try {
      const currentData = this.getOfflineData();
      const updatedData = { ...currentData, ...data };
      localStorage.setItem(
        STORAGE_KEYS.OFFLINE_DATA,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error("Failed to save offline data:", error);
    }
  }

  /**
   * Cache a document locally
   */
  cacheDocument(collection: string, id: string, data: any): void {
    const offlineData = this.getOfflineData();

    switch (collection) {
      case "groups":
        offlineData.groups[id] = { ...data, id, _cachedAt: Date.now() };
        break;
      case "expenses":
        if (!offlineData.expenses[id]) {
          offlineData.expenses[id] = [];
        }
        const existingIndex = offlineData.expenses[id].findIndex(
          (exp: any) => exp.id === data.id
        );
        if (existingIndex >= 0) {
          offlineData.expenses[id][existingIndex] = {
            ...data,
            _cachedAt: Date.now(),
          };
        } else {
          offlineData.expenses[id].push({ ...data, _cachedAt: Date.now() });
        }
        break;
      case "users":
        offlineData.users[id] = { ...data, id, _cachedAt: Date.now() };
        break;
    }

    this.saveOfflineData(offlineData);
  }

  /**
   * Get cached document
   */
  getCachedDocument(collection: string, id: string): any | null {
    const offlineData = this.getOfflineData();

    switch (collection) {
      case "groups":
        return offlineData.groups[id] || null;
      case "expenses":
        return offlineData.expenses[id] || null;
      case "users":
        return offlineData.users[id] || null;
      default:
        return null;
    }
  }

  /**
   * Remove cached document
   */
  removeCachedDocument(collection: string, id: string): void {
    const offlineData = this.getOfflineData();

    switch (collection) {
      case "groups":
        delete offlineData.groups[id];
        break;
      case "expenses":
        delete offlineData.expenses[id];
        break;
      case "users":
        delete offlineData.users[id];
        break;
    }

    this.saveOfflineData(offlineData);
  }

  /**
   * Get operation queue
   */
  getOperationQueue(): OfflineOperation[] {
    if (!this.isStorageAvailable()) return [];

    try {
      const queue = localStorage.getItem(STORAGE_KEYS.OPERATION_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add operation to queue
   */
  addToQueue(
    operation: Omit<OfflineOperation, "id" | "timestamp" | "retryCount">
  ): void {
    if (!this.isStorageAvailable()) return;

    try {
      const queue = this.getOperationQueue();
      const newOperation: OfflineOperation = {
        ...operation,
        id: nanoid(),
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(newOperation);
      localStorage.setItem(STORAGE_KEYS.OPERATION_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to add operation to queue:", error);
    }
  }

  /**
   * Remove operation from queue
   */
  removeFromQueue(operationId: string): void {
    if (!this.isStorageAvailable()) return;

    try {
      const queue = this.getOperationQueue();
      const filteredQueue = queue.filter((op) => op.id !== operationId);
      localStorage.setItem(
        STORAGE_KEYS.OPERATION_QUEUE,
        JSON.stringify(filteredQueue)
      );
    } catch (error) {
      console.error("Failed to remove operation from queue:", error);
    }
  }

  /**
   * Update operation retry count
   */
  updateOperationRetry(operationId: string, retryCount: number): void {
    if (!this.isStorageAvailable()) return;

    try {
      const queue = this.getOperationQueue();
      const updatedQueue = queue.map((op) =>
        op.id === operationId ? { ...op, retryCount } : op
      );
      localStorage.setItem(
        STORAGE_KEYS.OPERATION_QUEUE,
        JSON.stringify(updatedQueue)
      );
    } catch (error) {
      console.error("Failed to update operation retry count:", error);
    }
  }

  /**
   * Clear operation queue
   */
  clearQueue(): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.removeItem(STORAGE_KEYS.OPERATION_QUEUE);
    } catch (error) {
      console.error("Failed to clear operation queue:", error);
    }
  }

  /**
   * Set network status
   */
  setNetworkStatus(isOnline: boolean): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(
        STORAGE_KEYS.NETWORK_STATUS,
        JSON.stringify({
          isOnline,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to set network status:", error);
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus(): { isOnline: boolean; timestamp: number } | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const status = localStorage.getItem(STORAGE_KEYS.NETWORK_STATUS);
      return status ? JSON.parse(status) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set last sync timestamp
   */
  setLastSync(timestamp: number): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error("Failed to set last sync timestamp:", error);
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSync(): number {
    if (!this.isStorageAvailable()) return 0;

    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all offline data
   */
  clearAll(): void {
    if (!this.isStorageAvailable()) return;

    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear offline data:", error);
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          used += new Blob([item]).size;
        }
      });

      // Estimate available storage (most browsers have 5-10MB limit)
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

export const offlineStorage = OfflineStorage.getInstance();
