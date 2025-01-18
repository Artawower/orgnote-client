import type { ThemeVariable } from 'orgnote-api';
import type { ViewType } from 'src/models/card-type';

export const CARD_TYPE_TO_BACKGROUND: { [key in ViewType]: ThemeVariable } = {
  plain: 'bg-alt2',
  info: 'blue',
  warning: 'yellow',
  danger: 'red',
  active: 'accent',
};
