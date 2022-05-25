/** Adapted from the esm-patient-chart/esm-common-lib/workspaces */
import { ExtensionRegistration, getGlobalStore, navigate, translateFrom } from '@openmrs/esm-framework';

import { getExtensionRegistration } from '@openmrs/esm-framework/src/internal';
import _i18n from 'i18next';

type WorkspaceWindowState = 'minimized' | 'maximized' | 'hidden' | 'reopened' | 'normal';

export interface Prompt {
  title: string;
  body: string;
  confirmText?: string;
  onConfirm(): void;
  cancelText?: string;
}

export interface WorkspaceStoreState {
  patientUuid: string | null;
  openWorkspaces: Array<OpenWorkspace>;
  prompt: Prompt | null;
}

export interface OpenWorkspace extends WorkspaceRegistration {
  additionalProps: object;
  closeWorkspace(promptBeforeClosing?: boolean): void;
  closeWorkspace(): void;
  promptBeforeClosing(testFcn: () => boolean): void;
}

export interface WorkspaceRegistration {
  name: string;
  title: string;
  load(): Promise<any>;
  type?: string;
  preferredWindowSize?: WorkspaceWindowState;
}

let registeredWorkspaces: Record<string, WorkspaceRegistration> = {};

/**
 * This exists for compatibility with the old way of registering
 * workspaces (as extensions).
 *
 * @param name of the workspace
 */
function getWorkspaceRegistration(name: string): WorkspaceRegistration {
  if (registeredWorkspaces[name]) {
    return registeredWorkspaces[name];
  } else {
    const workspaceExtension = getExtensionRegistration(name);
    if (workspaceExtension) {
      return {
        name: workspaceExtension.name,
        title: getTitleFromExtension(workspaceExtension),
        preferredWindowSize: workspaceExtension.meta?.screenSize ?? 'normal',
        load: workspaceExtension.load,
        type: workspaceExtension.meta?.type ?? 'form',
      };
    } else {
      throw new Error(`No workspace named '${name}' has been registered.`);
    }
  }
}

function getTitleFromExtension(ext: ExtensionRegistration) {
  const title = ext?.meta?.title;
  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }
  return ext.name;
}

/**
 * Given a workspace specified by its name:
 *
 * - If no workspaces are open, or if no other workspaces with the same type are open,
 *   it will be opened and focused.
 * - If a workspace with the same name is already open, it will be displayed/focused,
 *   if it was not already.
 * - If another workspace with the same type is open, a confirmation modal will pop up a
 *   warning about closing the currently open workspace.
 *
 * Note that this function just manipulates the workspace store. The UI logic based on
 * the workspace store is contained in esm-patient-chart-app.
 *
 * @param name The name of the workspace to launch
 * @param additionalProps Props to pass to the workspace component being launched
 */
export function launchPatientWorkspace(name: string, additionalProps?: object) {
  const store = getWorkspaceStore();
  const state = store.getState();
  const workspace = getWorkspaceRegistration(name);
  const newWorkspace = {
    ...workspace,
    closeWorkspace: (ignoreChanges = true) => closeWorkspace(name, ignoreChanges),
    promptBeforeClosing: (testFcn) => promptBeforeClosing(name, testFcn),
    additionalProps,
  };
  const existingWorkspaces = state.openWorkspaces.filter((w) => w.type == newWorkspace.type);
  if (existingWorkspaces.length == 0) {
    store.setState({ ...state, openWorkspaces: [newWorkspace, ...state.openWorkspaces] });
  } else {
    const existingIdx = state.openWorkspaces.findIndex((w) => w.name == name);
    const promptCheckFcn = getPromptBeforeClosingFcn(existingWorkspaces[0].name);
    if (existingIdx >= 0) {
      const restOfWorkspaces = [...state.openWorkspaces];
      restOfWorkspaces.splice(existingIdx, 1);
      state.openWorkspaces[existingIdx].additionalProps = newWorkspace.additionalProps;
      const openWorkspaces = [state.openWorkspaces[existingIdx], ...restOfWorkspaces];
      store.setState({ ...state, openWorkspaces });
    } else if (!promptCheckFcn || promptCheckFcn()) {
      const currentName = existingWorkspaces[0].title ?? existingWorkspaces[0].name;
      const prompt: Prompt = {
        title: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'activeFormWarning',
          'There is an active form open in the workspace',
        ),
        body: translateFrom(
          '@openmrs/esm-patient-chart-app',
          'workspaceModalText',
          `Launching a new form in the workspace could cause you to lose unsaved work on the ${currentName} form.`,
          { formName: currentName },
        ),
        onConfirm: () => {
          const state = store.getState();
          store.setState({
            openWorkspaces: [newWorkspace, ...state.openWorkspaces.filter((w) => w.type != newWorkspace.type)],
            prompt: null,
          });
        },
        confirmText: translateFrom('@openmrs/esm-patient-chart-app', 'openAnyway', 'Open anyway'),
      };
      store.setState({ ...state, prompt });
    } else {
      const state = store.getState();
      store.setState({
        ...state,
        openWorkspaces: [newWorkspace, ...state.openWorkspaces.filter((w) => w.type != newWorkspace.type)],
      });
    }
  }
}

const promptBeforeClosingFcns = {};

export function promptBeforeClosing(workspaceName: string, testFcn: () => boolean) {
  promptBeforeClosingFcns[workspaceName] = testFcn;
}

export function getPromptBeforeClosingFcn(workspaceName: string) {
  return promptBeforeClosingFcns[workspaceName];
}

export function closeWorkspace(name: string, ignoreChanges: boolean) {
  const store = getWorkspaceStore();
  const promptCheckFcn = getPromptBeforeClosingFcn(name);
  if (!ignoreChanges && promptCheckFcn && promptCheckFcn()) {
    const prompt: Prompt = {
      title: translateFrom('@openmrs/esm-patient-chart-app', 'unsavedChangesTitleText', 'Unsaved Changes'),
      body: translateFrom(
        '@openmrs/esm-patient-chart-app',
        'unsavedChangeText',
        `You have unsaved changes in the side panel. Do you want to discard these changes?`,
      ),
      onConfirm: () => {
        const state = store.getState();
        store.setState({ ...state, prompt: null, openWorkspaces: state.openWorkspaces.filter((w) => w.name != name) });
      },
      confirmText: translateFrom('@openmrs/esm-patient-chart-app', 'discard', 'Discard'),
    };
    store.setState({ ...store.getState(), prompt });
  } else {
    const state = store.getState();
    store.setState({ ...state, openWorkspaces: state.openWorkspaces.filter((w) => w.name != name) });
  }
}

const initialState = { patientUuid: null, openWorkspaces: [], prompt: null };
export function getWorkspaceStore() {
  return getGlobalStore<WorkspaceStoreState>('workspace', initialState);
}

/**
 * @internal
 * Just for testing.
 */
export function resetWorkspaceStore() {
  getWorkspaceStore().setState(initialState);
}
/**
 * Tells the workspace system about a workspace. Should be called at the top level
 * of a module which will be loaded whenever the patient chart loads.
 */
export function registerWorkspace(workspace: WorkspaceRegistration) {
  registeredWorkspaces[workspace.name] = {
    ...workspace,
    preferredWindowSize: workspace.preferredWindowSize ?? 'normal',
    type: workspace.type ?? 'form',
  };
}
