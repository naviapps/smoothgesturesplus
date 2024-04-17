// TODO
import { Settings, defaults, SettingsValidGestures } from './settings.ts'

export interface SmoothGesturesGesture {
  events: boolean
  startPoint: { x: number; y: number } | null
  targets: Element[]
  selection: string | null
  ranges: Range[]
  timeout: NodeJS.Timeout | null
  line: {
    code: string
    points: { x: number; y: number }[]
    dirPoints: { x: number; y: number }[]
    possibleDirs: SettingsValidGestures
    distance: number
  } | null
  rocker: boolean
  wheel: boolean
}

export class SmoothGestures {
  ///////////////////////////////////////////////////////////
  // Local Variables ////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  callback: ((code: string) => void) | null = null
  // unique content script ID
  readonly #id: string =
    Math.floor(Math.random() * Math.pow(2, 30)).toString(32) +
    Math.floor(Math.random() * Math.pow(2, 30)).toString(32)

  #port!: chrome.runtime.Port
  readonly #canvas: HTMLCanvasElement
  readonly #htmlclear: HTMLDivElement

  // gesture states
  #gesture: SmoothGesturesGesture = {
    events: false,
    startPoint: null,
    targets: [],
    selection: null,
    ranges: [],
    timeout: null,
    line: null,
    rocker: false,
    wheel: false,
  }

  // button syncing between tabs
  #syncButtons:
    | {
        timeout: NodeJS.Timeout
      }
    | boolean = false

  // mouse event states
  #buttonDown: { [button: number]: boolean } = {}
  #blockClick: { [button: number]: boolean } = {}
  #blockContext: boolean = true
  #forceContext: boolean = false
  // key mod down states
  #keyMod: string = '0000'
  #keyEscape: boolean = false
  // focus state
  #focus: Element | null = null

  // TODO
  #settings: Settings = defaults // TODO: defaultValue
  #enabled: boolean = false // TODO: defaultValue

  constructor() {
    window.addEventListener('focus', this.#handleFocus, true)
    window.addEventListener('blur', this.#handleBlur, true)

    this.connect()

    this.#canvas = document.createElement('canvas')
    this.#canvas.style.position = 'fixed'
    this.#canvas.style.top = '0'
    this.#canvas.style.left = '0'
    this.#canvas.style.zIndex = '999999999'
    this.#canvas.style.background = 'transparent'
    this.#canvas.style.margin = '0'
    this.#canvas.style.padding = '0'
    this.#canvasResize()

    this.#htmlclear = document.createElement('div')
    this.#htmlclear.style.clear = 'both'
  }

  ///////////////////////////////////////////////////////////
  // Extension Communication ////////////////////////////////
  ///////////////////////////////////////////////////////////
  // TODO
  connect(): void {
    const connectInfo: chrome.runtime.ConnectInfo = {
      name: JSON.stringify({
        name: 'smoothgestures.tab',
        frame: !parent,
        id: this.#id,
        url: location.href,
      }),
    }
    //
  }

  // TODO
  #receiveMessage() {
    //
  }

  ///////////////////////////////////////////////////////////
  // Page Events ////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  #handleMouseDown = (event: MouseEvent): void => {
    this.#blockClick[event.button] = false
    this.#blockContext = event.button !== 2

    // TODO: block scrollbars
    if (
      event.target instanceof Node &&
      event.target.nodeName === 'HTML' &&
      ((document.height > window.innerHeight &&
        event.clientX > window.innerWidth - 17) ||
        (document.width > window.innerWidth &&
          event.clientY > window.innerHeight - 17))
    ) {
      this.#endGesture()
      return
    }

    if (this.#syncButtons) {
      this.#port.postMessage({ syncButton: { id: event.button, down: true } })
    }
    this.#buttonDown[event.button] = true

    if (this.#forceContext) {
      if (event.button === 2) {
        this.#endGesture()
        return
      } else {
        this.#forceContext = false
      }
    }

    this.#moveGesture(event)
    if (
      this.#gesture.rocker &&
      (this.#buttonDown[0] ? 1 : 0) +
        (this.#buttonDown[1] ? 1 : 0) +
        (this.#buttonDown[2] ? 1 : 0) ===
        2
    ) {
      let first: SmoothGesturesRockerValue | undefined
      let second: SmoothGesturesRockerValue | undefined
      if (this.#buttonDown[0]) {
        if (event.button === 0) {
          second = 'L'
        } else {
          first = 'L'
        }
      }
      if (this.#buttonDown[1]) {
        if (event.button === 1) {
          second = 'M'
        } else {
          first = 'M'
        }
      }
      if (this.#buttonDown[2]) {
        if (event.button === 2) {
          second = 'R'
        } else {
          first = 'R'
        }
      }
      if (
        this.callback ||
        (first &&
          this.#settings.validGestures['r'][first] &&
          second &&
          this.#settings.validGestures['r'][first][second])
      ) {
        this.#syncButtons = {
          timeout: setTimeout((): void => {
            this.#syncButtons = false
          }, 500),
        }
        this.#sendGesture('r' + first + second)

        window.getSelection()?.removeAllRanges()
        this.#blockContext = true
        this.#blockClick[0] = true
        this.#blockClick[1] = true
        this.#blockClick[2] = true
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }

    if (
      this.#settings.contextOnLink &&
      event.button === 2 &&
      event.target instanceof Node &&
      this.#getLink(event.target)
    ) {
      return
    }
    if (
      this.#settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLSelectElement
    ) {
      return
    }
    if (
      this.#settings.holdButton === 0 &&
      (this.#keyMod[0] !== '0' ||
        this.#keyMod[1] !== '0' ||
        this.#keyMod[2] !== '0' ||
        this.#keyEscape)
    ) {
      return // allow selection
    }
    if (
      this.#settings.holdButton === 0 &&
      event.button === 0 &&
      event.target instanceof HTMLImageElement
    ) {
      event.preventDefault()
    }
    // TODO: if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block autoscrolling with middle
    if (
      event.button === 1 &&
      (this.#settings.validGestures['r']['M'] || window.SG?.callback) &&
      navigator.userAgent.indexOf('Win') !== -1
    ) {
      event.preventDefault()
    }

    this.#startGesture(
      { x: event.clientX, y: event.clientY },
      event.target as Element,
      event.button === this.#settings.holdButton,
      (this.#buttonDown[0] ? 1 : 0) +
        (this.#buttonDown[1] ? 1 : 0) +
        (this.#buttonDown[2] ? 1 : 0) ===
        1 &&
        (!!this.callback ||
          (this.#settings.validGestures['r'] &&
            ((this.#buttonDown[0] &&
              !!this.#settings.validGestures['r']['L']) ||
              (this.#buttonDown[1] &&
                !!this.#settings.validGestures['r']['M']) ||
              (this.#buttonDown[2] &&
                !!this.#settings.validGestures['r']['R'])))),
      event.button === this.#settings.holdButton &&
        (!!this.callback || !!this.#settings.validGestures['w']),
    )
  }

  #handleMouseUp = (event: MouseEvent): void => {
    if (event.button === this.#settings.holdButton) {
      if (this.#gesture.line) {
        this.#moveGesture(event, true)
      }
      if (this.#gesture.line && this.#gesture.line.code !== '') {
        this.#sendGesture(this.#gesture.line.code)
        event.preventDefault()
        if (event.button === 0) {
          window.getSelection()?.removeAllRanges()
        }
        if (event.button === 2) {
          this.#blockContext = true
        }
        this.#blockClick[event.button] = true
      }
    }
    this.#gesture.line = null
    this.#gesture.wheel = false

    if (event.button !== 2) {
      this.#blockContext = true
    }
    if (
      event.button === 2 &&
      !this.#forceContext &&
      !this.#blockContext &&
      !this.#buttonDown[0] &&
      !this.#buttonDown[1] &&
      navigator.userAgent.indexOf('Win') === -1
    ) {
      this.#forceContext = true
      setTimeout((): void => {
        this.#forceContext = false
      }, 600)
      const point: { x: number; y: number } = {
        x: event.screenX,
        y: event.screenY,
      }
      if (
        navigator.userAgent.match(/linux/i) &&
        (event.screenX <
          window.screenLeft +
            Math.round(event.clientX * window.devicePixelRatio) ||
          (window.screenLeft === 0 &&
            event.screenY <
              55 +
                window.screenTop +
                Math.round(event.clientY * window.devicePixelRatio)))
      ) {
        point.x += window.screenLeft
        point.y += window.screenTop
      }
      console.log('SEND NATIVE', point)
      this.#port.postMessage({ nativeport: { rightclick: point } })
    }

    if (this.#blockClick[event.button]) {
      event.preventDefault()
    }
    this.#buttonDown[event.button] = false
    if (this.#syncButtons) {
      this.#port.postMessage({ syncButton: { id: event.button, down: false } })
    }

    if (!this.#buttonDown[0] && !this.#buttonDown[2]) {
      this.#gesture.rocker = false
    }
    if (!this.#gesture.rocker) {
      this.#endGesture()
    }
  }

  #handleDragEnd = (): void => {
    this.#buttonDown = {}
  }

  #handleClick = (event: MouseEvent): void => {
    if (this.#blockClick[event.button]) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.#blockClick[event.button] = false
  }

  #handleContextMenu = (event: MouseEvent): void => {
    if (
      (this.#blockContext ||
        (this.#buttonDown[2] &&
          (this.#gesture.line ||
            this.#gesture.rocker ||
            this.#gesture.wheel))) &&
      !this.#forceContext
    ) {
      event.preventDefault()
      event.stopPropagation()
      this.#blockContext = false
    } else {
      // since the context menu is about to be shown, close all open gestures.
      this.#endGesture()
      this.#buttonDown = {}
    }
  }

  #handleSelectStart = (): void => {
    if (
      this.#settings.holdButton === 0 &&
      this.#keyMod[0] === '0' &&
      this.#keyMod[1] === '0' &&
      this.#keyMod[2] === '0' &&
      !this.#keyEscape
    ) {
      window.getSelection()?.removeAllRanges()
    }
  }

  #canvasResize = (): void => {
    this.#canvas.width = window.innerWidth
    this.#canvas.height = window.innerHeight
  }

  #handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.#endGesture()
      this.#keyEscape = true
      const keyUp = (): void => {
        this.#keyEscape = false
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
      const i: number | null =
        event.key === 'Shift'
          ? 2
          : event.key === 'Control'
            ? 0
            : event.key === 'Alt'
              ? 1
              : null
      if (i !== null) {
        mod = mod.substring(0, i) + '1' + mod.substring(i + 1)
        const keyUp = (): void => {
          this.#keyMod =
            this.#keyMod.substring(0, i) + '0' + this.#keyMod.substring(i + 1)
          window.removeEventListener('keyup', keyUp, true)
        }
        window.addEventListener('keyup', keyUp, true)
      }
      this.#keyMod = mod
    } else if (
      this.callback ||
      ((mod !== '0000' ||
        this.#focus === null ||
        (!(this.#focus instanceof HTMLInputElement) &&
          !(this.#focus instanceof HTMLTextAreaElement))) &&
        this.#settings.validGestures['k'] &&
        this.#settings.validGestures['k'][mod] &&
        this.#settings.validGestures['k'][mod].indexOf(
          event.key + ':' + event.code,
        ) >= 0)
    ) {
      this.#startGesture()
      this.#sendGesture('k' + mod + ':' + event.key + ':' + event.code)
      event.preventDefault()
      event.stopPropagation()
    }
  }

  #handleFocus = (event: FocusEvent): void => {
    if (event.target instanceof Element) {
      this.#focus = event.target
    }
  }

  #handleBlur = (event: FocusEvent): void => {
    if (event.target instanceof Element) {
      this.#focus = null
    }
  }

  ///////////////////////////////////////////////////////////
  // Start/End Gestures /////////////////////////////////////
  ///////////////////////////////////////////////////////////
  #startGesture(
    point: { x: number; y: number } | null = null,
    target: Element | null = null,
    line: boolean = false,
    rocker: boolean = false,
    wheel: boolean = false,
  ): void {
    this.#endGesture()
    if (!this.#gesture.events) {
      window.addEventListener('mousemove', this.#moveGesture, true)
      window.addEventListener('wheel', this.#wheelGesture, true)
      this.#gesture.events = true
    }
    if (location.hostname === 'mail.google.com') {
      const elem: Element = document.body.children[1]
      const domListen = (): void => {
        this.#endGesture()
        elem.removeEventListener('DOMSubtreeModified', domListen, true)
      }
      elem.addEventListener('DOMSubtreeModified', domListen, true)
    }
    this.#gesture.startPoint = point ? { x: point.x, y: point.y } : null
    this.#gesture.targets = target ? [target] : []
    const selection = window.getSelection()
    if (selection) {
      this.#gesture.selection = selection.toString()
      this.#gesture.ranges = []
      for (let i: number = 0; i < selection.rangeCount; i++) {
        this.#gesture.ranges.push(selection.getRangeAt(i))
      }
    }
    this.#gesture.timeout = null

    this.#gesture.line =
      !line || !point
        ? null
        : {
            code: '',
            points: [{ x: point.x, y: point.y }],
            dirPoints: [{ x: point.x, y: point.y }],
            possibleDirs: this.#settings.validGestures,
            distance: 0,
          }
    this.#gesture.rocker = rocker
    this.#gesture.wheel = wheel

    if (
      document.documentElement.offsetHeight <
        document.documentElement.scrollHeight &&
      (this.#gesture.line || this.#gesture.wheel) &&
      !this.#htmlclear.parentNode
    ) {
      document.body.appendChild(this.#htmlclear)
    }
  }

  // TODO
  #moveGesture(event: Event, diagonal: boolean = false) {
    //
  }

  // TODO
  #wheelGesture = (event: WheelEvent): void => {
    if (event.target instanceof HTMLIFrameElement) {
      this.#endGesture()
    }
    this.#moveGesture(event)
    if (!this.#gesture.wheel || event.deltaY === 0) return
    const dir: SmoothGesturesWheelValue = event.deltaY < 0 ? 'U' : 'D'
    if (this.callback || this.#settings.validGestures['w'][dir]) {
      this.#syncButtons = {
        timeout: setTimeout((): void => {
          this.#syncButtons = false
        }, 500),
      }
      this.#sendGesture('w' + dir)

      if (this.#settings.holdButton === 2) {
        this.#blockContext = true
      }
      if (this.#settings.holdButton === 0) {
        window.getSelection()?.removeAllRanges()
      }
      this.#blockClick[this.#settings.holdButton] = true
      event.preventDefault()
      event.stopPropagation()
    }
  }

  #sendGesture(code: string): void {
    if (code) {
      if (this.callback) {
        this.callback(code)
        this.callback = null
      } else {
        const message: {
          gesture: string
          startPoint: { x: number; y: number } | null
          targets: { gestureid: string }[]
          links: { src: string; gestureid?: string }[]
          images: { src: string; gestureid: string }[]
          selection: string | null
          line?: {
            distance: number
            segments: number
          }
          buttonDown?: {
            [button: number]: boolean
          }
        } = {
          gesture: code,
          startPoint: this.#gesture.startPoint,
          targets: [],
          links: [],
          images: [],
          selection: this.#gesture.selection,
        }
        if (this.#gesture.line && code[0] !== 'w' && code[0] !== 'r') {
          message.line = {
            distance: this.#gesture.line.distance,
            segments: code.length,
          }
        }
        if (this.#settings.selectToLink && this.#gesture.selection) {
          const parts: string[] = this.#gesture.selection.split('http')
          for (let i: number = 1; i < parts.length; i++) {
            let link: string = 'http' + parts[i]
            link = link.split(/[\s"']/)[0]
            if (link.match(/\/\/.+\..+/)) {
              message.links.push({ src: link })
            }
          }
        }
        for (let i: number = 0; i < this.#gesture.targets.length; i++) {
          const gestureid: string = Math.floor(
            Math.random() * Math.pow(2, 30),
          ).toString(32)
          const elem: Element = this.#gesture.targets[i]
          elem.setAttribute('gestureid', gestureid)

          message.targets.push({ gestureid: gestureid })
          const link: string | null = this.#getLink(elem)
          if (link) {
            message.links.push({ src: link, gestureid: gestureid })
          }
          if (elem instanceof HTMLImageElement) {
            message.images.push({
              src: elem.src,
              gestureid: gestureid,
            })
          }
        }
        if (this.#syncButtons) {
          message.buttonDown = this.#buttonDown
        }
        this.#port.postMessage(message)
      }
    }
    if (code[0] === 'w') {
      this.#gesture.line = null
      this.#gesture.rocker = false
    } else if (code[0] === 'r') {
      this.#gesture.line = null
      this.#gesture.wheel = false
    } else {
      if (this.#gesture.ranges && this.#gesture.ranges.length > 0) {
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          for (let i: number = 0; i < this.#gesture.ranges.length; i++) {
            selection.addRange(this.#gesture.ranges[i])
          }
        }
      }
      this.#endGesture()
    }
  }

  #endGesture(): void {
    if (this.#gesture.events) {
      window.removeEventListener('mousemove', this.#moveGesture, true)
      window.removeEventListener('wheel', this.#wheelGesture, true)
      this.#gesture.events = false
    }

    this.#canvas.parentNode?.removeChild(this.#canvas)
    this.#canvas
      .getContext('2d')
      ?.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

    this.#htmlclear.parentNode?.removeChild(this.#htmlclear)

    if (this.#gesture.timeout) {
      clearTimeout(this.#gesture.timeout)
      this.#gesture.timeout = null
    }

    this.#gesture.selection = null
    this.#gesture.ranges = []
    this.#gesture.line = null
    this.#gesture.rocker = false
    this.#gesture.wheel = false
  }

  ///////////////////////////////////////////////////////////
  // Helpers ////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  #getLink(elem: Node | null): string | null {
    while (elem) {
      if (elem instanceof HTMLAnchorElement) {
        return elem.href
      }
      elem = elem.parentNode
    }
    return null
  }

  // TODO
  #refreshLineAsync() {
    //
  }

  // TODO
  #refreshLine() {
    //
  }

  ///////////////////////////////////////////////////////////
  // Enable/Disable /////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  #enable(): void {
    if (this.#enabled) return
    this.#enabled = true

    window.addEventListener('mousedown', this.#handleMouseDown, true)
    window.addEventListener('mouseup', this.#handleMouseUp, true)
    window.addEventListener('dragend', this.#handleDragEnd, true)
    window.addEventListener('click', this.#handleClick, true)
    window.addEventListener('contextmenu', this.#handleContextMenu, true)
    window.addEventListener('selectstart', this.#handleSelectStart, true)
    window.addEventListener('resize', this.#canvasResize, true)
    window.addEventListener('keydown', this.#handleKeyDown, true)
  }

  disable = (): void => {
    if (!this.#enabled) return
    this.#enabled = false

    window.removeEventListener('mousedown', this.#handleMouseDown, true)
    window.removeEventListener('mouseup', this.#handleMouseUp, true)
    window.removeEventListener('dragend', this.#handleDragEnd, true)
    window.removeEventListener('click', this.#handleClick, true)
    window.removeEventListener('contextmenu', this.#handleContextMenu, true)
    window.removeEventListener('selectstart', this.#handleSelectStart, true)
    window.removeEventListener('resize', this.#canvasResize, true)
    window.removeEventListener('keydown', this.#handleKeyDown, true)

    this.#port.onMessage.removeListener(this.#receiveMessage)
    this.#port.onDisconnect.removeListener(this.disable)
  }

  get enabled(): boolean {
    return this.#enabled
  }

  set settings(settings: Settings) {
    this.#settings = settings
  }
}
