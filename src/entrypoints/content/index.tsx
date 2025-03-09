import ReactDOM from 'react-dom/client';

import { SmoothGestures } from '@/components/smooth-gestures';

export default defineContentScript({
  matches: ['*://*/*'],
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'smooth-gestures-plus',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      onMount: (container) => {
        // Don't mount react app directly on <body>
        const wrapper = document.createElement('div');
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<SmoothGestures />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
