// Import required dependencies
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { setUser, clearUser, setAuthLoading } from "../lib/appSlice";
import { secureLog } from "../lib/utils";

/**
 * AuthProvider component that manages authentication state
 * Handles user persistence, auth state changes, and updates Redux store accordingly
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Configure Firebase auth persistence to LOCAL
    // This ensures the auth state persists across page reloads
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      secureLog.error("Error setting auth persistence", error);
    });

    // Indicate that auth state is being checked
    dispatch(setAuthLoading(true));

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      secureLog.info("Auth state changed", {
        isAuthenticated: !!user,
        user: secureLog.sanitizeUser(user),
      });

      if (user) {
        // Update Redux store with user data when logged in
        dispatch(
          setUser({
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } else {
        // Clear user data from Redux store when logged out
        dispatch(clearUser());
      }

      // Auth state check complete
      dispatch(setAuthLoading(false));
    });

    // Cleanup: Unsubscribe from auth state changes when component unmounts
    return () => {
      secureLog.debug("Cleaning up auth state listener");
      unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
