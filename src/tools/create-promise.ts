export const createPromise = <T = unknown>(): [
  Promise<T>,
  (value: T) => void
] => {
  let resolver: (value: T) => void;
  return [
    new Promise<T>((resolve) => {
      resolver = resolve;
    }),
    resolver,
  ];
};
