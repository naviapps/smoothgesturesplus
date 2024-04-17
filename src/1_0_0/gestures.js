// History forwarding handling
if (
  location.hostname === 'www.google.com' &&
  location.hash.substr(0, 5) == '#:--:' &&
  !window.SGHistory
) {
  window.SGHistory = true
  var parts = location.hash.substr(5).split(':--:')
  var id = parts[0]
  var titles = JSON.parse(unescape(parts[1]))
  var urls = JSON.parse(unescape(parts[2]))
  var index = location.search.substr(7) * 1
  var decodetext = (code) => {
    var text = ''
    for (var j = 0; j < code.length; j++)
      text += String.fromCharCode(code.charCodeAt(j) - 10)
    return text
  }
  chrome.extension.sendRequest({ loadhistory: index, id: id }, (resp) => {
    if (resp) {
      location.replace(decodetext(urls[index]))
    } else {
      if (index < urls.length - 1) {
        document.title = decodetext(titles[index])
        if (index == 0) location.hash = location.hash + ':--:0'
        location.search = '?index=' + (index + 1)
        if (index > 0) location.hash = location.hash + ':--:0'
      } else {
        location.href = decodetext(urls[urls.length - 1])
      }
    }
  })
}

chrome.extension.onRequest.addListener((req, sender, callback) => {
  if (req.ping) callback()
})

var SmoothGestures = () => {
  ///////////////////////////////////////////////////////////
  // Local Variables ////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  var _this = this
  _this.callback = null
  //unique content script ID
  var id = ('' + Math.random()).substr(2)
  var sgplugin

  var enabled = false
  var port = null
  var canvas = null
  var htmlclear = null
  var validGestures = null
  var settings = {}

  //gesture states
  var gesture = {}

  // button syncing between tabs
  var syncButtons:
    | {
        timeout: NodeJS.Timeout,
      }
    | boolean = false

  // mouse event states
  var buttonDown: { [button: number]: boolean } = {}
  var blockClick: { [button: number]: boolean } = {}
  var blockContext: boolean = true
  var forceContext: boolean = false
  // key mod down states
  var keyMod: string = '0000'
  var keyEscape: boolean = false
  // focus state
  var focus: Element | null = null

  ///////////////////////////////////////////////////////////
  // Extension Communication ////////////////////////////////
  ///////////////////////////////////////////////////////////
  _this.connect = () => {
    const connectInfo: chrome.runtime.ConnectInfo = {
      name: JSON.stringify({
        name: 'smoothgestures.tab',
        frame: !parent,
        id: id,
        url: location.href,
      }),
    }
    if (window.SGextId) {
      port = chrome.extension.connect(window.SGextId, connectInfo)
    } else {
      port = chrome.extension.connect(connectInfo)
    }
    if (!port) return
    port.onMessage.addListener(receiveMessage)
    port.onDisconnect.addListener(_this.disable)
  }

  var receiveMessage = (mess) => {
    var mess = JSON.parse(mess)
    if (mess.enable) enable()
    if (mess.disable) _this.disable()
    if (mess.settings) settings = mess.settings
    if (mess.validGestures) validGestures = mess.validGestures
    if (mess.windowBlurred) {
      buttonDown = {}
      blockClick = {}
      blockContext = true
      endGesture()
    }
    if (mess.chain) {
      startGesture(
        mess.chain.startPoint,
        mess.chain.startPoint
          ? document.elementFromPoint(
              mess.chain.startPoint.x,
              mess.chain.startPoint.y,
            )
          : null,
        mess.chain.line,
        mess.chain.rocker,
        mess.chain.wheel,
        10000,
      ) //1500);
      blockContext = true
      if (mess.chain.buttonDown) {
        if (mess.chain.buttonDown[0]) blockClick[0] = true
        if (mess.chain.buttonDown[1]) blockClick[1] = true
        if (mess.chain.buttonDown[2]) blockClick[2] = true
        if (buttonDown[0] == undefined) buttonDown[0] = mess.chain.buttonDown[0]
        if (buttonDown[1] == undefined) buttonDown[1] = mess.chain.buttonDown[1]
        if (buttonDown[2] == undefined) buttonDown[2] = mess.chain.buttonDown[2]
      }
    }
    if (mess.syncButton) {
      buttonDown[mess.syncButton.id] = mess.syncButton.down
    }
    if (mess.displayAlert) alert(mess.displayAlert)
    if (mess.eval) {
      //port argument allows closetab -- maybe try to make it more secure
      new Function('port', mess.eval).apply(window, [port])
    }
    if ('sgplugin' in mess) sgplugin = mess.sgplugin
  }

  ///////////////////////////////////////////////////////////
  // Start/End Gestures /////////////////////////////////////
  ///////////////////////////////////////////////////////////
  var moveGesture = (event, diagonal): void => {
    if (!gesture.startPoint) {
      gesture.startPoint = { x: event.clientX, y: event.clientY }
    }

    if (gesture.rocker || gesture.wheel) {
      if (
        Math.abs(event.clientX - gesture.startPoint.x) > 0 ||
        Math.abs(event.clientY - gesture.startPoint.y) > 2
      ) {
        gesture.rocker = null
        gesture.wheel = null
      }
    }

    if (gesture.line) {
      const next: { x: number, y: number } = {
        x: event.clientX,
        y: event.clientY,
      }
      const prev: { x: number, y: number } =
        gesture.line.points[gesture.line.points.length - 1]
      gesture.line.points.push(next)
      gesture.line.distance += Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2),
      )

      const diffx: number =
        next.x - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].x
      const diffy: number =
        next.y - gesture.line.dirPoints[gesture.line.dirPoints.length - 1].y

      if (!settings.trailBlock && canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.strokeStyle =
          'rgba(' +
          settings.trailColor.r +
          ',' +
          settings.trailColor.g +
          ',' +
          settings.trailColor.b +
          ',' +
          settings.trailColor.a +
          ')'
        ctx.lineWidth = settings.trailWidth
        ctx.lineCap = 'butt'
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()
        refreshLineAsync()
        if (
          !canvas.parentNode &&
          (Math.abs(diffx) > 10 || Math.abs(diffy) > 10)
        ) {
          document.body.appendChild(canvas)
        }
      }

      const ldir: string =
        gesture.line.code === '' ? 'X' : gesture.line.code.slice(-1)
      let ndir: string
      let diagdir = false
      if (Math.abs(diffx) > 2 * Math.abs(diffy)) {
        if (diffx > 0) {
          ndir = 'R'
        } else {
          ndir = 'L'
        }
      } else if (Math.abs(diffy) > 2 * Math.abs(diffx)) {
        if (diffy > 0) {
          ndir = 'D'
        } else {
          ndir = 'U'
        }
      } else if (diffy < 0) {
        diagdir = true
        if (diffx < 0) {
          ndir = '7'
        } else {
          ndir = '9'
        }
      } else {
        diagdir = true
        if (diffx < 0) {
          ndir = '1'
        } else {
          ndir = '3'
        }
      }
      if (ndir === ldir) {
        gesture.line.dirPoints[gesture.line.dirPoints.length - 1] = next
      } else if (
        (!diagdir || diagonal) &&
        (Math.abs(diffx) > 15 || Math.abs(diffy) > 15)
      ) {
        if (gesture.line.possibleDirs) {
          gesture.line.possibleDirs = gesture.line.possibleDirs[ndir]
        }
        if (gesture.line.possibleDirs || _this.callback) {
          gesture.line.code += ndir
          if (gesture.line.dirPoints.length > 1)
            gesture.line.dirPoints.push(next)
          gesture.line.dirPoints.push(next)
        } else {
          endGesture()
          blockContext = true
        }
      }
    }
  }

  ///////////////////////////////////////////////////////////
  // Helpers ////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////
  const refreshLineAsync = () => {
    if (refreshLineAsync.timeout) return
    refreshLineAsync.timeout = setTimeout(() => {
      refreshLine()
      refreshLineAsync.timeout = null
    }, 200)
  }

  const refreshLine = () => {
    if (!canvas.getContext) return
    var ctx = canvas.getContext('2d')
    ctx.strokeStyle =
      'rgba(' +
      settings.trailColor.r +
      ',' +
      settings.trailColor.g +
      ',' +
      settings.trailColor.b +
      ',' +
      settings.trailColor.a +
      ')'
    ctx.lineWidth = settings.trailWidth
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'round'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (gesture.line) {
      ctx.beginPath()
      ctx.moveTo(gesture.line.points[0].x, gesture.line.points[0].y)
      for (var i = 1; i < gesture.line.points.length; i++)
        ctx.lineTo(gesture.line.points[i].x, gesture.line.points[i].y)
      ctx.stroke()
    }
  }
}

if (
  window.SGinjectscript &&
  window.SGinjectscript.constructor === HTMLScriptElement
) {
  const match = window.SGinjectscript.src.match(
    /([^a-p]|^)([a-p]{32})([^a-p]|$)/,
  )
  if (match) {
    window.SGextId = match[2]
  }
  const scripts = document.querySelectorAll(
    'script[src^=chrome-extension\\:\\/\\/]',
  )
  for (let i = 0; i < scripts.length; i++) {
    scripts[i].parentNode.removeChild(scripts[i])
  }
}

if (window.SG) {
  if (!window.SG.enabled()) {
    window.SG.connect()
  }
} else {
  window.SG = new SmoothGestures()
}
