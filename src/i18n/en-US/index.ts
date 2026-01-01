import { I18N } from 'orgnote-api';

const eng: Record<string, string> = {
  [I18N.LOADING_MESSAGE_1]: 'loading...',
  [I18N.LOADING_MESSAGE_2]: 'fetching data...',
  [I18N.LOADING_MESSAGE_3]: 'almost there...',
  [I18N.LOADING_MESSAGE_4]: 'compiling magic...',
  [I18N.LOADING_MESSAGE_5]: 'just a moment...',
  [I18N.SYSTEM]: 'system',
  [I18N.LANGUAGE]: 'language',
  [I18N.CLEAR_ALL_LOCAL_DATA]: 'clear all local data',
  [I18N.DELETE_ALL_NOTES]: 'delete all notes',
  [I18N.REMOVE_ACCOUNT]: 'remove account',
  [I18N.SEARCH]: 'Search',
  [I18N.CRITICAL_ERROR]: 'Critical Error',
  [I18N.ERROR_DESCRIPTION]: 'The application encountered an unexpected error and cannot continue normally.',
  [I18N.RELOAD]: 'Reload',
  [I18N.COPY_LOG]: 'Copy Log',
  [I18N.BACK_HOME]: 'Back to Home',
  [I18N.ERROR_DETAILS]: 'Error Details',
  [I18N.NO_ERRORS]: 'No errors recorded',
  [I18N.BOOT_ERRORS]: 'Boot Errors (Fallback)',
  [I18N.APP_ERRORS]: 'Application Errors',
  [I18N.CONFIRM_CLEAR_LOGS]: 'Are you sure you want to clear logs?',
  [I18N.SYSTEM_INFO]: 'System Info',

  [I18N.THEME_MODE_LIGHT]: 'Light',
  [I18N.THEME_MODE_DARK]: 'Dark',
  [I18N.THEME_MODE_AUTO]: 'Auto',
  [I18N.THEME_MODE_LIGHT_DESCRIPTION]: 'Always use light theme',
  [I18N.THEME_MODE_DARK_DESCRIPTION]: 'Always use dark theme',
  [I18N.THEME_MODE_AUTO_DESCRIPTION]: 'Follow system preference',
  [I18N.SELECT_THEME_MODE_PLACEHOLDER]: 'Select theme mode',

  [I18N.AUTH_IDENTIFYING]: 'Wait a second, we are trying to identify you',
  [I18N.AUTH_INVALID_CALLBACK_PARAMS]: 'Invalid authentication callback parameters',
  [I18N.AUTH_RETURN_TO_MOBILE]: 'Return to mobile app',
  [I18N.AUTH_LOGIN_REQUIRED]: 'To activate the license key you need to log in',
  [I18N.AUTH_ACTIVATING]: 'Wait a second, we are trying to activate your account',
  [I18N.AUTH_ENTER_ACTIVATION_KEY]: 'Enter your activation key',
  [I18N.SUBSCRIPTION_KEY]: 'Subscription key',
  [I18N.ACTIVATE]: 'Activate',
  [I18N.TABS_COUNT]: 'no tabs | {count} tab | {count} tabs',

  [I18N.TOC_NO_ACTIVE_DOCUMENT]: 'No active document',
  [I18N.TOC_NO_HEADLINES_FOUND]: 'No headlines found',
};

export default eng;
