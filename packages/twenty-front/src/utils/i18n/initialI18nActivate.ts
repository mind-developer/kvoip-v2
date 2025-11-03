import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
/* @kvoip-woulz proprietary:begin */
import { APP_LOCALES, USER_VISIBLE_LOCALES } from 'twenty-shared/translations';
/* @kvoip-woulz proprietary:end */
import { isDefined, isValidLocale, normalizeLocale } from 'twenty-shared/utils';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const initialI18nActivate = () => {
  const urlLocale = fromUrl('locale');
  const storageLocale = fromStorage('locale');
  const navigatorLocale = fromNavigator();

  /* @kvoip-woulz proprietary:begin */
  let locale: keyof typeof APP_LOCALES = USER_VISIBLE_LOCALES['pt-BR'];
  /* @kvoip-woulz proprietary:end */

  const normalizedUrlLocale = isDefined(urlLocale)
    ? normalizeLocale(urlLocale)
    : null;
  const normalizedStorageLocale = isDefined(storageLocale)
    ? normalizeLocale(storageLocale)
    : null;
  const normalizedNavigatorLocale = isDefined(navigatorLocale)
    ? normalizeLocale(navigatorLocale)
    : null;

  /* @kvoip-woulz proprietary:begin */
  // Only allow user-visible locales to be set by user
  const isUserVisibleLocale = (loc: string): boolean => {
    return Object.values(USER_VISIBLE_LOCALES).includes(loc as any);
  };
  /* @kvoip-woulz proprietary:end */

  if (
    isDefined(normalizedUrlLocale) &&
    isValidLocale(normalizedUrlLocale) &&
    isUserVisibleLocale(normalizedUrlLocale)
  ) {
    locale = normalizedUrlLocale;
    try {
      localStorage.setItem('locale', normalizedUrlLocale);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
  } else if (
    isDefined(normalizedStorageLocale) &&
    isValidLocale(normalizedStorageLocale) &&
    isUserVisibleLocale(normalizedStorageLocale)
  ) {
    locale = normalizedStorageLocale;
  } else if (
    isDefined(normalizedNavigatorLocale) &&
    isValidLocale(normalizedNavigatorLocale) &&
    isUserVisibleLocale(normalizedNavigatorLocale)
  ) {
    locale = normalizedNavigatorLocale;
  }

  dynamicActivate(locale);
};
