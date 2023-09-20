import { isReactive, toRaw } from 'vue';

export function isObject(value: unknown): boolean {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
}

export function getRawData<T>(data: T): T {
  return isReactive(data) ? toRaw(data) : data;
}

export function toDeepRaw<T>(data: T): T {
  const rawData = getRawData<T>(data);

  for (const key in rawData) {
    const value = rawData[key];

    if (!isObject(value) && !Array.isArray(value)) {
      continue;
    }

    rawData[key] = toDeepRaw<typeof value>(value);
  }

  return rawData; // much better: structuredClone(rawData)
}
