import { addDays, isSameDay, parseISO } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import { usePrettyDate } from 'src/composables/use-pretty-date';

const parseOrgDateStr = (raw: string): Date => parseISO(raw);

export const useAgendaDate = () => {
  const { t } = useI18n();
  const { prettyDate } = usePrettyDate();

  const prettyAgendaDate = (raw: string): string => {
    if (!raw) return '';
    const date = parseOrgDateStr(raw);
    if (Number.isNaN(date.getTime())) return '';
    if (isSameDay(date, addDays(new Date(), 1))) return t(extensionI18nKeys.orgAgendaFilterTomorrow);
    if (isSameDay(date, new Date())) return t(extensionI18nKeys.orgAgendaFilterToday);
    return prettyDate(date);
  };

  return { prettyAgendaDate };
};
