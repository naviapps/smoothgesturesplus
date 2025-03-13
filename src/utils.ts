import { LineDirection, RockerDirection, WheelDirection } from '@/types';

export const isLineDirection = (char: string): char is LineDirection =>
  ['U', 'R', 'D', 'L', '1', '3', '7', '9'].includes(char);

export const isRockerDirection = (char: string): char is RockerDirection =>
  ['L', 'M', 'R'].includes(char);

export const isWheelDirection = (char: string): char is WheelDirection => ['U', 'D'].includes(char);
