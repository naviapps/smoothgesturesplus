import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    default_locale: 'en',
    permissions: ['bookmarks', 'downloads', 'sessions', 'storage', 'tabs'],
    host_permissions: ['<all_urls>'],
    optional_permissions: ['nativeMessaging'],
  },
  modules: ['@wxt-dev/i18n/module', '@wxt-dev/module-react'],
});
