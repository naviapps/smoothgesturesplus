import { LineDirection, RockerDirection, WheelDirection } from '@/types/gesture';

export const isLineDirection = (direction: string): direction is LineDirection =>
  ['U', 'R', 'D', 'L', '1', '3', '7', '9'].includes(direction);

export const isRockerDirection = (direction: string): direction is RockerDirection =>
  ['L', 'M', 'R'].includes(direction);

export const isWheelDirection = (direction: string): direction is WheelDirection =>
  ['U', 'D'].includes(direction);
