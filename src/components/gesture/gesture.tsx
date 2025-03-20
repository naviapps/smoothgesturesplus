import React, { ComponentPropsWithoutRef, JSX } from 'react';

import { useSettings } from '@/stores/settings-store';

type RockerGesture = 'rLR' | 'rRL';
type WheelGesture = 'wD' | 'wU';

type LineProperties = ComponentPropsWithoutRef<'canvas'> & {
  gesture: string;
  width: number;
  height: number;
  lineWidth?: number;
};

function Line({ gesture, width, height, lineWidth = 3, style }: LineProperties): JSX.Element {
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const { stroke } = useSettings();

  useEffect(() => {
    const c = canvasReference.current;
    if (!c) {
      return;
    }
    const context = c.getContext('2d');
    if (!context) {
      return;
    }
    if (stroke) {
      context.strokeStyle = stroke;
    }
    context.lineWidth = lineWidth;
    context.lineCap = 'butt';
    let step = 10;
    let tight = 2;
    let separator = 3;

    let previous = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    const max = { x: 0, y: 0 };
    const min = { x: 0, y: 0 };

    const minmax = (): void => {
      if (max.x < current.x) {
        max.x = current.x;
      }
      if (max.y < current.y) {
        max.y = current.y;
      }
      if (current.x < min.x) {
        min.x = current.x;
      }
      if (current.y < min.y) {
        min.y = current.y;
      }
    };
    const tip = (direction: string): void => {
      previous = current;
      context.lineTo(previous.x, previous.y);
      switch (direction) {
        case 'U': {
          current = { x: previous.x, y: previous.y - step * 0.75 };
          break;
        }
        case 'D': {
          current = { x: previous.x, y: previous.y + step * 0.75 };
          break;
        }
        case 'L': {
          current = { x: previous.x - step * 0.75, y: previous.y };
          break;
        }
        case 'R': {
          current = { x: previous.x + step * 0.75, y: previous.y };
          break;
        }
        case '1': {
          current = { x: previous.x - step * 0.5, y: previous.y + step * 0.5 };
          break;
        }
        case '3': {
          current = { x: previous.x + step * 0.5, y: previous.y + step * 0.5 };
          break;
        }
        case '7': {
          current = { x: previous.x - step * 0.5, y: previous.y - step * 0.5 };
          break;
        }
        case '9': {
          current = { x: previous.x + step * 0.5, y: previous.y - step * 0.5 };
          break;
        }
        // No default
      }
      context.lineTo(current.x, current.y);
      minmax();
    };
    const curve = (direction: string): void => {
      previous = current;
      context.lineTo(previous.x, previous.y);
      switch (direction) {
        case 'UD': {
          current = { x: previous.x, y: previous.y - step };
          minmax();
          context.lineTo(previous.x, previous.y - step);
          context.arc(previous.x + tight, previous.y - step, tight, Math.PI, 0, false);
          context.lineTo(previous.x + tight * 2, previous.y);
          break;
        }
        case 'UL': {
          context.arc(previous.x - step, previous.y, step, 0, -Math.PI / 2, true);
          break;
        }
        case 'UR': {
          context.arc(previous.x + step, previous.y, step, Math.PI, -Math.PI / 2, false);
          break;
        }
        case 'DU': {
          current = { x: previous.x, y: previous.y + step };
          minmax();
          context.lineTo(previous.x, previous.y + step);
          context.arc(previous.x + tight, previous.y + step, tight, Math.PI, 0, true);
          context.lineTo(previous.x + tight * 2, previous.y);
          break;
        }
        case 'DL': {
          context.arc(previous.x - step, previous.y, step, 0, Math.PI / 2, false);
          break;
        }
        case 'DR': {
          context.arc(previous.x + step, previous.y, step, Math.PI, Math.PI / 2, true);
          break;
        }
        case 'LU': {
          context.arc(previous.x, previous.y - step, step, Math.PI / 2, Math.PI, false);
          break;
        }
        case 'LD': {
          context.arc(previous.x, previous.y + step, step, -Math.PI / 2, Math.PI, true);
          break;
        }
        case 'LR': {
          current = { x: previous.x - step, y: previous.y };
          minmax();
          context.lineTo(previous.x - step, previous.y);
          context.arc(
            previous.x - step,
            previous.y + tight,
            tight,
            -Math.PI / 2,
            Math.PI / 2,
            true,
          );
          context.lineTo(previous.x, previous.y + tight * 2);
          break;
        }
        case 'RU': {
          context.arc(previous.x, previous.y - step, step, Math.PI / 2, 0, true);
          break;
        }
        case 'RD': {
          context.arc(previous.x, previous.y + step, step, -Math.PI / 2, 0, false);
          break;
        }
        case 'RL': {
          current = { x: previous.x + step, y: previous.y };
          minmax();
          context.lineTo(previous.x + step, previous.y);
          context.arc(
            previous.x + step,
            previous.y + tight,
            tight,
            -Math.PI / 2,
            Math.PI / 2,
            false,
          );
          context.lineTo(previous.x, previous.y + tight * 2);
          break;
        }
        default: {
          tip(direction[0]);
          tip(direction[1]);
        }
      }
      switch (direction) {
        case 'UD': {
          current = { x: previous.x + tight * 2, y: previous.y + separator };
          break;
        }
        case 'UL': {
          current = { x: previous.x - step, y: previous.y - step };
          break;
        }
        case 'UR': {
          current = { x: previous.x + step + separator, y: previous.y - step };
          break;
        }
        case 'DU': {
          current = { x: previous.x + tight * 2, y: previous.y };
          break;
        }
        case 'DL': {
          current = { x: previous.x - step, y: previous.y + step };
          break;
        }
        case 'DR': {
          current = { x: previous.x + step + separator, y: previous.y + step };
          break;
        }
        case 'LU': {
          current = { x: previous.x - step, y: previous.y - step };
          break;
        }
        case 'LD': {
          current = { x: previous.x - step, y: previous.y + step + separator };
          break;
        }
        case 'LR': {
          current = { x: previous.x + separator, y: previous.y + tight * 2 };
          break;
        }
        case 'RU': {
          current = { x: previous.x + step, y: previous.y - step };
          break;
        }
        case 'RD': {
          current = { x: previous.x + step, y: previous.y + step + separator };
          break;
        }
        case 'RL': {
          current = { x: previous.x, y: previous.y + tight * 2 };
          break;
        }
        // No default
      }
      minmax();
    };

    context.beginPath();
    tip(gesture[0]);
    for (let index = 0; index < gesture.length - 1; index += 1) {
      curve(gesture[index] + gesture[index + 1]);
    }
    tip(gesture.at(-1)!);
    context.stroke();

    const center = { x: (max.x + min.x) / 2, y: (max.y + min.y) / 2 };
    const wr = (max.x - min.x + step) / width;
    const hr = (max.y - min.y + step) / height;
    const ratio = Math.max(wr, hr);
    step /= ratio;
    separator /= ratio;
    tight /= ratio;
    if (tight > 6) {
      tight = 6;
    }
    current = { x: 0, y: 0 };

    context.clearRect(0, 0, c.width, c.height);
    context.save();
    context.translate(width / 2 - center.x / ratio, height / 2 - center.y / ratio);
    context.beginPath();
    tip(gesture[0]);
    for (let index = 0; index < gesture.length - 1; index += 1) {
      curve(gesture[index] + gesture[index + 1]);
    }
    tip(gesture.at(-1)!);
    context.stroke();
    if (stroke) {
      context.fillStyle = stroke;
    }
    context.beginPath();
    if (gesture.at(-1) === 'U') {
      context.moveTo(current.x - 5, current.y + 2);
      context.lineTo(current.x + 5, current.y + 2);
      context.lineTo(current.x, current.y - 3);
    } else if (gesture.at(-1) === 'D') {
      context.moveTo(current.x - 5, current.y - 2);
      context.lineTo(current.x + 5, current.y - 2);
      context.lineTo(current.x, current.y + 3);
    } else if (gesture.at(-1) === 'L') {
      context.moveTo(current.x + 2, current.y - 5);
      context.lineTo(current.x + 2, current.y + 5);
      context.lineTo(current.x - 3, current.y);
    } else if (gesture.at(-1) === 'R') {
      context.moveTo(current.x - 2, current.y - 5);
      context.lineTo(current.x - 2, current.y + 5);
      context.lineTo(current.x + 3, current.y);
    } else if (gesture.at(-1) === '1') {
      context.moveTo(current.x - 2, current.y - 6);
      context.lineTo(current.x + 6, current.y + 2);
      context.lineTo(current.x - 2, current.y + 2);
    } else if (gesture.at(-1) === '3') {
      context.moveTo(current.x + 2, current.y - 6);
      context.lineTo(current.x - 6, current.y + 2);
      context.lineTo(current.x + 2, current.y + 2);
    } else if (gesture.at(-1) === '7') {
      context.moveTo(current.x - 2, current.y + 6);
      context.lineTo(current.x + 6, current.y - 2);
      context.lineTo(current.x - 2, current.y - 2);
    } else if (gesture.at(-1) === '9') {
      context.moveTo(current.x + 2, current.y + 6);
      context.lineTo(current.x - 6, current.y - 2);
      context.lineTo(current.x + 2, current.y - 2);
    }
    context.closePath();
    context.fill();
    context.restore();
  }, [gesture, width, height, lineWidth, stroke]);

  return <canvas ref={canvasReference} width={width} height={height} style={style} />;
}

type RockerProperties = ComponentPropsWithoutRef<'div'> & {
  gesture: RockerGesture;
  width: number;
};

function Rocker({ gesture, width, style }: RockerProperties): JSX.Element {
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
        {i18n.t('gesture_rocker_description', [
          i18n.t(`options_mousebutton_${first}`),
          i18n.t(`options_mousebutton_${second}`),
        ])}
      </div>
    </div>
  );
}

type WheelProperties = ComponentPropsWithoutRef<'div'> & {
  gesture: WheelGesture;
  width: number;
};

function Wheel({ gesture, width, style }: WheelProperties): JSX.Element {
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
        {i18n.t(`gesture_${gesture}_description`)}
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

type KeyProperties = ComponentPropsWithoutRef<'div'> & {
  gesture: string;
  width: number;
};

function Key({ gesture, width, style }: KeyProperties): JSX.Element {
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

export type GestureProperties = {
  gesture: string;
  width: number;
  height: number;
  lineWidth?: number;
};

export function Gesture({ gesture, width, height, lineWidth }: GestureProperties): JSX.Element {
  const { gestures } = useSettings();

  let context = '';
  switch (gesture[0]) {
    case 's': {
      context = 's';
      gesture = gesture.slice(1);
      break;
    }
    case 'l': {
      context = 'l';
      gesture = gesture.slice(1);
      break;
    }
    case 'i': {
      context = 'i';
      gesture = gesture.slice(1);
      break;
    }
    // No default
  }

  let c: JSX.Element;
  const style: React.CSSProperties = { minHeight: '2em', overflow: 'hidden' };
  switch (gesture[0]) {
    case 'r': {
      c = <Rocker gesture={gesture as RockerGesture} width={width} style={style} />;
      break;
    }
    case 'w': {
      c = <Wheel gesture={gesture as WheelGesture} width={width} style={style} />;
      break;
    }
    case 'k': {
      c = <Key gesture={gesture} width={width} style={style} />;
      break;
    }
    default: {
      c = (
        <Line gesture={gesture} width={width} height={height} lineWidth={lineWidth} style={style} />
      );
    }
  }

  let message: string | undefined;
  switch (context) {
    case 's': {
      message = `* ${i18n.t('context_with_selection')}`;
      break;
    }
    case 'l': {
      message = `* ${i18n.t('context_on_link')}`;
      break;
    }
    case 'i': {
      message = `* ${i18n.t('context_on_image')}`;
      break;
    }
    default: {
      if (gestures[`s${gesture}`]) {
        message = `* ${i18n.t('context_not_selection')}`;
      } else if (gestures[`l${gesture}`] && gestures[`i${gesture}`]) {
        message = `* ${i18n.t('context_not_links_images')}`;
      } else if (gestures[`l${gesture}`]) {
        message = `* ${i18n.t('context_not_link')}`;
      } else if (gestures[`i${gesture}`]) {
        message = `* ${i18n.t('context_not_image')}`;
      }
    }
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
