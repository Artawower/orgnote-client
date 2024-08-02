import { buildMenuItems, MenuItemBuildConfig } from '../config-menu-builder';

describe('buildMenuItems', () => {
  // Mock implementations
  test('should generate menu items for all keys when no config is provided', () => {
    const settings = {
      name: 'John Doe',
      age: 30,
      active: true,
    };

    const result = buildMenuItems(settings);

    expect(result).toEqual([
      {
        label: 'name',
        reactiveKey: 'name',
        reactivePath: settings,
        type: 'text',
      },
      {
        label: 'age',
        reactiveKey: 'age',
        reactivePath: settings,
        type: 'text',
      },
      {
        label: 'active',
        reactiveKey: 'active',
        reactivePath: settings,
        type: 'toggle',
      },
    ]);
  });

  test('should exclude keys specified in excludeKeys', () => {
    const settings = {
      name: 'John Doe',
      age: 30,
      active: true,
    };

    const config: MenuItemBuildConfig = {
      excludeKeys: ['age'],
    };

    const result = buildMenuItems(settings, config);

    expect(result).toEqual([
      {
        label: 'name',
        reactiveKey: 'name',
        reactivePath: settings,
        type: 'text',
      },
      {
        label: 'active',
        reactiveKey: 'active',
        reactivePath: settings,
        type: 'toggle',
      },
    ]);
  });

  test('should include only keys specified in includeKeys', () => {
    const settings = {
      name: 'John Doe',
      age: 30,
      active: true,
    };

    const config = {
      includeKeys: ['name', 'active'],
    };

    const result = buildMenuItems(settings, config);

    expect(result).toEqual([
      {
        label: 'name',
        reactiveKey: 'name',
        reactivePath: settings,
        type: 'text',
      },
      {
        label: 'active',
        reactiveKey: 'active',
        reactivePath: settings,
        type: 'toggle',
      },
    ]);
  });

  test('should handle multiple items configuration', () => {
    const settings = {
      category: 'fruit',
    };

    const config = {
      configScheme: {
        category: {
          values: ['Apple', 'Banana', 'Orange'],
        },
      },
    };

    const result = buildMenuItems(settings, config);

    expect(result).toEqual([
      {
        label: 'Apple',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
      {
        label: 'Banana',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
      {
        label: 'Orange',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
    ]);
  });

  test('should handle combination of includeKeys and excludeKeys', () => {
    const settings = {
      name: 'John Doe',
      age: 30,
      active: true,
      category: 'Apple',
    };

    const config: MenuItemBuildConfig = {
      excludeKeys: ['age'],
      includeKeys: ['name', 'category'],
      configScheme: {
        category: {
          values: ['Apple', 'Banana', 'Orange'],
        },
      },
    } as const;

    const result = buildMenuItems(settings, config);

    expect(result).toEqual([
      {
        label: 'name',
        reactiveKey: 'name',
        reactivePath: settings,
        type: 'text',
      },
      {
        label: 'Apple',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
      {
        label: 'Banana',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
      {
        label: 'Orange',
        reactiveKey: 'category',
        reactivePath: settings,
        type: 'select',
      },
    ]);
  });
});
