import { throttle } from 'es-toolkit';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Point, ValidGestures, WheelDirection } from '@/types/gesture';
import { MOUSE_BUTTONS, MouseButton } from '@/utils/constants';
import {
  buildModifierMask,
  determineLineDirection,
  extractLinksFromText,
  getContextMenuPosition,
  getLink,
  getRockerDirections,
  isEditableElement,
  isModifierKey,
  isOverScrollbar,
} from '@/utils/gesture-utils';

type ChainMessage = {
  startPoint: Point;
  rocker: boolean;
  wheel: boolean;
  buttonDown?: Record<number, boolean>;
};

type SyncButtonMessage = {
  id: number;
  down: boolean;
};

export type UseGesturesOptions = {
  holdButton?: number;
  contextOnLink?: boolean;
  selectToLink?: boolean;
  validGestures?: ValidGestures;
  onSyncButton?: (button: SyncButtonMessage) => Promise<void>;
  onRightClick?: (point: Point) => Promise<void>;
  onRefreshLine?: () => void;
  onGesture?: (message: GestureMessage) => Promise<void>;
};

type LineState = {
  code: string;
  points: Point[];
  dirPoints: Point[];
  possibleDirs?: ValidGestures;
};

type GestureState = {
  events: boolean;
  startPoint?: Point;
  targets: EventTarget[];
  selection?: string;
  ranges: Range[];
  line?: LineState;
  rocker: boolean;
  wheel: boolean;
};

type TargetMessage = {
  gestureId: string;
};

type LinkMessage = {
  href: string;
  gestureId?: string;
};

type ImageMessage = {
  src: string;
  gestureId: string;
};

type GestureMessage = {
  gesture: string;
  startPoint?: Point;
  targets: TargetMessage[];
  links: LinkMessage[];
  images: ImageMessage[];
  selection?: string;
  buttonDown?: Record<number, boolean>;
};

export function useGestures(options: UseGesturesOptions = {}) {
  const {
    holdButton = MouseButton.Right,
    contextOnLink = false,
    selectToLink = true,
    validGestures,
    onSyncButton,
    onRightClick,
    onRefreshLine,
    onGesture,
  } = options;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // gesture states
  const gestureRef = useRef<GestureState>({
    events: false,
    targets: [],
    ranges: [],
    rocker: false,
    wheel: false,
  });

  // button syncing between tabs
  const syncButtonsRef = useRef<{ timeout: number } | undefined>(undefined);

  // mouse event states
  const buttonDownRef = useRef<Record<number, boolean>>({});
  const blockClickRef = useRef<Record<number, boolean>>({});
  const blockContextRef = useRef<boolean>(true);
  const forceContextRef = useRef<boolean>(false);
  // key mod down states
  const keyModRef = useRef<string>('0000');
  const keyEscapeRef = useRef<boolean>(false);
  // focus state
  const focusRef = useRef<EventTarget | undefined>(undefined);

  /*
   * Start/End Gestures
   */
  const endGesture = useCallback((): void => {
    setIsOpen(false);
    gestureRef.current = { events: false, targets: [], ranges: [], rocker: false, wheel: false };
  }, []);

  const startGesture = useCallback(
    (
      point?: Point,
      target?: EventTarget,
      line: boolean = false,
      rocker: boolean = false,
      wheel: boolean = false,
    ): void => {
      endGesture();

      const sel = window.getSelection?.();
      const selection = sel?.toString();
      const ranges = sel ? Array.from({ length: sel.rangeCount }, (_, i) => sel.getRangeAt(i)) : [];

      gestureRef.current = {
        events: true,
        startPoint: point,
        targets: target ? [target] : [],
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

  const sendGesture = useCallback(
    async (code: string): Promise<void> => {
      if (!code) return;

      const message: GestureMessage = {
        gesture: code,
        startPoint: gestureRef.current.startPoint,
        targets: [],
        links: [],
        images: [],
        selection: gestureRef.current.selection,
      };

      if (selectToLink && gestureRef.current.selection) {
        for (const url of extractLinksFromText(gestureRef.current.selection)) {
          message.links.push({ href: url });
        }
      }

      for (const element of gestureRef.current.targets) {
        if (!(element instanceof HTMLElement)) continue;
        const gestureId = crypto.randomUUID();
        element.dataset.gestureId = gestureId;
        message.targets.push({ gestureId });

        const href = getLink(element);
        if (href) {
          message.links.push({ href, gestureId });
        }
        if (element instanceof HTMLImageElement) {
          message.images.push({ src: element.src, gestureId });
        }
      }

      if (syncButtonsRef.current) {
        message.buttonDown = buttonDownRef.current;
      }

      await onGesture?.(message);

      if (code[0] === 'w') {
        gestureRef.current.line = undefined;
        gestureRef.current.rocker = false;
      } else if (code[0] === 'r') {
        gestureRef.current.line = undefined;
        gestureRef.current.wheel = false;
      } else {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          for (const range of gestureRef.current.ranges) {
            sel.addRange(range);
          }
        }
        endGesture();
      }
    },
    [onGesture, selectToLink, endGesture],
  );

  const moveGesture = useCallback(
    (event: MouseEvent | WheelEvent, diagonal: boolean = false): void => {
      if (!gestureRef.current.startPoint) {
        gestureRef.current.startPoint = { x: event.clientX, y: event.clientY };
      }

      const moveDistance = {
        x: Math.abs(event.clientX - gestureRef.current.startPoint.x),
        y: Math.abs(event.clientY - gestureRef.current.startPoint.y),
      };

      if (
        (gestureRef.current.rocker || gestureRef.current.wheel) &&
        (moveDistance.x > 0 || moveDistance.y > 2)
      ) {
        gestureRef.current.rocker = false;
        gestureRef.current.wheel = false;
      }

      if (!gestureRef.current.line) {
        return;
      }

      const next = { x: event.clientX, y: event.clientY };
      gestureRef.current.line.points.push(next);

      const lastPoint = gestureRef.current.line.dirPoints.at(-1)!;
      const diffx = next.x - lastPoint.x;
      const diffy = next.y - lastPoint.y;

      onRefreshLine?.();
      if (Math.max(Math.abs(diffx), Math.abs(diffy)) > 10) {
        setIsOpen(true);
      }

      const lastDirection = gestureRef.current.line.code.slice(-1) || 'X';
      const newDirection = determineLineDirection(lastPoint, next);

      if (newDirection === lastDirection) {
        gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1] = next;
      } else if (
        Math.max(Math.abs(diffx), Math.abs(diffy)) > 25 &&
        (diagonal || /^[RLUD]$/.test(newDirection))
      ) {
        if (gestureRef.current.line.possibleDirs) {
          gestureRef.current.line.possibleDirs = gestureRef.current.line.possibleDirs[newDirection];
        }

        if (gestureRef.current.line.possibleDirs || !validGestures) {
          gestureRef.current.line.code += newDirection;
          gestureRef.current.line.dirPoints.push(next);
        } else {
          endGesture();
          blockContextRef.current = true;
        }
      }
    },
    [onRefreshLine, validGestures, endGesture],
  );

  const wheelGesture = useCallback(
    async (event: WheelEvent): Promise<void> => {
      if (event.target instanceof HTMLIFrameElement) {
        endGesture();
      }

      moveGesture(event);

      if (!gestureRef.current.wheel || event.deltaY === 0) {
        return;
      }

      const dir: WheelDirection = event.deltaY < 0 ? 'U' : 'D';
      if (validGestures && !validGestures.w?.[dir]) {
        return;
      }

      if (syncButtonsRef.current?.timeout) {
        clearTimeout(syncButtonsRef.current.timeout);
      }
      syncButtonsRef.current = {
        timeout: window.setTimeout(() => {
          syncButtonsRef.current = undefined;
        }, 500),
      };

      await sendGesture(`w${dir}`);

      if (holdButton === MouseButton.Right) {
        blockContextRef.current = true;
      }
      if (holdButton === MouseButton.Left) {
        window.getSelection()?.removeAllRanges();
      }
      blockClickRef.current[holdButton] = true;

      event.preventDefault();
      event.stopPropagation();
    },
    [endGesture, moveGesture, validGestures, sendGesture, holdButton],
  );

  /*
   * Page Events
   */
  const handleMouseDown = useCallback(
    async (event: MouseEvent): Promise<void> => {
      blockClickRef.current[event.button] = false;
      blockContextRef.current = event.button !== MouseButton.Right;

      // block scrollbars
      const element = event.target instanceof HTMLElement ? event.target : undefined;
      if (element && isOverScrollbar(event)) {
        endGesture();
        return;
      }

      if (syncButtonsRef.current) {
        await onSyncButton?.({ id: event.button, down: true });
      }
      buttonDownRef.current[event.button] = true;

      if (forceContextRef.current) {
        if (event.button === MouseButton.Right) {
          endGesture();
          return;
        }
        forceContextRef.current = false;
      }

      moveGesture(event);

      if (gestureRef.current.rocker) {
        const dirs = getRockerDirections(buttonDownRef.current);
        if (dirs) {
          const [first, second] = dirs;
          if (!validGestures || validGestures.r?.[first]?.[second]) {
            if (syncButtonsRef.current?.timeout) {
              clearTimeout(syncButtonsRef.current.timeout);
            }
            syncButtonsRef.current = {
              timeout: window.setTimeout(() => {
                syncButtonsRef.current = undefined;
              }, 500),
            };

            await sendGesture(`r${first}${second}`);
            window.getSelection()?.removeAllRanges();

            blockContextRef.current = true;
            MOUSE_BUTTONS.forEach((i) => (blockClickRef.current[i] = true));
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }

      if (
        contextOnLink &&
        event.button === MouseButton.Right &&
        event.target instanceof Node &&
        getLink(event.target)
      ) {
        return;
      }

      if (
        holdButton === MouseButton.Left &&
        event.button === MouseButton.Left &&
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (
        holdButton === MouseButton.Left &&
        (keyModRef.current !== '0000' || keyEscapeRef.current)
      ) {
        return; // allow selection
      }

      if (
        holdButton === MouseButton.Left &&
        event.button === MouseButton.Left &&
        event.target instanceof HTMLImageElement
      ) {
        event.preventDefault();
      }

      // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture), then block auto scrolling with a middle
      if (
        event.button === MouseButton.Middle &&
        (!validGestures || validGestures.r?.M) &&
        navigator.userAgent.includes('Win')
      ) {
        event.preventDefault();
      }

      const pressed = MOUSE_BUTTONS.filter((i) => buttonDownRef.current[i]);
      const rockerEnabled =
        pressed.length === 1 &&
        (!validGestures || Boolean(validGestures.r?.[(['L', 'M', 'R'] as const)[pressed[0]]]));
      const wheelEnabled =
        event.button === MouseButton.Right && (!validGestures || Boolean(validGestures.w));

      startGesture(
        { x: event.clientX, y: event.clientY },
        element,
        event.button === holdButton,
        rockerEnabled,
        wheelEnabled,
      );
    },
    [
      endGesture,
      onSyncButton,
      moveGesture,
      validGestures,
      sendGesture,
      contextOnLink,
      holdButton,
      startGesture,
    ],
  );

  const handleMouseUp = useCallback(
    async (event: MouseEvent): Promise<void> => {
      if (event.button === holdButton && gestureRef.current.line) {
        moveGesture(event, true);
        if (gestureRef.current.line?.code) {
          await sendGesture(gestureRef.current.line.code);
          event.preventDefault();

          if (event.button === MouseButton.Left) {
            window.getSelection()?.removeAllRanges();
          }
          if (event.button === MouseButton.Right) {
            blockContextRef.current = true;
          }
          blockClickRef.current[event.button] = true;
        }
      }

      gestureRef.current.line = undefined;
      gestureRef.current.wheel = false;

      if (event.button !== MouseButton.Right) {
        blockContextRef.current = true;
      }

      if (
        event.button === MouseButton.Right &&
        !forceContextRef.current &&
        !blockContextRef.current &&
        !buttonDownRef.current[MouseButton.Left] &&
        !buttonDownRef.current[MouseButton.Middle] &&
        !navigator.userAgent.includes('Win')
      ) {
        forceContextRef.current = true;
        window.setTimeout(() => {
          forceContextRef.current = false;
        }, 600);

        const menuPos = getContextMenuPosition(
          event.screenX,
          event.screenY,
          event.clientX,
          event.clientY,
        );
        await onRightClick?.(menuPos);
      }

      if (blockClickRef.current[event.button]) {
        event.preventDefault();
      }

      buttonDownRef.current[event.button] = false;
      if (syncButtonsRef.current) {
        await onSyncButton?.({ id: event.button, down: false });
      }

      if (!buttonDownRef.current[MouseButton.Left] && !buttonDownRef.current[MouseButton.Right]) {
        gestureRef.current.rocker = false;
      }

      if (!gestureRef.current.rocker) {
        endGesture();
      }
    },
    [holdButton, moveGesture, sendGesture, onRightClick, onSyncButton, endGesture],
  );

  const handleDragEnd = useCallback((): void => {
    buttonDownRef.current = {};
  }, []);

  const handleClick = useCallback((event: MouseEvent): void => {
    if (blockClickRef.current[event.button]) {
      event.preventDefault();
      event.stopPropagation();
    }
    blockClickRef.current[event.button] = false;
  }, []);

  const handleContextMenu = useCallback(
    (event: MouseEvent): void => {
      const shouldBlockContext =
        (blockContextRef.current ||
          (buttonDownRef.current[MouseButton.Right] &&
            (gestureRef.current.line || gestureRef.current.rocker || gestureRef.current.wheel))) &&
        !forceContextRef.current;

      if (shouldBlockContext) {
        event.preventDefault();
        event.stopPropagation();
        blockContextRef.current = false;
      } else {
        // since the context menu is about to be shown, close all open gestures.
        endGesture();
        buttonDownRef.current = {};
      }
    },
    [endGesture],
  );

  const handleSelectStart = useCallback((): void => {
    if (holdButton === MouseButton.Left && keyModRef.current === '0000' && !keyEscapeRef.current) {
      window.getSelection()?.removeAllRanges();
    }
  }, [holdButton]);

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent): Promise<void> => {
      if (event.key === 'Escape') {
        endGesture();
        keyEscapeRef.current = true;
        return;
      }

      const mod = buildModifierMask(event);
      if (isModifierKey(event.key)) {
        keyModRef.current = mod;
        return;
      }

      const keyIsInvalid =
        validGestures &&
        ((mod === '0000' && isEditableElement(focusRef.current)) ||
          !validGestures.k?.[mod].includes(`${event.key}:${event.code}`));

      if (keyIsInvalid) {
        return;
      }

      startGesture();
      await sendGesture(`k${mod}:${event.key}:${event.code}`);

      event.preventDefault();
      event.stopPropagation();
    },
    [endGesture, validGestures, startGesture, sendGesture],
  );

  const handleKeyUp = useCallback((event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      keyEscapeRef.current = false;
      return;
    }

    if (isModifierKey(event.key)) {
      keyModRef.current = buildModifierMask(event);
    }
  }, []);

  const handleFocus = useCallback((event: FocusEvent): void => {
    focusRef.current = event.target ?? undefined;
  }, []);

  const handleBlur = useCallback((): void => {
    focusRef.current = undefined;
  }, []);

  const handleMouseMove = useMemo(
    () =>
      throttle(
        (event: MouseEvent): void => {
          if (gestureRef.current.events) {
            moveGesture(event);
          }
        },
        16,
        { edges: ['leading', 'trailing'] },
      ),
    [moveGesture],
  );

  const handleWheel = useMemo(
    () =>
      throttle(
        async (event: WheelEvent): Promise<void> => {
          if (gestureRef.current.events) {
            await wheelGesture(event);
          }
        },
        50,
        { edges: ['leading', 'trailing'] },
      ),
    [wheelGesture],
  );

  const handleWindowBlurred = useCallback((): void => {
    buttonDownRef.current = {};
    blockClickRef.current = {};
    blockContextRef.current = true;
    endGesture();
  }, [endGesture]);

  const handleChain = useCallback(
    ({ startPoint, rocker, wheel, buttonDown }: ChainMessage) => {
      const target = startPoint
        ? (document.elementFromPoint(startPoint.x, startPoint.y) ?? undefined)
        : undefined;

      startGesture(startPoint, target, false, rocker, wheel);

      blockContextRef.current = true;

      if (buttonDown) {
        MOUSE_BUTTONS.forEach((btn) => {
          if (buttonDown[btn]) {
            blockClickRef.current[btn] = true;
          }
          buttonDownRef.current[btn] ??= buttonDown[btn];
        });
      }
    },
    [startGesture],
  );

  const handleSyncButton = useCallback(({ id, down }: SyncButtonMessage): void => {
    buttonDownRef.current[id] = down;
  }, []);

  /*
   * Enable/Disable
   */
  useEffect(() => {
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
    window.addEventListener('blur', handleWindowBlurred);

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
      window.removeEventListener('blur', handleWindowBlurred);
      handleMouseMove.cancel();
      handleWheel.cancel();
    };
  }, [
    handleMouseDown,
    handleMouseUp,
    handleDragEnd,
    handleClick,
    handleContextMenu,
    handleSelectStart,
    handleKeyDown,
    handleKeyUp,
    handleFocus,
    handleBlur,
    handleMouseMove,
    handleWheel,
    handleWindowBlurred,
  ]);

  return {
    isOpen,
    gestureRef,
    handleChain,
    handleSyncButton,
  };
}
