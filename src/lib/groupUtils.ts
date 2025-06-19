// Firebase imports for database operations
import { firestore } from "./firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  arrayUnion,
  orderBy,
  limit,
  deleteDoc,
  updateDoc as firestoreUpdateDoc,
  setDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";

// Types for expense splitting and currency handling
export type SplitMethod = "equal" | "percentage" | "shares" | "manual";
export type Currency = "USD" | "INR" | "EUR" | "GBP";

// Configuration for how an expense should be split between members
interface SplitConfig {
  method: SplitMethod;
  shares?: Record<string, number>; // For shares method: number of shares per member
  percentages?: Record<string, number>; // For percentage method: percentage per member
  manual?: Record<string, number>; // For manual method: exact amounts per member
}

// Structure for expense data
interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  paidBy: string;
  splitConfig: SplitConfig;
  category?: string;
  date: string;
  createdAt: string;
  attachments?: string[];
  tax?: number;
  discount?: number;
  items?: Array<{
    description: string;
    amount: number;
    splitBetween: string[];
  }>;
}

// Structure for user profile data
interface UserData {
  id: string;
  phoneNumber?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  groups?: string[];
}

/**
 * Creates a new group and adds the creator as a member
 * @returns The ID of the newly created group
 */
export async function createGroup({
  name,
  description,
  createdBy,
}: {
  name: string;
  description: string;
  createdBy: string;
}) {
  // Create group document
  const groupRef = await addDoc(collection(firestore, "groups"), {
    name,
    description: description || "",
    createdBy,
    members: [createdBy],
    createdAt: serverTimestamp(),
  });

  // Add group to creator's group list
  const userRef = doc(firestore, "users", createdBy);
  await setDoc(userRef, { groups: arrayUnion(groupRef.id) }, { merge: true });
  return groupRef.id;
}

/**
 * Retrieves all groups that a user is a member of
 */
export async function getUserGroups(userId: string) {
  // Get user's group IDs
  const userSnap = await getDoc(doc(firestore, "users", userId));
  const userData = userSnap.data();
  if (!userData?.groups) return [];

  // Fetch full group documents
  const groupPromises = userData.groups.map((groupId: string) =>
    getDoc(doc(firestore, "groups", groupId))
  );
  const groupSnaps = await Promise.all(groupPromises);
  return groupSnaps.map((snap) => ({ id: snap.id, ...snap.data() }));
}

/**
 * Adds a user to a group and updates both group and user documents
 */
export async function joinGroup({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) {
  // Add user to group's member list
  const groupRef = doc(firestore, "groups", groupId);
  await updateDoc(groupRef, { members: arrayUnion(userId) });

  // Add group to user's group list
  const userRef = doc(firestore, "users", userId);
  await setDoc(userRef, { groups: arrayUnion(groupId) }, { merge: true });
}

/**
 * Retrieves a group's data by its ID
 */
export async function getGroupById(groupId: string) {
  const snap = await getDoc(doc(firestore, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Generates a unique invite code for a group
 * @returns The generated invite code
 */
export async function generateInviteCode(groupId: string): Promise<string> {
  const groupRef = doc(firestore, "groups", groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error("Group not found");
  }

  // Generate unique 8-character code
  const code = nanoid(8);

  // Store invite code in group document
  await updateDoc(groupRef, {
    inviteCodes: arrayUnion({
      code,
      createdAt: new Date().toISOString(),
      createdBy: groupDoc.data().createdBy,
      used: false,
    }),
  });

  return code;
}

/**
 * Validates an invite code and returns the associated group ID if valid
 * @returns Group ID if code is valid, null otherwise
 */
export async function validateInviteCode(code: string): Promise<string | null> {
  // Search for group with matching invite code
  const groupsRef = collection(firestore, "groups");
  const q = query(groupsRef, where("inviteCodes", "array-contains", { code }));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const groupDoc = querySnapshot.docs[0];
  const groupData = groupDoc.data();

  // Verify code hasn't been used
  const inviteCode = groupData.inviteCodes.find((ic: any) => ic.code === code);
  if (!inviteCode || inviteCode.used) {
    return null;
  }

  return groupDoc.id;
}

/**
 * Joins a group using an invite code
 * @throws Error if invite code is invalid or expired
 */
export async function joinGroupWithInviteCode({
  code,
  userId,
}: {
  code: string;
  userId: string;
}): Promise<void> {
  const groupId = await validateInviteCode(code);

  if (!groupId) {
    throw new Error("Invalid or expired invite code");
  }

  // Update group document
  const groupRef = doc(firestore, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  const groupData = groupSnap.data();

  await updateDoc(groupRef, {
    members: arrayUnion(userId),
    inviteCodes: groupData?.inviteCodes?.map((ic: any) =>
      ic.code === code ? { ...ic, used: true } : ic
    ),
  });

  // Update user document
  const userRef = doc(firestore, "users", userId);
  await setDoc(userRef, { groups: arrayUnion(groupId) }, { merge: true });
}

/**
 * Adds a new expense to a group
 * @returns The created expense object
 */
export async function addExpense({
  groupId,
  description,
  amount,
  currency = "INR",
  paidBy,
  splitConfig,
  category,
  date = new Date().toISOString(),
  tax,
  discount,
  items,
  attachments,
}: Omit<Expense, "id" | "createdAt"> & { groupId: string }) {
  const expenseRef = collection(firestore, "groups", groupId, "expenses");

  // Create expense object with required fields
  const expense: Partial<Expense> = {
    id: nanoid(),
    description,
    amount,
    currency,
    paidBy,
    splitConfig,
    date,
    createdAt: new Date().toISOString(),
  };

  // Add optional fields if provided
  if (category) expense.category = category;
  if (tax !== undefined) expense.tax = tax;
  if (discount !== undefined) expense.discount = discount;
  if (items?.length) expense.items = items;
  if (attachments?.length) expense.attachments = attachments;

  await addDoc(expenseRef, expense);
  return expense as Expense;
}

/**
 * Updates an existing expense
 */
export async function updateExpense(
  groupId: string,
  expenseId: string,
  updates: Partial<Expense>
) {
  const expenseRef = doc(firestore, "groups", groupId, "expenses", expenseId);
  await firestoreUpdateDoc(expenseRef, updates);
}

/**
 * Deletes an expense
 */
export async function deleteExpense(groupId: string, expenseId: string) {
  const expenseRef = doc(firestore, "groups", groupId, "expenses", expenseId);
  await deleteDoc(expenseRef);
}

/**
 * Retrieves expenses for a group with optional filtering
 * Note: Some filters (date, amount) are applied in memory due to Firestore limitations
 */
export async function getGroupExpenses(
  groupId: string,
  filters?: {
    category?: string;
    paidBy?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    currency?: Currency;
  }
) {
  const expensesRef = collection(firestore, "groups", groupId, "expenses");
  let q = query(expensesRef, orderBy("date", "desc"), limit(100));

  // Apply Firestore-supported filters
  if (filters) {
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }
    if (filters.paidBy) {
      q = query(q, where("paidBy", "==", filters.paidBy));
    }
    if (filters.currency) {
      q = query(q, where("currency", "==", filters.currency));
    }
    // Note: Date and amount filters need to be applied in memory
    // as Firestore doesn't support range queries on multiple fields
  }

  const snapshot = await getDocs(q);
  let expenses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];

  // Apply in-memory filters
  if (filters) {
    if (filters.startDate) {
      expenses = expenses.filter((exp) => exp.date >= filters.startDate!);
    }
    if (filters.endDate) {
      expenses = expenses.filter((exp) => exp.date <= filters.endDate!);
    }
    if (filters.minAmount !== undefined) {
      expenses = expenses.filter((exp) => exp.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      expenses = expenses.filter((exp) => exp.amount <= filters.maxAmount!);
    }
  }

  return expenses;
}

export function calculateSplitAmounts(
  expense: Expense
): Record<string, number> {
  const { amount, splitConfig, tax = 0, discount = 0 } = expense;
  const totalAmount = amount + tax - discount;
  const splits: Record<string, number> = {};

  switch (splitConfig.method) {
    case "equal": {
      const memberCount = Object.keys(splitConfig.shares || {}).length;
      const shareAmount = totalAmount / memberCount;
      Object.keys(splitConfig.shares || {}).forEach((memberId) => {
        splits[memberId] = shareAmount;
      });
      break;
    }
    case "percentage": {
      Object.entries(splitConfig.percentages || {}).forEach(
        ([memberId, percentage]) => {
          splits[memberId] = (totalAmount * percentage) / 100;
        }
      );
      break;
    }
    case "shares": {
      const totalShares = Object.values(splitConfig.shares || {}).reduce(
        (sum, share) => sum + share,
        0
      );
      Object.entries(splitConfig.shares || {}).forEach(([memberId, share]) => {
        splits[memberId] = (totalAmount * share) / totalShares;
      });
      break;
    }
    case "manual": {
      Object.entries(splitConfig.manual || {}).forEach(([memberId, amount]) => {
        splits[memberId] = amount;
      });
      break;
    }
  }

  return splits;
}

export async function getGroupBalances(groupId: string) {
  const expenses = await getGroupExpenses(groupId);
  const balances: Record<string, Record<Currency, number>> = {};

  expenses.forEach((expense) => {
    const splits = calculateSplitAmounts(expense);

    // Initialize currency balances if not exists
    if (!balances[expense.paidBy]) {
      balances[expense.paidBy] = { [expense.currency]: 0 } as Record<
        Currency,
        number
      >;
    }
    if (!balances[expense.paidBy][expense.currency]) {
      balances[expense.paidBy][expense.currency] = 0;
    }

    // Add to payer's balance
    balances[expense.paidBy][expense.currency] += expense.amount;

    // Subtract from each person's share
    Object.entries(splits).forEach(([memberId, amount]) => {
      if (!balances[memberId]) {
        balances[memberId] = { [expense.currency]: 0 } as Record<
          Currency,
          number
        >;
      }
      if (!balances[memberId][expense.currency]) {
        balances[memberId][expense.currency] = 0;
      }
      balances[memberId][expense.currency] -= amount;
    });
  });

  return balances;
}

export async function getUserById(userId: string): Promise<UserData | null> {
  const userSnap = await getDoc(doc(firestore, "users", userId));
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
}
