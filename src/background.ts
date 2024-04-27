import browser from 'webextension-polyfill'
import { BackgroundMessage, ContentMessage, Background } from './types'

const contents: { [id: string]: Background } = []

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port): void => {
  if (port.sender && port.sender.tab) {
    const detail = JSON.parse(port.name)
    console.log(detail)
    const content: Background = {
      name: detail.name,
      frame: detail.frame,
      id: detail.id,
      url: detail.url,
      port,
    }
    initConnectTab(content)
  }
})

const initConnectTab = (content: Background) => {
  content.port.onMessage.addListener((message: BackgroundMessage, port: browser.Runtime.Port) => {
    console.log('content_message', JSON.stringify(message))
    if (message.selection && message.selection.length > 0) {
      message.gesture = `s${message.gesture}`
    } else if (message.links && message.links.length > 0) {
      message.gesture = `l${message.gesture}`
    } else if (message.images && message.images.length > 0) {
      message.gesture = `i${message.gesture}`
    }
    if (message.gesture[0] === 'r') {
      //
    }
    if (message.gesture[0] === 'w') {
      //
    }
  })
  content.port.onDisconnect.addListener((): void => {
    delete contents[content.id]
  })
  const message: ContentMessage = { enable: true }
  content.port.postMessage(message)
}
