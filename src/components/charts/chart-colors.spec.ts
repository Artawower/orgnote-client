import { afterEach, expect, test } from 'vitest';
import { mixChartColors, resolveCssColor } from './chart-colors';

const roots: HTMLElement[] = [];

afterEach(() => {
  roots.forEach((root) => root.remove());
  roots.length = 0;
});

test('mixChartColors applies the requested foreground weight', () => {
  expect(mixChartColors('rgb(100, 150, 200)', 'rgb(200, 200, 200)', 0.5)).toBe(
    'rgba(150,175,200,1)',
  );
});

test('resolveCssColor reads inherited CSS variables', () => {
  const root = document.createElement('div');
  root.style.setProperty('--chart-color', 'rgb(12, 34, 56)');
  document.body.append(root);
  roots.push(root);
  expect(resolveCssColor(root, 'var(--chart-color)', '#000000')).toBe('rgb(12, 34, 56)');
});
