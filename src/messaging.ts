import { defineExtensionMessaging } from '@webext-core/messaging';
import { ImageMessage, LinkMessage } from '@/types.ts';

interface ProtocolMap {
  'action-stop'(): void;
  'action-goto-top'(): void;
  'action-goto-bottom'(): void;
  'action-page-up'(): void;
  'action-page-down'(): void;
  'action-page-next'(): void;
  'action-page-prev'(): void;
  'action-zoom-img-in'(images: ImageMessage[]): void;
  'action-zoom-img-out'(images: ImageMessage[]): void;
  'action-zoom-img-zero'(images: ImageMessage[]): void;
  'action-hide-image'(images: ImageMessage[]): void;
  'action-show-cookies'(): void;
  'action-print'(): void;
  'action-copy'(selection: string): void;
  'action-copy-link'(links: LinkMessage[]): void;
  'action-find-prev'(selection: string): void;
  'action-find-next'(selection: string): void;
}

export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>();
