import type { TooltipComponentOption } from 'echarts/components';
import type {
  CalendarHeatmapLabels,
  CalendarHeatmapPalette,
} from './calendar-heatmap-types';

export const isCalendarHeatmapValue = (value: unknown): value is [string, number] =>
  Array.isArray(value) && typeof value[0] === 'string' && typeof value[1] === 'number';

const resolveTooltipValue = (params: unknown): [string, number] | undefined => {
  const candidate = Array.isArray(params) ? params[0] : params;
  if (!candidate || typeof candidate !== 'object') return undefined;
  const value = Reflect.get(candidate, 'value');
  return isCalendarHeatmapValue(value) ? value : undefined;
};

export const formatCalendarHeatmapTooltip = (
  params: unknown,
  labels: CalendarHeatmapLabels,
  locale: string,
): string => {
  const value = resolveTooltipValue(params);
  if (!value) return '';
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(`${value[0]}T00:00:00`),
  );
  const formattedValue = value[1] > 0 ? labels.formatValue?.(value[1]).trim() : undefined;
  return formattedValue ? `${date}: ${formattedValue}` : date;
};

export const createCalendarHeatmapTooltip = (
  labels: CalendarHeatmapLabels,
  locale: string,
  palette: CalendarHeatmapPalette,
): TooltipComponentOption => ({
  backgroundColor: palette.tooltipBackground,
  borderColor: palette.tooltipBorder,
  confine: true,
  renderMode: 'richText',
  textStyle: { color: palette.tooltipText },
  trigger: 'item',
  formatter: (params: unknown) => formatCalendarHeatmapTooltip(params, labels, locale),
});
