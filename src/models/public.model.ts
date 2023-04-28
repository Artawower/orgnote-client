export type PublicInterface<T> = {
  [P in keyof T]: T[P];
};
