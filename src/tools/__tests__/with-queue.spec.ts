import { withQueue } from '../with-queue'; // Replace with the path to your function
import { describe, it, expect, jest, beforeEach } from 'bun:test';

// Helper async function for testing
let asyncTask: jest.Mock;

beforeEach(() => {
  asyncTask = jest.fn(async (value: number) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return value * 2;
  });
});

describe('withQueue', () => {
  it('executes the first call immediately', async () => {
    const queuedTask = withQueue(asyncTask);
    const result = await queuedTask(2);

    expect(result).toBe(4);
    expect(asyncTask).toHaveBeenCalledTimes(1);
  });

  it('waits for the first call to finish before executing the second', async () => {
    const queuedTask = withQueue(asyncTask);

    const firstCall = queuedTask(3);
    const secondCall = queuedTask(4);

    const [firstResult, secondResult] = await Promise.all([
      firstCall,
      secondCall,
    ]);

    expect(firstResult).toBe(6);
    expect(secondResult).toBe(8);
    expect(asyncTask).toHaveBeenCalledTimes(2);
  });

  it('returns the second call’s result for all subsequent calls in the queue', async () => {
    const queuedTask = withQueue(asyncTask);

    const firstCall = queuedTask(5);
    const secondCall = queuedTask(6);
    const thirdCall = queuedTask(6); // Should return the result of the second call (6)

    const [firstResult, secondResult, thirdResult] = await Promise.all([
      firstCall,
      secondCall,
      thirdCall,
    ]);

    expect(firstResult).toBe(10); // 5 * 2
    expect(secondResult).toBe(12); // 6 * 2
    expect(thirdResult).toBe(12); // Also 6 * 2, returns the result of the second call
    expect(asyncTask).toHaveBeenCalledTimes(2);
  });

  it('executes the next call after all previous ones complete', async () => {
    const queuedTask = withQueue(asyncTask);

    const firstCall = queuedTask(1);
    const secondCall = queuedTask(2);
    const thirdCall = queuedTask(3);

    const [firstResult, secondResult, thirdResult] = await Promise.all([
      firstCall,
      secondCall,
      thirdCall,
    ]);

    expect(firstResult).toBe(2); // 1 * 2
    expect(secondResult).toBe(4); // 2 * 2
    expect(thirdResult).toBe(4); // 3 * 2
    expect(asyncTask).toHaveBeenCalledTimes(2);
  });
});
