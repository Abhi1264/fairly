// Import necessary dependencies
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../lib/store";
import {
  getUserGroups,
  joinGroup,
  generateInviteCode,
} from "../lib/groupUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CopyIcon, UsersIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import {
  selectGroupsCache,
  setGroupsLoading,
  setGroupsData,
  setGroupsError,
  isCacheValid,
} from "../lib/appSlice";
import { CreateGroupModal } from "./CreateGroupModal";
import { Link } from "react-router-dom";

// Define the Group interface
interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  currency: string;
  description?: string;
  memberCount?: number;
}

export function GroupList() {
  // Redux state management
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.app.user);
  const {
    data: groups,
    loading,
    error,
    lastFetched,
  } = useSelector(selectGroupsCache);

  // Local state management
  const [joinId, setJoinId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);

  // Debug logging for component state
  useEffect(() => {
    console.log("GroupList state:", {
      user: user ? { uid: user.uid, name: user.displayName } : null,
      groups,
      loading,
      error,
      lastFetched: lastFetched ? new Date(lastFetched).toISOString() : null,
    });
  }, [user, groups, loading, error, lastFetched]);

  // Fetch groups data when component mounts or dependencies change
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        console.log("No user, skipping group fetch");
        return;
      }

      // Use cached data if it's still valid
      if (isCacheValid(lastFetched)) {
        console.log("Using cached groups data");
        return;
      }

      console.log("Fetching groups for user:", user.uid);
      dispatch(setGroupsLoading(true));
      try {
        const userGroups = await getUserGroups(user.uid);
        console.log("Fetched groups:", userGroups);
        dispatch(setGroupsData(userGroups));
      } catch (err) {
        console.error("Error fetching groups:", err);
        dispatch(
          setGroupsError(
            err instanceof Error ? err.message : "Failed to fetch groups"
          )
        );
      } finally {
        dispatch(setGroupsLoading(false));
      }
    };

    fetchGroups();
  }, [user, dispatch, lastFetched]);

  // Handle joining a group
  const handleJoinGroup = async () => {
    if (!user || !joinId.trim()) return;
    setJoinLoading(true);
    try {
      await joinGroup({ groupId: joinId, userId: user.uid });
      toast.success("Successfully joined group!");
      setJoinId("");
      // Refresh the group list after joining
      const userGroups = await getUserGroups(user.uid);
      dispatch(setGroupsData(userGroups));
    } catch (err) {
      toast.error((err as any).message || "Error joining group.");
    } finally {
      setJoinLoading(false);
    }
  };

  // Generate invite code for a group
  const handleGenerateInviteCode = async (group: Group) => {
    setSelectedGroup(group);
    setGeneratingCode(true);
    try {
      const code = await generateInviteCode(group.id);
      setInviteCode(code);
    } catch (err) {
      toast.error("Error generating invite code");
    } finally {
      setGeneratingCode(false);
    }
  };

  // Copy text to clipboard utility function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h3 className="font-semibold">Error loading groups</h3>
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              dispatch(setGroupsLoading(true));
              dispatch(setGroupsError(""));
              // Retry fetching groups
              if (user) {
                getUserGroups(user.uid)
                  .then((groups) => dispatch(setGroupsData(groups)))
                  .catch((err) =>
                    dispatch(
                      setGroupsError(
                        err instanceof Error
                          ? err.message
                          : "Failed to fetch groups"
                      )
                    )
                  )
                  .finally(() => dispatch(setGroupsLoading(false)));
              }
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state UI
  if (!groups || groups.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center">
          <UsersIcon className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No groups yet</h3>
          <p className="text-sm text-muted-foreground">
            Create a new group or join an existing one to get started
          </p>
          <div className="flex gap-4">
            <CreateGroupModal />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Join Group</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Enter Group ID or Invite Code"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={handleJoinGroup} disabled={joinLoading}>
                      {joinLoading ? "Joining..." : "Join Group"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header section with join group button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Groups</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Join Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Enter Group ID or Invite Code"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={handleJoinGroup} disabled={joinLoading}>
                  {joinLoading ? "Joining..." : "Join Group"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No groups found. Create or join a group to get started!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group: Group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="block transition-colors hover:bg-accent/50"
            >
              <Card className="relative">
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    {group.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    {group.memberCount || 1} members
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGroup(group);
                      handleGenerateInviteCode(group);
                    }}
                    disabled={generatingCode}
                  >
                    <Share2Icon className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Invite code dialog */}
      <Dialog
        open={!!selectedGroup}
        onOpenChange={() => setSelectedGroup(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                value={inviteCode}
                readOnly
                placeholder="Generating invite code..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(inviteCode)}
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with people you want to invite to the group.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
