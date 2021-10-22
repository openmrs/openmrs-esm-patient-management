export enum StateTypes {
  IDLE,
  SEARCH,
  SEARCH_WITH_RESULTS,
}

export interface IdleState {
  type: StateTypes.IDLE;
}

export interface SearchState {
  type: StateTypes.SEARCH;
  searchTerm: string;
}

export interface SearchStateWithResults extends Omit<SearchState, 'type'> {
  type: StateTypes.SEARCH_WITH_RESULTS;
  results: Array<any>;
  enter: Object;
}

export type ViewState = {
  type: StateTypes;
  searchTerm?: string;
  results?: Array<any>;
  enter?: Object;
}
