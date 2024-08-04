import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { toSentence } from './case-converter';
import { ConfigScheme } from 'src/constants/default-config.constant';

type MenuItemValue = string | number | boolean | Array<unknown>;

export interface MenuItemBuildConfig<TData = Record<string, unknown>> {
  configScheme?: ConfigScheme;
  excludeKeys?: Array<keyof TData>;
  includeKeys?: Array<keyof TData>;
}

export function buildMenuItems<TData extends Record<string, MenuItemValue>>(
  settings: TData,
  config?: MenuItemBuildConfig
): MenuItemProps[] {
  return Object.keys(settings).reduce((acc, key) => {
    if (isMenuItemKeyExcluded(key, config)) {
      return acc;
    }

    const item = settings[key];
    const itemConfig = config?.configScheme?.[key];
    const defaultConfig = itemConfig?.values;

    const isMultipleItems = defaultConfig instanceof Array;

    if (!isMultipleItems) {
      acc.push(createMenuItemProps({ key, settings, itemConfig, item }));
      return acc;
    }

    defaultConfig.forEach((c) => {
      const label = c as string;
      acc.push(
        createMenuItemProps({
          key,
          settings,
          itemConfig,
          item,
          label,
          type: 'select',
        })
      );
    });

    return acc;
  }, []);
}

function isMenuItemKeyExcluded(key: string, config: MenuItemBuildConfig) {
  const excludedKeys = config?.excludeKeys?.includes(key);
  const notIncludedKeys =
    config?.includeKeys && !config.includeKeys.includes(key);
  return excludedKeys || notIncludedKeys;
}

function createMenuItemProps<
  TData extends Record<string, MenuItemValue>,
>(params: {
  key: string;
  settings: TData;
  itemConfig: ConfigScheme[string];
  item: MenuItemValue;
  label?: string;
  type?: MenuItemProps['type'];
}): Partial<MenuItemProps> {
  return {
    label: params.label ?? toSentence(params.key),
    reactiveKey: params.key,
    reactivePath: params.settings,
    type:
      params.type ?? params.itemConfig?.type ?? getMenuTypeByValue(params.item),
  };
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
