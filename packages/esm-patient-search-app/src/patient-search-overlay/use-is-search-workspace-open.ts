import { getGlobalStore, useStore } from '@openmrs/esm-framework';

/** The workspace group that hosts the start visit workspace (see routes.json). */
const searchWorkspaceGroupName = 'patient-search-app';

// The workspace framework keeps its opened group and windows in the global store named 'workspace2'.
interface WorkspaceStoreState {
  openedGroup: { groupName: string } | null;
  openedWindows: Array<unknown>;
}
const workspaceStore = getGlobalStore<WorkspaceStoreState>('workspace2', { openedGroup: null, openedWindows: [] });

/**
 * Whether the start visit workspace (hosted in the search app's own workspace group) is currently open.
 * The group stays opened after its last workspace closes, so this looks for an opened window as well.
 *
 * Why this exists: the tablet search overlay is `position: fixed` with `z-index: 9999` (see overlay.scss),
 * which covers the whole screen, including the start visit workspace (`z-index: 100` in esm-styleguide's
 * workspace2.module.scss). The overlay and its close button hide themselves while this returns true.
 *
 * Caveat: this reads the framework's private 'workspace2' global store, and relies on its name and its
 * `openedGroup` / `openedWindows` fields, as well as the group name in routes.json
 * ('patient-search-app', keep the two in sync). If any of them change, this quietly returns false and the
 * overlay covers the workspace again, with no error.
 *
 * TODO: replace this with one of the following, and delete this file:
 * 1. Raise the z-index of the workspace container above the overlay, scoped to the `overlay: true` variant
 *    of the container (`.overlay` in esm-styleguide's workspace-windows-and-menu.module.scss) rather than to
 *    all workspaces, so that it doesn't end up above modals / snackbars in other apps. The overlay then
 *    stays mounted behind the workspace and nothing needs to be hidden. Needs an esm-core change, and
 *    must be checked in the tablet layout, since parent stacking contexts may defeat it.
 * 2. Ask esm-core for a public hook, e.g. `useIsWorkspaceGroupOpen(groupName)`, so that this doesn't
 *    depend on the private store.
 */
export function useIsSearchWorkspaceOpen() {
  return useStore(
    workspaceStore,
    (state) => state.openedGroup?.groupName === searchWorkspaceGroupName && state.openedWindows.length > 0,
  );
}
