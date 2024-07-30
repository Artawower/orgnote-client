import { Ref, ComputedRef } from 'vue';

export type RefLikeObject<T = Record<string, unknown>> =
  | Ref<T>
  | T
  | ComputedRef<T>
  | { value: T };

export type RefLike<T extends Record<string, unknown>> = {
  [P in keyof T]: RefLikeObject<T[P]>;
};
