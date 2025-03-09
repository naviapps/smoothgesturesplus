import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: [
      'activeTab',
      'bookmarks',
      'downloads',
      'scripting',
      'sessions',
      'storage',
      'tabs',
    ],
    host_permissions: ['<all_urls>'],
  },
});
