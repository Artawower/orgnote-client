import { mixChartColors, resolveCssColor } from './chart-colors';
import type { CalendarHeatmapPalette } from './calendar-heatmap-types';

const FALLBACK_BACKGROUND = 'rgb(255, 255, 255)';
const FALLBACK_FOREGROUND = 'rgb(31, 35, 40)';
const FALLBACK_MUTED = 'rgb(89, 99, 110)';
const FALLBACK_ACCENT = 'rgb(130, 80, 223)';
const FALLBACK_SURFACE = 'rgb(246, 248, 250)';
const FALLBACK_BORDER = 'rgb(208, 215, 222)';

export const createCalendarHeatmapPalette = (
  root: HTMLElement | undefined,
): CalendarHeatmapPalette => {
  const background = resolveCssColor(root, 'var(--bg)', FALLBACK_BACKGROUND);
  const foreground = resolveCssColor(root, 'var(--fg)', FALLBACK_FOREGROUND);
  const muted = resolveCssColor(root, 'var(--fg-muted)', FALLBACK_MUTED);
  const accent = resolveCssColor(root, 'var(--accent)', FALLBACK_ACCENT);
  const surface = resolveCssColor(root, 'var(--bg-alt)', FALLBACK_SURFACE);
  const border = resolveCssColor(root, 'var(--border-color)', FALLBACK_BORDER);
  return {
    background,
    empty: mixChartColors(foreground, background, 0.08),
    levels: [
      mixChartColors(accent, background, 0.25),
      mixChartColors(accent, background, 0.45),
      mixChartColors(accent, background, 0.7),
      accent,
    ],
    label: muted,
    selectedBorder: foreground,
    tooltipBackground: surface,
    tooltipBorder: border,
    tooltipText: foreground,
  };
};
