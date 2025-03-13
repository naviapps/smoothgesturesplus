export type LineDirection = 'U' | 'R' | 'D' | 'L' | '1' | '3' | '7' | '9';
export type RockerDirection = 'L' | 'M' | 'R';
export type WheelDirection = 'U' | 'D';

type ValidGestureTree<T extends string> = {
  [dir in T]?: ValidGestureTree<T>;
};

type ValidLineGestures = ValidGestureTree<LineDirection>;
type ValidRockerGestures = ValidGestureTree<RockerDirection>;
type ValidWheelGestures = ValidGestureTree<WheelDirection>;
type ValidKeyGestures = Record<string, string[]>;

export type ValidGestures = ValidLineGestures & {
  w?: ValidWheelGestures;
  r?: ValidRockerGestures;
  k?: ValidKeyGestures;
};

export type Point = { x: number; y: number };

export type LinkMessage = {
  src: string;
  gestureid?: string;
};

export type ImageMessage = {
  src: string;
  gestureid?: string;
};

export type ContentMessage = {
  gesture?: string;
  startPoint?: Point;
  targets?: { gestureid: string }[];
  links?: LinkMessage[];
  images?: ImageMessage[];
  selection?: string;
  line?: {
    distance: number;
    segments: number;
  };
  buttonDown?: Record<number, boolean>;
  nativeport?: {
    rightclick?: Point;
  };
  syncButton?: {
    id: number;
    down: boolean;
  };
};

export type BackgroundMessage = {
  chain?: {
    startPoint?: Point;
    rocker?: boolean;
    wheel?: boolean;
    buttonDown: Record<number, boolean>;
  };
};
