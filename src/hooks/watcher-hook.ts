interface DecoratedFunction {
  before: Function;
  after: Function;
  fn: Function;
}

// TODO: finish this black magic -_-
export function useWatcherHook() {
  const scopedFunctions: {
    [key: string]: { [key: string]: DecoratedFunction };
  } = {};

  const withScope = (scopeName: string) => {
    initScope(scopeName);
    return {
      register: (funcName: string, fn: Function): void => {
        const before = () => {};
        const after = () => {};
        const decoratedFn = () => {
          before();
          fn();
          after();
        };
        scopedFunctions[scopeName][funcName] = decoratedFn;
      },
    };
  };

  const initScope = (scopeName: string) => {
    if (!scopedFunctions[scopeName]) {
      scopedFunctions[scopeName] = {};
    }
  };

  const watch = (scopeName: string, funcName: string): DecoratedFunction => {
    const decoratedFn = scopedFunctions[scopeName]?.[funcName];
    if (!decoratedFn) {
      throw new Error(`Function ${funcName} not found in scope ${scopeName}`);
    }
    return decoratedFn;
  };

  return {
    withScope,
    watch,
  };
}
