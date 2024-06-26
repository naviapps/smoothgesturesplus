'use strict'
var sjcl = {
  cipher: {},
  hash: {},
  keyexchange: {},
  mode: {},
  misc: {},
  codec: {},
  exception: {
    corrupt: (t) => {
      ;(this.toString = () => {
        return 'CORRUPT: ' + this.message
      }),
        (this.message = t)
    },
    invalid: (t) => {
      ;(this.toString = () => {
        return 'INVALID: ' + this.message
      }),
        (this.message = t)
    },
    bug: (t) => {
      ;(this.toString = () => {
        return 'BUG: ' + this.message
      }),
        (this.message = t)
    },
    notReady: (t) => {
      ;(this.toString = () => {
        return 'NOT READY: ' + this.message
      }),
        (this.message = t)
    },
  },
}
const n = (t, r) => {
  var i,
    n,
    e,
    s,
    c,
    a,
    o,
    h = r.slice(0),
    l = t.c
  for (e = l[0], s = l[1], c = l[2], a = l[3], o = l[4], i = 0; i <= 79; i++)
    16 <= i &&
      (h[i] =
        ((h[i - 3] ^ h[i - 8] ^ h[i - 14] ^ h[i - 16]) << 1) |
        ((h[i - 3] ^ h[i - 8] ^ h[i - 14] ^ h[i - 16]) >>> 31)),
      (n =
        (((e << 5) | (e >>> 27)) +
          (n =
            i <= 19
              ? (s & c) | (~s & a)
              : i <= 39
                ? s ^ c ^ a
                : i <= 59
                  ? (s & c) | (s & a) | (c & a)
                  : i <= 79
                    ? s ^ c ^ a
                    : void 0) +
          o +
          h[i] +
          t.f[Math.floor(i / 20)]) |
        0),
      (o = a),
      (a = c),
      (c = (s << 30) | (s >>> 2)),
      (s = e),
      (e = n)
  ;(l[0] = (l[0] + e) | 0),
    (l[1] = (l[1] + s) | 0),
    (l[2] = (l[2] + c) | 0),
    (l[3] = (l[3] + a) | 0),
    (l[4] = (l[4] + o) | 0)
}
'undefined' != typeof module && module.exports && (module.exports = sjcl),
  (sjcl.bitArray = {
    bitSlice: (t, r, i) => {
      return (
        (t = sjcl.bitArray.d(t.slice(r / 32), 32 - (31 & r)).slice(1)),
        void 0 === i ? t : sjcl.bitArray.clamp(t, i - r)
      )
    },
    extract: (t, r, i) => {
      var n = Math.floor((-r - i) & 31)
      return (
        (-32 & ((r + i - 1) ^ r)
          ? (t[(r / 32) | 0] << (32 - n)) ^ (t[(r / 32 + 1) | 0] >>> n)
          : t[(r / 32) | 0] >>> n) &
        ((1 << i) - 1)
      )
    },
    concat: (t, r) => {
      if (0 === t.length || 0 === r.length) return t.concat(r)
      var i = t[t.length - 1],
        n = sjcl.bitArray.getPartial(i)
      return 32 === n
        ? t.concat(r)
        : sjcl.bitArray.d(r, n, 0 | i, t.slice(0, t.length - 1))
    },
    bitLength: (t) => {
      var r = t.length
      return 0 === r ? 0 : 32 * (r - 1) + sjcl.bitArray.getPartial(t[r - 1])
    },
    clamp: (t, r) => {
      if (32 * t.length < r) return t
      var i = (t = t.slice(0, Math.ceil(r / 32))).length
      return (
        (r &= 31),
        0 < i &&
          r &&
          (t[i - 1] = sjcl.bitArray.partial(
            r,
            t[i - 1] & (2147483648 >> (r - 1)),
            1,
          )),
        t
      )
    },
    partial: (t, r, i) => {
      return 32 === t ? r : (i ? 0 | r : r << (32 - t)) + 1099511627776 * t
    },
    getPartial: (t) => {
      return Math.round(t / 1099511627776) || 32
    },
    equal: (t, r) => {
      if (sjcl.bitArray.bitLength(t) !== sjcl.bitArray.bitLength(r))
        return false
      var i,
        n = 0
      for (i = 0; i < t.length; i++) n |= t[i] ^ r[i]
      return 0 === n
    },
    d: (t, r, i, n) => {
      var e
      for (void (e = 0) === n && (n = []); 32 <= r; r -= 32) n.push(i), (i = 0)
      if (0 === r) return n.concat(t)
      for (e = 0; e < t.length; e++)
        n.push(i | (t[e] >>> r)), (i = t[e] << (32 - r))
      return (
        (e = t.length ? t[t.length - 1] : 0),
        (t = sjcl.bitArray.getPartial(e)),
        n.push(
          sjcl.bitArray.partial((r + t) & 31, 32 < r + t ? i : n.pop(), 1),
        ),
        n
      )
    },
    g: (t, r) => {
      return [t[0] ^ r[0], t[1] ^ r[1], t[2] ^ r[2], t[3] ^ r[3]]
    },
  }),
  (sjcl.codec.utf8String = {
    fromBits: (t) => {
      var r,
        i,
        n = '',
        e = sjcl.bitArray.bitLength(t)
      for (r = 0; r < e / 8; r++)
        0 == (3 & r) && (i = t[r / 4]),
          (n += String.fromCharCode(i >>> 24)),
          (i <<= 8)
      return decodeURIComponent(escape(n))
    },
    toBits: (t) => {
      t = unescape(encodeURIComponent(t))
      var r,
        i = [],
        n = 0
      for (r = 0; r < t.length; r++)
        (n = (n << 8) | t.charCodeAt(r)), 3 == (3 & r) && (i.push(n), (n = 0))
      return 3 & r && i.push(sjcl.bitArray.partial(8 * (3 & r), n)), i
    },
  }),
  (sjcl.codec.hex = {
    fromBits: (t) => {
      var r,
        i = ''
      for (r = 0; r < t.length; r++)
        i += (0xf00000000000 + (0 | t[r])).toString(16).substr(4)
      return i.substr(0, sjcl.bitArray.bitLength(t) / 4)
    },
    toBits: (t) => {
      var r,
        i,
        n = []
      for (
        i = (t = t.replace(/\s|0x/g, '')).length, t += '00000000', r = 0;
        r < t.length;
        r += 8
      )
        n.push(0 ^ parseInt(t.substr(r, 8), 16))
      return sjcl.bitArray.clamp(n, 4 * i)
    },
  }),
  (sjcl.hash.sha1 = (t) => {
    t
      ? ((this.c = t.c.slice(0)), (this.b = t.b.slice(0)), (this.a = t.a))
      : this.reset()
  }),
  (sjcl.hash.sha1.hash = (t) => {
    return new sjcl.hash.sha1().update(t).finalize()
  }),
  (sjcl.hash.sha1.prototype = {
    blockSize: 512,
    reset: () => {
      return (this.c = this.e.slice(0)), (this.b = []), (this.a = 0), this
    },
    update: (t) => {
      'string' == typeof t && (t = sjcl.codec.utf8String.toBits(t))
      var r,
        i = (this.b = sjcl.bitArray.concat(this.b, t))
      for (
        r = this.a,
          t = this.a = r + sjcl.bitArray.bitLength(t),
          r = (this.blockSize + r) & -this.blockSize;
        r <= t;
        r += this.blockSize
      )
        n(this, i.splice(0, 16))
      return this
    },
    finalize: () => {
      var t,
        r = this.b,
        i = this.c
      for (
        t =
          (r = sjcl.bitArray.concat(r, [sjcl.bitArray.partial(1, 1)])).length +
          2;
        15 & t;
        t++
      )
        r.push(0)
      for (
        r.push(Math.floor(this.a / 4294967296)), r.push(0 | this.a);
        r.length;

      )
        n(this, r.splice(0, 16))
      return this.reset(), i
    },
    e: [1732584193, 4023233417, 2562383102, 271733878, 3285377520],
    f: [1518500249, 1859775393, 2400959708, 3395469782],
  })
