interface LoadingState {
  type: 'LOADING';
}

interface LoadedState {
  type: 'LOADED';
  date: Date;
}

interface ReloadingState {
  type: 'RELOADING';
  date: Date;
}

interface LoadingErrorState {
  type: 'LOADING_ERROR';
  error: Error;
}

interface ReloadingErrorState {
  type: 'RELOADING_ERROR';
  error: Error;
  date: Date;
}

export type LoadState = LoadingState | LoadedState | LoadingErrorState | ReloadingState | ReloadingErrorState;
export type LoadStateType = LoadState['type'];

export interface OfflinePatient {
  // id?: number;
  uuid: string;
  name: string;
  lastUpdate: Record<string, LoadState>;
  interestedUsers: Array<string>;
}
