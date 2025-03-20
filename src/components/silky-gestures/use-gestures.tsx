import { useCallback, useEffect, useRef, useState } from 'react';

import { buildValidGestures, isOverScrollbar } from '@/components/silky-gestures/utils';
import { Point, ValidGestures, WheelDirection } from '@/types/gesture';

export type UseGesturesProps = {
  gestures?: string[];
  onGesture?: (code: string) => void;
};

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

export function useGestures({ gestures = [], onGesture }: UseGesturesProps = {}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const validGestures = useMemo<ValidGestures>(() => buildValidGestures(gestures), [gestures]);

  // gesture states
  const gestureRef = useRef<GestureState>({
    events: false,
    ranges: [],
    rocker: false,
    wheel: false,
  });

  // mouse event states
  const buttonDownRef = useRef<Record<number, boolean>>({});
  const blockClickRef = useRef<Record<number, boolean>>({});
  const blockContextRef = useRef<boolean>(true);
  // focus state
  const focusRef = useRef<EventTarget | undefined>(undefined);

  /*
   * Start/End Gestures
   */
  // TODO
  const endGesture = useCallback((): void => {
    setIsOpen(false);

    gestureRef.current = { events: false, ranges: [], rocker: false, wheel: false };
  }, []);

  const startGesture = useCallback(
    (options: StartGestureOptions = {}): void => {
      const { point, target, line = false, rocker = false, wheel = false } = options;

      endGesture();

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

  // TODO
  const sendGesture = useCallback(
    (code: string): void => {
      onGesture?.(code);
    },
    [onGesture],
  );

  /*
   * Page Events
   */
  const handleMouseDown = useCallback(
    (event: MouseEvent): void => {
      blockClickRef.current[event.button] = false;
      blockContextRef.current = event.button !== 2;

      // block scrollbars
      if (event.target instanceof HTMLElement && isOverScrollbar(event)) {
        endGesture();
        return;
      }

      // TODO
      buttonDownRef.current[event.button] = true;

      event.preventDefault();
      event.stopPropagation();

      const pressedButtons = [0, 1, 2].filter((i) => buttonDownRef.current[i]);
      const rockerEnabled =
        pressedButtons.length === 1 &&
        Boolean(validGestures.r?.[(['L', 'M', 'R'] as const)[pressedButtons[0]]]);

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

  // TODO
  const handleMouseUp = useCallback((event: MouseEvent): void => {
    //
  }, []);

  // TODO
  const handleMouseLeave = useCallback((): void => {
    endGesture();
  }, [endGesture]);

  // TODO
  const handleDragEnd = useCallback((): void => {
    endGesture();
  }, [endGesture]);

  // TODO
  const handleContextMenu = useCallback((event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // TODO
  const handleClick = useCallback((event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // TODO
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
      if (validGestures.k?.[modifier]?.includes(keySeq)) {
        startGesture();
        sendGesture(`k${modifier}:${keySeq}`);
        endGesture();
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [validGestures.k, startGesture, sendGesture, endGesture],
  );

  // TODO
  const handleKeyUp = useCallback((): void => {
    //endGesture();
  }, []);

  const handleFocus = useCallback((event: FocusEvent): void => {
    focusRef.current = event.target ?? undefined;
  }, []);

  const handleBlur = useCallback((): void => {
    focusRef.current = undefined;
  }, []);

  // TODO
  const handleMouseMove = useCallback((event: MouseEvent): void => {
    //
  }, []);

  // TODO
  const handleWheel = useCallback(
    (event: WheelEvent): void => {
      const direction: WheelDirection = event.deltaY < 0 ? 'U' : 'D';
      event.preventDefault();
      event.stopPropagation();
      sendGesture('w');
    },
    [sendGesture],
  );

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('dragend', handleDragEnd, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('wheel', handleWheel, true);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('dragend', handleDragEnd, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('wheel', handleWheel, true);
    };
  }, [
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleDragEnd,
    handleContextMenu,
    handleClick,
    handleKeyDown,
    handleKeyUp,
    handleFocus,
    handleBlur,
    handleMouseMove,
    handleWheel,
  ]);

  return { isOpen, endGesture };
}
