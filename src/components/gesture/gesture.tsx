import React, { ComponentPropsWithoutRef, CSSProperties, JSX } from 'react';

import { useSettings } from '@/stores/settings-store';

type RockerGesture = 'rLR' | 'rRL';
type WheelGesture = 'wD' | 'wU';

type LineProps = ComponentPropsWithoutRef<'canvas'> & {
  gesture: string;
  width: number;
  height: number;
  lineWidth?: number;
};

function Line({ gesture, width, height, lineWidth = 3, style }: LineProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trailColor } = useSettings();

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) {
      return;
    }
    const ctx = c.getContext('2d');
    if (!ctx) {
      return;
    }
    if (trailColor) {
      ctx.strokeStyle = trailColor;
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    let step = 10;
    let tight = 2;
    let sep = 3;

    let prev = { x: 0, y: 0 };
    let curr = { x: 0, y: 0 };
    const max = { x: 0, y: 0 };
    const min = { x: 0, y: 0 };

    const minmax = (): void => {
      if (max.x < curr.x) {
        max.x = curr.x;
      }
      if (max.y < curr.y) {
        max.y = curr.y;
      }
      if (curr.x < min.x) {
        min.x = curr.x;
      }
      if (curr.y < min.y) {
        min.y = curr.y;
      }
    };
    const tip = (dir: string): void => {
      prev = curr;
      ctx.lineTo(prev.x, prev.y);
      if (dir === 'U') {
        curr = { x: prev.x, y: prev.y - step * 0.75 };
      } else if (dir === 'D') {
        curr = { x: prev.x, y: prev.y + step * 0.75 };
      } else if (dir === 'L') {
        curr = { x: prev.x - step * 0.75, y: prev.y };
      } else if (dir === 'R') {
        curr = { x: prev.x + step * 0.75, y: prev.y };
      } else if (dir === '1') {
        curr = { x: prev.x - step * 0.5, y: prev.y + step * 0.5 };
      } else if (dir === '3') {
        curr = { x: prev.x + step * 0.5, y: prev.y + step * 0.5 };
      } else if (dir === '7') {
        curr = { x: prev.x - step * 0.5, y: prev.y - step * 0.5 };
      } else if (dir === '9') {
        curr = { x: prev.x + step * 0.5, y: prev.y - step * 0.5 };
      }
      ctx.lineTo(curr.x, curr.y);
      minmax();
    };
    const curve = (dir: string): void => {
      prev = curr;
      ctx.lineTo(prev.x, prev.y);
      if (dir === 'UD') {
        curr = { x: prev.x, y: prev.y - step };
        minmax();
        ctx.lineTo(prev.x, prev.y - step);
        ctx.arc(prev.x + tight, prev.y - step, tight, Math.PI, 0, false);
        ctx.lineTo(prev.x + tight * 2, prev.y);
      } else if (dir === 'UL') {
        ctx.arc(prev.x - step, prev.y, step, 0, -Math.PI / 2, true);
      } else if (dir === 'UR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, -Math.PI / 2, false);
      } else if (dir === 'DU') {
        curr = { x: prev.x, y: prev.y + step };
        minmax();
        ctx.lineTo(prev.x, prev.y + step);
        ctx.arc(prev.x + tight, prev.y + step, tight, Math.PI, 0, true);
        ctx.lineTo(prev.x + tight * 2, prev.y);
      } else if (dir === 'DL') {
        ctx.arc(prev.x - step, prev.y, step, 0, Math.PI / 2, false);
      } else if (dir === 'DR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, Math.PI / 2, true);
      } else if (dir === 'LU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, Math.PI, false);
      } else if (dir === 'LD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, Math.PI, true);
      } else if (dir === 'LR') {
        curr = { x: prev.x - step, y: prev.y };
        minmax();
        ctx.lineTo(prev.x - step, prev.y);
        ctx.arc(prev.x - step, prev.y + tight, tight, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(prev.x, prev.y + tight * 2);
      } else if (dir === 'RU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, 0, true);
      } else if (dir === 'RD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, 0, false);
      } else if (dir === 'RL') {
        curr = { x: prev.x + step, y: prev.y };
        minmax();
        ctx.lineTo(prev.x + step, prev.y);
        ctx.arc(prev.x + step, prev.y + tight, tight, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(prev.x, prev.y + tight * 2);
      } else {
        tip(dir[0]);
        tip(dir[1]);
      }
      if (dir === 'UD') {
        curr = { x: prev.x + tight * 2, y: prev.y + sep };
      } else if (dir === 'UL') {
        curr = { x: prev.x - step, y: prev.y - step };
      } else if (dir === 'UR') {
        curr = { x: prev.x + step + sep, y: prev.y - step };
      } else if (dir === 'DU') {
        curr = { x: prev.x + tight * 2, y: prev.y };
      } else if (dir === 'DL') {
        curr = { x: prev.x - step, y: prev.y + step };
      } else if (dir === 'DR') {
        curr = { x: prev.x + step + sep, y: prev.y + step };
      } else if (dir === 'LU') {
        curr = { x: prev.x - step, y: prev.y - step };
      } else if (dir === 'LD') {
        curr = { x: prev.x - step, y: prev.y + step + sep };
      } else if (dir === 'LR') {
        curr = { x: prev.x + sep, y: prev.y + tight * 2 };
      } else if (dir === 'RU') {
        curr = { x: prev.x + step, y: prev.y - step };
      } else if (dir === 'RD') {
        curr = { x: prev.x + step, y: prev.y + step + sep };
      } else if (dir === 'RL') {
        curr = { x: prev.x, y: prev.y + tight * 2 };
      }
      minmax();
    };

    ctx.beginPath();
    tip(gesture[0]);
    for (let i = 0; i < gesture.length - 1; i += 1) {
      curve(gesture[i] + gesture[i + 1]);
    }
    tip(gesture[gesture.length - 1]);
    ctx.stroke();

    const center = { x: (max.x + min.x) / 2, y: (max.y + min.y) / 2 };
    const wr = (max.x - min.x + step) / width;
    const hr = (max.y - min.y + step) / height;
    const ratio = wr < hr ? hr : wr;
    step /= ratio;
    sep /= ratio;
    tight /= ratio;
    if (tight > 6) {
      tight = 6;
    }
    curr = { x: 0, y: 0 };

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(width / 2 - center.x / ratio, height / 2 - center.y / ratio);
    ctx.beginPath();
    tip(gesture[0]);
    for (let i = 0; i < gesture.length - 1; i += 1) {
      curve(gesture[i] + gesture[i + 1]);
    }
    tip(gesture[gesture.length - 1]);
    ctx.stroke();
    if (trailColor) {
      ctx.fillStyle = trailColor;
    }
    ctx.beginPath();
    if (gesture[gesture.length - 1] === 'U') {
      ctx.moveTo(curr.x - 5, curr.y + 2);
      ctx.lineTo(curr.x + 5, curr.y + 2);
      ctx.lineTo(curr.x, curr.y - 3);
    } else if (gesture[gesture.length - 1] === 'D') {
      ctx.moveTo(curr.x - 5, curr.y - 2);
      ctx.lineTo(curr.x + 5, curr.y - 2);
      ctx.lineTo(curr.x, curr.y + 3);
    } else if (gesture[gesture.length - 1] === 'L') {
      ctx.moveTo(curr.x + 2, curr.y - 5);
      ctx.lineTo(curr.x + 2, curr.y + 5);
      ctx.lineTo(curr.x - 3, curr.y);
    } else if (gesture[gesture.length - 1] === 'R') {
      ctx.moveTo(curr.x - 2, curr.y - 5);
      ctx.lineTo(curr.x - 2, curr.y + 5);
      ctx.lineTo(curr.x + 3, curr.y);
    } else if (gesture[gesture.length - 1] === '1') {
      ctx.moveTo(curr.x - 2, curr.y - 6);
      ctx.lineTo(curr.x + 6, curr.y + 2);
      ctx.lineTo(curr.x - 2, curr.y + 2);
    } else if (gesture[gesture.length - 1] === '3') {
      ctx.moveTo(curr.x + 2, curr.y - 6);
      ctx.lineTo(curr.x - 6, curr.y + 2);
      ctx.lineTo(curr.x + 2, curr.y + 2);
    } else if (gesture[gesture.length - 1] === '7') {
      ctx.moveTo(curr.x - 2, curr.y + 6);
      ctx.lineTo(curr.x + 6, curr.y - 2);
      ctx.lineTo(curr.x - 2, curr.y - 2);
    } else if (gesture[gesture.length - 1] === '9') {
      ctx.moveTo(curr.x + 2, curr.y + 6);
      ctx.lineTo(curr.x - 6, curr.y - 2);
      ctx.lineTo(curr.x + 2, curr.y - 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [gesture, width, height, lineWidth, trailColor]);

  return <canvas ref={canvasRef} width={width} height={height} style={style} />;
}

type RockerProps = ComponentPropsWithoutRef<'div'> & {
  gesture: RockerGesture;
  width: number;
};

function Rocker({ gesture, width, style }: RockerProps): JSX.Element {
  let first: 0 | 1 | 2;
  if (gesture[1] === 'L') {
    first = 0;
  } else if (gesture[1] === 'M') {
    first = 1;
  } else {
    first = 2;
  }
  let second: 0 | 1 | 2;
  if (gesture[2] === 'L') {
    second = 0;
  } else if (gesture[2] === 'M') {
    second = 1;
  } else {
    second = 2;
  }

  return (
    <div style={{ ...style, width: `${width - 2}px`, padding: '5px 1px' }}>
      <div
        style={{
          fontSize: `${14 * Math.sqrt(width / 100)}px`,
          color: '#111',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {i18n.t(`gesture_${gesture}`)}
      </div>
      <div
        style={{
          fontSize: `${12 * Math.sqrt(width / 100)}px`,
          color: '#666',
          textAlign: 'center',
        }}
      >
        {i18n.t('gesture_rocker_descrip', [
          i18n.t(`options_mousebutton_${first}`),
          i18n.t(`options_mousebutton_${second}`),
        ])}
      </div>
    </div>
  );
}

type WheelProps = ComponentPropsWithoutRef<'div'> & {
  gesture: WheelGesture;
  width: number;
};

function Wheel({ gesture, width, style }: WheelProps): JSX.Element {
  return (
    <div style={{ ...style, width: `${width - 2}px`, padding: '5px 1px' }}>
      <div
        style={{
          fontSize: `${14 * Math.sqrt(width / 100)}px`,
          color: '#111',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {i18n.t(`gesture_${gesture}`)}
      </div>
      <div
        style={{
          fontSize: `${12 * Math.sqrt(width / 100)}px`,
          color: '#666',
          textAlign: 'center',
        }}
      >
        {i18n.t(`gesture_${gesture}_descrip`)}
      </div>
    </div>
  );
}

const codeCharMap: Record<string, string> = {
  Space: 'Space',
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowRight: '→',
  ArrowDown: '↓',
  Digit0: '0',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  KeyA: 'A',
  KeyB: 'B',
  KeyC: 'C',
  KeyD: 'D',
  KeyE: 'E',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyI: 'I',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  KeyM: 'M',
  KeyN: 'N',
  KeyO: 'O',
  KeyP: 'P',
  KeyQ: 'Q',
  KeyR: 'R',
  KeyS: 'S',
  KeyT: 'T',
  KeyU: 'U',
  KeyV: 'V',
  KeyW: 'W',
  KeyX: 'X',
  KeyY: 'Y',
  KeyZ: 'Z',
};

const codeButton = (gesture: string): string => {
  const parts = gesture.split(':');
  const key = parts[1];
  const code = parts[2];
  const ch = codeCharMap[code];
  if (ch) {
    return ch;
  }
  return key;
};

type KeyProps = ComponentPropsWithoutRef<'div'> & {
  gesture: string;
  width: number;
};

function Key({ gesture, width, style }: KeyProps): JSX.Element {
  return (
    <div style={{ ...style, width: `${width - 2}px`, padding: '5px 1px' }}>
      <div
        style={{
          fontSize: `${14 * Math.sqrt(width / 100)}px`,
          color: '#666',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {(gesture[1] === '1' ? 'Ctrl + ' : '') +
          (gesture[2] === '1' ? 'Alt + ' : '') +
          (gesture[3] === '1' ? 'Shift + ' : '') +
          (gesture[4] === '1' ? 'Meta + ' : '') +
          codeButton(gesture)}
      </div>
    </div>
  );
}

export type GestureProps = {
  gesture: string;
  width: number;
  height: number;
  lineWidth?: number;
};

export function Gesture({ gesture, width, height, lineWidth }: GestureProps): JSX.Element {
  const { gestures } = useSettings();

  let context = '';
  let newGesture = gesture;
  if (gesture[0] === 's') {
    context = 's';
    newGesture = gesture.slice(1);
  } else if (gesture[0] === 'l') {
    context = 'l';
    newGesture = gesture.slice(1);
  } else if (gesture[0] === 'i') {
    context = 'i';
    newGesture = gesture.slice(1);
  }

  let c: JSX.Element;
  const style: React.CSSProperties = { minHeight: '2em', overflow: 'hidden' };
  if (gesture[0] === 'r') {
    c = <Rocker gesture={newGesture as RockerGesture} width={width} style={style} />;
  } else if (gesture[0] === 'w') {
    c = <Wheel gesture={newGesture as WheelGesture} width={width} style={style} />;
  } else if (gesture[0] === 'k') {
    c = <Key gesture={newGesture} width={width} style={style} />;
  } else {
    c = (
      <Line
        gesture={newGesture}
        width={width}
        height={height}
        lineWidth={lineWidth}
        style={style}
      />
    );
  }

  let message: string | undefined;
  if (context === 's') {
    message = `* ${i18n.t('context_with_selection')}`;
  } else if (context === 'l') {
    message = `* ${i18n.t('context_on_link')}`;
  } else if (context === 'i') {
    message = `* ${i18n.t('context_on_image')}`;
  } else if (gestures[`s${gesture}`]) {
    message = `* ${i18n.t('context_not_selection')}`;
  } else if (gestures[`l${gesture}`] && gestures[`i${gesture}`]) {
    message = `* ${i18n.t('context_not_links_images')}`;
  } else if (gestures[`l${gesture}`]) {
    message = `* ${i18n.t('context_not_link')}`;
  } else if (gestures[`i${gesture}`]) {
    message = `* ${i18n.t('context_not_image')}`;
  }

  if (!message) {
    return c;
  }
  return (
    <div style={{ width: `${width}px`, overflow: 'hidden' }}>
      <div
        style={{
          fontSize: `${12 * Math.sqrt(width / 100)}px`,
          color: '#888',
          textAlign: 'right',
          marginRight: '.3em',
          height: '0px',
          position: 'relative',
          top: '.1em',
        }}
      >
        {message}
      </div>
      {c}
    </div>
  );
}
