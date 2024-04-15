// TODO
export type SmoothGesturesLineValue =
  | 'U'
  | 'R'
  | 'D'
  | 'L'
  | '1'
  | '3'
  | '7'
  | '9'
export type SmoothGesturesRockerValue = 'L' | 'M' | 'R'
export type SmoothGesturesWheelValue = 'U' | 'D'

export type SmoothGesturesLineObject = {
  [dir in SmoothGesturesLineValue]: SmoothGesturesLineObject
}

export interface SmoothGesturesValidGestures {
  k: {
    [mod: string]: string[]
  }
  r: {
    [first in SmoothGesturesRockerValue]: {
      [second in SmoothGesturesRockerValue]: boolean
    }
  }
  w: {
    [dir in SmoothGesturesWheelValue]: boolean
  }
  U?: SmoothGesturesLineObject
  R?: SmoothGesturesLineObject
  D?: SmoothGesturesLineObject
  L?: SmoothGesturesLineObject
  '1'?: SmoothGesturesLineObject
  '3'?: SmoothGesturesLineObject
  '7'?: SmoothGesturesLineObject
  '9'?: SmoothGesturesLineObject
}

export interface SmoothGesturesSettings {
  holdButton: number
  contextOnLink: boolean
  newTabUrl: string
  newTabRight: boolean
  newTabLinkRight: boolean
  trailColor: { r: number; g: number; b: number; a: number }
  trailWidth: number
  trailBlock: boolean
  blacklist: string[]
  selectToLink: boolean
  // TODO
  gestures: { [gesture: string]: string }
  validGestures: SmoothGesturesValidGestures
}

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
    possibleDirs: SmoothGesturesValidGestures
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

  readonly #codeCharMap: { [key: number]: string } = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    19: 'Pause',
    20: 'Caps Lock',
    27: 'Esc',
    32: 'Space',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    45: 'Insert',
    46: 'Delete',
    96: 'NP 0',
    97: 'NP 1',
    98: 'NP 2',
    99: 'NP 3',
    100: 'NP 4',
    101: 'NP 5',
    102: 'NP 6',
    103: 'NP 7',
    104: 'NP 8',
    105: 'NP 9',
    106: 'NP *',
    107: 'NP +',
    109: 'NP -',
    110: 'NP .',
    111: 'NP /',
    144: 'Num Lock',
    145: 'Scroll Lock',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '~',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
  }

  // TODO
  #settings: SmoothGesturesSettings = {
    holdButton: 2,
    contextOnLink: false,
    newTabUrl: 'chrome://newtab/',
    newTabRight: false,
    newTabLinkRight: true,
    trailColor: { r: 255, g: 0, b: 0, a: 1 },
    trailWidth: 2,
    trailBlock: false,
    blacklist: [],
    selectToLink: true,
    //
    validGestures: {
      k: {},
      r: {},
      w: {},
    },
  } // TODO: defaultValue
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
      let first: SmoothGesturesRockerValue | null = null
      let second: SmoothGesturesRockerValue | null = null
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
    // if windows and middle-clicked and (middle-click rocker set or options page is setting a gesture) then block autoscrolling with middle
    if (
      event.button === 1 &&
      (this.#settings.validGestures['r']['M'] || this.callback) &&
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
        (this.callback !== null ||
          (this.#settings.validGestures['r'] &&
            ((this.#buttonDown[0] &&
              !!this.#settings.validGestures['r']['L']) ||
              (this.#buttonDown[1] &&
                !!this.#settings.validGestures['r']['M']) ||
              (this.#buttonDown[2] &&
                !!this.#settings.validGestures['r']['R'])))),
      event.button === this.#settings.holdButton &&
        (this.callback !== null || !!this.#settings.validGestures['w']),
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

  // TODO
  #handleKeyDown = (): void => {
    //
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

  drawGesture(
    gesture: string,
    width: number,
    height: number,
    lineWidth: number,
  ): JQuery | HTMLCanvasElement {
    let context: string = ''
    if (gesture[0] === 's') {
      context = 's'
      gesture = gesture.substring(1)
    } else if (gesture[0] === 'l') {
      context = 'l'
      gesture = gesture.substring(1)
    } else if (gesture[0] === 'i') {
      context = 'i'
      gesture = gesture.substring(1)
    }

    let c: JQuery | HTMLCanvasElement
    if (gesture[0] === 'r') {
      c = this.#drawRocker(gesture, width)
    } else if (gesture[0] === 'w') {
      c = this.#drawWheel(gesture, width)
    } else if (gesture[0] === 'k') {
      c = this.#drawKey(gesture, width)
    } else {
      c = this.#drawLine(gesture, width, height, lineWidth)
    }
    $(c).css({ 'min-height': '2em', overflow: 'hidden' })

    let mess: string | null = null
    if (context === 's') {
      mess = '* ' + chrome.i18n.getMessage('context_with_selection')
    } else if (context === 'l') {
      mess = '* ' + chrome.i18n.getMessage('context_on_link')
    } else if (context === 'i') {
      mess = '* ' + chrome.i18n.getMessage('context_on_image')
    } else if (this.#settings.gestures['s' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_selection')
    } else if (
      this.#settings.gestures['l' + gesture] &&
      this.#settings.gestures['i' + gesture]
    ) {
      mess = '* ' + chrome.i18n.getMessage('context_not_links_images')
    } else if (this.#settings.gestures['l' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_link')
    } else if (this.#settings.gestures['i' + gesture]) {
      mess = '* ' + chrome.i18n.getMessage('context_not_image')
    }

    if (!mess) {
      return c
    } else {
      return $('<div>')
        .css({ width: width + 'px', overflow: 'hidden' })
        .append(
          $('<div>')
            .css({
              'font-size': 12 * Math.sqrt(width / 100) + 'px',
              color: '#888',
              'text-align': 'right',
              'margin-right': '.3em',
              height: '0px',
              position: 'relative',
              top: '.1em',
            })
            .text(mess),
        )
        .append(c)
    }
  }

  #drawLine(
    gesture: string,
    width: number,
    height: number,
    lineWidth: number,
  ): HTMLCanvasElement {
    const c: HTMLCanvasElement = document.createElement('canvas')
    c.width = width
    c.height = height
    const ctx = c.getContext('2d')
    if (!ctx) return c
    ctx.strokeStyle =
      'rgba(' +
      this.#settings.trailColor.r +
      ',' +
      this.#settings.trailColor.g +
      ',' +
      this.#settings.trailColor.b +
      ',' +
      this.#settings.trailColor.a +
      ')'
    ctx.lineWidth = lineWidth || 3
    ctx.lineCap = 'butt'
    let step: number = 10
    let tight: number = 2
    let sep: number = 3

    let prev: { x: number; y: number } = { x: 0, y: 0 }
    let curr: { x: number; y: number } = { x: 0, y: 0 }
    const max: { x: number; y: number } = { x: 0, y: 0 }
    const min: { x: number; y: number } = { x: 0, y: 0 }

    const tip = (dir: string): void => {
      prev = curr
      ctx.lineTo(prev.x, prev.y)
      if (dir === 'U') {
        curr = { x: prev.x, y: prev.y - step * 0.75 }
      } else if (dir === 'D') {
        curr = { x: prev.x, y: prev.y + step * 0.75 }
      } else if (dir === 'L') {
        curr = { x: prev.x - step * 0.75, y: prev.y }
      } else if (dir === 'R') {
        curr = { x: prev.x + step * 0.75, y: prev.y }
      } else if (dir === '1') {
        curr = { x: prev.x - step * 0.5, y: prev.y + step * 0.5 }
      } else if (dir === '3') {
        curr = { x: prev.x + step * 0.5, y: prev.y + step * 0.5 }
      } else if (dir === '7') {
        curr = { x: prev.x - step * 0.5, y: prev.y - step * 0.5 }
      } else if (dir === '9') {
        curr = { x: prev.x + step * 0.5, y: prev.y - step * 0.5 }
      }
      ctx.lineTo(curr.x, curr.y)
      minmax()
    }
    const curve = (dir: string): void => {
      prev = curr
      ctx.lineTo(prev.x, prev.y)
      if (dir === 'UD') {
        curr = { x: prev.x, y: prev.y - step }
        minmax()
        ctx.lineTo(prev.x, prev.y - step)
        ctx.arc(prev.x + tight, prev.y - step, tight, Math.PI, 0, false)
        ctx.lineTo(prev.x + tight * 2, prev.y)
      } else if (dir === 'UL') {
        ctx.arc(prev.x - step, prev.y, step, 0, -Math.PI / 2, true)
      } else if (dir === 'UR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, -Math.PI / 2, false)
      } else if (dir === 'DU') {
        curr = { x: prev.x, y: prev.y + step }
        minmax()
        ctx.lineTo(prev.x, prev.y + step)
        ctx.arc(prev.x + tight, prev.y + step, tight, Math.PI, 0, true)
        ctx.lineTo(prev.x + tight * 2, prev.y)
      } else if (dir === 'DL') {
        ctx.arc(prev.x - step, prev.y, step, 0, Math.PI / 2, false)
      } else if (dir === 'DR') {
        ctx.arc(prev.x + step, prev.y, step, Math.PI, Math.PI / 2, true)
      } else if (dir === 'LU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, Math.PI, false)
      } else if (dir === 'LD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, Math.PI, true)
      } else if (dir === 'LR') {
        curr = { x: prev.x - step, y: prev.y }
        minmax()
        ctx.lineTo(prev.x - step, prev.y)
        ctx.arc(
          prev.x - step,
          prev.y + tight,
          tight,
          -Math.PI / 2,
          Math.PI / 2,
          true,
        )
        ctx.lineTo(prev.x, prev.y + tight * 2)
      } else if (dir === 'RU') {
        ctx.arc(prev.x, prev.y - step, step, Math.PI / 2, 0, true)
      } else if (dir === 'RD') {
        ctx.arc(prev.x, prev.y + step, step, -Math.PI / 2, 0, false)
      } else if (dir === 'RL') {
        curr = { x: prev.x + step, y: prev.y }
        minmax()
        ctx.lineTo(prev.x + step, prev.y)
        ctx.arc(
          prev.x + step,
          prev.y + tight,
          tight,
          -Math.PI / 2,
          Math.PI / 2,
          false,
        )
        ctx.lineTo(prev.x, prev.y + tight * 2)
      } else {
        tip(dir[0])
        tip(dir[1])
      }
      if (dir === 'UD') {
        curr = { x: prev.x + tight * 2, y: prev.y + sep }
      } else if (dir === 'UL') {
        curr = { x: prev.x - step, y: prev.y - step }
      } else if (dir === 'UR') {
        curr = { x: prev.x + step + sep, y: prev.y - step }
      } else if (dir === 'DU') {
        curr = { x: prev.x + tight * 2, y: prev.y }
      } else if (dir === 'DL') {
        curr = { x: prev.x - step, y: prev.y + step }
      } else if (dir === 'DR') {
        curr = { x: prev.x + step + sep, y: prev.y + step }
      } else if (dir === 'LU') {
        curr = { x: prev.x - step, y: prev.y - step }
      } else if (dir === 'LD') {
        curr = { x: prev.x - step, y: prev.y + step + sep }
      } else if (dir === 'LR') {
        curr = { x: prev.x + sep, y: prev.y + tight * 2 }
      } else if (dir === 'RU') {
        curr = { x: prev.x + step, y: prev.y - step }
      } else if (dir === 'RD') {
        curr = { x: prev.x + step, y: prev.y + step + sep }
      } else if (dir === 'RL') {
        curr = { x: prev.x, y: prev.y + tight * 2 }
      }
      minmax()
    }
    const minmax = (): void => {
      if (curr.x > max.x) max.x = curr.x
      if (curr.y > max.y) max.y = curr.y
      if (curr.x < min.x) min.x = curr.x
      if (curr.y < min.y) min.y = curr.y
    }

    ctx.beginPath()
    tip(gesture[0])
    for (let i: number = 0; i < gesture.length - 1; i++) {
      curve(gesture[i] + gesture[i + 1])
    }
    tip(gesture[gesture.length - 1])
    ctx.stroke()

    const center: { x: number; y: number } = {
      x: (max.x + min.x) / 2,
      y: (max.y + min.y) / 2,
    }
    const wr: number = (max.x - min.x + step) / width
    const hr: number = (max.y - min.y + step) / height
    const ratio: number = hr > wr ? hr : wr
    step /= ratio
    sep /= ratio
    tight /= ratio
    if (tight > 6) tight = 6
    curr = { x: 0, y: 0 }

    ctx.clearRect(0, 0, c.width, c.height)
    ctx.save()
    ctx.translate(width / 2 - center.x / ratio, height / 2 - center.y / ratio)
    ctx.beginPath()
    tip(gesture[0])
    for (let i: number = 0; i < gesture.length - 1; i++) {
      curve(gesture[i] + gesture[i + 1])
    }
    tip(gesture[gesture.length - 1])
    ctx.stroke()
    ctx.fillStyle =
      'rgba(' +
      this.#settings.trailColor.r +
      ',' +
      this.#settings.trailColor.g +
      ',' +
      this.#settings.trailColor.b +
      ',' +
      this.#settings.trailColor.a +
      ')'
    ctx.beginPath()
    if (gesture[gesture.length - 1] === 'U') {
      ctx.moveTo(curr.x - 5, curr.y + 2)
      ctx.lineTo(curr.x + 5, curr.y + 2)
      ctx.lineTo(curr.x, curr.y - 3)
    } else if (gesture[gesture.length - 1] === 'D') {
      ctx.moveTo(curr.x - 5, curr.y - 2)
      ctx.lineTo(curr.x + 5, curr.y - 2)
      ctx.lineTo(curr.x, curr.y + 3)
    } else if (gesture[gesture.length - 1] === 'L') {
      ctx.moveTo(curr.x + 2, curr.y - 5)
      ctx.lineTo(curr.x + 2, curr.y + 5)
      ctx.lineTo(curr.x - 3, curr.y)
    } else if (gesture[gesture.length - 1] === 'R') {
      ctx.moveTo(curr.x - 2, curr.y - 5)
      ctx.lineTo(curr.x - 2, curr.y + 5)
      ctx.lineTo(curr.x + 3, curr.y)
    } else if (gesture[gesture.length - 1] === '1') {
      ctx.moveTo(curr.x - 2, curr.y - 6)
      ctx.lineTo(curr.x + 6, curr.y + 2)
      ctx.lineTo(curr.x - 2, curr.y + 2)
    } else if (gesture[gesture.length - 1] === '3') {
      ctx.moveTo(curr.x + 2, curr.y - 6)
      ctx.lineTo(curr.x - 6, curr.y + 2)
      ctx.lineTo(curr.x + 2, curr.y + 2)
    } else if (gesture[gesture.length - 1] === '7') {
      ctx.moveTo(curr.x - 2, curr.y + 6)
      ctx.lineTo(curr.x + 6, curr.y - 2)
      ctx.lineTo(curr.x - 2, curr.y - 2)
    } else if (gesture[gesture.length - 1] === '9') {
      ctx.moveTo(curr.x + 2, curr.y + 6)
      ctx.lineTo(curr.x - 6, curr.y - 2)
      ctx.lineTo(curr.x + 2, curr.y - 2)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    return c
  }

  #drawRocker(gesture: string, width: number): JQuery {
    const first: number = gesture[1] === 'L' ? 0 : gesture[1] === 'M' ? 1 : 2
    const second: number = gesture[2] === 'L' ? 0 : gesture[2] === 'M' ? 1 : 2
    return $('<div>')
      .css({ width: width - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture))
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(
            chrome.i18n.getMessage('gesture_rocker_descrip', [
              chrome.i18n.getMessage('options_mousebutton_' + first),
              chrome.i18n.getMessage('options_mousebutton_' + second),
            ]),
          )
          .css({
            'font-size': 12 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      )
  }

  #drawWheel(gesture: string, width: number): JQuery {
    return $('<div>')
      .css({ width: width - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture))
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#111',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
      .append(
        $('<div>')
          .text(chrome.i18n.getMessage('gesture_' + gesture + '_descrip'))
          .css({
            'font-size': 12 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
          }),
      )
  }

  #codeButton(code: string): string {
    const parts: string[] = code.split(':')
    const id: string = parts[1]
    const key: number = Number(parts[2])
    if (!id || id === '') return 'empty'
    if (id.substring(0, 2) !== 'U+') return id
    const ch: string = this.#codeCharMap[key]
    if (ch) return ch
    return JSON.parse('"\\u' + id.substring(2) + '"')
  }

  #drawKey(gesture: string, width: number): JQuery {
    return $('<div>')
      .css({ width: width - 2 + 'px', padding: '5px 1px' })
      .append(
        $('<div>')
          .text(
            (gesture[1] === '1' ? 'Ctrl + ' : '') +
              (gesture[2] === '1' ? 'Alt + ' : '') +
              (gesture[3] === '1' ? 'Shift + ' : '') +
              (gesture[4] === '1' ? 'Meta + ' : '') +
              this.#codeButton(gesture),
          )
          .css({
            'font-size': 14 * Math.sqrt(width / 100) + 'px',
            color: '#666',
            'text-align': 'center',
            'font-weight': 'bold',
          }),
      )
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

  set settings(settings: SmoothGesturesSettings) {
    this.#settings = settings
  }
}
