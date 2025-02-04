import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';
import { APP_LOCALES } from 'twenty-shared';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['fr', 'en', 'pt', 'de', 'it', 'es', 'zh'],
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
});
