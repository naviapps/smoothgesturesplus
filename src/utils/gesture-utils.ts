import {
  ValidGestures,
  LineDirection,
  RockerDirection,
  WheelDirection,
  Point,
} from '@/types/gesture';
import { isLineDirection, isRockerDirection, isWheelDirection } from '@/utilities';

import { MOUSE_BUTTONS, MouseButton } from './constants';

export const MODIFIER_KEYS = ['Control', 'Alt', 'Shift', 'Meta'] as const;
export type ModifierKey = (typeof MODIFIER_KEYS)[number];

const modifierKeySet = new Set<ModifierKey>(MODIFIER_KEYS);

export function isModifierKey(key: unknown): key is ModifierKey {
  return typeof key === 'string' && modifierKeySet.has(key as ModifierKey);
}

export function buildModifierMask({
  ctrlKey,
  altKey,
  shiftKey,
  metaKey,
}: Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>): string {
  return [ctrlKey, altKey, shiftKey, metaKey].map((pressed) => (pressed ? '1' : '0')).join('');
}

const EDITABLE_ELEMENT_SELECTOR = 'input, textarea, select, [contenteditable]';

export function isEditableElement(element: EventTarget | null | undefined): element is HTMLElement {
  return element instanceof HTMLElement && element.matches(EDITABLE_ELEMENT_SELECTOR);
}

export const DIRECTION_RATIO = 2;

export const determineLineDirection = (from: Point, to: Point): LineDirection => {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX > DIRECTION_RATIO * absY) {
    return deltaX > 0 ? 'R' : 'L';
  }

  if (absY > DIRECTION_RATIO * absX) {
    return deltaY > 0 ? 'D' : 'U';
  }

  const isDiagonalUp = deltaY < 0;
  return deltaX > 0 ? (isDiagonalUp ? '9' : '3') : isDiagonalUp ? '7' : '1';
};

export const getLink = (node: Node): string | undefined => {
  if (!(node instanceof Element)) return undefined;
  const el = node.closest<HTMLElement>('[href]');
  return el?.getAttribute('href') ?? undefined;
};

export function extractLinksFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s"'<>()]+?)(?:[.,!?;:\)\]]+)?(?=\s|$)/g;
  const links: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(text))) {
    links.push(m[1]);
  }
  return links;
}

export function isOverScrollbar(event: MouseEvent): boolean {
  const { clientX, clientY } = event;
  const docCW = document.documentElement.clientWidth;
  const docCH = document.documentElement.clientHeight;

  const scrollbarWidth = window.innerWidth - docCW;
  const scrollbarHeight = window.innerHeight - docCH;

  const overVerticalScrollbar = scrollbarWidth > 0 && clientX >= docCW;
  const overHorizontalScrollbar = scrollbarHeight > 0 && clientY >= docCH;

  return overVerticalScrollbar || overHorizontalScrollbar;
}

const LINUX_MENU_OFFSET = 55;

export function getContextMenuPosition(
  screenX: number,
  screenY: number,
  pointerClientX: number,
  pointerClientY: number,
): Point {
  const isLinux = /linux/i.test(navigator.userAgent);
  if (!isLinux) {
    return { x: screenX, y: screenY };
  }

  const windowLeft = window.screenLeft ?? window.screenX;
  const windowTop = window.screenTop ?? window.screenY;
  const pixelRatio = window.devicePixelRatio;

  const minScreenX = windowLeft + Math.round(pointerClientX * pixelRatio);
  const minScreenY = windowTop + LINUX_MENU_OFFSET + Math.round(pointerClientY * pixelRatio);

  return {
    x: screenX < minScreenX ? screenX + windowLeft : screenX,
    y: screenY < minScreenY ? screenY + windowTop : screenY,
  };
}

export const BUTTON_TO_ROCKER: Readonly<Record<MouseButton, RockerDirection>> = {
  [MouseButton.Left]: 'L',
  [MouseButton.Middle]: 'M',
  [MouseButton.Right]: 'R',
};

export function getRockerDirections(
  buttons: Record<MouseButton, boolean>,
): [RockerDirection, RockerDirection] | null {
  const pressedButtons = MOUSE_BUTTONS.filter((btn) => buttons[btn]);

  if (pressedButtons.length !== 2) return null;
  return [BUTTON_TO_ROCKER[pressedButtons[0]], BUTTON_TO_ROCKER[pressedButtons[1]]];
}

//

// TODO
export const LINE_PREFIXES = ['l', 'i', 's'] as const;

// TODO
function buildKeyboardGestureNode(gesture: string, tree: ValidGestures): void {
  const [, mask, key] = gesture.slice(1).split(':', 3);
  if (!mask || !key) return;

  tree.k ??= {};
  tree.k[mask] ??= [];
  tree.k[mask].push(key);
}

function buildRockerGestureNode(gesture: string, tree: ValidGestures): void {
  const directions = gesture.slice(1);
  tree.r ??= {};

  let node = tree.r as Record<RockerDirection, ValidGestures>;
  for (const direction of directions) {
    if (!isRockerDirection(direction)) continue;
    node[direction] ??= {};
    node = node[direction] as Record<RockerDirection, ValidGestures>;
  }
}

function buildWheelGestureNode(gesture: string, tree: ValidGestures): void {
  const directions = gesture.slice(1);
  tree.w ??= {};

  let node = tree.w as Record<WheelDirection, ValidGestures>;
  for (const direction of directions) {
    if (!isWheelDirection(direction)) continue;
    node[direction] ??= {};
    node = node[direction] as Record<WheelDirection, ValidGestures>;
  }
}

function buildLineGestureNode(gesture: string, tree: ValidGestures): void {
  const prefix = gesture.charAt(0);
  const isLinePrefix = (LINE_PREFIXES as readonly string[]).includes(prefix);
  const sequence = isLinePrefix ? gesture.slice(1) : gesture;

  let node: ValidGestures = tree;
  for (const direction of sequence) {
    if (!isLineDirection(direction)) continue;
    node[direction] ??= {};
    node = node[direction];
  }
}

export function buildValidGestures(gestures: string[]): ValidGestures {
  const tree: ValidGestures = {};

  for (const gesture of gestures) {
    if (!gesture || gesture.length === 0) continue;

    const prefix = gesture.charAt(0);

    switch (prefix) {
      case 'k': {
        buildKeyboardGestureNode(gesture, tree);
        break;
      }
      case 'r': {
        buildRockerGestureNode(gesture, tree);
        break;
      }
      case 'w': {
        buildWheelGestureNode(gesture, tree);
        break;
      }
      default: {
        buildLineGestureNode(gesture, tree);
        break;
      }
    }
  }

  return tree;
}

// TODO
