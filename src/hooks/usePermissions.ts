import { useSyncExternalStore } from "react";
import { TeamUserRepo, subscribeTeamUser } from "@/repositories";
import type { ModuleKey } from "@/types";

/**
 * Live view of the signed-in user's own permissions — reactive (via
 * useSyncExternalStore), not a one-time read, so if the owner changes or
 * revokes someone's access mid-session, every component using this hook
 * re-renders with the new answer immediately rather than waiting for that
 * page's own next manual refresh (the pattern the rest of this app's repos
 * use, which is fine for data lists but not for an access-control check).
 *
 * Settings/Team management is deliberately NOT covered by ModuleKey here —
 * it's gated by `isOwner` directly wherever it's used, never by a
 * configurable permission, so a staff member can never grant themselves
 * broader access by editing their own permissions.
 */
export function usePermissions() {
  const me = useSyncExternalStore(subscribeTeamUser, TeamUserRepo.current, () => null);

  const isOwner = me?.isOwner === true && me.active;
  const can = (module: ModuleKey, level: "view" | "edit" | "delete"): boolean => {
    if (!me || !me.active) return false;
    if (me.isOwner) return true;
    return me.permissions[module]?.[level] === true;
  };

  return {
    me,
    isOwner,
    canView: (module: ModuleKey) => can(module, "view"),
    canEdit: (module: ModuleKey) => can(module, "edit"),
    canDelete: (module: ModuleKey) => can(module, "delete"),
  };
}
