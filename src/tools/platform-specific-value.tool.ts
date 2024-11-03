import { Platform } from 'quasar';

export function platformSpecificValue<TData = unknown>(datasource: {
  data?: TData;
  nativeMobile?: TData;
  server?: TData;
  mobile?: TData;
  desktop?: TData;
}): TData {
  if (process.env.SERVER) {
    return datasource.server ?? datasource.data;
  }

  if (!process.env.CLIENT) {
    return datasource.data;
  }

  const datasourceKeys = ['desktop', 'mobile', 'nativeMobile'] as const;

  for (const platform of datasourceKeys) {
    if (Platform.is[platform]) {
      return datasource[platform] ?? datasource.data;
    }
  }

  return datasource.data;
}
