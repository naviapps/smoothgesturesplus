import browser from 'webextension-polyfill'
import { BackgroundActionProps, ContentMessage } from './types'

const stop = (): void => {
  window.stop()
}

const pageBack = (): void => {
  window.history.back()
}

const pageForward = (): void => {
  window.history.forward()
}

// TODO
const pageBackClose = (): void => {
  //
}

// TODO
const gotoTop = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({
    action: { id: 'goto-top', startPoint: message.startPoint },
  } as ContentMessage)
}

// TODO
const gotoBottom = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({
    action: { id: 'goto-bottom', startPoint: message.startPoint },
  } as ContentMessage)
}

// TODO
const pageUp = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({
    action: { id: 'page-up', startPoint: message.startPoint },
  } as ContentMessage)
}

// TODO
const pageDown = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({
    action: { id: 'page-down', startPoint: message.startPoint },
  } as ContentMessage)
}

const pageNext = (): void => {
  const link = document.querySelector('link[rel=next][href]') as HTMLLinkElement | null
  if (link) {
    window.location.href = link.href
    return
  }
  let anchor = document.querySelector('a[rel=next][href]') as HTMLAnchorElement | null
  if (anchor) {
    window.location.href = anchor.href
    return
  }
  const anchors = document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>
  for (let i = 0; i < anchors.length; i += 1) {
    anchor = anchors[i]
    if (anchor.innerText.match(/(next|下一页|下页)/i)) {
      window.location.href = anchor.href
      return
    }
  }
  for (let i = 0; i < anchors.length; i += 1) {
    anchor = anchors[i]
    if (anchor.innerText.match(/[>›]/i)) {
      window.location.href = anchor.href
      break
    }
  }
}

const pagePrev = (): void => {
  const link = document.querySelector('link[rel=prev][href]') as HTMLLinkElement | null
  if (link) {
    window.location.href = link.href
    return
  }
  let anchor = document.querySelector('a[rel=prev][href]') as HTMLAnchorElement | null
  if (anchor) {
    window.location.href = anchor.href
    return
  }
  const anchors = document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>
  for (let i = 0; i < anchors.length; i += 1) {
    anchor = anchors[i]
    //
    if (anchor.innerText.match(/(prev|上一页|上页)/i)) {
      window.location.href = anchor.href
      return
    }
    //
  }
  for (let i = 0; i < anchors.length; i += 1) {
    anchor = anchors[i]
    if (anchor.innerText.match(/[<‹]/i)) {
      window.location.href = anchor.href
      break
    }
  }
}

// TODO
const fullscreenWindow = (): void => {
  //
}

// TODO
const saveScreenshotFull = (): void => {
  //
}

// TODO
const zoomIn = (): void => {
  //
}

// TODO
const zoomOut = (): void => {
  //
}

// TODO
const zoomZero = (): void => {
  //
}

// TODO
const zoomImgIn = (action: BackgroundActionProps): void => {
  for (let i = 0; i < action.images.length; i += 1) {
    const img = document.querySelector(
      `img[gestureid='${action.images[i].gestureid}']`,
    ) as HTMLImageElement | null
    if (!img.attr('origsize')) {
      img.attr('origsize', `${img.width()}x${img.height()}`)
    }
    img?.style.width = 1.2 * img.width()
    img?.style.height = 1.2 * img.height()
  }
}

// TODO
const zoomImgOut = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({ action: { id: 'zoom-img-out', images: message.images } } as ContentMessage)
}

// TODO
const zoomImgZero = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({ action: { id: 'zoom-img-zero', images: message.images } } as ContentMessage)
}

// TODO
const sageImage = (): void => {
  //
}

// TODO
const hideImage = ({ port, message }: BackgroundActionProps): void => {
  port.postMessage({ action: { id: 'hide-image', images: message.images } } as ContentMessage)
}

const showCookies = (): void => {
  const l = 100
  const m = 5
  // eslint-disable-next-line no-alert
  window.alert(
    `Cookies stored by this host or domain:\n${`\n${document.cookie}`
      .replace(/; /g, ';\n')
      .replace(new RegExp(`\n(.{${l * 2 - 8})([^\n]{${m}})`, 'gm'), '\n$1\n        $2')
      .replace(new RegExp(`\n(.{${l})([^\n]{${m}})`, 'gm'), '\n$1\n        $2')}`,
  )
}

const print = (): void => {
  window.print()
}

// TODO
const findPrev = ({ message }: ContentActionProps): void => {
  window.find(message.selection.replace(/[\\"']/g, '\\$&'), false, true, true, false, true, true)
}

// TODO
const findNext = ({ message }: ContentActionProps): void => {
  window.find(message.selection.replace(/[\\"']/g, '\\$&'), false, false, true, false, true, true)
}

export const backgroundActions = {
  stop,
  'page-back': pageBack,
  'page-forward': pageForward,
  'page-back-close': pageBackClose,
  'goto-top': gotoTop,
  'goto-bottom': gotoBottom,
  'page-up': pageUp,
  'page-down': pageDown,
  'page-next': pageNext,
  'page-prev': pagePrev,
  // 'save-screenshot': saveScreenshot, // TODO
  // 'save-screenshot-full': saveScreenshotFull, // TODO
  'zoom-in': zoomIn,
  'zoom-out': zoomOut,
  'zoom-zero': zoomZero,
  'zoom-img-in': zoomImgIn,
  'zoom-img-out': zoomImgOut,
  'zoom-img-zero': zoomImgZero,
  // 'save-image': sageImage, // TODO
  'hide-image': hideImage,
  'show-cookies': showCookies,
  print,
  'find-prev': findPrev,
  'find-next': findNext,
}
