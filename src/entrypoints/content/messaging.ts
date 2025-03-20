import { defineExtensionMessaging } from '@webext-core/messaging';
import { ImageMessage, LinkMessage, Point } from '@/types';

export type ChainGesture = {
  startPoint?: Point;
  timeout?: number;
  rocker?: boolean;
  wheel?: boolean;
  buttonDown?: Record<number, boolean>;
};

interface ProtocolMap {
  actionStop(): void;
  actionGotoTop(): void;
  actionGotoBottom(): void;
  actionPageUp(): void;
  actionPageDown(): void;
  actionPageNext(): void;
  actionPagePrev(): void;
  actionZoomImgIn(images: ImageMessage[]): void;
  actionZoomImgOut(images: ImageMessage[]): void;
  actionZoomImgZero(images: ImageMessage[]): void;
  actionHideImage(images: ImageMessage[]): void;
  actionShowCookies(): void;
  actionPrint(): void;
  actionCopy(selection: string): void;
  actionCopyLink(links: LinkMessage[]): void;
  actionFindPrev(selection: string): void;
  actionFindNext(selection: string): void;
  windowBlurred(): void;
  chain(data: ChainGesture): void;
  syncButton(data: { id: number; down: boolean }): void;
}

export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>();
