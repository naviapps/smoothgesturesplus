import browser from 'webextension-polyfill'
import { SettingsStore } from '../stores/settings'

declare global {
  interface Window {
    find: (
      aString: string,
      aCaseSensitive: boolean,
      aBackwards: boolean,
      aWrapAround: boolean,
      aWholeWord: boolean,
      aSearchInFrames: boolean,
      aShowDialog: boolean,
    ) => boolean
  }
}

export type BackgroundMessage = {
  gesture: string
  startPoint?: { x: number; y: number }
  targets: { gestureid: string }[]
  links: { src: string; gestureid?: string }[]
  images: { src: string; gestureid: string }[]
  selection?: string
  line?: {
    distance: number
    segments: number
  }
  buttonDown?: {
    [button: number]: boolean
  }
}

export type Background = {
  id: string
  tabId: number
  port: browser.Runtime.Port
  url: string
  message: BackgroundMessage
}

export type BackgroundActionProps = {
  name: string
  frame: boolean
  id: string
  url: string
  tabId: number
  port: browser.Runtime.Port
  message: BackgroundMessage
  settings: SettingsStore
}

export type ContentActionProps = {
  //
}

export type ChainGesture = {
  startPoint?: { x: number; y: number }
  rocker?: boolean
  wheel?: boolean
  buttonDown?: {
    [button: number]: boolean
  }
  timeout?: NodeJS.Timeout
}

export type ContentAction = {
  id: string
}

export type ContentMessage = {
  enable?: boolean
  disable?: boolean
  action?: ContentAction
  windowBlurred?: boolean
  chain?: ChainGesture
  syncButton?: {
    id: number
    down: boolean
  }
}
