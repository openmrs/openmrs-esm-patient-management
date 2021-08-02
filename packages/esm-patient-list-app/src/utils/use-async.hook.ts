import { useState, useCallback, useEffect, DependencyList, useRef } from 'react';

/** Encapsulates data passed to every asynchronous function used with {@link useAsync}. */
export interface AsyncFnData {
  /**
   * An {@link AbortController} which will be aborted when the owning component is unmounted or
   * when a refetch is triggered.
   */
  abortController: AbortController;
}

export type AsyncFn<TArgs, TResult> = TArgs extends undefined
  ? (data: AsyncFnData) => Promise<TResult>
  : (args: TArgs, data: AsyncFnData) => Promise<TResult>;

export type RefetchAsyncFn<TArgs, TResult> = TArgs extends undefined
  ? () => Promise<TResult>
  : (args: TArgs) => Promise<TResult>;

export type UseAsyncStatus = 'idle' | 'loading' | 'fetching' | 'success' | 'error';

/**
 * The data returned by the {@link useAsync} and {@link useAsyncQuery} hooks.
 * Provides details about the asynchronous function's lifecycle and its returned data or thrown error
 * and functions for changing that state.
 */
export interface UseAsyncState<TArgs, TResult> {
  status: UseAsyncStatus;
  isIdle: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: TResult;
  error?: any;
  refetch: RefetchAsyncFn<TArgs, TResult>;
}

/**
 * Wraps an asynchronous function which receives no parameters and asynchronously produces a result
 * of type {@link TResult}.
 * The function is immediately invoked.
 *
 * See {@link useAsync} for additional details.
 * @param fn An asynchronous function whose lifecycle should be wrapped by this hook.
 * @param deps Dependencies of the function.
 * @returns An {@link UseAsyncState} which represents the asynchronous function's lifecycle.
 */
export function useAsyncQuery<TResult = unknown>(fn: AsyncFn<undefined, TResult>, deps: DependencyList = []) {
  const state = useAsync<undefined, TResult>(fn, deps);
  const refetch = state.refetch;

  useEffect(() => {
    refetch().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/**
 * Wraps an asynchronous function which receives an argument of type {@link TArgs} and asynchronously
 * produces a result of type {@link TResult}.
 * Declaratively provides details about the function's execution lifecycle and its returned data
 * or thrown error.
 *
 * Inspired by https://usehooks.com/useAsync but extended with additional functionality like
 * refetching or cancellation.
 * @param fn An asynchronous function whose lifecycle should be wrapped by this hook.
 * @param deps Dependencies of the function.
 * @returns An {@link UseAsyncState} which represents the asynchronous function's lifecycle.
 */
export function useAsync<TArgs = unknown, TResult = unknown>(
  fn: AsyncFn<TArgs, TResult>,
  deps: DependencyList = [],
): UseAsyncState<TArgs, TResult> {
  const abortController = useRef(new AbortController());
  const isMounted = useRef(true);
  const [status, setStatus] = useState<UseAsyncStatus>('idle');
  const [data, setData] = useState<any>(undefined);
  const [error, setError] = useState<any>(undefined);

  const refetch = useCallback(async (...args) => {
    abortController.current.abort();
    abortController.current = new AbortController();
    setStatus((previousStatus) => (previousStatus === 'idle' ? 'loading' : 'fetching'));

    try {
      const options: AsyncFnData = { abortController: abortController.current };
      const newData =
        args.length === 0 ? await (fn as AsyncFn<undefined, TResult>)(options) : await fn(args[0], options);

      if (isMounted.current) {
        setStatus('success');
        setData(newData);
        setError(undefined);
      }
    } catch (e) {
      if (isMounted.current) {
        setStatus('error');
        setError(e);
      }

      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortController.current.abort();
    };
  }, []);

  return {
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isFetching: status === 'fetching',
    isSuccess: status === 'success',
    isError: status === 'error',
    data,
    error,
    refetch: refetch as unknown as RefetchAsyncFn<TArgs, TResult>,
  };
}
