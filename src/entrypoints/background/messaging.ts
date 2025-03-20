import { defineExtensionMessaging } from '@webext-core/messaging';

import { ImageMessage, LinkMessage, Point } from '@/types';

export type GestureMessage = {
  gesture: string;
  startPoint?: Point;
  targets: { gestureid: string }[];
  links: LinkMessage[];
  images: ImageMessage[];
  selection?: string;
  buttonDown?: Record<number, boolean>;
};

export interface ProtocolMap {
  gesture(data: GestureMessage): void;
  syncButton(data: { id: number; down: boolean }): void;
  nativeport(data: { rightclick: Point }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
