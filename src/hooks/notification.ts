import { useQuasar } from 'quasar';
import { mockServer } from 'src/tools';
import { useI18n } from 'vue-i18n';

// TODO: master move to API
type NotificationLevel = 'info' | 'error' | 'warning';

interface NotificationConfig {
  group?: boolean;
  timeout?: number;
  level?: NotificationLevel;
  caption?: string;
}

// TODO: create store for preserving history of notifications
export function useNotifications() {
  const $q = useQuasar();
  const locale = useI18n();

  const colors: { [key in NotificationLevel]: string } = {
    info: null,
    error: 'red',
    warning: 'yellow',
  };
  // TODO: master this method should be wrapped over internal API
  const notify = (
    message: string,
    { caption, group, level = 'info', timeout }: NotificationConfig = {}
  ) => {
    return $q.notify({
      caption,
      group,
      color: colors[level],
      message,
      timeout,
      position: $q.platform.is.mobile ? 'bottom' : 'bottom-right',
      closeBtn: locale.t('close'),
    });
  };

  const error = (message: string) => {
    notify(message, {
      level: 'error',
      group: true,
    });
  };

  return {
    notify: mockServer(notify),
    error,
  };
}
