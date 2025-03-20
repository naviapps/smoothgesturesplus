import { JSX } from 'react';

import { GestureMessage, sendMessage } from '@/entrypoints/background/messaging';
import * as actions from '@/entrypoints/content/actions';
import { pagePrevious } from '@/entrypoints/content/actions';
import { onMessage, removeAllListeners } from '@/entrypoints/content/messaging';
import { useSettings } from '@/stores/settings-store';
import { LineDirection, Point, RockerDirection, ValidGestures, WheelDirection } from '@/types';

type Gesture = {
  events?: boolean;
  startPoint?: Point;
  targets?: Element[];
  selection?: string;
  ranges?: Range[];
  timeout?: number;
  line?: {
    code: string;
    points: Point[];
    dirPoints: Point[];
    possibleDirs?: ValidGestures;
  };
  rocker?: boolean;
  wheel?: boolean;
};

export type SmoothGesturesProperties = {
  callback?: (code: string) => void;
};

export function SmoothGestures({ callback }: SmoothGesturesProperties): JSX.Element | undefined {
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowSize();
  const { isOpen, open, close } = useDisclosure(false);
  const { holdButton, contextOnLink, trailColor, trailWidth, trailBlock, selectToLink, validGestures } = useSettings();

  useEffect(() => {
    // gesture states
    let gesture: Gesture = {};

    // button syncing between tabs
    let syncButtons: { timeout: NodeJS.Timeout } | boolean = false;

    // mouse event states
    let buttonDown: Record<number, boolean> = {};
    let blockClick: Record<number, boolean> = {};
    let blockContext: boolean = true;
    let forceContext: boolean = false;
    // key mod down states
    let keyModule: string = '0000';
    let keyEscape: boolean = false;
    // focus state
    let focus: EventTarget | undefined;

    /*
     * Page Events
     */
    const handleMouseDown = async (event: MouseEvent): Promise<void> => {
      blockClick[event.button] = false;
      blockContext = event.button !== 2;

      // block scrollbars
      if (
        event.target instanceof HTMLElement &&
        ((window.innerHeight < document.documentElement.scrollHeight && event.clientX > window.innerWidth - 17) ||
          (window.innerWidth < document.documentElement.scrollWidth && event.clientY > window.innerHeight - 17))
      ) {
        endGesture();
        return;
      }

      if (syncButtons) {
        await sendMessage('syncButton', { id: event.button, down: true });
      }
      buttonDown[event.button] = true;

      if (forceContext) {
        if (event.button === 2) {
          endGesture();
          return;
        }
        forceContext = false;
      }

      moveGesture(event);
      if (gesture.rocker && (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) === 2) {
        let first: RockerDirection | undefined;
        let second: RockerDirection | undefined;
        if (buttonDown[0]) {
          if (event.button === 0) {
            second = 'L';
          } else {
            first = 'L';
          }
        }
        if (buttonDown[1]) {
          if (event.button === 1) {
            second = 'M';
          } else {
            first = 'M';
          }
        }
        if (buttonDown[2]) {
          if (event.button === 2) {
            second = 'R';
          } else {
            first = 'R';
          }
        }
        if (callback || (first && second && validGestures.r?.[first]?.[second])) {
          syncButtons = {
            timeout: globalThis.setTimeout(() => {
              syncButtons = false;
            }, 500),
          };
          await sendGesture(`r${first}${second}`);

          globalThis.getSelection()?.removeAllRanges();
          blockContext = true;
          blockClick[0] = true;
          blockClick[1] = true;
          blockClick[2] = true;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }

      if (contextOnLink && event.button === 2 && event.target instanceof Node && getLink(event.target)) {
        return;
      }
      if (holdButton === 0 && event.button === 0 && event.target instanceof HTMLSelectElement) {
        return;
      }
      if (holdButton === 0 && (keyModule[0] !== '0' || keyModule[1] !== '0' || keyModule[2] !== '0' || keyEscape)) {
        return; // allow selection
      }
      if (holdButton === 0 && event.button === 0 && event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
      // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block auto scrolling with middle
      if (event.button === 1 && (validGestures.r?.M || callback) && navigator.userAgent.includes('Win')) {
        event.preventDefault();
      }

      startGesture(
        { x: event.clientX, y: event.clientY },
        event.target as Element,
        event.button === holdButton,
        (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) === 1 &&
          (callback !== undefined ||
            (buttonDown[0] && validGestures.r?.L !== undefined) ||
            (buttonDown[1] && validGestures.r?.M !== undefined) ||
            (buttonDown[2] && validGestures.r?.R !== undefined)),
        event.button === holdButton && (callback !== undefined || validGestures.w !== undefined),
      );
    };

    const handleMouseUp = async (event: MouseEvent): Promise<void> => {
      if (event.button === holdButton) {
        if (gesture.line) {
          moveGesture(event, true);
        }
        if (gesture.line && gesture.line.code !== '') {
          await sendGesture(gesture.line.code);
          event.preventDefault();
          if (event.button === 0) {
            globalThis.getSelection()?.removeAllRanges();
          }
          if (event.button === 2) {
            blockContext = true;
          }
          blockClick[event.button] = true;
        }
      }
      gesture.line = undefined;
      gesture.wheel = undefined;

      if (event.button !== 2) {
        blockContext = true;
      }
      if (
        event.button === 2 &&
        !forceContext &&
        !blockContext &&
        !buttonDown[0] &&
        !buttonDown[1] &&
        !navigator.userAgent.includes('Win')
      ) {
        forceContext = true;
        globalThis.setTimeout(() => {
          forceContext = false;
        }, 600);
        const point = { x: event.screenX, y: event.screenY };
        if (
          /linux/i.test(navigator.userAgent) &&
          (event.screenX < window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
            (window.screenLeft === 0 &&
              event.screenY < 55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio)))
        ) {
          point.x += window.screenLeft;
          point.y += window.screenTop;
        }
        await sendMessage('nativeport', { rightclick: point });
      }

      if (blockClick[event.button]) {
        event.preventDefault();
      }
      buttonDown[event.button] = false;
      if (syncButtons) {
        await sendMessage('syncButton', { id: event.button, down: false });
      }

      if (!buttonDown[0] && !buttonDown[2]) {
        gesture.rocker = undefined;
      }
      if (!gesture.rocker) {
        endGesture();
      }
    };

    const handleDragEnd = (): void => {
      buttonDown = {};
    };

    const handleClick = (event: MouseEvent): void => {
      if (blockClick[event.button]) {
        event.preventDefault();
        event.stopPropagation();
      }
      blockClick[event.button] = false;
    };

    const handleContextMenu = (event: MouseEvent): void => {
      if ((blockContext || (buttonDown[2] && (gesture.line || gesture.rocker || gesture.wheel))) && !forceContext) {
        event.preventDefault();
        event.stopPropagation();
        blockContext = false;
      } else {
        // since the context menu is about to be shown, close all open gestures.
        endGesture();
        buttonDown = {};
      }
    };

    const handleSelectStart = (): void => {
      if (holdButton === 0 && keyModule[0] === '0' && keyModule[1] === '0' && keyModule[2] === '0' && !keyEscape) {
        globalThis.getSelection()?.removeAllRanges();
      }
    };

    const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
      if (event.key === 'Escape') {
        endGesture();
        keyEscape = true;
      }
      let module_ =
        (event.ctrlKey ? '1' : '0') +
        (event.altKey ? '1' : '0') +
        (event.shiftKey ? '1' : '0') +
        (event.metaKey ? '1' : '0');
      if (
        event.key === 'Shift' ||
        event.key === 'Control' ||
        event.key === 'Alt' ||
        event.key === 'Unidentified' ||
        event.key === 'Meta' ||
        event.key === 'ContextMenu'
      ) {
        let index: number | undefined;
        switch (event.key) {
          case 'Shift': {
            index = 2;

            break;
          }
          case 'Control': {
            index = 0;

            break;
          }
          case 'Alt': {
            index = 1;

            break;
          }
          // No default
        }
        if (index !== undefined) {
          module_ = `${module_.slice(0, index)}1${module_.slice(index + 1)}`;
        }
        keyModule = module_;
      } else if (
        callback ||
        ((module_ !== '0000' ||
          !focus ||
          (!(focus instanceof HTMLInputElement) && !(focus instanceof HTMLTextAreaElement))) &&
          validGestures.k?.[module_].includes(`${event.key}:${event.code}`))
      ) {
        startGesture();
        await sendGesture(`k${module_}:${event.key}:${event.code}`);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        keyEscape = false;
      }
      if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
        let index: number;
        if (event.key === 'Shift') {
          index = 2;
        } else if (event.key === 'Control') {
          index = 0;
        } else {
          index = 1;
        }
        keyModule = `${keyModule.slice(0, index)}0${keyModule.slice(index + 1)}`;
      }
    };

    const handleFocus = (event: FocusEvent): void => {
      if (event.target instanceof EventTarget) {
        focus = event.target;
      }
    };

    const handleBlur = (event: FocusEvent): void => {
      if (event.target instanceof EventTarget) {
        focus = undefined;
      }
    };

    const handleMouseMove = (event: MouseEvent): void => {
      if (gesture.events) {
        moveGesture(event);
      }
    };

    const handleWheel = async (event: WheelEvent): Promise<void> => {
      if (gesture.events) {
        await wheelGesture(event);
      }
    };

    /*
     * Start/End Gestures
     */
    const startGesture = (point?: Point, target?: Element, line?: boolean, rocker?: boolean, wheel?: boolean): void => {
      endGesture();
      gesture.events = true;
      if (point) {
        gesture.startPoint = { x: point.x, y: point.y };
      }
      if (target) {
        gesture.targets = [target];
      }
      const selection = globalThis.getSelection();
      if (selection) {
        gesture.selection = selection.toString();
        gesture.ranges = [];
        for (let index = 0; index < selection.rangeCount; index += 1) {
          gesture.ranges.push(selection.getRangeAt(index));
        }
      }

      if (line && point) {
        gesture.line = {
          code: '',
          points: [{ x: point.x, y: point.y }],
          dirPoints: [{ x: point.x, y: point.y }],
          possibleDirs: validGestures,
        };
      }
      gesture.rocker = rocker;
      gesture.wheel = wheel;
    };

    const moveGesture = (event: MouseEvent | WheelEvent, diagonal: boolean = false): void => {
      if (!gesture.startPoint) {
        gesture.startPoint = { x: event.clientX, y: event.clientY };
      }

      if (
        (gesture.rocker || gesture.wheel) &&
        (Math.abs(event.clientX - gesture.startPoint.x) > 0 || Math.abs(event.clientY - gesture.startPoint.y) > 2)
      ) {
        gesture.rocker = undefined;
        gesture.wheel = undefined;
      }

      if (gesture.line) {
        const next = { x: event.clientX, y: event.clientY };
        gesture.line.points.push(next);

        const diffx = next.x - gesture.line.dirPoints.at(-1)!.x;
        const diffy = next.y - gesture.line.dirPoints.at(-1)!.y;

        if (!trailBlock) {
          refreshLineAsync();
          if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
            open();
          }
        }

        const ldir = gesture.line.code === '' ? 'X' : gesture.line.code.slice(-1);
        const ndir = getLineDirection(gesture.line.dirPoints.at(-1)!, next);
        if (ndir === ldir) {
          gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = next;
        } else if ((Math.abs(diffx) > 25 || Math.abs(diffy) > 25) && (diagonal || /^[RLUD]$/.test(ndir))) {
          if (gesture.line.possibleDirs) {
            gesture.line.possibleDirs = gesture.line.possibleDirs[ndir];
          }
          if (gesture.line.possibleDirs || callback) {
            gesture.line.code += ndir;
            gesture.line.dirPoints.push(next);
          } else {
            endGesture();
            blockContext = true;
          }
        }
      }
    };

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

    const wheelGesture = async (event: WheelEvent): Promise<void> => {
      if (event.target instanceof HTMLIFrameElement) {
        endGesture();
      }
      moveGesture(event);
      if (!gesture.wheel || event.deltaY === 0) {
        return;
      }
      const dir: WheelDirection = event.deltaY < 0 ? 'U' : 'D';
      if (callback || validGestures.w?.[dir]) {
        syncButtons = {
          timeout: globalThis.setTimeout(() => {
            syncButtons = false;
          }, 500),
        };
        await sendGesture(`w${dir}`);

        if (holdButton === 2) {
          blockContext = true;
        }
        if (holdButton === 0) {
          globalThis.getSelection()?.removeAllRanges();
        }
        blockClick[holdButton] = true;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const sendGesture = async (code: string): Promise<void> => {
      if (code) {
        if (callback) {
          callback(code);
        } else {
          const message: GestureMessage = {
            gesture: code,
            startPoint: gesture.startPoint,
            targets: [],
            links: [],
            images: [],
            selection: gesture.selection,
          };
          if (message.targets === undefined || message.links === undefined || message.images === undefined) {
            return;
          }
          if (selectToLink && gesture.selection) {
            const parts = gesture.selection.split('http');
            for (let index = 1; index < parts.length; index += 1) {
              const link = `http${parts[index]}`.split(/[\s"']/)[0];
              if (/\/\/.+\..+/.test(link)) {
                message.links.push({ src: link });
              }
            }
          }
          if (gesture.targets) {
            for (let index = 0; index < gesture.targets.length; index += 1) {
              const element = gesture.targets[index];
              const gestureid = Math.floor(Math.random() * 2 ** 30).toString(32);
              element.setAttribute('gestureid', gestureid);

              message.targets.push({ gestureid });
              const link = getLink(element);
              if (link) {
                message.links.push({ src: link, gestureid });
              }
              if (element instanceof HTMLImageElement) {
                message.images.push({ src: element.src, gestureid });
              }
            }
          }
          if (syncButtons) {
            message.buttonDown = buttonDown;
          }
          await sendMessage('gesture', message);
        }
      }
      if (code[0] === 'w') {
        gesture.line = undefined;
        gesture.rocker = undefined;
      } else if (code[0] === 'r') {
        gesture.line = undefined;
        gesture.wheel = undefined;
      } else {
        const selection = globalThis.getSelection();
        if (selection) {
          selection.removeAllRanges();
          if (gesture.ranges) {
            for (let index = 0; index < gesture.ranges.length; index += 1) {
              selection.addRange(gesture.ranges[index]);
            }
          }
        }
        endGesture();
      }
    };

    const endGesture = (): void => {
      close();
      if (canvasReference.current) {
        const canvas = canvasReference.current;
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }

      globalThis.clearTimeout(gesture.timeout);

      gesture = {};
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
        } else {
          refreshLineAsync.timeout = globalThis.setTimeout(() => {
            refreshLine();
            refreshLineAsync.timeout = undefined;
          }, minTime - elapsedTime);
        }
      }
    };

    const refreshLine: { (): void; lasttime?: number; runtime?: number } = () => {
      const now = Date.now();
      if (!canvasReference.current) {
        return;
      }
      const canvas = canvasReference.current;
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (gesture.line) {
        context.strokeStyle = trailColor;
        context.lineWidth = trailWidth;
        context.lineCap = 'butt';
        context.lineJoin = 'round';
        context.shadowBlur = trailWidth;
        context.shadowColor = 'rgba(255,255,255,.3)';
        let firstDirPoint = {
          x: gesture.line.dirPoints[0].x,
          y: gesture.line.dirPoints[0].y,
        };
        const lastPoint = gesture.line.points.at(-1)!;
        const lastDirPoint = gesture.line.dirPoints.at(-1)!;
        const nextDir = getLineDirection(lastDirPoint, lastPoint);
        context.beginPath();
        if (gesture.line.code.length > 0) {
          if (gesture.line.code[0] === 'L' || gesture.line.code[0] === 'R') {
            firstDirPoint.y = gesture.line.dirPoints[1].y;
          } else {
            firstDirPoint.x = gesture.line.dirPoints[1].x;
          }
        }
        context.moveTo(firstDirPoint.x, firstDirPoint.y);
        for (let index = 1; index < gesture.line.code.length; index += 1) {
          const prevDir = gesture.line.code[index - 1];
          const currDir = gesture.line.code[index];
          const currDirPoint = gesture.line.dirPoints[index];
          const nextDirPoint = gesture.line.dirPoints[index + 1];
          let radius: number;
          if (prevDir === 'L' || prevDir === 'R') {
            if (currDir === 'L' || currDir === 'R') {
              radius = Math.min(
                Math.abs(currDirPoint.x - firstDirPoint.x),
                Math.abs(nextDirPoint.y - firstDirPoint.y) / 2,
              );
              context.arcTo(currDirPoint.x, firstDirPoint.y, currDirPoint.x, nextDirPoint.y, radius);
              radius = Math.min(
                Math.abs(nextDirPoint.x - currDirPoint.x),
                Math.abs(nextDirPoint.y - firstDirPoint.y) - radius,
              );
              context.arcTo(currDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius);
              firstDirPoint.x = (currDirPoint.x + nextDirPoint.x) / 2;
              firstDirPoint.y = nextDirPoint.y;
              context.lineTo(firstDirPoint.x, firstDirPoint.y);
            } else {
              let { y } = nextDirPoint;
              if (gesture.line.code[index + 1] === 'L' || gesture.line.code[index + 1] === 'R') {
                y = gesture.line.dirPoints[index + 2].y;
              }
              radius = Math.min(Math.abs(nextDirPoint.x - firstDirPoint.x), Math.abs(y - firstDirPoint.y) / 2);
              context.arcTo(nextDirPoint.x, firstDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * radius);
              firstDirPoint.x = nextDirPoint.x;
              firstDirPoint.y = (firstDirPoint.y + y) / 2;
              context.lineTo(firstDirPoint.x, firstDirPoint.y);
            }
          } else if (currDir === 'L' || currDir === 'R') {
            let { x } = nextDirPoint;
            if (gesture.line.code[index + 1] === 'U' || gesture.line.code[index + 1] === 'D') {
              x = gesture.line.dirPoints[index + 2].x;
            }
            radius = Math.min(Math.abs(x - firstDirPoint.x) / 2, Math.abs(nextDirPoint.y - firstDirPoint.y));
            context.arcTo(firstDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * radius);
            firstDirPoint.x = (firstDirPoint.x + x) / 2;
            firstDirPoint.y = nextDirPoint.y;
            context.lineTo(firstDirPoint.x, firstDirPoint.y);
          } else {
            radius = Math.min(
              Math.abs(nextDirPoint.x - firstDirPoint.x) / 2,
              Math.abs(currDirPoint.y - firstDirPoint.y),
            );
            context.arcTo(firstDirPoint.x, currDirPoint.y, nextDirPoint.x, currDirPoint.y, radius);
            radius = Math.min(
              Math.abs(nextDirPoint.x - firstDirPoint.x) - radius,
              Math.abs(nextDirPoint.y - currDirPoint.y),
            );
            context.arcTo(nextDirPoint.x, currDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius);
            firstDirPoint.x = nextDirPoint.x;
            firstDirPoint.y = (currDirPoint.y + nextDirPoint.y) / 2;
            context.lineTo(firstDirPoint.x, firstDirPoint.y);
          }
        }
        if (gesture.line.code.length > 0) {
          firstDirPoint = gesture.line.dirPoints.at(-1)!;
          context.lineTo(firstDirPoint.x, firstDirPoint.y);
        }
        context.stroke();
        if ((gesture.line.possibleDirs && gesture.line.possibleDirs[nextDir]) || callback) {
          if (nextDir === '3' || nextDir === '7') {
            context.lineTo(
              (firstDirPoint.x - firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
              (-firstDirPoint.x + firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
            );
          } else if (nextDir === '1' || nextDir === '9') {
            context.lineTo(
              (firstDirPoint.x + firstDirPoint.y + lastPoint.x - lastPoint.y) / 2,
              (firstDirPoint.x + firstDirPoint.y - lastPoint.x + lastPoint.y) / 2,
            );
          }
          context.stroke();
        }
        refreshLine.lasttime = Date.now();
        refreshLine.runtime = 0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now);
      }
    };

    /*
     * Enable/Disable
     */
    globalThis.addEventListener('mousedown', handleMouseDown, true);
    globalThis.addEventListener('mouseup', handleMouseUp, true);
    globalThis.addEventListener('dragend', handleDragEnd, true);
    globalThis.addEventListener('click', handleClick, true);
    globalThis.addEventListener('contextmenu', handleContextMenu, true);
    globalThis.addEventListener('selectstart', handleSelectStart, true);
    globalThis.addEventListener('keydown', handleKeyDown, true);
    globalThis.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);
    globalThis.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('wheel', handleWheel, true);

    /*
     * Extension Communication
     */
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
      buttonDown = {};
      blockClick = {};
      blockContext = true;
      endGesture();
    });
    onMessage('chain', ({ data }) => {
      startGesture(
        data.startPoint,
        data.startPoint ? (document.elementFromPoint(data.startPoint.x, data.startPoint.y) ?? undefined) : undefined,
        false,
        data.rocker,
        data.wheel,
      );
      blockContext = true;
      if (data.buttonDown) {
        if (data.buttonDown[0]) {
          blockClick[0] = true;
        }
        if (data.buttonDown[1]) {
          blockClick[1] = true;
        }
        if (data.buttonDown[2]) {
          blockClick[2] = true;
        }
        buttonDown[0] ??= data.buttonDown[0];
        buttonDown[1] ??= data.buttonDown[1];
        buttonDown[2] ??= data.buttonDown[2];
      }
    });
    onMessage('syncButton', ({ data: { id, down } }) => {
      buttonDown[id] = down;
    });

    return () => {
      globalThis.removeEventListener('mousedown', handleMouseDown, true);
      globalThis.removeEventListener('mouseup', handleMouseUp, true);
      globalThis.removeEventListener('dragend', handleDragEnd, true);
      globalThis.removeEventListener('click', handleClick, true);
      globalThis.removeEventListener('contextmenu', handleContextMenu, true);
      globalThis.removeEventListener('selectstart', handleSelectStart, true);
      globalThis.removeEventListener('keydown', handleKeyDown, true);
      globalThis.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
      globalThis.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('wheel', handleWheel, true);

      removeAllListeners();
    };
  }, [
    holdButton,
    contextOnLink,
    trailColor,
    trailWidth,
    trailBlock,
    selectToLink,
    validGestures,
    callback,
    open,
    close,
  ]);

  return isOpen ? (
    <canvas
      ref={canvasReference}
      width={width}
      height={height}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999_999_999,
        background: 'transparent',
        margin: 0,
        padding: 0,
      }}
    />
  ) : undefined;
}
