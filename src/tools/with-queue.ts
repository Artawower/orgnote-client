/*
 * Add task to queue, if еру queue is full, return the last promise
 * it does not take into the account the actual arguments
 */
export function withQueue<
  F extends (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>,
>(fn: F): (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>> {
  // let processingPromise: Promise<boolean> | null = null;
  let awaitResolvers: ((
    arg0: ReturnType<F> | PromiseLike<ReturnType<F>>
  ) => void)[] = [];
  let isProcessing: Promise<void>;
  let queuedFn: Promise<ReturnType<F>>;

  const queueWrapper = async (
    ...args: Parameters<F>
  ): Promise<Awaited<ReturnType<F>>> => {
    if (queuedFn) {
      const { promise, resolve } = Promise.withResolvers<ReturnType<F>>();
      awaitResolvers.push(resolve);
      const res = await promise;
      return res;
    }

    if (isProcessing) {
      queuedFn = fn(...args);
      await isProcessing;
      const res = await queuedFn;
      queuedFn = null;
      awaitResolvers.forEach((resolve) => resolve(res));
      awaitResolvers = [];

      return res;
    }

    // If first call
    const { resolve, promise } = Promise.withResolvers<void>();
    isProcessing = promise;
    const res = await fn(...args);
    resolve();
    isProcessing = null;
    return res;
  };

  return queueWrapper;
}
