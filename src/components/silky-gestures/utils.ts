import {
  ValidGestures,
  LineDirection,
  RockerDirection,
  WheelDirection,
  ValidKeyGestures,
} from '@/types/gesture';
import { isLineDirection, isRockerDirection, isWheelDirection } from '@/utilities';

export function buildValidGestures(gestures: string[]): ValidGestures {
  const gestureTree: ValidGestures = {} as ValidGestures;

  for (const gesture of gestures) {
    const prefix = gesture.charAt(0);
    const rest = gesture.slice(1);

    if (prefix === 'k') {
      const [, modifier, keyName] = rest.split(':', 3);
      if (modifier && keyName) {
        gestureTree.k ??= {} as ValidKeyGestures;
        gestureTree.k[modifier] ??= [];
        gestureTree.k[modifier].push(keyName);
      }
      continue;
    }

    if (prefix === 'r') {
      gestureTree.r ??= {};
      let node = gestureTree.r as Record<RockerDirection, ValidGestures>;
      for (const ch of rest) {
        const dir = ch as RockerDirection;
        if (!isRockerDirection(dir)) continue;
        node[dir] ??= {} as ValidGestures;
        node = node[dir] as Record<RockerDirection, ValidGestures>;
      }
      continue;
    }

    if (prefix === 'w') {
      gestureTree.w ??= {};
      let node = gestureTree.w as Record<WheelDirection, ValidGestures>;
      for (const ch of rest) {
        const dir = ch as WheelDirection;
        if (!isWheelDirection(dir)) continue;
        node[dir] ??= {} as ValidGestures;
        node = node[dir] as Record<WheelDirection, ValidGestures>;
      }
      continue;
    }

    const lineSeq = prefix === 'l' || prefix === 'i' || prefix === 's' ? rest : gesture;

    let node: ValidGestures = gestureTree;
    for (const ch of lineSeq) {
      const dir = ch as LineDirection;
      if (!isLineDirection(dir)) continue;
      node[dir] ??= {} as ValidGestures;
      node = node[dir] as ValidGestures;
    }
  }

  return gestureTree;
}

export function isOverScrollbar(event: MouseEvent): boolean {
  const { clientWidth, clientHeight, scrollWidth, scrollHeight } = document.documentElement;

  if (scrollHeight > clientHeight && event.clientX >= clientWidth) {
    return true;
  }

  if (scrollWidth > clientWidth && event.clientY >= clientHeight) {
    return true;
  }

  return false;
}
