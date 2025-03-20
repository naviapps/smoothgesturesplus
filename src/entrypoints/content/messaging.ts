import { defineExtensionMessaging } from '@webext-core/messaging';

import { pagePrevious } from '@/entrypoints/content/actions.ts';
import { ImageMessage, LinkMessage, Point } from '@/types';

export type ChainGesture = {
  startPoint?: Point;
  timeout?: NodeJS.Timeout;
  rocker?: boolean;
  wheel?: boolean;
  buttonDown?: Record<number, boolean>;
};

interface ProtocolMap {
  stop(): void;
  gotoTop(): void;
  gotoBottom(): void;
  pageUp(): void;
  pageDown(): void;
  pageNext(): void;
  pagePrevious(): void;
  zoomImgIn(images: ImageMessage[]): void;
  zoomImgOut(images: ImageMessage[]): void;
  zoomImgZero(images: ImageMessage[]): void;
  hideImage(images: ImageMessage[]): void;
  showCookies(): void;
  print(): void;
  copy(selection: string): void;
  copyLink(links: LinkMessage[]): void;
  findPrevious(selection: string): void;
  findNext(selection: string): void;
  windowBlurred(): void;
  chain(data: ChainGesture): void;
  syncButton(data: { id: number; down: boolean }): void;
}

export const { sendMessage, onMessage, removeAllListeners } = defineExtensionMessaging<ProtocolMap>();
