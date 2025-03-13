import browser from 'webextension-polyfill';

import createActions from '@/entrypoints/background/actions';
import { settingsStore } from '@/stores/settings-store';

export default defineBackground(() => {
  settingsStore.subscribe((settings) => {
    //
  });

  settingsStore.getState().setHoldButton(-1);

  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const { gestures } = settingsStore.getState();

    const key = gestures[message.gesture];
    const actions = createActions(message, sender);
    if (key in actions) {
      await actions[key]();
      // await actions[key](message, sender);
    } else {
      await actions['']();
    }

    // console.log('Message received', message);
  });
});
