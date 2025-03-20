import { delay } from 'es-toolkit';

import createActions from '@/entrypoints/background/actions';
import { onMessage } from '@/entrypoints/background/messaging';
import { ChainGesture, sendMessage } from '@/entrypoints/content/messaging';
import { settingsStore } from '@/stores/settings-store';

export default defineBackground(() => {
  let chainGesture: ChainGesture | undefined;

  settingsStore.subscribe(() => {
    //
  });

  onMessage('gesture', async ({ data, sender: { tab } }) => {
    if (!tab) {
      return;
    }
    const { gestures } = settingsStore.getState();

    let { gesture } = data;
    if (data.selection && gestures[`s${gesture}`]) {
      gesture = `s${gesture}`;
    } else if (data.links.length && gestures[`l${gesture}`]) {
      gesture = `l${gesture}`;
    } else if (data.images.length && gestures[`i${gesture}`]) {
      gesture = `i${gesture}`;
    }

    if (gesture && gestures[gesture]) {
      if (chainGesture) {
        clearTimeout(chainGesture.timeout);
      }
      chainGesture = undefined;
      if (gesture.startsWith('r')) {
        chainGesture = {
          rocker: true,
          timeout: window.setTimeout(() => {
            chainGesture = undefined;
          }, 2000),
        };
      }

      if (gesture.startsWith('w')) {
        chainGesture = {
          wheel: true,
          timeout: window.setTimeout(() => {
            chainGesture = undefined;
          }, 2000),
        };
      }

      if (chainGesture && data.buttonDown) {
        chainGesture.buttonDown = data.buttonDown;
      }

      if (chainGesture && data.startPoint) {
        chainGesture.startPoint = data.startPoint;
      }

      const call = async () => {
        if (!chainGesture) {
          return;
        }
        const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tabs.length) {
          return;
        }
        await sendMessage('chain', chainGesture, tabs[0].id);
      };

      try {
        const actions = createActions(tab, data);
        // TODO
        const id = gestures[gesture];
        if (id in actions) {
          await actions[id as keyof typeof actions]();
          await call();
        }
        //
      } catch (error) {
        /* empty */
      }
    }
  });

  onMessage('syncButton', async ({ data, sender }) => {
    if (!sender.tab?.id) {
      return;
    }
    if (chainGesture) {
      chainGesture.buttonDown ??= {};
      chainGesture.buttonDown[data.id] = data.down;
    }

    await delay(20);
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tabs.length) {
      return;
    }
    await sendMessage('syncButton', data, tabs[0].id);
  });
});
