import { useEffect, useRef } from 'react';

import { SilkyGestures, SilkyGesturesHandle } from '@/components/silky-gestures';
import * as actions from '@/entrypoints/content/actions';
import { onMessage, removeAllListeners } from '@/entrypoints/content/messaging';
import { useSettings } from '@/stores/settings-store';

function App() {
  const { width = 0, height = 0 } = useWindowSize();
  const { gestureMapping, lineStroke, lineStrokeWidth } = useSettings();
  const silkyGesturesRef = useRef<SilkyGesturesHandle>(null);

  useEffect(() => {
    onMessage('stop', actions.stop);
    onMessage('gotoTop', actions.gotoTop);
    onMessage('gotoBottom', actions.gotoBottom);
    onMessage('pageUp', actions.pageUp);
    onMessage('pageDown', actions.pageDown);
    onMessage('pageNext', actions.pageNext);
    onMessage('pagePrevious', actions.pagePrevious);
    onMessage('zoomImgIn', ({ data }) => actions.zoomImgIn(data));
    onMessage('zoomImgOut', ({ data }) => actions.zoomImgOut(data));
    onMessage('zoomImgZero', ({ data }) => actions.zoomImgZero(data));
    onMessage('hideImage', ({ data }) => actions.hideImage(data));
    onMessage('showCookies', actions.showCookies);
    onMessage('print', actions.print);
    onMessage('copy', ({ data }) => actions.copy(data));
    onMessage('copyLink', ({ data }) => actions.copyLink(data));
    onMessage('findPrevious', ({ data }) => actions.findPrevious(data));
    onMessage('findNext', ({ data }) => actions.findNext(data));
    onMessage('windowBlurred', () => {
      silkyGesturesRef.current?.gestureEnd();
    });

    return () => {
      removeAllListeners();
    };
  });

  return (
    <SilkyGestures
      ref={silkyGesturesRef}
      gestures={Object.keys(gestureMapping)}
      width={width}
      height={height}
      lineStroke={lineStroke}
      lineStrokeWidth={lineStrokeWidth}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 2_147_483_647,
        pointerEvents: 'none',
      }}
    />
  );
}

export default App;
