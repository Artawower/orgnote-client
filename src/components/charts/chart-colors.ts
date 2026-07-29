import { color } from 'echarts/core';

export const mixChartColors = (
  foreground: string,
  background: string,
  weight: number,
): string => color.lerp(weight, [background, foreground]);

export const resolveCssColor = (
  root: HTMLElement | undefined,
  expression: string,
  fallback: string,
): string => {
  const view = root?.ownerDocument.defaultView;
  if (!root || !view) return fallback;
  const probe = root.ownerDocument.createElement('span');
  probe.style.color = expression;
  probe.style.display = 'none';
  root.append(probe);
  const resolved = view.getComputedStyle(probe).color.trim();
  probe.remove();
  return resolved || fallback;
};
