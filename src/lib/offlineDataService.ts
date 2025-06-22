import { offlineStorage } from "./offlineStorage";
import { offlineSync } from "./offlineSync";
import { toast } from "sonner";

// Import Firebase functions
import { firestore } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

/**
 * Offline-first data service that wraps Firebase operations
 * Provides automatic caching, offline queuing, and data synchronization
 */
class OfflineDataService {
  private static instance: OfflineDataService;

  private constructor() {}

  static getInstance(): OfflineDataService {
    if (!OfflineDataService.instance) {
      OfflineDataService.instance = new OfflineDataService();
    }
    return OfflineDataService.instance;
  }

  /**
   * Check if we're online
   */
  private isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Create a document with offline support
   */
  async createDocument(collectionName: string, data: any): Promise<string> {
    if (this.isOnline()) {
      try {
        // Try online first
        const collectionRef = collection(firestore, collectionName);
        const docRef = await addDoc(collectionRef, {
          ...data,
          createdAt: serverTimestamp(),
        });

        // Cache the created document
        offlineStorage.cacheDocument(collectionName, docRef.id, {
          ...data,
          id: docRef.id,
          createdAt: new Date().toISOString(),
        });

        return docRef.id;
      } catch (error) {
        console.error("Online create failed, falling back to offline:", error);
        // Fall through to offline handling
      }
    }

    // Offline handling
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Cache the document with temp ID
    offlineStorage.cacheDocument(collectionName, tempId, {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
      _isOffline: true,
    });

    // Queue the operation
    offlineStorage.addToQueue({
      type: "CREATE",
      collection: collectionName,
      data: {
        ...data,
        createdAt: new Date().toISOString(),
      },
    });

    toast.info("Document created offline. Will sync when online.");
    return tempId;
  }

  /**
   * Get a document with offline support
   */
  async getDocument(
    collectionName: string,
    documentId: string
  ): Promise<any | null> {
    // Check cache first
    const cachedData = offlineStorage.getCachedDocument(
      collectionName,
      documentId
    );

    if (this.isOnline()) {
      try {
        // Try to get fresh data
        const docRef = doc(firestore, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = this.convertFirestoreData(docSnap.data());
          const documentData = { id: docSnap.id, ...data };

          // Update cache
          offlineStorage.cacheDocument(
            collectionName,
            documentId,
            documentData
          );

          return documentData;
        }
      } catch (error) {
        console.error("Online get failed, using cached data:", error);
      }
    }

    // Return cached data if available
    return cachedData;
  }

  /**
   * Update a document with offline support
   */
  async updateDocument(
    collectionName: string,
    documentId: string,
    updates: any
  ): Promise<void> {
    // Update cache immediately for optimistic UI
    const cachedData = offlineStorage.getCachedDocument(
      collectionName,
      documentId
    );
    if (cachedData) {
      offlineStorage.cacheDocument(collectionName, documentId, {
        ...cachedData,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }

    if (this.isOnline()) {
      try {
        // Try online update
        const docRef = doc(firestore, collectionName, documentId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        return;
      } catch (error) {
        console.error("Online update failed, falling back to offline:", error);
        // Fall through to offline handling
      }
    }

    // Offline handling
    offlineStorage.addToQueue({
      type: "UPDATE",
      collection: collectionName,
      documentId,
      data: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    });

    toast.info("Document updated offline. Will sync when online.");
  }

  /**
   * Delete a document with offline support
   */
  async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    // Remove from cache immediately for optimistic UI
    offlineStorage.removeCachedDocument(collectionName, documentId);

    if (this.isOnline()) {
      try {
        // Try online delete
        const docRef = doc(firestore, collectionName, documentId);
        await deleteDoc(docRef);

        return;
      } catch (error) {
        console.error("Online delete failed, falling back to offline:", error);
        // Fall through to offline handling
      }
    }

    // Offline handling
    offlineStorage.addToQueue({
      type: "DELETE",
      collection: collectionName,
      documentId,
    });

    toast.info("Document deleted offline. Will sync when online.");
  }

  /**
   * Get documents with offline support
   */
  async getDocuments(collectionName: string): Promise<any[]> {
    // For now, return cached data for the collection
    // In a more sophisticated implementation, you'd implement query caching
    const offlineData = offlineStorage.getOfflineData();

    switch (collectionName) {
      case "groups":
        return Object.values(offlineData.groups);
      case "expenses":
        // Flatten all expenses from all groups
        return Object.values(offlineData.expenses).flat();
      case "users":
        return Object.values(offlineData.users);
      default:
        return [];
    }
  }

  /**
   * Set a document with offline support
   */
  async setDocument(
    collectionName: string,
    documentId: string,
    data: any
  ): Promise<void> {
    // Update cache immediately
    offlineStorage.cacheDocument(collectionName, documentId, {
      ...data,
      id: documentId,
      updatedAt: new Date().toISOString(),
    });

    if (this.isOnline()) {
      try {
        // Try online set
        const docRef = doc(firestore, collectionName, documentId);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });

        return;
      } catch (error) {
        console.error("Online set failed, falling back to offline:", error);
        // Fall through to offline handling
      }
    }

    // Offline handling
    offlineStorage.addToQueue({
      type: "UPDATE",
      collection: collectionName,
      documentId,
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    });

    toast.info("Document set offline. Will sync when online.");
  }

  /**
   * Convert Firestore data to serializable format
   */
  private convertFirestoreData(data: any): any {
    if (!data || typeof data !== "object") {
      return data;
    }

    if (data instanceof Timestamp) {
      return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(this.convertFirestoreData);
    }

    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = this.convertFirestoreData(value);
    }

    return converted;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return offlineSync.getSyncStats();
  }

  /**
   * Manual sync
   */
  async sync() {
    return offlineSync.syncOfflineOperations();
  }

  /**
   * Clear all offline data
   */
  clearAll() {
    offlineSync.clearAllOfflineData();
  }
}

export const offlineDataService = OfflineDataService.getInstance();
