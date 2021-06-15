export enum LOAD_STATE_TYPE {
  NOT_LOADED,
  LOADING,
  LOADED,
  RELOADING,
  LOADING_ERROR,
  RELOADING_ERROR,
}

interface LoadingState {
  type: LOAD_STATE_TYPE.LOADING;
}

interface LoadedState {
  type: LOAD_STATE_TYPE.LOADED;
  date: Date;
}

interface ReloadingState {
  type: LOAD_STATE_TYPE.RELOADING;
  date: Date;
}

interface LoadingErrorState {
  type: LOAD_STATE_TYPE.LOADING_ERROR;
  error: Error;
}

interface ReloadingErrorState {
  type: LOAD_STATE_TYPE.RELOADING_ERROR;
  error: Error;
  date: Date;
}

export type LoadState = LoadingState | LoadedState | LoadingErrorState | ReloadingState | ReloadingErrorState;

export interface OfflinePatient {
  id?: number;
  uuid: string;
  name: string;
  lastUpdate: Record<string, LoadState>;
  interestedUsers: Array<string>;
}
