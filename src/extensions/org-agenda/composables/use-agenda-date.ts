import { useI18n } from 'vue-i18n';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import { usePrettyDate } from 'src/composables/use-pretty-date';

const parseOrgDateStr = (raw: string): Date =>
  raw.includes('T') ? new Date(raw) : new Date(raw + 'T00:00:00');

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const todayDate = (): Date => new Date();

const tomorrowDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

export const useAgendaDate = () => {
  const { t } = useI18n();
  const { prettyDate } = usePrettyDate();

  const prettyAgendaDate = (raw: string): string => {
    if (!raw) return '';
    const date = parseOrgDateStr(raw);
    if (Number.isNaN(date.getTime())) return '';
    if (isSameDay(date, tomorrowDate())) return t(extensionI18nKeys.orgAgendaFilterTomorrow);
    if (isSameDay(date, todayDate())) return t(extensionI18nKeys.orgAgendaFilterToday);
    return prettyDate(date);
  };

  return { prettyAgendaDate };
};
