import browser from '#webextension-polyfill';
import React from 'react';

import useDisclosure from '@/hooks/use-disclosure';
import useWindowSize from '@/hooks/use-window-size';
import { useSettings } from '@/stores/settings-store';
import {
  BackgroundMessage,
  ContentMessage,
  LineDirection,
  Point,
  RockerDirection,
  ValidGestures,
  WheelDirection,
} from '@/types';

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
    distance: number;
  };
  rocker?: boolean;
  wheel?: boolean;
};

export type SmoothGesturesProps = {
  callback?: (code: string) => void;
};

export function SmoothGestures({ callback }: SmoothGesturesProps): React.ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowSize();
  const { isOpen, open, close } = useDisclosure(false);
  const {
    holdButton,
    contextOnLink,
    trailColor,
    trailWidth,
    trailBlock,
    selectToLink,
    validGestures,
  } = useSettings();

  useEffect(() => {
    // gesture states
    let gesture: Gesture = {};

    // button syncing between tabs
    let syncButtons: { timeout: number } | boolean = false;

    // mouse event states
    let buttonDown: Record<number, boolean> = {};
    const blockClick: Record<number, boolean> = {};
    let blockContext: boolean = true;
    let forceContext: boolean = false;
    // key mod down states
    let keyMod: string = '0000';
    let keyEscape: boolean = false;
    // focus state
    let focus: EventTarget | undefined;

    /*
     * Extension Communication
     */
    // TODO
    const receiveMessage = (mess: unknown): void => {
      const message = mess as BackgroundMessage;
      /*
      if (message.action) {
        // localAction(message.action);
      }
      if (message.windowBlurred) {
        buttonDown = {};
        blockClick = {};
        blockContext = true;
        endGesture();
      }
       */
      if (message.chain) {
        /*
        startGesture(
          message.chain.startPoint,
          message.chain.startPoint
            ? document.elementFromPoint(message.chain.startPoint.x, message.chain.startPoint.y)
            : undefined,
          message.chain.line,
          message.chain.rocker,
          message.chain.wheel,
        );
        blockContext = true;
       */
        if (message.chain.buttonDown) {
          if (message.chain.buttonDown[0]) {
            blockClick[0] = true;
          }
          if (message.chain.buttonDown[1]) {
            blockClick[1] = true;
          }
          if (message.chain.buttonDown[2]) {
            blockClick[2] = true;
          }
          /*
            if (buttonDown[0] === undefined) {
              buttonDown[0] = message.chain.buttonDown[0];
            }
            if (buttonDown[1] === undefined) {
              buttonDown[1] = message.chain.buttonDown[1];
            }
            if (buttonDown[2] === undefined) {
              buttonDown[2] = message.chain.buttonDown[2];
            }
           */
        }
      }
      /*
      if (message.syncButton) {
        buttonDown[message.syncButton.id] = message.syncButton.down;
      }
       */
    };

    /*
     * Page Events
     */
    const handleMouseDown = async (event: MouseEvent): Promise<void> => {
      blockClick[event.button] = false;
      blockContext = event.button !== 2;

      // block scrollbars
      if (
        event.target instanceof HTMLElement &&
        ((window.innerHeight < document.documentElement.scrollHeight &&
          event.clientX > window.innerWidth - 17) ||
          (window.innerWidth < document.documentElement.scrollWidth &&
            event.clientY > window.innerHeight - 17))
      ) {
        endGesture();
        return;
      }

      if (syncButtons) {
        await browser.runtime.sendMessage({ syncButton: { id: event.button, down: true } });
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
      if (
        gesture.rocker &&
        (buttonDown[0] ? 1 : 0) + (buttonDown[1] ? 1 : 0) + (buttonDown[2] ? 1 : 0) === 2
      ) {
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
            timeout: window.setTimeout(() => {
              syncButtons = false;
            }, 500),
          };
          await sendGesture(`r${first}${second}`);

          window.getSelection()?.removeAllRanges();
          blockContext = true;
          blockClick[0] = true;
          blockClick[1] = true;
          blockClick[2] = true;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }

      if (
        contextOnLink &&
        event.button === 2 &&
        event.target instanceof Node &&
        getLink(event.target)
      ) {
        return;
      }
      if (holdButton === 0 && event.button === 0 && event.target instanceof HTMLSelectElement) {
        return;
      }
      if (
        holdButton === 0 &&
        (keyMod[0] !== '0' || keyMod[1] !== '0' || keyMod[2] !== '0' || keyEscape)
      ) {
        return; // allow selection
      }
      if (holdButton === 0 && event.button === 0 && event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
      // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block auto scrolling with middle
      if (
        event.button === 1 &&
        (validGestures.r?.M || callback) &&
        navigator.userAgent.indexOf('Win') !== -1
      ) {
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
            window.getSelection()?.removeAllRanges();
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
        navigator.userAgent.indexOf('Win') === -1
      ) {
        forceContext = true;
        window.setTimeout(() => {
          forceContext = false;
        }, 600);
        const point = { x: event.screenX, y: event.screenY };
        if (
          navigator.userAgent.match(/linux/i) &&
          (event.screenX <
            window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
            (window.screenLeft === 0 &&
              event.screenY <
                55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio)))
        ) {
          point.x += window.screenLeft;
          point.y += window.screenTop;
        }
        await browser.runtime.sendMessage({ nativeport: { rightclick: point } });
      }

      if (blockClick[event.button]) {
        event.preventDefault();
      }
      buttonDown[event.button] = false;
      if (syncButtons) {
        await browser.runtime.sendMessage({ syncButton: { id: event.button, down: false } });
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
      if (
        (blockContext || (buttonDown[2] && (gesture.line || gesture.rocker || gesture.wheel))) &&
        !forceContext
      ) {
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
      if (
        holdButton === 0 &&
        keyMod[0] === '0' &&
        keyMod[1] === '0' &&
        keyMod[2] === '0' &&
        !keyEscape
      ) {
        window.getSelection()?.removeAllRanges();
      }
    };

    const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
      if (event.key === 'Escape') {
        endGesture();
        keyEscape = true;
      }
      let mod =
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
        let i: number | undefined;
        if (event.key === 'Shift') {
          i = 2;
        } else if (event.key === 'Control') {
          i = 0;
        } else if (event.key === 'Alt') {
          i = 1;
        }
        if (i !== undefined) {
          mod = `${mod.slice(0, i)}1${mod.slice(i + 1)}`;
        }
        keyMod = mod;
      } else if (
        callback ||
        ((mod !== '0000' ||
          !focus ||
          (!(focus instanceof HTMLInputElement) && !(focus instanceof HTMLTextAreaElement))) &&
          validGestures.k?.[mod].includes(`${event.key}:${event.code}`))
      ) {
        startGesture();
        await sendGesture(`k${mod}:${event.key}:${event.code}`);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        keyEscape = false;
      }
      if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
        let i: number;
        if (event.key === 'Shift') {
          i = 2;
        } else if (event.key === 'Control') {
          i = 0;
        } else {
          i = 1;
        }
        keyMod = `${keyMod.slice(0, i)}0${keyMod.slice(i + 1)}`;
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
    const startGesture = (
      point?: Point,
      target?: Element,
      line?: boolean,
      rocker?: boolean,
      wheel?: boolean,
    ): void => {
      endGesture();
      gesture.events = true;
      if (point) {
        gesture.startPoint = { x: point.x, y: point.y };
      }
      if (target) {
        gesture.targets = [target];
      }
      const selection = window.getSelection();
      if (selection) {
        gesture.selection = selection.toString();
        gesture.ranges = [];
        for (let i = 0; i < selection.rangeCount; i += 1) {
          gesture.ranges.push(selection.getRangeAt(i));
        }
      }

      if (line && point) {
        gesture.line = {
          code: '',
          points: [{ x: point.x, y: point.y }],
          dirPoints: [{ x: point.x, y: point.y }],
          possibleDirs: validGestures,
          distance: 0,
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
        (Math.abs(event.clientX - gesture.startPoint.x) > 0 ||
          Math.abs(event.clientY - gesture.startPoint.y) > 2)
      ) {
        gesture.rocker = undefined;
        gesture.wheel = undefined;
      }

      if (gesture.line) {
        const next = { x: event.clientX, y: event.clientY };
        const prev = gesture.line.points[gesture.line.points.length - 1];
        gesture.line.points.push(next);
        gesture.line.distance += Math.sqrt((next.x - prev.x) ** 2 + (next.y - prev.y) ** 2);

        const diffx = next.x - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].x;
        const diffy = next.y - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].y;

        if (!trailBlock) {
          refreshLineAsync();
          if (Math.abs(diffx) > 10 || Math.abs(diffy) > 10) {
            open();
          }
        }

        const ldir = gesture.line.code === '' ? 'X' : gesture.line.code.slice(-1);
        const ndir = getDirection(gesture.line.dirPoints[gesture.line.dirPoints.length - 1], next);
        if (ndir === ldir) {
          gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = next;
        } else if (
          (Math.abs(diffx) > 25 || Math.abs(diffy) > 25) &&
          (diagonal || ndir.match(/^[RLUD]$/))
        ) {
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

    const getDirection = (prev: Point, next: Point): LineDirection => {
      const diffx = next.x - prev.x;
      const diffy = next.y - prev.y;
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
          timeout: window.setTimeout(() => {
            syncButtons = false;
          }, 500),
        };
        await sendGesture(`w${dir}`);

        if (holdButton === 2) {
          blockContext = true;
        }
        if (holdButton === 0) {
          window.getSelection()?.removeAllRanges();
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
          const message: ContentMessage = {
            gesture: code,
            startPoint: gesture.startPoint,
            targets: [],
            links: [],
            images: [],
            selection: gesture.selection,
          };
          if (
            message.targets === undefined ||
            message.links === undefined ||
            message.images === undefined
          ) {
            return;
          }
          if (gesture.line && code[0] !== 'w' && code[0] !== 'r') {
            message.line = {
              distance: gesture.line.distance,
              segments: code.length,
            };
          }
          if (selectToLink && gesture.selection) {
            const parts = gesture.selection.split('http');
            for (let i = 1; i < parts.length; i += 1) {
              const link = `http${parts[i]}`.split(/[\s"']/)[0];
              if (link.match(/\/\/.+\..+/)) {
                message.links.push({ src: link });
              }
            }
          }
          if (gesture.targets) {
            for (let i = 0; i < gesture.targets.length; i += 1) {
              const element = gesture.targets[i];
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
          await browser.runtime.sendMessage(message);
        }
      }
      if (code[0] === 'w') {
        gesture.line = undefined;
        gesture.rocker = undefined;
      } else if (code[0] === 'r') {
        gesture.line = undefined;
        gesture.wheel = undefined;
      } else {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          if (gesture.ranges) {
            for (let i = 0; i < gesture.ranges.length; i += 1) {
              selection.addRange(gesture.ranges[i]);
            }
          }
        }
        endGesture();
      }
    };

    const endGesture = (): void => {
      close();
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }

      window.clearTimeout(gesture.timeout);

      gesture = {};
    };

    /*
     * Helpers
     */
    const getLink = (element: Node): string | undefined => {
      let node: Node | null = element;
      while (node) {
        if (node instanceof HTMLAnchorElement) {
          return node.href;
        }
        node = node.parentNode;
      }
      return undefined;
    };

    const refreshLineAsync: { (): void; timeout?: number } = () => {
      if (!refreshLineAsync.timeout) {
        const elapsedTime = Date.now() - (refreshLine.lasttime ?? 0);
        const minTime = Math.min(500, 4 * (refreshLine.runtime ?? 0));
        if (minTime < elapsedTime) {
          refreshLine();
        } else {
          refreshLineAsync.timeout = window.setTimeout(() => {
            refreshLine();
            refreshLineAsync.timeout = undefined;
          }, minTime - elapsedTime);
        }
      }
    };

    const refreshLine: { (): void; lasttime?: number; runtime?: number } = () => {
      const now = Date.now();
      if (!canvasRef.current) {
        return;
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (gesture.line) {
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = trailWidth;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = trailWidth;
        ctx.shadowColor = 'rgba(255,255,255,.3)';
        let firstDirPoint = {
          x: gesture.line.dirPoints[0].x,
          y: gesture.line.dirPoints[0].y,
        };
        const lastPoint = gesture.line.points[gesture.line.points.length - 1];
        const lastDirPoint = gesture.line.dirPoints[gesture.line.dirPoints.length - 1];
        const nextDir = getDirection(lastDirPoint, lastPoint);
        ctx.beginPath();
        if (gesture.line.code.length > 0) {
          if (gesture.line.code[0] === 'L' || gesture.line.code[0] === 'R') {
            firstDirPoint.y = gesture.line.dirPoints[1].y;
          } else {
            firstDirPoint.x = gesture.line.dirPoints[1].x;
          }
        }
        ctx.moveTo(firstDirPoint.x, firstDirPoint.y);
        for (let i = 1; i < gesture.line.code.length; i += 1) {
          const prevDir = gesture.line.code[i - 1];
          const currDir = gesture.line.code[i];
          const currDirPoint = gesture.line.dirPoints[i];
          const nextDirPoint = gesture.line.dirPoints[i + 1];
          let radius: number;
          if (prevDir === 'L' || prevDir === 'R') {
            if (currDir === 'L' || currDir === 'R') {
              radius = Math.min(
                Math.abs(currDirPoint.x - firstDirPoint.x),
                Math.abs(nextDirPoint.y - firstDirPoint.y) / 2,
              );
              ctx.arcTo(currDirPoint.x, firstDirPoint.y, currDirPoint.x, nextDirPoint.y, radius);
              radius = Math.min(
                Math.abs(nextDirPoint.x - currDirPoint.x),
                Math.abs(nextDirPoint.y - firstDirPoint.y) - radius,
              );
              ctx.arcTo(currDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius);
              firstDirPoint.x = (currDirPoint.x + nextDirPoint.x) / 2;
              firstDirPoint.y = nextDirPoint.y;
              ctx.lineTo(firstDirPoint.x, firstDirPoint.y);
            } else {
              let { y } = nextDirPoint;
              if (gesture.line.code[i + 1] === 'L' || gesture.line.code[i + 1] === 'R') {
                y = gesture.line.dirPoints[i + 2].y;
              }
              radius = Math.min(
                Math.abs(nextDirPoint.x - firstDirPoint.x),
                Math.abs(y - firstDirPoint.y) / 2,
              );
              ctx.arcTo(
                nextDirPoint.x,
                firstDirPoint.y,
                nextDirPoint.x,
                nextDirPoint.y,
                0.8 * radius,
              );
              firstDirPoint.x = nextDirPoint.x;
              firstDirPoint.y = (firstDirPoint.y + y) / 2;
              ctx.lineTo(firstDirPoint.x, firstDirPoint.y);
            }
          } else if (currDir === 'L' || currDir === 'R') {
            let { x } = nextDirPoint;
            if (gesture.line.code[i + 1] === 'U' || gesture.line.code[i + 1] === 'D') {
              x = gesture.line.dirPoints[i + 2].x;
            }
            radius = Math.min(
              Math.abs(x - firstDirPoint.x) / 2,
              Math.abs(nextDirPoint.y - firstDirPoint.y),
            );
            ctx.arcTo(
              firstDirPoint.x,
              nextDirPoint.y,
              nextDirPoint.x,
              nextDirPoint.y,
              0.8 * radius,
            );
            firstDirPoint.x = (firstDirPoint.x + x) / 2;
            firstDirPoint.y = nextDirPoint.y;
            ctx.lineTo(firstDirPoint.x, firstDirPoint.y);
          } else {
            radius = Math.min(
              Math.abs(nextDirPoint.x - firstDirPoint.x) / 2,
              Math.abs(currDirPoint.y - firstDirPoint.y),
            );
            ctx.arcTo(firstDirPoint.x, currDirPoint.y, nextDirPoint.x, currDirPoint.y, radius);
            radius = Math.min(
              Math.abs(nextDirPoint.x - firstDirPoint.x) - radius,
              Math.abs(nextDirPoint.y - currDirPoint.y),
            );
            ctx.arcTo(nextDirPoint.x, currDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius);
            firstDirPoint.x = nextDirPoint.x;
            firstDirPoint.y = (currDirPoint.y + nextDirPoint.y) / 2;
            ctx.lineTo(firstDirPoint.x, firstDirPoint.y);
          }
        }
        if (gesture.line.code.length > 0) {
          firstDirPoint = gesture.line.dirPoints[gesture.line.dirPoints.length - 1];
          ctx.lineTo(firstDirPoint.x, firstDirPoint.y);
        }
        ctx.stroke();
        if ((gesture.line.possibleDirs && gesture.line.possibleDirs[nextDir]) || callback) {
          if (nextDir === '3' || nextDir === '7') {
            ctx.lineTo(
              (firstDirPoint.x - firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
              (-firstDirPoint.x + firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
            );
          } else if (nextDir === '1' || nextDir === '9') {
            ctx.lineTo(
              (firstDirPoint.x + firstDirPoint.y + lastPoint.x - lastPoint.y) / 2,
              (firstDirPoint.x + firstDirPoint.y - lastPoint.x + lastPoint.y) / 2,
            );
          }
          ctx.stroke();
        }
        refreshLine.lasttime = Date.now();
        refreshLine.runtime =
          0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now);
      }
    };

    /*
     * Enable/Disable
     */
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('dragend', handleDragEnd, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('wheel', handleWheel, true);

    browser.runtime.onMessage.addListener(receiveMessage);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('dragend', handleDragEnd, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('selectstart', handleSelectStart, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('wheel', handleWheel, true);

      browser.runtime.onMessage.removeListener(receiveMessage);
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
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999999999,
        background: 'transparent',
        margin: 0,
        padding: 0,
      }}
    />
  ) : null;
}
