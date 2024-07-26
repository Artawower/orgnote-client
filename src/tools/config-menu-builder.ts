import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { toSentence } from './case-converter';
import { ConfigScheme } from 'src/constants/default-config.constant';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildMenuItems<
  TData extends Record<string, string | number | boolean | Array<unknown>>,
>(
  settings: TData,
  config?: {
    configScheme?: ConfigScheme;
    excludeKeys?: Array<keyof TData>;
    includeKeys?: Array<keyof TData>;
  }
): MenuItemProps[] {
  return Object.keys(settings).reduce((acc, key) => {
    const excludedKeys = config?.excludeKeys?.includes(key);
    const notIncludedKeys =
      config?.includeKeys && !config.includeKeys.includes(key);
    if (excludedKeys || notIncludedKeys) {
      return acc;
    }
    const item = settings[key];

    const itemConfig = config?.configScheme?.[key];
    const defaultConfig = itemConfig?.values;
    console.log(
      '✎: [line 25][config-menu-builder.ts] defaultConfig: ',
      defaultConfig
    );
    const isMultipleItems = defaultConfig instanceof Array;

    if (!isMultipleItems) {
      const menuButtonProps: Partial<MenuItemProps> = {
        label: toSentence(key),
        reactiveKey: key,
        reactivePath: settings,
        type: itemConfig?.type ?? getMenuTypeByValue(item),
      };
      acc.push(menuButtonProps);
      return acc;
    }

    defaultConfig.forEach((c) => {
      const menuButtonProps: Partial<MenuItemProps> = {
        label: c as string,
        reactiveKey: key,
        reactivePath: settings,
        type: 'select',
      };
      acc.push(menuButtonProps);
    });

    return acc;
  }, []);
}

function getMenuTypeByValue(
  value: string | Array<unknown> | number | boolean
): MenuItemProps['type'] {
  if (typeof value === 'boolean') {
    return 'toggle';
  }
  if (value instanceof Array) {
    return 'select';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return 'text';
  }
  return 'action';
}
