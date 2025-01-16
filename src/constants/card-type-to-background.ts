import type { ThemeVariable } from 'orgnote-api';
import type { CardType } from 'src/models/card-type';

export const CARD_TYPE_TO_BACKGROUND: { [key in CardType]: ThemeVariable } = {
  plain: 'bg-alt2',
  info: 'blue',
  warning: 'yellow',
  danger: 'red',
  active: 'accent',
};
