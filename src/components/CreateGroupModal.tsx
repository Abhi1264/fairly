// Import required dependencies
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { createGroup } from "../lib/groupUtils";
import { useSelector } from "react-redux";
import type { RootState } from "../lib/store";

/**
 * CreateGroupModal component that provides a dialog for creating new groups
 * Handles form state, validation, and group creation process
 */
export function CreateGroupModal() {
  // Form state management
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get current user from Redux store
  const user = useSelector((state: RootState) => state.app.user);

  /**
   * Handles the group creation process
   * Validates input, creates group, and manages loading/error states
   */
  const handleCreate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Validate user authentication and required fields
      if (!user) throw new Error("You must be signed in.");
      if (!name.trim()) throw new Error("Group name is required.");

      // Create the group
      await createGroup({ name, description, createdBy: user.uid });

      // Handle success
      setSuccess("Group created!");
      setName("");
      setDescription("");
    } catch (err) {
      // Handle errors
      setError((err as any).message || "Error creating group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      {/* Trigger button to open the modal */}
      <DialogTrigger className="bg-primary text-white px-4 py-2 rounded">
        Create Group
      </DialogTrigger>

      {/* Modal content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
        </DialogHeader>

        {/* Form fields */}
        <div className="space-y-2">
          {/* Group name input */}
          <input
            type="text"
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Optional description input */}
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full"
          />

          {/* Submit button */}
          <button
            className="bg-primary text-white px-4 py-2 rounded w-full mt-2"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>

          {/* Status messages */}
          {success && <div className="text-primary">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
