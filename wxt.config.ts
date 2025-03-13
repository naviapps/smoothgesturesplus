import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    default_locale: 'en',
    permissions: ['bookmarks', 'downloads', 'sessions', 'storage', 'tabs'],
    optional_permissions: ['nativeMessaging'],
    host_permissions: ['<all_urls>'],
  },
  modules: ['@wxt-dev/i18n/module', '@wxt-dev/module-react'],
});
