import { useEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'
import { useSettingStore, ValidGestures } from './stores/settings'
import useEffectOnce from './hooks/useEffectOnce'
import useWindowSize from './hooks/useWindowSize'
import { ContentMessage, BackgroundMessage, ContentAction } from './types'

type Gesture = {
  events?: boolean
  startPoint?: { x: number; y: number }
  targets?: Element[]
  selection?: string
  ranges?: Range[]
  timeout?: NodeJS.Timeout
  line?: {
    code: string
    points: { x: number; y: number }[]
    dirPoints: { x: number; y: number }[]
    possibleDirs?: ValidGestures
    distance: number
  }
  rocker?: boolean
  wheel?: boolean
}

export function SmoothGestures() {
  /*
   * Local Variables
   */
  // unique content script ID
  const idRef = useRef<string>(
    Math.floor(Math.random() * 2 ** 30).toString(32) +
      Math.floor(Math.random() * 2 ** 30).toString(32),
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { width, height } = useWindowSize()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const settings = useSettingStore((state) => ({
    holdButton: state.holdButton,
    contextOnLink: state.contextOnLink,
    newTabUrl: state.newTabUrl,
    newTabRight: state.newTabRight,
    newTabLinkRight: state.newTabLinkRight,
    trailColor: state.trailColor,
    trailWidth: state.trailWidth,
    trailBlock: state.trailBlock,
    blacklist: state.blacklist,
    selectToLink: state.selectToLink,
    rValidGestures: state.rValidGestures,
    wValidGestures: state.wValidGestures,
    kValidGestures: state.kValidGestures,
    validGestures: state.validGestures,
  }))

  // gesture states
  const gestureRef = useRef<Gesture>({})

  // button syncing between tabs
  const syncButtonsRef = useRef<
    | {
        timeout: NodeJS.Timeout
      }
    | boolean
  >(false)

  // mouse event states
  const buttonDownRef = useRef<{ [button: number]: boolean }>({})
  const blockClickRef = useRef<{ [button: number]: boolean }>({})
  const blockContextRef = useRef<boolean>(false)
  const forceContextRef = useRef<boolean>(false)
  // key mod down states
  const keyModRef = useRef<string>('0000')
  const keyEscapeRef = useRef<boolean>(false)
  // focus state
  const focusRef = useRef<Element | undefined>()

  // TODO
  const portRef = useRef<browser.Runtime.Port>()
  const [callback, setCallback] = useState<((code: string) => void) | undefined>(undefined)
  let enabled: boolean = false

  /*
   * Extension Communication
   */
  const connect = (): void => {
    const connectInfo: browser.Runtime.ConnectConnectInfoType = {
      name: JSON.stringify({
        name: 'smoothgestures.tab',
        frame: !window.parent,
        id: idRef.current,
        url: window.location.href,
      }),
    }
    portRef.current = browser.runtime.connect(connectInfo)
    portRef.current.onMessage.addListener(receiveMessage)
    portRef.current.onDisconnect.addListener(disable)
  }

  const receiveMessage = (message: ContentMessage): void => {
    if ('enable' in message) {
      if (message.enable) {
        enable()
      } else {
        disable()
      }
    }
    if (message.disable) {
      disable()
    }
    if (message.action) {
      localAction(message.action)
    }
    if (message.windowBlurred) {
      buttonDownRef.current = {}
      blockClickRef.current = {}
      blockContextRef.current = true
      endGesture()
    }
    if (message.chain) {
      startGesture(
        message.chain.startPoint,
        message.chain.startPoint
          ? document.elementFromPoint(message.chain.startPoint.x, message.chain.startPoint.y) ??
              undefined
          : undefined,
        undefined,
        message.chain.rocker,
        message.chain.wheel,
      )
      blockContextRef.current = true
      if (message.chain.buttonDown) {
        if (message.chain.buttonDown[0]) {
          blockClickRef.current[0] = true
        }
        if (message.chain.buttonDown[1]) {
          blockClickRef.current[1] = true
        }
        if (message.chain.buttonDown[2]) {
          blockClickRef.current[2] = true
        }
        if (buttonDownRef.current[0] === undefined) {
          buttonDownRef.current[0] = message.chain.buttonDown[0]
        }
        if (buttonDownRef.current[1] === undefined) {
          buttonDownRef.current[1] = message.chain.buttonDown[1]
        }
        if (buttonDownRef.current[2] === undefined) {
          buttonDownRef.current[2] = message.chain.buttonDown[2]
        }
      }
    }
    if (message.syncButton) {
      buttonDownRef.current[message.syncButton.id] = message.syncButton.down
    }
  }

  // TODO
  const localAction = (action: ContentAction): void => {
    switch (action.id) {
      case 'page-back':
        window.history.back()
        break
      case 'page-forward':
        window.history.forward()
        break
      case 'stop':
        window.stop()
        break
      case 'print':
        window.print()
        break
      default:
    }
  }

  /*
   * Page Events
   */
  const handleMouseDown = (event: MouseEvent): void => {
    blockClickRef.current[event.button] = false
    blockContextRef.current = event.button !== 2

    // block scrollbars
    if (
      event.target instanceof HTMLElement &&
      ((document.documentElement.scrollHeight > window.innerHeight &&
        event.clientX > window.innerWidth - 17) ||
        (document.documentElement.scrollWidth > window.innerWidth &&
          event.clientY > window.innerHeight - 17))
    ) {
      endGesture()
      return
    }

    if (syncButtonsRef.current) {
      portRef.current?.postMessage({ syncButton: { id: event.button, down: true } })
    }
    buttonDownRef.current[event.button] = true

    if (forceContextRef.current) {
      if (event.button === 2) {
        endGesture()
        return
      }
      forceContextRef.current = false
    }

    if (
      gestureRef.current.rocker &&
      (buttonDownRef.current[0] ? 1 : 0) +
        (buttonDownRef.current[1] ? 1 : 0) +
        (buttonDownRef.current[2] ? 1 : 0) ===
        2
    ) {
      let first: string | undefined
      let second: string | undefined
      if (buttonDownRef.current[0]) {
        if (event.button === 0) {
          second = 'L'
        } else {
          first = 'L'
        }
      }
      if (buttonDownRef.current[1]) {
        if (event.button === 1) {
          second = 'M'
        } else {
          first = 'M'
        }
      }
      if (buttonDownRef.current[2]) {
        if (event.button === 2) {
          second = 'R'
        } else {
          first = 'R'
        }
      }
      if (
        callback ||
        (first &&
          settings.rValidGestures[first] &&
          second &&
          settings.rValidGestures[first].indexOf(second) !== -1)
      ) {
        syncButtonsRef.current = {
          timeout: setTimeout((): void => {
            syncButtonsRef.current = false
          }, 500),
        }
        sendGesture(`r${first}${second}`)

        window.getSelection()?.removeAllRanges()
        blockContextRef.current = true
        blockClickRef.current[0] = true
        blockClickRef.current[1] = true
        blockClickRef.current[2] = true
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }

    if (
      settings.contextOnLink &&
      event.button === 2 &&
      event.target instanceof Element &&
      getLink(event.target)
    ) {
      return
    }
    if (
      settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLSelectElement
    ) {
      return
    }
    if (
      settings.holdButton === 0 &&
      (keyModRef.current[0] !== '0' ||
        keyModRef.current[1] !== '0' ||
        keyModRef.current[2] !== '0' ||
        keyEscapeRef.current)
    ) {
      return // allow selection
    }
    if (
      settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLImageElement
    ) {
      event.preventDefault()
    }
    // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block autoscrolling with middle
    if (
      event.button === 1 &&
      (settings.rValidGestures.M || callback) &&
      navigator.userAgent.indexOf('Win') !== -1
    ) {
      event.preventDefault()
    }

    startGesture(
      { x: event.clientX, y: event.clientY },
      event.target as Element,
      event.button === settings.holdButton,
      (buttonDownRef.current[0] ? 1 : 0) +
        (buttonDownRef.current[1] ? 1 : 0) +
        (buttonDownRef.current[2] ? 1 : 0) ===
        1 &&
        (callback !== undefined ||
          (buttonDownRef.current[0] && 'L' in settings.rValidGestures) ||
          (buttonDownRef.current[1] && 'M' in settings.rValidGestures) ||
          (buttonDownRef.current[2] && 'R' in settings.rValidGestures)),
      event.button === settings.holdButton &&
        (callback !== undefined || settings.wValidGestures.length > 0),
    )
  }

  const handleMouseUp = (event: MouseEvent): void => {
    if (event.button === settings.holdButton) {
      if (gestureRef.current.line) {
        moveGesture(event, true)
      }
      if (gestureRef.current.line && gestureRef.current.line.code !== '') {
        sendGesture(gestureRef.current.line.code)
        event.preventDefault()
        if (event.button === 0) {
          window.getSelection()?.removeAllRanges()
        }
        if (event.button === 2) {
          blockContextRef.current = true
        }
        blockClickRef.current[event.button] = true
      }
    }
    delete gestureRef.current.line
    delete gestureRef.current.wheel

    if (event.button !== 2) {
      blockContextRef.current = true
    }
    if (
      event.button === 2 &&
      !forceContextRef.current &&
      !blockContextRef.current &&
      !buttonDownRef.current[0] &&
      !buttonDownRef.current[1] &&
      navigator.userAgent.indexOf('Win') === -1
    ) {
      forceContextRef.current = true
      setTimeout((): void => {
        forceContextRef.current = false
      }, 600)
      const point: { x: number; y: number } = {
        x: event.screenX,
        y: event.screenY,
      }
      if (
        navigator.userAgent.match(/linux/i) &&
        (event.screenX < window.screenLeft + Math.round(event.clientX * window.devicePixelRatio) ||
          (window.screenLeft === 0 &&
            event.screenY <
              55 + window.screenTop + Math.round(event.clientY * window.devicePixelRatio)))
      ) {
        point.x += window.screenLeft
        point.y += window.screenTop
      }
      // console.log('SEND NATIVE', point)
      portRef.current?.postMessage({ nativeport: { rightclick: point } })
    }

    if (blockClickRef.current[event.button]) {
      event.preventDefault()
    }
    buttonDownRef.current[event.button] = false
    if (syncButtonsRef.current) {
      portRef.current?.postMessage({ syncButton: { id: event.button, down: false } })
    }

    if (!buttonDownRef.current[0] && !buttonDownRef.current[2]) {
      delete gestureRef.current.rocker
    }
    if (!gestureRef.current.rocker) {
      endGesture()
    }
  }

  const handleDragEnd = (): void => {
    buttonDownRef.current = {}
  }

  const handleClick = (event: MouseEvent): void => {
    if (blockClickRef.current[event.button]) {
      event.preventDefault()
      event.stopPropagation()
    }
    blockClickRef.current[event.button] = false
  }

  const handleContextMenu = (event: MouseEvent): void => {
    if (
      (blockContextRef.current ||
        (buttonDownRef.current[2] &&
          (gestureRef.current.line || gestureRef.current.rocker || gestureRef.current.wheel))) &&
      !forceContextRef.current
    ) {
      event.preventDefault()
      event.stopPropagation()
      blockContextRef.current = false
    } else {
      // since the context menu is about to be shown, close all open gestures.
      endGesture()
      buttonDownRef.current = {}
    }
  }

  const handleSelectStart = (): void => {
    if (
      settings.holdButton === 0 &&
      keyModRef.current[0] === '0' &&
      keyModRef.current[1] === '0' &&
      keyModRef.current[2] === '0' &&
      !keyEscapeRef.current
    ) {
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      endGesture()
      keyEscapeRef.current = true
      const keyUp = (): void => {
        keyEscapeRef.current = false
        window.removeEventListener('keyup', keyUp, true)
      }
      window.addEventListener('keyup', keyUp, true)
    }
    let mod: string =
      (event.ctrlKey ? '1' : '0') +
      (event.altKey ? '1' : '0') +
      (event.shiftKey ? '1' : '0') +
      (event.metaKey ? '1' : '0')
    if (
      event.key === 'Shift' ||
      event.key === 'Control' ||
      event.key === 'Alt' ||
      event.key === 'Unidentified' ||
      event.key === 'Meta' ||
      event.key === 'ContextMenu'
    ) {
      let i: number | undefined
      if (event.key === 'Shift') {
        i = 2
      } else if (event.key === 'Control') {
        i = 0
      } else if (event.key === 'Alt') {
        i = 1
      }
      if (i !== undefined) {
        mod = `${mod.substring(0, i)}1${mod.substring(i + 1)}`
        const keyUp = (): void => {
          keyModRef.current = `${keyModRef.current.substring(0, i)}0${keyModRef.current.substring(i + 1)}`
          window.removeEventListener('keyup', keyUp, true)
        }
        window.addEventListener('keyup', keyUp, true)
      }
      keyModRef.current = mod
    } else if (
      callback ||
      ((mod !== '0000' ||
        !focusRef.current ||
        (!(focusRef.current instanceof HTMLInputElement) &&
          !(focusRef.current instanceof HTMLTextAreaElement))) &&
        settings.kValidGestures[mod] &&
        settings.kValidGestures[mod].indexOf(`${event.key}:${event.code}`) !== -1)
    ) {
      startGesture()
      sendGesture(`k${mod}:${event.key}:${event.code}`)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleFocus = (event: FocusEvent): void => {
    if (event.target instanceof Element) {
      focusRef.current = event.target
    }
  }

  const handleBlur = (event: FocusEvent): void => {
    if (event.target instanceof Element) {
      focusRef.current = undefined
    }
  }

  /*
   * Start/End Gestures
   */
  const startGesture = (
    point?: { x: number; y: number },
    target?: Element,
    line: boolean = false,
    rocker?: boolean,
    wheel?: boolean,
  ): void => {
    endGesture()
    if (!gestureRef.current.events) {
      window.addEventListener('mousemove', moveGesture, true)
      window.addEventListener('wheel', wheelGesture, true)
      gestureRef.current.events = true
    }
    gestureRef.current.startPoint = point ? { x: point.x, y: point.y } : undefined
    gestureRef.current.targets = target ? [target] : undefined
    const selection: Selection | null = window.getSelection()
    if (selection) {
      gestureRef.current.selection = selection.toString()
      if (selection.rangeCount > 0) {
        gestureRef.current.ranges = []
        for (let i: number = 0; i < selection.rangeCount; i += 1) {
          gestureRef.current.ranges.push(selection.getRangeAt(i))
        }
      }
    }

    gestureRef.current.line =
      line && point
        ? {
            code: '',
            points: [{ x: point.x, y: point.y }],
            dirPoints: [{ x: point.x, y: point.y }],
            possibleDirs: settings.validGestures,
            distance: 0,
          }
        : undefined
    gestureRef.current.rocker = rocker
    gestureRef.current.wheel = wheel
  }

  const moveGesture = (event: MouseEvent | WheelEvent, diagonal: boolean = false): void => {
    if (!gestureRef.current.startPoint) {
      gestureRef.current.startPoint = { x: event.clientX, y: event.clientY }
    }

    if (
      (gestureRef.current.rocker || gestureRef.current.wheel) &&
      (Math.abs(event.clientX - gestureRef.current.startPoint.x) > 0 ||
        Math.abs(event.clientY - gestureRef.current.startPoint.y) > 2)
    ) {
      delete gestureRef.current.rocker
      delete gestureRef.current.wheel
    }

    if (gestureRef.current.line) {
      const next: { x: number; y: number } = {
        x: event.clientX,
        y: event.clientY,
      }
      const prev: { x: number; y: number } =
        gestureRef.current.line.points[gestureRef.current.line.points.length - 1]
      gestureRef.current.line.points.push(next)
      gestureRef.current.line.distance += Math.sqrt((next.x - prev.x) ** 2 + (next.y - prev.y) ** 2)

      const diffx: number =
        next.x - gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1].x
      const diffy: number =
        next.y - gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1].y

      if (!settings.trailBlock) {
        refreshLineAsync()
        if (!isOpen && (Math.abs(diffx) > 10 || Math.abs(diffy) > 10)) {
          setIsOpen(true)
        }
      }

      const ldir: string =
        gestureRef.current.line.code === '' ? 'X' : gestureRef.current.line.code.slice(-1)
      const ndir: string = detectDirection(
        gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1],
        next,
      )

      if (ndir === ldir) {
        gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1] = next
      } else if (
        (Math.abs(diffx) > 25 || Math.abs(diffy) > 25) &&
        (diagonal || ndir.match(/^[RLUD]$/))
      ) {
        if (gestureRef.current.line.possibleDirs) {
          gestureRef.current.line.possibleDirs = gestureRef.current.line.possibleDirs[ndir]
            ? (gestureRef.current.line.possibleDirs[ndir] as ValidGestures)
            : undefined
        }
        if (gestureRef.current.line.possibleDirs || callback) {
          gestureRef.current.line.code += ndir
          gestureRef.current.line.dirPoints.push(next)
        } else {
          endGesture()
          blockContextRef.current = true
        }
      }
    }
  }

  const detectDirection = (
    prev: { x: number; y: number },
    next: { x: number; y: number },
  ): string => {
    const diffx: number = next.x - prev.x
    const diffy: number = next.y - prev.y
    if (Math.abs(diffx) > 2 * Math.abs(diffy)) {
      if (diffx > 0) {
        return 'R'
      }
      return 'L'
    }
    if (Math.abs(diffy) > 2 * Math.abs(diffx)) {
      if (diffy > 0) {
        return 'D'
      }
      return 'U'
    }
    if (diffy < 0) {
      if (diffx < 0) {
        return '7'
      }
      return '9'
    }
    if (diffx < 0) {
      return '1'
    }
    return '3'
  }

  const wheelGesture = (event: WheelEvent): void => {
    if (event.target instanceof HTMLIFrameElement) {
      endGesture()
    }
    moveGesture(event)
    if (!gestureRef.current.wheel || event.deltaY === 0) return
    const dir: string = event.deltaY < 0 ? 'U' : 'D'
    if (callback && settings.wValidGestures.indexOf(dir) !== -1) {
      syncButtonsRef.current = {
        timeout: setTimeout((): void => {
          syncButtonsRef.current = false
        }, 500),
      }
      sendGesture(`w${dir}`)

      if (settings.holdButton === 2) {
        blockContextRef.current = true
      }
      if (settings.holdButton === 0) {
        window.getSelection()?.removeAllRanges()
      }
      blockClickRef.current[settings.holdButton] = true
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const sendGesture = (code: string): void => {
    if (code) {
      if (callback) {
        callback(code)
        setCallback(undefined)
      } else {
        const message: BackgroundMessage = {
          gesture: code,
          startPoint: gestureRef.current.startPoint,
          targets: [],
          links: [],
          images: [],
          selection: gestureRef.current.selection,
        }
        if (gestureRef.current.line && code[0] !== 'w' && code[0] !== 'r') {
          message.line = {
            distance: gestureRef.current.line.distance,
            segments: code.length,
          }
        }
        if (settings.selectToLink && gestureRef.current.selection) {
          const parts: string[] = gestureRef.current.selection.split('http')
          for (let i: number = 1; i < parts.length; i += 1) {
            const link: string = `http${parts[i]}`.split(/[\s"']/)[0]
            if (link.match(/\/\/.+\..+/)) {
              message.links.push({ src: link })
            }
          }
        }
        if (gestureRef.current.targets) {
          for (let i: number = 0; i < gestureRef.current.targets.length; i += 1) {
            const gestureid: string = Math.floor(Math.random() * 2 ** 30).toString(32)
            const element: Element = gestureRef.current.targets[i]
            element.setAttribute('gestureid', gestureid)

            message.targets.push({ gestureid })
            const link: string | undefined = getLink(element)
            if (link) {
              message.links.push({ src: link, gestureid })
            }
            if (element instanceof HTMLImageElement) {
              message.images.push({
                src: element.src,
                gestureid,
              })
            }
          }
        }
        if (syncButtonsRef.current) {
          message.buttonDown = buttonDownRef.current
        }
        portRef.current?.postMessage(message)
      }
      if (code[0] === 'w') {
        delete gestureRef.current.line
        delete gestureRef.current.rocker
      } else if (code[0] === 'r') {
        delete gestureRef.current.line
        delete gestureRef.current.wheel
      } else {
        if (gestureRef.current.ranges && gestureRef.current.ranges.length > 0) {
          window.getSelection()?.removeAllRanges()
          gestureRef.current.ranges.forEach((range: Range) => {
            window.getSelection()?.addRange(range)
          })
        }
        endGesture()
      }
    }
  }

  const endGesture = (): void => {
    if (gestureRef.current.events) {
      window.removeEventListener('mousemove', moveGesture, true)
      window.removeEventListener('wheel', wheelGesture, true)
    }

    setIsOpen(false)
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    }

    clearTimeout(gestureRef.current.timeout)

    gestureRef.current = {}
  }

  /*
   * Helpers
   */
  const getLink = (element: Element): string | undefined => {
    let node: Node | null = element
    while (node) {
      if (node instanceof HTMLAnchorElement) {
        return node.href
      }
      node = node.parentNode
    }
    return undefined
  }

  const refreshLineAsync: { (): void; timeout?: NodeJS.Timeout } = () => {
    if (!refreshLineAsync.timeout) {
      const interval: number = Date.now() - (refreshLine.lasttime ?? 0)
      const weight: number = Math.min(500, 4 * (refreshLine.runtime ?? 0))
      if (weight < interval) {
        refreshLine()
      } else {
        refreshLineAsync.timeout = setTimeout((): void => {
          refreshLine()
          refreshLineAsync.timeout = undefined
        }, weight - interval)
      }
    }
  }

  const refreshLine: { (): void; lasttime?: number; runtime?: number } = () => {
    const now: number = Date.now()
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (gestureRef.current.line) {
      ctx.strokeStyle = `rgba(${settings.trailColor.r},${settings.trailColor.g},${settings.trailColor.b},${settings.trailColor.a})`
      ctx.lineWidth = settings.trailWidth
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = settings.trailWidth
      ctx.shadowColor = 'rgba(255,255,255,.3)'
      let firstDirPoint: { x: number; y: number } = {
        x: gestureRef.current.line.dirPoints[0].x,
        y: gestureRef.current.line.dirPoints[0].y,
      }
      const lastPoint: { x: number; y: number } =
        gestureRef.current.line.points[gestureRef.current.line.points.length - 1]
      const lastDirPoint: { x: number; y: number } =
        gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1]
      const lastDir: string = detectDirection(lastDirPoint, lastPoint)
      ctx.beginPath()
      if (gestureRef.current.line.code.length > 0) {
        if (gestureRef.current.line.code[0] === 'L' || gestureRef.current.line.code[0] === 'R') {
          firstDirPoint.y = gestureRef.current.line.dirPoints[1].y
        } else {
          firstDirPoint.x = gestureRef.current.line.dirPoints[1].x
        }
      }
      ctx.moveTo(firstDirPoint.x, firstDirPoint.y)
      for (let i: number = 1; i < gestureRef.current.line.code.length; i += 1) {
        const prevDir: string = gestureRef.current.line.code[i - 1]
        const currDir: string = gestureRef.current.line.code[i]
        const currDirPoint: { x: number; y: number } = gestureRef.current.line.dirPoints[i]
        const nextDirPoint: { x: number; y: number } = gestureRef.current.line.dirPoints[i + 1]
        let radius: number
        if (prevDir === 'L' || prevDir === 'R') {
          if (currDir === 'L' || currDir === 'R') {
            radius = Math.min(
              Math.abs(currDirPoint.x - firstDirPoint.x),
              Math.abs(nextDirPoint.y - firstDirPoint.y) / 2,
            )
            ctx.arcTo(currDirPoint.x, firstDirPoint.y, currDirPoint.x, nextDirPoint.y, radius)
            radius = Math.min(
              Math.abs(nextDirPoint.x - currDirPoint.x),
              Math.abs(nextDirPoint.y - firstDirPoint.y) - radius,
            )
            ctx.arcTo(currDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius)
            firstDirPoint.x = (currDirPoint.x + nextDirPoint.x) / 2
            firstDirPoint.y = nextDirPoint.y
            ctx.lineTo(firstDirPoint.x, firstDirPoint.y)
          } else {
            let { y } = nextDirPoint
            if (
              gestureRef.current.line.code[i + 1] === 'L' ||
              gestureRef.current.line.code[i + 1] === 'R'
            ) {
              y = gestureRef.current.line.dirPoints[i + 2].y
            }
            radius = Math.min(
              Math.abs(nextDirPoint.x - firstDirPoint.x),
              Math.abs(y - firstDirPoint.y) / 2,
            )
            ctx.arcTo(nextDirPoint.x, firstDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * radius)
            firstDirPoint.x = nextDirPoint.x
            firstDirPoint.y = (firstDirPoint.y + y) / 2
            ctx.lineTo(firstDirPoint.x, firstDirPoint.y)
          }
        } else if (currDir === 'L' || currDir === 'R') {
          let { x } = nextDirPoint
          if (
            gestureRef.current.line.code[i + 1] === 'U' ||
            gestureRef.current.line.code[i + 1] === 'D'
          ) {
            x = gestureRef.current.line.dirPoints[i + 2].x
          }
          radius = Math.min(
            Math.abs(x - firstDirPoint.x) / 2,
            Math.abs(nextDirPoint.y - firstDirPoint.y),
          )
          ctx.arcTo(firstDirPoint.x, nextDirPoint.y, nextDirPoint.x, nextDirPoint.y, 0.8 * radius)
          firstDirPoint.x = (firstDirPoint.x + x) / 2
          firstDirPoint.y = nextDirPoint.y
          ctx.lineTo(firstDirPoint.x, firstDirPoint.y)
        } else {
          radius = Math.min(
            Math.abs(nextDirPoint.x - firstDirPoint.x) / 2,
            Math.abs(currDirPoint.y - firstDirPoint.y),
          )
          ctx.arcTo(firstDirPoint.x, currDirPoint.y, nextDirPoint.x, currDirPoint.y, radius)
          radius = Math.min(
            Math.abs(nextDirPoint.x - firstDirPoint.x) - radius,
            Math.abs(nextDirPoint.y - currDirPoint.y),
          )
          ctx.arcTo(nextDirPoint.x, currDirPoint.y, nextDirPoint.x, nextDirPoint.y, radius)
          firstDirPoint.x = nextDirPoint.x
          firstDirPoint.y = (currDirPoint.y + nextDirPoint.y) / 2
          ctx.lineTo(firstDirPoint.x, firstDirPoint.y)
        }
      }
      if (gestureRef.current.line.code.length > 0) {
        firstDirPoint =
          gestureRef.current.line.dirPoints[gestureRef.current.line.dirPoints.length - 1]
        ctx.lineTo(firstDirPoint.x, firstDirPoint.y)
      }
      ctx.stroke()
      if (
        (gestureRef.current.line.possibleDirs && gestureRef.current.line.possibleDirs[lastDir]) ||
        callback
      ) {
        if (lastDir === '3' || lastDir === '7') {
          ctx.lineTo(
            (firstDirPoint.x - firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
            (-firstDirPoint.x + firstDirPoint.y + lastPoint.x + lastPoint.y) / 2,
          )
        } else if (lastDir === '1' || lastDir === '9') {
          ctx.lineTo(
            (firstDirPoint.x + firstDirPoint.y + lastPoint.x - lastPoint.y) / 2,
            (firstDirPoint.x + firstDirPoint.y - lastPoint.x + lastPoint.y) / 2,
          )
        }
        ctx.stroke()
      }
      refreshLine.lasttime = Date.now()
      refreshLine.runtime = 0.9 * (refreshLine.runtime || 10) + 0.1 * (refreshLine.lasttime - now)
    }
  }

  /*
   * Enable/Disable
   */
  const enable = (): void => {
    if (enabled) return
    enabled = true

    window.addEventListener('mousedown', handleMouseDown, true)
    window.addEventListener('mouseup', handleMouseUp, true)
    window.addEventListener('dragend', handleDragEnd, true)
    window.addEventListener('click', handleClick, true)
    window.addEventListener('contextmenu', handleContextMenu, true)
    window.addEventListener('selectstart', handleSelectStart, true)
    window.addEventListener('keydown', handleKeyDown, true)
  }

  const disable = (): void => {
    if (!enabled) return
    enabled = false

    window.removeEventListener('mousedown', handleMouseDown, true)
    window.removeEventListener('mouseup', handleMouseUp, true)
    window.removeEventListener('dragend', handleDragEnd, true)
    window.removeEventListener('click', handleClick, true)
    window.removeEventListener('contextmenu', handleContextMenu, true)
    window.removeEventListener('selectstart', handleSelectStart, true)
    window.removeEventListener('keydown', handleKeyDown, true)

    portRef.current?.onMessage.removeListener(receiveMessage)
    portRef.current?.onDisconnect.removeListener(disable)
  }

  useEffectOnce(() => {
    window.addEventListener('focus', handleFocus, true)
    window.addEventListener('blur', handleBlur, true)

    connect()

    return () => {
      window.removeEventListener('focus', handleFocus, true)
      window.removeEventListener('blur', handleBlur, true)
    }
  })

  useEffect(() => {
    console.log('render')
  }, [isOpen, callback])

  return isOpen ? (
    <>
      <div style={{ clear: 'both' }} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999999999,
          background: 'transparent',
          margin: 0,
          padding: 0,
        }}
        width={width}
        height={height}
      />
    </>
  ) : null
}
