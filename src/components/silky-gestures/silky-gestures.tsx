import Konva from 'konva';
import React, { useRef, useEffect, useMemo } from 'react';
import { Label, Layer, Shape, Stage, Tag, Text } from 'react-konva';

import { useGestures } from '@/components/silky-gestures/use-gestures';
import { onMessage, removeAllListeners } from '@/entrypoints/content/messaging';
import { ValidGestures } from '@/types/gesture.ts';
import { buildValidGestures, determineLineDirection } from '@/utils/gesture-utils';

export type SilkyGesturesProps = React.ComponentPropsWithoutRef<typeof Stage> & {
  gestures: string[];
  width?: number;
  height?: number;
  lineStroke?: string;
  lineStrokeWidth?: number;
  callback?: (gesture: string) => void;
};

export function SilkyGestures({
  gestures = [],
  width = window.innerWidth,
  height = window.innerHeight,
  lineStroke,
  lineStrokeWidth,
  callback,
  ...rest
}: SilkyGesturesProps) {
  const shapeRef = useRef<Konva.Shape>(null);

  const handleRefreshLine = (): void => {
    console.log(gestureRef.current.line);
    refreshLineAsync();
  };

  const validGestures = useMemo<ValidGestures>(() => buildValidGestures(gestures), [gestures]);

  const { isOpen, gestureRef, handleChain, handleSyncButton } = useGestures({
    validGestures,
    onRefreshLine: handleRefreshLine,
    onRightClick: async (point) => {
      console.log(point);
    },
    onGesture: async (message) => {
      console.log(message);
    },
  });

  /*
   * Helpers
   */
  const refreshLineAsync: { (): void; timeout?: number } = () => {
    if (!refreshLineAsync.timeout) {
      const elapsedTime = Date.now() - (refreshLine.lasttime ?? 0);
      const minTime = Math.min(500, 4 * (refreshLine.runtime ?? 0));
      if (minTime < elapsedTime) {
        refreshLine();
        shapeRef.current?.getLayer()?.batchDraw();
      } else {
        refreshLineAsync.timeout = window.setTimeout(() => {
          refreshLine();
          shapeRef.current?.getLayer()?.batchDraw();
          refreshLineAsync.timeout = undefined;
        }, minTime - elapsedTime);
      }
    }
  };

  const refreshLine: { (): void; lasttime?: number; runtime?: number } = () => {
    if (!gestureRef.current.line) return;
    const now = Date.now();
    refreshLine.lasttime = Date.now();
    refreshLine.runtime = 0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now);
  };

  const renderGesturePath = (context: Konva.Context, shape: Konva.Shape): void => {
    if (!gestureRef.current.line) return;

    const line = gestureRef.current.line;
    const dirPoints = line.dirPoints;
    const code = line.code;
    const lastPoint = line.points.at(-1)!;
    const lastDirPoint = dirPoints.at(-1)!;
    const nextDir = determineLineDirection(lastDirPoint, lastPoint);

    context.beginPath();

    let first = { ...dirPoints[0] };
    if (code.length > 0) {
      const next = dirPoints[1];
      if (code[0] === 'L' || code[0] === 'R') {
        first.y = next.y;
      } else {
        first.x = next.x;
      }
    }
    context.moveTo(first.x, first.y);

    for (let i = 1; i < code.length; i++) {
      const prev = code[i - 1];
      const curr = code[i];
      const cp = dirPoints[i];
      const np = dirPoints[i + 1];
      if (!cp || !np) break;

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const mid = (a: number, b: number) => (a + b) / 2;
      let r: number;

      if (prev === 'L' || prev === 'R') {
        if (curr === 'L' || curr === 'R') {
          r = Math.min(Math.abs(cp.x - first.x), Math.abs(np.y - first.y) / 2);
          context.arcTo(cp.x, first.y, cp.x, np.y, r);
          r = Math.min(Math.abs(np.x - cp.x), Math.abs(np.y - first.y) - r);
          context.arcTo(cp.x, np.y, np.x, np.y, r);
          first = { x: mid(cp.x, np.x), y: np.y };
        } else {
          let y = np.y;
          if (code[i + 1] === 'L' || code[i + 1] === 'R') {
            y = dirPoints[i + 2]?.y ?? y;
          }
          r = Math.min(Math.abs(np.x - first.x), Math.abs(y - first.y) / 2);
          context.arcTo(np.x, first.y, np.x, np.y, 0.8 * r);
          first = { x: np.x, y: mid(first.y, y) };
        }
      } else if (curr === 'L' || curr === 'R') {
        let x = np.x;
        if (code[i + 1] === 'U' || code[i + 1] === 'D') {
          x = dirPoints[i + 2]?.x ?? x;
        }
        r = Math.min(Math.abs(x - first.x) / 2, Math.abs(np.y - first.y));
        context.arcTo(first.x, np.y, np.x, np.y, 0.8 * r);
        first = { x: mid(first.x, x), y: np.y };
      } else {
        r = Math.min(Math.abs(np.x - first.x) / 2, Math.abs(cp.y - first.y));
        context.arcTo(first.x, cp.y, np.x, cp.y, r);
        r = Math.min(Math.abs(np.x - first.x) - r, Math.abs(np.y - cp.y));
        context.arcTo(np.x, cp.y, np.x, np.y, r);
        first = { x: np.x, y: mid(cp.y, np.y) };
      }

      context.lineTo(first.x, first.y);
    }

    if (code.length > 0) {
      const end = dirPoints.at(-1)!;
      context.lineTo(end.x, end.y);
    }

    if ((line.possibleDirs && line.possibleDirs[nextDir]) || callback) {
      if (nextDir === '3' || nextDir === '7') {
        const x = (first.x - first.y + lastPoint.x + lastPoint.y) / 2;
        const y = (-first.x + first.y + lastPoint.x + lastPoint.y) / 2;
        context.lineTo(x, y);
      } else if (nextDir === '1' || nextDir === '9') {
        const x = (first.x + first.y + lastPoint.x - lastPoint.y) / 2;
        const y = (first.x + first.y - lastPoint.x + lastPoint.y) / 2;
        context.lineTo(x, y);
      }
    }

    context.stroke();
    context.fillStrokeShape(shape);
  };

  useEffect(() => {
    /*
     * Enable/Disable
     */

    /*
     * Extension Communication
     */
    onMessage('chain', ({ data }) => {
      //handleChain(data);
    });
    onMessage('syncButton', ({ data }) => {
      handleSyncButton(data);
    });

    return () => {
      removeAllListeners();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <Stage width={width} height={height} {...rest}>
      <Layer>
        <Label x={width / 2} y={height / 2} offsetX={100} offsetY={20}>
          <Tag fill="rgba(0, 0, 0, 0.6)" stroke="white" strokeWidth={2} />
          <Text
            text="背景＋ボーダー付きテキスト"
            fontSize={24}
            fill="#FFFFFF"
            padding={20}
            shadowColor="black"
            shadowBlur={4}
            shadowOffset={{ x: 2, y: 2 }}
            shadowOpacity={0.5}
          />
        </Label>
        <Shape
          ref={shapeRef}
          stroke={lineStroke}
          strokeWidth={lineStrokeWidth}
          lineJoin="round"
          lineCap="round"
          sceneFunc={renderGesturePath}
        />
      </Layer>
    </Stage>
  );
}
