import Konva from 'konva';
import React, {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react';
import { Label, Layer, Shape, Stage, Tag, Text } from 'react-konva';

import { buildValidGestures, isOverScrollbar } from '@/components/silky-gestures/utils';
import { GestureMessage, sendMessage } from '@/entrypoints/background/messaging';
import { onMessage, removeAllListeners } from '@/entrypoints/content/messaging';
import {
  LineDirection,
  Point,
  RockerDirection,
  ValidGestures,
  WheelDirection,
} from '@/types/gesture';

type GestureState = {
  events: boolean;
  startPoint?: Point;
  target?: EventTarget;
  selection?: string;
  ranges: Range[];
  line?: {
    code: string;
    points: Point[];
    dirPoints: Point[];
    possibleDirs?: ValidGestures;
  };
  rocker: boolean;
  wheel: boolean;
};

type StartGestureOptions = {
  point?: Point;
  target?: EventTarget;
  line?: boolean;
  rocker?: boolean;
  wheel?: boolean;
};

export type SilkyGesturesHandle = {
  gestureEnd: () => void;
};

export type SilkyGesturesProps = React.ComponentPropsWithoutRef<typeof Stage> & {
  gestures: string[];
  width?: number;
  height?: number;
  lineStroke?: string;
  lineStrokeWidth?: number;
  onGesture?: (gesture: string) => void;
};

export const SilkyGestures = forwardRef<SilkyGesturesHandle, SilkyGesturesProps>(
  function SilkyGestures(
    { gestures = [], width, height, lineStroke, lineStrokeWidth, onGesture, ...rest },
    ref,
  ) {
    const shapeRef = useRef<Konva.Shape>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const holdButton = 2;
    const selectToLink = true;
    const validGestures = useMemo<ValidGestures>(() => buildValidGestures(gestures), [gestures]);
    const handleMouseMoveRef = useRef<(event: MouseEvent) => void>(() => {});
    const handleWheelRef = useRef<(event: WheelEvent) => void>(() => {});

    // gesture states
    const gestureRef = useRef<GestureState>({
      events: false,
      ranges: [],
      rocker: false,
      wheel: false,
    });

    // button syncing between tabs
    const syncButtonsRef = useRef<{ timeout: NodeJS.Timeout } | false>(false);

    // mouse event states
    const buttonDownRef = useRef<Record<number, boolean>>({});
    const blockClickRef = useRef<Record<number, boolean>>({});
    const blockContextRef = useRef<boolean>(true);
    const forceContextRef = useRef<boolean>(false);
    // focus state
    const focusRef = useRef<EventTarget | undefined>(undefined);

    /*
     * Start/End Gestures
     */
    const endGesture = useCallback((): void => {
      setIsOpen(false);

      gestureRef.current = { events: false, ranges: [], rocker: false, wheel: false };
    }, []);

    const startGesture = useCallback(
      (options: StartGestureOptions = {}): void => {
        const { point, target, line = false, rocker = false, wheel = false } = options;

        endGesture();

        if (!gestureRef.current.events) {
          window.addEventListener('mousemove', handleMouseMoveRef.current, true);
          window.addEventListener('wheel', handleWheelRef.current, true);
        }

        const sel = window.getSelection?.();
        const selection = sel?.toString();
        const ranges: Range[] = sel
          ? Array.from({ length: sel.rangeCount }, (_, i) => sel.getRangeAt(i))
          : [];

        gestureRef.current = {
          events: true,
          startPoint: point,
          target,
          selection,
          ranges,
          line: line
            ? {
                code: '',
                points: point ? [point] : [],
                dirPoints: point ? [point] : [],
                possibleDirs: validGestures,
              }
            : undefined,
          rocker,
          wheel,
        };
      },
      [endGesture, validGestures],
    );

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getLineDirection = (previous: Point, next: Point): LineDirection => {
      const diffx = next.x - previous.x;
      const diffy = next.y - previous.y;
      if (Math.abs(diffx) > 2 * Math.abs(diffy)) {
        return diffx > 0 ? 'R' : 'L';
      }
      if (Math.abs(diffy) > 2 * Math.abs(diffx)) {
        return diffy > 0 ? 'D' : 'U';
      }
      if (diffy < 0) {
        return diffx > 0 ? '9' : '7';
      }
      return diffx > 0 ? '3' : '1';
    };

    const sendGesture = async (code: string): Promise<void> => {
      if (code) {
        if (onGesture) {
          onGesture(code);
        } else {
          const message: GestureMessage = {
            gesture: code,
            startPoint: gestureRef.current.startPoint,
            targets: [],
            links: [],
            images: [],
            selection: gestureRef.current.selection,
          };
          if (
            message.targets === undefined ||
            message.links === undefined ||
            message.images === undefined
          ) {
            return;
          }
          if (selectToLink && gestureRef.current.selection) {
            const parts = gestureRef.current.selection.split('http');
            for (let index = 1; index < parts.length; index += 1) {
              const link = `http${parts[index]}`.split(/[\s"']/)[0];
              if (/\/\/.+\..+/.test(link)) {
                message.links.push({ src: link });
              }
            }
          }
          if (gestureRef.current.target) {
            const element = gestureRef.current.target;
            const gestureId = Math.floor(Math.random() * 2 ** 30).toString(32);
            element.dataset.gestureId = gestureId;

            message.targets.push({ gestureId });
            const link = getLink(element);
            if (link) {
              message.links.push({ src: link, gestureId });
            }
            if (element instanceof HTMLImageElement) {
              message.images.push({ src: element.src, gestureId });
            }
          }
          if (syncButtonsRef.current) {
            message.buttonDown = buttonDownRef.current;
          }
          await sendMessage('gesture', message);
        }
      }
      if (code[0] === 'w') {
        gestureRef.current.line = undefined;
        gestureRef.current.rocker = false;
      } else if (code[0] === 'r') {
        gestureRef.current.line = undefined;
        gestureRef.current.wheel = false;
      } else {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          if (gestureRef.current.ranges) {
            for (let index = 0; index < gestureRef.current.ranges.length; index += 1) {
              selection.addRange(gestureRef.current.ranges[index]);
            }
          }
        }
        endGesture();
      }
    };

    /*
     * Page Events
     */
    const handleMouseDown = useCallback(
      async (event: MouseEvent): Promise<void> => {
        blockClickRef.current[event.button] = false;
        blockContextRef.current = event.button !== 2;

        // block scrollbars
        if (event.target instanceof HTMLElement && isOverScrollbar(event)) {
          endGesture();
          return;
        }

        // TODO
        buttonDownRef.current[event.button] = true;

        if (forceContextRef.current) {
          if (event.button === 2) {
            endGesture();
            return;
          }
          forceContextRef.current = false;
        }

        moveGesture(event);

        const pressedButtons = [0, 1, 2].filter((i) => buttonDownRef.current[i]);
        const rockerEnabled =
          pressedButtons.length === 1 &&
          Boolean(validGestures.r?.[(['L', 'M', 'R'] as const)[pressedButtons[0]]]);
        if (
          gestureRef.current.rocker &&
          (buttonDownRef.current[0] ? 1 : 0) +
            (buttonDownRef.current[1] ? 1 : 0) +
            (buttonDownRef.current[2] ? 1 : 0) ===
            2
        ) {
          let first: RockerDirection | undefined;
          let second: RockerDirection | undefined;
          if (buttonDownRef.current[0]) {
            if (event.button === 0) {
              second = 'L';
            } else {
              first = 'L';
            }
          }
          if (buttonDownRef.current[1]) {
            if (event.button === 1) {
              second = 'M';
            } else {
              first = 'M';
            }
          }
          if (buttonDownRef.current[2]) {
            if (event.button === 2) {
              second = 'R';
            } else {
              first = 'R';
            }
          }
          if (onGesture || (first && second && validGestures.r?.[first]?.[second])) {
            syncButtonsRef.current = {
              timeout: window.setTimeout(() => {
                syncButtonsRef.current = false;
              }, 500),
            };
            await sendGesture(`r${first}${second}`);

            window.getSelection()?.removeAllRanges();
            blockContextRef.current = true;
            blockClickRef.current = [true, true, true];
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }

        // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block auto scrolling with middle
        if (event.button === 1 && validGestures.r?.M && navigator.userAgent.includes('Win')) {
          event.preventDefault();
        }

        startGesture({
          point: { x: event.clientX, y: event.clientY },
          target: event.target ?? undefined,
          line: event.button === 2,
          rocker: rockerEnabled,
          wheel: event.button === 2 && Boolean(validGestures.w),
        });
      },
      [endGesture, startGesture, validGestures.r, validGestures.w],
    );

    const handleMouseUp = async (event: MouseEvent): Promise<void> => {
      if (event.button === holdButton) {
        if (gestureRef.current.line) {
          moveGesture(event, true);
        }
        if (gestureRef.current.line && gestureRef.current.line.code !== '') {
          await sendGesture(gestureRef.current.line.code);
          event.preventDefault();
          if (event.button === 2) {
            blockContextRef.current = true;
          }
          blockClickRef.current[event.button] = true;
        }
      }
      gestureRef.current.line = undefined;
      gestureRef.current.wheel = false;

      if (event.button !== 2) {
        blockContextRef.current = true;
      }
      if (
        event.button === 2 &&
        !forceContextRef.current &&
        !blockContextRef.current &&
        !buttonDownRef.current[0] &&
        !buttonDownRef.current[1] &&
        !navigator.userAgent.includes('Win')
      ) {
        forceContextRef.current = true;
        window.setTimeout(() => {
          forceContextRef.current = false;
        }, 600);
        const point = { x: event.screenX, y: event.screenY };
        if (
          /linux/i.test(navigator.userAgent) &&
          (event.screenX <
            window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
            (window.screenLeft === 0 &&
              event.screenY <
                55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio)))
        ) {
          point.x += window.screenLeft;
          point.y += window.screenTop;
        }
        await sendMessage('nativeport', { rightclick: point });
      }

      if (blockClickRef.current[event.button]) {
        event.preventDefault();
      }
      buttonDownRef.current[event.button] = false;
      if (syncButtonsRef.current) {
        await sendMessage('syncButton', { id: event.button, down: false });
      }

      if (!buttonDownRef.current[0] && !buttonDownRef.current[2]) {
        gestureRef.current.rocker = false;
      }
      if (!gestureRef.current.rocker) {
        endGesture();
      }
    };

    const handleDragEnd = (): void => {
      buttonDownRef.current = {};
    };

    const handleClick = (event: MouseEvent): void => {
      if (blockClickRef.current[event.button]) {
        event.preventDefault();
        event.stopPropagation();
      }
      blockClickRef.current[event.button] = false;
    };

    const handleContextMenu = (event: MouseEvent): void => {
      if (
        (blockContextRef.current ||
          (buttonDownRef.current[2] &&
            (gestureRef.current.line || gestureRef.current.rocker || gestureRef.current.wheel))) &&
        !forceContextRef.current
      ) {
        event.preventDefault();
        event.stopPropagation();
        blockContextRef.current = false;
      } else {
        // since the context menu is about to be shown, close all open gestures.
        endGesture();
        buttonDownRef.current = {};
      }
    };

    const handleKeyDown = useCallback(
      (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          endGesture();
          return;
        }
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
          return;
        }
        const focused = focusRef.current;
        if (
          focused instanceof HTMLInputElement ||
          focused instanceof HTMLTextAreaElement ||
          focused instanceof HTMLSelectElement ||
          (focused instanceof HTMLElement && focused.isContentEditable)
        ) {
          return;
        }
        const modifier =
          (event.ctrlKey ? '1' : '0') +
          (event.altKey ? '1' : '0') +
          (event.shiftKey ? '1' : '0') +
          (event.metaKey ? '1' : '0');
        const keySeq = `${event.key}:${event.code}`;
        if (
          onGesture ||
          ((modifier !== '0000' ||
            !focusRef.current ||
            (!(focusRef.current instanceof HTMLInputElement) &&
              !(focusRef.current instanceof HTMLTextAreaElement))) &&
            validGestures.k?.[modifier].includes(keySeq))
        ) {
          startGesture();
          await sendGesture(`k${modifier}:${keySeq}`);
          endGesture();
          event.preventDefault();
          event.stopPropagation();
        }
      },
      [validGestures.k, startGesture, sendGesture, endGesture],
    );

    const handleKeyUp = (): void => {
      //endGesture();
    };

    const handleFocus = useCallback((event: FocusEvent): void => {
      focusRef.current = event.target ?? undefined;
    }, []);

    const handleBlur = useCallback((): void => {
      focusRef.current = undefined;
    }, []);

    const handleMouseMove = (event: MouseEvent | WheelEvent, diagonal: boolean = false): void => {
      if (!gestureRef.current.startPoint) {
        gestureRef.current.startPoint = { x: event.clientX, y: event.clientY };
      }

      if (
        (gestureRef.current.rocker || gestureRef.current.wheel) &&
        (Math.abs(event.clientX - gestureRef.current.startPoint.x) > 0 ||
          Math.abs(event.clientY - gestureRef.current.startPoint.y) > 2)
      ) {
        gestureRef.current.rocker = false;
        gestureRef.current.wheel = false;
      }

      if (gestureRef.current.line) {
        const next = { x: event.clientX, y: event.clientY };
        gestureRef.current.line.points.push(next);

        const diffx = next.x - gestureRef.current.line.dirPoints.at(-1)!.x;
        const diffy = next.y - gestureRef.current.line.dirPoints.at(-1)!.y;

        refreshLineAsync();
        if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
          setIsOpen(true);
        }

        const ldir =
          gestureRef.current.line.code === '' ? 'X' : gestureRef.current.line.code.slice(-1);
        const ndir = getLineDirection(gestureRef.current.line.dirPoints.at(-1)!, next);
        if (ndir === ldir) {
          gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1] = next;
        } else if (
          (Math.abs(diffx) > 25 || Math.abs(diffy) > 25) &&
          (diagonal || /^[RLUD]$/.test(ndir))
        ) {
          if (gestureRef.current.line.possibleDirs) {
            gestureRef.current.line.possibleDirs = gestureRef.current.line.possibleDirs[ndir];
          }
          if (gestureRef.current.line.possibleDirs || onGesture) {
            gestureRef.current.line.code += ndir;
            gestureRef.current.line.dirPoints.push(next);
          } else {
            endGesture();
            blockContextRef.current = true;
          }
        }
      }
    };

    const handleWheel = async (event: WheelEvent): Promise<void> => {
      if (event.target instanceof HTMLIFrameElement) {
        endGesture();
        return;
      }

      moveGesture(event);
      if (!gestureRef.current.wheel || event.deltaY === 0) {
        return;
      }

      const direction: WheelDirection = event.deltaY < 0 ? 'U' : 'D';
      if (onGesture || validGestures.w?.[direction]) {
        syncButtonsRef.current = {
          timeout: window.setTimeout(() => {
            syncButtonsRef.current = false;
          }, 500),
        };
        await sendGesture(`w${direction}`);

        if (holdButton === 2) {
          blockContextRef.current = true;
        }
        blockClickRef.current[holdButton] = true;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    /*
     * Helpers
     */
    const getLink = (element: Node): string | undefined => {
      let node: Node | undefined = element;
      while (node) {
        if (node instanceof HTMLAnchorElement) {
          return node.href;
        }
        node = node.parentNode ?? undefined;
      }
      return undefined;
    };

    const refreshLineAsync: { (): void; timeout?: NodeJS.Timeout } = () => {
      if (!refreshLineAsync.timeout) {
        const elapsedTime = Date.now() - (refreshLine.lasttime ?? 0);
        const minTime = Math.min(500, 4 * (refreshLine.runtime ?? 0));
        if (minTime < elapsedTime) {
          refreshLine();
          shapeRef.current?.getLayer()?.batchDraw();
        } else {
          refreshLineAsync.timeout = window.setTimeout(() => {
            refreshLine();
            shapeRef.current?.getLayer()?.batchDraw();
            refreshLineAsync.timeout = undefined;
          }, minTime - elapsedTime);
        }
      }
    };

    const refreshLine: { (): void; lasttime?: number; runtime?: number } = () => {
      if (!gestureRef.current.line) return;
      const now = Date.now();
      refreshLine.lasttime = Date.now();
      refreshLine.runtime = 0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now);
    };

    const renderGesturePath = (context: Konva.Context, shape: Konva.Shape): void => {
      if (!gestureRef.current.line) return;

      const line = gestureRef.current.line;
      const dirPoints = line.dirPoints;
      const code = line.code;
      const lastPoint = line.points.at(-1)!;
      const lastDirPoint = dirPoints.at(-1)!;
      const nextDir = getLineDirection(lastDirPoint, lastPoint);

      context.beginPath();

      let first = { ...dirPoints[0] };
      if (code.length > 0) {
        const next = dirPoints[1];
        if (code[0] === 'L' || code[0] === 'R') {
          first.y = next.y;
        } else {
          first.x = next.x;
        }
      }
      context.moveTo(first.x, first.y);

      for (let i = 1; i < code.length; i++) {
        const prev = code[i - 1];
        const curr = code[i];
        const cp = dirPoints[i];
        const np = dirPoints[i + 1];
        if (!cp || !np) break;

        // eslint-disable-next-line unicorn/consistent-function-scoping
        const mid = (a: number, b: number) => (a + b) / 2;
        let r: number;

        if (prev === 'L' || prev === 'R') {
          if (curr === 'L' || curr === 'R') {
            r = Math.min(Math.abs(cp.x - first.x), Math.abs(np.y - first.y) / 2);
            context.arcTo(cp.x, first.y, cp.x, np.y, r);
            r = Math.min(Math.abs(np.x - cp.x), Math.abs(np.y - first.y) - r);
            context.arcTo(cp.x, np.y, np.x, np.y, r);
            first = { x: mid(cp.x, np.x), y: np.y };
          } else {
            let y = np.y;
            if (code[i + 1] === 'L' || code[i + 1] === 'R') {
              y = dirPoints[i + 2]?.y ?? y;
            }
            r = Math.min(Math.abs(np.x - first.x), Math.abs(y - first.y) / 2);
            context.arcTo(np.x, first.y, np.x, np.y, 0.8 * r);
            first = { x: np.x, y: mid(first.y, y) };
          }
        } else if (curr === 'L' || curr === 'R') {
          let x = np.x;
          if (code[i + 1] === 'U' || code[i + 1] === 'D') {
            x = dirPoints[i + 2]?.x ?? x;
          }
          r = Math.min(Math.abs(x - first.x) / 2, Math.abs(np.y - first.y));
          context.arcTo(first.x, np.y, np.x, np.y, 0.8 * r);
          first = { x: mid(first.x, x), y: np.y };
        } else {
          r = Math.min(Math.abs(np.x - first.x) / 2, Math.abs(cp.y - first.y));
          context.arcTo(first.x, cp.y, np.x, cp.y, r);
          r = Math.min(Math.abs(np.x - first.x) - r, Math.abs(np.y - cp.y));
          context.arcTo(np.x, cp.y, np.x, np.y, r);
          first = { x: np.x, y: mid(cp.y, np.y) };
        }

        context.lineTo(first.x, first.y);
      }

      if (code.length > 0) {
        const end = dirPoints.at(-1)!;
        context.lineTo(end.x, end.y);
      }

      if ((line.possibleDirs && line.possibleDirs[nextDir]) || onGesture) {
        if (nextDir === '3' || nextDir === '7') {
          const x = (first.x - first.y + lastPoint.x + lastPoint.y) / 2;
          const y = (-first.x + first.y + lastPoint.x + lastPoint.y) / 2;
          context.lineTo(x, y);
        } else if (nextDir === '1' || nextDir === '9') {
          const x = (first.x + first.y + lastPoint.x - lastPoint.y) / 2;
          const y = (first.x + first.y - lastPoint.x + lastPoint.y) / 2;
          context.lineTo(x, y);
        }
      }

      context.stroke();
      context.fillStrokeShape(shape);
    };

    useEffect(() => {
      /*
       * Enable/Disable
       */
      window.addEventListener('mousedown', handleMouseDown, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      window.addEventListener('dragend', handleDragEnd, true);
      window.addEventListener('click', handleClick, true);
      window.addEventListener('contextmenu', handleContextMenu, true);
      window.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('keyup', handleKeyUp, true);
      window.addEventListener('focus', handleFocus, true);
      window.addEventListener('blur', handleBlur, true);
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('wheel', handleWheel, true);

      /*
       * Extension Communication
       */
      onMessage('chain', ({ data }) => {
        startGesture({
          point: data.startPoint,
          target: data.startPoint
            ? ((document.elementFromPoint(data.startPoint.x, data.startPoint.y) as HTMLElement) ??
              undefined)
            : undefined,
          line: false,
          rocker: data.rocker,
          wheel: data.wheel,
        });
        blockContextRef.current = true;
        if (data.buttonDown) {
          if (data.buttonDown[0]) {
            blockClickRef.current[0] = true;
          }
          if (data.buttonDown[1]) {
            blockClickRef.current[1] = true;
          }
          if (data.buttonDown[2]) {
            blockClickRef.current[2] = true;
          }
          buttonDownRef.current[0] ??= data.buttonDown[0];
          buttonDownRef.current[1] ??= data.buttonDown[1];
          buttonDownRef.current[2] ??= data.buttonDown[2];
        }
      });
      onMessage('syncButton', ({ data: { id, down } }) => {
        buttonDownRef.current[id] = down;
      });

      return () => {
        window.removeEventListener('mousedown', handleMouseDown, true);
        window.removeEventListener('mouseup', handleMouseUp, true);
        window.removeEventListener('dragend', handleDragEnd, true);
        window.removeEventListener('contextmenu', handleContextMenu, true);
        window.removeEventListener('click', handleClick, true);
        window.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('keyup', handleKeyUp, true);
        window.removeEventListener('focus', handleFocus, true);
        window.removeEventListener('blur', handleBlur, true);
        window.removeEventListener('mousemove', handleMouseMove, true);
        window.removeEventListener('wheel', handleWheel, true);

        removeAllListeners();
      };
    }, [handleFocus, handleBlur]);

    useImperativeHandle(ref, () => {
      return {
        gestureEnd() {
          buttonDownRef.current = {};
          blockClickRef.current = {};
          blockContextRef.current = true;
          endGesture();
        },
      };
    }, []);

    if (!isOpen) return null;

    return (
      <Stage width={width} height={height} {...rest}>
        <Layer>
          <Label x={width / 2} y={height / 2} offsetX={100} offsetY={20}>
            <Tag fill="rgba(0, 0, 0, 0.6)" stroke="white" strokeWidth={2} />
            <Text
              text="背景＋ボーダー付きテキスト"
              fontSize={24}
              fill="#FFFFFF"
              padding={20}
              shadowColor="black"
              shadowBlur={4}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.5}
            />
          </Label>
          <Shape
            ref={shapeRef}
            stroke={lineStroke}
            strokeWidth={lineStrokeWidth}
            lineJoin="round"
            lineCap="round"
            sceneFunc={renderGesturePath}
          />
        </Layer>
      </Stage>
    );
  },
);
