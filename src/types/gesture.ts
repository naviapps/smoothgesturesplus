export type LineDirection = 'U' | 'R' | 'D' | 'L' | '1' | '3' | '7' | '9';

export type RockerDirection = 'L' | 'M' | 'R';

export type WheelDirection = 'U' | 'D';

export type ValidKeyGestures = Record<string, string[]>;

export type ValidGestures = {
  k?: ValidKeyGestures;
  r?: { [D in RockerDirection]?: ValidGestures };
  w?: { [D in WheelDirection]?: ValidGestures };
} & {
  [D in LineDirection]?: ValidGestures;
} & {
  [D in RockerDirection]?: ValidGestures;
} & {
  [D in WheelDirection]?: ValidGestures;
};

export type Point = { x: number; y: number };
