import { defineExtensionMessaging } from '@webext-core/messaging';
import { ImageMessage, LinkMessage, Point } from '@/types.ts';

export type GestureMessage = {
  gesture: string;
  startPoint?: Point;
  targets: { gestureid: string }[];
  links: LinkMessage[];
  images: ImageMessage[];
  selection?: string;
  buttonDown?: Record<number, boolean>;
};

interface ProtocolMap {
  gesture(data: GestureMessage): void;
  syncButton(data: { id: number; down: boolean }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
