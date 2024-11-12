import {
  AMPLIFY_SYMBOL,
  Amplify,
  AmplifyError,
  AmplifyUrl,
  AmplifyUrlSearchParams,
  ApiAction,
  ApiError,
  BackgroundProcessManager,
  Cache,
  Category,
  ConsoleLogger,
  DataStoreAction,
  Hub,
  Mutex,
  NonRetryableError,
  Observable,
  Reachability,
  Subject,
  USER_AGENT_HEADER,
  WordArray,
  amplifyUuid,
  authenticatedHandler,
  base64Encoder,
  catchError,
  fetchAuthSession2 as fetchAuthSession,
  filter,
  getAmplifyUserAgent,
  getRetryDecider,
  isBrowser,
  isNonRetryableError,
  isWebWorker,
  jitteredBackoff,
  jitteredBackoff2,
  jitteredExponentialRetry,
  map,
  of,
  parseJsonError,
  retry,
  signRequest,
  unauthenticatedHandler
} from "./chunk-C4CZXZUR.js";
import {
  __commonJS
} from "./chunk-G3PMV62Z.js";

// node_modules/ulid/stubs/crypto.js
var require_crypto = __commonJS({
  "node_modules/ulid/stubs/crypto.js"() {
  }
});

// node_modules/ulid/dist/index.esm.js
function createError(message) {
  var err = new Error(message);
  err.source = "ulid";
  return err;
}
var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
var ENCODING_LEN = ENCODING.length;
var TIME_MAX = Math.pow(2, 48) - 1;
var TIME_LEN = 10;
var RANDOM_LEN = 16;
function replaceCharAt(str, index, char) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + char + str.substr(index + 1);
}
function incrementBase32(str) {
  var done = void 0;
  var index = str.length;
  var char = void 0;
  var charIndex = void 0;
  var maxCharIndex = ENCODING_LEN - 1;
  while (!done && index-- >= 0) {
    char = str[index];
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw createError("incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      str = replaceCharAt(str, index, ENCODING[0]);
      continue;
    }
    done = replaceCharAt(str, index, ENCODING[charIndex + 1]);
  }
  if (typeof done === "string") {
    return done;
  }
  throw createError("cannot increment this string");
}
function randomChar(prng2) {
  var rand = Math.floor(prng2() * ENCODING_LEN);
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1;
  }
  return ENCODING.charAt(rand);
}
function encodeTime(now, len) {
  if (isNaN(now)) {
    throw new Error(now + " must be a number");
  }
  if (now > TIME_MAX) {
    throw createError("cannot encode time greater than " + TIME_MAX);
  }
  if (now < 0) {
    throw createError("time must be positive");
  }
  if (Number.isInteger(now) === false) {
    throw createError("time must be an integer");
  }
  var mod = void 0;
  var str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function encodeRandom(len, prng2) {
  var str = "";
  for (; len > 0; len--) {
    str = randomChar(prng2) + str;
  }
  return str;
}
function detectPrng() {
  var allowInsecure = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
  var root = arguments[1];
  if (!root) {
    root = typeof window !== "undefined" ? window : null;
  }
  var browserCrypto = root && (root.crypto || root.msCrypto);
  if (browserCrypto) {
    return function() {
      var buffer = new Uint8Array(1);
      browserCrypto.getRandomValues(buffer);
      return buffer[0] / 255;
    };
  } else {
    try {
      var nodeCrypto = require_crypto();
      return function() {
        return nodeCrypto.randomBytes(1).readUInt8() / 255;
      };
    } catch (e) {
    }
  }
  if (allowInsecure) {
    try {
      console.error("secure crypto unusable, falling back to insecure Math.random()!");
    } catch (e) {
    }
    return function() {
      return Math.random();
    };
  }
  throw createError("secure crypto unusable, insecure Math.random not allowed");
}
function factory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  return function ulid3(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng);
  };
}
function monotonicFactory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  var lastTime = 0;
  var lastRandom = void 0;
  return function ulid3(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    if (seedTime <= lastTime) {
      var incrementedRandom = lastRandom = incrementBase32(lastRandom);
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seedTime;
    var newRandom = lastRandom = encodeRandom(RANDOM_LEN, currPrng);
    return encodeTime(seedTime, TIME_LEN) + newRandom;
  };
}
var ulid = factory();

// node_modules/immer/dist/immer.esm.js
function n(n2) {
  for (var t2 = arguments.length, r2 = Array(t2 > 1 ? t2 - 1 : 0), e = 1; e < t2; e++) r2[e - 1] = arguments[e];
  if (true) {
    var i2 = Y[n2], o2 = i2 ? "function" == typeof i2 ? i2.apply(null, r2) : i2 : "unknown error nr: " + n2;
    throw Error("[Immer] " + o2);
  }
  throw Error("[Immer] minified error nr: " + n2 + (r2.length ? " " + r2.map(function(n3) {
    return "'" + n3 + "'";
  }).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
}
function t(n2) {
  return !!n2 && !!n2[Q];
}
function r(n2) {
  return !!n2 && (function(n3) {
    if (!n3 || "object" != typeof n3) return false;
    var t2 = Object.getPrototypeOf(n3);
    if (null === t2) return true;
    var r2 = Object.hasOwnProperty.call(t2, "constructor") && t2.constructor;
    return r2 === Object || "function" == typeof r2 && Function.toString.call(r2) === Z;
  }(n2) || Array.isArray(n2) || !!n2[L] || !!n2.constructor[L] || s(n2) || v(n2));
}
function i(n2, t2, r2) {
  void 0 === r2 && (r2 = false), 0 === o(n2) ? (r2 ? Object.keys : nn)(n2).forEach(function(e) {
    r2 && "symbol" == typeof e || t2(e, n2[e], n2);
  }) : n2.forEach(function(r3, e) {
    return t2(e, r3, n2);
  });
}
function o(n2) {
  var t2 = n2[Q];
  return t2 ? t2.i > 3 ? t2.i - 4 : t2.i : Array.isArray(n2) ? 1 : s(n2) ? 2 : v(n2) ? 3 : 0;
}
function u(n2, t2) {
  return 2 === o(n2) ? n2.has(t2) : Object.prototype.hasOwnProperty.call(n2, t2);
}
function a(n2, t2) {
  return 2 === o(n2) ? n2.get(t2) : n2[t2];
}
function f(n2, t2, r2) {
  var e = o(n2);
  2 === e ? n2.set(t2, r2) : 3 === e ? (n2.delete(t2), n2.add(r2)) : n2[t2] = r2;
}
function c(n2, t2) {
  return n2 === t2 ? 0 !== n2 || 1 / n2 == 1 / t2 : n2 != n2 && t2 != t2;
}
function s(n2) {
  return X && n2 instanceof Map;
}
function v(n2) {
  return q && n2 instanceof Set;
}
function p(n2) {
  return n2.o || n2.t;
}
function l(n2) {
  if (Array.isArray(n2)) return Array.prototype.slice.call(n2);
  var t2 = tn(n2);
  delete t2[Q];
  for (var r2 = nn(t2), e = 0; e < r2.length; e++) {
    var i2 = r2[e], o2 = t2[i2];
    false === o2.writable && (o2.writable = true, o2.configurable = true), (o2.get || o2.set) && (t2[i2] = { configurable: true, writable: true, enumerable: o2.enumerable, value: n2[i2] });
  }
  return Object.create(Object.getPrototypeOf(n2), t2);
}
function d(n2, e) {
  return void 0 === e && (e = false), y(n2) || t(n2) || !r(n2) ? n2 : (o(n2) > 1 && (n2.set = n2.add = n2.clear = n2.delete = h), Object.freeze(n2), e && i(n2, function(n3, t2) {
    return d(t2, true);
  }, true), n2);
}
function h() {
  n(2);
}
function y(n2) {
  return null == n2 || "object" != typeof n2 || Object.isFrozen(n2);
}
function b(t2) {
  var r2 = rn[t2];
  return r2 || n(18, t2), r2;
}
function m(n2, t2) {
  rn[n2] || (rn[n2] = t2);
}
function _() {
  return U || n(0), U;
}
function j(n2, t2) {
  t2 && (b("Patches"), n2.u = [], n2.s = [], n2.v = t2);
}
function O(n2) {
  g(n2), n2.p.forEach(S), n2.p = null;
}
function g(n2) {
  n2 === U && (U = n2.l);
}
function w(n2) {
  return U = { p: [], l: U, h: n2, m: true, _: 0 };
}
function S(n2) {
  var t2 = n2[Q];
  0 === t2.i || 1 === t2.i ? t2.j() : t2.O = true;
}
function P(t2, e) {
  e._ = e.p.length;
  var i2 = e.p[0], o2 = void 0 !== t2 && t2 !== i2;
  return e.h.g || b("ES5").S(e, t2, o2), o2 ? (i2[Q].P && (O(e), n(4)), r(t2) && (t2 = M(e, t2), e.l || x(e, t2)), e.u && b("Patches").M(i2[Q], t2, e.u, e.s)) : t2 = M(e, i2, []), O(e), e.u && e.v(e.u, e.s), t2 !== H ? t2 : void 0;
}
function M(n2, t2, r2) {
  if (y(t2)) return t2;
  var e = t2[Q];
  if (!e) return i(t2, function(i2, o3) {
    return A(n2, e, t2, i2, o3, r2);
  }, true), t2;
  if (e.A !== n2) return t2;
  if (!e.P) return x(n2, e.t, true), e.t;
  if (!e.I) {
    e.I = true, e.A._--;
    var o2 = 4 === e.i || 5 === e.i ? e.o = l(e.k) : e.o;
    i(3 === e.i ? new Set(o2) : o2, function(t3, i2) {
      return A(n2, e, o2, t3, i2, r2);
    }), x(n2, o2, false), r2 && n2.u && b("Patches").R(e, r2, n2.u, n2.s);
  }
  return e.o;
}
function A(e, i2, o2, a2, c2, s2) {
  if (c2 === o2 && n(5), t(c2)) {
    var v2 = M(e, c2, s2 && i2 && 3 !== i2.i && !u(i2.D, a2) ? s2.concat(a2) : void 0);
    if (f(o2, a2, v2), !t(v2)) return;
    e.m = false;
  }
  if (r(c2) && !y(c2)) {
    if (!e.h.F && e._ < 1) return;
    M(e, c2), i2 && i2.A.l || x(e, c2);
  }
}
function x(n2, t2, r2) {
  void 0 === r2 && (r2 = false), n2.h.F && n2.m && d(t2, r2);
}
function z(n2, t2) {
  var r2 = n2[Q];
  return (r2 ? p(r2) : n2)[t2];
}
function I(n2, t2) {
  if (t2 in n2) for (var r2 = Object.getPrototypeOf(n2); r2; ) {
    var e = Object.getOwnPropertyDescriptor(r2, t2);
    if (e) return e;
    r2 = Object.getPrototypeOf(r2);
  }
}
function k(n2) {
  n2.P || (n2.P = true, n2.l && k(n2.l));
}
function E(n2) {
  n2.o || (n2.o = l(n2.t));
}
function R(n2, t2, r2) {
  var e = s(t2) ? b("MapSet").N(t2, r2) : v(t2) ? b("MapSet").T(t2, r2) : n2.g ? function(n3, t3) {
    var r3 = Array.isArray(n3), e2 = { i: r3 ? 1 : 0, A: t3 ? t3.A : _(), P: false, I: false, D: {}, l: t3, t: n3, k: null, o: null, j: null, C: false }, i2 = e2, o2 = en;
    r3 && (i2 = [e2], o2 = on);
    var u2 = Proxy.revocable(i2, o2), a2 = u2.revoke, f2 = u2.proxy;
    return e2.k = f2, e2.j = a2, f2;
  }(t2, r2) : b("ES5").J(t2, r2);
  return (r2 ? r2.A : _()).p.push(e), e;
}
function D(e) {
  return t(e) || n(22, e), function n2(t2) {
    if (!r(t2)) return t2;
    var e2, u2 = t2[Q], c2 = o(t2);
    if (u2) {
      if (!u2.P && (u2.i < 4 || !b("ES5").K(u2))) return u2.t;
      u2.I = true, e2 = F(t2, c2), u2.I = false;
    } else e2 = F(t2, c2);
    return i(e2, function(t3, r2) {
      u2 && a(u2.t, t3) === r2 || f(e2, t3, n2(r2));
    }), 3 === c2 ? new Set(e2) : e2;
  }(e);
}
function F(n2, t2) {
  switch (t2) {
    case 2:
      return new Map(n2);
    case 3:
      return Array.from(n2);
  }
  return l(n2);
}
function T() {
  function e(n2) {
    if (!r(n2)) return n2;
    if (Array.isArray(n2)) return n2.map(e);
    if (s(n2)) return new Map(Array.from(n2.entries()).map(function(n3) {
      return [n3[0], e(n3[1])];
    }));
    if (v(n2)) return new Set(Array.from(n2).map(e));
    var t2 = Object.create(Object.getPrototypeOf(n2));
    for (var i2 in n2) t2[i2] = e(n2[i2]);
    return u(n2, L) && (t2[L] = n2[L]), t2;
  }
  function f2(n2) {
    return t(n2) ? e(n2) : n2;
  }
  var c2 = "add";
  m("Patches", { $: function(t2, r2) {
    return r2.forEach(function(r3) {
      for (var i2 = r3.path, u2 = r3.op, f3 = t2, s2 = 0; s2 < i2.length - 1; s2++) {
        var v2 = o(f3), p2 = "" + i2[s2];
        0 !== v2 && 1 !== v2 || "__proto__" !== p2 && "constructor" !== p2 || n(24), "function" == typeof f3 && "prototype" === p2 && n(24), "object" != typeof (f3 = a(f3, p2)) && n(15, i2.join("/"));
      }
      var l2 = o(f3), d2 = e(r3.value), h2 = i2[i2.length - 1];
      switch (u2) {
        case "replace":
          switch (l2) {
            case 2:
              return f3.set(h2, d2);
            case 3:
              n(16);
            default:
              return f3[h2] = d2;
          }
        case c2:
          switch (l2) {
            case 1:
              return f3.splice(h2, 0, d2);
            case 2:
              return f3.set(h2, d2);
            case 3:
              return f3.add(d2);
            default:
              return f3[h2] = d2;
          }
        case "remove":
          switch (l2) {
            case 1:
              return f3.splice(h2, 1);
            case 2:
              return f3.delete(h2);
            case 3:
              return f3.delete(r3.value);
            default:
              return delete f3[h2];
          }
        default:
          n(17, u2);
      }
    }), t2;
  }, R: function(n2, t2, r2, e2) {
    switch (n2.i) {
      case 0:
      case 4:
      case 2:
        return function(n3, t3, r3, e3) {
          var o2 = n3.t, s2 = n3.o;
          i(n3.D, function(n4, i2) {
            var v2 = a(o2, n4), p2 = a(s2, n4), l2 = i2 ? u(o2, n4) ? "replace" : c2 : "remove";
            if (v2 !== p2 || "replace" !== l2) {
              var d2 = t3.concat(n4);
              r3.push("remove" === l2 ? { op: l2, path: d2 } : { op: l2, path: d2, value: p2 }), e3.push(l2 === c2 ? { op: "remove", path: d2 } : "remove" === l2 ? { op: c2, path: d2, value: f2(v2) } : { op: "replace", path: d2, value: f2(v2) });
            }
          });
        }(n2, t2, r2, e2);
      case 5:
      case 1:
        return function(n3, t3, r3, e3) {
          var i2 = n3.t, o2 = n3.D, u2 = n3.o;
          if (u2.length < i2.length) {
            var a2 = [u2, i2];
            i2 = a2[0], u2 = a2[1];
            var s2 = [e3, r3];
            r3 = s2[0], e3 = s2[1];
          }
          for (var v2 = 0; v2 < i2.length; v2++) if (o2[v2] && u2[v2] !== i2[v2]) {
            var p2 = t3.concat([v2]);
            r3.push({ op: "replace", path: p2, value: f2(u2[v2]) }), e3.push({ op: "replace", path: p2, value: f2(i2[v2]) });
          }
          for (var l2 = i2.length; l2 < u2.length; l2++) {
            var d2 = t3.concat([l2]);
            r3.push({ op: c2, path: d2, value: f2(u2[l2]) });
          }
          i2.length < u2.length && e3.push({ op: "replace", path: t3.concat(["length"]), value: i2.length });
        }(n2, t2, r2, e2);
      case 3:
        return function(n3, t3, r3, e3) {
          var i2 = n3.t, o2 = n3.o, u2 = 0;
          i2.forEach(function(n4) {
            if (!o2.has(n4)) {
              var i3 = t3.concat([u2]);
              r3.push({ op: "remove", path: i3, value: n4 }), e3.unshift({ op: c2, path: i3, value: n4 });
            }
            u2++;
          }), u2 = 0, o2.forEach(function(n4) {
            if (!i2.has(n4)) {
              var o3 = t3.concat([u2]);
              r3.push({ op: c2, path: o3, value: n4 }), e3.unshift({ op: "remove", path: o3, value: n4 });
            }
            u2++;
          });
        }(n2, t2, r2, e2);
    }
  }, M: function(n2, t2, r2, e2) {
    r2.push({ op: "replace", path: [], value: t2 === H ? void 0 : t2 }), e2.push({ op: "replace", path: [], value: n2.t });
  } });
}
var G;
var U;
var W = "undefined" != typeof Symbol && "symbol" == typeof Symbol("x");
var X = "undefined" != typeof Map;
var q = "undefined" != typeof Set;
var B = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect;
var H = W ? Symbol.for("immer-nothing") : ((G = {})["immer-nothing"] = true, G);
var L = W ? Symbol.for("immer-draftable") : "__$immer_draftable";
var Q = W ? Symbol.for("immer-state") : "__$immer_state";
var Y = { 0: "Illegal state", 1: "Immer drafts cannot have computed properties", 2: "This object has been frozen and should not be mutated", 3: function(n2) {
  return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + n2;
}, 4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.", 5: "Immer forbids circular references", 6: "The first or second argument to `produce` must be a function", 7: "The third argument to `produce` must be a function or undefined", 8: "First argument to `createDraft` must be a plain object, an array, or an immerable object", 9: "First argument to `finishDraft` must be a draft returned by `createDraft`", 10: "The given draft is already finalized", 11: "Object.defineProperty() cannot be used on an Immer draft", 12: "Object.setPrototypeOf() cannot be used on an Immer draft", 13: "Immer only supports deleting array indices", 14: "Immer only supports setting array indices and the 'length' property", 15: function(n2) {
  return "Cannot apply patch, path doesn't resolve: " + n2;
}, 16: 'Sets cannot have "replace" patches.', 17: function(n2) {
  return "Unsupported patch operation: " + n2;
}, 18: function(n2) {
  return "The plugin for '" + n2 + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + n2 + "()` when initializing your application.";
}, 20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available", 21: function(n2) {
  return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '" + n2 + "'";
}, 22: function(n2) {
  return "'current' expects a draft, got: " + n2;
}, 23: function(n2) {
  return "'original' expects a draft, got: " + n2;
}, 24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed" };
var Z = "" + Object.prototype.constructor;
var nn = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function(n2) {
  return Object.getOwnPropertyNames(n2).concat(Object.getOwnPropertySymbols(n2));
} : Object.getOwnPropertyNames;
var tn = Object.getOwnPropertyDescriptors || function(n2) {
  var t2 = {};
  return nn(n2).forEach(function(r2) {
    t2[r2] = Object.getOwnPropertyDescriptor(n2, r2);
  }), t2;
};
var rn = {};
var en = { get: function(n2, t2) {
  if (t2 === Q) return n2;
  var e = p(n2);
  if (!u(e, t2)) return function(n3, t3, r2) {
    var e2, i3 = I(t3, r2);
    return i3 ? "value" in i3 ? i3.value : null === (e2 = i3.get) || void 0 === e2 ? void 0 : e2.call(n3.k) : void 0;
  }(n2, e, t2);
  var i2 = e[t2];
  return n2.I || !r(i2) ? i2 : i2 === z(n2.t, t2) ? (E(n2), n2.o[t2] = R(n2.A.h, i2, n2)) : i2;
}, has: function(n2, t2) {
  return t2 in p(n2);
}, ownKeys: function(n2) {
  return Reflect.ownKeys(p(n2));
}, set: function(n2, t2, r2) {
  var e = I(p(n2), t2);
  if (null == e ? void 0 : e.set) return e.set.call(n2.k, r2), true;
  if (!n2.P) {
    var i2 = z(p(n2), t2), o2 = null == i2 ? void 0 : i2[Q];
    if (o2 && o2.t === r2) return n2.o[t2] = r2, n2.D[t2] = false, true;
    if (c(r2, i2) && (void 0 !== r2 || u(n2.t, t2))) return true;
    E(n2), k(n2);
  }
  return n2.o[t2] === r2 && "number" != typeof r2 && (void 0 !== r2 || t2 in n2.o) || (n2.o[t2] = r2, n2.D[t2] = true, true);
}, deleteProperty: function(n2, t2) {
  return void 0 !== z(n2.t, t2) || t2 in n2.t ? (n2.D[t2] = false, E(n2), k(n2)) : delete n2.D[t2], n2.o && delete n2.o[t2], true;
}, getOwnPropertyDescriptor: function(n2, t2) {
  var r2 = p(n2), e = Reflect.getOwnPropertyDescriptor(r2, t2);
  return e ? { writable: true, configurable: 1 !== n2.i || "length" !== t2, enumerable: e.enumerable, value: r2[t2] } : e;
}, defineProperty: function() {
  n(11);
}, getPrototypeOf: function(n2) {
  return Object.getPrototypeOf(n2.t);
}, setPrototypeOf: function() {
  n(12);
} };
var on = {};
i(en, function(n2, t2) {
  on[n2] = function() {
    return arguments[0] = arguments[0][0], t2.apply(this, arguments);
  };
}), on.deleteProperty = function(t2, r2) {
  return isNaN(parseInt(r2)) && n(13), en.deleteProperty.call(this, t2[0], r2);
}, on.set = function(t2, r2, e) {
  return "length" !== r2 && isNaN(parseInt(r2)) && n(14), en.set.call(this, t2[0], r2, e, t2[0]);
};
var un = function() {
  function e(t2) {
    var e2 = this;
    this.g = B, this.F = true, this.produce = function(t3, i3, o2) {
      if ("function" == typeof t3 && "function" != typeof i3) {
        var u2 = i3;
        i3 = t3;
        var a2 = e2;
        return function(n2) {
          var t4 = this;
          void 0 === n2 && (n2 = u2);
          for (var r2 = arguments.length, e3 = Array(r2 > 1 ? r2 - 1 : 0), o3 = 1; o3 < r2; o3++) e3[o3 - 1] = arguments[o3];
          return a2.produce(n2, function(n3) {
            var r3;
            return (r3 = i3).call.apply(r3, [t4, n3].concat(e3));
          });
        };
      }
      var f2;
      if ("function" != typeof i3 && n(6), void 0 !== o2 && "function" != typeof o2 && n(7), r(t3)) {
        var c2 = w(e2), s2 = R(e2, t3, void 0), v2 = true;
        try {
          f2 = i3(s2), v2 = false;
        } finally {
          v2 ? O(c2) : g(c2);
        }
        return "undefined" != typeof Promise && f2 instanceof Promise ? f2.then(function(n2) {
          return j(c2, o2), P(n2, c2);
        }, function(n2) {
          throw O(c2), n2;
        }) : (j(c2, o2), P(f2, c2));
      }
      if (!t3 || "object" != typeof t3) {
        if ((f2 = i3(t3)) === H) return;
        return void 0 === f2 && (f2 = t3), e2.F && d(f2, true), f2;
      }
      n(21, t3);
    }, this.produceWithPatches = function(n2, t3) {
      return "function" == typeof n2 ? function(t4) {
        for (var r3 = arguments.length, i4 = Array(r3 > 1 ? r3 - 1 : 0), o2 = 1; o2 < r3; o2++) i4[o2 - 1] = arguments[o2];
        return e2.produceWithPatches(t4, function(t5) {
          return n2.apply(void 0, [t5].concat(i4));
        });
      } : [e2.produce(n2, t3, function(n3, t4) {
        r2 = n3, i3 = t4;
      }), r2, i3];
      var r2, i3;
    }, "boolean" == typeof (null == t2 ? void 0 : t2.useProxies) && this.setUseProxies(t2.useProxies), "boolean" == typeof (null == t2 ? void 0 : t2.autoFreeze) && this.setAutoFreeze(t2.autoFreeze);
  }
  var i2 = e.prototype;
  return i2.createDraft = function(e2) {
    r(e2) || n(8), t(e2) && (e2 = D(e2));
    var i3 = w(this), o2 = R(this, e2, void 0);
    return o2[Q].C = true, g(i3), o2;
  }, i2.finishDraft = function(t2, r2) {
    var e2 = t2 && t2[Q];
    e2 && e2.C || n(9), e2.I && n(10);
    var i3 = e2.A;
    return j(i3, r2), P(void 0, i3);
  }, i2.setAutoFreeze = function(n2) {
    this.F = n2;
  }, i2.setUseProxies = function(t2) {
    t2 && !B && n(20), this.g = t2;
  }, i2.applyPatches = function(n2, r2) {
    var e2;
    for (e2 = r2.length - 1; e2 >= 0; e2--) {
      var i3 = r2[e2];
      if (0 === i3.path.length && "replace" === i3.op) {
        n2 = i3.value;
        break;
      }
    }
    var o2 = b("Patches").$;
    return t(n2) ? o2(n2, r2) : this.produce(n2, function(n3) {
      return o2(n3, r2.slice(e2 + 1));
    });
  }, e;
}();
var an = new un();
var fn = an.produce;
var cn = an.produceWithPatches.bind(an);
var sn = an.setAutoFreeze.bind(an);
var vn = an.setUseProxies.bind(an);
var pn = an.applyPatches.bind(an);
var ln = an.createDraft.bind(an);
var dn = an.finishDraft.bind(an);

// node_modules/@aws-amplify/datastore/dist/esm/types.mjs
function isSchemaModel(obj) {
  return obj && obj.pluralName !== void 0;
}
function isSchemaModelWithAttributes(m2) {
  return isSchemaModel(m2) && m2.attributes !== void 0;
}
function isAssociatedWith(obj) {
  return obj && obj.associatedWith;
}
function isTargetNameAssociation(obj) {
  return (obj == null ? void 0 : obj.targetName) || (obj == null ? void 0 : obj.targetNames);
}
function isFieldAssociation(obj, fieldName) {
  var _a, _b;
  return (_b = (_a = obj == null ? void 0 : obj.fields[fieldName]) == null ? void 0 : _a.association) == null ? void 0 : _b.connectionType;
}
function isModelAttributeAuth(attr) {
  return attr.type === "auth" && attr.properties && attr.properties.rules && attr.properties.rules.length > 0;
}
function isModelAttributeKey(attr) {
  return attr.type === "key" && attr.properties && attr.properties.fields && attr.properties.fields.length > 0;
}
function isModelAttributePrimaryKey(attr) {
  return isModelAttributeKey(attr) && attr.properties.name === void 0;
}
function isModelAttributeCompositeKey(attr) {
  return isModelAttributeKey(attr) && attr.properties.name !== void 0 && attr.properties.fields.length > 2;
}
var ModelAttributeAuthAllow;
(function(ModelAttributeAuthAllow2) {
  ModelAttributeAuthAllow2["CUSTOM"] = "custom";
  ModelAttributeAuthAllow2["OWNER"] = "owner";
  ModelAttributeAuthAllow2["GROUPS"] = "groups";
  ModelAttributeAuthAllow2["PRIVATE"] = "private";
  ModelAttributeAuthAllow2["PUBLIC"] = "public";
})(ModelAttributeAuthAllow || (ModelAttributeAuthAllow = {}));
var ModelAttributeAuthProvider;
(function(ModelAttributeAuthProvider2) {
  ModelAttributeAuthProvider2["FUNCTION"] = "function";
  ModelAttributeAuthProvider2["USER_POOLS"] = "userPools";
  ModelAttributeAuthProvider2["OIDC"] = "oidc";
  ModelAttributeAuthProvider2["IAM"] = "iam";
  ModelAttributeAuthProvider2["API_KEY"] = "apiKey";
})(ModelAttributeAuthProvider || (ModelAttributeAuthProvider = {}));
var GraphQLScalarType;
(function(GraphQLScalarType3) {
  GraphQLScalarType3[GraphQLScalarType3["ID"] = 0] = "ID";
  GraphQLScalarType3[GraphQLScalarType3["String"] = 1] = "String";
  GraphQLScalarType3[GraphQLScalarType3["Int"] = 2] = "Int";
  GraphQLScalarType3[GraphQLScalarType3["Float"] = 3] = "Float";
  GraphQLScalarType3[GraphQLScalarType3["Boolean"] = 4] = "Boolean";
  GraphQLScalarType3[GraphQLScalarType3["AWSDate"] = 5] = "AWSDate";
  GraphQLScalarType3[GraphQLScalarType3["AWSTime"] = 6] = "AWSTime";
  GraphQLScalarType3[GraphQLScalarType3["AWSDateTime"] = 7] = "AWSDateTime";
  GraphQLScalarType3[GraphQLScalarType3["AWSTimestamp"] = 8] = "AWSTimestamp";
  GraphQLScalarType3[GraphQLScalarType3["AWSEmail"] = 9] = "AWSEmail";
  GraphQLScalarType3[GraphQLScalarType3["AWSJSON"] = 10] = "AWSJSON";
  GraphQLScalarType3[GraphQLScalarType3["AWSURL"] = 11] = "AWSURL";
  GraphQLScalarType3[GraphQLScalarType3["AWSPhone"] = 12] = "AWSPhone";
  GraphQLScalarType3[GraphQLScalarType3["AWSIPAddress"] = 13] = "AWSIPAddress";
})(GraphQLScalarType || (GraphQLScalarType = {}));
(function(GraphQLScalarType3) {
  function getJSType(scalar) {
    switch (scalar) {
      case "Boolean":
        return "boolean";
      case "ID":
      case "String":
      case "AWSDate":
      case "AWSTime":
      case "AWSDateTime":
      case "AWSEmail":
      case "AWSURL":
      case "AWSPhone":
      case "AWSIPAddress":
        return "string";
      case "Int":
      case "Float":
      case "AWSTimestamp":
        return "number";
      case "AWSJSON":
        return "object";
      default:
        throw new Error("Invalid scalar type");
    }
  }
  GraphQLScalarType3.getJSType = getJSType;
  function getValidationFunction(scalar) {
    switch (scalar) {
      case "AWSDate":
        return isAWSDate;
      case "AWSTime":
        return isAWSTime;
      case "AWSDateTime":
        return isAWSDateTime;
      case "AWSTimestamp":
        return isAWSTimestamp;
      case "AWSEmail":
        return isAWSEmail;
      case "AWSJSON":
        return isAWSJSON;
      case "AWSURL":
        return isAWSURL;
      case "AWSPhone":
        return isAWSPhone;
      case "AWSIPAddress":
        return isAWSIPAddress;
      default:
        return void 0;
    }
  }
  GraphQLScalarType3.getValidationFunction = getValidationFunction;
})(GraphQLScalarType || (GraphQLScalarType = {}));
function isGraphQLScalarType(obj) {
  return obj && GraphQLScalarType[obj] !== void 0;
}
function isModelFieldType(obj) {
  const modelField = "model";
  if (obj && obj[modelField])
    return true;
  return false;
}
function isNonModelFieldType(obj) {
  const typeField = "nonModel";
  if (obj && obj[typeField])
    return true;
  return false;
}
function isEnumFieldType(obj) {
  const modelField = "enum";
  if (obj && obj[modelField])
    return true;
  return false;
}
function isIdentifierObject(obj, modelDefinition) {
  const keys = extractPrimaryKeyFieldNames(modelDefinition);
  return typeof obj === "object" && obj && keys.every((k2) => obj[k2] !== void 0);
}
var OpType;
(function(OpType2) {
  OpType2["INSERT"] = "INSERT";
  OpType2["UPDATE"] = "UPDATE";
  OpType2["DELETE"] = "DELETE";
})(OpType || (OpType = {}));
function isPredicateObj(obj) {
  return obj && obj.field !== void 0;
}
function isPredicateGroup(obj) {
  return obj && obj.type !== void 0;
}
var QueryOne;
(function(QueryOne2) {
  QueryOne2[QueryOne2["FIRST"] = 0] = "FIRST";
  QueryOne2[QueryOne2["LAST"] = 1] = "LAST";
})(QueryOne || (QueryOne = {}));
var SortDirection;
(function(SortDirection2) {
  SortDirection2["ASCENDING"] = "ASCENDING";
  SortDirection2["DESCENDING"] = "DESCENDING";
})(SortDirection || (SortDirection = {}));
var AuthModeStrategyType;
(function(AuthModeStrategyType2) {
  AuthModeStrategyType2["DEFAULT"] = "DEFAULT";
  AuthModeStrategyType2["MULTI_AUTH"] = "MULTI_AUTH";
})(AuthModeStrategyType || (AuthModeStrategyType = {}));
var ModelOperation;
(function(ModelOperation2) {
  ModelOperation2["CREATE"] = "CREATE";
  ModelOperation2["READ"] = "READ";
  ModelOperation2["UPDATE"] = "UPDATE";
  ModelOperation2["DELETE"] = "DELETE";
})(ModelOperation || (ModelOperation = {}));
async function syncExpression(modelConstructor, conditionProducer) {
  return {
    modelConstructor,
    conditionProducer
  };
}
var ProcessName;
(function(ProcessName2) {
  ProcessName2["sync"] = "sync";
  ProcessName2["mutate"] = "mutate";
  ProcessName2["subscribe"] = "subscribe";
})(ProcessName || (ProcessName = {}));
var DISCARD = Symbol("DISCARD");
var LimitTimerRaceResolvedValues;
(function(LimitTimerRaceResolvedValues2) {
  LimitTimerRaceResolvedValues2["LIMIT"] = "LIMIT";
  LimitTimerRaceResolvedValues2["TIMER"] = "TIMER";
})(LimitTimerRaceResolvedValues || (LimitTimerRaceResolvedValues = {}));
var PredicateInternalsKey = class {
  constructor() {
    this.__isPredicateInternalsKeySentinel = true;
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/predicates/sort.mjs
var ModelSortPredicateCreator = class _ModelSortPredicateCreator {
  static createPredicateBuilder(modelDefinition) {
    const { name: modelName } = modelDefinition;
    const fieldNames = new Set(Object.keys(modelDefinition.fields));
    const predicate = new Proxy({}, {
      get(_target, propertyKey, receiver) {
        const field = propertyKey;
        if (!fieldNames.has(field)) {
          throw new Error(`Invalid field for model. field: ${String(field)}, model: ${modelName}`);
        }
        const result = (sortDirection) => {
          var _a;
          (_a = _ModelSortPredicateCreator.sortPredicateGroupsMap.get(receiver)) == null ? void 0 : _a.push({ field, sortDirection });
          return receiver;
        };
        return result;
      }
    });
    _ModelSortPredicateCreator.sortPredicateGroupsMap.set(predicate, []);
    return predicate;
  }
  static isValidPredicate(predicate) {
    return _ModelSortPredicateCreator.sortPredicateGroupsMap.has(predicate);
  }
  static getPredicates(predicate, throwOnInvalid = true) {
    if (throwOnInvalid && !_ModelSortPredicateCreator.isValidPredicate(predicate)) {
      throw new Error("The predicate is not valid");
    }
    const predicateGroup = _ModelSortPredicateCreator.sortPredicateGroupsMap.get(predicate);
    if (predicateGroup) {
      return predicateGroup;
    } else {
      throw new Error("Predicate group not found");
    }
  }
  // transforms cb-style predicate into Proxy
  static createFromExisting(modelDefinition, existing) {
    if (!existing || !modelDefinition) {
      return void 0;
    }
    return existing(_ModelSortPredicateCreator.createPredicateBuilder(modelDefinition));
  }
};
ModelSortPredicateCreator.sortPredicateGroupsMap = /* @__PURE__ */ new WeakMap();

// node_modules/@aws-amplify/datastore/dist/esm/predicates/index.mjs
var predicatesAllSet = /* @__PURE__ */ new WeakSet();
function isPredicatesAll(predicate) {
  return predicatesAllSet.has(predicate);
}
var groupKeys = /* @__PURE__ */ new Set(["and", "or", "not"]);
var isGroup = (o2) => {
  const keys = [...Object.keys(o2)];
  return keys.length === 1 && groupKeys.has(keys[0]);
};
var isEmpty = (o2) => {
  return !Array.isArray(o2) && Object.keys(o2).length === 0;
};
var comparisonKeys = /* @__PURE__ */ new Set([
  "eq",
  "ne",
  "gt",
  "lt",
  "ge",
  "le",
  "contains",
  "notContains",
  "beginsWith",
  "between"
]);
var isComparison = (o2) => {
  const keys = [...Object.keys(o2)];
  return !Array.isArray(o2) && keys.length === 1 && comparisonKeys.has(keys[0]);
};
var isValid = (o2) => {
  if (Array.isArray(o2)) {
    return o2.every((v2) => isValid(v2));
  } else {
    return Object.keys(o2).length <= 1;
  }
};
var PredicateAll = Symbol("A predicate that matches all records");
var Predicates = class {
  static get ALL() {
    const predicate = (c2) => c2;
    predicatesAllSet.add(predicate);
    return predicate;
  }
};
var ModelPredicateCreator = class _ModelPredicateCreator {
  /**
   * Determines whether the given storage predicate (lookup key) is a predicate
   * key that DataStore recognizes.
   *
   * @param predicate The storage predicate (lookup key) to test.
   */
  static isValidPredicate(predicate) {
    return _ModelPredicateCreator.predicateGroupsMap.has(predicate);
  }
  /**
   * Looks for the storage predicate AST that corresponds to a given storage
   * predicate key.
   *
   * The key must have been created internally by a DataStore utility
   * method, such as `ModelPredicate.createFromAST()`.
   *
   * @param predicate The predicate reference to look up.
   * @param throwOnInvalid Whether to throw an exception if the predicate
   * isn't a valid DataStore predicate.
   */
  static getPredicates(predicate, throwOnInvalid = true) {
    if (throwOnInvalid && !_ModelPredicateCreator.isValidPredicate(predicate)) {
      throw new Error("The predicate is not valid");
    }
    return _ModelPredicateCreator.predicateGroupsMap.get(predicate);
  }
  /**
   * using the PK values from the given `model` (which can be a partial of T
   * Creates a predicate that matches an instance described by `modelDefinition`
   * that contains only PK field values.)
   *
   * @param modelDefinition The model definition to create a predicate for.
   * @param model The model instance to extract value equalities from.
   */
  static createForPk(modelDefinition, model) {
    const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
    const keyValues = extractPrimaryKeyValues(model, keyFields);
    const predicate = this.createFromAST(modelDefinition, {
      and: keyFields.map((field, idx) => {
        const operand = keyValues[idx];
        return { [field]: { eq: operand } };
      })
    });
    return predicate;
  }
  /**
   * Searches a `Model` table for records matching the given equalities object.
   *
   * This only matches against fields given in the equalities object. No other
   * fields are tested by the predicate.
   *
   * @param modelDefinition The model we need a predicate for.
   * @param flatEqualities An object holding field equalities to search for.
   */
  static createFromFlatEqualities(modelDefinition, flatEqualities) {
    const ast = {
      and: Object.entries(flatEqualities).map(([k2, v2]) => ({ [k2]: { eq: v2 } }))
    };
    return this.createFromAST(modelDefinition, ast);
  }
  /**
   * Accepts a GraphQL style filter predicate tree and transforms it into an
   * AST that can be used for a storage adapter predicate. Example input:
   *
   * ```js
   * {
   * 	and: [
   * 		{ name: { eq: "Bob Jones" } },
   * 		{ age: { between: [32, 64] } },
   * 		{ not: {
   * 			or: [
   * 				{ favoriteFood: { eq: 'pizza' } },
   * 				{ favoriteFood: { eq: 'tacos' } },
   * 			]
   * 		}}
   * 	]
   * }
   * ```
   *
   * @param gql GraphQL style filter node.
   */
  static transformGraphQLFilterNodeToPredicateAST(gql) {
    if (!isValid(gql)) {
      throw new Error("Invalid GraphQL Condition or subtree: " + JSON.stringify(gql));
    }
    if (isEmpty(gql)) {
      return {
        type: "and",
        predicates: []
      };
    } else if (isGroup(gql)) {
      const groupkey = Object.keys(gql)[0];
      const children = this.transformGraphQLFilterNodeToPredicateAST(gql[groupkey]);
      return {
        type: groupkey,
        predicates: Array.isArray(children) ? children : [children]
      };
    } else if (isComparison(gql)) {
      const operatorKey = Object.keys(gql)[0];
      return {
        operator: operatorKey,
        operand: gql[operatorKey]
      };
    } else {
      if (Array.isArray(gql)) {
        return gql.map((o2) => this.transformGraphQLFilterNodeToPredicateAST(o2));
      } else {
        const fieldKey = Object.keys(gql)[0];
        return {
          field: fieldKey,
          ...this.transformGraphQLFilterNodeToPredicateAST(gql[fieldKey])
        };
      }
    }
  }
  /**
   * Accepts a GraphQL style filter predicate tree and transforms it into a predicate
   * that storage adapters understand. Example input:
   *
   * ```js
   * {
   * 	and: [
   * 		{ name: { eq: "Bob Jones" } },
   * 		{ age: { between: [32, 64] } },
   * 		{ not: {
   * 			or: [
   * 				{ favoriteFood: { eq: 'pizza' } },
   * 				{ favoriteFood: { eq: 'tacos' } },
   * 			]
   * 		}}
   * 	]
   * }
   * ```
   *
   * @param modelDefinition The model that the AST/predicate must be compatible with.
   * @param ast The graphQL style AST that should specify conditions for `modelDefinition`.
   */
  static createFromAST(modelDefinition, ast) {
    const key = {};
    _ModelPredicateCreator.predicateGroupsMap.set(key, this.transformGraphQLFilterNodeToPredicateAST(ast));
    return key;
  }
};
ModelPredicateCreator.predicateGroupsMap = /* @__PURE__ */ new WeakMap();

// node_modules/@aws-amplify/datastore/dist/esm/util.mjs
var ID = "id";
var DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR = "#";
var IDENTIFIER_KEY_SEPARATOR = "-";
var errorMessages = {
  idEmptyString: "An index field cannot contain an empty string value",
  queryByPkWithCompositeKeyPresent: "Models with composite primary keys cannot be queried by a single key value. Use object literal syntax for composite keys instead: https://docs.amplify.aws/lib/datastore/advanced-workflows/q/platform/js/#querying-records-with-custom-primary-keys",
  deleteByPkWithCompositeKeyPresent: "Models with composite primary keys cannot be deleted by a single key value, unless using a predicate. Use object literal syntax for composite keys instead: https://docs.amplify.aws/lib/datastore/advanced-workflows/q/platform/js/#querying-records-with-custom-primary-keys",
  observeWithObjectLiteral: "Object literal syntax cannot be used with observe. Use a predicate instead: https://docs.amplify.aws/lib/datastore/data-access/q/platform/js/#predicates"
};
var NAMESPACES;
(function(NAMESPACES2) {
  NAMESPACES2["DATASTORE"] = "datastore";
  NAMESPACES2["USER"] = "user";
  NAMESPACES2["SYNC"] = "sync";
  NAMESPACES2["STORAGE"] = "storage";
})(NAMESPACES || (NAMESPACES = {}));
var { DATASTORE } = NAMESPACES;
var { USER } = NAMESPACES;
var { SYNC } = NAMESPACES;
var { STORAGE } = NAMESPACES;
var isNullOrUndefined = (val) => {
  return typeof val === "undefined" || val === void 0 || val === null;
};
var validatePredicate = (model, groupType, predicatesOrGroups) => {
  let filterType;
  let isNegation = false;
  if (predicatesOrGroups.length === 0) {
    return true;
  }
  switch (groupType) {
    case "not":
      filterType = "every";
      isNegation = true;
      break;
    case "and":
      filterType = "every";
      break;
    case "or":
      filterType = "some";
      break;
    default:
      throw new Error(`Invalid ${groupType}`);
  }
  const result = predicatesOrGroups[filterType]((predicateOrGroup) => {
    if (isPredicateObj(predicateOrGroup)) {
      const { field, operator, operand } = predicateOrGroup;
      const value = model[field];
      return validatePredicateField(value, operator, operand);
    }
    if (isPredicateGroup(predicateOrGroup)) {
      const { type, predicates } = predicateOrGroup;
      return validatePredicate(model, type, predicates);
    }
    throw new Error("Not a predicate or group");
  });
  return isNegation ? !result : result;
};
var validatePredicateField = (value, operator, operand) => {
  switch (operator) {
    case "ne":
      return value !== operand;
    case "eq":
      return value === operand;
    case "le":
      return value <= operand;
    case "lt":
      return value < operand;
    case "ge":
      return value >= operand;
    case "gt":
      return value > operand;
    case "between": {
      const [min, max] = operand;
      return value >= min && value <= max;
    }
    case "beginsWith":
      return !isNullOrUndefined(value) && value.startsWith(operand);
    case "contains":
      return !isNullOrUndefined(value) && value.indexOf(operand) > -1;
    case "notContains":
      return isNullOrUndefined(value) || value.indexOf(operand) === -1;
    default:
      return false;
  }
};
var isModelConstructor = (obj) => {
  return obj && typeof obj.copyOf === "function";
};
var nonModelClasses = /* @__PURE__ */ new WeakSet();
function registerNonModelClass(clazz) {
  nonModelClasses.add(clazz);
}
var isNonModelConstructor = (obj) => {
  return nonModelClasses.has(obj);
};
var topologicallySortedModels = /* @__PURE__ */ new WeakMap();
var traverseModel = (srcModelName, instance2, namespace, modelInstanceCreator2, getModelConstructorByModelName2) => {
  const modelConstructor = getModelConstructorByModelName2(namespace.name, srcModelName);
  const result = [];
  const newInstance = modelConstructor.copyOf(instance2, () => {
  });
  result.unshift({
    modelName: srcModelName,
    item: newInstance,
    instance: newInstance
  });
  if (!topologicallySortedModels.has(namespace)) {
    topologicallySortedModels.set(namespace, Array.from(namespace.modelTopologicalOrdering.keys()));
  }
  const sortedModels = topologicallySortedModels.get(namespace);
  result.sort((a2, b2) => {
    return sortedModels.indexOf(a2.modelName) - sortedModels.indexOf(b2.modelName);
  });
  return result;
};
var privateModeCheckResult;
var isPrivateMode = () => {
  return new Promise((resolve4) => {
    const dbname = amplifyUuid();
    let db;
    const isPrivate = () => {
      privateModeCheckResult = false;
      resolve4(true);
    };
    const isNotPrivate = async () => {
      if (db && db.result && typeof db.result.close === "function") {
        await db.result.close();
      }
      await indexedDB.deleteDatabase(dbname);
      privateModeCheckResult = true;
      resolve4(false);
    };
    if (privateModeCheckResult === true) {
      return isNotPrivate();
    }
    if (privateModeCheckResult === false) {
      isPrivate();
      return;
    }
    if (indexedDB === null) {
      isPrivate();
      return;
    }
    db = indexedDB.open(dbname);
    db.onerror = isPrivate;
    db.onsuccess = isNotPrivate;
  });
};
var safariCompatabilityModeResult;
var isSafariCompatabilityMode = async () => {
  try {
    const dbName = amplifyUuid();
    const storeName = "indexedDBFeatureProbeStore";
    const indexName = "idx";
    if (indexedDB === null)
      return false;
    if (safariCompatabilityModeResult !== void 0) {
      return safariCompatabilityModeResult;
    }
    const db = await new Promise((resolve4) => {
      const dbOpenRequest = indexedDB.open(dbName);
      dbOpenRequest.onerror = () => {
        resolve4(false);
      };
      dbOpenRequest.onsuccess = () => {
        const openedDb = dbOpenRequest.result;
        resolve4(openedDb);
      };
      dbOpenRequest.onupgradeneeded = (event) => {
        var _a;
        const upgradedDb = (_a = event == null ? void 0 : event.target) == null ? void 0 : _a.result;
        upgradedDb.onerror = () => {
          resolve4(false);
        };
        const store = upgradedDb.createObjectStore(storeName, {
          autoIncrement: true
        });
        store.createIndex(indexName, ["id"]);
      };
    });
    if (!db) {
      throw new Error("Could not open probe DB");
    }
    const rwTx = db.transaction(storeName, "readwrite");
    const rwStore = rwTx.objectStore(storeName);
    rwStore.add({
      id: 1
    });
    rwTx.commit();
    const result = await new Promise((resolve4) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const getRequest = index.get([1]);
      getRequest.onerror = () => {
        resolve4(false);
      };
      getRequest.onsuccess = (event) => {
        var _a;
        resolve4((_a = event == null ? void 0 : event.target) == null ? void 0 : _a.result);
      };
    });
    if (db && typeof db.close === "function") {
      await db.close();
    }
    await indexedDB.deleteDatabase(dbName);
    if (result === void 0) {
      safariCompatabilityModeResult = true;
    } else {
      safariCompatabilityModeResult = false;
    }
  } catch (error) {
    safariCompatabilityModeResult = false;
  }
  return safariCompatabilityModeResult;
};
var HEX_TO_SHORT = {};
for (let i2 = 0; i2 < 256; i2++) {
  let encodedByte = i2.toString(16).toLowerCase();
  if (encodedByte.length === 1) {
    encodedByte = `0${encodedByte}`;
  }
  HEX_TO_SHORT[encodedByte] = i2;
}
var getBytesFromHex = (encoded) => {
  if (encoded.length % 2 !== 0) {
    throw new Error("Hex encoded strings must have an even number length");
  }
  const out = new Uint8Array(encoded.length / 2);
  for (let i2 = 0; i2 < encoded.length; i2 += 2) {
    const encodedByte = encoded.slice(i2, i2 + 2).toLowerCase();
    if (encodedByte in HEX_TO_SHORT) {
      out[i2 / 2] = HEX_TO_SHORT[encodedByte];
    } else {
      throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
    }
  }
  return out;
};
var randomBytes = (nBytes) => {
  const str = new WordArray().random(nBytes).toString();
  return getBytesFromHex(str);
};
var prng = () => randomBytes(1)[0] / 255;
function monotonicUlidFactory(seed) {
  const ulid3 = monotonicFactory(prng);
  return () => {
    return ulid3(seed);
  };
}
function getNow() {
  if (typeof performance !== "undefined" && performance && typeof performance.now === "function") {
    return performance.now() | 0;
  } else {
    return Date.now();
  }
}
function sortCompareFunction(sortPredicates) {
  return function compareFunction(a2, b2) {
    for (const predicate of sortPredicates) {
      const { field, sortDirection } = predicate;
      const sortMultiplier = sortDirection === SortDirection.ASCENDING ? 1 : -1;
      if (a2[field] < b2[field]) {
        return -1 * sortMultiplier;
      }
      if (a2[field] > b2[field]) {
        return 1 * sortMultiplier;
      }
    }
    return 0;
  };
}
function directedValueEquality(fromObject, againstObject, nullish = false) {
  const aKeys = Object.keys(fromObject);
  for (const key of aKeys) {
    const fromValue = fromObject[key];
    const againstValue = againstObject[key];
    if (!valuesEqual(fromValue, againstValue, nullish)) {
      return false;
    }
  }
  return true;
}
function valuesEqual(valA, valB, nullish = false) {
  let a2 = valA;
  let b2 = valB;
  const nullishCompare = (_a, _b) => {
    return (_a === void 0 || _a === null) && (_b === void 0 || _b === null);
  };
  if (a2 instanceof Object && !(b2 instanceof Object) || !(a2 instanceof Object) && b2 instanceof Object) {
    return false;
  }
  if (!(a2 instanceof Object)) {
    if (nullish && nullishCompare(a2, b2)) {
      return true;
    }
    return a2 === b2;
  }
  if (Array.isArray(a2) && !Array.isArray(b2) || Array.isArray(b2) && !Array.isArray(a2)) {
    return false;
  }
  if (a2 instanceof Set && b2 instanceof Set) {
    a2 = [...a2];
    b2 = [...b2];
  }
  if (a2 instanceof Map && b2 instanceof Map) {
    a2 = Object.fromEntries(a2);
    b2 = Object.fromEntries(b2);
  }
  const aKeys = Object.keys(a2);
  const bKeys = Object.keys(b2);
  if (aKeys.length !== bKeys.length && (!nullish || Array.isArray(a2))) {
    return false;
  }
  const keys = aKeys.length >= bKeys.length ? aKeys : bKeys;
  for (const key of keys) {
    const aVal = a2[key];
    const bVal = b2[key];
    if (!valuesEqual(aVal, bVal, nullish)) {
      return false;
    }
  }
  return true;
}
function inMemoryPagination(records, pagination) {
  if (pagination && records.length > 1) {
    if (pagination.sort) {
      const sortPredicates = ModelSortPredicateCreator.getPredicates(pagination.sort);
      if (sortPredicates.length) {
        const compareFn = sortCompareFunction(sortPredicates);
        records.sort(compareFn);
      }
    }
    const { page = 0, limit = 0 } = pagination;
    const start = Math.max(0, page * limit) || 0;
    const end = limit > 0 ? start + limit : records.length;
    return records.slice(start, end);
  }
  return records;
}
async function asyncSome(items, matches) {
  for (const item of items) {
    if (await matches(item)) {
      return true;
    }
  }
  return false;
}
async function asyncEvery(items, matches) {
  for (const item of items) {
    if (!await matches(item)) {
      return false;
    }
  }
  return true;
}
var isAWSDate = (val) => {
  return !!/^\d{4}-\d{2}-\d{2}(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(val);
};
var isAWSTime = (val) => {
  return !!/^\d{2}:\d{2}(:\d{2}(.\d+)?)?(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(val);
};
var isAWSDateTime = (val) => {
  return !!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(.\d+)?)?(Z|[+-]\d{2}:\d{2}($|:\d{2}))?$/.exec(val);
};
var isAWSTimestamp = (val) => {
  return !!/^\d+$/.exec(String(val));
};
var isAWSEmail = (val) => {
  return !!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.exec(val);
};
var isAWSJSON = (val) => {
  try {
    JSON.parse(val);
    return true;
  } catch {
    return false;
  }
};
var isAWSURL = (val) => {
  try {
    return !!new AmplifyUrl(val);
  } catch {
    return false;
  }
};
var isAWSPhone = (val) => {
  return !!/^\+?\d[\d\s-]+$/.exec(val);
};
var isAWSIPAddress = (val) => {
  return !!/((^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$)|(^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$))$/.exec(val);
};
var DeferredPromise = class {
  constructor() {
    const self2 = this;
    this.promise = new Promise((resolve4, reject) => {
      self2.resolve = resolve4;
      self2.reject = reject;
    });
  }
};
var DeferredCallbackResolver = class {
  constructor(options) {
    this.limitPromise = new DeferredPromise();
    this.raceInFlight = false;
    this.callback = () => {
    };
    this.defaultErrorHandler = (msg = "DeferredCallbackResolver error") => {
      throw new Error(msg);
    };
    this.callback = options.callback;
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;
    this.maxInterval = options.maxInterval || 2e3;
  }
  startTimer() {
    this.timerPromise = new Promise((resolve4, _reject) => {
      this.timer = setTimeout(() => {
        resolve4(LimitTimerRaceResolvedValues.TIMER);
      }, this.maxInterval);
    });
  }
  async racePromises() {
    let winner;
    try {
      this.raceInFlight = true;
      this.startTimer();
      winner = await Promise.race([
        this.timerPromise,
        this.limitPromise.promise
      ]);
      this.callback();
    } catch (err) {
      this.errorHandler(err);
    } finally {
      this.clear();
      this.raceInFlight = false;
      this.limitPromise = new DeferredPromise();
      return winner;
    }
  }
  start() {
    if (!this.raceInFlight)
      this.racePromises();
  }
  clear() {
    clearTimeout(this.timer);
  }
  resolve() {
    this.limitPromise.resolve(LimitTimerRaceResolvedValues.LIMIT);
  }
};
function mergePatches(originalSource, oldPatches, newPatches) {
  const patchesToMerge = oldPatches.concat(newPatches);
  let patches;
  fn(originalSource, (draft) => {
    pn(draft, patchesToMerge);
  }, (p2) => {
    patches = p2;
  });
  return patches;
}
var getStorename = (namespace, modelName) => {
  const storeName = `${namespace}_${modelName}`;
  return storeName;
};
var processCompositeKeys = (attributes) => {
  const extractCompositeSortKey = ({ properties: {
    // ignore the HK (fields[0]) we only need to include the composite sort key fields[1...n]
    fields: [, ...sortKeyFields]
  } }) => sortKeyFields;
  const compositeKeyFields = attributes.filter(isModelAttributeCompositeKey).map(extractCompositeSortKey);
  const combineIntersecting = (fields7) => fields7.reduce((combined2, sortKeyFields) => {
    const sortKeyFieldsSet = new Set(sortKeyFields);
    if (combined2.length === 0) {
      combined2.push(sortKeyFieldsSet);
      return combined2;
    }
    const intersectingSetIdx = combined2.findIndex((existingSet) => {
      return [...existingSet].some((f2) => sortKeyFieldsSet.has(f2));
    });
    if (intersectingSetIdx > -1) {
      const union = /* @__PURE__ */ new Set([
        ...combined2[intersectingSetIdx],
        ...sortKeyFieldsSet
      ]);
      combined2[intersectingSetIdx] = union;
    } else {
      combined2.push(sortKeyFieldsSet);
    }
    return combined2;
  }, []);
  const initial = combineIntersecting(compositeKeyFields);
  const combined = combineIntersecting(initial);
  return combined;
};
var extractKeyIfExists = (modelDefinition) => {
  var _a;
  const keyAttribute = (_a = modelDefinition == null ? void 0 : modelDefinition.attributes) == null ? void 0 : _a.find(isModelAttributeKey);
  return keyAttribute;
};
var extractPrimaryKeyFieldNames = (modelDefinition) => {
  const keyAttribute = extractKeyIfExists(modelDefinition);
  if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
    return keyAttribute.properties.fields;
  }
  return [ID];
};
var extractPrimaryKeyValues = (model, keyFields) => {
  return keyFields.map((key) => model[key]);
};
var extractPrimaryKeysAndValues = (model, keyFields) => {
  const primaryKeysAndValues = {};
  keyFields.forEach((key) => primaryKeysAndValues[key] = model[key]);
  return primaryKeysAndValues;
};
var isIdManaged = (modelDefinition) => {
  const keyAttribute = extractKeyIfExists(modelDefinition);
  if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
    return false;
  }
  return true;
};
var isIdOptionallyManaged = (modelDefinition) => {
  const keyAttribute = extractKeyIfExists(modelDefinition);
  if (keyAttribute && isModelAttributePrimaryKey(keyAttribute)) {
    return keyAttribute.properties.fields[0] === ID;
  }
  return false;
};
var establishRelationAndKeys = (namespace) => {
  const relationship = {};
  const keys = {};
  Object.keys(namespace.models).forEach((mKey) => {
    relationship[mKey] = { indexes: [], relationTypes: [] };
    keys[mKey] = {};
    const model = namespace.models[mKey];
    Object.keys(model.fields).forEach((attr) => {
      const fieldAttribute = model.fields[attr];
      if (typeof fieldAttribute.type === "object" && "model" in fieldAttribute.type) {
        const { connectionType } = fieldAttribute.association;
        relationship[mKey].relationTypes.push({
          fieldName: fieldAttribute.name,
          modelName: fieldAttribute.type.model,
          relationType: connectionType,
          targetName: fieldAttribute.association.targetName,
          targetNames: fieldAttribute.association.targetNames,
          // eslint-disable-next-line dot-notation
          associatedWith: fieldAttribute.association["associatedWith"]
        });
        if (connectionType === "BELONGS_TO") {
          const targetNames = extractTargetNamesFromSrc(fieldAttribute.association);
          if (targetNames) {
            const idxName = indexNameFromKeys(targetNames);
            const idxExists = relationship[mKey].indexes.find(([index]) => index === idxName);
            if (!idxExists) {
              relationship[mKey].indexes.push([idxName, targetNames]);
            }
          }
        }
      }
    });
    if (model.attributes) {
      keys[mKey].compositeKeys = processCompositeKeys(model.attributes);
      for (const attribute of model.attributes) {
        if (!isModelAttributeKey(attribute)) {
          continue;
        }
        const { fields: fields7 } = attribute.properties;
        if (isModelAttributePrimaryKey(attribute)) {
          keys[mKey].primaryKey = fields7;
          continue;
        }
        const idxName = indexNameFromKeys(fields7);
        const idxExists = relationship[mKey].indexes.find(([index]) => index === idxName);
        if (!idxExists) {
          relationship[mKey].indexes.push([idxName, fields7]);
        }
      }
    }
    if (!keys[mKey].primaryKey) {
      keys[mKey].primaryKey = [ID];
    }
    relationship[mKey].indexes.push([
      "byPk",
      keys[mKey].primaryKey,
      { unique: true }
    ]);
  });
  return [relationship, keys];
};
var extractTargetNamesFromSrc = (src) => {
  const targetName = src == null ? void 0 : src.targetName;
  const targetNames = src == null ? void 0 : src.targetNames;
  if (Array.isArray(targetNames)) {
    return targetNames;
  } else if (typeof targetName === "string") {
    return [targetName];
  } else {
    return void 0;
  }
};
var indexNameFromKeys = (keys) => {
  return keys.reduce((prev, cur, idx) => {
    if (idx === 0) {
      return cur;
    }
    return `${prev}${IDENTIFIER_KEY_SEPARATOR}${cur}`;
  }, "");
};
var keysEqual = (keysA, keysB) => {
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key, idx) => key === keysB[idx]);
};
var getIndexKeys = (namespace, modelName) => {
  var _a, _b;
  const keyPath = (_b = (_a = namespace == null ? void 0 : namespace.keys) == null ? void 0 : _a[modelName]) == null ? void 0 : _b.primaryKey;
  if (keyPath) {
    return keyPath;
  }
  return [ID];
};
var getTimestampFields = (definition) => {
  var _a, _b;
  const modelAttributes = (_a = definition.attributes) == null ? void 0 : _a.find((attr) => attr.type === "model");
  const timestampFieldsMap = (_b = modelAttributes == null ? void 0 : modelAttributes.properties) == null ? void 0 : _b.timestamps;
  const defaultFields = {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  };
  const customFields = timestampFieldsMap || {};
  return {
    ...defaultFields,
    ...customFields
  };
};

// node_modules/graphql/version.mjs
var versionInfo = Object.freeze({
  major: 15,
  minor: 8,
  patch: 0,
  preReleaseTag: null
});

// node_modules/graphql/jsutils/isObjectLike.mjs
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof6(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function _typeof6(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function isObjectLike(value) {
  return _typeof(value) == "object" && value !== null;
}

// node_modules/graphql/polyfills/symbols.mjs
var SYMBOL_ITERATOR = typeof Symbol === "function" && Symbol.iterator != null ? Symbol.iterator : "@@iterator";
var SYMBOL_ASYNC_ITERATOR = typeof Symbol === "function" && Symbol.asyncIterator != null ? Symbol.asyncIterator : "@@asyncIterator";
var SYMBOL_TO_STRING_TAG = typeof Symbol === "function" && Symbol.toStringTag != null ? Symbol.toStringTag : "@@toStringTag";

// node_modules/graphql/language/location.mjs
function getLocation(source, position) {
  var lineRegexp = /\r\n|[\n\r]/g;
  var line = 1;
  var column = position + 1;
  var match;
  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
    line += 1;
    column = position + 1 - (match.index + match[0].length);
  }
  return {
    line,
    column
  };
}

// node_modules/graphql/language/printLocation.mjs
function printLocation(location) {
  return printSourceLocation(location.source, getLocation(location.source, location.start));
}
function printSourceLocation(source, sourceLocation) {
  var firstLineColumnOffset = source.locationOffset.column - 1;
  var body = whitespace(firstLineColumnOffset) + source.body;
  var lineIndex = sourceLocation.line - 1;
  var lineOffset = source.locationOffset.line - 1;
  var lineNum = sourceLocation.line + lineOffset;
  var columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
  var columnNum = sourceLocation.column + columnOffset;
  var locationStr = "".concat(source.name, ":").concat(lineNum, ":").concat(columnNum, "\n");
  var lines = body.split(/\r\n|[\n\r]/g);
  var locationLine = lines[lineIndex];
  if (locationLine.length > 120) {
    var subLineIndex = Math.floor(columnNum / 80);
    var subLineColumnNum = columnNum % 80;
    var subLines = [];
    for (var i2 = 0; i2 < locationLine.length; i2 += 80) {
      subLines.push(locationLine.slice(i2, i2 + 80));
    }
    return locationStr + printPrefixedLines([["".concat(lineNum), subLines[0]]].concat(subLines.slice(1, subLineIndex + 1).map(function(subLine) {
      return ["", subLine];
    }), [[" ", whitespace(subLineColumnNum - 1) + "^"], ["", subLines[subLineIndex + 1]]]));
  }
  return locationStr + printPrefixedLines([
    // Lines specified like this: ["prefix", "string"],
    ["".concat(lineNum - 1), lines[lineIndex - 1]],
    ["".concat(lineNum), locationLine],
    ["", whitespace(columnNum - 1) + "^"],
    ["".concat(lineNum + 1), lines[lineIndex + 1]]
  ]);
}
function printPrefixedLines(lines) {
  var existingLines = lines.filter(function(_ref) {
    var _2 = _ref[0], line = _ref[1];
    return line !== void 0;
  });
  var padLen = Math.max.apply(Math, existingLines.map(function(_ref2) {
    var prefix = _ref2[0];
    return prefix.length;
  }));
  return existingLines.map(function(_ref3) {
    var prefix = _ref3[0], line = _ref3[1];
    return leftPad(padLen, prefix) + (line ? " | " + line : " |");
  }).join("\n");
}
function whitespace(len) {
  return Array(len + 1).join(" ");
}
function leftPad(len, str) {
  return whitespace(len - str.length) + str;
}

// node_modules/graphql/error/GraphQLError.mjs
function _typeof2(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof2 = function _typeof6(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof2 = function _typeof6(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof2(obj);
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _classCallCheck(instance2, Constructor) {
  if (!(instance2 instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self2, call) {
  if (call && (_typeof2(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self2);
}
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
  _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
    if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
    if (typeof Class2 !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class2)) return _cache.get(Class2);
      _cache.set(Class2, Wrapper);
    }
    function Wrapper() {
      return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
    return _setPrototypeOf(Wrapper, Class2);
  };
  return _wrapNativeSuper(Class);
}
function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct2(Parent2, args2, Class2) {
      var a2 = [null];
      a2.push.apply(a2, args2);
      var Constructor = Function.bind.apply(Parent2, a2);
      var instance2 = new Constructor();
      if (Class2) _setPrototypeOf(instance2, Class2.prototype);
      return instance2;
    };
  }
  return _construct.apply(null, arguments);
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _isNativeFunction(fn2) {
  return Function.toString.call(fn2).indexOf("[native code]") !== -1;
}
function _setPrototypeOf(o2, p2) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o3, p3) {
    o3.__proto__ = p3;
    return o3;
  };
  return _setPrototypeOf(o2, p2);
}
function _getPrototypeOf(o2) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf2(o3) {
    return o3.__proto__ || Object.getPrototypeOf(o3);
  };
  return _getPrototypeOf(o2);
}
var GraphQLError = function(_Error) {
  _inherits(GraphQLError2, _Error);
  var _super = _createSuper(GraphQLError2);
  function GraphQLError2(message, nodes, source, positions, path, originalError, extensions) {
    var _nodeLocations, _nodeLocations2, _nodeLocations3;
    var _this;
    _classCallCheck(this, GraphQLError2);
    _this = _super.call(this, message);
    _this.name = "GraphQLError";
    _this.originalError = originalError !== null && originalError !== void 0 ? originalError : void 0;
    _this.nodes = undefinedIfEmpty(Array.isArray(nodes) ? nodes : nodes ? [nodes] : void 0);
    var nodeLocations = [];
    for (var _i2 = 0, _ref3 = (_this$nodes = _this.nodes) !== null && _this$nodes !== void 0 ? _this$nodes : []; _i2 < _ref3.length; _i2++) {
      var _this$nodes;
      var _ref4 = _ref3[_i2];
      var loc = _ref4.loc;
      if (loc != null) {
        nodeLocations.push(loc);
      }
    }
    nodeLocations = undefinedIfEmpty(nodeLocations);
    _this.source = source !== null && source !== void 0 ? source : (_nodeLocations = nodeLocations) === null || _nodeLocations === void 0 ? void 0 : _nodeLocations[0].source;
    _this.positions = positions !== null && positions !== void 0 ? positions : (_nodeLocations2 = nodeLocations) === null || _nodeLocations2 === void 0 ? void 0 : _nodeLocations2.map(function(loc2) {
      return loc2.start;
    });
    _this.locations = positions && source ? positions.map(function(pos) {
      return getLocation(source, pos);
    }) : (_nodeLocations3 = nodeLocations) === null || _nodeLocations3 === void 0 ? void 0 : _nodeLocations3.map(function(loc2) {
      return getLocation(loc2.source, loc2.start);
    });
    _this.path = path !== null && path !== void 0 ? path : void 0;
    var originalExtensions = originalError === null || originalError === void 0 ? void 0 : originalError.extensions;
    if (extensions == null && isObjectLike(originalExtensions)) {
      _this.extensions = _objectSpread({}, originalExtensions);
    } else {
      _this.extensions = extensions !== null && extensions !== void 0 ? extensions : {};
    }
    Object.defineProperties(_assertThisInitialized(_this), {
      message: {
        enumerable: true
      },
      locations: {
        enumerable: _this.locations != null
      },
      path: {
        enumerable: _this.path != null
      },
      extensions: {
        enumerable: _this.extensions != null && Object.keys(_this.extensions).length > 0
      },
      name: {
        enumerable: false
      },
      nodes: {
        enumerable: false
      },
      source: {
        enumerable: false
      },
      positions: {
        enumerable: false
      },
      originalError: {
        enumerable: false
      }
    });
    if (originalError !== null && originalError !== void 0 && originalError.stack) {
      Object.defineProperty(_assertThisInitialized(_this), "stack", {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
      return _possibleConstructorReturn(_this);
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_this), GraphQLError2);
    } else {
      Object.defineProperty(_assertThisInitialized(_this), "stack", {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
    return _this;
  }
  _createClass(GraphQLError2, [{
    key: "toString",
    value: function toString3() {
      return printError(this);
    }
    // FIXME: workaround to not break chai comparisons, should be remove in v16
    // $FlowFixMe[unsupported-syntax] Flow doesn't support computed properties yet
  }, {
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "Object";
    }
  }]);
  return GraphQLError2;
}(_wrapNativeSuper(Error));
function undefinedIfEmpty(array) {
  return array === void 0 || array.length === 0 ? void 0 : array;
}
function printError(error) {
  var output = error.message;
  if (error.nodes) {
    for (var _i4 = 0, _error$nodes2 = error.nodes; _i4 < _error$nodes2.length; _i4++) {
      var node = _error$nodes2[_i4];
      if (node.loc) {
        output += "\n\n" + printLocation(node.loc);
      }
    }
  } else if (error.source && error.locations) {
    for (var _i6 = 0, _error$locations2 = error.locations; _i6 < _error$locations2.length; _i6++) {
      var location = _error$locations2[_i6];
      output += "\n\n" + printSourceLocation(error.source, location);
    }
  }
  return output;
}

// node_modules/graphql/error/syntaxError.mjs
function syntaxError(source, position, description) {
  return new GraphQLError("Syntax Error: ".concat(description), void 0, source, [position]);
}

// node_modules/graphql/language/kinds.mjs
var Kind = Object.freeze({
  // Name
  NAME: "Name",
  // Document
  DOCUMENT: "Document",
  OPERATION_DEFINITION: "OperationDefinition",
  VARIABLE_DEFINITION: "VariableDefinition",
  SELECTION_SET: "SelectionSet",
  FIELD: "Field",
  ARGUMENT: "Argument",
  // Fragments
  FRAGMENT_SPREAD: "FragmentSpread",
  INLINE_FRAGMENT: "InlineFragment",
  FRAGMENT_DEFINITION: "FragmentDefinition",
  // Values
  VARIABLE: "Variable",
  INT: "IntValue",
  FLOAT: "FloatValue",
  STRING: "StringValue",
  BOOLEAN: "BooleanValue",
  NULL: "NullValue",
  ENUM: "EnumValue",
  LIST: "ListValue",
  OBJECT: "ObjectValue",
  OBJECT_FIELD: "ObjectField",
  // Directives
  DIRECTIVE: "Directive",
  // Types
  NAMED_TYPE: "NamedType",
  LIST_TYPE: "ListType",
  NON_NULL_TYPE: "NonNullType",
  // Type System Definitions
  SCHEMA_DEFINITION: "SchemaDefinition",
  OPERATION_TYPE_DEFINITION: "OperationTypeDefinition",
  // Type Definitions
  SCALAR_TYPE_DEFINITION: "ScalarTypeDefinition",
  OBJECT_TYPE_DEFINITION: "ObjectTypeDefinition",
  FIELD_DEFINITION: "FieldDefinition",
  INPUT_VALUE_DEFINITION: "InputValueDefinition",
  INTERFACE_TYPE_DEFINITION: "InterfaceTypeDefinition",
  UNION_TYPE_DEFINITION: "UnionTypeDefinition",
  ENUM_TYPE_DEFINITION: "EnumTypeDefinition",
  ENUM_VALUE_DEFINITION: "EnumValueDefinition",
  INPUT_OBJECT_TYPE_DEFINITION: "InputObjectTypeDefinition",
  // Directive Definitions
  DIRECTIVE_DEFINITION: "DirectiveDefinition",
  // Type System Extensions
  SCHEMA_EXTENSION: "SchemaExtension",
  // Type Extensions
  SCALAR_TYPE_EXTENSION: "ScalarTypeExtension",
  OBJECT_TYPE_EXTENSION: "ObjectTypeExtension",
  INTERFACE_TYPE_EXTENSION: "InterfaceTypeExtension",
  UNION_TYPE_EXTENSION: "UnionTypeExtension",
  ENUM_TYPE_EXTENSION: "EnumTypeExtension",
  INPUT_OBJECT_TYPE_EXTENSION: "InputObjectTypeExtension"
});

// node_modules/graphql/jsutils/invariant.mjs
function invariant(condition, message) {
  var booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message != null ? message : "Unexpected invariant triggered.");
  }
}

// node_modules/graphql/jsutils/nodejsCustomInspectSymbol.mjs
var nodejsCustomInspectSymbol = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : void 0;
var nodejsCustomInspectSymbol_default = nodejsCustomInspectSymbol;

// node_modules/graphql/jsutils/defineInspect.mjs
function defineInspect(classObject) {
  var fn2 = classObject.prototype.toJSON;
  typeof fn2 === "function" || invariant(0);
  classObject.prototype.inspect = fn2;
  if (nodejsCustomInspectSymbol_default) {
    classObject.prototype[nodejsCustomInspectSymbol_default] = fn2;
  }
}

// node_modules/graphql/language/ast.mjs
var Location = function() {
  function Location2(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }
  var _proto = Location2.prototype;
  _proto.toJSON = function toJSON3() {
    return {
      start: this.start,
      end: this.end
    };
  };
  return Location2;
}();
defineInspect(Location);
var Token = function() {
  function Token2(kind, start, end, line, column, prev, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = prev;
    this.next = null;
  }
  var _proto2 = Token2.prototype;
  _proto2.toJSON = function toJSON3() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  };
  return Token2;
}();
defineInspect(Token);
function isNode(maybeNode) {
  return maybeNode != null && typeof maybeNode.kind === "string";
}

// node_modules/graphql/language/tokenKind.mjs
var TokenKind = Object.freeze({
  SOF: "<SOF>",
  EOF: "<EOF>",
  BANG: "!",
  DOLLAR: "$",
  AMP: "&",
  PAREN_L: "(",
  PAREN_R: ")",
  SPREAD: "...",
  COLON: ":",
  EQUALS: "=",
  AT: "@",
  BRACKET_L: "[",
  BRACKET_R: "]",
  BRACE_L: "{",
  PIPE: "|",
  BRACE_R: "}",
  NAME: "Name",
  INT: "Int",
  FLOAT: "Float",
  STRING: "String",
  BLOCK_STRING: "BlockString",
  COMMENT: "Comment"
});

// node_modules/graphql/jsutils/inspect.mjs
function _typeof3(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof3 = function _typeof6(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof3 = function _typeof6(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof3(obj);
}
var MAX_ARRAY_LENGTH = 10;
var MAX_RECURSIVE_DEPTH = 2;
function inspect(value) {
  return formatValue(value, []);
}
function formatValue(value, seenValues) {
  switch (_typeof3(value)) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name ? "[function ".concat(value.name, "]") : "[function]";
    case "object":
      if (value === null) {
        return "null";
      }
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}
function formatObjectValue(value, previouslySeenValues) {
  if (previouslySeenValues.indexOf(value) !== -1) {
    return "[Circular]";
  }
  var seenValues = [].concat(previouslySeenValues, [value]);
  var customInspectFn = getCustomFn(value);
  if (customInspectFn !== void 0) {
    var customValue = customInspectFn.call(value);
    if (customValue !== value) {
      return typeof customValue === "string" ? customValue : formatValue(customValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }
  return formatObject(value, seenValues);
}
function formatObject(object, seenValues) {
  var keys = Object.keys(object);
  if (keys.length === 0) {
    return "{}";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }
  var properties = keys.map(function(key) {
    var value = formatValue(object[key], seenValues);
    return key + ": " + value;
  });
  return "{ " + properties.join(", ") + " }";
}
function formatArray(array, seenValues) {
  if (array.length === 0) {
    return "[]";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }
  var len = Math.min(MAX_ARRAY_LENGTH, array.length);
  var remaining = array.length - len;
  var items = [];
  for (var i2 = 0; i2 < len; ++i2) {
    items.push(formatValue(array[i2], seenValues));
  }
  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push("... ".concat(remaining, " more items"));
  }
  return "[" + items.join(", ") + "]";
}
function getCustomFn(object) {
  var customInspectFn = object[String(nodejsCustomInspectSymbol_default)];
  if (typeof customInspectFn === "function") {
    return customInspectFn;
  }
  if (typeof object.inspect === "function") {
    return object.inspect;
  }
}
function getObjectTag(object) {
  var tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
  if (tag === "Object" && typeof object.constructor === "function") {
    var name = object.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }
  return tag;
}

// node_modules/graphql/jsutils/devAssert.mjs
function devAssert(condition, message) {
  var booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message);
  }
}

// node_modules/graphql/jsutils/instanceOf.mjs
function _typeof4(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof4 = function _typeof6(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof4 = function _typeof6(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof4(obj);
}
var instanceOf_default = false ? (
  // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2317')
  // eslint-disable-next-line no-shadow
  function instanceOf(value, constructor) {
    return value instanceof constructor;
  }
) : (
  // eslint-disable-next-line no-shadow
  function instanceOf2(value, constructor) {
    if (value instanceof constructor) {
      return true;
    }
    if (_typeof4(value) === "object" && value !== null) {
      var _value$constructor;
      var className = constructor.prototype[Symbol.toStringTag];
      var valueClassName = (
        // We still need to support constructor's name to detect conflicts with older versions of this library.
        Symbol.toStringTag in value ? value[Symbol.toStringTag] : (_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor.name
      );
      if (className === valueClassName) {
        var stringifiedValue = inspect(value);
        throw new Error("Cannot use ".concat(className, ' "').concat(stringifiedValue, '" from another module or realm.\n\nEnsure that there is only one instance of "graphql" in the node_modules\ndirectory. If different versions of "graphql" are the dependencies of other\nrelied on modules, use "resolutions" to ensure only one version is installed.\n\nhttps://yarnpkg.com/en/docs/selective-version-resolutions\n\nDuplicate "graphql" modules cannot be used at the same time since different\nversions may have different capabilities and behavior. The data from one\nversion used in the function from another could produce confusing and\nspurious results.'));
      }
    }
    return false;
  }
);

// node_modules/graphql/language/source.mjs
function _defineProperties2(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties2(Constructor, staticProps);
  return Constructor;
}
var Source = function() {
  function Source2(body) {
    var name = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "GraphQL request";
    var locationOffset = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
      line: 1,
      column: 1
    };
    typeof body === "string" || devAssert(0, "Body must be a string. Received: ".concat(inspect(body), "."));
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.locationOffset.line > 0 || devAssert(0, "line in locationOffset is 1-indexed and must be positive.");
    this.locationOffset.column > 0 || devAssert(0, "column in locationOffset is 1-indexed and must be positive.");
  }
  _createClass2(Source2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "Source";
    }
  }]);
  return Source2;
}();
function isSource(source) {
  return instanceOf_default(source, Source);
}

// node_modules/graphql/language/directiveLocation.mjs
var DirectiveLocation = Object.freeze({
  // Request Definitions
  QUERY: "QUERY",
  MUTATION: "MUTATION",
  SUBSCRIPTION: "SUBSCRIPTION",
  FIELD: "FIELD",
  FRAGMENT_DEFINITION: "FRAGMENT_DEFINITION",
  FRAGMENT_SPREAD: "FRAGMENT_SPREAD",
  INLINE_FRAGMENT: "INLINE_FRAGMENT",
  VARIABLE_DEFINITION: "VARIABLE_DEFINITION",
  // Type System Definitions
  SCHEMA: "SCHEMA",
  SCALAR: "SCALAR",
  OBJECT: "OBJECT",
  FIELD_DEFINITION: "FIELD_DEFINITION",
  ARGUMENT_DEFINITION: "ARGUMENT_DEFINITION",
  INTERFACE: "INTERFACE",
  UNION: "UNION",
  ENUM: "ENUM",
  ENUM_VALUE: "ENUM_VALUE",
  INPUT_OBJECT: "INPUT_OBJECT",
  INPUT_FIELD_DEFINITION: "INPUT_FIELD_DEFINITION"
});

// node_modules/graphql/language/blockString.mjs
function dedentBlockStringValue(rawString) {
  var lines = rawString.split(/\r\n|[\n\r]/g);
  var commonIndent = getBlockStringIndentation(rawString);
  if (commonIndent !== 0) {
    for (var i2 = 1; i2 < lines.length; i2++) {
      lines[i2] = lines[i2].slice(commonIndent);
    }
  }
  var startLine = 0;
  while (startLine < lines.length && isBlank(lines[startLine])) {
    ++startLine;
  }
  var endLine = lines.length;
  while (endLine > startLine && isBlank(lines[endLine - 1])) {
    --endLine;
  }
  return lines.slice(startLine, endLine).join("\n");
}
function isBlank(str) {
  for (var i2 = 0; i2 < str.length; ++i2) {
    if (str[i2] !== " " && str[i2] !== "	") {
      return false;
    }
  }
  return true;
}
function getBlockStringIndentation(value) {
  var _commonIndent;
  var isFirstLine = true;
  var isEmptyLine = true;
  var indent2 = 0;
  var commonIndent = null;
  for (var i2 = 0; i2 < value.length; ++i2) {
    switch (value.charCodeAt(i2)) {
      case 13:
        if (value.charCodeAt(i2 + 1) === 10) {
          ++i2;
        }
      case 10:
        isFirstLine = false;
        isEmptyLine = true;
        indent2 = 0;
        break;
      case 9:
      case 32:
        ++indent2;
        break;
      default:
        if (isEmptyLine && !isFirstLine && (commonIndent === null || indent2 < commonIndent)) {
          commonIndent = indent2;
        }
        isEmptyLine = false;
    }
  }
  return (_commonIndent = commonIndent) !== null && _commonIndent !== void 0 ? _commonIndent : 0;
}
function printBlockString(value) {
  var indentation = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  var preferMultipleLines = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  var isSingleLine = value.indexOf("\n") === -1;
  var hasLeadingSpace = value[0] === " " || value[0] === "	";
  var hasTrailingQuote = value[value.length - 1] === '"';
  var hasTrailingSlash = value[value.length - 1] === "\\";
  var printAsMultipleLines = !isSingleLine || hasTrailingQuote || hasTrailingSlash || preferMultipleLines;
  var result = "";
  if (printAsMultipleLines && !(isSingleLine && hasLeadingSpace)) {
    result += "\n" + indentation;
  }
  result += indentation ? value.replace(/\n/g, "\n" + indentation) : value;
  if (printAsMultipleLines) {
    result += "\n";
  }
  return '"""' + result.replace(/"""/g, '\\"""') + '"""';
}

// node_modules/graphql/language/lexer.mjs
var Lexer = function() {
  function Lexer2(source) {
    var startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);
    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }
  var _proto = Lexer2.prototype;
  _proto.advance = function advance() {
    this.lastToken = this.token;
    var token = this.token = this.lookahead();
    return token;
  };
  _proto.lookahead = function lookahead() {
    var token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        var _token$next;
        token = (_token$next = token.next) !== null && _token$next !== void 0 ? _token$next : token.next = readToken(this, token);
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  };
  return Lexer2;
}();
function isPunctuatorTokenKind(kind) {
  return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
}
function printCharCode(code) {
  return (
    // NaN/undefined represents access beyond the end of the file.
    isNaN(code) ? TokenKind.EOF : (
      // Trust JSON for ASCII.
      code < 127 ? JSON.stringify(String.fromCharCode(code)) : (
        // Otherwise print the escaped form.
        '"\\u'.concat(("00" + code.toString(16).toUpperCase()).slice(-4), '"')
      )
    )
  );
}
function readToken(lexer, prev) {
  var source = lexer.source;
  var body = source.body;
  var bodyLength = body.length;
  var pos = prev.end;
  while (pos < bodyLength) {
    var code = body.charCodeAt(pos);
    var _line = lexer.line;
    var _col = 1 + pos - lexer.lineStart;
    switch (code) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++pos;
        continue;
      case 10:
        ++pos;
        ++lexer.line;
        lexer.lineStart = pos;
        continue;
      case 13:
        if (body.charCodeAt(pos + 1) === 10) {
          pos += 2;
        } else {
          ++pos;
        }
        ++lexer.line;
        lexer.lineStart = pos;
        continue;
      case 33:
        return new Token(TokenKind.BANG, pos, pos + 1, _line, _col, prev);
      case 35:
        return readComment(source, pos, _line, _col, prev);
      case 36:
        return new Token(TokenKind.DOLLAR, pos, pos + 1, _line, _col, prev);
      case 38:
        return new Token(TokenKind.AMP, pos, pos + 1, _line, _col, prev);
      case 40:
        return new Token(TokenKind.PAREN_L, pos, pos + 1, _line, _col, prev);
      case 41:
        return new Token(TokenKind.PAREN_R, pos, pos + 1, _line, _col, prev);
      case 46:
        if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
          return new Token(TokenKind.SPREAD, pos, pos + 3, _line, _col, prev);
        }
        break;
      case 58:
        return new Token(TokenKind.COLON, pos, pos + 1, _line, _col, prev);
      case 61:
        return new Token(TokenKind.EQUALS, pos, pos + 1, _line, _col, prev);
      case 64:
        return new Token(TokenKind.AT, pos, pos + 1, _line, _col, prev);
      case 91:
        return new Token(TokenKind.BRACKET_L, pos, pos + 1, _line, _col, prev);
      case 93:
        return new Token(TokenKind.BRACKET_R, pos, pos + 1, _line, _col, prev);
      case 123:
        return new Token(TokenKind.BRACE_L, pos, pos + 1, _line, _col, prev);
      case 124:
        return new Token(TokenKind.PIPE, pos, pos + 1, _line, _col, prev);
      case 125:
        return new Token(TokenKind.BRACE_R, pos, pos + 1, _line, _col, prev);
      case 34:
        if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
          return readBlockString(source, pos, _line, _col, prev, lexer);
        }
        return readString(source, pos, _line, _col, prev);
      case 45:
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return readNumber(source, pos, code, _line, _col, prev);
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
      case 71:
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 78:
      case 79:
      case 80:
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87:
      case 88:
      case 89:
      case 90:
      case 95:
      case 97:
      case 98:
      case 99:
      case 100:
      case 101:
      case 102:
      case 103:
      case 104:
      case 105:
      case 106:
      case 107:
      case 108:
      case 109:
      case 110:
      case 111:
      case 112:
      case 113:
      case 114:
      case 115:
      case 116:
      case 117:
      case 118:
      case 119:
      case 120:
      case 121:
      case 122:
        return readName(source, pos, _line, _col, prev);
    }
    throw syntaxError(source, pos, unexpectedCharacterMessage(code));
  }
  var line = lexer.line;
  var col = 1 + pos - lexer.lineStart;
  return new Token(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
}
function unexpectedCharacterMessage(code) {
  if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
    return "Cannot contain the invalid character ".concat(printCharCode(code), ".");
  }
  if (code === 39) {
    return `Unexpected single quote character ('), did you mean to use a double quote (")?`;
  }
  return "Cannot parse the unexpected character ".concat(printCharCode(code), ".");
}
function readComment(source, start, line, col, prev) {
  var body = source.body;
  var code;
  var position = start;
  do {
    code = body.charCodeAt(++position);
  } while (!isNaN(code) && // SourceCharacter but not LineTerminator
  (code > 31 || code === 9));
  return new Token(TokenKind.COMMENT, start, position, line, col, prev, body.slice(start + 1, position));
}
function readNumber(source, start, firstCode, line, col, prev) {
  var body = source.body;
  var code = firstCode;
  var position = start;
  var isFloat = false;
  if (code === 45) {
    code = body.charCodeAt(++position);
  }
  if (code === 48) {
    code = body.charCodeAt(++position);
    if (code >= 48 && code <= 57) {
      throw syntaxError(source, position, "Invalid number, unexpected digit after 0: ".concat(printCharCode(code), "."));
    }
  } else {
    position = readDigits(source, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46) {
    isFloat = true;
    code = body.charCodeAt(++position);
    position = readDigits(source, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 69 || code === 101) {
    isFloat = true;
    code = body.charCodeAt(++position);
    if (code === 43 || code === 45) {
      code = body.charCodeAt(++position);
    }
    position = readDigits(source, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46 || isNameStart(code)) {
    throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
  }
  return new Token(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, body.slice(start, position));
}
function readDigits(source, start, firstCode) {
  var body = source.body;
  var position = start;
  var code = firstCode;
  if (code >= 48 && code <= 57) {
    do {
      code = body.charCodeAt(++position);
    } while (code >= 48 && code <= 57);
    return position;
  }
  throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
}
function readString(source, start, line, col, prev) {
  var body = source.body;
  var position = start + 1;
  var chunkStart = position;
  var code = 0;
  var value = "";
  while (position < body.length && !isNaN(code = body.charCodeAt(position)) && // not LineTerminator
  code !== 10 && code !== 13) {
    if (code === 34) {
      value += body.slice(chunkStart, position);
      return new Token(TokenKind.STRING, start, position + 1, line, col, prev, value);
    }
    if (code < 32 && code !== 9) {
      throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
    }
    ++position;
    if (code === 92) {
      value += body.slice(chunkStart, position - 1);
      code = body.charCodeAt(position);
      switch (code) {
        case 34:
          value += '"';
          break;
        case 47:
          value += "/";
          break;
        case 92:
          value += "\\";
          break;
        case 98:
          value += "\b";
          break;
        case 102:
          value += "\f";
          break;
        case 110:
          value += "\n";
          break;
        case 114:
          value += "\r";
          break;
        case 116:
          value += "	";
          break;
        case 117: {
          var charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));
          if (charCode < 0) {
            var invalidSequence = body.slice(position + 1, position + 5);
            throw syntaxError(source, position, "Invalid character escape sequence: \\u".concat(invalidSequence, "."));
          }
          value += String.fromCharCode(charCode);
          position += 4;
          break;
        }
        default:
          throw syntaxError(source, position, "Invalid character escape sequence: \\".concat(String.fromCharCode(code), "."));
      }
      ++position;
      chunkStart = position;
    }
  }
  throw syntaxError(source, position, "Unterminated string.");
}
function readBlockString(source, start, line, col, prev, lexer) {
  var body = source.body;
  var position = start + 3;
  var chunkStart = position;
  var code = 0;
  var rawValue = "";
  while (position < body.length && !isNaN(code = body.charCodeAt(position))) {
    if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
      rawValue += body.slice(chunkStart, position);
      return new Token(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, dedentBlockStringValue(rawValue));
    }
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
    }
    if (code === 10) {
      ++position;
      ++lexer.line;
      lexer.lineStart = position;
    } else if (code === 13) {
      if (body.charCodeAt(position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      ++lexer.line;
      lexer.lineStart = position;
    } else if (
      // Escape Triple-Quote (\""")
      code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34
    ) {
      rawValue += body.slice(chunkStart, position) + '"""';
      position += 4;
      chunkStart = position;
    } else {
      ++position;
    }
  }
  throw syntaxError(source, position, "Unterminated string.");
}
function uniCharCode(a2, b2, c2, d2) {
  return char2hex(a2) << 12 | char2hex(b2) << 8 | char2hex(c2) << 4 | char2hex(d2);
}
function char2hex(a2) {
  return a2 >= 48 && a2 <= 57 ? a2 - 48 : a2 >= 65 && a2 <= 70 ? a2 - 55 : a2 >= 97 && a2 <= 102 ? a2 - 87 : -1;
}
function readName(source, start, line, col, prev) {
  var body = source.body;
  var bodyLength = body.length;
  var position = start + 1;
  var code = 0;
  while (position !== bodyLength && !isNaN(code = body.charCodeAt(position)) && (code === 95 || // _
  code >= 48 && code <= 57 || // 0-9
  code >= 65 && code <= 90 || // A-Z
  code >= 97 && code <= 122)) {
    ++position;
  }
  return new Token(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
}
function isNameStart(code) {
  return code === 95 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
}

// node_modules/graphql/language/parser.mjs
function parse(source, options) {
  var parser = new Parser(source, options);
  return parser.parseDocument();
}
var Parser = function() {
  function Parser2(source, options) {
    var sourceObj = isSource(source) ? source : new Source(source);
    this._lexer = new Lexer(sourceObj);
    this._options = options;
  }
  var _proto = Parser2.prototype;
  _proto.parseName = function parseName() {
    var token = this.expectToken(TokenKind.NAME);
    return {
      kind: Kind.NAME,
      value: token.value,
      loc: this.loc(token)
    };
  };
  _proto.parseDocument = function parseDocument() {
    var start = this._lexer.token;
    return {
      kind: Kind.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
      loc: this.loc(start)
    };
  };
  _proto.parseDefinition = function parseDefinition() {
    if (this.peek(TokenKind.NAME)) {
      switch (this._lexer.token.value) {
        case "query":
        case "mutation":
        case "subscription":
          return this.parseOperationDefinition();
        case "fragment":
          return this.parseFragmentDefinition();
        case "schema":
        case "scalar":
        case "type":
        case "interface":
        case "union":
        case "enum":
        case "input":
        case "directive":
          return this.parseTypeSystemDefinition();
        case "extend":
          return this.parseTypeSystemExtension();
      }
    } else if (this.peek(TokenKind.BRACE_L)) {
      return this.parseOperationDefinition();
    } else if (this.peekDescription()) {
      return this.parseTypeSystemDefinition();
    }
    throw this.unexpected();
  };
  _proto.parseOperationDefinition = function parseOperationDefinition() {
    var start = this._lexer.token;
    if (this.peek(TokenKind.BRACE_L)) {
      return {
        kind: Kind.OPERATION_DEFINITION,
        operation: "query",
        name: void 0,
        variableDefinitions: [],
        directives: [],
        selectionSet: this.parseSelectionSet(),
        loc: this.loc(start)
      };
    }
    var operation = this.parseOperationType();
    var name;
    if (this.peek(TokenKind.NAME)) {
      name = this.parseName();
    }
    return {
      kind: Kind.OPERATION_DEFINITION,
      operation,
      name,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet(),
      loc: this.loc(start)
    };
  };
  _proto.parseOperationType = function parseOperationType() {
    var operationToken = this.expectToken(TokenKind.NAME);
    switch (operationToken.value) {
      case "query":
        return "query";
      case "mutation":
        return "mutation";
      case "subscription":
        return "subscription";
    }
    throw this.unexpected(operationToken);
  };
  _proto.parseVariableDefinitions = function parseVariableDefinitions() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
  };
  _proto.parseVariableDefinition = function parseVariableDefinition() {
    var start = this._lexer.token;
    return {
      kind: Kind.VARIABLE_DEFINITION,
      variable: this.parseVariable(),
      type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseValueLiteral(true) : void 0,
      directives: this.parseDirectives(true),
      loc: this.loc(start)
    };
  };
  _proto.parseVariable = function parseVariable() {
    var start = this._lexer.token;
    this.expectToken(TokenKind.DOLLAR);
    return {
      kind: Kind.VARIABLE,
      name: this.parseName(),
      loc: this.loc(start)
    };
  };
  _proto.parseSelectionSet = function parseSelectionSet() {
    var start = this._lexer.token;
    return {
      kind: Kind.SELECTION_SET,
      selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
      loc: this.loc(start)
    };
  };
  _proto.parseSelection = function parseSelection() {
    return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
  };
  _proto.parseField = function parseField() {
    var start = this._lexer.token;
    var nameOrAlias = this.parseName();
    var alias;
    var name;
    if (this.expectOptionalToken(TokenKind.COLON)) {
      alias = nameOrAlias;
      name = this.parseName();
    } else {
      name = nameOrAlias;
    }
    return {
      kind: Kind.FIELD,
      alias,
      name,
      arguments: this.parseArguments(false),
      directives: this.parseDirectives(false),
      selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : void 0,
      loc: this.loc(start)
    };
  };
  _proto.parseArguments = function parseArguments(isConst) {
    var item = isConst ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  };
  _proto.parseArgument = function parseArgument() {
    var start = this._lexer.token;
    var name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return {
      kind: Kind.ARGUMENT,
      name,
      value: this.parseValueLiteral(false),
      loc: this.loc(start)
    };
  };
  _proto.parseConstArgument = function parseConstArgument() {
    var start = this._lexer.token;
    return {
      kind: Kind.ARGUMENT,
      name: this.parseName(),
      value: (this.expectToken(TokenKind.COLON), this.parseValueLiteral(true)),
      loc: this.loc(start)
    };
  };
  _proto.parseFragment = function parseFragment() {
    var start = this._lexer.token;
    this.expectToken(TokenKind.SPREAD);
    var hasTypeCondition = this.expectOptionalKeyword("on");
    if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
      return {
        kind: Kind.FRAGMENT_SPREAD,
        name: this.parseFragmentName(),
        directives: this.parseDirectives(false),
        loc: this.loc(start)
      };
    }
    return {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? this.parseNamedType() : void 0,
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet(),
      loc: this.loc(start)
    };
  };
  _proto.parseFragmentDefinition = function parseFragmentDefinition() {
    var _this$_options;
    var start = this._lexer.token;
    this.expectKeyword("fragment");
    if (((_this$_options = this._options) === null || _this$_options === void 0 ? void 0 : _this$_options.experimentalFragmentVariables) === true) {
      return {
        kind: Kind.FRAGMENT_DEFINITION,
        name: this.parseFragmentName(),
        variableDefinitions: this.parseVariableDefinitions(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet(),
        loc: this.loc(start)
      };
    }
    return {
      kind: Kind.FRAGMENT_DEFINITION,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet(),
      loc: this.loc(start)
    };
  };
  _proto.parseFragmentName = function parseFragmentName() {
    if (this._lexer.token.value === "on") {
      throw this.unexpected();
    }
    return this.parseName();
  };
  _proto.parseValueLiteral = function parseValueLiteral(isConst) {
    var token = this._lexer.token;
    switch (token.kind) {
      case TokenKind.BRACKET_L:
        return this.parseList(isConst);
      case TokenKind.BRACE_L:
        return this.parseObject(isConst);
      case TokenKind.INT:
        this._lexer.advance();
        return {
          kind: Kind.INT,
          value: token.value,
          loc: this.loc(token)
        };
      case TokenKind.FLOAT:
        this._lexer.advance();
        return {
          kind: Kind.FLOAT,
          value: token.value,
          loc: this.loc(token)
        };
      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return this.parseStringLiteral();
      case TokenKind.NAME:
        this._lexer.advance();
        switch (token.value) {
          case "true":
            return {
              kind: Kind.BOOLEAN,
              value: true,
              loc: this.loc(token)
            };
          case "false":
            return {
              kind: Kind.BOOLEAN,
              value: false,
              loc: this.loc(token)
            };
          case "null":
            return {
              kind: Kind.NULL,
              loc: this.loc(token)
            };
          default:
            return {
              kind: Kind.ENUM,
              value: token.value,
              loc: this.loc(token)
            };
        }
      case TokenKind.DOLLAR:
        if (!isConst) {
          return this.parseVariable();
        }
        break;
    }
    throw this.unexpected();
  };
  _proto.parseStringLiteral = function parseStringLiteral() {
    var token = this._lexer.token;
    this._lexer.advance();
    return {
      kind: Kind.STRING,
      value: token.value,
      block: token.kind === TokenKind.BLOCK_STRING,
      loc: this.loc(token)
    };
  };
  _proto.parseList = function parseList(isConst) {
    var _this = this;
    var start = this._lexer.token;
    var item = function item2() {
      return _this.parseValueLiteral(isConst);
    };
    return {
      kind: Kind.LIST,
      values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
      loc: this.loc(start)
    };
  };
  _proto.parseObject = function parseObject(isConst) {
    var _this2 = this;
    var start = this._lexer.token;
    var item = function item2() {
      return _this2.parseObjectField(isConst);
    };
    return {
      kind: Kind.OBJECT,
      fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
      loc: this.loc(start)
    };
  };
  _proto.parseObjectField = function parseObjectField(isConst) {
    var start = this._lexer.token;
    var name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return {
      kind: Kind.OBJECT_FIELD,
      name,
      value: this.parseValueLiteral(isConst),
      loc: this.loc(start)
    };
  };
  _proto.parseDirectives = function parseDirectives(isConst) {
    var directives = [];
    while (this.peek(TokenKind.AT)) {
      directives.push(this.parseDirective(isConst));
    }
    return directives;
  };
  _proto.parseDirective = function parseDirective(isConst) {
    var start = this._lexer.token;
    this.expectToken(TokenKind.AT);
    return {
      kind: Kind.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(isConst),
      loc: this.loc(start)
    };
  };
  _proto.parseTypeReference = function parseTypeReference() {
    var start = this._lexer.token;
    var type;
    if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
      type = this.parseTypeReference();
      this.expectToken(TokenKind.BRACKET_R);
      type = {
        kind: Kind.LIST_TYPE,
        type,
        loc: this.loc(start)
      };
    } else {
      type = this.parseNamedType();
    }
    if (this.expectOptionalToken(TokenKind.BANG)) {
      return {
        kind: Kind.NON_NULL_TYPE,
        type,
        loc: this.loc(start)
      };
    }
    return type;
  };
  _proto.parseNamedType = function parseNamedType() {
    var start = this._lexer.token;
    return {
      kind: Kind.NAMED_TYPE,
      name: this.parseName(),
      loc: this.loc(start)
    };
  };
  _proto.parseTypeSystemDefinition = function parseTypeSystemDefinition() {
    var keywordToken = this.peekDescription() ? this._lexer.lookahead() : this._lexer.token;
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaDefinition();
        case "scalar":
          return this.parseScalarTypeDefinition();
        case "type":
          return this.parseObjectTypeDefinition();
        case "interface":
          return this.parseInterfaceTypeDefinition();
        case "union":
          return this.parseUnionTypeDefinition();
        case "enum":
          return this.parseEnumTypeDefinition();
        case "input":
          return this.parseInputObjectTypeDefinition();
        case "directive":
          return this.parseDirectiveDefinition();
      }
    }
    throw this.unexpected(keywordToken);
  };
  _proto.peekDescription = function peekDescription() {
    return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
  };
  _proto.parseDescription = function parseDescription() {
    if (this.peekDescription()) {
      return this.parseStringLiteral();
    }
  };
  _proto.parseSchemaDefinition = function parseSchemaDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("schema");
    var directives = this.parseDirectives(true);
    var operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    return {
      kind: Kind.SCHEMA_DEFINITION,
      description,
      directives,
      operationTypes,
      loc: this.loc(start)
    };
  };
  _proto.parseOperationTypeDefinition = function parseOperationTypeDefinition() {
    var start = this._lexer.token;
    var operation = this.parseOperationType();
    this.expectToken(TokenKind.COLON);
    var type = this.parseNamedType();
    return {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation,
      type,
      loc: this.loc(start)
    };
  };
  _proto.parseScalarTypeDefinition = function parseScalarTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("scalar");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    return {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      description,
      name,
      directives,
      loc: this.loc(start)
    };
  };
  _proto.parseObjectTypeDefinition = function parseObjectTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("type");
    var name = this.parseName();
    var interfaces = this.parseImplementsInterfaces();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseFieldsDefinition();
    return {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseImplementsInterfaces = function parseImplementsInterfaces() {
    var _this$_options2;
    if (!this.expectOptionalKeyword("implements")) {
      return [];
    }
    if (((_this$_options2 = this._options) === null || _this$_options2 === void 0 ? void 0 : _this$_options2.allowLegacySDLImplementsInterfaces) === true) {
      var types = [];
      this.expectOptionalToken(TokenKind.AMP);
      do {
        types.push(this.parseNamedType());
      } while (this.expectOptionalToken(TokenKind.AMP) || this.peek(TokenKind.NAME));
      return types;
    }
    return this.delimitedMany(TokenKind.AMP, this.parseNamedType);
  };
  _proto.parseFieldsDefinition = function parseFieldsDefinition() {
    var _this$_options3;
    if (((_this$_options3 = this._options) === null || _this$_options3 === void 0 ? void 0 : _this$_options3.allowLegacySDLEmptyFields) === true && this.peek(TokenKind.BRACE_L) && this._lexer.lookahead().kind === TokenKind.BRACE_R) {
      this._lexer.advance();
      this._lexer.advance();
      return [];
    }
    return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
  };
  _proto.parseFieldDefinition = function parseFieldDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    var name = this.parseName();
    var args = this.parseArgumentDefs();
    this.expectToken(TokenKind.COLON);
    var type = this.parseTypeReference();
    var directives = this.parseDirectives(true);
    return {
      kind: Kind.FIELD_DEFINITION,
      description,
      name,
      arguments: args,
      type,
      directives,
      loc: this.loc(start)
    };
  };
  _proto.parseArgumentDefs = function parseArgumentDefs() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
  };
  _proto.parseInputValueDef = function parseInputValueDef() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    var name = this.parseName();
    this.expectToken(TokenKind.COLON);
    var type = this.parseTypeReference();
    var defaultValue;
    if (this.expectOptionalToken(TokenKind.EQUALS)) {
      defaultValue = this.parseValueLiteral(true);
    }
    var directives = this.parseDirectives(true);
    return {
      kind: Kind.INPUT_VALUE_DEFINITION,
      description,
      name,
      type,
      defaultValue,
      directives,
      loc: this.loc(start)
    };
  };
  _proto.parseInterfaceTypeDefinition = function parseInterfaceTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("interface");
    var name = this.parseName();
    var interfaces = this.parseImplementsInterfaces();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseFieldsDefinition();
    return {
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseUnionTypeDefinition = function parseUnionTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("union");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var types = this.parseUnionMemberTypes();
    return {
      kind: Kind.UNION_TYPE_DEFINITION,
      description,
      name,
      directives,
      types,
      loc: this.loc(start)
    };
  };
  _proto.parseUnionMemberTypes = function parseUnionMemberTypes() {
    return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
  };
  _proto.parseEnumTypeDefinition = function parseEnumTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("enum");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var values = this.parseEnumValuesDefinition();
    return {
      kind: Kind.ENUM_TYPE_DEFINITION,
      description,
      name,
      directives,
      values,
      loc: this.loc(start)
    };
  };
  _proto.parseEnumValuesDefinition = function parseEnumValuesDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
  };
  _proto.parseEnumValueDefinition = function parseEnumValueDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    return {
      kind: Kind.ENUM_VALUE_DEFINITION,
      description,
      name,
      directives,
      loc: this.loc(start)
    };
  };
  _proto.parseInputObjectTypeDefinition = function parseInputObjectTypeDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("input");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseInputFieldsDefinition();
    return {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      description,
      name,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseInputFieldsDefinition = function parseInputFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
  };
  _proto.parseTypeSystemExtension = function parseTypeSystemExtension() {
    var keywordToken = this._lexer.lookahead();
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaExtension();
        case "scalar":
          return this.parseScalarTypeExtension();
        case "type":
          return this.parseObjectTypeExtension();
        case "interface":
          return this.parseInterfaceTypeExtension();
        case "union":
          return this.parseUnionTypeExtension();
        case "enum":
          return this.parseEnumTypeExtension();
        case "input":
          return this.parseInputObjectTypeExtension();
      }
    }
    throw this.unexpected(keywordToken);
  };
  _proto.parseSchemaExtension = function parseSchemaExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("schema");
    var directives = this.parseDirectives(true);
    var operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    if (directives.length === 0 && operationTypes.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.SCHEMA_EXTENSION,
      directives,
      operationTypes,
      loc: this.loc(start)
    };
  };
  _proto.parseScalarTypeExtension = function parseScalarTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("scalar");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    if (directives.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.SCALAR_TYPE_EXTENSION,
      name,
      directives,
      loc: this.loc(start)
    };
  };
  _proto.parseObjectTypeExtension = function parseObjectTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("type");
    var name = this.parseName();
    var interfaces = this.parseImplementsInterfaces();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields7.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseInterfaceTypeExtension = function parseInterfaceTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("interface");
    var name = this.parseName();
    var interfaces = this.parseImplementsInterfaces();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields7.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.INTERFACE_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseUnionTypeExtension = function parseUnionTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("union");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var types = this.parseUnionMemberTypes();
    if (directives.length === 0 && types.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.UNION_TYPE_EXTENSION,
      name,
      directives,
      types,
      loc: this.loc(start)
    };
  };
  _proto.parseEnumTypeExtension = function parseEnumTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("enum");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var values = this.parseEnumValuesDefinition();
    if (directives.length === 0 && values.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.ENUM_TYPE_EXTENSION,
      name,
      directives,
      values,
      loc: this.loc(start)
    };
  };
  _proto.parseInputObjectTypeExtension = function parseInputObjectTypeExtension() {
    var start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("input");
    var name = this.parseName();
    var directives = this.parseDirectives(true);
    var fields7 = this.parseInputFieldsDefinition();
    if (directives.length === 0 && fields7.length === 0) {
      throw this.unexpected();
    }
    return {
      kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
      name,
      directives,
      fields: fields7,
      loc: this.loc(start)
    };
  };
  _proto.parseDirectiveDefinition = function parseDirectiveDefinition() {
    var start = this._lexer.token;
    var description = this.parseDescription();
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    var name = this.parseName();
    var args = this.parseArgumentDefs();
    var repeatable = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    var locations = this.parseDirectiveLocations();
    return {
      kind: Kind.DIRECTIVE_DEFINITION,
      description,
      name,
      arguments: args,
      repeatable,
      locations,
      loc: this.loc(start)
    };
  };
  _proto.parseDirectiveLocations = function parseDirectiveLocations() {
    return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
  };
  _proto.parseDirectiveLocation = function parseDirectiveLocation() {
    var start = this._lexer.token;
    var name = this.parseName();
    if (DirectiveLocation[name.value] !== void 0) {
      return name;
    }
    throw this.unexpected(start);
  };
  _proto.loc = function loc(startToken) {
    var _this$_options4;
    if (((_this$_options4 = this._options) === null || _this$_options4 === void 0 ? void 0 : _this$_options4.noLocation) !== true) {
      return new Location(startToken, this._lexer.lastToken, this._lexer.source);
    }
  };
  _proto.peek = function peek(kind) {
    return this._lexer.token.kind === kind;
  };
  _proto.expectToken = function expectToken(kind) {
    var token = this._lexer.token;
    if (token.kind === kind) {
      this._lexer.advance();
      return token;
    }
    throw syntaxError(this._lexer.source, token.start, "Expected ".concat(getTokenKindDesc(kind), ", found ").concat(getTokenDesc(token), "."));
  };
  _proto.expectOptionalToken = function expectOptionalToken(kind) {
    var token = this._lexer.token;
    if (token.kind === kind) {
      this._lexer.advance();
      return token;
    }
    return void 0;
  };
  _proto.expectKeyword = function expectKeyword(value) {
    var token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this._lexer.advance();
    } else {
      throw syntaxError(this._lexer.source, token.start, 'Expected "'.concat(value, '", found ').concat(getTokenDesc(token), "."));
    }
  };
  _proto.expectOptionalKeyword = function expectOptionalKeyword(value) {
    var token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this._lexer.advance();
      return true;
    }
    return false;
  };
  _proto.unexpected = function unexpected(atToken) {
    var token = atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
    return syntaxError(this._lexer.source, token.start, "Unexpected ".concat(getTokenDesc(token), "."));
  };
  _proto.any = function any(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    var nodes = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(parseFn.call(this));
    }
    return nodes;
  };
  _proto.optionalMany = function optionalMany(openKind, parseFn, closeKind) {
    if (this.expectOptionalToken(openKind)) {
      var nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return [];
  };
  _proto.many = function many(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    var nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  };
  _proto.delimitedMany = function delimitedMany(delimiterKind, parseFn) {
    this.expectOptionalToken(delimiterKind);
    var nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  };
  return Parser2;
}();
function getTokenDesc(token) {
  var value = token.value;
  return getTokenKindDesc(token.kind) + (value != null ? ' "'.concat(value, '"') : "");
}
function getTokenKindDesc(kind) {
  return isPunctuatorTokenKind(kind) ? '"'.concat(kind, '"') : kind;
}

// node_modules/graphql/language/visitor.mjs
var QueryDocumentKeys = {
  Name: [],
  Document: ["definitions"],
  OperationDefinition: ["name", "variableDefinitions", "directives", "selectionSet"],
  VariableDefinition: ["variable", "type", "defaultValue", "directives"],
  Variable: ["name"],
  SelectionSet: ["selections"],
  Field: ["alias", "name", "arguments", "directives", "selectionSet"],
  Argument: ["name", "value"],
  FragmentSpread: ["name", "directives"],
  InlineFragment: ["typeCondition", "directives", "selectionSet"],
  FragmentDefinition: [
    "name",
    // Note: fragment variable definitions are experimental and may be changed
    // or removed in the future.
    "variableDefinitions",
    "typeCondition",
    "directives",
    "selectionSet"
  ],
  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ["values"],
  ObjectValue: ["fields"],
  ObjectField: ["name", "value"],
  Directive: ["name", "arguments"],
  NamedType: ["name"],
  ListType: ["type"],
  NonNullType: ["type"],
  SchemaDefinition: ["description", "directives", "operationTypes"],
  OperationTypeDefinition: ["type"],
  ScalarTypeDefinition: ["description", "name", "directives"],
  ObjectTypeDefinition: ["description", "name", "interfaces", "directives", "fields"],
  FieldDefinition: ["description", "name", "arguments", "type", "directives"],
  InputValueDefinition: ["description", "name", "type", "defaultValue", "directives"],
  InterfaceTypeDefinition: ["description", "name", "interfaces", "directives", "fields"],
  UnionTypeDefinition: ["description", "name", "directives", "types"],
  EnumTypeDefinition: ["description", "name", "directives", "values"],
  EnumValueDefinition: ["description", "name", "directives"],
  InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
  DirectiveDefinition: ["description", "name", "arguments", "locations"],
  SchemaExtension: ["directives", "operationTypes"],
  ScalarTypeExtension: ["name", "directives"],
  ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
  InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
  UnionTypeExtension: ["name", "directives", "types"],
  EnumTypeExtension: ["name", "directives", "values"],
  InputObjectTypeExtension: ["name", "directives", "fields"]
};
var BREAK = Object.freeze({});
function visit(root, visitor) {
  var visitorKeys = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : QueryDocumentKeys;
  var stack = void 0;
  var inArray = Array.isArray(root);
  var keys = [root];
  var index = -1;
  var edits = [];
  var node = void 0;
  var key = void 0;
  var parent = void 0;
  var path = [];
  var ancestors = [];
  var newRoot = root;
  do {
    index++;
    var isLeaving = index === keys.length;
    var isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? void 0 : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
        } else {
          var clone = {};
          for (var _i2 = 0, _Object$keys2 = Object.keys(node); _i2 < _Object$keys2.length; _i2++) {
            var k2 = _Object$keys2[_i2];
            clone[k2] = node[k2];
          }
          node = clone;
        }
        var editOffset = 0;
        for (var ii = 0; ii < edits.length; ii++) {
          var editKey = edits[ii][0];
          var editValue = edits[ii][1];
          if (inArray) {
            editKey -= editOffset;
          }
          if (inArray && editValue === null) {
            node.splice(editKey, 1);
            editOffset++;
          } else {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else {
      key = parent ? inArray ? index : keys[index] : void 0;
      node = parent ? parent[key] : newRoot;
      if (node === null || node === void 0) {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }
    var result = void 0;
    if (!Array.isArray(node)) {
      if (!isNode(node)) {
        throw new Error("Invalid AST Node: ".concat(inspect(node), "."));
      }
      var visitFn = getVisitFn(visitor, node.kind, isLeaving);
      if (visitFn) {
        result = visitFn.call(visitor, node, key, parent, path, ancestors);
        if (result === BREAK) {
          break;
        }
        if (result === false) {
          if (!isLeaving) {
            path.pop();
            continue;
          }
        } else if (result !== void 0) {
          edits.push([key, result]);
          if (!isLeaving) {
            if (isNode(result)) {
              node = result;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
    }
    if (result === void 0 && isEdited) {
      edits.push([key, node]);
    }
    if (isLeaving) {
      path.pop();
    } else {
      var _visitorKeys$node$kin;
      stack = {
        inArray,
        index,
        keys,
        edits,
        prev: stack
      };
      inArray = Array.isArray(node);
      keys = inArray ? node : (_visitorKeys$node$kin = visitorKeys[node.kind]) !== null && _visitorKeys$node$kin !== void 0 ? _visitorKeys$node$kin : [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== void 0);
  if (edits.length !== 0) {
    newRoot = edits[edits.length - 1][1];
  }
  return newRoot;
}
function getVisitFn(visitor, kind, isLeaving) {
  var kindVisitor = visitor[kind];
  if (kindVisitor) {
    if (!isLeaving && typeof kindVisitor === "function") {
      return kindVisitor;
    }
    var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;
    if (typeof kindSpecificVisitor === "function") {
      return kindSpecificVisitor;
    }
  } else {
    var specificVisitor = isLeaving ? visitor.leave : visitor.enter;
    if (specificVisitor) {
      if (typeof specificVisitor === "function") {
        return specificVisitor;
      }
      var specificKindVisitor = specificVisitor[kind];
      if (typeof specificKindVisitor === "function") {
        return specificKindVisitor;
      }
    }
  }
}

// node_modules/graphql/polyfills/find.mjs
var find = Array.prototype.find ? function(list, predicate) {
  return Array.prototype.find.call(list, predicate);
} : function(list, predicate) {
  for (var _i2 = 0; _i2 < list.length; _i2++) {
    var value = list[_i2];
    if (predicate(value)) {
      return value;
    }
  }
};
var find_default = find;

// node_modules/graphql/polyfills/objectValues.mjs
var objectValues = Object.values || function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
};
var objectValues_default = objectValues;

// node_modules/graphql/polyfills/objectEntries.mjs
var objectEntries = Object.entries || function(obj) {
  return Object.keys(obj).map(function(key) {
    return [key, obj[key]];
  });
};
var objectEntries_default = objectEntries;

// node_modules/graphql/jsutils/keyMap.mjs
function keyMap(list, keyFn) {
  return list.reduce(function(map2, item) {
    map2[keyFn(item)] = item;
    return map2;
  }, /* @__PURE__ */ Object.create(null));
}

// node_modules/graphql/jsutils/mapValue.mjs
function mapValue(map2, fn2) {
  var result = /* @__PURE__ */ Object.create(null);
  for (var _i2 = 0, _objectEntries2 = objectEntries_default(map2); _i2 < _objectEntries2.length; _i2++) {
    var _ref2 = _objectEntries2[_i2];
    var _key = _ref2[0];
    var _value = _ref2[1];
    result[_key] = fn2(_value, _key);
  }
  return result;
}

// node_modules/graphql/jsutils/toObjMap.mjs
function toObjMap(obj) {
  if (Object.getPrototypeOf(obj) === null) {
    return obj;
  }
  var map2 = /* @__PURE__ */ Object.create(null);
  for (var _i2 = 0, _objectEntries2 = objectEntries_default(obj); _i2 < _objectEntries2.length; _i2++) {
    var _ref2 = _objectEntries2[_i2];
    var key = _ref2[0];
    var value = _ref2[1];
    map2[key] = value;
  }
  return map2;
}

// node_modules/graphql/jsutils/keyValMap.mjs
function keyValMap(list, keyFn, valFn) {
  return list.reduce(function(map2, item) {
    map2[keyFn(item)] = valFn(item);
    return map2;
  }, /* @__PURE__ */ Object.create(null));
}

// node_modules/graphql/jsutils/didYouMean.mjs
var MAX_SUGGESTIONS = 5;
function didYouMean(firstArg, secondArg) {
  var _ref = typeof firstArg === "string" ? [firstArg, secondArg] : [void 0, firstArg], subMessage = _ref[0], suggestionsArg = _ref[1];
  var message = " Did you mean ";
  if (subMessage) {
    message += subMessage + " ";
  }
  var suggestions = suggestionsArg.map(function(x2) {
    return '"'.concat(x2, '"');
  });
  switch (suggestions.length) {
    case 0:
      return "";
    case 1:
      return message + suggestions[0] + "?";
    case 2:
      return message + suggestions[0] + " or " + suggestions[1] + "?";
  }
  var selected = suggestions.slice(0, MAX_SUGGESTIONS);
  var lastItem = selected.pop();
  return message + selected.join(", ") + ", or " + lastItem + "?";
}

// node_modules/graphql/jsutils/identityFunc.mjs
function identityFunc(x2) {
  return x2;
}

// node_modules/graphql/jsutils/naturalCompare.mjs
function naturalCompare(aStr, bStr) {
  var aIdx = 0;
  var bIdx = 0;
  while (aIdx < aStr.length && bIdx < bStr.length) {
    var aChar = aStr.charCodeAt(aIdx);
    var bChar = bStr.charCodeAt(bIdx);
    if (isDigit(aChar) && isDigit(bChar)) {
      var aNum = 0;
      do {
        ++aIdx;
        aNum = aNum * 10 + aChar - DIGIT_0;
        aChar = aStr.charCodeAt(aIdx);
      } while (isDigit(aChar) && aNum > 0);
      var bNum = 0;
      do {
        ++bIdx;
        bNum = bNum * 10 + bChar - DIGIT_0;
        bChar = bStr.charCodeAt(bIdx);
      } while (isDigit(bChar) && bNum > 0);
      if (aNum < bNum) {
        return -1;
      }
      if (aNum > bNum) {
        return 1;
      }
    } else {
      if (aChar < bChar) {
        return -1;
      }
      if (aChar > bChar) {
        return 1;
      }
      ++aIdx;
      ++bIdx;
    }
  }
  return aStr.length - bStr.length;
}
var DIGIT_0 = 48;
var DIGIT_9 = 57;
function isDigit(code) {
  return !isNaN(code) && DIGIT_0 <= code && code <= DIGIT_9;
}

// node_modules/graphql/jsutils/suggestionList.mjs
function suggestionList(input, options) {
  var optionsByDistance = /* @__PURE__ */ Object.create(null);
  var lexicalDistance = new LexicalDistance(input);
  var threshold = Math.floor(input.length * 0.4) + 1;
  for (var _i2 = 0; _i2 < options.length; _i2++) {
    var option = options[_i2];
    var distance = lexicalDistance.measure(option, threshold);
    if (distance !== void 0) {
      optionsByDistance[option] = distance;
    }
  }
  return Object.keys(optionsByDistance).sort(function(a2, b2) {
    var distanceDiff = optionsByDistance[a2] - optionsByDistance[b2];
    return distanceDiff !== 0 ? distanceDiff : naturalCompare(a2, b2);
  });
}
var LexicalDistance = function() {
  function LexicalDistance2(input) {
    this._input = input;
    this._inputLowerCase = input.toLowerCase();
    this._inputArray = stringToArray(this._inputLowerCase);
    this._rows = [new Array(input.length + 1).fill(0), new Array(input.length + 1).fill(0), new Array(input.length + 1).fill(0)];
  }
  var _proto = LexicalDistance2.prototype;
  _proto.measure = function measure(option, threshold) {
    if (this._input === option) {
      return 0;
    }
    var optionLowerCase = option.toLowerCase();
    if (this._inputLowerCase === optionLowerCase) {
      return 1;
    }
    var a2 = stringToArray(optionLowerCase);
    var b2 = this._inputArray;
    if (a2.length < b2.length) {
      var tmp = a2;
      a2 = b2;
      b2 = tmp;
    }
    var aLength = a2.length;
    var bLength = b2.length;
    if (aLength - bLength > threshold) {
      return void 0;
    }
    var rows = this._rows;
    for (var j2 = 0; j2 <= bLength; j2++) {
      rows[0][j2] = j2;
    }
    for (var i2 = 1; i2 <= aLength; i2++) {
      var upRow = rows[(i2 - 1) % 3];
      var currentRow = rows[i2 % 3];
      var smallestCell = currentRow[0] = i2;
      for (var _j = 1; _j <= bLength; _j++) {
        var cost = a2[i2 - 1] === b2[_j - 1] ? 0 : 1;
        var currentCell = Math.min(
          upRow[_j] + 1,
          // delete
          currentRow[_j - 1] + 1,
          // insert
          upRow[_j - 1] + cost
          // substitute
        );
        if (i2 > 1 && _j > 1 && a2[i2 - 1] === b2[_j - 2] && a2[i2 - 2] === b2[_j - 1]) {
          var doubleDiagonalCell = rows[(i2 - 2) % 3][_j - 2];
          currentCell = Math.min(currentCell, doubleDiagonalCell + 1);
        }
        if (currentCell < smallestCell) {
          smallestCell = currentCell;
        }
        currentRow[_j] = currentCell;
      }
      if (smallestCell > threshold) {
        return void 0;
      }
    }
    var distance = rows[aLength % 3][bLength];
    return distance <= threshold ? distance : void 0;
  };
  return LexicalDistance2;
}();
function stringToArray(str) {
  var strLength = str.length;
  var array = new Array(strLength);
  for (var i2 = 0; i2 < strLength; ++i2) {
    array[i2] = str.charCodeAt(i2);
  }
  return array;
}

// node_modules/graphql/language/printer.mjs
function print(ast) {
  return visit(ast, {
    leave: printDocASTReducer
  });
}
var MAX_LINE_LENGTH = 80;
var printDocASTReducer = {
  Name: function Name(node) {
    return node.value;
  },
  Variable: function Variable(node) {
    return "$" + node.name;
  },
  // Document
  Document: function Document(node) {
    return join(node.definitions, "\n\n") + "\n";
  },
  OperationDefinition: function OperationDefinition(node) {
    var op = node.operation;
    var name = node.name;
    var varDefs = wrap("(", join(node.variableDefinitions, ", "), ")");
    var directives = join(node.directives, " ");
    var selectionSet = node.selectionSet;
    return !name && !directives && !varDefs && op === "query" ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], " ");
  },
  VariableDefinition: function VariableDefinition(_ref) {
    var variable = _ref.variable, type = _ref.type, defaultValue = _ref.defaultValue, directives = _ref.directives;
    return variable + ": " + type + wrap(" = ", defaultValue) + wrap(" ", join(directives, " "));
  },
  SelectionSet: function SelectionSet(_ref2) {
    var selections = _ref2.selections;
    return block(selections);
  },
  Field: function Field(_ref3) {
    var alias = _ref3.alias, name = _ref3.name, args = _ref3.arguments, directives = _ref3.directives, selectionSet = _ref3.selectionSet;
    var prefix = wrap("", alias, ": ") + name;
    var argsLine = prefix + wrap("(", join(args, ", "), ")");
    if (argsLine.length > MAX_LINE_LENGTH) {
      argsLine = prefix + wrap("(\n", indent(join(args, "\n")), "\n)");
    }
    return join([argsLine, join(directives, " "), selectionSet], " ");
  },
  Argument: function Argument(_ref4) {
    var name = _ref4.name, value = _ref4.value;
    return name + ": " + value;
  },
  // Fragments
  FragmentSpread: function FragmentSpread(_ref5) {
    var name = _ref5.name, directives = _ref5.directives;
    return "..." + name + wrap(" ", join(directives, " "));
  },
  InlineFragment: function InlineFragment(_ref6) {
    var typeCondition = _ref6.typeCondition, directives = _ref6.directives, selectionSet = _ref6.selectionSet;
    return join(["...", wrap("on ", typeCondition), join(directives, " "), selectionSet], " ");
  },
  FragmentDefinition: function FragmentDefinition(_ref7) {
    var name = _ref7.name, typeCondition = _ref7.typeCondition, variableDefinitions = _ref7.variableDefinitions, directives = _ref7.directives, selectionSet = _ref7.selectionSet;
    return (
      // Note: fragment variable definitions are experimental and may be changed
      // or removed in the future.
      "fragment ".concat(name).concat(wrap("(", join(variableDefinitions, ", "), ")"), " ") + "on ".concat(typeCondition, " ").concat(wrap("", join(directives, " "), " ")) + selectionSet
    );
  },
  // Value
  IntValue: function IntValue(_ref8) {
    var value = _ref8.value;
    return value;
  },
  FloatValue: function FloatValue(_ref9) {
    var value = _ref9.value;
    return value;
  },
  StringValue: function StringValue(_ref10, key) {
    var value = _ref10.value, isBlockString = _ref10.block;
    return isBlockString ? printBlockString(value, key === "description" ? "" : "  ") : JSON.stringify(value);
  },
  BooleanValue: function BooleanValue(_ref11) {
    var value = _ref11.value;
    return value ? "true" : "false";
  },
  NullValue: function NullValue() {
    return "null";
  },
  EnumValue: function EnumValue(_ref12) {
    var value = _ref12.value;
    return value;
  },
  ListValue: function ListValue(_ref13) {
    var values = _ref13.values;
    return "[" + join(values, ", ") + "]";
  },
  ObjectValue: function ObjectValue(_ref14) {
    var fields7 = _ref14.fields;
    return "{" + join(fields7, ", ") + "}";
  },
  ObjectField: function ObjectField(_ref15) {
    var name = _ref15.name, value = _ref15.value;
    return name + ": " + value;
  },
  // Directive
  Directive: function Directive(_ref16) {
    var name = _ref16.name, args = _ref16.arguments;
    return "@" + name + wrap("(", join(args, ", "), ")");
  },
  // Type
  NamedType: function NamedType(_ref17) {
    var name = _ref17.name;
    return name;
  },
  ListType: function ListType(_ref18) {
    var type = _ref18.type;
    return "[" + type + "]";
  },
  NonNullType: function NonNullType(_ref19) {
    var type = _ref19.type;
    return type + "!";
  },
  // Type System Definitions
  SchemaDefinition: addDescription(function(_ref20) {
    var directives = _ref20.directives, operationTypes = _ref20.operationTypes;
    return join(["schema", join(directives, " "), block(operationTypes)], " ");
  }),
  OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
    var operation = _ref21.operation, type = _ref21.type;
    return operation + ": " + type;
  },
  ScalarTypeDefinition: addDescription(function(_ref22) {
    var name = _ref22.name, directives = _ref22.directives;
    return join(["scalar", name, join(directives, " ")], " ");
  }),
  ObjectTypeDefinition: addDescription(function(_ref23) {
    var name = _ref23.name, interfaces = _ref23.interfaces, directives = _ref23.directives, fields7 = _ref23.fields;
    return join(["type", name, wrap("implements ", join(interfaces, " & ")), join(directives, " "), block(fields7)], " ");
  }),
  FieldDefinition: addDescription(function(_ref24) {
    var name = _ref24.name, args = _ref24.arguments, type = _ref24.type, directives = _ref24.directives;
    return name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + ": " + type + wrap(" ", join(directives, " "));
  }),
  InputValueDefinition: addDescription(function(_ref25) {
    var name = _ref25.name, type = _ref25.type, defaultValue = _ref25.defaultValue, directives = _ref25.directives;
    return join([name + ": " + type, wrap("= ", defaultValue), join(directives, " ")], " ");
  }),
  InterfaceTypeDefinition: addDescription(function(_ref26) {
    var name = _ref26.name, interfaces = _ref26.interfaces, directives = _ref26.directives, fields7 = _ref26.fields;
    return join(["interface", name, wrap("implements ", join(interfaces, " & ")), join(directives, " "), block(fields7)], " ");
  }),
  UnionTypeDefinition: addDescription(function(_ref27) {
    var name = _ref27.name, directives = _ref27.directives, types = _ref27.types;
    return join(["union", name, join(directives, " "), types && types.length !== 0 ? "= " + join(types, " | ") : ""], " ");
  }),
  EnumTypeDefinition: addDescription(function(_ref28) {
    var name = _ref28.name, directives = _ref28.directives, values = _ref28.values;
    return join(["enum", name, join(directives, " "), block(values)], " ");
  }),
  EnumValueDefinition: addDescription(function(_ref29) {
    var name = _ref29.name, directives = _ref29.directives;
    return join([name, join(directives, " ")], " ");
  }),
  InputObjectTypeDefinition: addDescription(function(_ref30) {
    var name = _ref30.name, directives = _ref30.directives, fields7 = _ref30.fields;
    return join(["input", name, join(directives, " "), block(fields7)], " ");
  }),
  DirectiveDefinition: addDescription(function(_ref31) {
    var name = _ref31.name, args = _ref31.arguments, repeatable = _ref31.repeatable, locations = _ref31.locations;
    return "directive @" + name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + (repeatable ? " repeatable" : "") + " on " + join(locations, " | ");
  }),
  SchemaExtension: function SchemaExtension(_ref32) {
    var directives = _ref32.directives, operationTypes = _ref32.operationTypes;
    return join(["extend schema", join(directives, " "), block(operationTypes)], " ");
  },
  ScalarTypeExtension: function ScalarTypeExtension(_ref33) {
    var name = _ref33.name, directives = _ref33.directives;
    return join(["extend scalar", name, join(directives, " ")], " ");
  },
  ObjectTypeExtension: function ObjectTypeExtension(_ref34) {
    var name = _ref34.name, interfaces = _ref34.interfaces, directives = _ref34.directives, fields7 = _ref34.fields;
    return join(["extend type", name, wrap("implements ", join(interfaces, " & ")), join(directives, " "), block(fields7)], " ");
  },
  InterfaceTypeExtension: function InterfaceTypeExtension(_ref35) {
    var name = _ref35.name, interfaces = _ref35.interfaces, directives = _ref35.directives, fields7 = _ref35.fields;
    return join(["extend interface", name, wrap("implements ", join(interfaces, " & ")), join(directives, " "), block(fields7)], " ");
  },
  UnionTypeExtension: function UnionTypeExtension(_ref36) {
    var name = _ref36.name, directives = _ref36.directives, types = _ref36.types;
    return join(["extend union", name, join(directives, " "), types && types.length !== 0 ? "= " + join(types, " | ") : ""], " ");
  },
  EnumTypeExtension: function EnumTypeExtension(_ref37) {
    var name = _ref37.name, directives = _ref37.directives, values = _ref37.values;
    return join(["extend enum", name, join(directives, " "), block(values)], " ");
  },
  InputObjectTypeExtension: function InputObjectTypeExtension(_ref38) {
    var name = _ref38.name, directives = _ref38.directives, fields7 = _ref38.fields;
    return join(["extend input", name, join(directives, " "), block(fields7)], " ");
  }
};
function addDescription(cb) {
  return function(node) {
    return join([node.description, cb(node)], "\n");
  };
}
function join(maybeArray) {
  var _maybeArray$filter$jo;
  var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  return (_maybeArray$filter$jo = maybeArray === null || maybeArray === void 0 ? void 0 : maybeArray.filter(function(x2) {
    return x2;
  }).join(separator)) !== null && _maybeArray$filter$jo !== void 0 ? _maybeArray$filter$jo : "";
}
function block(array) {
  return wrap("{\n", indent(join(array, "\n")), "\n}");
}
function wrap(start, maybeString) {
  var end = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
  return maybeString != null && maybeString !== "" ? start + maybeString + end : "";
}
function indent(str) {
  return wrap("  ", str.replace(/\n/g, "\n  "));
}
function isMultiline(str) {
  return str.indexOf("\n") !== -1;
}
function hasMultilineItems(maybeArray) {
  return maybeArray != null && maybeArray.some(isMultiline);
}

// node_modules/graphql/utilities/valueFromASTUntyped.mjs
function valueFromASTUntyped(valueNode, variables) {
  switch (valueNode.kind) {
    case Kind.NULL:
      return null;
    case Kind.INT:
      return parseInt(valueNode.value, 10);
    case Kind.FLOAT:
      return parseFloat(valueNode.value);
    case Kind.STRING:
    case Kind.ENUM:
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.LIST:
      return valueNode.values.map(function(node) {
        return valueFromASTUntyped(node, variables);
      });
    case Kind.OBJECT:
      return keyValMap(valueNode.fields, function(field) {
        return field.name.value;
      }, function(field) {
        return valueFromASTUntyped(field.value, variables);
      });
    case Kind.VARIABLE:
      return variables === null || variables === void 0 ? void 0 : variables[valueNode.name.value];
  }
  invariant(0, "Unexpected value node: " + inspect(valueNode));
}

// node_modules/graphql/type/definition.mjs
function _defineProperties3(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties3(Constructor, staticProps);
  return Constructor;
}
function isType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type) || isListType(type) || isNonNullType(type);
}
function assertType(type) {
  if (!isType(type)) {
    throw new Error("Expected ".concat(inspect(type), " to be a GraphQL type."));
  }
  return type;
}
function isScalarType(type) {
  return instanceOf_default(type, GraphQLScalarType2);
}
function isObjectType(type) {
  return instanceOf_default(type, GraphQLObjectType);
}
function isInterfaceType(type) {
  return instanceOf_default(type, GraphQLInterfaceType);
}
function isUnionType(type) {
  return instanceOf_default(type, GraphQLUnionType);
}
function isEnumType(type) {
  return instanceOf_default(type, GraphQLEnumType);
}
function isInputObjectType(type) {
  return instanceOf_default(type, GraphQLInputObjectType);
}
function isListType(type) {
  return instanceOf_default(type, GraphQLList);
}
function isNonNullType(type) {
  return instanceOf_default(type, GraphQLNonNull);
}
function isInputType(type) {
  return isScalarType(type) || isEnumType(type) || isInputObjectType(type) || isWrappingType(type) && isInputType(type.ofType);
}
function isOutputType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isWrappingType(type) && isOutputType(type.ofType);
}
function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}
function isCompositeType(type) {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}
function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}
function GraphQLList(ofType) {
  if (this instanceof GraphQLList) {
    this.ofType = assertType(ofType);
  } else {
    return new GraphQLList(ofType);
  }
}
GraphQLList.prototype.toString = function toString() {
  return "[" + String(this.ofType) + "]";
};
GraphQLList.prototype.toJSON = function toJSON() {
  return this.toString();
};
Object.defineProperty(GraphQLList.prototype, SYMBOL_TO_STRING_TAG, {
  get: function get() {
    return "GraphQLList";
  }
});
defineInspect(GraphQLList);
function GraphQLNonNull(ofType) {
  if (this instanceof GraphQLNonNull) {
    this.ofType = assertNullableType(ofType);
  } else {
    return new GraphQLNonNull(ofType);
  }
}
GraphQLNonNull.prototype.toString = function toString2() {
  return String(this.ofType) + "!";
};
GraphQLNonNull.prototype.toJSON = function toJSON2() {
  return this.toString();
};
Object.defineProperty(GraphQLNonNull.prototype, SYMBOL_TO_STRING_TAG, {
  get: function get2() {
    return "GraphQLNonNull";
  }
});
defineInspect(GraphQLNonNull);
function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}
function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}
function assertNullableType(type) {
  if (!isNullableType(type)) {
    throw new Error("Expected ".concat(inspect(type), " to be a GraphQL nullable type."));
  }
  return type;
}
function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}
function getNamedType(type) {
  if (type) {
    var unwrappedType = type;
    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }
    return unwrappedType;
  }
}
function resolveThunk(thunk) {
  return typeof thunk === "function" ? thunk() : thunk;
}
function undefineIfEmpty(arr) {
  return arr && arr.length > 0 ? arr : void 0;
}
var GraphQLScalarType2 = function() {
  function GraphQLScalarType3(config) {
    var _config$parseValue, _config$serialize, _config$parseLiteral;
    var parseValue2 = (_config$parseValue = config.parseValue) !== null && _config$parseValue !== void 0 ? _config$parseValue : identityFunc;
    this.name = config.name;
    this.description = config.description;
    this.specifiedByUrl = config.specifiedByUrl;
    this.serialize = (_config$serialize = config.serialize) !== null && _config$serialize !== void 0 ? _config$serialize : identityFunc;
    this.parseValue = parseValue2;
    this.parseLiteral = (_config$parseLiteral = config.parseLiteral) !== null && _config$parseLiteral !== void 0 ? _config$parseLiteral : function(node, variables) {
      return parseValue2(valueFromASTUntyped(node, variables));
    };
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    typeof config.name === "string" || devAssert(0, "Must provide name.");
    config.specifiedByUrl == null || typeof config.specifiedByUrl === "string" || devAssert(0, "".concat(this.name, ' must provide "specifiedByUrl" as a string, ') + "but got: ".concat(inspect(config.specifiedByUrl), "."));
    config.serialize == null || typeof config.serialize === "function" || devAssert(0, "".concat(this.name, ' must provide "serialize" function. If this custom Scalar is also used as an input type, ensure "parseValue" and "parseLiteral" functions are also provided.'));
    if (config.parseLiteral) {
      typeof config.parseValue === "function" && typeof config.parseLiteral === "function" || devAssert(0, "".concat(this.name, ' must provide both "parseValue" and "parseLiteral" functions.'));
    }
  }
  var _proto = GraphQLScalarType3.prototype;
  _proto.toConfig = function toConfig() {
    var _this$extensionASTNod;
    return {
      name: this.name,
      description: this.description,
      specifiedByUrl: this.specifiedByUrl,
      serialize: this.serialize,
      parseValue: this.parseValue,
      parseLiteral: this.parseLiteral,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod = this.extensionASTNodes) !== null && _this$extensionASTNod !== void 0 ? _this$extensionASTNod : []
    };
  };
  _proto.toString = function toString3() {
    return this.name;
  };
  _proto.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLScalarType3, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLScalarType";
    }
  }]);
  return GraphQLScalarType3;
}();
defineInspect(GraphQLScalarType2);
var GraphQLObjectType = function() {
  function GraphQLObjectType2(config) {
    this.name = config.name;
    this.description = config.description;
    this.isTypeOf = config.isTypeOf;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    this._fields = defineFieldMap.bind(void 0, config);
    this._interfaces = defineInterfaces.bind(void 0, config);
    typeof config.name === "string" || devAssert(0, "Must provide name.");
    config.isTypeOf == null || typeof config.isTypeOf === "function" || devAssert(0, "".concat(this.name, ' must provide "isTypeOf" as a function, ') + "but got: ".concat(inspect(config.isTypeOf), "."));
  }
  var _proto2 = GraphQLObjectType2.prototype;
  _proto2.getFields = function getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  };
  _proto2.getInterfaces = function getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  };
  _proto2.toConfig = function toConfig() {
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: fieldsToFieldsConfig(this.getFields()),
      isTypeOf: this.isTypeOf,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes || []
    };
  };
  _proto2.toString = function toString3() {
    return this.name;
  };
  _proto2.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLObjectType2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLObjectType";
    }
  }]);
  return GraphQLObjectType2;
}();
defineInspect(GraphQLObjectType);
function defineInterfaces(config) {
  var _resolveThunk;
  var interfaces = (_resolveThunk = resolveThunk(config.interfaces)) !== null && _resolveThunk !== void 0 ? _resolveThunk : [];
  Array.isArray(interfaces) || devAssert(0, "".concat(config.name, " interfaces must be an Array or a function which returns an Array."));
  return interfaces;
}
function defineFieldMap(config) {
  var fieldMap = resolveThunk(config.fields);
  isPlainObj(fieldMap) || devAssert(0, "".concat(config.name, " fields must be an object with field names as keys or a function which returns such an object."));
  return mapValue(fieldMap, function(fieldConfig, fieldName) {
    var _fieldConfig$args;
    isPlainObj(fieldConfig) || devAssert(0, "".concat(config.name, ".").concat(fieldName, " field config must be an object."));
    !("isDeprecated" in fieldConfig) || devAssert(0, "".concat(config.name, ".").concat(fieldName, ' should provide "deprecationReason" instead of "isDeprecated".'));
    fieldConfig.resolve == null || typeof fieldConfig.resolve === "function" || devAssert(0, "".concat(config.name, ".").concat(fieldName, " field resolver must be a function if ") + "provided, but got: ".concat(inspect(fieldConfig.resolve), "."));
    var argsConfig = (_fieldConfig$args = fieldConfig.args) !== null && _fieldConfig$args !== void 0 ? _fieldConfig$args : {};
    isPlainObj(argsConfig) || devAssert(0, "".concat(config.name, ".").concat(fieldName, " args must be an object with argument names as keys."));
    var args = objectEntries_default(argsConfig).map(function(_ref) {
      var argName = _ref[0], argConfig = _ref[1];
      return {
        name: argName,
        description: argConfig.description,
        type: argConfig.type,
        defaultValue: argConfig.defaultValue,
        deprecationReason: argConfig.deprecationReason,
        extensions: argConfig.extensions && toObjMap(argConfig.extensions),
        astNode: argConfig.astNode
      };
    });
    return {
      name: fieldName,
      description: fieldConfig.description,
      type: fieldConfig.type,
      args,
      resolve: fieldConfig.resolve,
      subscribe: fieldConfig.subscribe,
      isDeprecated: fieldConfig.deprecationReason != null,
      deprecationReason: fieldConfig.deprecationReason,
      extensions: fieldConfig.extensions && toObjMap(fieldConfig.extensions),
      astNode: fieldConfig.astNode
    };
  });
}
function isPlainObj(obj) {
  return isObjectLike(obj) && !Array.isArray(obj);
}
function fieldsToFieldsConfig(fields7) {
  return mapValue(fields7, function(field) {
    return {
      description: field.description,
      type: field.type,
      args: argsToArgsConfig(field.args),
      resolve: field.resolve,
      subscribe: field.subscribe,
      deprecationReason: field.deprecationReason,
      extensions: field.extensions,
      astNode: field.astNode
    };
  });
}
function argsToArgsConfig(args) {
  return keyValMap(args, function(arg) {
    return arg.name;
  }, function(arg) {
    return {
      description: arg.description,
      type: arg.type,
      defaultValue: arg.defaultValue,
      deprecationReason: arg.deprecationReason,
      extensions: arg.extensions,
      astNode: arg.astNode
    };
  });
}
function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.defaultValue === void 0;
}
var GraphQLInterfaceType = function() {
  function GraphQLInterfaceType2(config) {
    this.name = config.name;
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    this._fields = defineFieldMap.bind(void 0, config);
    this._interfaces = defineInterfaces.bind(void 0, config);
    typeof config.name === "string" || devAssert(0, "Must provide name.");
    config.resolveType == null || typeof config.resolveType === "function" || devAssert(0, "".concat(this.name, ' must provide "resolveType" as a function, ') + "but got: ".concat(inspect(config.resolveType), "."));
  }
  var _proto3 = GraphQLInterfaceType2.prototype;
  _proto3.getFields = function getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  };
  _proto3.getInterfaces = function getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  };
  _proto3.toConfig = function toConfig() {
    var _this$extensionASTNod2;
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: fieldsToFieldsConfig(this.getFields()),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod2 = this.extensionASTNodes) !== null && _this$extensionASTNod2 !== void 0 ? _this$extensionASTNod2 : []
    };
  };
  _proto3.toString = function toString3() {
    return this.name;
  };
  _proto3.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLInterfaceType2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLInterfaceType";
    }
  }]);
  return GraphQLInterfaceType2;
}();
defineInspect(GraphQLInterfaceType);
var GraphQLUnionType = function() {
  function GraphQLUnionType2(config) {
    this.name = config.name;
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    this._types = defineTypes.bind(void 0, config);
    typeof config.name === "string" || devAssert(0, "Must provide name.");
    config.resolveType == null || typeof config.resolveType === "function" || devAssert(0, "".concat(this.name, ' must provide "resolveType" as a function, ') + "but got: ".concat(inspect(config.resolveType), "."));
  }
  var _proto4 = GraphQLUnionType2.prototype;
  _proto4.getTypes = function getTypes() {
    if (typeof this._types === "function") {
      this._types = this._types();
    }
    return this._types;
  };
  _proto4.toConfig = function toConfig() {
    var _this$extensionASTNod3;
    return {
      name: this.name,
      description: this.description,
      types: this.getTypes(),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod3 = this.extensionASTNodes) !== null && _this$extensionASTNod3 !== void 0 ? _this$extensionASTNod3 : []
    };
  };
  _proto4.toString = function toString3() {
    return this.name;
  };
  _proto4.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLUnionType2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLUnionType";
    }
  }]);
  return GraphQLUnionType2;
}();
defineInspect(GraphQLUnionType);
function defineTypes(config) {
  var types = resolveThunk(config.types);
  Array.isArray(types) || devAssert(0, "Must provide Array of types or a function which returns such an array for Union ".concat(config.name, "."));
  return types;
}
var GraphQLEnumType = function() {
  function GraphQLEnumType2(config) {
    this.name = config.name;
    this.description = config.description;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    this._values = defineEnumValues(this.name, config.values);
    this._valueLookup = new Map(this._values.map(function(enumValue) {
      return [enumValue.value, enumValue];
    }));
    this._nameLookup = keyMap(this._values, function(value) {
      return value.name;
    });
    typeof config.name === "string" || devAssert(0, "Must provide name.");
  }
  var _proto5 = GraphQLEnumType2.prototype;
  _proto5.getValues = function getValues() {
    return this._values;
  };
  _proto5.getValue = function getValue(name) {
    return this._nameLookup[name];
  };
  _proto5.serialize = function serialize(outputValue) {
    var enumValue = this._valueLookup.get(outputValue);
    if (enumValue === void 0) {
      throw new GraphQLError('Enum "'.concat(this.name, '" cannot represent value: ').concat(inspect(outputValue)));
    }
    return enumValue.name;
  };
  _proto5.parseValue = function parseValue2(inputValue) {
    if (typeof inputValue !== "string") {
      var valueStr = inspect(inputValue);
      throw new GraphQLError('Enum "'.concat(this.name, '" cannot represent non-string value: ').concat(valueStr, ".") + didYouMeanEnumValue(this, valueStr));
    }
    var enumValue = this.getValue(inputValue);
    if (enumValue == null) {
      throw new GraphQLError('Value "'.concat(inputValue, '" does not exist in "').concat(this.name, '" enum.') + didYouMeanEnumValue(this, inputValue));
    }
    return enumValue.value;
  };
  _proto5.parseLiteral = function parseLiteral6(valueNode, _variables) {
    if (valueNode.kind !== Kind.ENUM) {
      var valueStr = print(valueNode);
      throw new GraphQLError('Enum "'.concat(this.name, '" cannot represent non-enum value: ').concat(valueStr, ".") + didYouMeanEnumValue(this, valueStr), valueNode);
    }
    var enumValue = this.getValue(valueNode.value);
    if (enumValue == null) {
      var _valueStr = print(valueNode);
      throw new GraphQLError('Value "'.concat(_valueStr, '" does not exist in "').concat(this.name, '" enum.') + didYouMeanEnumValue(this, _valueStr), valueNode);
    }
    return enumValue.value;
  };
  _proto5.toConfig = function toConfig() {
    var _this$extensionASTNod4;
    var values = keyValMap(this.getValues(), function(value) {
      return value.name;
    }, function(value) {
      return {
        description: value.description,
        value: value.value,
        deprecationReason: value.deprecationReason,
        extensions: value.extensions,
        astNode: value.astNode
      };
    });
    return {
      name: this.name,
      description: this.description,
      values,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod4 = this.extensionASTNodes) !== null && _this$extensionASTNod4 !== void 0 ? _this$extensionASTNod4 : []
    };
  };
  _proto5.toString = function toString3() {
    return this.name;
  };
  _proto5.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLEnumType2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLEnumType";
    }
  }]);
  return GraphQLEnumType2;
}();
defineInspect(GraphQLEnumType);
function didYouMeanEnumValue(enumType, unknownValueStr) {
  var allNames = enumType.getValues().map(function(value) {
    return value.name;
  });
  var suggestedValues = suggestionList(unknownValueStr, allNames);
  return didYouMean("the enum value", suggestedValues);
}
function defineEnumValues(typeName, valueMap) {
  isPlainObj(valueMap) || devAssert(0, "".concat(typeName, " values must be an object with value names as keys."));
  return objectEntries_default(valueMap).map(function(_ref2) {
    var valueName = _ref2[0], valueConfig = _ref2[1];
    isPlainObj(valueConfig) || devAssert(0, "".concat(typeName, ".").concat(valueName, ' must refer to an object with a "value" key ') + "representing an internal value but got: ".concat(inspect(valueConfig), "."));
    !("isDeprecated" in valueConfig) || devAssert(0, "".concat(typeName, ".").concat(valueName, ' should provide "deprecationReason" instead of "isDeprecated".'));
    return {
      name: valueName,
      description: valueConfig.description,
      value: valueConfig.value !== void 0 ? valueConfig.value : valueName,
      isDeprecated: valueConfig.deprecationReason != null,
      deprecationReason: valueConfig.deprecationReason,
      extensions: valueConfig.extensions && toObjMap(valueConfig.extensions),
      astNode: valueConfig.astNode
    };
  });
}
var GraphQLInputObjectType = function() {
  function GraphQLInputObjectType2(config) {
    this.name = config.name;
    this.description = config.description;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = undefineIfEmpty(config.extensionASTNodes);
    this._fields = defineInputFieldMap.bind(void 0, config);
    typeof config.name === "string" || devAssert(0, "Must provide name.");
  }
  var _proto6 = GraphQLInputObjectType2.prototype;
  _proto6.getFields = function getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  };
  _proto6.toConfig = function toConfig() {
    var _this$extensionASTNod5;
    var fields7 = mapValue(this.getFields(), function(field) {
      return {
        description: field.description,
        type: field.type,
        defaultValue: field.defaultValue,
        deprecationReason: field.deprecationReason,
        extensions: field.extensions,
        astNode: field.astNode
      };
    });
    return {
      name: this.name,
      description: this.description,
      fields: fields7,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod5 = this.extensionASTNodes) !== null && _this$extensionASTNod5 !== void 0 ? _this$extensionASTNod5 : []
    };
  };
  _proto6.toString = function toString3() {
    return this.name;
  };
  _proto6.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass3(GraphQLInputObjectType2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLInputObjectType";
    }
  }]);
  return GraphQLInputObjectType2;
}();
defineInspect(GraphQLInputObjectType);
function defineInputFieldMap(config) {
  var fieldMap = resolveThunk(config.fields);
  isPlainObj(fieldMap) || devAssert(0, "".concat(config.name, " fields must be an object with field names as keys or a function which returns such an object."));
  return mapValue(fieldMap, function(fieldConfig, fieldName) {
    !("resolve" in fieldConfig) || devAssert(0, "".concat(config.name, ".").concat(fieldName, " field has a resolve property, but Input Types cannot define resolvers."));
    return {
      name: fieldName,
      description: fieldConfig.description,
      type: fieldConfig.type,
      defaultValue: fieldConfig.defaultValue,
      deprecationReason: fieldConfig.deprecationReason,
      extensions: fieldConfig.extensions && toObjMap(fieldConfig.extensions),
      astNode: fieldConfig.astNode
    };
  });
}
function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === void 0;
}

// node_modules/graphql/utilities/typeComparators.mjs
function isTypeSubTypeOf(schema2, maybeSubType, superType) {
  if (maybeSubType === superType) {
    return true;
  }
  if (isNonNullType(superType)) {
    if (isNonNullType(maybeSubType)) {
      return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isNonNullType(maybeSubType)) {
    return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType);
  }
  if (isListType(superType)) {
    if (isListType(maybeSubType)) {
      return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isListType(maybeSubType)) {
    return false;
  }
  return isAbstractType(superType) && (isInterfaceType(maybeSubType) || isObjectType(maybeSubType)) && schema2.isSubType(superType, maybeSubType);
}
function doTypesOverlap(schema2, typeA, typeB) {
  if (typeA === typeB) {
    return true;
  }
  if (isAbstractType(typeA)) {
    if (isAbstractType(typeB)) {
      return schema2.getPossibleTypes(typeA).some(function(type) {
        return schema2.isSubType(typeB, type);
      });
    }
    return schema2.isSubType(typeA, typeB);
  }
  if (isAbstractType(typeB)) {
    return schema2.isSubType(typeB, typeA);
  }
  return false;
}

// node_modules/graphql/polyfills/arrayFrom.mjs
var arrayFrom = Array.from || function(obj, mapFn, thisArg) {
  if (obj == null) {
    throw new TypeError("Array.from requires an array-like object - not null or undefined");
  }
  var iteratorMethod = obj[SYMBOL_ITERATOR];
  if (typeof iteratorMethod === "function") {
    var iterator = iteratorMethod.call(obj);
    var result = [];
    var step;
    for (var i2 = 0; !(step = iterator.next()).done; ++i2) {
      result.push(mapFn.call(thisArg, step.value, i2));
      if (i2 > 9999999) {
        throw new TypeError("Near-infinite iteration.");
      }
    }
    return result;
  }
  var length = obj.length;
  if (typeof length === "number" && length >= 0 && length % 1 === 0) {
    var _result = [];
    for (var _i = 0; _i < length; ++_i) {
      if (Object.prototype.hasOwnProperty.call(obj, _i)) {
        _result.push(mapFn.call(thisArg, obj[_i], _i));
      }
    }
    return _result;
  }
  return [];
};
var arrayFrom_default = arrayFrom;

// node_modules/graphql/polyfills/isFinite.mjs
var isFinitePolyfill = Number.isFinite || function(value) {
  return typeof value === "number" && isFinite(value);
};
var isFinite_default = isFinitePolyfill;

// node_modules/graphql/jsutils/safeArrayFrom.mjs
function _typeof5(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof5 = function _typeof6(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof5 = function _typeof6(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof5(obj);
}
function safeArrayFrom(collection) {
  var mapFn = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function(item) {
    return item;
  };
  if (collection == null || _typeof5(collection) !== "object") {
    return null;
  }
  if (Array.isArray(collection)) {
    return collection.map(mapFn);
  }
  var iteratorMethod = collection[SYMBOL_ITERATOR];
  if (typeof iteratorMethod === "function") {
    var iterator = iteratorMethod.call(collection);
    var result = [];
    var step;
    for (var i2 = 0; !(step = iterator.next()).done; ++i2) {
      result.push(mapFn(step.value, i2));
    }
    return result;
  }
  var length = collection.length;
  if (typeof length === "number" && length >= 0 && length % 1 === 0) {
    var _result = [];
    for (var _i = 0; _i < length; ++_i) {
      if (!Object.prototype.hasOwnProperty.call(collection, _i)) {
        return null;
      }
      _result.push(mapFn(collection[String(_i)], _i));
    }
    return _result;
  }
  return null;
}

// node_modules/graphql/polyfills/isInteger.mjs
var isInteger = Number.isInteger || function(value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};
var isInteger_default = isInteger;

// node_modules/graphql/type/scalars.mjs
var MAX_INT = 2147483647;
var MIN_INT = -2147483648;
function serializeInt(outputValue) {
  var coercedValue = serializeObject(outputValue);
  if (typeof coercedValue === "boolean") {
    return coercedValue ? 1 : 0;
  }
  var num = coercedValue;
  if (typeof coercedValue === "string" && coercedValue !== "") {
    num = Number(coercedValue);
  }
  if (!isInteger_default(num)) {
    throw new GraphQLError("Int cannot represent non-integer value: ".concat(inspect(coercedValue)));
  }
  if (num > MAX_INT || num < MIN_INT) {
    throw new GraphQLError("Int cannot represent non 32-bit signed integer value: " + inspect(coercedValue));
  }
  return num;
}
function coerceInt(inputValue) {
  if (!isInteger_default(inputValue)) {
    throw new GraphQLError("Int cannot represent non-integer value: ".concat(inspect(inputValue)));
  }
  if (inputValue > MAX_INT || inputValue < MIN_INT) {
    throw new GraphQLError("Int cannot represent non 32-bit signed integer value: ".concat(inputValue));
  }
  return inputValue;
}
var GraphQLInt = new GraphQLScalarType2({
  name: "Int",
  description: "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.",
  serialize: serializeInt,
  parseValue: coerceInt,
  parseLiteral: function parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.INT) {
      throw new GraphQLError("Int cannot represent non-integer value: ".concat(print(valueNode)), valueNode);
    }
    var num = parseInt(valueNode.value, 10);
    if (num > MAX_INT || num < MIN_INT) {
      throw new GraphQLError("Int cannot represent non 32-bit signed integer value: ".concat(valueNode.value), valueNode);
    }
    return num;
  }
});
function serializeFloat(outputValue) {
  var coercedValue = serializeObject(outputValue);
  if (typeof coercedValue === "boolean") {
    return coercedValue ? 1 : 0;
  }
  var num = coercedValue;
  if (typeof coercedValue === "string" && coercedValue !== "") {
    num = Number(coercedValue);
  }
  if (!isFinite_default(num)) {
    throw new GraphQLError("Float cannot represent non numeric value: ".concat(inspect(coercedValue)));
  }
  return num;
}
function coerceFloat(inputValue) {
  if (!isFinite_default(inputValue)) {
    throw new GraphQLError("Float cannot represent non numeric value: ".concat(inspect(inputValue)));
  }
  return inputValue;
}
var GraphQLFloat = new GraphQLScalarType2({
  name: "Float",
  description: "The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).",
  serialize: serializeFloat,
  parseValue: coerceFloat,
  parseLiteral: function parseLiteral2(valueNode) {
    if (valueNode.kind !== Kind.FLOAT && valueNode.kind !== Kind.INT) {
      throw new GraphQLError("Float cannot represent non numeric value: ".concat(print(valueNode)), valueNode);
    }
    return parseFloat(valueNode.value);
  }
});
function serializeObject(outputValue) {
  if (isObjectLike(outputValue)) {
    if (typeof outputValue.valueOf === "function") {
      var valueOfResult = outputValue.valueOf();
      if (!isObjectLike(valueOfResult)) {
        return valueOfResult;
      }
    }
    if (typeof outputValue.toJSON === "function") {
      return outputValue.toJSON();
    }
  }
  return outputValue;
}
function serializeString(outputValue) {
  var coercedValue = serializeObject(outputValue);
  if (typeof coercedValue === "string") {
    return coercedValue;
  }
  if (typeof coercedValue === "boolean") {
    return coercedValue ? "true" : "false";
  }
  if (isFinite_default(coercedValue)) {
    return coercedValue.toString();
  }
  throw new GraphQLError("String cannot represent value: ".concat(inspect(outputValue)));
}
function coerceString(inputValue) {
  if (typeof inputValue !== "string") {
    throw new GraphQLError("String cannot represent a non string value: ".concat(inspect(inputValue)));
  }
  return inputValue;
}
var GraphQLString = new GraphQLScalarType2({
  name: "String",
  description: "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
  serialize: serializeString,
  parseValue: coerceString,
  parseLiteral: function parseLiteral3(valueNode) {
    if (valueNode.kind !== Kind.STRING) {
      throw new GraphQLError("String cannot represent a non string value: ".concat(print(valueNode)), valueNode);
    }
    return valueNode.value;
  }
});
function serializeBoolean(outputValue) {
  var coercedValue = serializeObject(outputValue);
  if (typeof coercedValue === "boolean") {
    return coercedValue;
  }
  if (isFinite_default(coercedValue)) {
    return coercedValue !== 0;
  }
  throw new GraphQLError("Boolean cannot represent a non boolean value: ".concat(inspect(coercedValue)));
}
function coerceBoolean(inputValue) {
  if (typeof inputValue !== "boolean") {
    throw new GraphQLError("Boolean cannot represent a non boolean value: ".concat(inspect(inputValue)));
  }
  return inputValue;
}
var GraphQLBoolean = new GraphQLScalarType2({
  name: "Boolean",
  description: "The `Boolean` scalar type represents `true` or `false`.",
  serialize: serializeBoolean,
  parseValue: coerceBoolean,
  parseLiteral: function parseLiteral4(valueNode) {
    if (valueNode.kind !== Kind.BOOLEAN) {
      throw new GraphQLError("Boolean cannot represent a non boolean value: ".concat(print(valueNode)), valueNode);
    }
    return valueNode.value;
  }
});
function serializeID(outputValue) {
  var coercedValue = serializeObject(outputValue);
  if (typeof coercedValue === "string") {
    return coercedValue;
  }
  if (isInteger_default(coercedValue)) {
    return String(coercedValue);
  }
  throw new GraphQLError("ID cannot represent value: ".concat(inspect(outputValue)));
}
function coerceID(inputValue) {
  if (typeof inputValue === "string") {
    return inputValue;
  }
  if (isInteger_default(inputValue)) {
    return inputValue.toString();
  }
  throw new GraphQLError("ID cannot represent value: ".concat(inspect(inputValue)));
}
var GraphQLID = new GraphQLScalarType2({
  name: "ID",
  description: 'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
  serialize: serializeID,
  parseValue: coerceID,
  parseLiteral: function parseLiteral5(valueNode) {
    if (valueNode.kind !== Kind.STRING && valueNode.kind !== Kind.INT) {
      throw new GraphQLError("ID cannot represent a non-string and non-integer value: " + print(valueNode), valueNode);
    }
    return valueNode.value;
  }
});
var specifiedScalarTypes = Object.freeze([GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLID]);

// node_modules/graphql/utilities/astFromValue.mjs
function astFromValue(value, type) {
  if (isNonNullType(type)) {
    var astValue = astFromValue(value, type.ofType);
    if ((astValue === null || astValue === void 0 ? void 0 : astValue.kind) === Kind.NULL) {
      return null;
    }
    return astValue;
  }
  if (value === null) {
    return {
      kind: Kind.NULL
    };
  }
  if (value === void 0) {
    return null;
  }
  if (isListType(type)) {
    var itemType = type.ofType;
    var items = safeArrayFrom(value);
    if (items != null) {
      var valuesNodes = [];
      for (var _i2 = 0; _i2 < items.length; _i2++) {
        var item = items[_i2];
        var itemNode = astFromValue(item, itemType);
        if (itemNode != null) {
          valuesNodes.push(itemNode);
        }
      }
      return {
        kind: Kind.LIST,
        values: valuesNodes
      };
    }
    return astFromValue(value, itemType);
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(value)) {
      return null;
    }
    var fieldNodes = [];
    for (var _i4 = 0, _objectValues2 = objectValues_default(type.getFields()); _i4 < _objectValues2.length; _i4++) {
      var field = _objectValues2[_i4];
      var fieldValue = astFromValue(value[field.name], field.type);
      if (fieldValue) {
        fieldNodes.push({
          kind: Kind.OBJECT_FIELD,
          name: {
            kind: Kind.NAME,
            value: field.name
          },
          value: fieldValue
        });
      }
    }
    return {
      kind: Kind.OBJECT,
      fields: fieldNodes
    };
  }
  if (isLeafType(type)) {
    var serialized = type.serialize(value);
    if (serialized == null) {
      return null;
    }
    if (typeof serialized === "boolean") {
      return {
        kind: Kind.BOOLEAN,
        value: serialized
      };
    }
    if (typeof serialized === "number" && isFinite_default(serialized)) {
      var stringNum = String(serialized);
      return integerStringRegExp.test(stringNum) ? {
        kind: Kind.INT,
        value: stringNum
      } : {
        kind: Kind.FLOAT,
        value: stringNum
      };
    }
    if (typeof serialized === "string") {
      if (isEnumType(type)) {
        return {
          kind: Kind.ENUM,
          value: serialized
        };
      }
      if (type === GraphQLID && integerStringRegExp.test(serialized)) {
        return {
          kind: Kind.INT,
          value: serialized
        };
      }
      return {
        kind: Kind.STRING,
        value: serialized
      };
    }
    throw new TypeError("Cannot convert value to AST: ".concat(inspect(serialized), "."));
  }
  invariant(0, "Unexpected input type: " + inspect(type));
}
var integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;

// node_modules/graphql/type/introspection.mjs
var __Schema = new GraphQLObjectType({
  name: "__Schema",
  description: "A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.",
  fields: function fields() {
    return {
      description: {
        type: GraphQLString,
        resolve: function resolve4(schema2) {
          return schema2.description;
        }
      },
      types: {
        description: "A list of all types supported by this server.",
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Type))),
        resolve: function resolve4(schema2) {
          return objectValues_default(schema2.getTypeMap());
        }
      },
      queryType: {
        description: "The type that query operations will be rooted at.",
        type: new GraphQLNonNull(__Type),
        resolve: function resolve4(schema2) {
          return schema2.getQueryType();
        }
      },
      mutationType: {
        description: "If this server supports mutation, the type that mutation operations will be rooted at.",
        type: __Type,
        resolve: function resolve4(schema2) {
          return schema2.getMutationType();
        }
      },
      subscriptionType: {
        description: "If this server support subscription, the type that subscription operations will be rooted at.",
        type: __Type,
        resolve: function resolve4(schema2) {
          return schema2.getSubscriptionType();
        }
      },
      directives: {
        description: "A list of all directives supported by this server.",
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Directive))),
        resolve: function resolve4(schema2) {
          return schema2.getDirectives();
        }
      }
    };
  }
});
var __Directive = new GraphQLObjectType({
  name: "__Directive",
  description: "A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.",
  fields: function fields2() {
    return {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: function resolve4(directive) {
          return directive.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve4(directive) {
          return directive.description;
        }
      },
      isRepeatable: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: function resolve4(directive) {
          return directive.isRepeatable;
        }
      },
      locations: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__DirectiveLocation))),
        resolve: function resolve4(directive) {
          return directive.locations;
        }
      },
      args: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve4(field, _ref) {
          var includeDeprecated = _ref.includeDeprecated;
          return includeDeprecated ? field.args : field.args.filter(function(arg) {
            return arg.deprecationReason == null;
          });
        }
      }
    };
  }
});
var __DirectiveLocation = new GraphQLEnumType({
  name: "__DirectiveLocation",
  description: "A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.",
  values: {
    QUERY: {
      value: DirectiveLocation.QUERY,
      description: "Location adjacent to a query operation."
    },
    MUTATION: {
      value: DirectiveLocation.MUTATION,
      description: "Location adjacent to a mutation operation."
    },
    SUBSCRIPTION: {
      value: DirectiveLocation.SUBSCRIPTION,
      description: "Location adjacent to a subscription operation."
    },
    FIELD: {
      value: DirectiveLocation.FIELD,
      description: "Location adjacent to a field."
    },
    FRAGMENT_DEFINITION: {
      value: DirectiveLocation.FRAGMENT_DEFINITION,
      description: "Location adjacent to a fragment definition."
    },
    FRAGMENT_SPREAD: {
      value: DirectiveLocation.FRAGMENT_SPREAD,
      description: "Location adjacent to a fragment spread."
    },
    INLINE_FRAGMENT: {
      value: DirectiveLocation.INLINE_FRAGMENT,
      description: "Location adjacent to an inline fragment."
    },
    VARIABLE_DEFINITION: {
      value: DirectiveLocation.VARIABLE_DEFINITION,
      description: "Location adjacent to a variable definition."
    },
    SCHEMA: {
      value: DirectiveLocation.SCHEMA,
      description: "Location adjacent to a schema definition."
    },
    SCALAR: {
      value: DirectiveLocation.SCALAR,
      description: "Location adjacent to a scalar definition."
    },
    OBJECT: {
      value: DirectiveLocation.OBJECT,
      description: "Location adjacent to an object type definition."
    },
    FIELD_DEFINITION: {
      value: DirectiveLocation.FIELD_DEFINITION,
      description: "Location adjacent to a field definition."
    },
    ARGUMENT_DEFINITION: {
      value: DirectiveLocation.ARGUMENT_DEFINITION,
      description: "Location adjacent to an argument definition."
    },
    INTERFACE: {
      value: DirectiveLocation.INTERFACE,
      description: "Location adjacent to an interface definition."
    },
    UNION: {
      value: DirectiveLocation.UNION,
      description: "Location adjacent to a union definition."
    },
    ENUM: {
      value: DirectiveLocation.ENUM,
      description: "Location adjacent to an enum definition."
    },
    ENUM_VALUE: {
      value: DirectiveLocation.ENUM_VALUE,
      description: "Location adjacent to an enum value definition."
    },
    INPUT_OBJECT: {
      value: DirectiveLocation.INPUT_OBJECT,
      description: "Location adjacent to an input object type definition."
    },
    INPUT_FIELD_DEFINITION: {
      value: DirectiveLocation.INPUT_FIELD_DEFINITION,
      description: "Location adjacent to an input object field definition."
    }
  }
});
var __Type = new GraphQLObjectType({
  name: "__Type",
  description: "The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByUrl`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.",
  fields: function fields3() {
    return {
      kind: {
        type: new GraphQLNonNull(__TypeKind),
        resolve: function resolve4(type) {
          if (isScalarType(type)) {
            return TypeKind.SCALAR;
          }
          if (isObjectType(type)) {
            return TypeKind.OBJECT;
          }
          if (isInterfaceType(type)) {
            return TypeKind.INTERFACE;
          }
          if (isUnionType(type)) {
            return TypeKind.UNION;
          }
          if (isEnumType(type)) {
            return TypeKind.ENUM;
          }
          if (isInputObjectType(type)) {
            return TypeKind.INPUT_OBJECT;
          }
          if (isListType(type)) {
            return TypeKind.LIST;
          }
          if (isNonNullType(type)) {
            return TypeKind.NON_NULL;
          }
          invariant(0, 'Unexpected type: "'.concat(inspect(type), '".'));
        }
      },
      name: {
        type: GraphQLString,
        resolve: function resolve4(type) {
          return type.name !== void 0 ? type.name : void 0;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve4(type) {
          return type.description !== void 0 ? type.description : void 0;
        }
      },
      specifiedByUrl: {
        type: GraphQLString,
        resolve: function resolve4(obj) {
          return obj.specifiedByUrl !== void 0 ? obj.specifiedByUrl : void 0;
        }
      },
      fields: {
        type: new GraphQLList(new GraphQLNonNull(__Field)),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve4(type, _ref2) {
          var includeDeprecated = _ref2.includeDeprecated;
          if (isObjectType(type) || isInterfaceType(type)) {
            var fields7 = objectValues_default(type.getFields());
            return includeDeprecated ? fields7 : fields7.filter(function(field) {
              return field.deprecationReason == null;
            });
          }
        }
      },
      interfaces: {
        type: new GraphQLList(new GraphQLNonNull(__Type)),
        resolve: function resolve4(type) {
          if (isObjectType(type) || isInterfaceType(type)) {
            return type.getInterfaces();
          }
        }
      },
      possibleTypes: {
        type: new GraphQLList(new GraphQLNonNull(__Type)),
        resolve: function resolve4(type, _args, _context, _ref3) {
          var schema2 = _ref3.schema;
          if (isAbstractType(type)) {
            return schema2.getPossibleTypes(type);
          }
        }
      },
      enumValues: {
        type: new GraphQLList(new GraphQLNonNull(__EnumValue)),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve4(type, _ref4) {
          var includeDeprecated = _ref4.includeDeprecated;
          if (isEnumType(type)) {
            var values = type.getValues();
            return includeDeprecated ? values : values.filter(function(field) {
              return field.deprecationReason == null;
            });
          }
        }
      },
      inputFields: {
        type: new GraphQLList(new GraphQLNonNull(__InputValue)),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve4(type, _ref5) {
          var includeDeprecated = _ref5.includeDeprecated;
          if (isInputObjectType(type)) {
            var values = objectValues_default(type.getFields());
            return includeDeprecated ? values : values.filter(function(field) {
              return field.deprecationReason == null;
            });
          }
        }
      },
      ofType: {
        type: __Type,
        resolve: function resolve4(type) {
          return type.ofType !== void 0 ? type.ofType : void 0;
        }
      }
    };
  }
});
var __Field = new GraphQLObjectType({
  name: "__Field",
  description: "Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.",
  fields: function fields4() {
    return {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: function resolve4(field) {
          return field.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve4(field) {
          return field.description;
        }
      },
      args: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
        args: {
          includeDeprecated: {
            type: GraphQLBoolean,
            defaultValue: false
          }
        },
        resolve: function resolve4(field, _ref6) {
          var includeDeprecated = _ref6.includeDeprecated;
          return includeDeprecated ? field.args : field.args.filter(function(arg) {
            return arg.deprecationReason == null;
          });
        }
      },
      type: {
        type: new GraphQLNonNull(__Type),
        resolve: function resolve4(field) {
          return field.type;
        }
      },
      isDeprecated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: function resolve4(field) {
          return field.deprecationReason != null;
        }
      },
      deprecationReason: {
        type: GraphQLString,
        resolve: function resolve4(field) {
          return field.deprecationReason;
        }
      }
    };
  }
});
var __InputValue = new GraphQLObjectType({
  name: "__InputValue",
  description: "Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.",
  fields: function fields5() {
    return {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: function resolve4(inputValue) {
          return inputValue.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve4(inputValue) {
          return inputValue.description;
        }
      },
      type: {
        type: new GraphQLNonNull(__Type),
        resolve: function resolve4(inputValue) {
          return inputValue.type;
        }
      },
      defaultValue: {
        type: GraphQLString,
        description: "A GraphQL-formatted string representing the default value for this input value.",
        resolve: function resolve4(inputValue) {
          var type = inputValue.type, defaultValue = inputValue.defaultValue;
          var valueAST = astFromValue(defaultValue, type);
          return valueAST ? print(valueAST) : null;
        }
      },
      isDeprecated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: function resolve4(field) {
          return field.deprecationReason != null;
        }
      },
      deprecationReason: {
        type: GraphQLString,
        resolve: function resolve4(obj) {
          return obj.deprecationReason;
        }
      }
    };
  }
});
var __EnumValue = new GraphQLObjectType({
  name: "__EnumValue",
  description: "One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.",
  fields: function fields6() {
    return {
      name: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: function resolve4(enumValue) {
          return enumValue.name;
        }
      },
      description: {
        type: GraphQLString,
        resolve: function resolve4(enumValue) {
          return enumValue.description;
        }
      },
      isDeprecated: {
        type: new GraphQLNonNull(GraphQLBoolean),
        resolve: function resolve4(enumValue) {
          return enumValue.deprecationReason != null;
        }
      },
      deprecationReason: {
        type: GraphQLString,
        resolve: function resolve4(enumValue) {
          return enumValue.deprecationReason;
        }
      }
    };
  }
});
var TypeKind = Object.freeze({
  SCALAR: "SCALAR",
  OBJECT: "OBJECT",
  INTERFACE: "INTERFACE",
  UNION: "UNION",
  ENUM: "ENUM",
  INPUT_OBJECT: "INPUT_OBJECT",
  LIST: "LIST",
  NON_NULL: "NON_NULL"
});
var __TypeKind = new GraphQLEnumType({
  name: "__TypeKind",
  description: "An enum describing what kind of type a given `__Type` is.",
  values: {
    SCALAR: {
      value: TypeKind.SCALAR,
      description: "Indicates this type is a scalar."
    },
    OBJECT: {
      value: TypeKind.OBJECT,
      description: "Indicates this type is an object. `fields` and `interfaces` are valid fields."
    },
    INTERFACE: {
      value: TypeKind.INTERFACE,
      description: "Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields."
    },
    UNION: {
      value: TypeKind.UNION,
      description: "Indicates this type is a union. `possibleTypes` is a valid field."
    },
    ENUM: {
      value: TypeKind.ENUM,
      description: "Indicates this type is an enum. `enumValues` is a valid field."
    },
    INPUT_OBJECT: {
      value: TypeKind.INPUT_OBJECT,
      description: "Indicates this type is an input object. `inputFields` is a valid field."
    },
    LIST: {
      value: TypeKind.LIST,
      description: "Indicates this type is a list. `ofType` is a valid field."
    },
    NON_NULL: {
      value: TypeKind.NON_NULL,
      description: "Indicates this type is a non-null. `ofType` is a valid field."
    }
  }
});
var SchemaMetaFieldDef = {
  name: "__schema",
  type: new GraphQLNonNull(__Schema),
  description: "Access the current type schema of this server.",
  args: [],
  resolve: function resolve(_source, _args, _context, _ref7) {
    var schema2 = _ref7.schema;
    return schema2;
  },
  isDeprecated: false,
  deprecationReason: void 0,
  extensions: void 0,
  astNode: void 0
};
var TypeMetaFieldDef = {
  name: "__type",
  type: __Type,
  description: "Request the type information of a single type.",
  args: [{
    name: "name",
    description: void 0,
    type: new GraphQLNonNull(GraphQLString),
    defaultValue: void 0,
    deprecationReason: void 0,
    extensions: void 0,
    astNode: void 0
  }],
  resolve: function resolve2(_source, _ref8, _context, _ref9) {
    var name = _ref8.name;
    var schema2 = _ref9.schema;
    return schema2.getType(name);
  },
  isDeprecated: false,
  deprecationReason: void 0,
  extensions: void 0,
  astNode: void 0
};
var TypeNameMetaFieldDef = {
  name: "__typename",
  type: new GraphQLNonNull(GraphQLString),
  description: "The name of the current Object type at runtime.",
  args: [],
  resolve: function resolve3(_source, _args, _context, _ref10) {
    var parentType = _ref10.parentType;
    return parentType.name;
  },
  isDeprecated: false,
  deprecationReason: void 0,
  extensions: void 0,
  astNode: void 0
};
var introspectionTypes = Object.freeze([__Schema, __Directive, __DirectiveLocation, __Type, __Field, __InputValue, __EnumValue, __TypeKind]);

// node_modules/graphql/type/directives.mjs
function _defineProperties4(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass4(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties4(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties4(Constructor, staticProps);
  return Constructor;
}
function isDirective(directive) {
  return instanceOf_default(directive, GraphQLDirective);
}
var GraphQLDirective = function() {
  function GraphQLDirective2(config) {
    var _config$isRepeatable, _config$args;
    this.name = config.name;
    this.description = config.description;
    this.locations = config.locations;
    this.isRepeatable = (_config$isRepeatable = config.isRepeatable) !== null && _config$isRepeatable !== void 0 ? _config$isRepeatable : false;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    config.name || devAssert(0, "Directive must be named.");
    Array.isArray(config.locations) || devAssert(0, "@".concat(config.name, " locations must be an Array."));
    var args = (_config$args = config.args) !== null && _config$args !== void 0 ? _config$args : {};
    isObjectLike(args) && !Array.isArray(args) || devAssert(0, "@".concat(config.name, " args must be an object with argument names as keys."));
    this.args = objectEntries_default(args).map(function(_ref) {
      var argName = _ref[0], argConfig = _ref[1];
      return {
        name: argName,
        description: argConfig.description,
        type: argConfig.type,
        defaultValue: argConfig.defaultValue,
        deprecationReason: argConfig.deprecationReason,
        extensions: argConfig.extensions && toObjMap(argConfig.extensions),
        astNode: argConfig.astNode
      };
    });
  }
  var _proto = GraphQLDirective2.prototype;
  _proto.toConfig = function toConfig() {
    return {
      name: this.name,
      description: this.description,
      locations: this.locations,
      args: argsToArgsConfig(this.args),
      isRepeatable: this.isRepeatable,
      extensions: this.extensions,
      astNode: this.astNode
    };
  };
  _proto.toString = function toString3() {
    return "@" + this.name;
  };
  _proto.toJSON = function toJSON3() {
    return this.toString();
  };
  _createClass4(GraphQLDirective2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLDirective";
    }
  }]);
  return GraphQLDirective2;
}();
defineInspect(GraphQLDirective);
var GraphQLIncludeDirective = new GraphQLDirective({
  name: "include",
  description: "Directs the executor to include this field or fragment only when the `if` argument is true.",
  locations: [DirectiveLocation.FIELD, DirectiveLocation.FRAGMENT_SPREAD, DirectiveLocation.INLINE_FRAGMENT],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Included when true."
    }
  }
});
var GraphQLSkipDirective = new GraphQLDirective({
  name: "skip",
  description: "Directs the executor to skip this field or fragment when the `if` argument is true.",
  locations: [DirectiveLocation.FIELD, DirectiveLocation.FRAGMENT_SPREAD, DirectiveLocation.INLINE_FRAGMENT],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Skipped when true."
    }
  }
});
var DEFAULT_DEPRECATION_REASON = "No longer supported";
var GraphQLDeprecatedDirective = new GraphQLDirective({
  name: "deprecated",
  description: "Marks an element of a GraphQL schema as no longer supported.",
  locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.ARGUMENT_DEFINITION, DirectiveLocation.INPUT_FIELD_DEFINITION, DirectiveLocation.ENUM_VALUE],
  args: {
    reason: {
      type: GraphQLString,
      description: "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).",
      defaultValue: DEFAULT_DEPRECATION_REASON
    }
  }
});
var GraphQLSpecifiedByDirective = new GraphQLDirective({
  name: "specifiedBy",
  description: "Exposes a URL that specifies the behaviour of this scalar.",
  locations: [DirectiveLocation.SCALAR],
  args: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The URL that specifies the behaviour of this scalar."
    }
  }
});
var specifiedDirectives = Object.freeze([GraphQLIncludeDirective, GraphQLSkipDirective, GraphQLDeprecatedDirective, GraphQLSpecifiedByDirective]);

// node_modules/graphql/type/schema.mjs
function _defineProperties5(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass5(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties5(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties5(Constructor, staticProps);
  return Constructor;
}
var GraphQLSchema = function() {
  function GraphQLSchema2(config) {
    var _config$directives;
    this.__validationErrors = config.assumeValid === true ? [] : void 0;
    isObjectLike(config) || devAssert(0, "Must provide configuration object.");
    !config.types || Array.isArray(config.types) || devAssert(0, '"types" must be Array if provided but got: '.concat(inspect(config.types), "."));
    !config.directives || Array.isArray(config.directives) || devAssert(0, '"directives" must be Array if provided but got: ' + "".concat(inspect(config.directives), "."));
    this.description = config.description;
    this.extensions = config.extensions && toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this._queryType = config.query;
    this._mutationType = config.mutation;
    this._subscriptionType = config.subscription;
    this._directives = (_config$directives = config.directives) !== null && _config$directives !== void 0 ? _config$directives : specifiedDirectives;
    var allReferencedTypes = new Set(config.types);
    if (config.types != null) {
      for (var _i2 = 0, _config$types2 = config.types; _i2 < _config$types2.length; _i2++) {
        var type = _config$types2[_i2];
        allReferencedTypes.delete(type);
        collectReferencedTypes(type, allReferencedTypes);
      }
    }
    if (this._queryType != null) {
      collectReferencedTypes(this._queryType, allReferencedTypes);
    }
    if (this._mutationType != null) {
      collectReferencedTypes(this._mutationType, allReferencedTypes);
    }
    if (this._subscriptionType != null) {
      collectReferencedTypes(this._subscriptionType, allReferencedTypes);
    }
    for (var _i4 = 0, _this$_directives2 = this._directives; _i4 < _this$_directives2.length; _i4++) {
      var directive = _this$_directives2[_i4];
      if (isDirective(directive)) {
        for (var _i6 = 0, _directive$args2 = directive.args; _i6 < _directive$args2.length; _i6++) {
          var arg = _directive$args2[_i6];
          collectReferencedTypes(arg.type, allReferencedTypes);
        }
      }
    }
    collectReferencedTypes(__Schema, allReferencedTypes);
    this._typeMap = /* @__PURE__ */ Object.create(null);
    this._subTypeMap = /* @__PURE__ */ Object.create(null);
    this._implementationsMap = /* @__PURE__ */ Object.create(null);
    for (var _i8 = 0, _arrayFrom2 = arrayFrom_default(allReferencedTypes); _i8 < _arrayFrom2.length; _i8++) {
      var namedType = _arrayFrom2[_i8];
      if (namedType == null) {
        continue;
      }
      var typeName = namedType.name;
      typeName || devAssert(0, "One of the provided types for building the Schema is missing a name.");
      if (this._typeMap[typeName] !== void 0) {
        throw new Error('Schema must contain uniquely named types but contains multiple types named "'.concat(typeName, '".'));
      }
      this._typeMap[typeName] = namedType;
      if (isInterfaceType(namedType)) {
        for (var _i10 = 0, _namedType$getInterfa2 = namedType.getInterfaces(); _i10 < _namedType$getInterfa2.length; _i10++) {
          var iface = _namedType$getInterfa2[_i10];
          if (isInterfaceType(iface)) {
            var implementations = this._implementationsMap[iface.name];
            if (implementations === void 0) {
              implementations = this._implementationsMap[iface.name] = {
                objects: [],
                interfaces: []
              };
            }
            implementations.interfaces.push(namedType);
          }
        }
      } else if (isObjectType(namedType)) {
        for (var _i12 = 0, _namedType$getInterfa4 = namedType.getInterfaces(); _i12 < _namedType$getInterfa4.length; _i12++) {
          var _iface = _namedType$getInterfa4[_i12];
          if (isInterfaceType(_iface)) {
            var _implementations = this._implementationsMap[_iface.name];
            if (_implementations === void 0) {
              _implementations = this._implementationsMap[_iface.name] = {
                objects: [],
                interfaces: []
              };
            }
            _implementations.objects.push(namedType);
          }
        }
      }
    }
  }
  var _proto = GraphQLSchema2.prototype;
  _proto.getQueryType = function getQueryType() {
    return this._queryType;
  };
  _proto.getMutationType = function getMutationType() {
    return this._mutationType;
  };
  _proto.getSubscriptionType = function getSubscriptionType() {
    return this._subscriptionType;
  };
  _proto.getTypeMap = function getTypeMap() {
    return this._typeMap;
  };
  _proto.getType = function getType(name) {
    return this.getTypeMap()[name];
  };
  _proto.getPossibleTypes = function getPossibleTypes(abstractType) {
    return isUnionType(abstractType) ? abstractType.getTypes() : this.getImplementations(abstractType).objects;
  };
  _proto.getImplementations = function getImplementations(interfaceType) {
    var implementations = this._implementationsMap[interfaceType.name];
    return implementations !== null && implementations !== void 0 ? implementations : {
      objects: [],
      interfaces: []
    };
  };
  _proto.isPossibleType = function isPossibleType(abstractType, possibleType) {
    return this.isSubType(abstractType, possibleType);
  };
  _proto.isSubType = function isSubType(abstractType, maybeSubType) {
    var map2 = this._subTypeMap[abstractType.name];
    if (map2 === void 0) {
      map2 = /* @__PURE__ */ Object.create(null);
      if (isUnionType(abstractType)) {
        for (var _i14 = 0, _abstractType$getType2 = abstractType.getTypes(); _i14 < _abstractType$getType2.length; _i14++) {
          var type = _abstractType$getType2[_i14];
          map2[type.name] = true;
        }
      } else {
        var implementations = this.getImplementations(abstractType);
        for (var _i16 = 0, _implementations$obje2 = implementations.objects; _i16 < _implementations$obje2.length; _i16++) {
          var _type = _implementations$obje2[_i16];
          map2[_type.name] = true;
        }
        for (var _i18 = 0, _implementations$inte2 = implementations.interfaces; _i18 < _implementations$inte2.length; _i18++) {
          var _type2 = _implementations$inte2[_i18];
          map2[_type2.name] = true;
        }
      }
      this._subTypeMap[abstractType.name] = map2;
    }
    return map2[maybeSubType.name] !== void 0;
  };
  _proto.getDirectives = function getDirectives() {
    return this._directives;
  };
  _proto.getDirective = function getDirective(name) {
    return find_default(this.getDirectives(), function(directive) {
      return directive.name === name;
    });
  };
  _proto.toConfig = function toConfig() {
    var _this$extensionASTNod;
    return {
      description: this.description,
      query: this.getQueryType(),
      mutation: this.getMutationType(),
      subscription: this.getSubscriptionType(),
      types: objectValues_default(this.getTypeMap()),
      directives: this.getDirectives().slice(),
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: (_this$extensionASTNod = this.extensionASTNodes) !== null && _this$extensionASTNod !== void 0 ? _this$extensionASTNod : [],
      assumeValid: this.__validationErrors !== void 0
    };
  };
  _createClass5(GraphQLSchema2, [{
    key: SYMBOL_TO_STRING_TAG,
    get: function get5() {
      return "GraphQLSchema";
    }
  }]);
  return GraphQLSchema2;
}();
function collectReferencedTypes(type, typeSet) {
  var namedType = getNamedType(type);
  if (!typeSet.has(namedType)) {
    typeSet.add(namedType);
    if (isUnionType(namedType)) {
      for (var _i20 = 0, _namedType$getTypes2 = namedType.getTypes(); _i20 < _namedType$getTypes2.length; _i20++) {
        var memberType = _namedType$getTypes2[_i20];
        collectReferencedTypes(memberType, typeSet);
      }
    } else if (isObjectType(namedType) || isInterfaceType(namedType)) {
      for (var _i22 = 0, _namedType$getInterfa6 = namedType.getInterfaces(); _i22 < _namedType$getInterfa6.length; _i22++) {
        var interfaceType = _namedType$getInterfa6[_i22];
        collectReferencedTypes(interfaceType, typeSet);
      }
      for (var _i24 = 0, _objectValues2 = objectValues_default(namedType.getFields()); _i24 < _objectValues2.length; _i24++) {
        var field = _objectValues2[_i24];
        collectReferencedTypes(field.type, typeSet);
        for (var _i26 = 0, _field$args2 = field.args; _i26 < _field$args2.length; _i26++) {
          var arg = _field$args2[_i26];
          collectReferencedTypes(arg.type, typeSet);
        }
      }
    } else if (isInputObjectType(namedType)) {
      for (var _i28 = 0, _objectValues4 = objectValues_default(namedType.getFields()); _i28 < _objectValues4.length; _i28++) {
        var _field = _objectValues4[_i28];
        collectReferencedTypes(_field.type, typeSet);
      }
    }
  }
  return typeSet;
}

// node_modules/graphql/type/validate.mjs
var SchemaValidationContext = function() {
  function SchemaValidationContext2(schema2) {
    this._errors = [];
    this.schema = schema2;
  }
  var _proto = SchemaValidationContext2.prototype;
  _proto.reportError = function reportError(message, nodes) {
    var _nodes = Array.isArray(nodes) ? nodes.filter(Boolean) : nodes;
    this.addError(new GraphQLError(message, _nodes));
  };
  _proto.addError = function addError(error) {
    this._errors.push(error);
  };
  _proto.getErrors = function getErrors() {
    return this._errors;
  };
  return SchemaValidationContext2;
}();

// node_modules/graphql/utilities/typeFromAST.mjs
function typeFromAST(schema2, typeNode) {
  var innerType;
  if (typeNode.kind === Kind.LIST_TYPE) {
    innerType = typeFromAST(schema2, typeNode.type);
    return innerType && new GraphQLList(innerType);
  }
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    innerType = typeFromAST(schema2, typeNode.type);
    return innerType && new GraphQLNonNull(innerType);
  }
  if (typeNode.kind === Kind.NAMED_TYPE) {
    return schema2.getType(typeNode.name.value);
  }
  invariant(0, "Unexpected type node: " + inspect(typeNode));
}

// node_modules/graphql/utilities/TypeInfo.mjs
var TypeInfo = function() {
  function TypeInfo2(schema2, getFieldDefFn, initialType) {
    this._schema = schema2;
    this._typeStack = [];
    this._parentTypeStack = [];
    this._inputTypeStack = [];
    this._fieldDefStack = [];
    this._defaultValueStack = [];
    this._directive = null;
    this._argument = null;
    this._enumValue = null;
    this._getFieldDef = getFieldDefFn !== null && getFieldDefFn !== void 0 ? getFieldDefFn : getFieldDef;
    if (initialType) {
      if (isInputType(initialType)) {
        this._inputTypeStack.push(initialType);
      }
      if (isCompositeType(initialType)) {
        this._parentTypeStack.push(initialType);
      }
      if (isOutputType(initialType)) {
        this._typeStack.push(initialType);
      }
    }
  }
  var _proto = TypeInfo2.prototype;
  _proto.getType = function getType() {
    if (this._typeStack.length > 0) {
      return this._typeStack[this._typeStack.length - 1];
    }
  };
  _proto.getParentType = function getParentType() {
    if (this._parentTypeStack.length > 0) {
      return this._parentTypeStack[this._parentTypeStack.length - 1];
    }
  };
  _proto.getInputType = function getInputType() {
    if (this._inputTypeStack.length > 0) {
      return this._inputTypeStack[this._inputTypeStack.length - 1];
    }
  };
  _proto.getParentInputType = function getParentInputType() {
    if (this._inputTypeStack.length > 1) {
      return this._inputTypeStack[this._inputTypeStack.length - 2];
    }
  };
  _proto.getFieldDef = function getFieldDef3() {
    if (this._fieldDefStack.length > 0) {
      return this._fieldDefStack[this._fieldDefStack.length - 1];
    }
  };
  _proto.getDefaultValue = function getDefaultValue() {
    if (this._defaultValueStack.length > 0) {
      return this._defaultValueStack[this._defaultValueStack.length - 1];
    }
  };
  _proto.getDirective = function getDirective() {
    return this._directive;
  };
  _proto.getArgument = function getArgument() {
    return this._argument;
  };
  _proto.getEnumValue = function getEnumValue() {
    return this._enumValue;
  };
  _proto.enter = function enter(node) {
    var schema2 = this._schema;
    switch (node.kind) {
      case Kind.SELECTION_SET: {
        var namedType = getNamedType(this.getType());
        this._parentTypeStack.push(isCompositeType(namedType) ? namedType : void 0);
        break;
      }
      case Kind.FIELD: {
        var parentType = this.getParentType();
        var fieldDef;
        var fieldType;
        if (parentType) {
          fieldDef = this._getFieldDef(schema2, parentType, node);
          if (fieldDef) {
            fieldType = fieldDef.type;
          }
        }
        this._fieldDefStack.push(fieldDef);
        this._typeStack.push(isOutputType(fieldType) ? fieldType : void 0);
        break;
      }
      case Kind.DIRECTIVE:
        this._directive = schema2.getDirective(node.name.value);
        break;
      case Kind.OPERATION_DEFINITION: {
        var type;
        switch (node.operation) {
          case "query":
            type = schema2.getQueryType();
            break;
          case "mutation":
            type = schema2.getMutationType();
            break;
          case "subscription":
            type = schema2.getSubscriptionType();
            break;
        }
        this._typeStack.push(isObjectType(type) ? type : void 0);
        break;
      }
      case Kind.INLINE_FRAGMENT:
      case Kind.FRAGMENT_DEFINITION: {
        var typeConditionAST = node.typeCondition;
        var outputType = typeConditionAST ? typeFromAST(schema2, typeConditionAST) : getNamedType(this.getType());
        this._typeStack.push(isOutputType(outputType) ? outputType : void 0);
        break;
      }
      case Kind.VARIABLE_DEFINITION: {
        var inputType = typeFromAST(schema2, node.type);
        this._inputTypeStack.push(isInputType(inputType) ? inputType : void 0);
        break;
      }
      case Kind.ARGUMENT: {
        var _this$getDirective;
        var argDef;
        var argType;
        var fieldOrDirective = (_this$getDirective = this.getDirective()) !== null && _this$getDirective !== void 0 ? _this$getDirective : this.getFieldDef();
        if (fieldOrDirective) {
          argDef = find_default(fieldOrDirective.args, function(arg) {
            return arg.name === node.name.value;
          });
          if (argDef) {
            argType = argDef.type;
          }
        }
        this._argument = argDef;
        this._defaultValueStack.push(argDef ? argDef.defaultValue : void 0);
        this._inputTypeStack.push(isInputType(argType) ? argType : void 0);
        break;
      }
      case Kind.LIST: {
        var listType = getNullableType(this.getInputType());
        var itemType = isListType(listType) ? listType.ofType : listType;
        this._defaultValueStack.push(void 0);
        this._inputTypeStack.push(isInputType(itemType) ? itemType : void 0);
        break;
      }
      case Kind.OBJECT_FIELD: {
        var objectType = getNamedType(this.getInputType());
        var inputFieldType;
        var inputField;
        if (isInputObjectType(objectType)) {
          inputField = objectType.getFields()[node.name.value];
          if (inputField) {
            inputFieldType = inputField.type;
          }
        }
        this._defaultValueStack.push(inputField ? inputField.defaultValue : void 0);
        this._inputTypeStack.push(isInputType(inputFieldType) ? inputFieldType : void 0);
        break;
      }
      case Kind.ENUM: {
        var enumType = getNamedType(this.getInputType());
        var enumValue;
        if (isEnumType(enumType)) {
          enumValue = enumType.getValue(node.value);
        }
        this._enumValue = enumValue;
        break;
      }
    }
  };
  _proto.leave = function leave(node) {
    switch (node.kind) {
      case Kind.SELECTION_SET:
        this._parentTypeStack.pop();
        break;
      case Kind.FIELD:
        this._fieldDefStack.pop();
        this._typeStack.pop();
        break;
      case Kind.DIRECTIVE:
        this._directive = null;
        break;
      case Kind.OPERATION_DEFINITION:
      case Kind.INLINE_FRAGMENT:
      case Kind.FRAGMENT_DEFINITION:
        this._typeStack.pop();
        break;
      case Kind.VARIABLE_DEFINITION:
        this._inputTypeStack.pop();
        break;
      case Kind.ARGUMENT:
        this._argument = null;
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case Kind.LIST:
      case Kind.OBJECT_FIELD:
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case Kind.ENUM:
        this._enumValue = null;
        break;
    }
  };
  return TypeInfo2;
}();
function getFieldDef(schema2, parentType, fieldNode) {
  var name = fieldNode.name.value;
  if (name === SchemaMetaFieldDef.name && schema2.getQueryType() === parentType) {
    return SchemaMetaFieldDef;
  }
  if (name === TypeMetaFieldDef.name && schema2.getQueryType() === parentType) {
    return TypeMetaFieldDef;
  }
  if (name === TypeNameMetaFieldDef.name && isCompositeType(parentType)) {
    return TypeNameMetaFieldDef;
  }
  if (isObjectType(parentType) || isInterfaceType(parentType)) {
    return parentType.getFields()[name];
  }
}
function visitWithTypeInfo(typeInfo, visitor) {
  return {
    enter: function enter(node) {
      typeInfo.enter(node);
      var fn2 = getVisitFn(
        visitor,
        node.kind,
        /* isLeaving */
        false
      );
      if (fn2) {
        var result = fn2.apply(visitor, arguments);
        if (result !== void 0) {
          typeInfo.leave(node);
          if (isNode(result)) {
            typeInfo.enter(result);
          }
        }
        return result;
      }
    },
    leave: function leave(node) {
      var fn2 = getVisitFn(
        visitor,
        node.kind,
        /* isLeaving */
        true
      );
      var result;
      if (fn2) {
        result = fn2.apply(visitor, arguments);
      }
      typeInfo.leave(node);
      return result;
    }
  };
}

// node_modules/graphql/language/predicates.mjs
function isExecutableDefinitionNode(node) {
  return node.kind === Kind.OPERATION_DEFINITION || node.kind === Kind.FRAGMENT_DEFINITION;
}
function isTypeSystemDefinitionNode(node) {
  return node.kind === Kind.SCHEMA_DEFINITION || isTypeDefinitionNode(node) || node.kind === Kind.DIRECTIVE_DEFINITION;
}
function isTypeDefinitionNode(node) {
  return node.kind === Kind.SCALAR_TYPE_DEFINITION || node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INTERFACE_TYPE_DEFINITION || node.kind === Kind.UNION_TYPE_DEFINITION || node.kind === Kind.ENUM_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;
}
function isTypeSystemExtensionNode(node) {
  return node.kind === Kind.SCHEMA_EXTENSION || isTypeExtensionNode(node);
}
function isTypeExtensionNode(node) {
  return node.kind === Kind.SCALAR_TYPE_EXTENSION || node.kind === Kind.OBJECT_TYPE_EXTENSION || node.kind === Kind.INTERFACE_TYPE_EXTENSION || node.kind === Kind.UNION_TYPE_EXTENSION || node.kind === Kind.ENUM_TYPE_EXTENSION || node.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION;
}

// node_modules/graphql/validation/rules/ExecutableDefinitionsRule.mjs
function ExecutableDefinitionsRule(context) {
  return {
    Document: function Document2(node) {
      for (var _i2 = 0, _node$definitions2 = node.definitions; _i2 < _node$definitions2.length; _i2++) {
        var definition = _node$definitions2[_i2];
        if (!isExecutableDefinitionNode(definition)) {
          var defName = definition.kind === Kind.SCHEMA_DEFINITION || definition.kind === Kind.SCHEMA_EXTENSION ? "schema" : '"' + definition.name.value + '"';
          context.reportError(new GraphQLError("The ".concat(defName, " definition is not executable."), definition));
        }
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/UniqueOperationNamesRule.mjs
function UniqueOperationNamesRule(context) {
  var knownOperationNames = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: function OperationDefinition2(node) {
      var operationName = node.name;
      if (operationName) {
        if (knownOperationNames[operationName.value]) {
          context.reportError(new GraphQLError('There can be only one operation named "'.concat(operationName.value, '".'), [knownOperationNames[operationName.value], operationName]));
        } else {
          knownOperationNames[operationName.value] = operationName;
        }
      }
      return false;
    },
    FragmentDefinition: function FragmentDefinition2() {
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/LoneAnonymousOperationRule.mjs
function LoneAnonymousOperationRule(context) {
  var operationCount = 0;
  return {
    Document: function Document2(node) {
      operationCount = node.definitions.filter(function(definition) {
        return definition.kind === Kind.OPERATION_DEFINITION;
      }).length;
    },
    OperationDefinition: function OperationDefinition2(node) {
      if (!node.name && operationCount > 1) {
        context.reportError(new GraphQLError("This anonymous operation must be the only defined operation.", node));
      }
    }
  };
}

// node_modules/graphql/validation/rules/SingleFieldSubscriptionsRule.mjs
function SingleFieldSubscriptionsRule(context) {
  return {
    OperationDefinition: function OperationDefinition2(node) {
      if (node.operation === "subscription") {
        if (node.selectionSet.selections.length !== 1) {
          context.reportError(new GraphQLError(node.name ? 'Subscription "'.concat(node.name.value, '" must select only one top level field.') : "Anonymous Subscription must select only one top level field.", node.selectionSet.selections.slice(1)));
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/KnownTypeNamesRule.mjs
function KnownTypeNamesRule(context) {
  var schema2 = context.getSchema();
  var existingTypesMap = schema2 ? schema2.getTypeMap() : /* @__PURE__ */ Object.create(null);
  var definedTypes = /* @__PURE__ */ Object.create(null);
  for (var _i2 = 0, _context$getDocument$2 = context.getDocument().definitions; _i2 < _context$getDocument$2.length; _i2++) {
    var def = _context$getDocument$2[_i2];
    if (isTypeDefinitionNode(def)) {
      definedTypes[def.name.value] = true;
    }
  }
  var typeNames = Object.keys(existingTypesMap).concat(Object.keys(definedTypes));
  return {
    NamedType: function NamedType2(node, _1, parent, _2, ancestors) {
      var typeName = node.name.value;
      if (!existingTypesMap[typeName] && !definedTypes[typeName]) {
        var _ancestors$;
        var definitionNode = (_ancestors$ = ancestors[2]) !== null && _ancestors$ !== void 0 ? _ancestors$ : parent;
        var isSDL = definitionNode != null && isSDLNode(definitionNode);
        if (isSDL && isStandardTypeName(typeName)) {
          return;
        }
        var suggestedTypes = suggestionList(typeName, isSDL ? standardTypeNames.concat(typeNames) : typeNames);
        context.reportError(new GraphQLError('Unknown type "'.concat(typeName, '".') + didYouMean(suggestedTypes), node));
      }
    }
  };
}
var standardTypeNames = [].concat(specifiedScalarTypes, introspectionTypes).map(function(type) {
  return type.name;
});
function isStandardTypeName(typeName) {
  return standardTypeNames.indexOf(typeName) !== -1;
}
function isSDLNode(value) {
  return !Array.isArray(value) && (isTypeSystemDefinitionNode(value) || isTypeSystemExtensionNode(value));
}

// node_modules/graphql/validation/rules/FragmentsOnCompositeTypesRule.mjs
function FragmentsOnCompositeTypesRule(context) {
  return {
    InlineFragment: function InlineFragment2(node) {
      var typeCondition = node.typeCondition;
      if (typeCondition) {
        var type = typeFromAST(context.getSchema(), typeCondition);
        if (type && !isCompositeType(type)) {
          var typeStr = print(typeCondition);
          context.reportError(new GraphQLError('Fragment cannot condition on non composite type "'.concat(typeStr, '".'), typeCondition));
        }
      }
    },
    FragmentDefinition: function FragmentDefinition2(node) {
      var type = typeFromAST(context.getSchema(), node.typeCondition);
      if (type && !isCompositeType(type)) {
        var typeStr = print(node.typeCondition);
        context.reportError(new GraphQLError('Fragment "'.concat(node.name.value, '" cannot condition on non composite type "').concat(typeStr, '".'), node.typeCondition));
      }
    }
  };
}

// node_modules/graphql/validation/rules/VariablesAreInputTypesRule.mjs
function VariablesAreInputTypesRule(context) {
  return {
    VariableDefinition: function VariableDefinition2(node) {
      var type = typeFromAST(context.getSchema(), node.type);
      if (type && !isInputType(type)) {
        var variableName = node.variable.name.value;
        var typeName = print(node.type);
        context.reportError(new GraphQLError('Variable "$'.concat(variableName, '" cannot be non-input type "').concat(typeName, '".'), node.type));
      }
    }
  };
}

// node_modules/graphql/validation/rules/ScalarLeafsRule.mjs
function ScalarLeafsRule(context) {
  return {
    Field: function Field2(node) {
      var type = context.getType();
      var selectionSet = node.selectionSet;
      if (type) {
        if (isLeafType(getNamedType(type))) {
          if (selectionSet) {
            var fieldName = node.name.value;
            var typeStr = inspect(type);
            context.reportError(new GraphQLError('Field "'.concat(fieldName, '" must not have a selection since type "').concat(typeStr, '" has no subfields.'), selectionSet));
          }
        } else if (!selectionSet) {
          var _fieldName = node.name.value;
          var _typeStr = inspect(type);
          context.reportError(new GraphQLError('Field "'.concat(_fieldName, '" of type "').concat(_typeStr, '" must have a selection of subfields. Did you mean "').concat(_fieldName, ' { ... }"?'), node));
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/FieldsOnCorrectTypeRule.mjs
function FieldsOnCorrectTypeRule(context) {
  return {
    Field: function Field2(node) {
      var type = context.getParentType();
      if (type) {
        var fieldDef = context.getFieldDef();
        if (!fieldDef) {
          var schema2 = context.getSchema();
          var fieldName = node.name.value;
          var suggestion = didYouMean("to use an inline fragment on", getSuggestedTypeNames(schema2, type, fieldName));
          if (suggestion === "") {
            suggestion = didYouMean(getSuggestedFieldNames(type, fieldName));
          }
          context.reportError(new GraphQLError('Cannot query field "'.concat(fieldName, '" on type "').concat(type.name, '".') + suggestion, node));
        }
      }
    }
  };
}
function getSuggestedTypeNames(schema2, type, fieldName) {
  if (!isAbstractType(type)) {
    return [];
  }
  var suggestedTypes = /* @__PURE__ */ new Set();
  var usageCount = /* @__PURE__ */ Object.create(null);
  for (var _i2 = 0, _schema$getPossibleTy2 = schema2.getPossibleTypes(type); _i2 < _schema$getPossibleTy2.length; _i2++) {
    var possibleType = _schema$getPossibleTy2[_i2];
    if (!possibleType.getFields()[fieldName]) {
      continue;
    }
    suggestedTypes.add(possibleType);
    usageCount[possibleType.name] = 1;
    for (var _i4 = 0, _possibleType$getInte2 = possibleType.getInterfaces(); _i4 < _possibleType$getInte2.length; _i4++) {
      var _usageCount$possibleI;
      var possibleInterface = _possibleType$getInte2[_i4];
      if (!possibleInterface.getFields()[fieldName]) {
        continue;
      }
      suggestedTypes.add(possibleInterface);
      usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== void 0 ? _usageCount$possibleI : 0) + 1;
    }
  }
  return arrayFrom_default(suggestedTypes).sort(function(typeA, typeB) {
    var usageCountDiff = usageCount[typeB.name] - usageCount[typeA.name];
    if (usageCountDiff !== 0) {
      return usageCountDiff;
    }
    if (isInterfaceType(typeA) && schema2.isSubType(typeA, typeB)) {
      return -1;
    }
    if (isInterfaceType(typeB) && schema2.isSubType(typeB, typeA)) {
      return 1;
    }
    return naturalCompare(typeA.name, typeB.name);
  }).map(function(x2) {
    return x2.name;
  });
}
function getSuggestedFieldNames(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type)) {
    var possibleFieldNames = Object.keys(type.getFields());
    return suggestionList(fieldName, possibleFieldNames);
  }
  return [];
}

// node_modules/graphql/validation/rules/UniqueFragmentNamesRule.mjs
function UniqueFragmentNamesRule(context) {
  var knownFragmentNames = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: function OperationDefinition2() {
      return false;
    },
    FragmentDefinition: function FragmentDefinition2(node) {
      var fragmentName = node.name.value;
      if (knownFragmentNames[fragmentName]) {
        context.reportError(new GraphQLError('There can be only one fragment named "'.concat(fragmentName, '".'), [knownFragmentNames[fragmentName], node.name]));
      } else {
        knownFragmentNames[fragmentName] = node.name;
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/KnownFragmentNamesRule.mjs
function KnownFragmentNamesRule(context) {
  return {
    FragmentSpread: function FragmentSpread2(node) {
      var fragmentName = node.name.value;
      var fragment = context.getFragment(fragmentName);
      if (!fragment) {
        context.reportError(new GraphQLError('Unknown fragment "'.concat(fragmentName, '".'), node.name));
      }
    }
  };
}

// node_modules/graphql/validation/rules/NoUnusedFragmentsRule.mjs
function NoUnusedFragmentsRule(context) {
  var operationDefs = [];
  var fragmentDefs = [];
  return {
    OperationDefinition: function OperationDefinition2(node) {
      operationDefs.push(node);
      return false;
    },
    FragmentDefinition: function FragmentDefinition2(node) {
      fragmentDefs.push(node);
      return false;
    },
    Document: {
      leave: function leave() {
        var fragmentNameUsed = /* @__PURE__ */ Object.create(null);
        for (var _i2 = 0; _i2 < operationDefs.length; _i2++) {
          var operation = operationDefs[_i2];
          for (var _i4 = 0, _context$getRecursive2 = context.getRecursivelyReferencedFragments(operation); _i4 < _context$getRecursive2.length; _i4++) {
            var fragment = _context$getRecursive2[_i4];
            fragmentNameUsed[fragment.name.value] = true;
          }
        }
        for (var _i6 = 0; _i6 < fragmentDefs.length; _i6++) {
          var fragmentDef = fragmentDefs[_i6];
          var fragName = fragmentDef.name.value;
          if (fragmentNameUsed[fragName] !== true) {
            context.reportError(new GraphQLError('Fragment "'.concat(fragName, '" is never used.'), fragmentDef));
          }
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/PossibleFragmentSpreadsRule.mjs
function PossibleFragmentSpreadsRule(context) {
  return {
    InlineFragment: function InlineFragment2(node) {
      var fragType = context.getType();
      var parentType = context.getParentType();
      if (isCompositeType(fragType) && isCompositeType(parentType) && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        var parentTypeStr = inspect(parentType);
        var fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError('Fragment cannot be spread here as objects of type "'.concat(parentTypeStr, '" can never be of type "').concat(fragTypeStr, '".'), node));
      }
    },
    FragmentSpread: function FragmentSpread2(node) {
      var fragName = node.name.value;
      var fragType = getFragmentType(context, fragName);
      var parentType = context.getParentType();
      if (fragType && parentType && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        var parentTypeStr = inspect(parentType);
        var fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError('Fragment "'.concat(fragName, '" cannot be spread here as objects of type "').concat(parentTypeStr, '" can never be of type "').concat(fragTypeStr, '".'), node));
      }
    }
  };
}
function getFragmentType(context, name) {
  var frag = context.getFragment(name);
  if (frag) {
    var type = typeFromAST(context.getSchema(), frag.typeCondition);
    if (isCompositeType(type)) {
      return type;
    }
  }
}

// node_modules/graphql/validation/rules/NoFragmentCyclesRule.mjs
function NoFragmentCyclesRule(context) {
  var visitedFrags = /* @__PURE__ */ Object.create(null);
  var spreadPath = [];
  var spreadPathIndexByName = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: function OperationDefinition2() {
      return false;
    },
    FragmentDefinition: function FragmentDefinition2(node) {
      detectCycleRecursive(node);
      return false;
    }
  };
  function detectCycleRecursive(fragment) {
    if (visitedFrags[fragment.name.value]) {
      return;
    }
    var fragmentName = fragment.name.value;
    visitedFrags[fragmentName] = true;
    var spreadNodes = context.getFragmentSpreads(fragment.selectionSet);
    if (spreadNodes.length === 0) {
      return;
    }
    spreadPathIndexByName[fragmentName] = spreadPath.length;
    for (var _i2 = 0; _i2 < spreadNodes.length; _i2++) {
      var spreadNode = spreadNodes[_i2];
      var spreadName = spreadNode.name.value;
      var cycleIndex = spreadPathIndexByName[spreadName];
      spreadPath.push(spreadNode);
      if (cycleIndex === void 0) {
        var spreadFragment = context.getFragment(spreadName);
        if (spreadFragment) {
          detectCycleRecursive(spreadFragment);
        }
      } else {
        var cyclePath = spreadPath.slice(cycleIndex);
        var viaPath = cyclePath.slice(0, -1).map(function(s2) {
          return '"' + s2.name.value + '"';
        }).join(", ");
        context.reportError(new GraphQLError('Cannot spread fragment "'.concat(spreadName, '" within itself') + (viaPath !== "" ? " via ".concat(viaPath, ".") : "."), cyclePath));
      }
      spreadPath.pop();
    }
    spreadPathIndexByName[fragmentName] = void 0;
  }
}

// node_modules/graphql/validation/rules/UniqueVariableNamesRule.mjs
function UniqueVariableNamesRule(context) {
  var knownVariableNames = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: function OperationDefinition2() {
      knownVariableNames = /* @__PURE__ */ Object.create(null);
    },
    VariableDefinition: function VariableDefinition2(node) {
      var variableName = node.variable.name.value;
      if (knownVariableNames[variableName]) {
        context.reportError(new GraphQLError('There can be only one variable named "$'.concat(variableName, '".'), [knownVariableNames[variableName], node.variable.name]));
      } else {
        knownVariableNames[variableName] = node.variable.name;
      }
    }
  };
}

// node_modules/graphql/validation/rules/NoUndefinedVariablesRule.mjs
function NoUndefinedVariablesRule(context) {
  var variableNameDefined = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: {
      enter: function enter() {
        variableNameDefined = /* @__PURE__ */ Object.create(null);
      },
      leave: function leave(operation) {
        var usages = context.getRecursiveVariableUsages(operation);
        for (var _i2 = 0; _i2 < usages.length; _i2++) {
          var _ref2 = usages[_i2];
          var node = _ref2.node;
          var varName = node.name.value;
          if (variableNameDefined[varName] !== true) {
            context.reportError(new GraphQLError(operation.name ? 'Variable "$'.concat(varName, '" is not defined by operation "').concat(operation.name.value, '".') : 'Variable "$'.concat(varName, '" is not defined.'), [node, operation]));
          }
        }
      }
    },
    VariableDefinition: function VariableDefinition2(node) {
      variableNameDefined[node.variable.name.value] = true;
    }
  };
}

// node_modules/graphql/validation/rules/NoUnusedVariablesRule.mjs
function NoUnusedVariablesRule(context) {
  var variableDefs = [];
  return {
    OperationDefinition: {
      enter: function enter() {
        variableDefs = [];
      },
      leave: function leave(operation) {
        var variableNameUsed = /* @__PURE__ */ Object.create(null);
        var usages = context.getRecursiveVariableUsages(operation);
        for (var _i2 = 0; _i2 < usages.length; _i2++) {
          var _ref2 = usages[_i2];
          var node = _ref2.node;
          variableNameUsed[node.name.value] = true;
        }
        for (var _i4 = 0, _variableDefs2 = variableDefs; _i4 < _variableDefs2.length; _i4++) {
          var variableDef = _variableDefs2[_i4];
          var variableName = variableDef.variable.name.value;
          if (variableNameUsed[variableName] !== true) {
            context.reportError(new GraphQLError(operation.name ? 'Variable "$'.concat(variableName, '" is never used in operation "').concat(operation.name.value, '".') : 'Variable "$'.concat(variableName, '" is never used.'), variableDef));
          }
        }
      }
    },
    VariableDefinition: function VariableDefinition2(def) {
      variableDefs.push(def);
    }
  };
}

// node_modules/graphql/validation/rules/KnownDirectivesRule.mjs
function KnownDirectivesRule(context) {
  var locationsMap = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  var definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (var _i2 = 0; _i2 < definedDirectives.length; _i2++) {
    var directive = definedDirectives[_i2];
    locationsMap[directive.name] = directive.locations;
  }
  var astDefinitions = context.getDocument().definitions;
  for (var _i4 = 0; _i4 < astDefinitions.length; _i4++) {
    var def = astDefinitions[_i4];
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      locationsMap[def.name.value] = def.locations.map(function(name) {
        return name.value;
      });
    }
  }
  return {
    Directive: function Directive2(node, _key, _parent, _path, ancestors) {
      var name = node.name.value;
      var locations = locationsMap[name];
      if (!locations) {
        context.reportError(new GraphQLError('Unknown directive "@'.concat(name, '".'), node));
        return;
      }
      var candidateLocation = getDirectiveLocationForASTPath(ancestors);
      if (candidateLocation && locations.indexOf(candidateLocation) === -1) {
        context.reportError(new GraphQLError('Directive "@'.concat(name, '" may not be used on ').concat(candidateLocation, "."), node));
      }
    }
  };
}
function getDirectiveLocationForASTPath(ancestors) {
  var appliedTo = ancestors[ancestors.length - 1];
  !Array.isArray(appliedTo) || invariant(0);
  switch (appliedTo.kind) {
    case Kind.OPERATION_DEFINITION:
      return getDirectiveLocationForOperation(appliedTo.operation);
    case Kind.FIELD:
      return DirectiveLocation.FIELD;
    case Kind.FRAGMENT_SPREAD:
      return DirectiveLocation.FRAGMENT_SPREAD;
    case Kind.INLINE_FRAGMENT:
      return DirectiveLocation.INLINE_FRAGMENT;
    case Kind.FRAGMENT_DEFINITION:
      return DirectiveLocation.FRAGMENT_DEFINITION;
    case Kind.VARIABLE_DEFINITION:
      return DirectiveLocation.VARIABLE_DEFINITION;
    case Kind.SCHEMA_DEFINITION:
    case Kind.SCHEMA_EXTENSION:
      return DirectiveLocation.SCHEMA;
    case Kind.SCALAR_TYPE_DEFINITION:
    case Kind.SCALAR_TYPE_EXTENSION:
      return DirectiveLocation.SCALAR;
    case Kind.OBJECT_TYPE_DEFINITION:
    case Kind.OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.OBJECT;
    case Kind.FIELD_DEFINITION:
      return DirectiveLocation.FIELD_DEFINITION;
    case Kind.INTERFACE_TYPE_DEFINITION:
    case Kind.INTERFACE_TYPE_EXTENSION:
      return DirectiveLocation.INTERFACE;
    case Kind.UNION_TYPE_DEFINITION:
    case Kind.UNION_TYPE_EXTENSION:
      return DirectiveLocation.UNION;
    case Kind.ENUM_TYPE_DEFINITION:
    case Kind.ENUM_TYPE_EXTENSION:
      return DirectiveLocation.ENUM;
    case Kind.ENUM_VALUE_DEFINITION:
      return DirectiveLocation.ENUM_VALUE;
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
    case Kind.INPUT_OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.INPUT_OBJECT;
    case Kind.INPUT_VALUE_DEFINITION: {
      var parentNode = ancestors[ancestors.length - 3];
      return parentNode.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ? DirectiveLocation.INPUT_FIELD_DEFINITION : DirectiveLocation.ARGUMENT_DEFINITION;
    }
  }
}
function getDirectiveLocationForOperation(operation) {
  switch (operation) {
    case "query":
      return DirectiveLocation.QUERY;
    case "mutation":
      return DirectiveLocation.MUTATION;
    case "subscription":
      return DirectiveLocation.SUBSCRIPTION;
  }
  invariant(0, "Unexpected operation: " + inspect(operation));
}

// node_modules/graphql/validation/rules/UniqueDirectivesPerLocationRule.mjs
function UniqueDirectivesPerLocationRule(context) {
  var uniqueDirectiveMap = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  var definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (var _i2 = 0; _i2 < definedDirectives.length; _i2++) {
    var directive = definedDirectives[_i2];
    uniqueDirectiveMap[directive.name] = !directive.isRepeatable;
  }
  var astDefinitions = context.getDocument().definitions;
  for (var _i4 = 0; _i4 < astDefinitions.length; _i4++) {
    var def = astDefinitions[_i4];
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      uniqueDirectiveMap[def.name.value] = !def.repeatable;
    }
  }
  var schemaDirectives = /* @__PURE__ */ Object.create(null);
  var typeDirectivesMap = /* @__PURE__ */ Object.create(null);
  return {
    // Many different AST nodes may contain directives. Rather than listing
    // them all, just listen for entering any node, and check to see if it
    // defines any directives.
    enter: function enter(node) {
      if (node.directives == null) {
        return;
      }
      var seenDirectives;
      if (node.kind === Kind.SCHEMA_DEFINITION || node.kind === Kind.SCHEMA_EXTENSION) {
        seenDirectives = schemaDirectives;
      } else if (isTypeDefinitionNode(node) || isTypeExtensionNode(node)) {
        var typeName = node.name.value;
        seenDirectives = typeDirectivesMap[typeName];
        if (seenDirectives === void 0) {
          typeDirectivesMap[typeName] = seenDirectives = /* @__PURE__ */ Object.create(null);
        }
      } else {
        seenDirectives = /* @__PURE__ */ Object.create(null);
      }
      for (var _i6 = 0, _node$directives2 = node.directives; _i6 < _node$directives2.length; _i6++) {
        var _directive = _node$directives2[_i6];
        var directiveName = _directive.name.value;
        if (uniqueDirectiveMap[directiveName]) {
          if (seenDirectives[directiveName]) {
            context.reportError(new GraphQLError('The directive "@'.concat(directiveName, '" can only be used once at this location.'), [seenDirectives[directiveName], _directive]));
          } else {
            seenDirectives[directiveName] = _directive;
          }
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/KnownArgumentNamesRule.mjs
function ownKeys2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys2(Object(source), true).forEach(function(key) {
        _defineProperty2(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys2(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function KnownArgumentNamesRule(context) {
  return _objectSpread2(_objectSpread2({}, KnownArgumentNamesOnDirectivesRule(context)), {}, {
    Argument: function Argument2(argNode) {
      var argDef = context.getArgument();
      var fieldDef = context.getFieldDef();
      var parentType = context.getParentType();
      if (!argDef && fieldDef && parentType) {
        var argName = argNode.name.value;
        var knownArgsNames = fieldDef.args.map(function(arg) {
          return arg.name;
        });
        var suggestions = suggestionList(argName, knownArgsNames);
        context.reportError(new GraphQLError('Unknown argument "'.concat(argName, '" on field "').concat(parentType.name, ".").concat(fieldDef.name, '".') + didYouMean(suggestions), argNode));
      }
    }
  });
}
function KnownArgumentNamesOnDirectivesRule(context) {
  var directiveArgs = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  var definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (var _i2 = 0; _i2 < definedDirectives.length; _i2++) {
    var directive = definedDirectives[_i2];
    directiveArgs[directive.name] = directive.args.map(function(arg) {
      return arg.name;
    });
  }
  var astDefinitions = context.getDocument().definitions;
  for (var _i4 = 0; _i4 < astDefinitions.length; _i4++) {
    var def = astDefinitions[_i4];
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      var _def$arguments;
      var argsNodes = (_def$arguments = def.arguments) !== null && _def$arguments !== void 0 ? _def$arguments : [];
      directiveArgs[def.name.value] = argsNodes.map(function(arg) {
        return arg.name.value;
      });
    }
  }
  return {
    Directive: function Directive2(directiveNode) {
      var directiveName = directiveNode.name.value;
      var knownArgs = directiveArgs[directiveName];
      if (directiveNode.arguments && knownArgs) {
        for (var _i6 = 0, _directiveNode$argume2 = directiveNode.arguments; _i6 < _directiveNode$argume2.length; _i6++) {
          var argNode = _directiveNode$argume2[_i6];
          var argName = argNode.name.value;
          if (knownArgs.indexOf(argName) === -1) {
            var suggestions = suggestionList(argName, knownArgs);
            context.reportError(new GraphQLError('Unknown argument "'.concat(argName, '" on directive "@').concat(directiveName, '".') + didYouMean(suggestions), argNode));
          }
        }
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/UniqueArgumentNamesRule.mjs
function UniqueArgumentNamesRule(context) {
  var knownArgNames = /* @__PURE__ */ Object.create(null);
  return {
    Field: function Field2() {
      knownArgNames = /* @__PURE__ */ Object.create(null);
    },
    Directive: function Directive2() {
      knownArgNames = /* @__PURE__ */ Object.create(null);
    },
    Argument: function Argument2(node) {
      var argName = node.name.value;
      if (knownArgNames[argName]) {
        context.reportError(new GraphQLError('There can be only one argument named "'.concat(argName, '".'), [knownArgNames[argName], node.name]));
      } else {
        knownArgNames[argName] = node.name;
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/ValuesOfCorrectTypeRule.mjs
function ValuesOfCorrectTypeRule(context) {
  return {
    ListValue: function ListValue2(node) {
      var type = getNullableType(context.getParentInputType());
      if (!isListType(type)) {
        isValidValueNode(context, node);
        return false;
      }
    },
    ObjectValue: function ObjectValue2(node) {
      var type = getNamedType(context.getInputType());
      if (!isInputObjectType(type)) {
        isValidValueNode(context, node);
        return false;
      }
      var fieldNodeMap = keyMap(node.fields, function(field) {
        return field.name.value;
      });
      for (var _i2 = 0, _objectValues2 = objectValues_default(type.getFields()); _i2 < _objectValues2.length; _i2++) {
        var fieldDef = _objectValues2[_i2];
        var fieldNode = fieldNodeMap[fieldDef.name];
        if (!fieldNode && isRequiredInputField(fieldDef)) {
          var typeStr = inspect(fieldDef.type);
          context.reportError(new GraphQLError('Field "'.concat(type.name, ".").concat(fieldDef.name, '" of required type "').concat(typeStr, '" was not provided.'), node));
        }
      }
    },
    ObjectField: function ObjectField2(node) {
      var parentType = getNamedType(context.getParentInputType());
      var fieldType = context.getInputType();
      if (!fieldType && isInputObjectType(parentType)) {
        var suggestions = suggestionList(node.name.value, Object.keys(parentType.getFields()));
        context.reportError(new GraphQLError('Field "'.concat(node.name.value, '" is not defined by type "').concat(parentType.name, '".') + didYouMean(suggestions), node));
      }
    },
    NullValue: function NullValue2(node) {
      var type = context.getInputType();
      if (isNonNullType(type)) {
        context.reportError(new GraphQLError('Expected value of type "'.concat(inspect(type), '", found ').concat(print(node), "."), node));
      }
    },
    EnumValue: function EnumValue2(node) {
      return isValidValueNode(context, node);
    },
    IntValue: function IntValue2(node) {
      return isValidValueNode(context, node);
    },
    FloatValue: function FloatValue2(node) {
      return isValidValueNode(context, node);
    },
    StringValue: function StringValue2(node) {
      return isValidValueNode(context, node);
    },
    BooleanValue: function BooleanValue2(node) {
      return isValidValueNode(context, node);
    }
  };
}
function isValidValueNode(context, node) {
  var locationType = context.getInputType();
  if (!locationType) {
    return;
  }
  var type = getNamedType(locationType);
  if (!isLeafType(type)) {
    var typeStr = inspect(locationType);
    context.reportError(new GraphQLError('Expected value of type "'.concat(typeStr, '", found ').concat(print(node), "."), node));
    return;
  }
  try {
    var parseResult = type.parseLiteral(
      node,
      void 0
      /* variables */
    );
    if (parseResult === void 0) {
      var _typeStr = inspect(locationType);
      context.reportError(new GraphQLError('Expected value of type "'.concat(_typeStr, '", found ').concat(print(node), "."), node));
    }
  } catch (error) {
    var _typeStr2 = inspect(locationType);
    if (error instanceof GraphQLError) {
      context.reportError(error);
    } else {
      context.reportError(new GraphQLError('Expected value of type "'.concat(_typeStr2, '", found ').concat(print(node), "; ") + error.message, node, void 0, void 0, void 0, error));
    }
  }
}

// node_modules/graphql/validation/rules/ProvidedRequiredArgumentsRule.mjs
function ownKeys3(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread3(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    if (i2 % 2) {
      ownKeys3(Object(source), true).forEach(function(key) {
        _defineProperty3(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys3(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _defineProperty3(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ProvidedRequiredArgumentsRule(context) {
  return _objectSpread3(_objectSpread3({}, ProvidedRequiredArgumentsOnDirectivesRule(context)), {}, {
    Field: {
      // Validate on leave to allow for deeper errors to appear first.
      leave: function leave(fieldNode) {
        var _fieldNode$arguments;
        var fieldDef = context.getFieldDef();
        if (!fieldDef) {
          return false;
        }
        var argNodes = (_fieldNode$arguments = fieldNode.arguments) !== null && _fieldNode$arguments !== void 0 ? _fieldNode$arguments : [];
        var argNodeMap = keyMap(argNodes, function(arg) {
          return arg.name.value;
        });
        for (var _i2 = 0, _fieldDef$args2 = fieldDef.args; _i2 < _fieldDef$args2.length; _i2++) {
          var argDef = _fieldDef$args2[_i2];
          var argNode = argNodeMap[argDef.name];
          if (!argNode && isRequiredArgument(argDef)) {
            var argTypeStr = inspect(argDef.type);
            context.reportError(new GraphQLError('Field "'.concat(fieldDef.name, '" argument "').concat(argDef.name, '" of type "').concat(argTypeStr, '" is required, but it was not provided.'), fieldNode));
          }
        }
      }
    }
  });
}
function ProvidedRequiredArgumentsOnDirectivesRule(context) {
  var requiredArgsMap = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  var definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (var _i4 = 0; _i4 < definedDirectives.length; _i4++) {
    var directive = definedDirectives[_i4];
    requiredArgsMap[directive.name] = keyMap(directive.args.filter(isRequiredArgument), function(arg) {
      return arg.name;
    });
  }
  var astDefinitions = context.getDocument().definitions;
  for (var _i6 = 0; _i6 < astDefinitions.length; _i6++) {
    var def = astDefinitions[_i6];
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      var _def$arguments;
      var argNodes = (_def$arguments = def.arguments) !== null && _def$arguments !== void 0 ? _def$arguments : [];
      requiredArgsMap[def.name.value] = keyMap(argNodes.filter(isRequiredArgumentNode), function(arg) {
        return arg.name.value;
      });
    }
  }
  return {
    Directive: {
      // Validate on leave to allow for deeper errors to appear first.
      leave: function leave(directiveNode) {
        var directiveName = directiveNode.name.value;
        var requiredArgs = requiredArgsMap[directiveName];
        if (requiredArgs) {
          var _directiveNode$argume;
          var _argNodes = (_directiveNode$argume = directiveNode.arguments) !== null && _directiveNode$argume !== void 0 ? _directiveNode$argume : [];
          var argNodeMap = keyMap(_argNodes, function(arg) {
            return arg.name.value;
          });
          for (var _i8 = 0, _Object$keys2 = Object.keys(requiredArgs); _i8 < _Object$keys2.length; _i8++) {
            var argName = _Object$keys2[_i8];
            if (!argNodeMap[argName]) {
              var argType = requiredArgs[argName].type;
              var argTypeStr = isType(argType) ? inspect(argType) : print(argType);
              context.reportError(new GraphQLError('Directive "@'.concat(directiveName, '" argument "').concat(argName, '" of type "').concat(argTypeStr, '" is required, but it was not provided.'), directiveNode));
            }
          }
        }
      }
    }
  };
}
function isRequiredArgumentNode(arg) {
  return arg.type.kind === Kind.NON_NULL_TYPE && arg.defaultValue == null;
}

// node_modules/graphql/validation/rules/VariablesInAllowedPositionRule.mjs
function VariablesInAllowedPositionRule(context) {
  var varDefMap = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: {
      enter: function enter() {
        varDefMap = /* @__PURE__ */ Object.create(null);
      },
      leave: function leave(operation) {
        var usages = context.getRecursiveVariableUsages(operation);
        for (var _i2 = 0; _i2 < usages.length; _i2++) {
          var _ref2 = usages[_i2];
          var node = _ref2.node;
          var type = _ref2.type;
          var defaultValue = _ref2.defaultValue;
          var varName = node.name.value;
          var varDef = varDefMap[varName];
          if (varDef && type) {
            var schema2 = context.getSchema();
            var varType = typeFromAST(schema2, varDef.type);
            if (varType && !allowedVariableUsage(schema2, varType, varDef.defaultValue, type, defaultValue)) {
              var varTypeStr = inspect(varType);
              var typeStr = inspect(type);
              context.reportError(new GraphQLError('Variable "$'.concat(varName, '" of type "').concat(varTypeStr, '" used in position expecting type "').concat(typeStr, '".'), [varDef, node]));
            }
          }
        }
      }
    },
    VariableDefinition: function VariableDefinition2(node) {
      varDefMap[node.variable.name.value] = node;
    }
  };
}
function allowedVariableUsage(schema2, varType, varDefaultValue, locationType, locationDefaultValue) {
  if (isNonNullType(locationType) && !isNonNullType(varType)) {
    var hasNonNullVariableDefaultValue = varDefaultValue != null && varDefaultValue.kind !== Kind.NULL;
    var hasLocationDefaultValue = locationDefaultValue !== void 0;
    if (!hasNonNullVariableDefaultValue && !hasLocationDefaultValue) {
      return false;
    }
    var nullableLocationType = locationType.ofType;
    return isTypeSubTypeOf(schema2, varType, nullableLocationType);
  }
  return isTypeSubTypeOf(schema2, varType, locationType);
}

// node_modules/graphql/validation/rules/OverlappingFieldsCanBeMergedRule.mjs
function reasonMessage(reason) {
  if (Array.isArray(reason)) {
    return reason.map(function(_ref) {
      var responseName = _ref[0], subReason = _ref[1];
      return 'subfields "'.concat(responseName, '" conflict because ') + reasonMessage(subReason);
    }).join(" and ");
  }
  return reason;
}
function OverlappingFieldsCanBeMergedRule(context) {
  var comparedFragmentPairs = new PairSet();
  var cachedFieldsAndFragmentNames = /* @__PURE__ */ new Map();
  return {
    SelectionSet: function SelectionSet2(selectionSet) {
      var conflicts = findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, context.getParentType(), selectionSet);
      for (var _i2 = 0; _i2 < conflicts.length; _i2++) {
        var _ref3 = conflicts[_i2];
        var _ref2$ = _ref3[0];
        var responseName = _ref2$[0];
        var reason = _ref2$[1];
        var fields1 = _ref3[1];
        var fields22 = _ref3[2];
        var reasonMsg = reasonMessage(reason);
        context.reportError(new GraphQLError('Fields "'.concat(responseName, '" conflict because ').concat(reasonMsg, ". Use different aliases on the fields to fetch both if this was intentional."), fields1.concat(fields22)));
      }
    }
  };
}
function findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentType, selectionSet) {
  var conflicts = [];
  var _getFieldsAndFragment = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet), fieldMap = _getFieldsAndFragment[0], fragmentNames = _getFieldsAndFragment[1];
  collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, fieldMap);
  if (fragmentNames.length !== 0) {
    for (var i2 = 0; i2 < fragmentNames.length; i2++) {
      collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, false, fieldMap, fragmentNames[i2]);
      for (var j2 = i2 + 1; j2 < fragmentNames.length; j2++) {
        collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, false, fragmentNames[i2], fragmentNames[j2]);
      }
    }
  }
  return conflicts;
}
function collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentName) {
  var fragment = context.getFragment(fragmentName);
  if (!fragment) {
    return;
  }
  var _getReferencedFieldsA = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment), fieldMap2 = _getReferencedFieldsA[0], fragmentNames2 = _getReferencedFieldsA[1];
  if (fieldMap === fieldMap2) {
    return;
  }
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fieldMap2);
  for (var i2 = 0; i2 < fragmentNames2.length; i2++) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentNames2[i2]);
  }
}
function collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentName2) {
  if (fragmentName1 === fragmentName2) {
    return;
  }
  if (comparedFragmentPairs.has(fragmentName1, fragmentName2, areMutuallyExclusive)) {
    return;
  }
  comparedFragmentPairs.add(fragmentName1, fragmentName2, areMutuallyExclusive);
  var fragment1 = context.getFragment(fragmentName1);
  var fragment2 = context.getFragment(fragmentName2);
  if (!fragment1 || !fragment2) {
    return;
  }
  var _getReferencedFieldsA2 = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment1), fieldMap1 = _getReferencedFieldsA2[0], fragmentNames1 = _getReferencedFieldsA2[1];
  var _getReferencedFieldsA3 = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment2), fieldMap2 = _getReferencedFieldsA3[0], fragmentNames2 = _getReferencedFieldsA3[1];
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
  for (var j2 = 0; j2 < fragmentNames2.length; j2++) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentNames2[j2]);
  }
  for (var i2 = 0; i2 < fragmentNames1.length; i2++) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentNames1[i2], fragmentName2);
  }
}
function findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, parentType1, selectionSet1, parentType2, selectionSet2) {
  var conflicts = [];
  var _getFieldsAndFragment2 = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType1, selectionSet1), fieldMap1 = _getFieldsAndFragment2[0], fragmentNames1 = _getFieldsAndFragment2[1];
  var _getFieldsAndFragment3 = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType2, selectionSet2), fieldMap2 = _getFieldsAndFragment3[0], fragmentNames2 = _getFieldsAndFragment3[1];
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
  if (fragmentNames2.length !== 0) {
    for (var j2 = 0; j2 < fragmentNames2.length; j2++) {
      collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fragmentNames2[j2]);
    }
  }
  if (fragmentNames1.length !== 0) {
    for (var i2 = 0; i2 < fragmentNames1.length; i2++) {
      collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap2, fragmentNames1[i2]);
    }
  }
  for (var _i3 = 0; _i3 < fragmentNames1.length; _i3++) {
    for (var _j = 0; _j < fragmentNames2.length; _j++) {
      collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentNames1[_i3], fragmentNames2[_j]);
    }
  }
  return conflicts;
}
function collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, fieldMap) {
  for (var _i5 = 0, _objectEntries2 = objectEntries_default(fieldMap); _i5 < _objectEntries2.length; _i5++) {
    var _ref5 = _objectEntries2[_i5];
    var responseName = _ref5[0];
    var fields7 = _ref5[1];
    if (fields7.length > 1) {
      for (var i2 = 0; i2 < fields7.length; i2++) {
        for (var j2 = i2 + 1; j2 < fields7.length; j2++) {
          var conflict = findConflict(
            context,
            cachedFieldsAndFragmentNames,
            comparedFragmentPairs,
            false,
            // within one collection is never mutually exclusive
            responseName,
            fields7[i2],
            fields7[j2]
          );
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, fieldMap1, fieldMap2) {
  for (var _i7 = 0, _Object$keys2 = Object.keys(fieldMap1); _i7 < _Object$keys2.length; _i7++) {
    var responseName = _Object$keys2[_i7];
    var fields22 = fieldMap2[responseName];
    if (fields22) {
      var fields1 = fieldMap1[responseName];
      for (var i2 = 0; i2 < fields1.length; i2++) {
        for (var j2 = 0; j2 < fields22.length; j2++) {
          var conflict = findConflict(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, fields1[i2], fields22[j2]);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function findConflict(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, field2) {
  var parentType1 = field1[0], node1 = field1[1], def1 = field1[2];
  var parentType2 = field2[0], node2 = field2[1], def2 = field2[2];
  var areMutuallyExclusive = parentFieldsAreMutuallyExclusive || parentType1 !== parentType2 && isObjectType(parentType1) && isObjectType(parentType2);
  if (!areMutuallyExclusive) {
    var _node1$arguments, _node2$arguments;
    var name1 = node1.name.value;
    var name2 = node2.name.value;
    if (name1 !== name2) {
      return [[responseName, '"'.concat(name1, '" and "').concat(name2, '" are different fields')], [node1], [node2]];
    }
    var args1 = (_node1$arguments = node1.arguments) !== null && _node1$arguments !== void 0 ? _node1$arguments : [];
    var args2 = (_node2$arguments = node2.arguments) !== null && _node2$arguments !== void 0 ? _node2$arguments : [];
    if (!sameArguments(args1, args2)) {
      return [[responseName, "they have differing arguments"], [node1], [node2]];
    }
  }
  var type1 = def1 === null || def1 === void 0 ? void 0 : def1.type;
  var type2 = def2 === null || def2 === void 0 ? void 0 : def2.type;
  if (type1 && type2 && doTypesConflict(type1, type2)) {
    return [[responseName, 'they return conflicting types "'.concat(inspect(type1), '" and "').concat(inspect(type2), '"')], [node1], [node2]];
  }
  var selectionSet1 = node1.selectionSet;
  var selectionSet2 = node2.selectionSet;
  if (selectionSet1 && selectionSet2) {
    var conflicts = findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, getNamedType(type1), selectionSet1, getNamedType(type2), selectionSet2);
    return subfieldConflicts(conflicts, responseName, node1, node2);
  }
}
function sameArguments(arguments1, arguments2) {
  if (arguments1.length !== arguments2.length) {
    return false;
  }
  return arguments1.every(function(argument1) {
    var argument2 = find_default(arguments2, function(argument) {
      return argument.name.value === argument1.name.value;
    });
    if (!argument2) {
      return false;
    }
    return sameValue(argument1.value, argument2.value);
  });
}
function sameValue(value1, value2) {
  return print(value1) === print(value2);
}
function doTypesConflict(type1, type2) {
  if (isListType(type1)) {
    return isListType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isListType(type2)) {
    return true;
  }
  if (isNonNullType(type1)) {
    return isNonNullType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isNonNullType(type2)) {
    return true;
  }
  if (isLeafType(type1) || isLeafType(type2)) {
    return type1 !== type2;
  }
  return false;
}
function getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet) {
  var cached = cachedFieldsAndFragmentNames.get(selectionSet);
  if (!cached) {
    var nodeAndDefs = /* @__PURE__ */ Object.create(null);
    var fragmentNames = /* @__PURE__ */ Object.create(null);
    _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames);
    cached = [nodeAndDefs, Object.keys(fragmentNames)];
    cachedFieldsAndFragmentNames.set(selectionSet, cached);
  }
  return cached;
}
function getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment) {
  var cached = cachedFieldsAndFragmentNames.get(fragment.selectionSet);
  if (cached) {
    return cached;
  }
  var fragmentType = typeFromAST(context.getSchema(), fragment.typeCondition);
  return getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragmentType, fragment.selectionSet);
}
function _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames) {
  for (var _i9 = 0, _selectionSet$selecti2 = selectionSet.selections; _i9 < _selectionSet$selecti2.length; _i9++) {
    var selection = _selectionSet$selecti2[_i9];
    switch (selection.kind) {
      case Kind.FIELD: {
        var fieldName = selection.name.value;
        var fieldDef = void 0;
        if (isObjectType(parentType) || isInterfaceType(parentType)) {
          fieldDef = parentType.getFields()[fieldName];
        }
        var responseName = selection.alias ? selection.alias.value : fieldName;
        if (!nodeAndDefs[responseName]) {
          nodeAndDefs[responseName] = [];
        }
        nodeAndDefs[responseName].push([parentType, selection, fieldDef]);
        break;
      }
      case Kind.FRAGMENT_SPREAD:
        fragmentNames[selection.name.value] = true;
        break;
      case Kind.INLINE_FRAGMENT: {
        var typeCondition = selection.typeCondition;
        var inlineFragmentType = typeCondition ? typeFromAST(context.getSchema(), typeCondition) : parentType;
        _collectFieldsAndFragmentNames(context, inlineFragmentType, selection.selectionSet, nodeAndDefs, fragmentNames);
        break;
      }
    }
  }
}
function subfieldConflicts(conflicts, responseName, node1, node2) {
  if (conflicts.length > 0) {
    return [[responseName, conflicts.map(function(_ref6) {
      var reason = _ref6[0];
      return reason;
    })], conflicts.reduce(function(allFields, _ref7) {
      var fields1 = _ref7[1];
      return allFields.concat(fields1);
    }, [node1]), conflicts.reduce(function(allFields, _ref8) {
      var fields22 = _ref8[2];
      return allFields.concat(fields22);
    }, [node2])];
  }
}
var PairSet = function() {
  function PairSet2() {
    this._data = /* @__PURE__ */ Object.create(null);
  }
  var _proto = PairSet2.prototype;
  _proto.has = function has(a2, b2, areMutuallyExclusive) {
    var first = this._data[a2];
    var result = first && first[b2];
    if (result === void 0) {
      return false;
    }
    if (areMutuallyExclusive === false) {
      return result === false;
    }
    return true;
  };
  _proto.add = function add(a2, b2, areMutuallyExclusive) {
    this._pairSetAdd(a2, b2, areMutuallyExclusive);
    this._pairSetAdd(b2, a2, areMutuallyExclusive);
  };
  _proto._pairSetAdd = function _pairSetAdd(a2, b2, areMutuallyExclusive) {
    var map2 = this._data[a2];
    if (!map2) {
      map2 = /* @__PURE__ */ Object.create(null);
      this._data[a2] = map2;
    }
    map2[b2] = areMutuallyExclusive;
  };
  return PairSet2;
}();

// node_modules/graphql/validation/rules/UniqueInputFieldNamesRule.mjs
function UniqueInputFieldNamesRule(context) {
  var knownNameStack = [];
  var knownNames = /* @__PURE__ */ Object.create(null);
  return {
    ObjectValue: {
      enter: function enter() {
        knownNameStack.push(knownNames);
        knownNames = /* @__PURE__ */ Object.create(null);
      },
      leave: function leave() {
        knownNames = knownNameStack.pop();
      }
    },
    ObjectField: function ObjectField2(node) {
      var fieldName = node.name.value;
      if (knownNames[fieldName]) {
        context.reportError(new GraphQLError('There can be only one input field named "'.concat(fieldName, '".'), [knownNames[fieldName], node.name]));
      } else {
        knownNames[fieldName] = node.name;
      }
    }
  };
}

// node_modules/graphql/validation/rules/LoneSchemaDefinitionRule.mjs
function LoneSchemaDefinitionRule(context) {
  var _ref, _ref2, _oldSchema$astNode;
  var oldSchema = context.getSchema();
  var alreadyDefined = (_ref = (_ref2 = (_oldSchema$astNode = oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.astNode) !== null && _oldSchema$astNode !== void 0 ? _oldSchema$astNode : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getQueryType()) !== null && _ref2 !== void 0 ? _ref2 : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getMutationType()) !== null && _ref !== void 0 ? _ref : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getSubscriptionType();
  var schemaDefinitionsCount = 0;
  return {
    SchemaDefinition: function SchemaDefinition(node) {
      if (alreadyDefined) {
        context.reportError(new GraphQLError("Cannot define a new schema within a schema extension.", node));
        return;
      }
      if (schemaDefinitionsCount > 0) {
        context.reportError(new GraphQLError("Must provide only one schema definition.", node));
      }
      ++schemaDefinitionsCount;
    }
  };
}

// node_modules/graphql/validation/rules/UniqueOperationTypesRule.mjs
function UniqueOperationTypesRule(context) {
  var schema2 = context.getSchema();
  var definedOperationTypes = /* @__PURE__ */ Object.create(null);
  var existingOperationTypes = schema2 ? {
    query: schema2.getQueryType(),
    mutation: schema2.getMutationType(),
    subscription: schema2.getSubscriptionType()
  } : {};
  return {
    SchemaDefinition: checkOperationTypes,
    SchemaExtension: checkOperationTypes
  };
  function checkOperationTypes(node) {
    var _node$operationTypes;
    var operationTypesNodes = (_node$operationTypes = node.operationTypes) !== null && _node$operationTypes !== void 0 ? _node$operationTypes : [];
    for (var _i2 = 0; _i2 < operationTypesNodes.length; _i2++) {
      var operationType = operationTypesNodes[_i2];
      var operation = operationType.operation;
      var alreadyDefinedOperationType = definedOperationTypes[operation];
      if (existingOperationTypes[operation]) {
        context.reportError(new GraphQLError("Type for ".concat(operation, " already defined in the schema. It cannot be redefined."), operationType));
      } else if (alreadyDefinedOperationType) {
        context.reportError(new GraphQLError("There can be only one ".concat(operation, " type in schema."), [alreadyDefinedOperationType, operationType]));
      } else {
        definedOperationTypes[operation] = operationType;
      }
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueTypeNamesRule.mjs
function UniqueTypeNamesRule(context) {
  var knownTypeNames = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  return {
    ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName
  };
  function checkTypeName(node) {
    var typeName = node.name.value;
    if (schema2 !== null && schema2 !== void 0 && schema2.getType(typeName)) {
      context.reportError(new GraphQLError('Type "'.concat(typeName, '" already exists in the schema. It cannot also be defined in this type definition.'), node.name));
      return;
    }
    if (knownTypeNames[typeName]) {
      context.reportError(new GraphQLError('There can be only one type named "'.concat(typeName, '".'), [knownTypeNames[typeName], node.name]));
    } else {
      knownTypeNames[typeName] = node.name;
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueEnumValueNamesRule.mjs
function UniqueEnumValueNamesRule(context) {
  var schema2 = context.getSchema();
  var existingTypeMap = schema2 ? schema2.getTypeMap() : /* @__PURE__ */ Object.create(null);
  var knownValueNames = /* @__PURE__ */ Object.create(null);
  return {
    EnumTypeDefinition: checkValueUniqueness,
    EnumTypeExtension: checkValueUniqueness
  };
  function checkValueUniqueness(node) {
    var _node$values;
    var typeName = node.name.value;
    if (!knownValueNames[typeName]) {
      knownValueNames[typeName] = /* @__PURE__ */ Object.create(null);
    }
    var valueNodes = (_node$values = node.values) !== null && _node$values !== void 0 ? _node$values : [];
    var valueNames = knownValueNames[typeName];
    for (var _i2 = 0; _i2 < valueNodes.length; _i2++) {
      var valueDef = valueNodes[_i2];
      var valueName = valueDef.name.value;
      var existingType = existingTypeMap[typeName];
      if (isEnumType(existingType) && existingType.getValue(valueName)) {
        context.reportError(new GraphQLError('Enum value "'.concat(typeName, ".").concat(valueName, '" already exists in the schema. It cannot also be defined in this type extension.'), valueDef.name));
      } else if (valueNames[valueName]) {
        context.reportError(new GraphQLError('Enum value "'.concat(typeName, ".").concat(valueName, '" can only be defined once.'), [valueNames[valueName], valueDef.name]));
      } else {
        valueNames[valueName] = valueDef.name;
      }
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueFieldDefinitionNamesRule.mjs
function UniqueFieldDefinitionNamesRule(context) {
  var schema2 = context.getSchema();
  var existingTypeMap = schema2 ? schema2.getTypeMap() : /* @__PURE__ */ Object.create(null);
  var knownFieldNames = /* @__PURE__ */ Object.create(null);
  return {
    InputObjectTypeDefinition: checkFieldUniqueness,
    InputObjectTypeExtension: checkFieldUniqueness,
    InterfaceTypeDefinition: checkFieldUniqueness,
    InterfaceTypeExtension: checkFieldUniqueness,
    ObjectTypeDefinition: checkFieldUniqueness,
    ObjectTypeExtension: checkFieldUniqueness
  };
  function checkFieldUniqueness(node) {
    var _node$fields;
    var typeName = node.name.value;
    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = /* @__PURE__ */ Object.create(null);
    }
    var fieldNodes = (_node$fields = node.fields) !== null && _node$fields !== void 0 ? _node$fields : [];
    var fieldNames = knownFieldNames[typeName];
    for (var _i2 = 0; _i2 < fieldNodes.length; _i2++) {
      var fieldDef = fieldNodes[_i2];
      var fieldName = fieldDef.name.value;
      if (hasField(existingTypeMap[typeName], fieldName)) {
        context.reportError(new GraphQLError('Field "'.concat(typeName, ".").concat(fieldName, '" already exists in the schema. It cannot also be defined in this type extension.'), fieldDef.name));
      } else if (fieldNames[fieldName]) {
        context.reportError(new GraphQLError('Field "'.concat(typeName, ".").concat(fieldName, '" can only be defined once.'), [fieldNames[fieldName], fieldDef.name]));
      } else {
        fieldNames[fieldName] = fieldDef.name;
      }
    }
    return false;
  }
}
function hasField(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    return type.getFields()[fieldName] != null;
  }
  return false;
}

// node_modules/graphql/validation/rules/UniqueDirectiveNamesRule.mjs
function UniqueDirectiveNamesRule(context) {
  var knownDirectiveNames = /* @__PURE__ */ Object.create(null);
  var schema2 = context.getSchema();
  return {
    DirectiveDefinition: function DirectiveDefinition(node) {
      var directiveName = node.name.value;
      if (schema2 !== null && schema2 !== void 0 && schema2.getDirective(directiveName)) {
        context.reportError(new GraphQLError('Directive "@'.concat(directiveName, '" already exists in the schema. It cannot be redefined.'), node.name));
        return;
      }
      if (knownDirectiveNames[directiveName]) {
        context.reportError(new GraphQLError('There can be only one directive named "@'.concat(directiveName, '".'), [knownDirectiveNames[directiveName], node.name]));
      } else {
        knownDirectiveNames[directiveName] = node.name;
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/PossibleTypeExtensionsRule.mjs
var _defKindToExtKind;
function _defineProperty4(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function PossibleTypeExtensionsRule(context) {
  var schema2 = context.getSchema();
  var definedTypes = /* @__PURE__ */ Object.create(null);
  for (var _i2 = 0, _context$getDocument$2 = context.getDocument().definitions; _i2 < _context$getDocument$2.length; _i2++) {
    var def = _context$getDocument$2[_i2];
    if (isTypeDefinitionNode(def)) {
      definedTypes[def.name.value] = def;
    }
  }
  return {
    ScalarTypeExtension: checkExtension,
    ObjectTypeExtension: checkExtension,
    InterfaceTypeExtension: checkExtension,
    UnionTypeExtension: checkExtension,
    EnumTypeExtension: checkExtension,
    InputObjectTypeExtension: checkExtension
  };
  function checkExtension(node) {
    var typeName = node.name.value;
    var defNode = definedTypes[typeName];
    var existingType = schema2 === null || schema2 === void 0 ? void 0 : schema2.getType(typeName);
    var expectedKind;
    if (defNode) {
      expectedKind = defKindToExtKind[defNode.kind];
    } else if (existingType) {
      expectedKind = typeToExtKind(existingType);
    }
    if (expectedKind) {
      if (expectedKind !== node.kind) {
        var kindStr = extensionKindToTypeName(node.kind);
        context.reportError(new GraphQLError("Cannot extend non-".concat(kindStr, ' type "').concat(typeName, '".'), defNode ? [defNode, node] : node));
      }
    } else {
      var allTypeNames = Object.keys(definedTypes);
      if (schema2) {
        allTypeNames = allTypeNames.concat(Object.keys(schema2.getTypeMap()));
      }
      var suggestedTypes = suggestionList(typeName, allTypeNames);
      context.reportError(new GraphQLError('Cannot extend type "'.concat(typeName, '" because it is not defined.') + didYouMean(suggestedTypes), node.name));
    }
  }
}
var defKindToExtKind = (_defKindToExtKind = {}, _defineProperty4(_defKindToExtKind, Kind.SCALAR_TYPE_DEFINITION, Kind.SCALAR_TYPE_EXTENSION), _defineProperty4(_defKindToExtKind, Kind.OBJECT_TYPE_DEFINITION, Kind.OBJECT_TYPE_EXTENSION), _defineProperty4(_defKindToExtKind, Kind.INTERFACE_TYPE_DEFINITION, Kind.INTERFACE_TYPE_EXTENSION), _defineProperty4(_defKindToExtKind, Kind.UNION_TYPE_DEFINITION, Kind.UNION_TYPE_EXTENSION), _defineProperty4(_defKindToExtKind, Kind.ENUM_TYPE_DEFINITION, Kind.ENUM_TYPE_EXTENSION), _defineProperty4(_defKindToExtKind, Kind.INPUT_OBJECT_TYPE_DEFINITION, Kind.INPUT_OBJECT_TYPE_EXTENSION), _defKindToExtKind);
function typeToExtKind(type) {
  if (isScalarType(type)) {
    return Kind.SCALAR_TYPE_EXTENSION;
  }
  if (isObjectType(type)) {
    return Kind.OBJECT_TYPE_EXTENSION;
  }
  if (isInterfaceType(type)) {
    return Kind.INTERFACE_TYPE_EXTENSION;
  }
  if (isUnionType(type)) {
    return Kind.UNION_TYPE_EXTENSION;
  }
  if (isEnumType(type)) {
    return Kind.ENUM_TYPE_EXTENSION;
  }
  if (isInputObjectType(type)) {
    return Kind.INPUT_OBJECT_TYPE_EXTENSION;
  }
  invariant(0, "Unexpected type: " + inspect(type));
}
function extensionKindToTypeName(kind) {
  switch (kind) {
    case Kind.SCALAR_TYPE_EXTENSION:
      return "scalar";
    case Kind.OBJECT_TYPE_EXTENSION:
      return "object";
    case Kind.INTERFACE_TYPE_EXTENSION:
      return "interface";
    case Kind.UNION_TYPE_EXTENSION:
      return "union";
    case Kind.ENUM_TYPE_EXTENSION:
      return "enum";
    case Kind.INPUT_OBJECT_TYPE_EXTENSION:
      return "input object";
  }
  invariant(0, "Unexpected kind: " + inspect(kind));
}

// node_modules/graphql/validation/specifiedRules.mjs
var specifiedRules = Object.freeze([ExecutableDefinitionsRule, UniqueOperationNamesRule, LoneAnonymousOperationRule, SingleFieldSubscriptionsRule, KnownTypeNamesRule, FragmentsOnCompositeTypesRule, VariablesAreInputTypesRule, ScalarLeafsRule, FieldsOnCorrectTypeRule, UniqueFragmentNamesRule, KnownFragmentNamesRule, NoUnusedFragmentsRule, PossibleFragmentSpreadsRule, NoFragmentCyclesRule, UniqueVariableNamesRule, NoUndefinedVariablesRule, NoUnusedVariablesRule, KnownDirectivesRule, UniqueDirectivesPerLocationRule, KnownArgumentNamesRule, UniqueArgumentNamesRule, ValuesOfCorrectTypeRule, ProvidedRequiredArgumentsRule, VariablesInAllowedPositionRule, OverlappingFieldsCanBeMergedRule, UniqueInputFieldNamesRule]);
var specifiedSDLRules = Object.freeze([LoneSchemaDefinitionRule, UniqueOperationTypesRule, UniqueTypeNamesRule, UniqueEnumValueNamesRule, UniqueFieldDefinitionNamesRule, UniqueDirectiveNamesRule, KnownTypeNamesRule, KnownDirectivesRule, UniqueDirectivesPerLocationRule, PossibleTypeExtensionsRule, KnownArgumentNamesOnDirectivesRule, UniqueArgumentNamesRule, UniqueInputFieldNamesRule, ProvidedRequiredArgumentsOnDirectivesRule]);

// node_modules/graphql/validation/ValidationContext.mjs
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
var ASTValidationContext = function() {
  function ASTValidationContext2(ast, onError) {
    this._ast = ast;
    this._fragments = void 0;
    this._fragmentSpreads = /* @__PURE__ */ new Map();
    this._recursivelyReferencedFragments = /* @__PURE__ */ new Map();
    this._onError = onError;
  }
  var _proto = ASTValidationContext2.prototype;
  _proto.reportError = function reportError(error) {
    this._onError(error);
  };
  _proto.getDocument = function getDocument() {
    return this._ast;
  };
  _proto.getFragment = function getFragment(name) {
    var fragments = this._fragments;
    if (!fragments) {
      this._fragments = fragments = this.getDocument().definitions.reduce(function(frags, statement) {
        if (statement.kind === Kind.FRAGMENT_DEFINITION) {
          frags[statement.name.value] = statement;
        }
        return frags;
      }, /* @__PURE__ */ Object.create(null));
    }
    return fragments[name];
  };
  _proto.getFragmentSpreads = function getFragmentSpreads(node) {
    var spreads = this._fragmentSpreads.get(node);
    if (!spreads) {
      spreads = [];
      var setsToVisit = [node];
      while (setsToVisit.length !== 0) {
        var set = setsToVisit.pop();
        for (var _i2 = 0, _set$selections2 = set.selections; _i2 < _set$selections2.length; _i2++) {
          var selection = _set$selections2[_i2];
          if (selection.kind === Kind.FRAGMENT_SPREAD) {
            spreads.push(selection);
          } else if (selection.selectionSet) {
            setsToVisit.push(selection.selectionSet);
          }
        }
      }
      this._fragmentSpreads.set(node, spreads);
    }
    return spreads;
  };
  _proto.getRecursivelyReferencedFragments = function getRecursivelyReferencedFragments(operation) {
    var fragments = this._recursivelyReferencedFragments.get(operation);
    if (!fragments) {
      fragments = [];
      var collectedNames = /* @__PURE__ */ Object.create(null);
      var nodesToVisit = [operation.selectionSet];
      while (nodesToVisit.length !== 0) {
        var node = nodesToVisit.pop();
        for (var _i4 = 0, _this$getFragmentSpre2 = this.getFragmentSpreads(node); _i4 < _this$getFragmentSpre2.length; _i4++) {
          var spread = _this$getFragmentSpre2[_i4];
          var fragName = spread.name.value;
          if (collectedNames[fragName] !== true) {
            collectedNames[fragName] = true;
            var fragment = this.getFragment(fragName);
            if (fragment) {
              fragments.push(fragment);
              nodesToVisit.push(fragment.selectionSet);
            }
          }
        }
      }
      this._recursivelyReferencedFragments.set(operation, fragments);
    }
    return fragments;
  };
  return ASTValidationContext2;
}();
var SDLValidationContext = function(_ASTValidationContext) {
  _inheritsLoose(SDLValidationContext2, _ASTValidationContext);
  function SDLValidationContext2(ast, schema2, onError) {
    var _this;
    _this = _ASTValidationContext.call(this, ast, onError) || this;
    _this._schema = schema2;
    return _this;
  }
  var _proto2 = SDLValidationContext2.prototype;
  _proto2.getSchema = function getSchema() {
    return this._schema;
  };
  return SDLValidationContext2;
}(ASTValidationContext);
var ValidationContext = function(_ASTValidationContext2) {
  _inheritsLoose(ValidationContext2, _ASTValidationContext2);
  function ValidationContext2(schema2, ast, typeInfo, onError) {
    var _this2;
    _this2 = _ASTValidationContext2.call(this, ast, onError) || this;
    _this2._schema = schema2;
    _this2._typeInfo = typeInfo;
    _this2._variableUsages = /* @__PURE__ */ new Map();
    _this2._recursiveVariableUsages = /* @__PURE__ */ new Map();
    return _this2;
  }
  var _proto3 = ValidationContext2.prototype;
  _proto3.getSchema = function getSchema() {
    return this._schema;
  };
  _proto3.getVariableUsages = function getVariableUsages(node) {
    var usages = this._variableUsages.get(node);
    if (!usages) {
      var newUsages = [];
      var typeInfo = new TypeInfo(this._schema);
      visit(node, visitWithTypeInfo(typeInfo, {
        VariableDefinition: function VariableDefinition2() {
          return false;
        },
        Variable: function Variable2(variable) {
          newUsages.push({
            node: variable,
            type: typeInfo.getInputType(),
            defaultValue: typeInfo.getDefaultValue()
          });
        }
      }));
      usages = newUsages;
      this._variableUsages.set(node, usages);
    }
    return usages;
  };
  _proto3.getRecursiveVariableUsages = function getRecursiveVariableUsages(operation) {
    var usages = this._recursiveVariableUsages.get(operation);
    if (!usages) {
      usages = this.getVariableUsages(operation);
      for (var _i6 = 0, _this$getRecursivelyR2 = this.getRecursivelyReferencedFragments(operation); _i6 < _this$getRecursivelyR2.length; _i6++) {
        var frag = _this$getRecursivelyR2[_i6];
        usages = usages.concat(this.getVariableUsages(frag));
      }
      this._recursiveVariableUsages.set(operation, usages);
    }
    return usages;
  };
  _proto3.getType = function getType() {
    return this._typeInfo.getType();
  };
  _proto3.getParentType = function getParentType() {
    return this._typeInfo.getParentType();
  };
  _proto3.getInputType = function getInputType() {
    return this._typeInfo.getInputType();
  };
  _proto3.getParentInputType = function getParentInputType() {
    return this._typeInfo.getParentInputType();
  };
  _proto3.getFieldDef = function getFieldDef3() {
    return this._typeInfo.getFieldDef();
  };
  _proto3.getDirective = function getDirective() {
    return this._typeInfo.getDirective();
  };
  _proto3.getArgument = function getArgument() {
    return this._typeInfo.getArgument();
  };
  _proto3.getEnumValue = function getEnumValue() {
    return this._typeInfo.getEnumValue();
  };
  return ValidationContext2;
}(ASTValidationContext);

// node_modules/graphql/jsutils/memoize3.mjs
function memoize3(fn2) {
  var cache0;
  return function memoized(a1, a2, a3) {
    if (!cache0) {
      cache0 = /* @__PURE__ */ new WeakMap();
    }
    var cache1 = cache0.get(a1);
    var cache2;
    if (cache1) {
      cache2 = cache1.get(a2);
      if (cache2) {
        var cachedValue = cache2.get(a3);
        if (cachedValue !== void 0) {
          return cachedValue;
        }
      }
    } else {
      cache1 = /* @__PURE__ */ new WeakMap();
      cache0.set(a1, cache1);
    }
    if (!cache2) {
      cache2 = /* @__PURE__ */ new WeakMap();
      cache1.set(a2, cache2);
    }
    var newValue = fn2(a1, a2, a3);
    cache2.set(a3, newValue);
    return newValue;
  };
}

// node_modules/graphql/utilities/valueFromAST.mjs
function valueFromAST(valueNode, type, variables) {
  if (!valueNode) {
    return;
  }
  if (valueNode.kind === Kind.VARIABLE) {
    var variableName = valueNode.name.value;
    if (variables == null || variables[variableName] === void 0) {
      return;
    }
    var variableValue = variables[variableName];
    if (variableValue === null && isNonNullType(type)) {
      return;
    }
    return variableValue;
  }
  if (isNonNullType(type)) {
    if (valueNode.kind === Kind.NULL) {
      return;
    }
    return valueFromAST(valueNode, type.ofType, variables);
  }
  if (valueNode.kind === Kind.NULL) {
    return null;
  }
  if (isListType(type)) {
    var itemType = type.ofType;
    if (valueNode.kind === Kind.LIST) {
      var coercedValues = [];
      for (var _i2 = 0, _valueNode$values2 = valueNode.values; _i2 < _valueNode$values2.length; _i2++) {
        var itemNode = _valueNode$values2[_i2];
        if (isMissingVariable(itemNode, variables)) {
          if (isNonNullType(itemType)) {
            return;
          }
          coercedValues.push(null);
        } else {
          var itemValue = valueFromAST(itemNode, itemType, variables);
          if (itemValue === void 0) {
            return;
          }
          coercedValues.push(itemValue);
        }
      }
      return coercedValues;
    }
    var coercedValue = valueFromAST(valueNode, itemType, variables);
    if (coercedValue === void 0) {
      return;
    }
    return [coercedValue];
  }
  if (isInputObjectType(type)) {
    if (valueNode.kind !== Kind.OBJECT) {
      return;
    }
    var coercedObj = /* @__PURE__ */ Object.create(null);
    var fieldNodes = keyMap(valueNode.fields, function(field2) {
      return field2.name.value;
    });
    for (var _i4 = 0, _objectValues2 = objectValues_default(type.getFields()); _i4 < _objectValues2.length; _i4++) {
      var field = _objectValues2[_i4];
      var fieldNode = fieldNodes[field.name];
      if (!fieldNode || isMissingVariable(fieldNode.value, variables)) {
        if (field.defaultValue !== void 0) {
          coercedObj[field.name] = field.defaultValue;
        } else if (isNonNullType(field.type)) {
          return;
        }
        continue;
      }
      var fieldValue = valueFromAST(fieldNode.value, field.type, variables);
      if (fieldValue === void 0) {
        return;
      }
      coercedObj[field.name] = fieldValue;
    }
    return coercedObj;
  }
  if (isLeafType(type)) {
    var result;
    try {
      result = type.parseLiteral(valueNode, variables);
    } catch (_error) {
      return;
    }
    if (result === void 0) {
      return;
    }
    return result;
  }
  invariant(0, "Unexpected input type: " + inspect(type));
}
function isMissingVariable(valueNode, variables) {
  return valueNode.kind === Kind.VARIABLE && (variables == null || variables[valueNode.name.value] === void 0);
}

// node_modules/graphql/execution/values.mjs
function getArgumentValues(def, node, variableValues) {
  var _node$arguments;
  var coercedValues = {};
  var argumentNodes = (_node$arguments = node.arguments) !== null && _node$arguments !== void 0 ? _node$arguments : [];
  var argNodeMap = keyMap(argumentNodes, function(arg) {
    return arg.name.value;
  });
  for (var _i4 = 0, _def$args2 = def.args; _i4 < _def$args2.length; _i4++) {
    var argDef = _def$args2[_i4];
    var name = argDef.name;
    var argType = argDef.type;
    var argumentNode = argNodeMap[name];
    if (!argumentNode) {
      if (argDef.defaultValue !== void 0) {
        coercedValues[name] = argDef.defaultValue;
      } else if (isNonNullType(argType)) {
        throw new GraphQLError('Argument "'.concat(name, '" of required type "').concat(inspect(argType), '" ') + "was not provided.", node);
      }
      continue;
    }
    var valueNode = argumentNode.value;
    var isNull = valueNode.kind === Kind.NULL;
    if (valueNode.kind === Kind.VARIABLE) {
      var variableName = valueNode.name.value;
      if (variableValues == null || !hasOwnProperty(variableValues, variableName)) {
        if (argDef.defaultValue !== void 0) {
          coercedValues[name] = argDef.defaultValue;
        } else if (isNonNullType(argType)) {
          throw new GraphQLError('Argument "'.concat(name, '" of required type "').concat(inspect(argType), '" ') + 'was provided the variable "$'.concat(variableName, '" which was not provided a runtime value.'), valueNode);
        }
        continue;
      }
      isNull = variableValues[variableName] == null;
    }
    if (isNull && isNonNullType(argType)) {
      throw new GraphQLError('Argument "'.concat(name, '" of non-null type "').concat(inspect(argType), '" ') + "must not be null.", valueNode);
    }
    var coercedValue = valueFromAST(valueNode, argType, variableValues);
    if (coercedValue === void 0) {
      throw new GraphQLError('Argument "'.concat(name, '" has invalid value ').concat(print(valueNode), "."), valueNode);
    }
    coercedValues[name] = coercedValue;
  }
  return coercedValues;
}
function getDirectiveValues(directiveDef, node, variableValues) {
  var directiveNode = node.directives && find_default(node.directives, function(directive) {
    return directive.name.value === directiveDef.name;
  });
  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues);
  }
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// node_modules/graphql/execution/execute.mjs
function collectFields(exeContext, runtimeType, selectionSet, fields7, visitedFragmentNames) {
  for (var _i6 = 0, _selectionSet$selecti2 = selectionSet.selections; _i6 < _selectionSet$selecti2.length; _i6++) {
    var selection = _selectionSet$selecti2[_i6];
    switch (selection.kind) {
      case Kind.FIELD: {
        if (!shouldIncludeNode(exeContext, selection)) {
          continue;
        }
        var name = getFieldEntryKey(selection);
        if (!fields7[name]) {
          fields7[name] = [];
        }
        fields7[name].push(selection);
        break;
      }
      case Kind.INLINE_FRAGMENT: {
        if (!shouldIncludeNode(exeContext, selection) || !doesFragmentConditionMatch(exeContext, selection, runtimeType)) {
          continue;
        }
        collectFields(exeContext, runtimeType, selection.selectionSet, fields7, visitedFragmentNames);
        break;
      }
      case Kind.FRAGMENT_SPREAD: {
        var fragName = selection.name.value;
        if (visitedFragmentNames[fragName] || !shouldIncludeNode(exeContext, selection)) {
          continue;
        }
        visitedFragmentNames[fragName] = true;
        var fragment = exeContext.fragments[fragName];
        if (!fragment || !doesFragmentConditionMatch(exeContext, fragment, runtimeType)) {
          continue;
        }
        collectFields(exeContext, runtimeType, fragment.selectionSet, fields7, visitedFragmentNames);
        break;
      }
    }
  }
  return fields7;
}
function shouldIncludeNode(exeContext, node) {
  var skip = getDirectiveValues(GraphQLSkipDirective, node, exeContext.variableValues);
  if ((skip === null || skip === void 0 ? void 0 : skip.if) === true) {
    return false;
  }
  var include = getDirectiveValues(GraphQLIncludeDirective, node, exeContext.variableValues);
  if ((include === null || include === void 0 ? void 0 : include.if) === false) {
    return false;
  }
  return true;
}
function doesFragmentConditionMatch(exeContext, fragment, type) {
  var typeConditionNode = fragment.typeCondition;
  if (!typeConditionNode) {
    return true;
  }
  var conditionalType = typeFromAST(exeContext.schema, typeConditionNode);
  if (conditionalType === type) {
    return true;
  }
  if (isAbstractType(conditionalType)) {
    return exeContext.schema.isSubType(conditionalType, type);
  }
  return false;
}
function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}
var collectSubfields = memoize3(_collectSubfields);
function _collectSubfields(exeContext, returnType, fieldNodes) {
  var subFieldNodes = /* @__PURE__ */ Object.create(null);
  var visitedFragmentNames = /* @__PURE__ */ Object.create(null);
  for (var _i8 = 0; _i8 < fieldNodes.length; _i8++) {
    var node = fieldNodes[_i8];
    if (node.selectionSet) {
      subFieldNodes = collectFields(exeContext, returnType, node.selectionSet, subFieldNodes, visitedFragmentNames);
    }
  }
  return subFieldNodes;
}

// node_modules/graphql/utilities/extendSchema.mjs
var stdTypeMap = keyMap(specifiedScalarTypes.concat(introspectionTypes), function(type) {
  return type.name;
});

// node_modules/graphql/utilities/findBreakingChanges.mjs
var BreakingChangeType = Object.freeze({
  TYPE_REMOVED: "TYPE_REMOVED",
  TYPE_CHANGED_KIND: "TYPE_CHANGED_KIND",
  TYPE_REMOVED_FROM_UNION: "TYPE_REMOVED_FROM_UNION",
  VALUE_REMOVED_FROM_ENUM: "VALUE_REMOVED_FROM_ENUM",
  REQUIRED_INPUT_FIELD_ADDED: "REQUIRED_INPUT_FIELD_ADDED",
  IMPLEMENTED_INTERFACE_REMOVED: "IMPLEMENTED_INTERFACE_REMOVED",
  FIELD_REMOVED: "FIELD_REMOVED",
  FIELD_CHANGED_KIND: "FIELD_CHANGED_KIND",
  REQUIRED_ARG_ADDED: "REQUIRED_ARG_ADDED",
  ARG_REMOVED: "ARG_REMOVED",
  ARG_CHANGED_KIND: "ARG_CHANGED_KIND",
  DIRECTIVE_REMOVED: "DIRECTIVE_REMOVED",
  DIRECTIVE_ARG_REMOVED: "DIRECTIVE_ARG_REMOVED",
  REQUIRED_DIRECTIVE_ARG_ADDED: "REQUIRED_DIRECTIVE_ARG_ADDED",
  DIRECTIVE_REPEATABLE_REMOVED: "DIRECTIVE_REPEATABLE_REMOVED",
  DIRECTIVE_LOCATION_REMOVED: "DIRECTIVE_LOCATION_REMOVED"
});
var DangerousChangeType = Object.freeze({
  VALUE_ADDED_TO_ENUM: "VALUE_ADDED_TO_ENUM",
  TYPE_ADDED_TO_UNION: "TYPE_ADDED_TO_UNION",
  OPTIONAL_INPUT_FIELD_ADDED: "OPTIONAL_INPUT_FIELD_ADDED",
  OPTIONAL_ARG_ADDED: "OPTIONAL_ARG_ADDED",
  IMPLEMENTED_INTERFACE_ADDED: "IMPLEMENTED_INTERFACE_ADDED",
  ARG_DEFAULT_VALUE_CHANGE: "ARG_DEFAULT_VALUE_CHANGE"
});

// node_modules/@aws-amplify/api-rest/dist/esm/errors/RestApiError.mjs
var RestApiError = class _RestApiError extends ApiError {
  constructor(params) {
    super(params);
    this.constructor = _RestApiError;
    Object.setPrototypeOf(this, _RestApiError.prototype);
  }
};

// node_modules/@aws-amplify/api-rest/dist/esm/errors/CanceledError.mjs
var CanceledError = class _CanceledError extends RestApiError {
  constructor(params = {}) {
    super({
      name: "CanceledError",
      message: "Request is canceled by user",
      ...params
    });
    this.constructor = _CanceledError;
    Object.setPrototypeOf(this, _CanceledError.prototype);
  }
};
var isCancelError = (error) => !!error && error instanceof CanceledError;

// node_modules/@aws-amplify/api-rest/dist/esm/errors/validation.mjs
var RestApiValidationErrorCode;
(function(RestApiValidationErrorCode2) {
  RestApiValidationErrorCode2["InvalidApiName"] = "InvalidApiName";
})(RestApiValidationErrorCode || (RestApiValidationErrorCode = {}));
var validationErrorMap = {
  [RestApiValidationErrorCode.InvalidApiName]: {
    message: "API name is invalid.",
    recoverySuggestion: "Check if the API name matches the one in your configuration or `aws-exports.js`"
  }
};

// node_modules/@aws-amplify/api-rest/dist/esm/utils/serviceError.mjs
var parseRestApiServiceError = async (response) => {
  var _a;
  if (!response) {
    return;
  }
  const parsedAwsError = await parseJsonError(stubErrorResponse(response));
  if (!parsedAwsError) ;
  else {
    const bodyText = await ((_a = response.body) == null ? void 0 : _a.text());
    return buildRestApiError(parsedAwsError, {
      statusCode: response.statusCode,
      headers: response.headers,
      body: bodyText
    });
  }
};
var stubErrorResponse = (response) => {
  let bodyTextPromise;
  const bodyProxy = new Proxy(response.body, {
    get(target, prop, receiver) {
      if (prop === "json") {
        return async () => {
          if (!bodyTextPromise) {
            bodyTextPromise = target.text();
          }
          try {
            return JSON.parse(await bodyTextPromise);
          } catch (error) {
            return {};
          }
        };
      } else if (prop === "text") {
        return async () => {
          if (!bodyTextPromise) {
            bodyTextPromise = target.text();
          }
          return bodyTextPromise;
        };
      } else {
        return Reflect.get(target, prop, receiver);
      }
    }
  });
  const responseProxy = new Proxy(response, {
    get(target, prop, receiver) {
      if (prop === "body") {
        return bodyProxy;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    }
  });
  return responseProxy;
};
var buildRestApiError = (error, response) => {
  const restApiError = new RestApiError({
    name: error == null ? void 0 : error.name,
    message: error.message,
    underlyingError: error,
    response
  });
  return Object.assign(restApiError, { $metadata: error.$metadata });
};

// node_modules/@aws-amplify/api-rest/dist/esm/utils/logger.mjs
var logger = new ConsoleLogger("RestApis");

// node_modules/@aws-amplify/api-rest/dist/esm/utils/createCancellableOperation.mjs
function createCancellableOperation(handler, abortController) {
  const isInternalPost = (targetHandler) => !!abortController;
  const publicApisAbortController = new AbortController();
  const publicApisAbortSignal = publicApisAbortController.signal;
  const internalPostAbortSignal = abortController == null ? void 0 : abortController.signal;
  let abortReason;
  const job = async () => {
    try {
      const response = await (isInternalPost(handler) ? handler() : handler(publicApisAbortSignal));
      if (response.statusCode >= 300) {
        throw await parseRestApiServiceError(response);
      }
      return response;
    } catch (error) {
      const abortSignal = internalPostAbortSignal ?? publicApisAbortSignal;
      const message = abortReason ?? abortSignal.reason;
      if (error.name === "AbortError" || (abortSignal == null ? void 0 : abortSignal.aborted) === true) {
        const canceledError = new CanceledError({
          ...message && { message },
          underlyingError: error,
          recoverySuggestion: "The API request was explicitly canceled. If this is not intended, validate if you called the `cancel()` function on the API request erroneously."
        });
        logger.debug(error);
        throw canceledError;
      }
      logger.debug(error);
      throw error;
    }
  };
  if (isInternalPost()) {
    return job();
  } else {
    const cancel3 = (abortMessage) => {
      if (publicApisAbortSignal.aborted === true) {
        return;
      }
      publicApisAbortController.abort(abortMessage);
      if (abortMessage && publicApisAbortSignal.reason !== abortMessage) {
        abortReason = abortMessage;
      }
    };
    return { response: job(), cancel: cancel3 };
  }
}

// node_modules/@aws-amplify/api-rest/dist/esm/utils/constants.mjs
var DEFAULT_REST_IAM_SIGNING_SERVICE = "execute-api";
var DEFAULT_IAM_SIGNING_REGION = "us-east-1";
var APIG_HOSTNAME_PATTERN = /^.+\.([a-z0-9-]+)\.([a-z0-9-]+)\.amazonaws\.com/;

// node_modules/@aws-amplify/api-rest/dist/esm/utils/parseSigningInfo.mjs
var parseSigningInfo = (url, restApiOptions) => {
  var _a, _b, _c;
  const { service: signingService = DEFAULT_REST_IAM_SIGNING_SERVICE, region: signingRegion = DEFAULT_IAM_SIGNING_REGION } = ((_c = (_b = (_a = restApiOptions == null ? void 0 : restApiOptions.amplify.getConfig()) == null ? void 0 : _a.API) == null ? void 0 : _b.REST) == null ? void 0 : _c[restApiOptions == null ? void 0 : restApiOptions.apiName]) ?? {};
  const { hostname } = url;
  const [, service, region] = APIG_HOSTNAME_PATTERN.exec(hostname) ?? [];
  if (service === DEFAULT_REST_IAM_SIGNING_SERVICE) {
    return {
      service,
      region: region ?? signingRegion
    };
  } else if (service === "appsync-api") {
    return {
      service: "appsync",
      region: region ?? signingRegion
    };
  } else {
    return {
      service: signingService,
      region: signingRegion
    };
  }
};

// node_modules/@aws-amplify/api-rest/dist/esm/utils/isIamAuthApplicable.mjs
var isIamAuthApplicableForGraphQL = ({ headers }, signingServiceInfo) => !headers.authorization && !headers["x-api-key"] && !!signingServiceInfo;

// node_modules/@aws-amplify/api-rest/dist/esm/utils/resolveHeaders.mjs
var resolveHeaders = (headers, body) => {
  const normalizedHeaders = {};
  for (const key in headers) {
    normalizedHeaders[key.toLowerCase()] = headers[key];
  }
  if (body) {
    normalizedHeaders["content-type"] = "application/json; charset=UTF-8";
    if (body instanceof FormData) {
      delete normalizedHeaders["content-type"];
    }
  }
  return normalizedHeaders;
};

// node_modules/@aws-amplify/api-rest/dist/esm/apis/common/handler.mjs
var transferHandler = async (amplify, options, iamAuthApplicable, signingServiceInfo) => {
  const { url, method, headers, body, withCredentials, abortSignal } = options;
  const resolvedBody = body ? body instanceof FormData ? body : JSON.stringify(body ?? "") : void 0;
  const resolvedHeaders = resolveHeaders(headers, body);
  const request = {
    url,
    headers: resolvedHeaders,
    method,
    body: resolvedBody
  };
  const baseOptions = {
    retryDecider: getRetryDecider(parseRestApiServiceError),
    computeDelay: jitteredBackoff2,
    withCrossDomainCredentials: withCredentials,
    abortSignal
  };
  const isIamAuthApplicable = iamAuthApplicable(request, signingServiceInfo);
  let response;
  const credentials = await resolveCredentials(amplify);
  if (isIamAuthApplicable && credentials) {
    const signingInfoFromUrl = parseSigningInfo(url);
    const signingService = (signingServiceInfo == null ? void 0 : signingServiceInfo.service) ?? signingInfoFromUrl.service;
    const signingRegion = (signingServiceInfo == null ? void 0 : signingServiceInfo.region) ?? signingInfoFromUrl.region;
    response = await authenticatedHandler(request, {
      ...baseOptions,
      credentials,
      region: signingRegion,
      service: signingService
    });
  } else {
    response = await unauthenticatedHandler(request, {
      ...baseOptions
    });
  }
  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: response.body
  };
};
var resolveCredentials = async (amplify) => {
  try {
    const { credentials } = await amplify.Auth.fetchAuthSession();
    if (credentials) {
      return credentials;
    }
  } catch (e) {
    logger.debug("No credentials available, the request will be unsigned.");
  }
  return null;
};

// node_modules/@aws-amplify/api-rest/dist/esm/apis/common/internalPost.mjs
var cancelTokenMap = /* @__PURE__ */ new WeakMap();
var post3 = (amplify, { url, options, abortController }) => {
  const controller = abortController ?? new AbortController();
  const responsePromise = createCancellableOperation(async () => {
    const response = transferHandler(amplify, {
      url,
      method: "POST",
      ...options,
      abortSignal: controller.signal
    }, isIamAuthApplicableForGraphQL, options == null ? void 0 : options.signingServiceInfo);
    return response;
  }, controller);
  const responseWithCleanUp = responsePromise.finally(() => {
    cancelTokenMap.delete(responseWithCleanUp);
  });
  return responseWithCleanUp;
};
var cancel = (promise, message) => {
  const controller = cancelTokenMap.get(promise);
  if (controller) {
    controller.abort(message);
    if (message && controller.signal.reason !== message) {
      controller.signal.reason = message;
    }
    return true;
  }
  return false;
};
var updateRequestToBeCancellable = (promise, controller) => {
  cancelTokenMap.set(promise, controller);
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/constants.mjs
var MAX_DELAY_MS = 5e3;
var NON_RETRYABLE_CODES = [400, 401, 403];
var NON_RETRYABLE_ERROR_TYPES = [
  "BadRequestException",
  "UnauthorizedException"
];
var CONNECTION_STATE_CHANGE = "ConnectionStateChange";
var MESSAGE_TYPES;
(function(MESSAGE_TYPES2) {
  MESSAGE_TYPES2["GQL_CONNECTION_INIT"] = "connection_init";
  MESSAGE_TYPES2["GQL_CONNECTION_ERROR"] = "connection_error";
  MESSAGE_TYPES2["GQL_CONNECTION_ACK"] = "connection_ack";
  MESSAGE_TYPES2["GQL_START"] = "start";
  MESSAGE_TYPES2["GQL_START_ACK"] = "start_ack";
  MESSAGE_TYPES2["DATA"] = "data";
  MESSAGE_TYPES2["GQL_CONNECTION_KEEP_ALIVE"] = "ka";
  MESSAGE_TYPES2["GQL_STOP"] = "stop";
  MESSAGE_TYPES2["GQL_COMPLETE"] = "complete";
  MESSAGE_TYPES2["GQL_ERROR"] = "error";
  MESSAGE_TYPES2["EVENT_SUBSCRIBE"] = "subscribe";
  MESSAGE_TYPES2["EVENT_PUBLISH"] = "publish";
  MESSAGE_TYPES2["EVENT_SUBSCRIBE_ACK"] = "subscribe_success";
  MESSAGE_TYPES2["EVENT_PUBLISH_ACK"] = "publish_success";
  MESSAGE_TYPES2["EVENT_STOP"] = "unsubscribe";
  MESSAGE_TYPES2["EVENT_COMPLETE"] = "unsubscribe_success";
})(MESSAGE_TYPES || (MESSAGE_TYPES = {}));
var SUBSCRIPTION_STATUS;
(function(SUBSCRIPTION_STATUS2) {
  SUBSCRIPTION_STATUS2[SUBSCRIPTION_STATUS2["PENDING"] = 0] = "PENDING";
  SUBSCRIPTION_STATUS2[SUBSCRIPTION_STATUS2["CONNECTED"] = 1] = "CONNECTED";
  SUBSCRIPTION_STATUS2[SUBSCRIPTION_STATUS2["FAILED"] = 2] = "FAILED";
})(SUBSCRIPTION_STATUS || (SUBSCRIPTION_STATUS = {}));
var SOCKET_STATUS;
(function(SOCKET_STATUS2) {
  SOCKET_STATUS2[SOCKET_STATUS2["CLOSED"] = 0] = "CLOSED";
  SOCKET_STATUS2[SOCKET_STATUS2["READY"] = 1] = "READY";
  SOCKET_STATUS2[SOCKET_STATUS2["CONNECTING"] = 2] = "CONNECTING";
})(SOCKET_STATUS || (SOCKET_STATUS = {}));
var AWS_APPSYNC_REALTIME_HEADERS = {
  accept: "application/json, text/javascript",
  "content-encoding": "amz-1.0",
  "content-type": "application/json; charset=UTF-8"
};
var CONNECTION_INIT_TIMEOUT = 15e3;
var START_ACK_TIMEOUT = 15e3;
var DEFAULT_KEEP_ALIVE_TIMEOUT = 5 * 60 * 1e3;
var DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT = 65 * 1e3;
var RECONNECT_DELAY = 5 * 1e3;
var RECONNECT_INTERVAL = 60 * 1e3;

// node_modules/@aws-amplify/api-graphql/dist/esm/types/PubSub.mjs
var CONTROL_MSG;
(function(CONTROL_MSG3) {
  CONTROL_MSG3["CONNECTION_CLOSED"] = "Connection closed";
  CONTROL_MSG3["CONNECTION_FAILED"] = "Connection failed";
  CONTROL_MSG3["REALTIME_SUBSCRIPTION_INIT_ERROR"] = "AppSync Realtime subscription init error";
  CONTROL_MSG3["SUBSCRIPTION_ACK"] = "Subscription ack";
  CONTROL_MSG3["TIMEOUT_DISCONNECT"] = "Timeout disconnect";
})(CONTROL_MSG || (CONTROL_MSG = {}));
var ConnectionState;
(function(ConnectionState2) {
  ConnectionState2["Connected"] = "Connected";
  ConnectionState2["ConnectedPendingNetwork"] = "ConnectedPendingNetwork";
  ConnectionState2["ConnectionDisrupted"] = "ConnectionDisrupted";
  ConnectionState2["ConnectionDisruptedPendingNetwork"] = "ConnectionDisruptedPendingNetwork";
  ConnectionState2["Connecting"] = "Connecting";
  ConnectionState2["ConnectedPendingDisconnect"] = "ConnectedPendingDisconnect";
  ConnectionState2["Disconnected"] = "Disconnected";
  ConnectionState2["ConnectedPendingKeepAlive"] = "ConnectedPendingKeepAlive";
})(ConnectionState || (ConnectionState = {}));

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/ReachabilityMonitor/index.mjs
var ReachabilityMonitor = () => new Reachability().networkMonitor();

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/ConnectionStateMonitor.mjs
var CONNECTION_CHANGE = {
  KEEP_ALIVE_MISSED: { keepAliveState: "unhealthy" },
  KEEP_ALIVE: { keepAliveState: "healthy" },
  CONNECTION_ESTABLISHED: { connectionState: "connected" },
  CONNECTION_FAILED: {
    intendedConnectionState: "disconnected",
    connectionState: "disconnected"
  },
  CLOSING_CONNECTION: { intendedConnectionState: "disconnected" },
  OPENING_CONNECTION: {
    intendedConnectionState: "connected",
    connectionState: "connecting"
  },
  CLOSED: { connectionState: "disconnected" },
  ONLINE: { networkState: "connected" },
  OFFLINE: { networkState: "disconnected" }
};
var ConnectionStateMonitor = class {
  constructor() {
    this._networkMonitoringSubscription = void 0;
    this._linkedConnectionState = {
      networkState: "connected",
      connectionState: "disconnected",
      intendedConnectionState: "disconnected",
      keepAliveState: "healthy"
    };
    this._initialNetworkStateSubscription = ReachabilityMonitor().subscribe(({ online }) => {
      var _a;
      this.record(online ? CONNECTION_CHANGE.ONLINE : CONNECTION_CHANGE.OFFLINE);
      (_a = this._initialNetworkStateSubscription) == null ? void 0 : _a.unsubscribe();
    });
    this._linkedConnectionStateObservable = new Observable((connectionStateObserver) => {
      connectionStateObserver.next(this._linkedConnectionState);
      this._linkedConnectionStateObserver = connectionStateObserver;
    });
  }
  /**
   * Turn network state monitoring on if it isn't on already
   */
  enableNetworkMonitoring() {
    var _a;
    (_a = this._initialNetworkStateSubscription) == null ? void 0 : _a.unsubscribe();
    if (this._networkMonitoringSubscription === void 0) {
      this._networkMonitoringSubscription = ReachabilityMonitor().subscribe(({ online }) => {
        this.record(online ? CONNECTION_CHANGE.ONLINE : CONNECTION_CHANGE.OFFLINE);
      });
    }
  }
  /**
   * Turn network state monitoring off if it isn't off already
   */
  disableNetworkMonitoring() {
    var _a;
    (_a = this._networkMonitoringSubscription) == null ? void 0 : _a.unsubscribe();
    this._networkMonitoringSubscription = void 0;
  }
  /**
   * Get the observable that allows us to monitor the connection state
   *
   * @returns {Observable<ConnectionState>} - The observable that emits ConnectionState updates
   */
  get connectionStateObservable() {
    let previous;
    return this._linkedConnectionStateObservable.pipe(map((value) => {
      return this.connectionStatesTranslator(value);
    })).pipe(filter((current) => {
      const toInclude = current !== previous;
      previous = current;
      return toInclude;
    }));
  }
  /*
   * Updates local connection state and emits the full state to the observer.
   */
  record(statusUpdates) {
    var _a;
    if (statusUpdates.intendedConnectionState === "connected") {
      this.enableNetworkMonitoring();
    } else if (statusUpdates.intendedConnectionState === "disconnected") {
      this.disableNetworkMonitoring();
    }
    const newSocketStatus = {
      ...this._linkedConnectionState,
      ...statusUpdates
    };
    this._linkedConnectionState = { ...newSocketStatus };
    (_a = this._linkedConnectionStateObserver) == null ? void 0 : _a.next(this._linkedConnectionState);
  }
  /*
   * Translate the ConnectionState structure into a specific ConnectionState string literal union
   */
  connectionStatesTranslator({ connectionState, networkState, intendedConnectionState, keepAliveState }) {
    if (connectionState === "connected" && networkState === "disconnected")
      return ConnectionState.ConnectedPendingNetwork;
    if (connectionState === "connected" && intendedConnectionState === "disconnected")
      return ConnectionState.ConnectedPendingDisconnect;
    if (connectionState === "disconnected" && intendedConnectionState === "connected" && networkState === "disconnected")
      return ConnectionState.ConnectionDisruptedPendingNetwork;
    if (connectionState === "disconnected" && intendedConnectionState === "connected")
      return ConnectionState.ConnectionDisrupted;
    if (connectionState === "connected" && keepAliveState === "unhealthy")
      return ConnectionState.ConnectedPendingKeepAlive;
    if (connectionState === "connecting")
      return ConnectionState.Connecting;
    if (connectionState === "disconnected")
      return ConnectionState.Disconnected;
    return ConnectionState.Connected;
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/ReconnectionMonitor.mjs
var ReconnectEvent;
(function(ReconnectEvent2) {
  ReconnectEvent2["START_RECONNECT"] = "START_RECONNECT";
  ReconnectEvent2["HALT_RECONNECT"] = "HALT_RECONNECT";
})(ReconnectEvent || (ReconnectEvent = {}));
var ReconnectionMonitor = class {
  constructor() {
    this.reconnectObservers = [];
  }
  /**
   * Add reconnect observer to the list of observers to alert on reconnect
   */
  addObserver(reconnectObserver) {
    this.reconnectObservers.push(reconnectObserver);
  }
  /**
   * Given a reconnect event, start the appropriate behavior
   */
  record(event) {
    if (event === ReconnectEvent.START_RECONNECT) {
      if (this.reconnectSetTimeoutId === void 0 && this.reconnectIntervalId === void 0) {
        this.reconnectSetTimeoutId = setTimeout(() => {
          this._triggerReconnect();
          this.reconnectIntervalId = setInterval(() => {
            this._triggerReconnect();
          }, RECONNECT_INTERVAL);
        }, RECONNECT_DELAY);
      }
    }
    if (event === ReconnectEvent.HALT_RECONNECT) {
      if (this.reconnectIntervalId) {
        clearInterval(this.reconnectIntervalId);
        this.reconnectIntervalId = void 0;
      }
      if (this.reconnectSetTimeoutId) {
        clearTimeout(this.reconnectSetTimeoutId);
        this.reconnectSetTimeoutId = void 0;
      }
    }
  }
  /**
   * Complete all reconnect observers
   */
  close() {
    this.reconnectObservers.forEach((reconnectObserver) => {
      var _a;
      (_a = reconnectObserver.complete) == null ? void 0 : _a.call(reconnectObserver);
    });
  }
  _triggerReconnect() {
    this.reconnectObservers.forEach((reconnectObserver) => {
      var _a;
      (_a = reconnectObserver.next) == null ? void 0 : _a.call(reconnectObserver);
    });
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/AWSWebSocketProvider/appsyncUrl.mjs
var protocol = "wss://";
var standardDomainPattern = /^https:\/\/\w{26}\.appsync-api\.\w{2}(?:(?:-\w{2,})+)-\d\.amazonaws.com(?:\.cn)?\/graphql$/i;
var eventDomainPattern = /^https:\/\/\w{26}\.\w+-api\.\w{2}(?:(?:-\w{2,})+)-\d\.amazonaws.com(?:\.cn)?\/event$/i;
var customDomainPath = "/realtime";
var isCustomDomain = (url) => {
  return url.match(standardDomainPattern) === null;
};
var isEventDomain = (url) => url.match(eventDomainPattern) !== null;
var getRealtimeEndpointUrl = (appSyncGraphqlEndpoint) => {
  let realtimeEndpoint = appSyncGraphqlEndpoint ?? "";
  if (isEventDomain(realtimeEndpoint)) {
    realtimeEndpoint = realtimeEndpoint.concat(customDomainPath).replace("ddpg-api", "grt-gamma").replace("appsync-api", "appsync-realtime-api");
  } else if (isCustomDomain(realtimeEndpoint)) {
    realtimeEndpoint = realtimeEndpoint.concat(customDomainPath);
  } else {
    realtimeEndpoint = realtimeEndpoint.replace("appsync-api", "appsync-realtime-api").replace("gogi-beta", "grt-beta").replace("ddpg-api", "grt-gamma");
  }
  realtimeEndpoint = realtimeEndpoint.replace("https://", protocol).replace("http://", protocol);
  return new AmplifyUrl(realtimeEndpoint);
};
var extractNonAuthHeaders = (headers) => {
  if (!headers) {
    return {};
  }
  if ("Authorization" in headers) {
    const { Authorization: _2, ...nonAuthHeaders } = headers;
    return nonAuthHeaders;
  }
  return headers;
};
var queryParamsFromCustomHeaders = (headers) => {
  const nonAuthHeaders = extractNonAuthHeaders(headers);
  const params = new AmplifyUrlSearchParams();
  Object.entries(nonAuthHeaders).forEach(([k2, v2]) => {
    params.append(k2, v2);
  });
  return params;
};
var realtimeUrlWithQueryString = (appSyncGraphqlEndpoint, urlParams) => {
  const realtimeEndpointUrl = getRealtimeEndpointUrl(appSyncGraphqlEndpoint);
  const existingParams = new AmplifyUrlSearchParams(realtimeEndpointUrl.search);
  for (const [k2, v2] of urlParams.entries()) {
    existingParams.append(k2, v2);
  }
  realtimeEndpointUrl.search = existingParams.toString();
  return realtimeEndpointUrl.toString();
};
var additionalHeadersFromOptions = async (options) => {
  const { appSyncGraphqlEndpoint, query, libraryConfigHeaders = () => ({}), additionalHeaders = {}, authToken } = options;
  let additionalCustomHeaders = {};
  const _libraryConfigHeaders = await libraryConfigHeaders();
  if (typeof additionalHeaders === "function") {
    const requestOptions = {
      url: appSyncGraphqlEndpoint || "",
      queryString: query || ""
    };
    additionalCustomHeaders = await additionalHeaders(requestOptions);
  } else {
    additionalCustomHeaders = additionalHeaders;
  }
  if (authToken) {
    additionalCustomHeaders = {
      ...additionalCustomHeaders,
      Authorization: authToken
    };
  }
  return {
    additionalCustomHeaders,
    libraryConfigHeaders: _libraryConfigHeaders
  };
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/AWSWebSocketProvider/authHeaders.mjs
var logger2 = new ConsoleLogger("AWSAppSyncRealTimeProvider Auth");
var awsAuthTokenHeader = async ({ host }) => {
  var _a, _b;
  const session = await fetchAuthSession();
  return {
    Authorization: (_b = (_a = session == null ? void 0 : session.tokens) == null ? void 0 : _a.accessToken) == null ? void 0 : _b.toString(),
    host
  };
};
var awsRealTimeApiKeyHeader = async ({ apiKey, host }) => {
  const dt = /* @__PURE__ */ new Date();
  const dtStr = dt.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    host,
    "x-amz-date": dtStr,
    "x-api-key": apiKey
  };
};
var awsRealTimeIAMHeader = async ({ payload, canonicalUri, appSyncGraphqlEndpoint, region }) => {
  const endpointInfo = {
    region,
    service: "appsync"
  };
  const creds = (await fetchAuthSession()).credentials;
  const request = {
    url: `${appSyncGraphqlEndpoint}${canonicalUri}`,
    data: payload,
    method: "POST",
    headers: { ...AWS_APPSYNC_REALTIME_HEADERS }
  };
  const signedParams = signRequest({
    headers: request.headers,
    method: request.method,
    url: new AmplifyUrl(request.url),
    body: request.data
  }, {
    credentials: creds,
    signingRegion: endpointInfo.region,
    signingService: endpointInfo.service
  });
  return signedParams.headers;
};
var customAuthHeader = async ({ host, additionalCustomHeaders }) => {
  if (!(additionalCustomHeaders == null ? void 0 : additionalCustomHeaders.Authorization)) {
    throw new Error("No auth token specified");
  }
  return {
    Authorization: additionalCustomHeaders.Authorization,
    host
  };
};
var awsRealTimeHeaderBasedAuth = async ({ apiKey, authenticationType, canonicalUri, appSyncGraphqlEndpoint, region, additionalCustomHeaders, payload }) => {
  const headerHandler = {
    apiKey: awsRealTimeApiKeyHeader,
    iam: awsRealTimeIAMHeader,
    oidc: awsAuthTokenHeader,
    userPool: awsAuthTokenHeader,
    lambda: customAuthHeader,
    none: customAuthHeader
  };
  if (!authenticationType || !headerHandler[authenticationType]) {
    logger2.debug(`Authentication type ${authenticationType} not supported`);
    return void 0;
  } else {
    const handler = headerHandler[authenticationType];
    const host = appSyncGraphqlEndpoint ? new AmplifyUrl(appSyncGraphqlEndpoint).host : void 0;
    const resolvedApiKey = authenticationType === "apiKey" ? apiKey : void 0;
    logger2.debug(`Authenticating with ${JSON.stringify(authenticationType)}`);
    const result = await handler({
      payload,
      canonicalUri,
      appSyncGraphqlEndpoint,
      apiKey: resolvedApiKey,
      region,
      host,
      additionalCustomHeaders
    });
    return result;
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/AWSWebSocketProvider/index.mjs
var dispatchApiEvent = (payload) => {
  Hub.dispatch("api", payload, "PubSub", AMPLIFY_SYMBOL);
};
var AWSWebSocketProvider = class {
  constructor(args) {
    this.subscriptionObserverMap = /* @__PURE__ */ new Map();
    this.socketStatus = SOCKET_STATUS.CLOSED;
    this.keepAliveTimeout = DEFAULT_KEEP_ALIVE_TIMEOUT;
    this.promiseArray = [];
    this.connectionStateMonitor = new ConnectionStateMonitor();
    this.reconnectionMonitor = new ReconnectionMonitor();
    this._establishConnection = async (awsRealTimeUrl, subprotocol) => {
      this.logger.debug(`Establishing WebSocket connection to ${awsRealTimeUrl}`);
      try {
        await this._openConnection(awsRealTimeUrl, subprotocol);
        await this._initiateHandshake();
      } catch (err) {
        const { errorType, errorCode } = err;
        if (NON_RETRYABLE_CODES.includes(errorCode) || // Event API does not currently return `errorCode`. This may change in the future.
        // For now fall back to also checking known non-retryable error types
        NON_RETRYABLE_ERROR_TYPES.includes(errorType)) {
          throw new NonRetryableError(errorType);
        } else if (errorType) {
          throw new Error(errorType);
        } else {
          throw err;
        }
      }
    };
    this.logger = new ConsoleLogger(args.providerName);
    this.wsProtocolName = args.wsProtocolName;
    this.connectionStateMonitorSubscription = this._startConnectionStateMonitoring();
  }
  /**
   * Mark the socket closed and release all active listeners
   */
  close() {
    this.socketStatus = SOCKET_STATUS.CLOSED;
    this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_FAILED);
    this.connectionStateMonitorSubscription.unsubscribe();
    this.reconnectionMonitor.close();
  }
  subscribe(options, customUserAgentDetails) {
    return new Observable((observer) => {
      if (!(options == null ? void 0 : options.appSyncGraphqlEndpoint)) {
        observer.error({
          errors: [
            {
              ...new GraphQLError(`Subscribe only available for AWS AppSync endpoint`)
            }
          ]
        });
        observer.complete();
        return;
      }
      let subscriptionStartInProgress = false;
      const subscriptionId = amplifyUuid();
      const startSubscription = () => {
        if (!subscriptionStartInProgress) {
          subscriptionStartInProgress = true;
          this._startSubscriptionWithAWSAppSyncRealTime({
            options,
            observer,
            subscriptionId,
            customUserAgentDetails
          }).catch((err) => {
            this.logger.debug(`${CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR}: ${err}`);
            this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
          }).finally(() => {
            subscriptionStartInProgress = false;
          });
        }
      };
      const reconnectSubscription = new Observable((reconnectSubscriptionObserver) => {
        this.reconnectionMonitor.addObserver(reconnectSubscriptionObserver);
      }).subscribe(() => {
        startSubscription();
      });
      startSubscription();
      return async () => {
        await this._cleanupSubscription(subscriptionId, reconnectSubscription);
      };
    });
  }
  async connect(options) {
    if (this.socketStatus === SOCKET_STATUS.READY) {
      return;
    }
    await this._connectWebSocket(options);
  }
  async publish(options, customUserAgentDetails) {
    if (this.socketStatus !== SOCKET_STATUS.READY) {
      throw new Error("Subscription has not been initialized");
    }
    return this._publishMessage(options, customUserAgentDetails);
  }
  async _connectWebSocket(options) {
    const { apiKey, appSyncGraphqlEndpoint, authenticationType, region } = options;
    const { additionalCustomHeaders } = await additionalHeadersFromOptions(options);
    this.connectionStateMonitor.record(CONNECTION_CHANGE.OPENING_CONNECTION);
    await this._initializeWebSocketConnection({
      apiKey,
      appSyncGraphqlEndpoint,
      authenticationType,
      region,
      additionalCustomHeaders
    });
  }
  async _publishMessage(options, customUserAgentDetails) {
    const subscriptionId = amplifyUuid();
    const { additionalCustomHeaders, libraryConfigHeaders } = await additionalHeadersFromOptions(options);
    const serializedSubscriptionMessage = await this._prepareSubscriptionPayload({
      options,
      subscriptionId,
      customUserAgentDetails,
      additionalCustomHeaders,
      libraryConfigHeaders,
      publish: true
    });
    return new Promise((resolve4, reject) => {
      if (this.awsRealTimeSocket) {
        const publishListener = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === subscriptionId && data.type === "publish_success") {
            this.awsRealTimeSocket && this.awsRealTimeSocket.removeEventListener("message", publishListener);
            resolve4();
          }
          if (data.erroredEvents && data.erroredEvents.length > 0) ;
        };
        this.awsRealTimeSocket.addEventListener("message", publishListener);
        this.awsRealTimeSocket.addEventListener("close", () => {
          reject(new Error("WebSocket is closed"));
        });
        this.awsRealTimeSocket.send(serializedSubscriptionMessage);
      }
    });
  }
  async _cleanupSubscription(subscriptionId, reconnectSubscription) {
    reconnectSubscription == null ? void 0 : reconnectSubscription.unsubscribe();
    try {
      await this._waitForSubscriptionToBeConnected(subscriptionId);
      const { subscriptionState } = this.subscriptionObserverMap.get(subscriptionId) || {};
      if (!subscriptionState) {
        return;
      }
      if (subscriptionState === SUBSCRIPTION_STATUS.CONNECTED) {
        this._sendUnsubscriptionMessage(subscriptionId);
      } else {
        throw new Error("Subscription never connected");
      }
    } catch (err) {
      this.logger.debug(`Error while unsubscribing ${err}`);
    } finally {
      this._removeSubscriptionObserver(subscriptionId);
    }
  }
  // Monitor the connection state and pass changes along to Hub
  _startConnectionStateMonitoring() {
    return this.connectionStateMonitor.connectionStateObservable.subscribe((connectionState) => {
      dispatchApiEvent({
        event: CONNECTION_STATE_CHANGE,
        data: {
          provider: this,
          connectionState
        },
        message: `Connection state is ${connectionState}`
      });
      this.connectionState = connectionState;
      if (connectionState === ConnectionState.ConnectionDisrupted) {
        this.reconnectionMonitor.record(ReconnectEvent.START_RECONNECT);
      }
      if ([
        ConnectionState.Connected,
        ConnectionState.ConnectedPendingDisconnect,
        ConnectionState.ConnectedPendingKeepAlive,
        ConnectionState.ConnectedPendingNetwork,
        ConnectionState.ConnectionDisruptedPendingNetwork,
        ConnectionState.Disconnected
      ].includes(connectionState)) {
        this.reconnectionMonitor.record(ReconnectEvent.HALT_RECONNECT);
      }
    });
  }
  async _startSubscriptionWithAWSAppSyncRealTime({ options, observer, subscriptionId, customUserAgentDetails }) {
    const { query, variables } = options;
    const { additionalCustomHeaders, libraryConfigHeaders } = await additionalHeadersFromOptions(options);
    this.subscriptionObserverMap.set(subscriptionId, {
      observer,
      query: query ?? "",
      variables: variables ?? {},
      subscriptionState: SUBSCRIPTION_STATUS.PENDING,
      startAckTimeoutId: void 0
    });
    const serializedSubscriptionMessage = await this._prepareSubscriptionPayload({
      options,
      subscriptionId,
      customUserAgentDetails,
      additionalCustomHeaders,
      libraryConfigHeaders
    });
    try {
      await this._connectWebSocket(options);
    } catch (err) {
      this._logStartSubscriptionError(subscriptionId, observer, err);
      return;
    }
    const { subscriptionFailedCallback, subscriptionReadyCallback } = this.subscriptionObserverMap.get(subscriptionId) ?? {};
    this.subscriptionObserverMap.set(subscriptionId, {
      observer,
      subscriptionState: SUBSCRIPTION_STATUS.PENDING,
      query: query ?? "",
      variables: variables ?? {},
      subscriptionReadyCallback,
      subscriptionFailedCallback,
      startAckTimeoutId: setTimeout(() => {
        this._timeoutStartSubscriptionAck(subscriptionId);
      }, START_ACK_TIMEOUT)
    });
    if (this.awsRealTimeSocket) {
      this.awsRealTimeSocket.send(serializedSubscriptionMessage);
    }
  }
  // Log logic for start subscription failures
  _logStartSubscriptionError(subscriptionId, observer, err) {
    this.logger.debug({ err });
    const message = String(err.message ?? "");
    this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
    if (this.connectionState !== ConnectionState.ConnectionDisruptedPendingNetwork) {
      if (isNonRetryableError(err)) {
        observer.error({
          errors: [
            {
              ...new GraphQLError(`${CONTROL_MSG.CONNECTION_FAILED}: ${message}`)
            }
          ]
        });
      } else {
        this.logger.debug(`${CONTROL_MSG.CONNECTION_FAILED}: ${message}`);
      }
      const { subscriptionFailedCallback } = this.subscriptionObserverMap.get(subscriptionId) || {};
      if (typeof subscriptionFailedCallback === "function") {
        subscriptionFailedCallback();
      }
    }
  }
  // Waiting that subscription has been connected before trying to unsubscribe
  async _waitForSubscriptionToBeConnected(subscriptionId) {
    const subscriptionObserver = this.subscriptionObserverMap.get(subscriptionId);
    if (subscriptionObserver) {
      const { subscriptionState } = subscriptionObserver;
      if (subscriptionState === SUBSCRIPTION_STATUS.PENDING) {
        return new Promise((resolve4, reject) => {
          const { observer, subscriptionState: observedSubscriptionState, variables, query } = subscriptionObserver;
          this.subscriptionObserverMap.set(subscriptionId, {
            observer,
            subscriptionState: observedSubscriptionState,
            variables,
            query,
            subscriptionReadyCallback: resolve4,
            subscriptionFailedCallback: reject
          });
        });
      }
    }
  }
  _sendUnsubscriptionMessage(subscriptionId) {
    try {
      if (this.awsRealTimeSocket && this.awsRealTimeSocket.readyState === WebSocket.OPEN && this.socketStatus === SOCKET_STATUS.READY) {
        const unsubscribeMessage = this._unsubscribeMessage(subscriptionId);
        const stringToAWSRealTime = JSON.stringify(unsubscribeMessage);
        this.awsRealTimeSocket.send(stringToAWSRealTime);
      }
    } catch (err) {
      this.logger.debug({ err });
    }
  }
  _removeSubscriptionObserver(subscriptionId) {
    this.subscriptionObserverMap.delete(subscriptionId);
    setTimeout(this._closeSocketIfRequired.bind(this), 1e3);
  }
  _closeSocketIfRequired() {
    if (this.subscriptionObserverMap.size > 0) {
      return;
    }
    if (!this.awsRealTimeSocket) {
      this.socketStatus = SOCKET_STATUS.CLOSED;
      return;
    }
    this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSING_CONNECTION);
    if (this.awsRealTimeSocket.bufferedAmount > 0) {
      setTimeout(this._closeSocketIfRequired.bind(this), 1e3);
    } else {
      this.logger.debug("closing WebSocket...");
      if (this.keepAliveTimeoutId) {
        clearTimeout(this.keepAliveTimeoutId);
      }
      if (this.keepAliveAlertTimeoutId) {
        clearTimeout(this.keepAliveAlertTimeoutId);
      }
      const tempSocket = this.awsRealTimeSocket;
      tempSocket.onclose = null;
      tempSocket.onerror = null;
      tempSocket.close(1e3);
      this.awsRealTimeSocket = void 0;
      this.socketStatus = SOCKET_STATUS.CLOSED;
      this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
    }
  }
  _handleIncomingSubscriptionMessage(message) {
    if (typeof message.data !== "string") {
      return;
    }
    const [isData, data] = this._handleSubscriptionData(message);
    if (isData)
      return;
    const { type, id, payload } = data;
    const { observer = null, query = "", variables = {}, startAckTimeoutId, subscriptionReadyCallback, subscriptionFailedCallback } = this.subscriptionObserverMap.get(id) || {};
    if (type === MESSAGE_TYPES.GQL_START_ACK || type === MESSAGE_TYPES.EVENT_SUBSCRIBE_ACK) {
      this.logger.debug(`subscription ready for ${JSON.stringify({ query, variables })}`);
      if (typeof subscriptionReadyCallback === "function") {
        subscriptionReadyCallback();
      }
      if (startAckTimeoutId)
        clearTimeout(startAckTimeoutId);
      dispatchApiEvent({
        event: CONTROL_MSG.SUBSCRIPTION_ACK,
        data: { query, variables },
        message: "Connection established for subscription"
      });
      const subscriptionState = SUBSCRIPTION_STATUS.CONNECTED;
      if (observer) {
        this.subscriptionObserverMap.set(id, {
          observer,
          query,
          variables,
          startAckTimeoutId: void 0,
          subscriptionState,
          subscriptionReadyCallback,
          subscriptionFailedCallback
        });
      }
      this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_ESTABLISHED);
      return;
    }
    if (type === MESSAGE_TYPES.GQL_CONNECTION_KEEP_ALIVE) {
      if (this.keepAliveTimeoutId)
        clearTimeout(this.keepAliveTimeoutId);
      if (this.keepAliveAlertTimeoutId)
        clearTimeout(this.keepAliveAlertTimeoutId);
      this.keepAliveTimeoutId = setTimeout(() => {
        this._errorDisconnect(CONTROL_MSG.TIMEOUT_DISCONNECT);
      }, this.keepAliveTimeout);
      this.keepAliveAlertTimeoutId = setTimeout(() => {
        this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE_MISSED);
      }, DEFAULT_KEEP_ALIVE_ALERT_TIMEOUT);
      this.connectionStateMonitor.record(CONNECTION_CHANGE.KEEP_ALIVE);
      return;
    }
    if (type === MESSAGE_TYPES.GQL_ERROR) {
      const subscriptionState = SUBSCRIPTION_STATUS.FAILED;
      if (observer) {
        this.subscriptionObserverMap.set(id, {
          observer,
          query,
          variables,
          startAckTimeoutId,
          subscriptionReadyCallback,
          subscriptionFailedCallback,
          subscriptionState
        });
        this.logger.debug(`${CONTROL_MSG.CONNECTION_FAILED}: ${JSON.stringify(payload ?? data)}`);
        observer.error({
          errors: [
            {
              ...new GraphQLError(`${CONTROL_MSG.CONNECTION_FAILED}: ${JSON.stringify(payload ?? data)}`)
            }
          ]
        });
        if (startAckTimeoutId)
          clearTimeout(startAckTimeoutId);
        if (typeof subscriptionFailedCallback === "function") {
          subscriptionFailedCallback();
        }
      }
    }
  }
  _errorDisconnect(msg) {
    this.logger.debug(`Disconnect error: ${msg}`);
    if (this.awsRealTimeSocket) {
      this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
      this.awsRealTimeSocket.close();
    }
    this.socketStatus = SOCKET_STATUS.CLOSED;
  }
  _timeoutStartSubscriptionAck(subscriptionId) {
    const subscriptionObserver = this.subscriptionObserverMap.get(subscriptionId);
    if (subscriptionObserver) {
      const { observer, query, variables } = subscriptionObserver;
      if (!observer) {
        return;
      }
      this.subscriptionObserverMap.set(subscriptionId, {
        observer,
        query,
        variables,
        subscriptionState: SUBSCRIPTION_STATUS.FAILED
      });
      this.connectionStateMonitor.record(CONNECTION_CHANGE.CLOSED);
      this.logger.debug("timeoutStartSubscription", JSON.stringify({ query, variables }));
    }
  }
  _initializeWebSocketConnection({ appSyncGraphqlEndpoint, authenticationType, apiKey, region, additionalCustomHeaders }) {
    if (this.socketStatus === SOCKET_STATUS.READY) {
      return;
    }
    return new Promise(async (resolve4, reject) => {
      this.promiseArray.push({ res: resolve4, rej: reject });
      if (this.socketStatus === SOCKET_STATUS.CLOSED) {
        try {
          this.socketStatus = SOCKET_STATUS.CONNECTING;
          const payloadString = "{}";
          const authHeader = await awsRealTimeHeaderBasedAuth({
            authenticationType,
            payload: payloadString,
            canonicalUri: "/connect",
            apiKey,
            appSyncGraphqlEndpoint,
            region,
            additionalCustomHeaders
          });
          const headerString = authHeader ? JSON.stringify(authHeader) : "";
          const encodedHeader = base64Encoder.convert(headerString, {
            urlSafe: true,
            skipPadding: true
          });
          const authTokenSubprotocol = `header-${encodedHeader}`;
          const queryParams = queryParamsFromCustomHeaders(additionalCustomHeaders);
          const awsRealTimeUrl = realtimeUrlWithQueryString(appSyncGraphqlEndpoint, queryParams);
          await this._establishRetryableConnection(awsRealTimeUrl, authTokenSubprotocol);
          this.promiseArray.forEach(({ res }) => {
            this.logger.debug("Notifying connection successful");
            res();
          });
          this.socketStatus = SOCKET_STATUS.READY;
          this.promiseArray = [];
        } catch (err) {
          this.logger.debug("Connection exited with", err);
          this.promiseArray.forEach(({ rej }) => {
            rej(err);
          });
          this.promiseArray = [];
          if (this.awsRealTimeSocket && this.awsRealTimeSocket.readyState === WebSocket.OPEN) {
            this.awsRealTimeSocket.close(3001);
          }
          this.awsRealTimeSocket = void 0;
          this.socketStatus = SOCKET_STATUS.CLOSED;
        }
      }
    });
  }
  async _establishRetryableConnection(awsRealTimeUrl, subprotocol) {
    this.logger.debug(`Establishing retryable connection`);
    await jitteredExponentialRetry(this._establishConnection.bind(this), [awsRealTimeUrl, subprotocol], MAX_DELAY_MS);
  }
  async _openConnection(awsRealTimeUrl, subprotocol) {
    return new Promise((resolve4, reject) => {
      const newSocket = this._getNewWebSocket(awsRealTimeUrl, [
        this.wsProtocolName,
        subprotocol
      ]);
      newSocket.onerror = () => {
        this.logger.debug(`WebSocket connection error`);
      };
      newSocket.onclose = () => {
        reject(new Error("Connection handshake error"));
      };
      newSocket.onopen = () => {
        this.awsRealTimeSocket = newSocket;
        resolve4();
      };
    });
  }
  _getNewWebSocket(url, protocol2) {
    return new WebSocket(url, protocol2);
  }
  async _initiateHandshake() {
    return new Promise((resolve4, reject) => {
      if (!this.awsRealTimeSocket) {
        reject(new Error("awsRealTimeSocket undefined"));
        return;
      }
      let ackOk = false;
      this.awsRealTimeSocket.onerror = (error) => {
        this.logger.debug(`WebSocket error ${JSON.stringify(error)}`);
      };
      this.awsRealTimeSocket.onclose = (event) => {
        this.logger.debug(`WebSocket closed ${event.reason}`);
        reject(new Error(JSON.stringify(event)));
      };
      this.awsRealTimeSocket.onmessage = (message) => {
        if (typeof message.data !== "string") {
          return;
        }
        this.logger.debug(`subscription message from AWS AppSyncRealTime: ${message.data} `);
        const data = JSON.parse(message.data);
        const { type } = data;
        const connectionTimeoutMs = this._extractConnectionTimeout(data);
        if (type === MESSAGE_TYPES.GQL_CONNECTION_ACK) {
          ackOk = true;
          this._registerWebsocketHandlers(connectionTimeoutMs);
          resolve4("Connected to AWS AppSyncRealTime");
          return;
        }
        if (type === MESSAGE_TYPES.GQL_CONNECTION_ERROR) {
          const { errorType, errorCode } = this._extractErrorCodeAndType(data);
          reject({ errorType, errorCode });
        }
      };
      const gqlInit = {
        type: MESSAGE_TYPES.GQL_CONNECTION_INIT
      };
      this.awsRealTimeSocket.send(JSON.stringify(gqlInit));
      const checkAckOk = (targetAckOk) => {
        if (!targetAckOk) {
          this.connectionStateMonitor.record(CONNECTION_CHANGE.CONNECTION_FAILED);
          reject(new Error(`Connection timeout: ack from AWSAppSyncRealTime was not received after ${CONNECTION_INIT_TIMEOUT} ms`));
        }
      };
      setTimeout(() => {
        checkAckOk(ackOk);
      }, CONNECTION_INIT_TIMEOUT);
    });
  }
  _registerWebsocketHandlers(connectionTimeoutMs) {
    if (!this.awsRealTimeSocket) {
      return;
    }
    this.keepAliveTimeout = connectionTimeoutMs;
    this.awsRealTimeSocket.onmessage = this._handleIncomingSubscriptionMessage.bind(this);
    this.awsRealTimeSocket.onerror = (err) => {
      this.logger.debug(err);
      this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
    };
    this.awsRealTimeSocket.onclose = (event) => {
      this.logger.debug(`WebSocket closed ${event.reason}`);
      this._errorDisconnect(CONTROL_MSG.CONNECTION_CLOSED);
    };
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/AWSAppSyncRealTimeProvider/index.mjs
var PROVIDER_NAME = "AWSAppSyncRealTimeProvider";
var WS_PROTOCOL_NAME = "graphql-ws";
var AWSAppSyncRealTimeProvider = class extends AWSWebSocketProvider {
  constructor() {
    super({ providerName: PROVIDER_NAME, wsProtocolName: WS_PROTOCOL_NAME });
  }
  getProviderName() {
    return PROVIDER_NAME;
  }
  subscribe(options, customUserAgentDetails) {
    return super.subscribe(options, customUserAgentDetails);
  }
  async _prepareSubscriptionPayload({ options, subscriptionId, customUserAgentDetails, additionalCustomHeaders, libraryConfigHeaders }) {
    const { appSyncGraphqlEndpoint, authenticationType, query, variables, apiKey, region } = options;
    const data = {
      query,
      variables
    };
    const serializedData = JSON.stringify(data);
    const headers = {
      ...await awsRealTimeHeaderBasedAuth({
        apiKey,
        appSyncGraphqlEndpoint,
        authenticationType,
        payload: serializedData,
        canonicalUri: "",
        region,
        additionalCustomHeaders
      }),
      ...libraryConfigHeaders,
      ...additionalCustomHeaders,
      [USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails)
    };
    const subscriptionMessage = {
      id: subscriptionId,
      payload: {
        data: serializedData,
        extensions: {
          authorization: {
            ...headers
          }
        }
      },
      type: MESSAGE_TYPES.GQL_START
    };
    const serializedSubscriptionMessage = JSON.stringify(subscriptionMessage);
    return serializedSubscriptionMessage;
  }
  _handleSubscriptionData(message) {
    this.logger.debug(`subscription message from AWS AppSync RealTime: ${message.data}`);
    const { id = "", payload, type } = JSON.parse(String(message.data));
    const { observer = null, query = "", variables = {} } = this.subscriptionObserverMap.get(id) || {};
    this.logger.debug({ id, observer, query, variables });
    if (type === MESSAGE_TYPES.DATA && payload && payload.data) {
      if (observer) {
        observer.next(payload);
      } else {
        this.logger.debug(`observer not found for id: ${id}`);
      }
      return [true, { id, type, payload }];
    }
    return [false, { id, type, payload }];
  }
  _unsubscribeMessage(subscriptionId) {
    return {
      id: subscriptionId,
      type: MESSAGE_TYPES.GQL_STOP
    };
  }
  _extractConnectionTimeout(data) {
    const { payload: { connectionTimeoutMs = DEFAULT_KEEP_ALIVE_TIMEOUT } = {} } = data;
    return connectionTimeoutMs;
  }
  _extractErrorCodeAndType(data) {
    const { payload: { errors: [{ errorType = "", errorCode = 0 } = {}] = [] } = {} } = data;
    return { errorCode, errorType };
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/GraphQLApiError.mjs
var GraphQLApiError = class _GraphQLApiError extends AmplifyError {
  constructor(params) {
    super(params);
    this.constructor = _GraphQLApiError;
    Object.setPrototypeOf(this, _GraphQLApiError.prototype);
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/validation.mjs
var APIValidationErrorCode;
(function(APIValidationErrorCode2) {
  APIValidationErrorCode2["NoAuthSession"] = "NoAuthSession";
  APIValidationErrorCode2["NoRegion"] = "NoRegion";
  APIValidationErrorCode2["NoCustomEndpoint"] = "NoCustomEndpoint";
})(APIValidationErrorCode || (APIValidationErrorCode = {}));
var validationErrorMap2 = {
  [APIValidationErrorCode.NoAuthSession]: {
    message: "Auth session should not be empty."
  },
  // TODO: re-enable when working in all test environments:
  // [APIValidationErrorCode.NoEndpoint]: {
  // 	message: 'Missing endpoint',
  // },
  [APIValidationErrorCode.NoRegion]: {
    message: "Missing region."
  },
  [APIValidationErrorCode.NoCustomEndpoint]: {
    message: "Custom endpoint region is present without custom endpoint."
  }
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/assertValidationError.mjs
function assertValidationError2(assertion, name) {
  const { message, recoverySuggestion } = validationErrorMap2[name];
  if (!assertion) {
    throw new GraphQLApiError({ name, message, recoverySuggestion });
  }
}

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/resolveConfig.mjs
var logger3 = new ConsoleLogger("GraphQLAPI resolveConfig");
var resolveConfig = (amplify) => {
  var _a, _b;
  const config = amplify.getConfig();
  if (!((_a = config.API) == null ? void 0 : _a.GraphQL)) {
    logger3.warn("The API configuration is missing. This is likely due to Amplify.configure() not being called prior to generateClient().");
  }
  const { apiKey, customEndpoint, customEndpointRegion, defaultAuthMode, endpoint, region } = ((_b = config.API) == null ? void 0 : _b.GraphQL) ?? {};
  assertValidationError2(!(!customEndpoint && customEndpointRegion), APIValidationErrorCode.NoCustomEndpoint);
  return {
    apiKey,
    customEndpoint,
    customEndpointRegion,
    defaultAuthMode,
    endpoint,
    region
  };
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/resolveLibraryOptions.mjs
var resolveLibraryOptions = (amplify) => {
  var _a, _b, _c, _d, _e, _f;
  const headers = (_c = (_b = (_a = amplify.libraryOptions) == null ? void 0 : _a.API) == null ? void 0 : _b.GraphQL) == null ? void 0 : _c.headers;
  const withCredentials = (_f = (_e = (_d = amplify.libraryOptions) == null ? void 0 : _d.API) == null ? void 0 : _e.GraphQL) == null ? void 0 : _f.withCredentials;
  return { headers, withCredentials };
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/repackageAuthError.mjs
function repackageUnauthorizedError(content) {
  if (content.errors && Array.isArray(content.errors)) {
    content.errors.forEach((e) => {
      if (isUnauthorizedError(e)) {
        e.message = "Unauthorized";
        e.recoverySuggestion = `If you're calling an Amplify-generated API, make sure to set the "authMode" in generateClient({ authMode: '...' }) to the backend authorization rule's auth provider ('apiKey', 'userPool', 'iam', 'oidc', 'lambda')`;
      }
    });
  }
  return content;
}
function isUnauthorizedError(error) {
  var _a, _b, _c, _d;
  if ((_b = (_a = error == null ? void 0 : error.originalError) == null ? void 0 : _a.name) == null ? void 0 : _b.startsWith("UnauthorizedException")) {
    return true;
  }
  if (((_c = error.message) == null ? void 0 : _c.startsWith("Connection failed:")) && ((_d = error.message) == null ? void 0 : _d.includes("Permission denied"))) {
    return true;
  }
  return false;
}

// node_modules/@aws-amplify/api-graphql/dist/esm/types/index.mjs
var GraphQLAuthError;
(function(GraphQLAuthError2) {
  GraphQLAuthError2["NO_API_KEY"] = "No api-key configured";
  GraphQLAuthError2["NO_CURRENT_USER"] = "No current user";
  GraphQLAuthError2["NO_CREDENTIALS"] = "No credentials";
  GraphQLAuthError2["NO_FEDERATED_JWT"] = "No federated jwt";
  GraphQLAuthError2["NO_AUTH_TOKEN"] = "No auth token specified";
})(GraphQLAuthError || (GraphQLAuthError = {}));
var __amplify = Symbol("amplify");
var __authMode = Symbol("authMode");
var __authToken = Symbol("authToken");
var __headers = Symbol("headers");

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/constants.mjs
var NO_API_KEY = {
  name: "NoApiKey",
  // ideal: No API key configured.
  message: GraphQLAuthError.NO_API_KEY,
  recoverySuggestion: 'The API request was made with `authMode: "apiKey"` but no API Key was passed into `Amplify.configure()`. Review if your API key is passed into the `Amplify.configure()` function.'
};
var NO_VALID_CREDENTIALS = {
  name: "NoCredentials",
  // ideal: No auth credentials available.
  message: GraphQLAuthError.NO_CREDENTIALS,
  recoverySuggestion: `The API request was made with \`authMode: "iam"\` but no authentication credentials are available.

If you intended to make a request using an authenticated role, review if your user is signed in before making the request.

If you intend to make a request using an unauthenticated role or also known as "guest access", verify if "Auth.Cognito.allowGuestAccess" is set to "true" in the \`Amplify.configure()\` function.`
};
var NO_VALID_AUTH_TOKEN = {
  name: "NoValidAuthTokens",
  // ideal: No valid JWT auth token provided to make the API request..
  message: GraphQLAuthError.NO_FEDERATED_JWT,
  recoverySuggestion: "If you intended to make an authenticated API request, review if the current user is signed in."
};
var NO_SIGNED_IN_USER = {
  name: "NoSignedUser",
  // ideal: Couldn't retrieve authentication credentials to make the API request.
  message: GraphQLAuthError.NO_CURRENT_USER,
  recoverySuggestion: "Review the underlying exception field for more details. If you intended to make an authenticated API request, review if the current user is signed in."
};
var NO_AUTH_TOKEN_HEADER = {
  name: "NoAuthorizationHeader",
  // ideal: Authorization header not specified.
  message: GraphQLAuthError.NO_AUTH_TOKEN,
  recoverySuggestion: 'The API request was made with `authMode: "lambda"` but no `authToken` is set. Review if a valid authToken is passed into the request options or in the `Amplify.configure()` function.'
};
var NO_ENDPOINT = {
  name: "NoEndpoint",
  message: "No GraphQL endpoint configured in `Amplify.configure()`.",
  recoverySuggestion: "Review if the GraphQL API endpoint is set in the `Amplify.configure()` function."
};

// node_modules/@aws-amplify/api-graphql/dist/esm/utils/errors/createGraphQLResultWithError.mjs
var createGraphQLResultWithError = (error) => {
  return {
    data: {},
    errors: [new GraphQLError(error.message, null, null, null, null, error)]
  };
};

// node_modules/@aws-amplify/api-graphql/dist/esm/internals/utils/runtimeTypeGuards/isGraphQLResponseWithErrors.mjs
function isGraphQLResponseWithErrors(response) {
  if (!response) {
    return false;
  }
  const r2 = response;
  return Array.isArray(r2.errors) && r2.errors.length > 0;
}

// node_modules/@aws-amplify/api-graphql/dist/esm/internals/graphqlAuth.mjs
async function headerBasedAuth(amplify, authMode, apiKey, additionalHeaders = {}) {
  var _a;
  let headers = {};
  switch (authMode) {
    case "apiKey":
      if (!apiKey) {
        throw new GraphQLApiError(NO_API_KEY);
      }
      headers = {
        "X-Api-Key": apiKey
      };
      break;
    case "iam": {
      const session = await amplify.Auth.fetchAuthSession();
      if (session.credentials === void 0) {
        throw new GraphQLApiError(NO_VALID_CREDENTIALS);
      }
      break;
    }
    case "oidc":
    case "userPool": {
      let token;
      try {
        token = (_a = (await amplify.Auth.fetchAuthSession()).tokens) == null ? void 0 : _a.accessToken.toString();
      } catch (e) {
        throw new GraphQLApiError({
          ...NO_SIGNED_IN_USER,
          underlyingError: e
        });
      }
      if (!token) {
        throw new GraphQLApiError(NO_VALID_AUTH_TOKEN);
      }
      headers = {
        Authorization: token
      };
      break;
    }
    case "lambda":
      if (typeof additionalHeaders === "object" && !additionalHeaders.Authorization) {
        throw new GraphQLApiError(NO_AUTH_TOKEN_HEADER);
      }
      headers = {
        Authorization: additionalHeaders.Authorization
      };
      break;
  }
  return headers;
}

// node_modules/@aws-amplify/api-graphql/dist/esm/internals/InternalGraphQLAPI.mjs
var USER_AGENT_HEADER2 = "x-amz-user-agent";
var isAmplifyInstance = (amplify) => {
  return typeof amplify !== "function";
};
var InternalGraphQLAPIClass = class {
  constructor() {
    this.appSyncRealTime = new AWSAppSyncRealTimeProvider();
    this._api = {
      post: post3,
      cancelREST: cancel,
      isCancelErrorREST: isCancelError,
      updateRequestToBeCancellable
    };
  }
  getModuleName() {
    return "InternalGraphQLAPI";
  }
  /**
   * to get the operation type
   * @param operation
   */
  getGraphqlOperationType(operation) {
    const doc = parse(operation);
    const definitions = doc.definitions;
    const [{ operation: operationType }] = definitions;
    return operationType;
  }
  /**
   * Executes a GraphQL operation
   *
   * @param options - GraphQL Options
   * @param [additionalHeaders] - headers to merge in after any `libraryConfigHeaders` set in the config
   * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
   */
  graphql(amplify, { query: paramQuery, variables = {}, authMode, authToken }, additionalHeaders, customUserAgentDetails) {
    const query = typeof paramQuery === "string" ? parse(paramQuery) : parse(print(paramQuery));
    const [operationDef = {}] = query.definitions.filter((def) => def.kind === "OperationDefinition");
    const { operation: operationType } = operationDef;
    const headers = additionalHeaders || {};
    switch (operationType) {
      case "query":
      case "mutation": {
        const abortController = new AbortController();
        let responsePromise;
        if (isAmplifyInstance(amplify)) {
          responsePromise = this._graphql(amplify, { query, variables, authMode }, headers, abortController, customUserAgentDetails, authToken);
        } else {
          const wrapper = async (amplifyInstance) => {
            const result = await this._graphql(amplifyInstance, { query, variables, authMode }, headers, abortController, customUserAgentDetails, authToken);
            return result;
          };
          responsePromise = amplify(wrapper);
        }
        this._api.updateRequestToBeCancellable(responsePromise, abortController);
        return responsePromise;
      }
      case "subscription":
        return this._graphqlSubscribe(amplify, { query, variables, authMode }, headers, customUserAgentDetails, authToken);
      default:
        throw new Error(`invalid operation type: ${operationType}`);
    }
  }
  async _graphql(amplify, { query, variables, authMode: explicitAuthMode }, additionalHeaders = {}, abortController, customUserAgentDetails, authToken) {
    const { apiKey, region, endpoint: appSyncGraphqlEndpoint, customEndpoint, customEndpointRegion, defaultAuthMode } = resolveConfig(amplify);
    const initialAuthMode = explicitAuthMode || defaultAuthMode || "iam";
    const authMode = initialAuthMode === "identityPool" ? "iam" : initialAuthMode;
    const { headers: customHeaders, withCredentials } = resolveLibraryOptions(amplify);
    let additionalCustomHeaders;
    if (typeof additionalHeaders === "function") {
      const requestOptions = {
        method: "POST",
        url: new AmplifyUrl(customEndpoint || appSyncGraphqlEndpoint || "").toString(),
        queryString: print(query)
      };
      additionalCustomHeaders = await additionalHeaders(requestOptions);
    } else {
      additionalCustomHeaders = additionalHeaders;
    }
    if (authToken) {
      additionalCustomHeaders = {
        ...additionalCustomHeaders,
        Authorization: authToken
      };
    }
    const authHeaders = await headerBasedAuth(amplify, authMode, apiKey, additionalCustomHeaders);
    const headers = {
      ...!customEndpoint && authHeaders,
      /**
       * Custom endpoint headers.
       * If there is both a custom endpoint and custom region present, we get the headers.
       * If there is a custom endpoint but no region, we return an empty object.
       * If neither are present, we return an empty object.
       */
      ...customEndpoint && (customEndpointRegion ? authHeaders : {}) || {},
      // Custom headers included in Amplify configuration options:
      ...customHeaders && await customHeaders({
        query: print(query),
        variables
      }),
      // Custom headers from individual requests or API client configuration:
      ...additionalCustomHeaders,
      // User agent headers:
      ...!customEndpoint && {
        [USER_AGENT_HEADER2]: getAmplifyUserAgent(customUserAgentDetails)
      }
    };
    const body = {
      query: print(query),
      variables: variables || null
    };
    let signingServiceInfo;
    if (customEndpoint && !customEndpointRegion || authMode !== "oidc" && authMode !== "userPool" && authMode !== "iam" && authMode !== "lambda") {
      signingServiceInfo = void 0;
    } else {
      signingServiceInfo = {
        service: !customEndpointRegion ? "appsync" : "execute-api",
        region: !customEndpointRegion ? region : customEndpointRegion
      };
    }
    const endpoint = customEndpoint || appSyncGraphqlEndpoint;
    if (!endpoint) {
      throw createGraphQLResultWithError(new GraphQLApiError(NO_ENDPOINT));
    }
    let response;
    try {
      const { body: responseBody } = await this._api.post(amplify, {
        url: new AmplifyUrl(endpoint),
        options: {
          headers,
          body,
          signingServiceInfo,
          withCredentials
        },
        abortController
      });
      response = await responseBody.json();
    } catch (error) {
      if (this.isCancelError(error)) {
        throw error;
      }
      response = createGraphQLResultWithError(error);
    }
    if (isGraphQLResponseWithErrors(response)) {
      throw repackageUnauthorizedError(response);
    }
    return response;
  }
  /**
   * Checks to see if an error thrown is from an api request cancellation
   * @param {any} error - Any error
   * @return {boolean} - A boolean indicating if the error was from an api request cancellation
   */
  isCancelError(error) {
    return this._api.isCancelErrorREST(error);
  }
  /**
   * Cancels an inflight request. Only applicable for graphql queries and mutations
   * @param {any} request - request to cancel
   * @returns - A boolean indicating if the request was cancelled
   */
  cancel(request, message) {
    return this._api.cancelREST(request, message);
  }
  _graphqlSubscribe(amplify, { query, variables, authMode: explicitAuthMode }, additionalHeaders = {}, customUserAgentDetails, authToken) {
    const config = resolveConfig(amplify);
    const initialAuthMode = explicitAuthMode || (config == null ? void 0 : config.defaultAuthMode) || "iam";
    const authMode = initialAuthMode === "identityPool" ? "iam" : initialAuthMode;
    const { headers: libraryConfigHeaders } = resolveLibraryOptions(amplify);
    return this.appSyncRealTime.subscribe({
      query: print(query),
      variables,
      appSyncGraphqlEndpoint: config == null ? void 0 : config.endpoint,
      region: config == null ? void 0 : config.region,
      authenticationType: authMode,
      apiKey: config == null ? void 0 : config.apiKey,
      additionalHeaders,
      authToken,
      libraryConfigHeaders
    }, customUserAgentDetails).pipe(catchError((e) => {
      if (e.errors) {
        throw repackageUnauthorizedError(e);
      }
      throw e;
    }));
  }
};
var InternalGraphQLAPI = new InternalGraphQLAPIClass();

// node_modules/@aws-amplify/data-schema-types/dist/esm/client/symbol.mjs
var __modelMeta__ = Symbol();

// node_modules/@aws-amplify/data-schema/dist/esm/runtime/internals/ai/getCustomUserAgentDetails.mjs
var INTERNAL_USER_AGENT_OVERRIDE = Symbol("INTERNAL_USER_AGENT_OVERRIDE");
var AiAction;
(function(AiAction2) {
  AiAction2["CreateConversation"] = "1";
  AiAction2["GetConversation"] = "2";
  AiAction2["ListConversations"] = "3";
  AiAction2["DeleteConversation"] = "4";
  AiAction2["SendMessage"] = "5";
  AiAction2["ListMessages"] = "6";
  AiAction2["OnStreamEvent"] = "7";
  AiAction2["Generation"] = "8";
  AiAction2["UpdateConversation"] = "9";
})(AiAction || (AiAction = {}));

// node_modules/@smithy/util-base64/dist-es/constants.browser.js
var alphabetByEncoding = {};
var alphabetByValue = new Array(64);
for (let i2 = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i2 + start <= limit; i2++) {
  const char = String.fromCharCode(i2 + start);
  alphabetByEncoding[char] = i2;
  alphabetByValue[i2] = char;
}
for (let i2 = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i2 + start <= limit; i2++) {
  const char = String.fromCharCode(i2 + start);
  const index = i2 + 26;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
for (let i2 = 0; i2 < 10; i2++) {
  alphabetByEncoding[i2.toString(10)] = i2 + 52;
  const char = i2.toString(10);
  const index = i2 + 52;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
alphabetByEncoding["+"] = 62;
alphabetByValue[62] = "+";
alphabetByEncoding["/"] = 63;
alphabetByValue[63] = "/";

// node_modules/@aws-amplify/api-graphql/dist/esm/GraphQLAPI.mjs
function isGraphQLOptionsWithOverride(options) {
  return INTERNAL_USER_AGENT_OVERRIDE in options;
}
var GraphQLAPIClass = class extends InternalGraphQLAPIClass {
  getModuleName() {
    return "GraphQLAPI";
  }
  /**
   * Executes a GraphQL operation
   *
   * @param options - GraphQL Options
   * @param [additionalHeaders] - headers to merge in after any `libraryConfigHeaders` set in the config
   * @returns An Observable if the query is a subscription query, else a promise of the graphql result.
   */
  graphql(amplify, options, additionalHeaders) {
    const userAgentDetails = {
      category: Category.API,
      action: ApiAction.GraphQl
    };
    if (isGraphQLOptionsWithOverride(options)) {
      const { [INTERNAL_USER_AGENT_OVERRIDE]: internalUserAgentOverride, ...cleanOptions } = options;
      return super.graphql(amplify, cleanOptions, additionalHeaders, {
        ...userAgentDetails,
        ...internalUserAgentOverride
      });
    }
    return super.graphql(amplify, options, additionalHeaders, {
      ...userAgentDetails
    });
  }
  /**
   * Checks to see if an error thrown is from an api request cancellation
   * @param error - Any error
   * @returns A boolean indicating if the error was from an api request cancellation
   */
  isCancelError(error) {
    return super.isCancelError(error);
  }
  /**
   * Cancels an inflight request. Only applicable for graphql queries and mutations
   * @param {any} request - request to cancel
   * @returns A boolean indicating if the request was cancelled
   */
  cancel(request, message) {
    return super.cancel(request, message);
  }
};
var GraphQLAPI = new GraphQLAPIClass();

// node_modules/@aws-amplify/api-graphql/dist/esm/internals/generateClient.mjs
var emptyProperty = new Proxy({}, {
  get() {
    throw new Error("Client could not be generated. This is likely due to `Amplify.configure()` not being called prior to `generateClient()` or because the configuration passed to `Amplify.configure()` is missing GraphQL provider configuration.");
  }
});

// node_modules/@aws-amplify/api/dist/esm/internals/InternalAPI.mjs
var InternalAPIClass = class {
  /**
   * Initialize API
   */
  constructor() {
    this.Cache = Cache;
    this._graphqlApi = new InternalGraphQLAPIClass();
  }
  getModuleName() {
    return "InternalAPI";
  }
  /**
   * to get the operation type
   * @param operation
   */
  getGraphqlOperationType(operation) {
    return this._graphqlApi.getGraphqlOperationType(operation);
  }
  graphql(options, additionalHeaders, customUserAgentDetails) {
    const apiUserAgentDetails = {
      category: Category.API,
      action: ApiAction.GraphQl,
      ...customUserAgentDetails
    };
    return this._graphqlApi.graphql(Amplify, options, additionalHeaders, apiUserAgentDetails);
  }
};
var InternalAPI = new InternalAPIClass();

// node_modules/@aws-amplify/datastore/dist/esm/authModeStrategies/defaultAuthStrategy.mjs
var defaultAuthStrategy = () => [];

// node_modules/@aws-amplify/datastore/dist/esm/authModeStrategies/multiAuthStrategy.mjs
function getProviderFromRule(rule) {
  if (rule.allow === "private" && !rule.provider) {
    return ModelAttributeAuthProvider.USER_POOLS;
  }
  if (rule.allow === "public" && !rule.provider) {
    return ModelAttributeAuthProvider.API_KEY;
  }
  return rule.provider;
}
function sortAuthRulesWithPriority(rules) {
  const allowSortPriority = [
    ModelAttributeAuthAllow.CUSTOM,
    ModelAttributeAuthAllow.OWNER,
    ModelAttributeAuthAllow.GROUPS,
    ModelAttributeAuthAllow.PRIVATE,
    ModelAttributeAuthAllow.PUBLIC
  ];
  const providerSortPriority = [
    ModelAttributeAuthProvider.FUNCTION,
    ModelAttributeAuthProvider.USER_POOLS,
    ModelAttributeAuthProvider.OIDC,
    ModelAttributeAuthProvider.IAM,
    ModelAttributeAuthProvider.API_KEY
  ];
  return [...rules].sort((a2, b2) => {
    if (a2.allow === b2.allow) {
      return providerSortPriority.indexOf(getProviderFromRule(a2)) - providerSortPriority.indexOf(getProviderFromRule(b2));
    }
    return allowSortPriority.indexOf(a2.allow) - allowSortPriority.indexOf(b2.allow);
  });
}
function getAuthRules({ rules, currentUser }) {
  const authModes = /* @__PURE__ */ new Set();
  rules.forEach((rule) => {
    switch (rule.allow) {
      case ModelAttributeAuthAllow.CUSTOM:
        if (!rule.provider || rule.provider === ModelAttributeAuthProvider.FUNCTION) {
          authModes.add("lambda");
        }
        break;
      case ModelAttributeAuthAllow.GROUPS:
      case ModelAttributeAuthAllow.OWNER: {
        if (currentUser) {
          if (rule.provider === ModelAttributeAuthProvider.USER_POOLS) {
            authModes.add("userPool");
          } else if (rule.provider === ModelAttributeAuthProvider.OIDC) {
            authModes.add("oidc");
          }
        }
        break;
      }
      case ModelAttributeAuthAllow.PRIVATE: {
        if (currentUser) {
          if (!rule.provider || rule.provider === ModelAttributeAuthProvider.USER_POOLS) {
            authModes.add("userPool");
          } else if (rule.provider === ModelAttributeAuthProvider.IAM) {
            authModes.add("iam");
          }
        }
        break;
      }
      case ModelAttributeAuthAllow.PUBLIC: {
        if (rule.provider === ModelAttributeAuthProvider.IAM) {
          authModes.add("iam");
        } else if (!rule.provider || rule.provider === ModelAttributeAuthProvider.API_KEY) {
          authModes.add("apiKey");
        }
        break;
      }
    }
  });
  return Array.from(authModes);
}
var multiAuthStrategy = () => async ({ schema: schema2, modelName }) => {
  var _a;
  let currentUser;
  try {
    const authSession = await fetchAuthSession();
    if (authSession.tokens.accessToken) {
      currentUser = authSession;
    }
  } catch (e) {
  }
  const { attributes } = schema2.namespaces.user.models[modelName];
  if (attributes) {
    const authAttribute = attributes.find((attr) => attr.type === "auth");
    if ((_a = authAttribute == null ? void 0 : authAttribute.properties) == null ? void 0 : _a.rules) {
      const sortedRules = sortAuthRulesWithPriority(authAttribute.properties.rules);
      return getAuthRules({ currentUser, rules: sortedRules });
    }
  }
  return [];
};

// node_modules/@aws-amplify/api-graphql/dist/esm/Providers/AWSAppSyncEventsProvider/index.mjs
var PROVIDER_NAME2 = "AWSAppSyncEventsProvider";
var WS_PROTOCOL_NAME2 = "aws-appsync-event-ws";
var AWSAppSyncEventProvider = class extends AWSWebSocketProvider {
  constructor() {
    super({ providerName: PROVIDER_NAME2, wsProtocolName: WS_PROTOCOL_NAME2 });
  }
  getProviderName() {
    return PROVIDER_NAME2;
  }
  async connect(options) {
    super.connect(options);
  }
  subscribe(options, customUserAgentDetails) {
    return super.subscribe(options, customUserAgentDetails).pipe();
  }
  async publish(options, customUserAgentDetails) {
    super.publish(options, customUserAgentDetails);
  }
  async _prepareSubscriptionPayload({ options, subscriptionId, customUserAgentDetails, additionalCustomHeaders, libraryConfigHeaders, publish }) {
    const { appSyncGraphqlEndpoint, authenticationType, query, variables, apiKey, region } = options;
    const serializedData = JSON.stringify([variables]);
    const headers = {
      ...await awsRealTimeHeaderBasedAuth({
        apiKey,
        appSyncGraphqlEndpoint,
        authenticationType,
        payload: serializedData,
        canonicalUri: "",
        region,
        additionalCustomHeaders
      }),
      ...libraryConfigHeaders,
      ...additionalCustomHeaders,
      [USER_AGENT_HEADER]: getAmplifyUserAgent(customUserAgentDetails)
    };
    const subscriptionMessage = {
      id: subscriptionId,
      channel: query,
      // events: [JSON.stringify(variables)],
      authorization: {
        ...headers
      },
      // payload: {
      // 	events: serializedData,
      // 	extensions: {
      // 		authorization: {
      // 			...headers,
      // 		},
      // 	},
      // },
      type: publish ? MESSAGE_TYPES.EVENT_PUBLISH : MESSAGE_TYPES.EVENT_SUBSCRIBE
    };
    const serializedSubscriptionMessage = JSON.stringify(subscriptionMessage);
    return serializedSubscriptionMessage;
  }
  _handleSubscriptionData(message) {
    this.logger.debug(`subscription message from AWS AppSync Events: ${message.data}`);
    const { id = "", event: payload, type } = JSON.parse(String(message.data));
    const { observer = null, query = "", variables = {} } = this.subscriptionObserverMap.get(id) || {};
    this.logger.debug({ id, observer, query, variables });
    if (type === MESSAGE_TYPES.DATA && payload) {
      const deserializedEvent = JSON.parse(payload);
      if (observer) {
        observer.next(deserializedEvent);
      } else {
        this.logger.debug(`observer not found for id: ${id}`);
      }
      return [true, { id, type, payload: deserializedEvent }];
    }
    return [false, { id, type, payload }];
  }
  _unsubscribeMessage(subscriptionId) {
    return {
      id: subscriptionId,
      type: MESSAGE_TYPES.EVENT_STOP
    };
  }
  _extractConnectionTimeout(data) {
    const { connectionTimeoutMs = DEFAULT_KEEP_ALIVE_TIMEOUT } = data;
    return connectionTimeoutMs;
  }
  _extractErrorCodeAndType(data) {
    const { errors: [{ errorType = "", errorCode = 0 } = {}] = [] } = data;
    return { errorCode, errorType };
  }
};
var AppSyncEventProvider = new AWSAppSyncEventProvider();

// node_modules/@aws-amplify/datastore/dist/esm/sync/utils.mjs
var logger4 = new ConsoleLogger("DataStore");
var GraphQLOperationType = {
  LIST: "query",
  CREATE: "mutation",
  UPDATE: "mutation",
  DELETE: "mutation",
  GET: "query"
};
var TransformerMutationType;
(function(TransformerMutationType2) {
  TransformerMutationType2["CREATE"] = "Create";
  TransformerMutationType2["UPDATE"] = "Update";
  TransformerMutationType2["DELETE"] = "Delete";
  TransformerMutationType2["GET"] = "Get";
})(TransformerMutationType || (TransformerMutationType = {}));
var dummyMetadata = {
  _version: void 0,
  _lastChangedAt: void 0,
  _deleted: void 0
};
var metadataFields = Object.keys(dummyMetadata);
function getMetadataFields() {
  return metadataFields;
}
function generateSelectionSet2(namespace, modelDefinition) {
  const scalarFields = getScalarFields(modelDefinition);
  const nonModelFields = getNonModelFields(namespace, modelDefinition);
  const implicitOwnerField = getImplicitOwnerField(modelDefinition, scalarFields);
  let scalarAndMetadataFields = Object.values(scalarFields).map(({ name }) => name).concat(implicitOwnerField).concat(nonModelFields);
  if (isSchemaModel(modelDefinition)) {
    scalarAndMetadataFields = scalarAndMetadataFields.concat(getMetadataFields()).concat(getConnectionFields(modelDefinition, namespace));
  }
  const result = scalarAndMetadataFields.join("\n");
  return result;
}
function getImplicitOwnerField(modelDefinition, scalarFields) {
  const ownerFields = getOwnerFields(modelDefinition);
  if (!scalarFields.owner && ownerFields.includes("owner")) {
    return ["owner"];
  }
  return [];
}
function getOwnerFields(modelDefinition) {
  const ownerFields = [];
  if (isSchemaModelWithAttributes(modelDefinition)) {
    modelDefinition.attributes.forEach((attr) => {
      if (attr.properties && attr.properties.rules) {
        const rule = attr.properties.rules.find((currentRule) => currentRule.allow === "owner");
        if (rule && rule.ownerField) {
          ownerFields.push(rule.ownerField);
        }
      }
    });
  }
  return ownerFields;
}
function getScalarFields(modelDefinition) {
  const { fields: fields7 } = modelDefinition;
  const result = Object.values(fields7).filter((field) => {
    if (isGraphQLScalarType(field.type) || isEnumFieldType(field.type)) {
      return true;
    }
    return false;
  }).reduce((acc, field) => {
    acc[field.name] = field;
    return acc;
  }, {});
  return result;
}
function getConnectionFields(modelDefinition, namespace) {
  const result = [];
  Object.values(modelDefinition.fields).filter(({ association }) => association && Object.keys(association).length).forEach(({ name, association }) => {
    const { connectionType } = association || {};
    switch (connectionType) {
      case "HAS_ONE":
      case "HAS_MANY":
        break;
      case "BELONGS_TO":
        if (isTargetNameAssociation(association)) {
          if (association.targetNames && association.targetNames.length > 0) {
            const [relations] = establishRelationAndKeys(namespace);
            const connectedModelName = modelDefinition.fields[name].type.model;
            const byPkIndex = relations[connectedModelName].indexes.find(([currentName]) => currentName === "byPk");
            const keyFields = byPkIndex && byPkIndex[1];
            const keyFieldSelectionSet = keyFields == null ? void 0 : keyFields.join(" ");
            result.push(`${name} { ${keyFieldSelectionSet} _deleted }`);
          } else {
            result.push(`${name} { id _deleted }`);
          }
        }
        break;
      default:
        throw new Error(`Invalid connection type ${connectionType}`);
    }
  });
  return result;
}
function getNonModelFields(namespace, modelDefinition) {
  const result = [];
  Object.values(modelDefinition.fields).forEach(({ name, type }) => {
    if (isNonModelFieldType(type)) {
      const typeDefinition = namespace.nonModels[type.nonModel];
      const scalarFields = Object.values(getScalarFields(typeDefinition)).map(({ name: currentName }) => currentName);
      const nested = [];
      Object.values(typeDefinition.fields).forEach((field) => {
        const { type: fieldType, name: fieldName } = field;
        if (isNonModelFieldType(fieldType)) {
          const nonModelTypeDefinition = namespace.nonModels[fieldType.nonModel];
          nested.push(`${fieldName} { ${generateSelectionSet2(namespace, nonModelTypeDefinition)} }`);
        }
      });
      result.push(`${name} { ${scalarFields.join(" ")} ${nested.join(" ")} }`);
    }
  });
  return result;
}
function getAuthorizationRules(modelDefinition) {
  const authConfig = [].concat(modelDefinition.attributes || []).find((attr) => attr && attr.type === "auth");
  const { properties: { rules = [] } = {} } = authConfig || {};
  const resultRules = [];
  rules.forEach((rule) => {
    const { identityClaim = "cognito:username", ownerField = "owner", operations = ["create", "update", "delete", "read"], provider = "userPools", groupClaim = "cognito:groups", allow: authStrategy = "iam", groups = [], groupsField = "" } = rule;
    const isReadAuthorized = operations.includes("read");
    const isOwnerAuth = authStrategy === "owner";
    if (!isReadAuthorized && !isOwnerAuth) {
      return;
    }
    const authRule = {
      identityClaim,
      ownerField,
      provider,
      groupClaim,
      authStrategy,
      groups,
      groupsField,
      areSubscriptionsPublic: false
    };
    if (isOwnerAuth) {
      const modelConfig = [].concat(modelDefinition.attributes || []).find((attr) => attr && attr.type === "model");
      const { properties: { subscriptions: { level = "on" } = {} } = {} } = modelConfig || {};
      authRule.areSubscriptionsPublic = !operations.includes("read") || level === "public";
    }
    if (isOwnerAuth) {
      resultRules.push(authRule);
      return;
    }
    resultRules.unshift(authRule);
  });
  return resultRules;
}
function buildSubscriptionGraphQLOperation(namespace, modelDefinition, transformerMutationType, isOwnerAuthorization, ownerField, filterArg = false) {
  const selectionSet = generateSelectionSet2(namespace, modelDefinition);
  const { name: typeName } = modelDefinition;
  const opName = `on${transformerMutationType}${typeName}`;
  const docArgs = [];
  const opArgs = [];
  if (filterArg) {
    docArgs.push(`$filter: ModelSubscription${typeName}FilterInput`);
    opArgs.push("filter: $filter");
  }
  if (isOwnerAuthorization) {
    docArgs.push(`$${ownerField}: String!`);
    opArgs.push(`${ownerField}: $${ownerField}`);
  }
  const docStr = docArgs.length ? `(${docArgs.join(",")})` : "";
  const opStr = opArgs.length ? `(${opArgs.join(",")})` : "";
  return [
    transformerMutationType,
    opName,
    `subscription operation${docStr}{
			${opName}${opStr}{
				${selectionSet}
			}
		}`
  ];
}
function buildGraphQLOperation(namespace, modelDefinition, graphQLOpType) {
  let selectionSet = generateSelectionSet2(namespace, modelDefinition);
  const { name: typeName, pluralName: pluralTypeName } = modelDefinition;
  let operation;
  let documentArgs;
  let operationArgs;
  let transformerMutationType;
  switch (graphQLOpType) {
    case "LIST":
      operation = `sync${pluralTypeName}`;
      documentArgs = `($limit: Int, $nextToken: String, $lastSync: AWSTimestamp, $filter: Model${typeName}FilterInput)`;
      operationArgs = "(limit: $limit, nextToken: $nextToken, lastSync: $lastSync, filter: $filter)";
      selectionSet = `items {
							${selectionSet}
						}
						nextToken
						startedAt`;
      break;
    case "CREATE":
      operation = `create${typeName}`;
      documentArgs = `($input: Create${typeName}Input!)`;
      operationArgs = "(input: $input)";
      transformerMutationType = TransformerMutationType.CREATE;
      break;
    case "UPDATE":
      operation = `update${typeName}`;
      documentArgs = `($input: Update${typeName}Input!, $condition: Model${typeName}ConditionInput)`;
      operationArgs = "(input: $input, condition: $condition)";
      transformerMutationType = TransformerMutationType.UPDATE;
      break;
    case "DELETE":
      operation = `delete${typeName}`;
      documentArgs = `($input: Delete${typeName}Input!, $condition: Model${typeName}ConditionInput)`;
      operationArgs = "(input: $input, condition: $condition)";
      transformerMutationType = TransformerMutationType.DELETE;
      break;
    case "GET":
      operation = `get${typeName}`;
      documentArgs = `($id: ID!)`;
      operationArgs = "(id: $id)";
      transformerMutationType = TransformerMutationType.GET;
      break;
    default:
      throw new Error(`Invalid graphQlOpType ${graphQLOpType}`);
  }
  return [
    [
      transformerMutationType,
      operation,
      `${GraphQLOperationType[graphQLOpType]} operation${documentArgs}{
		${operation}${operationArgs}{
			${selectionSet}
		}
	}`
    ]
  ];
}
function createMutationInstanceFromModelOperation(relationships, modelDefinition, opType, model, element, condition, MutationEventConstructor, modelInstanceCreator2, id) {
  let operation;
  switch (opType) {
    case OpType.INSERT:
      operation = TransformerMutationType.CREATE;
      break;
    case OpType.UPDATE:
      operation = TransformerMutationType.UPDATE;
      break;
    case OpType.DELETE:
      operation = TransformerMutationType.DELETE;
      break;
    default:
      throw new Error(`Invalid opType ${opType}`);
  }
  const replacer = (k2, v2) => {
    const isAWSJSON2 = k2 && v2 !== null && typeof v2 === "object" && modelDefinition.fields[k2] && modelDefinition.fields[k2].type === "AWSJSON";
    if (isAWSJSON2) {
      return JSON.stringify(v2);
    }
    return v2;
  };
  const modelId = getIdentifierValue(modelDefinition, element);
  const optionalId = OpType.INSERT && id ? { id } : {};
  const mutationEvent = modelInstanceCreator2(MutationEventConstructor, {
    ...optionalId,
    data: JSON.stringify(element, replacer),
    modelId,
    model: model.name,
    operation,
    condition: JSON.stringify(condition)
  });
  return mutationEvent;
}
function predicateToGraphQLCondition(predicate, modelDefinition) {
  const result = {};
  if (!predicate || !Array.isArray(predicate.predicates)) {
    return result;
  }
  const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
  return predicateToGraphQLFilter(predicate, keyFields);
}
function predicateToGraphQLFilter(predicatesGroup, fieldsToOmit = [], root = true) {
  const result = {};
  if (!predicatesGroup || !Array.isArray(predicatesGroup.predicates)) {
    return result;
  }
  const { type, predicates } = predicatesGroup;
  const isList = type === "and" || type === "or";
  result[type] = isList ? [] : {};
  const children = [];
  predicates.forEach((predicate) => {
    if (isPredicateObj(predicate)) {
      const { field, operator, operand } = predicate;
      if (fieldsToOmit.includes(field))
        return;
      const gqlField = {
        [field]: { [operator]: operand }
      };
      children.push(gqlField);
      return;
    }
    const child = predicateToGraphQLFilter(predicate, fieldsToOmit, false);
    if (Object.keys(child).length > 0) {
      children.push(child);
    }
  });
  if (children.length === 1) {
    const [child] = children;
    if (
      // any nested list node
      isList && !root || // root list node where the only child is also a list node
      isList && root && ("and" in child || "or" in child)
    ) {
      delete result[type];
      Object.assign(result, child);
      return result;
    }
  }
  children.forEach((child) => {
    if (isList) {
      result[type].push(child);
    } else {
      result[type] = child;
    }
  });
  if (isList) {
    if (result[type].length === 0)
      return {};
  } else {
    if (Object.keys(result[type]).length === 0)
      return {};
  }
  return result;
}
function filterFields(group) {
  const fields7 = /* @__PURE__ */ new Set();
  if (!group || !Array.isArray(group.predicates))
    return fields7;
  const { predicates } = group;
  const stack = [...predicates];
  while (stack.length > 0) {
    const current = stack.pop();
    if (isPredicateObj(current)) {
      fields7.add(current.field);
    } else if (isPredicateGroup(current)) {
      stack.push(...current.predicates);
    }
  }
  return fields7;
}
function dynamicAuthFields(modelDefinition) {
  const rules = getAuthorizationRules(modelDefinition);
  const fields7 = /* @__PURE__ */ new Set();
  for (const rule of rules) {
    if (rule.groupsField && !rule.groups.length) {
      fields7.add(rule.groupsField);
    } else if (rule.ownerField) {
      fields7.add(rule.ownerField);
    }
  }
  return fields7;
}
function countFilterCombinations(group) {
  if (!group || !Array.isArray(group.predicates))
    return 0;
  let count = 0;
  const stack = [group];
  while (stack.length > 0) {
    const current = stack.pop();
    if (isPredicateGroup(current)) {
      const { predicates, type } = current;
      if (type === "or" && predicates.length > 1) {
        count += predicates.length;
      }
      stack.push(...predicates);
    }
  }
  return count || 1;
}
function repeatedFieldInGroup(group) {
  if (!group || !Array.isArray(group.predicates))
    return null;
  const gqlFilter = predicateToGraphQLFilter(group);
  const stack = [gqlFilter];
  const hasGroupRepeatedFields = (fields7) => {
    const seen = {};
    for (const f2 of fields7) {
      const [fieldName] = Object.keys(f2);
      if (seen[fieldName]) {
        return fieldName;
      }
      seen[fieldName] = true;
    }
    return null;
  };
  while (stack.length > 0) {
    const current = stack.pop();
    const [key] = Object.keys(current);
    const values = current[key];
    if (!Array.isArray(values)) {
      return null;
    }
    const predicateObjects = values.filter((v2) => !Array.isArray(Object.values(v2)[0]));
    const predicateGroups = values.filter((v2) => Array.isArray(Object.values(v2)[0]));
    if (key === "and") {
      const repeatedField = hasGroupRepeatedFields(predicateObjects);
      if (repeatedField) {
        return repeatedField;
      }
    }
    stack.push(...predicateGroups);
  }
  return null;
}
var RTFError;
(function(RTFError2) {
  RTFError2[RTFError2["UnknownField"] = 0] = "UnknownField";
  RTFError2[RTFError2["MaxAttributes"] = 1] = "MaxAttributes";
  RTFError2[RTFError2["MaxCombinations"] = 2] = "MaxCombinations";
  RTFError2[RTFError2["RepeatedFieldname"] = 3] = "RepeatedFieldname";
  RTFError2[RTFError2["NotGroup"] = 4] = "NotGroup";
  RTFError2[RTFError2["FieldNotInType"] = 5] = "FieldNotInType";
})(RTFError || (RTFError = {}));
function generateRTFRemediation(errorType, modelDefinition, predicatesGroup) {
  const selSyncFields = filterFields(predicatesGroup);
  const selSyncFieldStr = [...selSyncFields].join(", ");
  const dynamicAuthModeFields = dynamicAuthFields(modelDefinition);
  const dynamicAuthFieldsStr = [...dynamicAuthModeFields].join(", ");
  const filterCombinations = countFilterCombinations(predicatesGroup);
  const repeatedField = repeatedFieldInGroup(predicatesGroup);
  switch (errorType) {
    case RTFError.UnknownField:
      return `Your API was generated with an older version of the CLI that doesn't support backend subscription filtering.To enable backend subscription filtering, upgrade your Amplify CLI to the latest version and push your app by running \`amplify upgrade\` followed by \`amplify push\``;
    case RTFError.MaxAttributes: {
      let message = `Your selective sync expression for ${modelDefinition.name} contains ${selSyncFields.size} different model fields: ${selSyncFieldStr}.

`;
      if (dynamicAuthModeFields.size > 0) {
        message += `Note: the number of fields you can use with selective sync is affected by @auth rules configured on the model.

Dynamic auth modes, such as owner auth and dynamic group auth each utilize 1 field.
You currently have ${dynamicAuthModeFields.size} dynamic auth mode(s) configured on this model: ${dynamicAuthFieldsStr}.`;
      }
      return message;
    }
    case RTFError.MaxCombinations: {
      let message = `Your selective sync expression for ${modelDefinition.name} contains ${filterCombinations} field combinations (total number of predicates in an OR expression).

`;
      if (dynamicAuthModeFields.size > 0) {
        message += `Note: the number of fields you can use with selective sync is affected by @auth rules configured on the model.

Dynamic auth modes, such as owner auth and dynamic group auth factor in to the number of combinations you're using.
You currently have ${dynamicAuthModeFields.size} dynamic auth mode(s) configured on this model: ${dynamicAuthFieldsStr}.`;
      }
      return message;
    }
    case RTFError.RepeatedFieldname:
      return `Your selective sync expression for ${modelDefinition.name} contains multiple entries for ${repeatedField} in the same AND group.`;
    case RTFError.NotGroup:
      return `Your selective sync expression for ${modelDefinition.name} uses a \`not\` group. If you'd like to filter subscriptions in the backend, rewrite your expression using \`ne\` or \`notContains\` operators.`;
    case RTFError.FieldNotInType:
      return "";
  }
}
function getUserGroupsFromToken(token, rule) {
  let userGroups = token[rule.groupClaim] || [];
  if (typeof userGroups === "string") {
    let parsedGroups;
    try {
      parsedGroups = JSON.parse(userGroups);
    } catch (e) {
      parsedGroups = userGroups;
    }
    userGroups = [].concat(parsedGroups);
  }
  return userGroups;
}
async function getModelAuthModes({ authModeStrategy, defaultAuthMode, modelName, schema: schema2 }) {
  const operations = Object.values(ModelOperation);
  const modelAuthModes = {
    CREATE: [],
    READ: [],
    UPDATE: [],
    DELETE: []
  };
  try {
    await Promise.all(operations.map(async (operation) => {
      const authModes = await authModeStrategy({
        schema: schema2,
        modelName,
        operation
      });
      if (typeof authModes === "string") {
        modelAuthModes[operation] = [authModes];
      } else if (Array.isArray(authModes) && authModes.length) {
        modelAuthModes[operation] = authModes;
      } else {
        modelAuthModes[operation] = [defaultAuthMode];
      }
    }));
  } catch (error) {
    logger4.debug(`Error getting auth modes for model: ${modelName}`, error);
  }
  return modelAuthModes;
}
function getForbiddenError(error) {
  const forbiddenErrorCodes = [401, 403];
  let forbiddenError;
  if (error && error.errors) {
    forbiddenError = error.errors.find((err) => forbiddenErrorCodes.includes(resolveServiceErrorStatusCode(err)));
  } else if (error && error.message) {
    forbiddenError = error;
  }
  if (forbiddenError) {
    return forbiddenError.message ?? `Request failed with status code ${resolveServiceErrorStatusCode(forbiddenError)}`;
  }
  return null;
}
function resolveServiceErrorStatusCode(error) {
  var _a, _b;
  if ((_a = error == null ? void 0 : error.$metadata) == null ? void 0 : _a.httpStatusCode) {
    return Number((_b = error == null ? void 0 : error.$metadata) == null ? void 0 : _b.httpStatusCode);
  } else if (error == null ? void 0 : error.originalError) {
    return resolveServiceErrorStatusCode(error == null ? void 0 : error.originalError);
  } else {
    return null;
  }
}
function getClientSideAuthError(error) {
  const clientSideAuthErrors = Object.values(GraphQLAuthError);
  const clientSideError = error && error.message && clientSideAuthErrors.find((clientError) => error.message.includes(clientError));
  return clientSideError || null;
}
async function getTokenForCustomAuth(authMode, amplifyConfig = {}) {
  if (authMode === "lambda") {
    const { authProviders: { functionAuthProvider } = { functionAuthProvider: null } } = amplifyConfig;
    if (functionAuthProvider && typeof functionAuthProvider === "function") {
      try {
        const { token } = await functionAuthProvider();
        return token;
      } catch (error) {
        throw new Error(`Error retrieving token from \`functionAuthProvider\`: ${error}`);
      }
    } else {
      throw new Error("You must provide a `functionAuthProvider` function to `DataStore.configure` when using lambda");
    }
  }
}
function getIdentifierValue(modelDefinition, model) {
  const pkFieldNames = extractPrimaryKeyFieldNames(modelDefinition);
  const idOrPk = pkFieldNames.map((f2) => model[f2]).join(IDENTIFIER_KEY_SEPARATOR);
  return idOrPk;
}

// node_modules/idb/build/esm/wrap-idb-value.js
var instanceOfAny = (object, constructors) => constructors.some((c2) => object instanceof c2);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
var cursorRequestMap = /* @__PURE__ */ new WeakMap();
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve4, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve4(wrap2(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  promise.then((value) => {
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request);
    }
  }).catch(() => {
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve4, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve4();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "objectStoreNames") {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap2(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
    return function(storeNames, ...args) {
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap2(tx);
    };
  }
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap2(cursorRequestMap.get(this));
    };
  }
  return function(...args) {
    return wrap2(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap2(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);

// node_modules/idb/build/esm/index.js
function openDB(name, version2, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name, version2);
  const openPromise = wrap2(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap2(request.result), event.oldVersion, event.newVersion, wrap2(request.transaction));
    });
  }
  if (blocked)
    request.addEventListener("blocked", () => blocked());
  openPromise.then((db) => {
    if (terminated)
      db.addEventListener("close", () => terminated());
    if (blocking)
      db.addEventListener("versionchange", () => blocking());
  }).catch(() => {
  });
  return openPromise;
}
function deleteDB(name, { blocked } = {}) {
  const request = indexedDB.deleteDatabase(name);
  if (blocked)
    request.addEventListener("blocked", () => blocked());
  return wrap2(request).then(() => void 0);
}
var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
var writeMethods = ["put", "add", "delete", "clear"];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    const returnVal = await target2[targetFuncName](...args);
    if (isWrite)
      await tx.done;
    return returnVal;
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));

// node_modules/@aws-amplify/datastore/dist/esm/storage/relationship.mjs
var ModelRelationship = class _ModelRelationship {
  /**
   * @param modelDefinition The "local" model.
   * @param field The "local" model field.
   */
  constructor(model, field) {
    if (!isFieldAssociation(model.schema, field)) {
      throw new Error(`${model.schema.name}.${field} is not a relationship.`);
    }
    this.localModel = model;
    this._field = field;
  }
  /**
   * Returns a ModelRelationship for the the given model and field if the pair
   * indicates a relationship to another model. Else, returns `null`.
   *
   * @param model The model the relationship field exists in.
   * @param field The field that may relates the local model to the remote model.
   */
  static from(model, field) {
    if (isFieldAssociation(model.schema, field)) {
      return new this(model, field);
    } else {
      return null;
    }
  }
  /**
   * Enumerates all valid `ModelRelationship`'s on the given model.
   *
   * @param model The model definition to enumerate relationships of.
   */
  static allFrom(model) {
    const relationships = [];
    for (const field of Object.keys(model.schema.fields)) {
      const relationship = _ModelRelationship.from(model, field);
      relationship && relationships.push(relationship);
    }
    return relationships;
  }
  get localDefinition() {
    return this.localModel.schema;
  }
  /**
   * The virtual/computed field on the local model that should contain
   * the related model.
   */
  get field() {
    return this._field;
  }
  /**
   * The constructor that can be used to query DataStore or create instance for
   * the local model.
   */
  get localConstructor() {
    return this.localModel.builder;
  }
  /**
   * The name/type of the relationship the local model has with the remote model
   * via the defined local model field.
   */
  get type() {
    return this.localAssocation.connectionType;
  }
  /**
   * Raw details about the local FK as-is from the local model's field definition in
   * the schema. This field requires interpretation.
   *
   * @see localJoinFields
   * @see localAssociatedWith
   */
  get localAssocation() {
    return this.localDefinition.fields[this.field].association;
  }
  /**
   * The field names on the local model that can be used to query or queried to match
   * with instances of the remote model.
   *
   * Fields are returned in-order to match the order of `this.remoteKeyFields`.
   */
  get localJoinFields() {
    if (this.localAssocation.targetName) {
      return [this.localAssocation.targetName];
    } else if (this.localAssocation.targetNames) {
      return this.localAssocation.targetNames;
    } else {
      return this.localPKFields;
    }
  }
  /**
   * The field names on the local model that uniquely identify it.
   *
   * These fields may or may not be relevant to the join fields.
   */
  get localPKFields() {
    return this.localModel.pkField;
  }
  get remoteDefinition() {
    var _a;
    return (_a = this.remoteModelType.modelConstructor) == null ? void 0 : _a.schema;
  }
  get remoteModelType() {
    return this.localDefinition.fields[this.field].type;
  }
  /**
   * Constructor that can be used to query DataStore or create instances for
   * the remote model.
   */
  get remoteModelConstructor() {
    return this.remoteModelType.modelConstructor.builder;
  }
  /**
   * The field names on the remote model that uniquely identify it.
   *
   * These fields may or may not be relevant to the join fields.
   */
  get remotePKFields() {
    var _a;
    return ((_a = this.remoteModelType.modelConstructor) == null ? void 0 : _a.pkField) || ["id"];
  }
  /**
   * The `associatedWith` fields from the local perspective.
   *
   * When present, these fields indicate which fields on the remote model to use
   * when looking for a remote association and/or determining the final remote
   * key fields.
   */
  get localAssociatedWith() {
    if (this.localAssocation.connectionType === "HAS_MANY" || this.localAssocation.connectionType === "HAS_ONE") {
      return Array.isArray(this.localAssocation.associatedWith) ? this.localAssocation.associatedWith : [this.localAssocation.associatedWith];
    } else {
      return void 0;
    }
  }
  /**
   * The `remote` model's associated field's `assocation` metadata, if
   * present.
   *
   * This is used when determining if the remote model's associated field
   * specifies which FK fields to use. If this value is `undefined`, the
   * name of the remote field (`this.localAssociatedWith`) *is* the remote
   * key field.
   */
  get explicitRemoteAssociation() {
    var _a;
    if (this.localAssociatedWith) {
      if (this.localAssociatedWith.length === 1) {
        return (_a = this.remoteDefinition.fields[this.localAssociatedWith[0]]) == null ? void 0 : _a.association;
      } else {
        return void 0;
      }
    }
  }
  /**
   * The field names on the remote model that can used to query or queried to match
   * with instances of the local model.
   *
   * Fields are returned in-order to match the order of `this.localKeyFields`.
   */
  get remoteJoinFields() {
    var _a, _b, _c;
    if ((_a = this.explicitRemoteAssociation) == null ? void 0 : _a.targetName) {
      return [this.explicitRemoteAssociation.targetName];
    } else if ((_b = this.explicitRemoteAssociation) == null ? void 0 : _b.targetNames) {
      return (_c = this.explicitRemoteAssociation) == null ? void 0 : _c.targetNames;
    } else if (this.localAssociatedWith) {
      return this.localAssociatedWith;
    } else {
      return this.remotePKFields;
    }
  }
  /**
   * Whether this relationship everything necessary to get, set, and query from
   * the perspective of the local model provided at instantiation.
   */
  get isComplete() {
    return this.localJoinFields.length > 0 && this.remoteJoinFields.length > 0;
  }
  /**
   * Creates an FK mapper object with respect to the given related instance.
   *
   * E.g., if the local FK fields are `[parentId, parentName]` and point to
   * `[customId, name]` on the remote model, `createLocalFKObject(remote)`
   * will return:
   *
   * ```
   * {
   * 	parentId: remote.customId,
   * 	parentName: remote.name
   * }
   * ```
   *
   * @param remote The remote related instance.
   */
  createLocalFKObject(remote) {
    const fk = {};
    for (let i2 = 0; i2 < this.localJoinFields.length; i2++) {
      fk[this.localJoinFields[i2]] = remote[this.remoteJoinFields[i2]];
    }
    return fk;
  }
  /**
   * Creates an query mapper object to help fetch the remote instance(s) or
   * `null` if any of the necessary local fields are `null` or `undefined`.
   *
   * E.g., if the local FK fields are `[parentId, parentName]` and point to
   * `[customId, name]` on the remote model, `createLocalFKObject(remote)`
   * will return:
   *
   * ```
   * {
   * 	customId: local.parentId
   * 	name: local.parentName
   * }
   * ```
   *
   * If the local fields are not populated, returns
   *
   * @param local The local instance.
   */
  createRemoteQueryObject(local) {
    const query = {};
    for (let i2 = 0; i2 < this.remoteJoinFields.length; i2++) {
      const localValue = local[this.localJoinFields[i2]];
      if (localValue === null || localValue === void 0)
        return null;
      query[this.remoteJoinFields[i2]] = local[this.localJoinFields[i2]];
    }
    return query;
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/StorageAdapterBase.mjs
var logger5 = new ConsoleLogger("DataStore");
var DB_NAME = "amplify-datastore";
var StorageAdapterBase = class {
  constructor() {
    this.dbName = DB_NAME;
  }
  /**
   * Initializes local DB
   *
   * @param theSchema
   * @param namespaceResolver
   * @param modelInstanceCreator
   * @param getModelConstructorByModelName
   * @param sessionId
   */
  async setUp(theSchema, namespaceResolver2, modelInstanceCreator2, getModelConstructorByModelName2, sessionId) {
    await this.preSetUpChecks();
    if (!this.initPromise) {
      this.initPromise = new Promise((resolve4, reject) => {
        this.resolve = resolve4;
        this.reject = reject;
      });
    } else {
      await this.initPromise;
      return;
    }
    if (sessionId) {
      this.dbName = `${DB_NAME}-${sessionId}`;
    }
    this.schema = theSchema;
    this.namespaceResolver = namespaceResolver2;
    this.modelInstanceCreator = modelInstanceCreator2;
    this.getModelConstructorByModelName = getModelConstructorByModelName2;
    try {
      if (!this.db) {
        this.db = await this.initDb();
        this.resolve();
      }
    } catch (error) {
      this.reject(error);
    }
  }
  /**
   * @param modelConstructor
   * @returns local DB table name
   */
  getStorenameForModel(modelConstructor) {
    const namespace = this.namespaceResolver(modelConstructor);
    const { name: modelName } = modelConstructor;
    return getStorename(namespace, modelName);
  }
  /**
   *
   * @param model - instantiated model record
   * @returns the record's primary key values
   */
  getIndexKeyValuesFromModel(model) {
    const modelConstructor = Object.getPrototypeOf(model).constructor;
    const namespaceName = this.namespaceResolver(modelConstructor);
    const keys = getIndexKeys(this.schema.namespaces[namespaceName], modelConstructor.name);
    return extractPrimaryKeyValues(model, keys);
  }
  /**
   * Common metadata for `save` operation
   * used by individual storage adapters
   *
   * @param model
   */
  saveMetadata(model) {
    const modelConstructor = Object.getPrototypeOf(model).constructor;
    const storeName = this.getStorenameForModel(modelConstructor);
    const namespaceName = this.namespaceResolver(modelConstructor);
    const connectedModels = traverseModel(modelConstructor.name, model, this.schema.namespaces[namespaceName], this.modelInstanceCreator, this.getModelConstructorByModelName);
    const set = /* @__PURE__ */ new Set();
    const connectionStoreNames = Object.values(connectedModels).map(({ modelName, item, instance: instance2 }) => {
      const resolvedStoreName = getStorename(namespaceName, modelName);
      set.add(resolvedStoreName);
      const keys = getIndexKeys(this.schema.namespaces[namespaceName], modelName);
      return { storeName: resolvedStoreName, item, instance: instance2, keys };
    });
    const modelKeyValues = this.getIndexKeyValuesFromModel(model);
    return { storeName, set, connectionStoreNames, modelKeyValues };
  }
  /**
   * Enforces conditional save. Throws if condition is not met.
   * used by individual storage adapters
   *
   * @param model
   */
  validateSaveCondition(condition, fromDB) {
    if (!(condition && fromDB)) {
      return;
    }
    const predicates = ModelPredicateCreator.getPredicates(condition);
    const { predicates: predicateObjs, type } = predicates;
    const isValid2 = validatePredicate(fromDB, type, predicateObjs);
    if (!isValid2) {
      const msg = "Conditional update failed";
      logger5.error(msg, { model: fromDB, condition: predicateObjs });
      throw new Error(msg);
    }
  }
  /**
   * Instantiate models from POJO records returned from the database
   *
   * @param namespaceName - string model namespace
   * @param srcModelName - string model name
   * @param records - array of uninstantiated records
   * @returns
   */
  async load(namespaceName, srcModelName, records) {
    const namespace = this.schema.namespaces[namespaceName];
    const relations = namespace.relationships[srcModelName].relationTypes;
    const connectionStoreNames = relations.map(({ modelName }) => {
      return getStorename(namespaceName, modelName);
    });
    const modelConstructor = this.getModelConstructorByModelName(namespaceName, srcModelName);
    if (connectionStoreNames.length === 0) {
      return records.map((record) => this.modelInstanceCreator(modelConstructor, record));
    }
    return records.map((record) => this.modelInstanceCreator(modelConstructor, record));
  }
  /**
   * Extracts operands from a predicate group into an array of key values
   * Used in the query method
   *
   * @param predicates - predicate group
   * @param keyPath - string array of key names ['id', 'sortKey']
   * @returns string[] of key values
   *
   * @example
   * ```js
   * { and:[{ id: { eq: 'abc' }}, { sortKey: { eq: 'def' }}] }
   * ```
   * Becomes
   * ```
   * ['abc', 'def']
   * ```
   */
  keyValueFromPredicate(predicates, keyPath) {
    const { predicates: predicateObjs } = predicates;
    if (predicateObjs.length !== keyPath.length) {
      return;
    }
    const keyValues = [];
    for (const key of keyPath) {
      const predicateObj = predicateObjs.find((p2) => (
        // it's a relevant predicate object only if it's an equality
        // operation for a key field from the key:
        isPredicateObj(p2) && p2.field === key && p2.operator === "eq" && p2.operand !== null && p2.operand !== void 0
      ));
      predicateObj && keyValues.push(predicateObj.operand);
    }
    return keyValues.length === keyPath.length ? keyValues : void 0;
  }
  /**
   * Common metadata for `query` operation
   * used by individual storage adapters
   *
   * @param modelConstructor
   * @param predicate
   * @param pagination
   */
  queryMetadata(modelConstructor, predicate, pagination) {
    const storeName = this.getStorenameForModel(modelConstructor);
    const namespaceName = this.namespaceResolver(modelConstructor);
    const predicates = predicate && ModelPredicateCreator.getPredicates(predicate);
    const keyPath = getIndexKeys(this.schema.namespaces[namespaceName], modelConstructor.name);
    const queryByKey = predicates && this.keyValueFromPredicate(predicates, keyPath);
    const hasSort = pagination && pagination.sort;
    const hasPagination = pagination && pagination.limit;
    return {
      storeName,
      namespaceName,
      queryByKey,
      predicates,
      hasSort,
      hasPagination
    };
  }
  /**
   * Delete record
   * Cascades to related records (for Has One and Has Many relationships)
   *
   * @param modelOrModelConstructor
   * @param condition
   * @returns
   */
  async delete(modelOrModelConstructor, condition) {
    await this.preOpCheck();
    const deleteQueue = [];
    if (isModelConstructor(modelOrModelConstructor)) {
      const modelConstructor = modelOrModelConstructor;
      const namespace = this.namespaceResolver(modelConstructor);
      const models = await this.query(modelConstructor, condition);
      if (condition !== void 0) {
        await this.deleteTraverse(models, modelConstructor, namespace, deleteQueue);
        await this.deleteItem(deleteQueue);
        const deletedModels = deleteQueue.reduce((acc, { items }) => acc.concat(items), []);
        return [models, deletedModels];
      } else {
        await this.deleteTraverse(models, modelConstructor, namespace, deleteQueue);
        await this.deleteItem(deleteQueue);
        const deletedModels = deleteQueue.reduce((acc, { items }) => acc.concat(items), []);
        return [models, deletedModels];
      }
    } else {
      const model = modelOrModelConstructor;
      const modelConstructor = Object.getPrototypeOf(model).constructor;
      const namespaceName = this.namespaceResolver(modelConstructor);
      const storeName = this.getStorenameForModel(modelConstructor);
      if (condition) {
        const keyValues = this.getIndexKeyValuesFromModel(model);
        const fromDB = await this._get(storeName, keyValues);
        if (fromDB === void 0) {
          const msg = "Model instance not found in storage";
          logger5.warn(msg, { model });
          return [[model], []];
        }
        const predicates = ModelPredicateCreator.getPredicates(condition);
        const { predicates: predicateObjs, type } = predicates;
        const isValid2 = validatePredicate(fromDB, type, predicateObjs);
        if (!isValid2) {
          const msg = "Conditional update failed";
          logger5.error(msg, { model: fromDB, condition: predicateObjs });
          throw new Error(msg);
        }
        await this.deleteTraverse([model], modelConstructor, namespaceName, deleteQueue);
      } else {
        await this.deleteTraverse([model], modelConstructor, namespaceName, deleteQueue);
      }
      await this.deleteItem(deleteQueue);
      const deletedModels = deleteQueue.reduce((acc, { items }) => acc.concat(items), []);
      return [[model], deletedModels];
    }
  }
  /**
   * Recursively traverse relationship graph and add
   * all Has One and Has Many relations to `deleteQueue` param
   *
   * Actual deletion of records added to `deleteQueue` occurs in the `delete` method
   *
   * @param models
   * @param modelConstructor
   * @param namespace
   * @param deleteQueue
   */
  async deleteTraverse(models, modelConstructor, namespace, deleteQueue) {
    const cascadingRelationTypes = ["HAS_ONE", "HAS_MANY"];
    for await (const model of models) {
      const modelDefinition = this.schema.namespaces[namespace].models[modelConstructor.name];
      const modelMeta = {
        builder: modelConstructor,
        schema: modelDefinition,
        pkField: extractPrimaryKeyFieldNames(modelDefinition)
      };
      const relationships = ModelRelationship.allFrom(modelMeta).filter((r2) => cascadingRelationTypes.includes(r2.type));
      for await (const r2 of relationships) {
        const queryObject = r2.createRemoteQueryObject(model);
        if (queryObject !== null) {
          const relatedRecords = await this.query(r2.remoteModelConstructor, ModelPredicateCreator.createFromFlatEqualities(r2.remoteDefinition, queryObject));
          await this.deleteTraverse(relatedRecords, r2.remoteModelConstructor, namespace, deleteQueue);
        }
      }
    }
    deleteQueue.push({
      storeName: getStorename(namespace, modelConstructor.name),
      items: models
    });
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/IndexedDBAdapter.mjs
var logger6 = new ConsoleLogger("DataStore");
var MULTI_OR_CONDITION_SCAN_BREAKPOINT = 7;
var DB_VERSION = 3;
var IndexedDBAdapter = class extends StorageAdapterBase {
  constructor() {
    super(...arguments);
    this.safariCompatabilityMode = false;
    this.canonicalKeyPath = (keyArr) => {
      if (this.safariCompatabilityMode) {
        return keyArr.length > 1 ? keyArr : keyArr[0];
      }
      return keyArr;
    };
  }
  // checks are called by StorageAdapterBase class
  async preSetUpChecks() {
    await this.checkPrivate();
    await this.setSafariCompatabilityMode();
  }
  async preOpCheck() {
    await this.checkPrivate();
  }
  /**
   * Initialize IndexedDB database
   * Create new DB if one doesn't exist
   * Upgrade outdated DB
   *
   * Called by `StorageAdapterBase.setUp()`
   *
   * @returns IDB Database instance
   */
  async initDb() {
    return openDB(this.dbName, DB_VERSION, {
      upgrade: async (db, oldVersion, newVersion, txn) => {
        if (oldVersion === 0) {
          Object.keys(this.schema.namespaces).forEach((namespaceName) => {
            const namespace = this.schema.namespaces[namespaceName];
            Object.keys(namespace.models).forEach((modelName) => {
              const storeName = getStorename(namespaceName, modelName);
              this.createObjectStoreForModel(db, namespaceName, storeName, modelName);
            });
          });
          return;
        }
        if ((oldVersion === 1 || oldVersion === 2) && newVersion === 3) {
          try {
            for (const storeName of txn.objectStoreNames) {
              const origStore = txn.objectStore(storeName);
              const tmpName = `tmp_${storeName}`;
              origStore.name = tmpName;
              const { namespaceName, modelName } = this.getNamespaceAndModelFromStorename(storeName);
              const modelInCurrentSchema = modelName in this.schema.namespaces[namespaceName].models;
              if (!modelInCurrentSchema) {
                db.deleteObjectStore(tmpName);
                continue;
              }
              const newStore = this.createObjectStoreForModel(db, namespaceName, storeName, modelName);
              let cursor = await origStore.openCursor();
              let count = 0;
              while (cursor && cursor.value) {
                await newStore.put(cursor.value);
                cursor = await cursor.continue();
                count++;
              }
              db.deleteObjectStore(tmpName);
              logger6.debug(`${count} ${storeName} records migrated`);
            }
            Object.keys(this.schema.namespaces).forEach((namespaceName) => {
              const namespace = this.schema.namespaces[namespaceName];
              const objectStoreNames = new Set(txn.objectStoreNames);
              Object.keys(namespace.models).map((modelName) => {
                return [modelName, getStorename(namespaceName, modelName)];
              }).filter(([, storeName]) => !objectStoreNames.has(storeName)).forEach(([modelName, storeName]) => {
                this.createObjectStoreForModel(db, namespaceName, storeName, modelName);
              });
            });
          } catch (error) {
            logger6.error("Error migrating IndexedDB data", error);
            txn.abort();
            throw error;
          }
        }
      }
    });
  }
  async _get(storeOrStoreName, keyArr) {
    let index;
    if (typeof storeOrStoreName === "string") {
      const storeName = storeOrStoreName;
      index = this.db.transaction(storeName, "readonly").store.index("byPk");
    } else {
      const store = storeOrStoreName;
      index = store.index("byPk");
    }
    const result = await index.get(this.canonicalKeyPath(keyArr));
    return result;
  }
  async clear() {
    var _a;
    await this.checkPrivate();
    (_a = this.db) == null ? void 0 : _a.close();
    await deleteDB(this.dbName);
    this.db = void 0;
    this.initPromise = void 0;
  }
  async save(model, condition) {
    await this.checkPrivate();
    const { storeName, set, connectionStoreNames, modelKeyValues } = this.saveMetadata(model);
    const tx = this.db.transaction([storeName, ...Array.from(set.values())], "readwrite");
    const store = tx.objectStore(storeName);
    const fromDB = await this._get(store, modelKeyValues);
    this.validateSaveCondition(condition, fromDB);
    const result = [];
    for await (const resItem of connectionStoreNames) {
      const { storeName: storeNameForRestItem, item, instance: instance2, keys } = resItem;
      const storeForRestItem = tx.objectStore(storeNameForRestItem);
      const itemKeyValues = keys.map((key) => item[key]);
      const fromDBForRestItem = await this._get(storeForRestItem, itemKeyValues);
      const opType = fromDBForRestItem ? OpType.UPDATE : OpType.INSERT;
      if (keysEqual(itemKeyValues, modelKeyValues) || opType === OpType.INSERT) {
        const key = await storeForRestItem.index("byPk").getKey(this.canonicalKeyPath(itemKeyValues));
        await storeForRestItem.put(item, key);
        result.push([instance2, opType]);
      }
    }
    await tx.done;
    return result;
  }
  async query(modelConstructor, predicate, pagination) {
    await this.checkPrivate();
    const { storeName, namespaceName, queryByKey, predicates, hasSort, hasPagination } = this.queryMetadata(modelConstructor, predicate, pagination);
    const records = await (async () => {
      if (queryByKey) {
        const record = await this.getByKey(storeName, queryByKey);
        return record ? [record] : [];
      }
      if (predicates) {
        const filtered = await this.filterOnPredicate(storeName, predicates);
        return this.inMemoryPagination(filtered, pagination);
      }
      if (hasSort) {
        const all = await this.getAll(storeName);
        return this.inMemoryPagination(all, pagination);
      }
      if (hasPagination) {
        return this.enginePagination(storeName, pagination);
      }
      return this.getAll(storeName);
    })();
    return this.load(namespaceName, modelConstructor.name, records);
  }
  async queryOne(modelConstructor, firstOrLast = QueryOne.FIRST) {
    await this.checkPrivate();
    const storeName = this.getStorenameForModel(modelConstructor);
    const cursor = await this.db.transaction([storeName], "readonly").objectStore(storeName).openCursor(void 0, firstOrLast === QueryOne.FIRST ? "next" : "prev");
    const result = cursor ? cursor.value : void 0;
    return result && this.modelInstanceCreator(modelConstructor, result);
  }
  async batchSave(modelConstructor, items) {
    await this.checkPrivate();
    if (items.length === 0) {
      return [];
    }
    const modelName = modelConstructor.name;
    const namespaceName = this.namespaceResolver(modelConstructor);
    const storeName = this.getStorenameForModel(modelConstructor);
    const result = [];
    const txn = this.db.transaction(storeName, "readwrite");
    const { store } = txn;
    for (const item of items) {
      const model = this.modelInstanceCreator(modelConstructor, item);
      const connectedModels = traverseModel(modelName, model, this.schema.namespaces[namespaceName], this.modelInstanceCreator, this.getModelConstructorByModelName);
      const keyValues = this.getIndexKeyValuesFromModel(model);
      const { _deleted } = item;
      const index = store.index("byPk");
      const key = await index.getKey(this.canonicalKeyPath(keyValues));
      if (!_deleted) {
        const { instance: instance2 } = connectedModels.find(({ instance: connectedModelInstance }) => {
          const instanceKeyValues = this.getIndexKeyValuesFromModel(connectedModelInstance);
          return keysEqual(instanceKeyValues, keyValues);
        });
        result.push([
          instance2,
          key ? OpType.UPDATE : OpType.INSERT
        ]);
        await store.put(instance2, key);
      } else {
        result.push([item, OpType.DELETE]);
        if (key) {
          await store.delete(key);
        }
      }
    }
    await txn.done;
    return result;
  }
  async deleteItem(deleteQueue) {
    const connectionStoreNames = deleteQueue.map(({ storeName }) => {
      return storeName;
    });
    const tx = this.db.transaction([...connectionStoreNames], "readwrite");
    for await (const deleteItem of deleteQueue) {
      const { storeName, items } = deleteItem;
      const store = tx.objectStore(storeName);
      for await (const item of items) {
        if (item) {
          let key;
          if (typeof item === "object") {
            const keyValues = this.getIndexKeyValuesFromModel(item);
            key = await store.index("byPk").getKey(this.canonicalKeyPath(keyValues));
          } else {
            const itemKey = item.toString();
            key = await store.index("byPk").getKey(itemKey);
          }
          if (key !== void 0) {
            await store.delete(key);
          }
        }
      }
    }
  }
  // #region platform-specific helper methods
  async checkPrivate() {
    const isPrivate = await isPrivateMode();
    if (isPrivate) {
      logger6.error("IndexedDB not supported in this browser's private mode");
      return Promise.reject("IndexedDB not supported in this browser's private mode");
    } else {
      return Promise.resolve();
    }
  }
  /**
   * Whether the browser's implementation of IndexedDB is coercing single-field
   * indexes to a scalar key.
   *
   * If this returns `true`, we need to treat indexes containing a single field
   * as scalars.
   *
   * See PR description for reference:
   * https://github.com/aws-amplify/amplify-js/pull/10527
   */
  async setSafariCompatabilityMode() {
    this.safariCompatabilityMode = await isSafariCompatabilityMode();
    if (this.safariCompatabilityMode === true) {
      logger6.debug("IndexedDB Adapter is running in Safari Compatability Mode");
    }
  }
  getNamespaceAndModelFromStorename(storeName) {
    const [namespaceName, ...modelNameArr] = storeName.split("_");
    return {
      namespaceName,
      modelName: modelNameArr.join("_")
    };
  }
  createObjectStoreForModel(db, namespaceName, storeName, modelName) {
    const store = db.createObjectStore(storeName, {
      autoIncrement: true
    });
    const { indexes } = this.schema.namespaces[namespaceName].relationships[modelName];
    indexes.forEach(([idxName, keyPath, options]) => {
      store.createIndex(idxName, keyPath, options);
    });
    return store;
  }
  async getByKey(storeName, keyValue) {
    return await this._get(storeName, keyValue);
  }
  async getAll(storeName) {
    return this.db.getAll(storeName);
  }
  /**
   * Tries to generate an index fetcher for the given predicates. Assumes
   * that the given predicate conditions are contained by an AND group and
   * should therefore all match a single record.
   *
   * @param storeName The table to query.
   * @param predicates The predicates to try to AND together.
   * @param transaction
   */
  matchingIndexQueries(storeName, predicates, transaction) {
    const queries = [];
    const predicateIndex = /* @__PURE__ */ new Map();
    for (const predicate of predicates) {
      predicateIndex.set(String(predicate.field), predicate);
    }
    const store = transaction.objectStore(storeName);
    for (const name of store.indexNames) {
      const idx = store.index(name);
      const keypath = Array.isArray(idx.keyPath) ? idx.keyPath : [idx.keyPath];
      const matchingPredicateValues = [];
      for (const field of keypath) {
        const p2 = predicateIndex.get(field);
        if (p2 && p2.operand !== null && p2.operand !== void 0) {
          matchingPredicateValues.push(p2.operand);
        } else {
          break;
        }
      }
      if (matchingPredicateValues.length === keypath.length) {
        queries.push(() => this.db.transaction(storeName).objectStore(storeName).index(name).getAll(this.canonicalKeyPath(matchingPredicateValues)));
      }
    }
    return queries;
  }
  async baseQueryIndex(storeName, predicates, transaction) {
    let { predicates: predicateObjs, type } = predicates;
    while (predicateObjs.length === 1 && isPredicateGroup(predicateObjs[0]) && predicateObjs[0].type !== "not") {
      ({ type } = predicateObjs[0]);
      predicateObjs = predicateObjs[0].predicates;
    }
    const fieldPredicates = predicateObjs.filter((p2) => isPredicateObj(p2) && p2.operator === "eq");
    const txn = transaction || this.db.transaction(storeName);
    let result = {};
    if (type === "or") {
      const groupQueries = await Promise.all(predicateObjs.filter((o2) => isPredicateGroup(o2) && o2.type === "and").map((o2) => this.baseQueryIndex(storeName, o2, txn))).then((queries) => queries.filter((q2) => q2.indexedQueries.length === 1).map((i2) => i2.indexedQueries));
      const objectQueries = predicateObjs.filter((o2) => isPredicateObj(o2)).map((o2) => this.matchingIndexQueries(storeName, [o2], txn));
      const indexedQueries = [...groupQueries, ...objectQueries].map((q2) => q2[0]).filter((i2) => i2);
      if (predicateObjs.length > indexedQueries.length) {
        result = {
          groupType: null,
          indexedQueries: []
        };
      } else {
        result = {
          groupType: "or",
          indexedQueries
        };
      }
    } else if (type === "and") {
      result = {
        groupType: type,
        indexedQueries: this.matchingIndexQueries(storeName, fieldPredicates, txn)
      };
    } else {
      result = {
        groupType: null,
        indexedQueries: []
      };
    }
    if (!transaction)
      await txn.done;
    return result;
  }
  async filterOnPredicate(storeName, predicates) {
    const { predicates: predicateObjs, type } = predicates;
    const { groupType, indexedQueries } = await this.baseQueryIndex(storeName, predicates);
    let candidateResults;
    if (groupType === "and" && indexedQueries.length > 0) {
      candidateResults = await indexedQueries[0]();
    } else if (groupType === "or" && indexedQueries.length > 0 && indexedQueries.length <= MULTI_OR_CONDITION_SCAN_BREAKPOINT) {
      const distinctResults = /* @__PURE__ */ new Map();
      for (const query of indexedQueries) {
        const resultGroup = await query();
        for (const item of resultGroup) {
          const distinctificationString = JSON.stringify(item);
          distinctResults.set(distinctificationString, item);
        }
      }
      candidateResults = Array.from(distinctResults.values());
    } else {
      candidateResults = await this.getAll(storeName);
    }
    const filtered = predicateObjs ? candidateResults.filter((m2) => validatePredicate(m2, type, predicateObjs)) : candidateResults;
    return filtered;
  }
  inMemoryPagination(records, pagination) {
    return inMemoryPagination(records, pagination);
  }
  async enginePagination(storeName, pagination) {
    let result;
    if (pagination) {
      const { page = 0, limit = 0 } = pagination;
      const initialRecord = Math.max(0, page * limit) || 0;
      let cursor = await this.db.transaction(storeName).objectStore(storeName).openCursor();
      if (cursor && initialRecord > 0) {
        await cursor.advance(initialRecord);
      }
      const pageResults = [];
      const hasLimit = typeof limit === "number" && limit > 0;
      while (cursor && cursor.value) {
        pageResults.push(cursor.value);
        if (hasLimit && pageResults.length === limit) {
          break;
        }
        cursor = await cursor.continue();
      }
      result = pageResults;
    } else {
      result = await this.db.getAll(storeName);
    }
    return result;
  }
};
var IndexedDBAdapter$1 = new IndexedDBAdapter();

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/InMemoryStore.mjs
var InMemoryStore = class {
  constructor() {
    this.db = /* @__PURE__ */ new Map();
    this.getAllKeys = async () => {
      return Array.from(this.db.keys());
    };
    this.multiGet = async (keys) => {
      return keys.reduce((res, k2) => {
        res.push([k2, this.db.get(k2)]);
        return res;
      }, []);
    };
    this.multiRemove = async (keys, callback) => {
      keys.forEach((k2) => this.db.delete(k2));
      typeof callback === "function" && callback();
    };
    this.multiSet = async (entries, callback) => {
      entries.forEach(([key, value]) => {
        this.setItem(key, value);
      });
      typeof callback === "function" && callback();
    };
    this.setItem = async (key, value) => {
      return this.db.set(key, value);
    };
    this.removeItem = async (key) => {
      return this.db.delete(key);
    };
    this.getItem = async (key) => {
      return this.db.get(key);
    };
  }
};
function createInMemoryStore() {
  return new InMemoryStore();
}

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/AsyncStorageDatabase.mjs
var DB_NAME2 = "@AmplifyDatastore";
var COLLECTION = "Collection";
var DATA = "Data";
var monotonicFactoriesMap = /* @__PURE__ */ new Map();
var AsyncStorageDatabase = class {
  constructor() {
    this._collectionInMemoryIndex = /* @__PURE__ */ new Map();
    this.storage = createInMemoryStore();
  }
  /**
   * Collection index is map of stores (i.e. sync, metadata, mutation event, and data)
   * @param storeName {string} - Name of the store
   * @returns Map of ulid->id
   */
  getCollectionIndex(storeName) {
    if (!this._collectionInMemoryIndex.has(storeName)) {
      this._collectionInMemoryIndex.set(storeName, /* @__PURE__ */ new Map());
    }
    return this._collectionInMemoryIndex.get(storeName);
  }
  /**
   * Return ULID for store if it exists, otherwise create a new one
   * @param storeName {string} - Name of the store
   * @returns ulid
   */
  getMonotonicFactory(storeName) {
    if (!monotonicFactoriesMap.has(storeName)) {
      monotonicFactoriesMap.set(storeName, monotonicUlidFactory());
    }
    return monotonicFactoriesMap.get(storeName);
  }
  async init() {
    this._collectionInMemoryIndex.clear();
    const allKeys = await this.storage.getAllKeys();
    const keysForCollectionEntries = [];
    for (const key of allKeys) {
      const [dbName, storeName, recordType, ulidOrId, id] = key.split("::");
      if (dbName === DB_NAME2) {
        if (recordType === DATA) {
          let ulid3;
          if (id === void 0) {
            const resolvedId = ulidOrId;
            const newUlid = this.getMonotonicFactory(storeName)();
            const oldKey = this.getLegacyKeyForItem(storeName, resolvedId);
            const newKey = this.getKeyForItem(storeName, resolvedId, newUlid);
            const item = await this.storage.getItem(oldKey);
            await this.storage.setItem(newKey, item);
            await this.storage.removeItem(oldKey);
            ulid3 = newUlid;
          } else {
            ulid3 = ulidOrId;
          }
          this.getCollectionIndex(storeName).set(id, ulid3);
        } else if (recordType === COLLECTION) {
          keysForCollectionEntries.push(key);
        }
      }
    }
    if (keysForCollectionEntries.length > 0) {
      await this.storage.multiRemove(keysForCollectionEntries);
    }
  }
  async save(item, storeName, keys, keyValuesPath) {
    var _a, _b;
    const idxName = indexNameFromKeys(keys);
    const ulid3 = ((_a = this.getCollectionIndex(storeName)) == null ? void 0 : _a.get(idxName)) || this.getMonotonicFactory(storeName)();
    const itemKey = this.getKeyForItem(storeName, keyValuesPath, ulid3);
    (_b = this.getCollectionIndex(storeName)) == null ? void 0 : _b.set(keyValuesPath, ulid3);
    await this.storage.setItem(itemKey, JSON.stringify(item));
  }
  async batchSave(storeName, items, keys) {
    if (items.length === 0) {
      return [];
    }
    const result = [];
    const collection = this.getCollectionIndex(storeName);
    const keysToDelete = /* @__PURE__ */ new Set();
    const keysToSave = /* @__PURE__ */ new Set();
    const allItemsKeys = [];
    const itemsMap = {};
    for (const item of items) {
      const keyValues = keys.map((field) => item[field]);
      const { _deleted } = item;
      const ulid3 = collection.get(keyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR)) || this.getMonotonicFactory(storeName)();
      const key = this.getKeyForItem(storeName, keyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR), ulid3);
      allItemsKeys.push(key);
      itemsMap[key] = { ulid: ulid3, model: item };
      if (_deleted) {
        keysToDelete.add(key);
      } else {
        keysToSave.add(key);
      }
    }
    const existingRecordsMap = await this.storage.multiGet(allItemsKeys);
    const existingRecordsKeys = existingRecordsMap.filter(([, v2]) => !!v2).reduce((set, [k2]) => set.add(k2), /* @__PURE__ */ new Set());
    await new Promise((resolve4, reject) => {
      if (keysToDelete.size === 0) {
        resolve4();
        return;
      }
      const keysToDeleteArray = Array.from(keysToDelete);
      keysToDeleteArray.forEach((key) => {
        const primaryKeyValues = keys.map((field) => itemsMap[key].model[field]).join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
        collection.delete(primaryKeyValues);
      });
      this.storage.multiRemove(keysToDeleteArray, (errors) => {
        if (errors && errors.length > 0) {
          reject(errors);
        } else {
          resolve4();
        }
      });
    });
    await new Promise((resolve4, reject) => {
      if (keysToSave.size === 0) {
        resolve4();
        return;
      }
      const entriesToSet = Array.from(keysToSave).map((key) => [
        key,
        JSON.stringify(itemsMap[key].model)
      ]);
      keysToSave.forEach((key) => {
        const { model, ulid: ulid3 } = itemsMap[key];
        const keyValues = keys.map((field) => model[field]).join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
        collection.set(keyValues, ulid3);
      });
      this.storage.multiSet(entriesToSet, (errors) => {
        if (errors && errors.length > 0) {
          reject(errors);
        } else {
          resolve4();
        }
      });
    });
    for (const key of allItemsKeys) {
      if (keysToDelete.has(key) && existingRecordsKeys.has(key)) {
        result.push([itemsMap[key].model, OpType.DELETE]);
      } else if (keysToSave.has(key)) {
        result.push([
          itemsMap[key].model,
          existingRecordsKeys.has(key) ? OpType.UPDATE : OpType.INSERT
        ]);
      }
    }
    return result;
  }
  async get(keyValuePath, storeName) {
    const ulid3 = this.getCollectionIndex(storeName).get(keyValuePath);
    const itemKey = this.getKeyForItem(storeName, keyValuePath, ulid3);
    const recordAsString = await this.storage.getItem(itemKey);
    const record = recordAsString && JSON.parse(recordAsString);
    return record;
  }
  async getOne(firstOrLast, storeName) {
    const collection = this.getCollectionIndex(storeName);
    const [itemId, ulid3] = firstOrLast === QueryOne.FIRST ? (() => {
      let resolvedId, resolvedUlid;
      for ([resolvedId, resolvedUlid] of collection)
        break;
      return [resolvedId, resolvedUlid];
    })() : (() => {
      let resolvedId, resolvedUlid;
      for ([resolvedId, resolvedUlid] of collection)
        ;
      return [resolvedId, resolvedUlid];
    })();
    const itemKey = this.getKeyForItem(storeName, itemId, ulid3);
    const itemString = itemKey && await this.storage.getItem(itemKey);
    const result = itemString ? JSON.parse(itemString) || void 0 : void 0;
    return result;
  }
  /**
   * This function gets all the records stored in async storage for a particular storeName
   * It then loads all the records for that filtered set of keys using multiGet()
   */
  async getAll(storeName, pagination) {
    const collection = this.getCollectionIndex(storeName);
    const { page = 0, limit = 0 } = pagination || {};
    const start = Math.max(0, page * limit) || 0;
    const end = limit > 0 ? start + limit : void 0;
    const keysForStore = [];
    let count = 0;
    for (const [id, ulid3] of collection) {
      count++;
      if (count <= start) {
        continue;
      }
      keysForStore.push(this.getKeyForItem(storeName, id, ulid3));
      if (count === end) {
        break;
      }
    }
    const storeRecordStrings = await this.storage.multiGet(keysForStore);
    const records = storeRecordStrings.filter(([, value]) => value).map(([, value]) => JSON.parse(value));
    return records;
  }
  async delete(key, storeName) {
    const ulid3 = this.getCollectionIndex(storeName).get(key);
    const itemKey = this.getKeyForItem(storeName, key, ulid3);
    this.getCollectionIndex(storeName).delete(key);
    await this.storage.removeItem(itemKey);
  }
  /**
   * Clear the AsyncStorage of all DataStore entries
   */
  async clear() {
    const allKeys = await this.storage.getAllKeys();
    const allDataStoreKeys = allKeys.filter((key) => key.startsWith(DB_NAME2));
    await this.storage.multiRemove(allDataStoreKeys);
    this._collectionInMemoryIndex.clear();
  }
  getKeyForItem(storeName, id, ulid3) {
    return `${this.getKeyPrefixForStoreItems(storeName)}::${ulid3}::${id}`;
  }
  getLegacyKeyForItem(storeName, id) {
    return `${this.getKeyPrefixForStoreItems(storeName)}::${id}`;
  }
  getKeyPrefixForStoreItems(storeName) {
    return `${DB_NAME2}::${storeName}::${DATA}`;
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/AsyncStorageAdapter.mjs
var AsyncStorageAdapter = class extends StorageAdapterBase {
  async preSetUpChecks() {
  }
  async preOpCheck() {
  }
  /**
   * Open AsyncStorage database
   * Create new DB if one doesn't exist
   *
   * Called by `StorageAdapterBase.setUp()`
   *
   * @returns AsyncStorageDatabase instance
   */
  async initDb() {
    const db = new AsyncStorageDatabase();
    await db.init();
    return db;
  }
  async clear() {
    await this.db.clear();
    this.db = void 0;
    this.initPromise = void 0;
  }
  async batchSave(modelConstructor, items) {
    if (items.length === 0) {
      return [];
    }
    const modelName = modelConstructor.name;
    const namespaceName = this.namespaceResolver(modelConstructor);
    const storeName = getStorename(namespaceName, modelName);
    const keys = getIndexKeys(this.schema.namespaces[namespaceName], modelName);
    const batch = [];
    for (const item of items) {
      const model = this.modelInstanceCreator(modelConstructor, item);
      const connectedModels = traverseModel(modelName, model, this.schema.namespaces[namespaceName], this.modelInstanceCreator, this.getModelConstructorByModelName);
      const keyValuesPath = this.getIndexKeyValuesPath(model);
      const { instance: instance2 } = connectedModels.find(({ instance: connectedModelInstance }) => {
        const instanceKeyValuesPath = this.getIndexKeyValuesPath(connectedModelInstance);
        return keysEqual([instanceKeyValuesPath], [keyValuesPath]);
      });
      batch.push(instance2);
    }
    return this.db.batchSave(storeName, batch, keys);
  }
  async _get(storeName, keyArr) {
    const itemKeyValuesPath = keyArr.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
    return await this.db.get(itemKeyValuesPath, storeName);
  }
  async save(model, condition) {
    const { storeName, connectionStoreNames, modelKeyValues } = this.saveMetadata(model);
    const fromDB = await this._get(storeName, modelKeyValues);
    this.validateSaveCondition(condition, fromDB);
    const result = [];
    for await (const resItem of connectionStoreNames) {
      const { storeName: storeNameForRestItem, item, instance: instance2, keys } = resItem;
      const itemKeyValues = keys.map((key) => item[key]);
      const fromDBForRestItem = await this._get(storeNameForRestItem, itemKeyValues);
      const opType = fromDBForRestItem ? OpType.UPDATE : OpType.INSERT;
      if (keysEqual(itemKeyValues, modelKeyValues) || opType === OpType.INSERT) {
        await this.db.save(item, storeNameForRestItem, keys, itemKeyValues.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR));
        result.push([instance2, opType]);
      }
    }
    return result;
  }
  async query(modelConstructor, predicate, pagination) {
    const { storeName, namespaceName, queryByKey, predicates, hasSort, hasPagination } = this.queryMetadata(modelConstructor, predicate, pagination);
    const records = await (async () => {
      if (queryByKey) {
        const keyValues = queryByKey.join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
        const record = await this.getByKey(storeName, keyValues);
        return record ? [record] : [];
      }
      if (predicates) {
        const filtered = await this.filterOnPredicate(storeName, predicates);
        return this.inMemoryPagination(filtered, pagination);
      }
      if (hasSort || hasPagination) {
        const all = await this.getAll(storeName);
        return this.inMemoryPagination(all, pagination);
      }
      return this.getAll(storeName);
    })();
    return this.load(namespaceName, modelConstructor.name, records);
  }
  async getByKey(storeName, keyValuePath) {
    return await this.db.get(keyValuePath, storeName);
  }
  async getAll(storeName) {
    return this.db.getAll(storeName);
  }
  async filterOnPredicate(storeName, predicates) {
    const { predicates: predicateObjs, type } = predicates;
    const all = await this.getAll(storeName);
    const filtered = predicateObjs ? all.filter((m2) => validatePredicate(m2, type, predicateObjs)) : all;
    return filtered;
  }
  inMemoryPagination(records, pagination) {
    return inMemoryPagination(records, pagination);
  }
  async queryOne(modelConstructor, firstOrLast = QueryOne.FIRST) {
    const storeName = this.getStorenameForModel(modelConstructor);
    const result = await this.db.getOne(firstOrLast, storeName);
    return result && this.modelInstanceCreator(modelConstructor, result);
  }
  async deleteItem(deleteQueue) {
    for await (const deleteItem of deleteQueue) {
      const { storeName, items } = deleteItem;
      for await (const item of items) {
        if (item) {
          if (typeof item === "object") {
            const keyValuesPath = this.getIndexKeyValuesPath(item);
            await this.db.delete(keyValuesPath, storeName);
          }
        }
      }
    }
  }
  // #region platform-specific helper methods
  /**
   * Retrieves concatenated primary key values from a model
   *
   * @param model
   * @returns
   */
  getIndexKeyValuesPath(model) {
    return this.getIndexKeyValuesFromModel(model).join(DEFAULT_PRIMARY_KEY_VALUE_SEPARATOR);
  }
};
var AsyncStorageAdapter$1 = new AsyncStorageAdapter();

// node_modules/@aws-amplify/datastore/dist/esm/storage/adapter/getDefaultAdapter/index.mjs
var getDefaultAdapter = () => {
  if (isBrowser && window.indexedDB || isWebWorker() && self.indexedDB) {
    return IndexedDBAdapter$1;
  }
  return AsyncStorageAdapter$1;
};

// node_modules/@aws-amplify/datastore/dist/esm/storage/storage.mjs
var logger7 = new ConsoleLogger("DataStore");
var StorageClass = class {
  constructor(schema2, namespaceResolver2, getModelConstructorByModelName2, modelInstanceCreator2, adapter, sessionId) {
    this.schema = schema2;
    this.namespaceResolver = namespaceResolver2;
    this.getModelConstructorByModelName = getModelConstructorByModelName2;
    this.modelInstanceCreator = modelInstanceCreator2;
    this.adapter = adapter;
    this.sessionId = sessionId;
    this.adapter = this.adapter || getDefaultAdapter();
    this.pushStream = new Subject();
  }
  static getNamespace() {
    const namespace = {
      name: STORAGE,
      relationships: {},
      enums: {},
      models: {},
      nonModels: {}
    };
    return namespace;
  }
  async init() {
    if (this.initialized !== void 0) {
      await this.initialized;
      return;
    }
    logger7.debug("Starting Storage");
    let resolve4;
    let reject;
    this.initialized = new Promise((_resolve, _reject) => {
      resolve4 = _resolve;
      reject = _reject;
    });
    this.adapter.setUp(this.schema, this.namespaceResolver, this.modelInstanceCreator, this.getModelConstructorByModelName, this.sessionId).then(resolve4, reject);
    await this.initialized;
  }
  async save(model, condition, mutator, patchesTuple) {
    await this.init();
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    const result = await this.adapter.save(model, condition);
    result.forEach((r2) => {
      const [savedElement, opType] = r2;
      const syncResponse = !!mutator;
      let updateMutationInput;
      if ((opType === OpType.UPDATE || opType === OpType.INSERT) && !syncResponse) {
        updateMutationInput = this.getChangedFieldsInput(model, savedElement, patchesTuple);
        if (updateMutationInput === null) {
          return result;
        }
      }
      const element = updateMutationInput || savedElement;
      const modelConstructor = Object.getPrototypeOf(savedElement).constructor;
      this.pushStream.next({
        model: modelConstructor,
        opType,
        element,
        mutator,
        condition: condition && ModelPredicateCreator.getPredicates(condition, false) || null,
        savedElement
      });
    });
    return result;
  }
  async delete(modelOrModelConstructor, condition, mutator) {
    await this.init();
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    let models;
    let deleted;
    [models, deleted] = await this.adapter.delete(modelOrModelConstructor, condition);
    const modelConstructor = isModelConstructor(modelOrModelConstructor) ? modelOrModelConstructor : Object.getPrototypeOf(modelOrModelConstructor || {}).constructor;
    const namespaceName = this.namespaceResolver(modelConstructor);
    const modelDefinition = this.schema.namespaces[namespaceName].models[modelConstructor.name];
    const modelIds = new Set(models.map((model) => {
      const modelId = getIdentifierValue(modelDefinition, model);
      return modelId;
    }));
    if (!isModelConstructor(modelOrModelConstructor) && !Array.isArray(deleted)) {
      deleted = [deleted];
    }
    deleted.forEach((model) => {
      const resolvedModelConstructor = Object.getPrototypeOf(model).constructor;
      let theCondition;
      if (!isModelConstructor(modelOrModelConstructor)) {
        const modelId = getIdentifierValue(modelDefinition, model);
        theCondition = modelIds.has(modelId) ? ModelPredicateCreator.getPredicates(condition, false) : void 0;
      }
      this.pushStream.next({
        model: resolvedModelConstructor,
        opType: OpType.DELETE,
        element: model,
        mutator,
        condition: theCondition || null
      });
    });
    return [models, deleted];
  }
  async query(modelConstructor, predicate, pagination) {
    await this.init();
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    return this.adapter.query(modelConstructor, predicate, pagination);
  }
  async queryOne(modelConstructor, firstOrLast = QueryOne.FIRST) {
    await this.init();
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    return this.adapter.queryOne(modelConstructor, firstOrLast);
  }
  observe(modelConstructor, predicate, skipOwn) {
    const listenToAll = !modelConstructor;
    const { predicates, type } = predicate && ModelPredicateCreator.getPredicates(predicate, false) || {};
    let result = this.pushStream.pipe(filter(({ mutator }) => {
      return !skipOwn || mutator !== skipOwn;
    })).pipe(map(({ mutator: _mutator, ...message }) => message));
    if (!listenToAll) {
      result = result.pipe(filter(({ model, element }) => {
        if (modelConstructor !== model) {
          return false;
        }
        if (!!predicates && !!type) {
          return validatePredicate(element, type, predicates);
        }
        return true;
      }));
    }
    return result;
  }
  async clear(completeObservable = true) {
    this.initialized = void 0;
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    await this.adapter.clear();
    if (completeObservable) {
      this.pushStream.complete();
    }
  }
  async batchSave(modelConstructor, items, mutator) {
    await this.init();
    if (!this.adapter) {
      throw new Error("Storage adapter is missing");
    }
    const result = await this.adapter.batchSave(modelConstructor, items);
    result.forEach(([element, opType]) => {
      this.pushStream.next({
        model: modelConstructor,
        opType,
        element,
        mutator,
        condition: null
      });
    });
    return result;
  }
  // returns null if no user fields were changed (determined by value comparison)
  getChangedFieldsInput(model, originalElement, patchesTuple) {
    var _a;
    const containsPatches = patchesTuple && patchesTuple.length;
    if (!containsPatches) {
      return null;
    }
    const [patches, source] = patchesTuple;
    const updatedElement = {};
    const updatedFields = patches.map((patch3) => patch3.path && patch3.path[0]);
    const modelConstructor = Object.getPrototypeOf(model).constructor;
    const namespace = this.namespaceResolver(modelConstructor);
    const { fields: fields7 } = this.schema.namespaces[namespace].models[modelConstructor.name];
    const { primaryKey, compositeKeys = [] } = ((_a = this.schema.namespaces[namespace].keys) == null ? void 0 : _a[modelConstructor.name]) || {};
    updatedFields.forEach((field) => {
      var _a2;
      const targetNames = isTargetNameAssociation((_a2 = fields7[field]) == null ? void 0 : _a2.association);
      if (Array.isArray(targetNames)) {
        for (const targetName of targetNames) {
          if (!valuesEqual(source[targetName], originalElement[targetName])) {
            updatedElement[targetName] = originalElement[targetName] === void 0 ? null : originalElement[targetName];
            for (const fieldSet of compositeKeys) {
              if (fieldSet.has(targetName)) {
                for (const compositeField of fieldSet) {
                  updatedElement[compositeField] = originalElement[compositeField];
                }
              }
            }
          }
        }
      } else {
        const key = targetNames || field;
        if (!valuesEqual(source[key], originalElement[key])) {
          updatedElement[key] = originalElement[key] === void 0 ? null : originalElement[key];
          for (const fieldSet of compositeKeys) {
            if (fieldSet.has(key)) {
              for (const compositeField of fieldSet) {
                updatedElement[compositeField] = originalElement[compositeField];
              }
            }
          }
        }
      }
    });
    if (Object.keys(updatedElement).length === 0) {
      return null;
    }
    if (primaryKey && primaryKey.length) {
      for (const pkField of primaryKey) {
        updatedElement[pkField] = originalElement[pkField];
      }
    }
    const { id, _version, _lastChangedAt, _deleted } = originalElement;
    return {
      ...updatedElement,
      id,
      _version,
      _lastChangedAt,
      _deleted
    };
  }
};
var ExclusiveStorage = class {
  constructor(schema2, namespaceResolver2, getModelConstructorByModelName2, modelInstanceCreator2, adapter, sessionId) {
    this.mutex = new Mutex();
    this.storage = new StorageClass(schema2, namespaceResolver2, getModelConstructorByModelName2, modelInstanceCreator2, adapter, sessionId);
  }
  runExclusive(fn2) {
    return this.mutex.runExclusive(fn2.bind(this, this.storage));
  }
  async save(model, condition, mutator, patchesTuple) {
    return this.runExclusive((storage) => storage.save(model, condition, mutator, patchesTuple));
  }
  async delete(modelOrModelConstructor, condition, mutator) {
    return this.runExclusive((storage) => {
      if (isModelConstructor(modelOrModelConstructor)) {
        const modelConstructor = modelOrModelConstructor;
        return storage.delete(modelConstructor, condition, mutator);
      } else {
        const model = modelOrModelConstructor;
        return storage.delete(model, condition, mutator);
      }
    });
  }
  async query(modelConstructor, predicate, pagination) {
    return this.runExclusive((storage) => storage.query(modelConstructor, predicate, pagination));
  }
  async queryOne(modelConstructor, firstOrLast = QueryOne.FIRST) {
    return this.runExclusive((storage) => storage.queryOne(modelConstructor, firstOrLast));
  }
  static getNamespace() {
    return StorageClass.getNamespace();
  }
  observe(modelConstructor, predicate, skipOwn) {
    return this.storage.observe(modelConstructor, predicate, skipOwn);
  }
  async clear() {
    await this.runExclusive((storage) => storage.clear());
  }
  batchSave(modelConstructor, items) {
    return this.storage.batchSave(modelConstructor, items);
  }
  async init() {
    return this.storage.init();
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/datastoreReachability/index.mjs
var ReachabilityMonitor2 = new Reachability().networkMonitor();

// node_modules/@aws-amplify/datastore/dist/esm/sync/datastoreConnectivity.mjs
var RECONNECTING_IN = 5e3;
var DataStoreConnectivity = class {
  constructor() {
    this.connectionStatus = {
      online: false
    };
  }
  status() {
    if (this.observer) {
      throw new Error("Subscriber already exists");
    }
    return new Observable((observer) => {
      this.observer = observer;
      this.subscription = ReachabilityMonitor2.subscribe(({ online }) => {
        this.connectionStatus.online = online;
        const observerResult = { ...this.connectionStatus };
        observer.next(observerResult);
      });
      return () => {
        clearTimeout(this.timeout);
        this.unsubscribe();
      };
    });
  }
  unsubscribe() {
    if (this.subscription) {
      clearTimeout(this.timeout);
      this.subscription.unsubscribe();
    }
  }
  // for consistency with other background processors.
  async stop() {
    this.unsubscribe();
  }
  socketDisconnected() {
    if (this.observer && typeof this.observer.next === "function") {
      this.observer.next({ online: false });
      this.timeout = setTimeout(() => {
        const observerResult = { ...this.connectionStatus };
        this.observer.next(observerResult);
      }, RECONNECTING_IN);
    }
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/merger.mjs
var ModelMerger = class {
  constructor(outbox, ownSymbol2) {
    this.outbox = outbox;
    this.ownSymbol = ownSymbol2;
  }
  /**
   *
   * @param storage Storage adapter that contains the data.
   * @param model The model from an outbox mutation.
   * @returns The type of operation (INSERT/UPDATE/DELETE)
   */
  async merge(storage, model, modelDefinition) {
    let result;
    const mutationsForModel = await this.outbox.getForModel(storage, model, modelDefinition);
    const isDelete = model._deleted;
    if (mutationsForModel.length === 0) {
      if (isDelete) {
        result = OpType.DELETE;
        await storage.delete(model, void 0, this.ownSymbol);
      } else {
        [[, result]] = await storage.save(model, void 0, this.ownSymbol);
      }
    }
    return result;
  }
  async mergePage(storage, modelConstructor, items, modelDefinition) {
    const itemsMap = /* @__PURE__ */ new Map();
    for (const item of items) {
      const modelId = getIdentifierValue(modelDefinition, item);
      itemsMap.set(modelId, item);
    }
    const page = [...itemsMap.values()];
    return storage.batchSave(modelConstructor, page, this.ownSymbol);
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/outbox.mjs
var MutationEventOutbox = class {
  constructor(schema2, _MutationEvent, modelInstanceCreator2, ownSymbol2) {
    this.schema = schema2;
    this._MutationEvent = _MutationEvent;
    this.modelInstanceCreator = modelInstanceCreator2;
    this.ownSymbol = ownSymbol2;
  }
  async enqueue(storage, mutationEvent) {
    await storage.runExclusive(async (s2) => {
      const mutationEventModelDefinition = this.schema.namespaces[SYNC].models.MutationEvent;
      const predicate = ModelPredicateCreator.createFromAST(mutationEventModelDefinition, {
        and: [
          { modelId: { eq: mutationEvent.modelId } },
          { id: { ne: this.inProgressMutationEventId } }
        ]
      });
      const [first] = await s2.query(this._MutationEvent, predicate);
      if (first === void 0) {
        await s2.save(mutationEvent, void 0, this.ownSymbol);
        return;
      }
      const { operation: incomingMutationType } = mutationEvent;
      if (first.operation === TransformerMutationType.CREATE) {
        if (incomingMutationType === TransformerMutationType.DELETE) {
          await s2.delete(this._MutationEvent, predicate);
        } else {
          const merged = this.mergeUserFields(first, mutationEvent);
          await s2.save(this._MutationEvent.copyOf(first, (draft) => {
            draft.data = merged.data;
          }), void 0, this.ownSymbol);
        }
      } else {
        const { condition: incomingConditionJSON } = mutationEvent;
        const incomingCondition = JSON.parse(incomingConditionJSON);
        let merged;
        if (Object.keys(incomingCondition).length === 0) {
          merged = this.mergeUserFields(first, mutationEvent);
          await s2.delete(this._MutationEvent, predicate);
        }
        merged = merged || mutationEvent;
        await s2.save(merged, void 0, this.ownSymbol);
      }
    });
  }
  async dequeue(storage, record, recordOp) {
    const head3 = await this.peek(storage);
    if (record) {
      await this.syncOutboxVersionsOnDequeue(storage, record, head3, recordOp);
    }
    if (head3) {
      await storage.delete(head3);
    }
    this.inProgressMutationEventId = void 0;
    return head3;
  }
  /**
   * Doing a peek() implies that the mutation goes "inProgress"
   *
   * @param storage
   */
  async peek(storage) {
    const head3 = await storage.queryOne(this._MutationEvent, QueryOne.FIRST);
    this.inProgressMutationEventId = head3 ? head3.id : void 0;
    return head3;
  }
  async getForModel(storage, model, userModelDefinition) {
    const mutationEventModelDefinition = this.schema.namespaces[SYNC].models.MutationEvent;
    const modelId = getIdentifierValue(userModelDefinition, model);
    const mutationEvents = await storage.query(this._MutationEvent, ModelPredicateCreator.createFromAST(mutationEventModelDefinition, {
      and: { modelId: { eq: modelId } }
    }));
    return mutationEvents;
  }
  async getModelIds(storage) {
    const mutationEvents = await storage.query(this._MutationEvent);
    const result = /* @__PURE__ */ new Set();
    mutationEvents.forEach(({ modelId }) => result.add(modelId));
    return result;
  }
  // applies _version from the AppSync mutation response to other items
  // in the mutation queue with the same id
  // see https://github.com/aws-amplify/amplify-js/pull/7354 for more details
  async syncOutboxVersionsOnDequeue(storage, record, head3, recordOp) {
    if ((head3 == null ? void 0 : head3.operation) !== recordOp) {
      return;
    }
    const { _version, _lastChangedAt, _deleted, ..._incomingData } = record;
    const incomingData = this.removeTimestampFields(head3.model, _incomingData);
    const data = JSON.parse(head3.data);
    if (!data) {
      return;
    }
    const { _version: __version, _lastChangedAt: __lastChangedAt, _deleted: __deleted, ..._outgoingData } = data;
    const outgoingData = this.removeTimestampFields(head3.model, _outgoingData);
    if (!directedValueEquality(outgoingData, incomingData, true)) {
      return;
    }
    const mutationEventModelDefinition = this.schema.namespaces[SYNC].models.MutationEvent;
    const userModelDefinition = this.schema.namespaces.user.models[head3.model];
    const recordId = getIdentifierValue(userModelDefinition, record);
    const predicate = ModelPredicateCreator.createFromAST(mutationEventModelDefinition, {
      and: [
        { modelId: { eq: recordId } },
        { id: { ne: this.inProgressMutationEventId } }
      ]
    });
    const outdatedMutations = await storage.query(this._MutationEvent, predicate);
    if (!outdatedMutations.length) {
      return;
    }
    const reconciledMutations = outdatedMutations.map((m2) => {
      const oldData = JSON.parse(m2.data);
      const newData = { ...oldData, _version, _lastChangedAt };
      return this._MutationEvent.copyOf(m2, (draft) => {
        draft.data = JSON.stringify(newData);
      });
    });
    await storage.delete(this._MutationEvent, predicate);
    await Promise.all(reconciledMutations.map(async (m2) => storage.save(m2, void 0, this.ownSymbol)));
  }
  mergeUserFields(previous, current) {
    const { _version, _lastChangedAt, _deleted, ...previousData } = JSON.parse(previous.data);
    const { _version: __version, _lastChangedAt: __lastChangedAt, _deleted: __deleted, ...currentData } = JSON.parse(current.data);
    const data = JSON.stringify({
      _version,
      _lastChangedAt,
      _deleted,
      ...previousData,
      ...currentData
    });
    return this.modelInstanceCreator(this._MutationEvent, {
      ...current,
      data
    });
  }
  /*
      if a model is using custom timestamp fields
      the custom field names will be stored in the model attributes
  
      e.g.
      "attributes": [
      {
              "type": "model",
              "properties": {
                  "timestamps": {
                      "createdAt": "createdOn",
                      "updatedAt": "updatedOn"
                  }
              }
      }
      ]
      */
  removeTimestampFields(model, record) {
    var _a, _b;
    const CREATED_AT_DEFAULT_KEY = "createdAt";
    const UPDATED_AT_DEFAULT_KEY = "updatedAt";
    let createdTimestampKey = CREATED_AT_DEFAULT_KEY;
    let updatedTimestampKey = UPDATED_AT_DEFAULT_KEY;
    const modelAttributes = (_a = this.schema.namespaces[USER].models[model].attributes) == null ? void 0 : _a.find((attr) => attr.type === "model");
    const timestampFieldsMap = (_b = modelAttributes == null ? void 0 : modelAttributes.properties) == null ? void 0 : _b.timestamps;
    if (timestampFieldsMap) {
      createdTimestampKey = timestampFieldsMap[CREATED_AT_DEFAULT_KEY];
      updatedTimestampKey = timestampFieldsMap[UPDATED_AT_DEFAULT_KEY];
    }
    delete record[createdTimestampKey];
    delete record[updatedTimestampKey];
    return record;
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/processors/errorMaps.mjs
var connectionTimeout = (error) => /^Connection failed: Connection Timeout/.test(error.message);
var serverError = (error) => resolveServiceErrorStatusCode(error) >= 500;
var mutationErrorMap = {
  BadModel: () => false,
  BadRecord: (error) => {
    const { message } = error;
    return /^Cannot return \w+ for [\w-_]+ type/.test(message) || /^Variable '.+' has coerced Null value for NonNull type/.test(message);
  },
  ConfigError: () => false,
  Transient: (error) => connectionTimeout(error) || serverError(error),
  Unauthorized: (error) => error.message === "Unauthorized" || resolveServiceErrorStatusCode(error) === 401
};
var subscriptionErrorMap = {
  BadModel: () => false,
  BadRecord: () => false,
  ConfigError: () => false,
  Transient: (observableError) => {
    const error = unwrapObservableError(observableError);
    return connectionTimeout(error) || serverError(error);
  },
  Unauthorized: (observableError) => {
    const error = unwrapObservableError(observableError);
    return /Connection failed.+Unauthorized/.test(error.message);
  }
};
var syncErrorMap = {
  BadModel: () => false,
  BadRecord: (error) => /^Cannot return \w+ for [\w-_]+ type/.test(error.message),
  ConfigError: () => false,
  Transient: (error) => connectionTimeout(error) || serverError(error),
  Unauthorized: (error) => error.errorType === "Unauthorized"
};
function unwrapObservableError(observableError) {
  const { errors: [error] } = observableError;
  return error;
}
function getMutationErrorType(error) {
  return mapErrorToType(mutationErrorMap, error);
}
function getSubscriptionErrorType(error) {
  return mapErrorToType(subscriptionErrorMap, error);
}
function getSyncErrorType(error) {
  return mapErrorToType(syncErrorMap, error);
}
function mapErrorToType(errorMap, error) {
  const errorTypes = [...Object.keys(errorMap)];
  for (const errorType of errorTypes) {
    const matcher = errorMap[errorType];
    if (matcher == null ? void 0 : matcher(error)) {
      return errorType;
    }
  }
  return "Unknown";
}

// node_modules/@aws-amplify/datastore/dist/esm/sync/processors/mutation.mjs
var MAX_ATTEMPTS = 10;
var logger8 = new ConsoleLogger("DataStore");
var MutationProcessor = class {
  constructor(schema2, storage, userClasses2, outbox, modelInstanceCreator2, _MutationEvent, amplifyConfig = {}, authModeStrategy, errorHandler, conflictHandler, amplifyContext) {
    this.schema = schema2;
    this.storage = storage;
    this.userClasses = userClasses2;
    this.outbox = outbox;
    this.modelInstanceCreator = modelInstanceCreator2;
    this._MutationEvent = _MutationEvent;
    this.amplifyConfig = amplifyConfig;
    this.authModeStrategy = authModeStrategy;
    this.errorHandler = errorHandler;
    this.conflictHandler = conflictHandler;
    this.amplifyContext = amplifyContext;
    this.typeQuery = /* @__PURE__ */ new WeakMap();
    this.processing = false;
    this.runningProcesses = new BackgroundProcessManager();
    this.amplifyContext.InternalAPI = this.amplifyContext.InternalAPI || InternalAPI;
    this.generateQueries();
  }
  generateQueries() {
    Object.values(this.schema.namespaces).forEach((namespace) => {
      Object.values(namespace.models).filter(({ syncable }) => syncable).forEach((model) => {
        const [createMutation] = buildGraphQLOperation(namespace, model, "CREATE");
        const [updateMutation] = buildGraphQLOperation(namespace, model, "UPDATE");
        const [deleteMutation] = buildGraphQLOperation(namespace, model, "DELETE");
        this.typeQuery.set(model, [
          createMutation,
          updateMutation,
          deleteMutation
        ]);
      });
    });
  }
  isReady() {
    return this.observer !== void 0;
  }
  start() {
    this.runningProcesses = new BackgroundProcessManager();
    const observable = new Observable((observer) => {
      this.observer = observer;
      try {
        this.resume();
      } catch (error) {
        logger8.error("mutations processor start error", error);
        throw error;
      }
      return this.runningProcesses.addCleaner(async () => {
        this.removeObserver();
        this.pause();
      });
    });
    return observable;
  }
  async stop() {
    this.removeObserver();
    await this.runningProcesses.close();
    await this.runningProcesses.open();
  }
  removeObserver() {
    var _a, _b;
    (_b = (_a = this.observer) == null ? void 0 : _a.complete) == null ? void 0 : _b.call(_a);
    this.observer = void 0;
  }
  async resume() {
    if (this.runningProcesses.isOpen) {
      await this.runningProcesses.add(async (onTerminate) => {
        var _a, _b;
        if (this.processing || !this.isReady() || !this.runningProcesses.isOpen) {
          return;
        }
        this.processing = true;
        let head3;
        const namespaceName = USER;
        while (this.processing && this.runningProcesses.isOpen && (head3 = await this.outbox.peek(this.storage)) !== void 0) {
          const { model, operation, data, condition } = head3;
          const modelConstructor = this.userClasses[model];
          let result = void 0;
          let opName = void 0;
          let modelDefinition = void 0;
          try {
            const modelAuthModes = await getModelAuthModes({
              authModeStrategy: this.authModeStrategy,
              defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
              modelName: model,
              schema: this.schema
            });
            const operationAuthModes = modelAuthModes[operation.toUpperCase()];
            let authModeAttempts = 0;
            const authModeRetry = async () => {
              try {
                logger8.debug(`Attempting mutation with authMode: ${operationAuthModes[authModeAttempts]}`);
                const response = await this.jitteredRetry(namespaceName, model, operation, data, condition, modelConstructor, this._MutationEvent, head3, operationAuthModes[authModeAttempts], onTerminate);
                logger8.debug(`Mutation sent successfully with authMode: ${operationAuthModes[authModeAttempts]}`);
                return response;
              } catch (error) {
                authModeAttempts++;
                if (authModeAttempts >= operationAuthModes.length) {
                  logger8.debug(`Mutation failed with authMode: ${operationAuthModes[authModeAttempts - 1]}`);
                  try {
                    await this.errorHandler({
                      recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
                      localModel: null,
                      message: error.message,
                      model: modelConstructor.name,
                      operation: opName,
                      errorType: getMutationErrorType(error),
                      process: ProcessName.sync,
                      remoteModel: null,
                      cause: error
                    });
                  } catch (e) {
                    logger8.error("Mutation error handler failed with:", e);
                  }
                  throw error;
                }
                logger8.debug(`Mutation failed with authMode: ${operationAuthModes[authModeAttempts - 1]}. Retrying with authMode: ${operationAuthModes[authModeAttempts]}`);
                return authModeRetry();
              }
            };
            [result, opName, modelDefinition] = await authModeRetry();
          } catch (error) {
            if (error.message === "Offline" || error.message === "RetryMutation") {
              continue;
            }
          }
          if (result === void 0) {
            logger8.debug("done retrying");
            await this.storage.runExclusive(async (storage) => {
              await this.outbox.dequeue(storage);
            });
            continue;
          }
          const record = result.data[opName];
          let hasMore = false;
          await this.storage.runExclusive(async (storage) => {
            await this.outbox.dequeue(storage, record, operation);
            hasMore = await this.outbox.peek(storage) !== void 0;
          });
          (_b = (_a = this.observer) == null ? void 0 : _a.next) == null ? void 0 : _b.call(_a, {
            operation,
            modelDefinition,
            model: record,
            hasMore
          });
        }
        this.pause();
      }, "mutation resume loop");
    }
  }
  async jitteredRetry(namespaceName, model, operation, data, condition, modelConstructor, MutationEventCtor, mutationEvent, authMode, onTerminate) {
    return retry(async (retriedModel, retriedOperation, retriedData, retriedCondition, retriedModelConstructor, retiredMutationEventCtor, retiredMutationEvent) => {
      const [query, variables, graphQLCondition, opName, modelDefinition] = this.createQueryVariables(namespaceName, retriedModel, retriedOperation, retriedData, retriedCondition);
      const authToken = await getTokenForCustomAuth(authMode, this.amplifyConfig);
      const tryWith = {
        query,
        variables,
        authMode,
        authToken
      };
      let attempt = 0;
      const opType = this.opTypeFromTransformerOperation(retriedOperation);
      const customUserAgentDetails = {
        category: Category.DataStore,
        action: DataStoreAction.GraphQl
      };
      do {
        try {
          const result = await this.amplifyContext.InternalAPI.graphql(tryWith, void 0, customUserAgentDetails);
          return [result, opName, modelDefinition];
        } catch (err) {
          if (err.errors && err.errors.length > 0) {
            const [error] = err.errors;
            const { originalError: { code = null } = {} } = error;
            if (error.errorType === "Unauthorized") {
              throw new NonRetryableError("Unauthorized");
            }
            if (error.message === "Network Error" || code === "ERR_NETWORK") {
              if (!this.processing) {
                throw new NonRetryableError("Offline");
              }
              throw new Error("Network Error");
            }
            if (error.errorType === "ConflictUnhandled") {
              attempt++;
              let retryWith;
              if (attempt > MAX_ATTEMPTS) {
                retryWith = DISCARD;
              } else {
                try {
                  retryWith = await this.conflictHandler({
                    modelConstructor: retriedModelConstructor,
                    localModel: this.modelInstanceCreator(retriedModelConstructor, variables.input),
                    remoteModel: this.modelInstanceCreator(retriedModelConstructor, error.data),
                    operation: opType,
                    attempts: attempt
                  });
                } catch (caughtErr) {
                  logger8.warn("conflict trycatch", caughtErr);
                  continue;
                }
              }
              if (retryWith === DISCARD) {
                const [[, builtOpName, builtQuery]] = buildGraphQLOperation(this.schema.namespaces[namespaceName], modelDefinition, "GET");
                const newAuthToken = await getTokenForCustomAuth(authMode, this.amplifyConfig);
                const serverData = await this.amplifyContext.InternalAPI.graphql({
                  query: builtQuery,
                  variables: { id: variables.input.id },
                  authMode,
                  authToken: newAuthToken
                }, void 0, customUserAgentDetails);
                return [serverData, builtOpName, modelDefinition];
              }
              const namespace = this.schema.namespaces[namespaceName];
              const updatedMutation = createMutationInstanceFromModelOperation(namespace.relationships, modelDefinition, opType, retriedModelConstructor, retryWith, graphQLCondition, retiredMutationEventCtor, this.modelInstanceCreator, retiredMutationEvent.id);
              await this.storage.save(updatedMutation);
              throw new NonRetryableError("RetryMutation");
            } else {
              try {
                this.errorHandler({
                  recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
                  localModel: variables.input,
                  message: error.message,
                  operation: retriedOperation,
                  errorType: getMutationErrorType(error),
                  errorInfo: error.errorInfo,
                  process: ProcessName.mutate,
                  cause: error,
                  remoteModel: error.data ? this.modelInstanceCreator(retriedModelConstructor, error.data) : null
                });
              } catch (caughtErr) {
                logger8.warn("Mutation error handler failed with:", caughtErr);
              } finally {
                return error.data ? [
                  { data: { [opName]: error.data } },
                  opName,
                  modelDefinition
                ] : [];
              }
            }
          } else {
            throw new NonRetryableError(err);
          }
        }
      } while (tryWith);
    }, [
      model,
      operation,
      data,
      condition,
      modelConstructor,
      MutationEventCtor,
      mutationEvent
    ], safeJitteredBackoff, onTerminate);
  }
  createQueryVariables(namespaceName, model, operation, data, condition) {
    var _a, _b;
    const modelDefinition = this.schema.namespaces[namespaceName].models[model];
    const { primaryKey } = this.schema.namespaces[namespaceName].keys[model];
    const auth = (_a = modelDefinition.attributes) == null ? void 0 : _a.find((a2) => a2.type === "auth");
    const ownerFields = ((_b = auth == null ? void 0 : auth.properties) == null ? void 0 : _b.rules.map((rule) => rule.ownerField).filter((f2) => f2)) || ["owner"];
    const queriesTuples = this.typeQuery.get(modelDefinition);
    const [, opName, query] = queriesTuples.find(([transformerMutationType]) => transformerMutationType === operation);
    const { _version, ...parsedData } = JSON.parse(data);
    const deleteInput = {};
    if (primaryKey && primaryKey.length) {
      for (const pkField of primaryKey) {
        deleteInput[pkField] = parsedData[pkField];
      }
    } else {
      deleteInput[ID] = parsedData.id;
    }
    let mutationInput;
    if (operation === TransformerMutationType.DELETE) {
      mutationInput = deleteInput;
    } else {
      mutationInput = {};
      const modelFields = Object.values(modelDefinition.fields);
      for (const { name, type, association, isReadOnly } of modelFields) {
        if (isReadOnly) {
          continue;
        }
        if (ownerFields.includes(name) && parsedData[name] === null) {
          continue;
        }
        if (isModelFieldType(type)) {
          if (isTargetNameAssociation(association) && association.connectionType === "BELONGS_TO") {
            const targetNames = extractTargetNamesFromSrc(association);
            if (targetNames) {
              for (const targetName of targetNames) {
                mutationInput[targetName] = parsedData[targetName];
              }
            }
          }
          continue;
        }
        if (operation === TransformerMutationType.UPDATE) {
          if (!Object.prototype.hasOwnProperty.call(parsedData, name)) {
            continue;
          }
        }
        mutationInput[name] = parsedData[name];
      }
    }
    const input = {
      ...mutationInput,
      _version
    };
    const graphQLCondition = JSON.parse(condition);
    const variables = {
      input,
      ...operation === TransformerMutationType.CREATE ? {} : {
        condition: Object.keys(graphQLCondition).length > 0 ? graphQLCondition : null
      }
    };
    return [query, variables, graphQLCondition, opName, modelDefinition];
  }
  opTypeFromTransformerOperation(operation) {
    switch (operation) {
      case TransformerMutationType.CREATE:
        return OpType.INSERT;
      case TransformerMutationType.DELETE:
        return OpType.DELETE;
      case TransformerMutationType.UPDATE:
        return OpType.UPDATE;
      case TransformerMutationType.GET:
        break;
      default:
        throw new Error(`Invalid operation ${operation}`);
    }
    return void 0;
  }
  pause() {
    this.processing = false;
  }
};
var MAX_RETRY_DELAY_MS = 5 * 60 * 1e3;
var originalJitteredBackoff = jitteredBackoff(MAX_RETRY_DELAY_MS);
var safeJitteredBackoff = (attempt, _args, error) => {
  const attemptResult = originalJitteredBackoff(attempt);
  if (attemptResult === false && (error || {}).message === "Network Error") {
    return MAX_RETRY_DELAY_MS;
  }
  return attemptResult;
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/processors/subscription.mjs
var logger9 = new ConsoleLogger("DataStore");
var CONTROL_MSG2;
(function(CONTROL_MSG3) {
  CONTROL_MSG3["CONNECTED"] = "CONNECTED";
})(CONTROL_MSG2 || (CONTROL_MSG2 = {}));
var USER_CREDENTIALS;
(function(USER_CREDENTIALS2) {
  USER_CREDENTIALS2[USER_CREDENTIALS2["none"] = 0] = "none";
  USER_CREDENTIALS2[USER_CREDENTIALS2["unauth"] = 1] = "unauth";
  USER_CREDENTIALS2[USER_CREDENTIALS2["auth"] = 2] = "auth";
})(USER_CREDENTIALS || (USER_CREDENTIALS = {}));
var SubscriptionProcessor = class {
  constructor(schema2, syncPredicates, amplifyConfig = {}, authModeStrategy, errorHandler, amplifyContext = {
    InternalAPI
  }) {
    this.schema = schema2;
    this.syncPredicates = syncPredicates;
    this.amplifyConfig = amplifyConfig;
    this.authModeStrategy = authModeStrategy;
    this.errorHandler = errorHandler;
    this.amplifyContext = amplifyContext;
    this.typeQuery = /* @__PURE__ */ new WeakMap();
    this.buffer = [];
    this.runningProcesses = new BackgroundProcessManager();
  }
  buildSubscription(namespace, model, transformerMutationType, userCredentials, oidcTokenPayload, authMode, filterArg = false) {
    const { aws_appsync_authenticationType } = this.amplifyConfig;
    const { isOwner, ownerField, ownerValue } = this.getAuthorizationInfo(model, userCredentials, aws_appsync_authenticationType, oidcTokenPayload, authMode) || {};
    const [opType, opName, query] = buildSubscriptionGraphQLOperation(namespace, model, transformerMutationType, isOwner, ownerField, filterArg);
    return { authMode, opType, opName, query, isOwner, ownerField, ownerValue };
  }
  getAuthorizationInfo(model, userCredentials, defaultAuthType, oidcTokenPayload, authMode) {
    const rules = getAuthorizationRules(model);
    const iamPrivateAuth = authMode === "iam" && rules.find((rule) => rule.authStrategy === "private" && rule.provider === "iam");
    if (iamPrivateAuth && userCredentials === USER_CREDENTIALS.unauth) {
      return null;
    }
    const groupAuthRules = rules.filter((rule) => rule.authStrategy === "groups" && ["userPools", "oidc"].includes(rule.provider));
    const validGroup = (authMode === "oidc" || authMode === "userPool") && // eslint-disable-next-line array-callback-return
    groupAuthRules.find((groupAuthRule) => {
      if (oidcTokenPayload) {
        const oidcUserGroups = getUserGroupsFromToken(oidcTokenPayload, groupAuthRule);
        return [...oidcUserGroups].find((userGroup) => {
          return groupAuthRule.groups.find((group) => group === userGroup);
        });
      }
    });
    if (validGroup) {
      return {
        authMode,
        isOwner: false
      };
    }
    let ownerAuthInfo;
    if (ownerAuthInfo) {
      return ownerAuthInfo;
    }
    const oidcOwnerAuthRules = authMode === "oidc" || authMode === "userPool" ? rules.filter((rule) => rule.authStrategy === "owner" && (rule.provider === "oidc" || rule.provider === "userPools")) : [];
    oidcOwnerAuthRules.forEach((ownerAuthRule) => {
      var _a;
      const ownerValue = oidcTokenPayload == null ? void 0 : oidcTokenPayload[ownerAuthRule.identityClaim];
      const singleOwner = ((_a = model.fields[ownerAuthRule.ownerField]) == null ? void 0 : _a.isArray) !== true;
      const isOwnerArgRequired = singleOwner && !ownerAuthRule.areSubscriptionsPublic;
      if (ownerValue) {
        ownerAuthInfo = {
          authMode,
          isOwner: isOwnerArgRequired,
          ownerField: ownerAuthRule.ownerField,
          ownerValue: String(ownerValue)
        };
      }
    });
    if (ownerAuthInfo) {
      return ownerAuthInfo;
    }
    return {
      authMode: authMode || defaultAuthType,
      isOwner: false
    };
  }
  hubQueryCompletionListener(completed, capsule) {
    const { payload: { event } } = capsule;
    if (event === CONTROL_MSG.SUBSCRIPTION_ACK) {
      completed();
    }
  }
  start() {
    this.runningProcesses = this.runningProcesses || new BackgroundProcessManager();
    const ctlObservable = new Observable((observer) => {
      const promises = [];
      let subscriptions = {};
      let oidcTokenPayload;
      let userCredentials = USER_CREDENTIALS.none;
      this.runningProcesses.add(async () => {
        var _a, _b, _c;
        try {
          const credentials = (_a = (await fetchAuthSession()).tokens) == null ? void 0 : _a.accessToken;
          userCredentials = credentials ? USER_CREDENTIALS.auth : USER_CREDENTIALS.unauth;
        } catch (err) {
        }
        try {
          const session = await fetchAuthSession();
          oidcTokenPayload = (_c = (_b = session.tokens) == null ? void 0 : _b.idToken) == null ? void 0 : _c.payload;
        } catch (err) {
        }
        Object.values(this.schema.namespaces).forEach((namespace) => {
          Object.values(namespace.models).filter(({ syncable }) => syncable).forEach((modelDefinition) => this.runningProcesses.isOpen && this.runningProcesses.add(async () => {
            const modelAuthModes = await getModelAuthModes({
              authModeStrategy: this.authModeStrategy,
              defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
              modelName: modelDefinition.name,
              schema: this.schema
            });
            const readAuthModes = modelAuthModes.READ;
            subscriptions = {
              ...subscriptions,
              [modelDefinition.name]: {
                [TransformerMutationType.CREATE]: [],
                [TransformerMutationType.UPDATE]: [],
                [TransformerMutationType.DELETE]: []
              }
            };
            const operations = [
              TransformerMutationType.CREATE,
              TransformerMutationType.UPDATE,
              TransformerMutationType.DELETE
            ];
            const operationAuthModeAttempts = {
              [TransformerMutationType.CREATE]: 0,
              [TransformerMutationType.UPDATE]: 0,
              [TransformerMutationType.DELETE]: 0
            };
            const predicatesGroup = ModelPredicateCreator.getPredicates(this.syncPredicates.get(modelDefinition), false);
            const addFilterArg = predicatesGroup !== void 0;
            const subscriptionRetry = async (operation, addFilter = addFilterArg) => {
              const { opType: transformerMutationType, opName, query, isOwner, ownerField, ownerValue, authMode } = this.buildSubscription(namespace, modelDefinition, operation, userCredentials, oidcTokenPayload, readAuthModes[operationAuthModeAttempts[operation]], addFilter);
              const authToken = await getTokenForCustomAuth(authMode, this.amplifyConfig);
              const variables = {};
              const customUserAgentDetails = {
                category: Category.DataStore,
                action: DataStoreAction.Subscribe
              };
              if (addFilter && predicatesGroup) {
                variables.filter = predicateToGraphQLFilter(predicatesGroup);
              }
              if (isOwner) {
                if (!ownerValue) {
                  observer.error("Owner field required, sign in is needed in order to perform this operation");
                  return;
                }
                variables[ownerField] = ownerValue;
              }
              logger9.debug(`Attempting ${operation} subscription with authMode: ${readAuthModes[operationAuthModeAttempts[operation]]}`);
              const queryObservable = this.amplifyContext.InternalAPI.graphql({
                query,
                variables,
                ...{ authMode },
                authToken
              }, void 0, customUserAgentDetails);
              let subscriptionReadyCallback;
              subscriptions[modelDefinition.name][transformerMutationType].push(queryObservable.subscribe({
                next: (result) => {
                  const { data, errors } = result;
                  if (Array.isArray(errors) && errors.length > 0) {
                    const messages = errors.map(({ message }) => message);
                    logger9.warn(`Skipping incoming subscription. Messages: ${messages.join("\n")}`);
                    this.drainBuffer();
                    return;
                  }
                  const resolvedPredicatesGroup = ModelPredicateCreator.getPredicates(this.syncPredicates.get(modelDefinition), false);
                  const { [opName]: record } = data;
                  if (this.passesPredicateValidation(record, resolvedPredicatesGroup)) {
                    this.pushToBuffer(transformerMutationType, modelDefinition, record);
                  }
                  this.drainBuffer();
                },
                error: async (subscriptionError) => {
                  const { errors: [{ message = "" } = {}] } = subscriptionError;
                  const isRTFError = (
                    // only attempt catch if a filter variable was added to the subscription query
                    addFilter && this.catchRTFError(message, modelDefinition, predicatesGroup)
                  );
                  if (isRTFError) {
                    subscriptions[modelDefinition.name][transformerMutationType].forEach((subscription) => subscription.unsubscribe());
                    subscriptions[modelDefinition.name][transformerMutationType] = [];
                    subscriptionRetry(operation, false);
                    return;
                  }
                  if (message.includes(CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR) || message.includes(CONTROL_MSG.CONNECTION_FAILED)) {
                    subscriptions[modelDefinition.name][transformerMutationType].forEach((subscription) => subscription.unsubscribe());
                    subscriptions[modelDefinition.name][transformerMutationType] = [];
                    operationAuthModeAttempts[operation]++;
                    if (operationAuthModeAttempts[operation] >= readAuthModes.length) {
                      logger9.debug(`${operation} subscription failed with authMode: ${readAuthModes[operationAuthModeAttempts[operation] - 1]}`);
                    } else {
                      logger9.debug(`${operation} subscription failed with authMode: ${readAuthModes[operationAuthModeAttempts[operation] - 1]}. Retrying with authMode: ${readAuthModes[operationAuthModeAttempts[operation]]}`);
                      subscriptionRetry(operation);
                      return;
                    }
                  }
                  logger9.warn("subscriptionError", message);
                  try {
                    await this.errorHandler({
                      recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
                      localModel: null,
                      message,
                      model: modelDefinition.name,
                      operation,
                      errorType: getSubscriptionErrorType(subscriptionError),
                      process: ProcessName.subscribe,
                      remoteModel: null,
                      cause: subscriptionError
                    });
                  } catch (e) {
                    logger9.error("Subscription error handler failed with:", e);
                  }
                  if (typeof subscriptionReadyCallback === "function") {
                    subscriptionReadyCallback();
                  }
                  if (message.includes('"errorType":"Unauthorized"') || message.includes('"errorType":"OperationDisabled"')) {
                    return;
                  }
                  observer.error(message);
                }
              }));
              promises.push((async () => {
                let boundFunction;
                let removeBoundFunctionListener;
                await new Promise((resolve4) => {
                  subscriptionReadyCallback = resolve4;
                  boundFunction = this.hubQueryCompletionListener.bind(this, resolve4);
                  removeBoundFunctionListener = Hub.listen("api", boundFunction);
                });
                removeBoundFunctionListener();
              })());
            };
            operations.forEach((op) => subscriptionRetry(op));
          }));
        });
        this.runningProcesses.isOpen && this.runningProcesses.add(() => Promise.all(promises).then(() => {
          observer.next(CONTROL_MSG2.CONNECTED);
        }));
      }, "subscription processor new subscriber");
      return this.runningProcesses.addCleaner(async () => {
        Object.keys(subscriptions).forEach((modelName) => {
          subscriptions[modelName][TransformerMutationType.CREATE].forEach((subscription) => {
            subscription.unsubscribe();
          });
          subscriptions[modelName][TransformerMutationType.UPDATE].forEach((subscription) => {
            subscription.unsubscribe();
          });
          subscriptions[modelName][TransformerMutationType.DELETE].forEach((subscription) => {
            subscription.unsubscribe();
          });
        });
      });
    });
    const dataObservable = new Observable((observer) => {
      this.dataObserver = observer;
      this.drainBuffer();
      return this.runningProcesses.addCleaner(async () => {
        this.dataObserver = null;
      });
    });
    return [ctlObservable, dataObservable];
  }
  async stop() {
    await this.runningProcesses.close();
    await this.runningProcesses.open();
  }
  passesPredicateValidation(record, predicatesGroup) {
    if (!predicatesGroup) {
      return true;
    }
    const { predicates, type } = predicatesGroup;
    return validatePredicate(record, type, predicates);
  }
  pushToBuffer(transformerMutationType, modelDefinition, data) {
    this.buffer.push([transformerMutationType, modelDefinition, data]);
  }
  drainBuffer() {
    if (this.dataObserver) {
      this.buffer.forEach((data) => {
        this.dataObserver.next(data);
      });
      this.buffer = [];
    }
  }
  /**
   * @returns true if the service returned an RTF subscription error
   * @remarks logs a warning with remediation instructions
   *
   */
  catchRTFError(message, modelDefinition, predicatesGroup) {
    const header = "Backend subscriptions filtering error.\nSubscriptions filtering will be applied clientside.\n";
    const messageErrorTypeMap = {
      "UnknownArgument: Unknown field argument filter": RTFError.UnknownField,
      "Filters exceed maximum attributes limit": RTFError.MaxAttributes,
      "Filters combination exceed maximum limit": RTFError.MaxCombinations,
      "filter uses same fieldName multiple time": RTFError.RepeatedFieldname,
      "The variables input contains a field name 'not'": RTFError.NotGroup,
      "The variables input contains a field that is not defined for input object type": RTFError.FieldNotInType
    };
    const [_errorMsg, errorType] = Object.entries(messageErrorTypeMap).find(([errorMsg]) => message.includes(errorMsg)) || [];
    if (errorType !== void 0) {
      const remediationMessage = generateRTFRemediation(errorType, modelDefinition, predicatesGroup);
      logger9.warn(`${header}
${message}
${remediationMessage}`);
      return true;
    }
    return false;
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/processors/sync.mjs
var opResultDefaults = {
  items: [],
  nextToken: null,
  startedAt: null
};
var logger10 = new ConsoleLogger("DataStore");
var SyncProcessor = class {
  constructor(schema2, syncPredicates, amplifyConfig = {}, authModeStrategy, errorHandler, amplifyContext) {
    this.schema = schema2;
    this.syncPredicates = syncPredicates;
    this.amplifyConfig = amplifyConfig;
    this.authModeStrategy = authModeStrategy;
    this.errorHandler = errorHandler;
    this.amplifyContext = amplifyContext;
    this.typeQuery = /* @__PURE__ */ new WeakMap();
    this.runningProcesses = new BackgroundProcessManager();
    amplifyContext.InternalAPI = amplifyContext.InternalAPI || InternalAPI;
    this.generateQueries();
  }
  generateQueries() {
    Object.values(this.schema.namespaces).forEach((namespace) => {
      Object.values(namespace.models).filter(({ syncable }) => syncable).forEach((model) => {
        const [[, ...opNameQuery]] = buildGraphQLOperation(namespace, model, "LIST");
        this.typeQuery.set(model, opNameQuery);
      });
    });
  }
  graphqlFilterFromPredicate(model) {
    if (!this.syncPredicates) {
      return null;
    }
    const predicatesGroup = ModelPredicateCreator.getPredicates(this.syncPredicates.get(model), false);
    if (!predicatesGroup) {
      return null;
    }
    return predicateToGraphQLFilter(predicatesGroup);
  }
  async retrievePage(modelDefinition, lastSync, nextToken, limit = null, filter2, onTerminate) {
    const [opName, query] = this.typeQuery.get(modelDefinition);
    const variables = {
      limit,
      nextToken,
      lastSync,
      filter: filter2
    };
    const modelAuthModes = await getModelAuthModes({
      authModeStrategy: this.authModeStrategy,
      defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
      modelName: modelDefinition.name,
      schema: this.schema
    });
    const readAuthModes = modelAuthModes.READ;
    let authModeAttempts = 0;
    const authModeRetry = async () => {
      if (!this.runningProcesses.isOpen) {
        throw new Error("sync.retreievePage termination was requested. Exiting.");
      }
      try {
        logger10.debug(`Attempting sync with authMode: ${readAuthModes[authModeAttempts]}`);
        const response = await this.jitteredRetry({
          query,
          variables,
          opName,
          modelDefinition,
          authMode: readAuthModes[authModeAttempts],
          onTerminate
        });
        logger10.debug(`Sync successful with authMode: ${readAuthModes[authModeAttempts]}`);
        return response;
      } catch (error) {
        authModeAttempts++;
        if (authModeAttempts >= readAuthModes.length) {
          const authMode = readAuthModes[authModeAttempts - 1];
          logger10.debug(`Sync failed with authMode: ${authMode}`, error);
          if (getClientSideAuthError(error) || getForbiddenError(error)) {
            logger10.warn(`User is unauthorized to query ${opName} with auth mode ${authMode}. No data could be returned.`);
            return {
              data: {
                [opName]: opResultDefaults
              }
            };
          }
          throw error;
        }
        logger10.debug(`Sync failed with authMode: ${readAuthModes[authModeAttempts - 1]}. Retrying with authMode: ${readAuthModes[authModeAttempts]}`);
        return authModeRetry();
      }
    };
    const { data } = await authModeRetry();
    const { [opName]: opResult } = data;
    const { items, nextToken: newNextToken, startedAt } = opResult;
    return {
      nextToken: newNextToken,
      startedAt,
      items
    };
  }
  async jitteredRetry({ query, variables, opName, modelDefinition, authMode, onTerminate }) {
    return jitteredExponentialRetry(async (retriedQuery, retriedVariables) => {
      var _a, _b, _c, _d, _e;
      try {
        const authToken = await getTokenForCustomAuth(authMode, this.amplifyConfig);
        const customUserAgentDetails = {
          category: Category.DataStore,
          action: DataStoreAction.GraphQl
        };
        return await this.amplifyContext.InternalAPI.graphql({
          query: retriedQuery,
          variables: retriedVariables,
          authMode,
          authToken
        }, void 0, customUserAgentDetails);
      } catch (error) {
        const clientOrForbiddenErrorMessage = getClientSideAuthError(error) || getForbiddenError(error);
        if (clientOrForbiddenErrorMessage) {
          logger10.error("Sync processor retry error:", error);
          throw new NonRetryableError(clientOrForbiddenErrorMessage);
        }
        const hasItems = Boolean((_b = (_a = error == null ? void 0 : error.data) == null ? void 0 : _a[opName]) == null ? void 0 : _b.items);
        const unauthorized = (error == null ? void 0 : error.errors) && error.errors.some((err) => err.errorType === "Unauthorized");
        const otherErrors = (error == null ? void 0 : error.errors) && error.errors.filter((err) => err.errorType !== "Unauthorized");
        const result = error;
        if (hasItems) {
          result.data[opName].items = result.data[opName].items.filter((item) => item !== null);
        }
        if (hasItems && (otherErrors == null ? void 0 : otherErrors.length)) {
          await Promise.all(otherErrors.map(async (err) => {
            try {
              await this.errorHandler({
                recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
                localModel: null,
                message: err.message,
                model: modelDefinition.name,
                operation: opName,
                errorType: getSyncErrorType(err),
                process: ProcessName.sync,
                remoteModel: null,
                cause: err
              });
            } catch (e) {
              logger10.error("Sync error handler failed with:", e);
            }
          }));
          Hub.dispatch("datastore", {
            event: "nonApplicableDataReceived",
            data: {
              errors: otherErrors,
              modelName: modelDefinition.name
            }
          });
        }
        if (unauthorized) {
          this.errorHandler({
            recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
            localModel: null,
            message: error.message,
            model: modelDefinition.name,
            operation: opName,
            errorType: getSyncErrorType(error.errors[0]),
            process: ProcessName.sync,
            remoteModel: null,
            cause: error
          });
          throw new NonRetryableError(error);
        }
        if ((_e = (_d = (_c = result.data) == null ? void 0 : _c[opName]) == null ? void 0 : _d.items) == null ? void 0 : _e.length) {
          return result;
        }
        throw error;
      }
    }, [query, variables], void 0, onTerminate);
  }
  start(typesLastSync) {
    const { maxRecordsToSync, syncPageSize } = this.amplifyConfig;
    const parentPromises = /* @__PURE__ */ new Map();
    const observable = new Observable((observer) => {
      const sortedTypesLastSyncs = Object.values(this.schema.namespaces).reduce((map2, namespace) => {
        for (const modelName of Array.from(namespace.modelTopologicalOrdering.keys())) {
          const typeLastSync = typesLastSync.get(namespace.models[modelName]);
          map2.set(namespace.models[modelName], typeLastSync);
        }
        return map2;
      }, /* @__PURE__ */ new Map());
      const allModelsReady = Array.from(sortedTypesLastSyncs.entries()).filter(([{ syncable }]) => syncable).map(([modelDefinition, [namespace, lastSync]]) => this.runningProcesses.isOpen && this.runningProcesses.add(async (onTerminate) => {
        let done = false;
        let nextToken = null;
        let startedAt = null;
        let items = null;
        let recordsReceived = 0;
        const filter2 = this.graphqlFilterFromPredicate(modelDefinition);
        const parents = this.schema.namespaces[namespace].modelTopologicalOrdering.get(modelDefinition.name);
        const promises = parents.map((parent) => parentPromises.get(`${namespace}_${parent}`));
        const promise = new Promise(async (resolve4) => {
          await Promise.all(promises);
          do {
            if (!this.runningProcesses.isOpen) {
              logger10.debug(`Sync processor has been stopped, terminating sync for ${modelDefinition.name}`);
              resolve4();
              return;
            }
            const limit = Math.min(maxRecordsToSync - recordsReceived, syncPageSize);
            try {
              ({ items, nextToken, startedAt } = await this.retrievePage(modelDefinition, lastSync, nextToken, limit, filter2, onTerminate));
            } catch (error) {
              try {
                await this.errorHandler({
                  recoverySuggestion: "Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues",
                  localModel: null,
                  message: error.message,
                  model: modelDefinition.name,
                  operation: null,
                  errorType: getSyncErrorType(error),
                  process: ProcessName.sync,
                  remoteModel: null,
                  cause: error
                });
              } catch (e) {
                logger10.error("Sync error handler failed with:", e);
              }
              done = true;
              items = [];
            }
            recordsReceived += items.length;
            done = nextToken === null || recordsReceived >= maxRecordsToSync;
            observer.next({
              namespace,
              modelDefinition,
              items,
              done,
              startedAt,
              isFullSync: !lastSync
            });
          } while (!done);
          resolve4();
        });
        parentPromises.set(`${namespace}_${modelDefinition.name}`, promise);
        await promise;
      }, `adding model ${modelDefinition.name}`));
      Promise.all(allModelsReady).then(() => {
        observer.complete();
      });
    });
    return observable;
  }
  async stop() {
    logger10.debug("stopping sync processor");
    await this.runningProcesses.close();
    await this.runningProcesses.open();
    logger10.debug("sync processor stopped");
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/sync/index.mjs
var logger11 = new ConsoleLogger("DataStore");
var ownSymbol = Symbol("sync");
var ControlMessage;
(function(ControlMessage2) {
  ControlMessage2["SYNC_ENGINE_STORAGE_SUBSCRIBED"] = "storageSubscribed";
  ControlMessage2["SYNC_ENGINE_SUBSCRIPTIONS_ESTABLISHED"] = "subscriptionsEstablished";
  ControlMessage2["SYNC_ENGINE_SYNC_QUERIES_STARTED"] = "syncQueriesStarted";
  ControlMessage2["SYNC_ENGINE_SYNC_QUERIES_READY"] = "syncQueriesReady";
  ControlMessage2["SYNC_ENGINE_MODEL_SYNCED"] = "modelSynced";
  ControlMessage2["SYNC_ENGINE_OUTBOX_MUTATION_ENQUEUED"] = "outboxMutationEnqueued";
  ControlMessage2["SYNC_ENGINE_OUTBOX_MUTATION_PROCESSED"] = "outboxMutationProcessed";
  ControlMessage2["SYNC_ENGINE_OUTBOX_STATUS"] = "outboxStatus";
  ControlMessage2["SYNC_ENGINE_NETWORK_STATUS"] = "networkStatus";
  ControlMessage2["SYNC_ENGINE_READY"] = "ready";
})(ControlMessage || (ControlMessage = {}));
var SyncEngine = class {
  getModelSyncedStatus(modelConstructor) {
    return this.modelSyncedStatus.get(modelConstructor);
  }
  constructor(schema2, namespaceResolver2, modelClasses, userModelClasses, storage, modelInstanceCreator2, conflictHandler, errorHandler, syncPredicates, amplifyConfig = {}, authModeStrategy, amplifyContext, connectivityMonitor) {
    this.schema = schema2;
    this.namespaceResolver = namespaceResolver2;
    this.modelClasses = modelClasses;
    this.userModelClasses = userModelClasses;
    this.storage = storage;
    this.modelInstanceCreator = modelInstanceCreator2;
    this.syncPredicates = syncPredicates;
    this.amplifyConfig = amplifyConfig;
    this.authModeStrategy = authModeStrategy;
    this.amplifyContext = amplifyContext;
    this.connectivityMonitor = connectivityMonitor;
    this.online = false;
    this.modelSyncedStatus = /* @__PURE__ */ new WeakMap();
    this.connectionDisrupted = false;
    this.runningProcesses = new BackgroundProcessManager();
    this.waitForSleepState = new Promise((resolve4) => {
      this.syncQueriesObservableStartSleeping = resolve4;
    });
    const MutationEventCtor = this.modelClasses.MutationEvent;
    this.outbox = new MutationEventOutbox(this.schema, MutationEventCtor, modelInstanceCreator2, ownSymbol);
    this.modelMerger = new ModelMerger(this.outbox, ownSymbol);
    this.syncQueriesProcessor = new SyncProcessor(this.schema, this.syncPredicates, this.amplifyConfig, this.authModeStrategy, errorHandler, this.amplifyContext);
    this.subscriptionsProcessor = new SubscriptionProcessor(this.schema, this.syncPredicates, this.amplifyConfig, this.authModeStrategy, errorHandler, this.amplifyContext);
    this.mutationsProcessor = new MutationProcessor(this.schema, this.storage, this.userModelClasses, this.outbox, this.modelInstanceCreator, MutationEventCtor, this.amplifyConfig, this.authModeStrategy, errorHandler, conflictHandler, this.amplifyContext);
    this.datastoreConnectivity = this.connectivityMonitor || new DataStoreConnectivity();
  }
  start(params) {
    return new Observable((observer) => {
      logger11.log("starting sync engine...");
      let subscriptions = [];
      this.runningProcesses.add(async () => {
        try {
          await this.setupModels(params);
        } catch (err) {
          observer.error(err);
          return;
        }
        const startPromise = new Promise((resolve4, reject) => {
          const doneStarting = resolve4;
          const failedStarting = reject;
          this.datastoreConnectivity.status().subscribe(async ({ online }) => this.runningProcesses.isOpen && this.runningProcesses.add(async (onTerminate) => {
            if (online && !this.online) {
              this.online = online;
              observer.next({
                type: ControlMessage.SYNC_ENGINE_NETWORK_STATUS,
                data: {
                  active: this.online
                }
              });
              this.stopDisruptionListener = this.startDisruptionListener();
              const [ctlSubsObservable, dataSubsObservable] = this.subscriptionsProcessor.start();
              try {
                await new Promise((_resolve, _reject) => {
                  onTerminate.then(_reject);
                  const ctlSubsSubscription = ctlSubsObservable.subscribe({
                    next: (msg) => {
                      if (msg === CONTROL_MSG2.CONNECTED) {
                        _resolve();
                      }
                    },
                    error: (err) => {
                      _reject(err);
                      const handleDisconnect = this.disconnectionHandler();
                      handleDisconnect(err);
                    }
                  });
                  subscriptions.push(ctlSubsSubscription);
                });
              } catch (err) {
                observer.error(err);
                failedStarting();
                return;
              }
              logger11.log("Realtime ready");
              observer.next({
                type: ControlMessage.SYNC_ENGINE_SUBSCRIPTIONS_ESTABLISHED
              });
              try {
                await new Promise((_resolve, _reject) => {
                  const syncQuerySubscription = this.syncQueriesObservable().subscribe({
                    next: (message) => {
                      const { type } = message;
                      if (type === ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY) {
                        _resolve();
                      }
                      observer.next(message);
                    },
                    complete: () => {
                      _resolve();
                    },
                    error: (error) => {
                      _reject(error);
                    }
                  });
                  if (syncQuerySubscription) {
                    subscriptions.push(syncQuerySubscription);
                  }
                });
              } catch (error) {
                observer.error(error);
                failedStarting();
                return;
              }
              subscriptions.push(this.mutationsProcessor.start().subscribe(({ modelDefinition, model: item, hasMore }) => this.runningProcesses.add(async () => {
                const modelConstructor = this.userModelClasses[modelDefinition.name];
                const model = this.modelInstanceCreator(modelConstructor, item);
                await this.storage.runExclusive((storage) => this.modelMerger.merge(storage, model, modelDefinition));
                observer.next({
                  type: ControlMessage.SYNC_ENGINE_OUTBOX_MUTATION_PROCESSED,
                  data: {
                    model: modelConstructor,
                    element: model
                  }
                });
                observer.next({
                  type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
                  data: {
                    isEmpty: !hasMore
                  }
                });
              }, "mutation processor event")));
              subscriptions.push(dataSubsObservable.subscribe(([_transformerMutationType, modelDefinition, item]) => this.runningProcesses.add(async () => {
                const modelConstructor = this.userModelClasses[modelDefinition.name];
                const model = this.modelInstanceCreator(modelConstructor, item);
                await this.storage.runExclusive((storage) => this.modelMerger.merge(storage, model, modelDefinition));
              }, "subscription dataSubsObservable event")));
            } else if (!online) {
              this.online = online;
              observer.next({
                type: ControlMessage.SYNC_ENGINE_NETWORK_STATUS,
                data: {
                  active: this.online
                }
              });
              subscriptions.forEach((sub) => {
                sub.unsubscribe();
              });
              subscriptions = [];
            }
            doneStarting();
          }, "datastore connectivity event"));
        });
        this.storage.observe(null, null, ownSymbol).pipe(filter(({ model }) => {
          const modelDefinition = this.getModelDefinition(model);
          return modelDefinition.syncable === true;
        })).subscribe({
          next: async ({ opType, model, element, condition }) => this.runningProcesses.add(async () => {
            const namespace = this.schema.namespaces[this.namespaceResolver(model)];
            const MutationEventConstructor = this.modelClasses.MutationEvent;
            const modelDefinition = this.getModelDefinition(model);
            const graphQLCondition = predicateToGraphQLCondition(condition, modelDefinition);
            const mutationEvent = createMutationInstanceFromModelOperation(namespace.relationships, this.getModelDefinition(model), opType, model, element, graphQLCondition, MutationEventConstructor, this.modelInstanceCreator);
            await this.outbox.enqueue(this.storage, mutationEvent);
            observer.next({
              type: ControlMessage.SYNC_ENGINE_OUTBOX_MUTATION_ENQUEUED,
              data: {
                model,
                element
              }
            });
            observer.next({
              type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
              data: {
                isEmpty: false
              }
            });
            await startPromise;
            if (this.online) {
              this.mutationsProcessor.resume();
            }
          }, "storage event")
        });
        observer.next({
          type: ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED
        });
        const hasMutationsInOutbox = await this.outbox.peek(this.storage) === void 0;
        observer.next({
          type: ControlMessage.SYNC_ENGINE_OUTBOX_STATUS,
          data: {
            isEmpty: hasMutationsInOutbox
          }
        });
        await startPromise;
        observer.next({
          type: ControlMessage.SYNC_ENGINE_READY
        });
      }, "sync start");
    });
  }
  async getModelsMetadataWithNextFullSync(currentTimeStamp) {
    const modelLastSync = new Map((await this.runningProcesses.add(() => this.getModelsMetadata(), "sync/index getModelsMetadataWithNextFullSync")).map(({ namespace, model, lastSync, lastFullSync, fullSyncInterval }) => {
      const nextFullSync = lastFullSync + fullSyncInterval;
      const syncFrom = !lastFullSync || nextFullSync < currentTimeStamp ? 0 : lastSync;
      return [
        this.schema.namespaces[namespace].models[model],
        [namespace, syncFrom]
      ];
    }));
    return modelLastSync;
  }
  syncQueriesObservable() {
    if (!this.online) {
      return of({});
    }
    return new Observable((observer) => {
      let syncQueriesSubscription;
      this.runningProcesses.isOpen && this.runningProcesses.add(async (onTerminate) => {
        let terminated = false;
        while (!observer.closed && !terminated) {
          const count = /* @__PURE__ */ new WeakMap();
          const modelLastSync = await this.getModelsMetadataWithNextFullSync(Date.now());
          const paginatingModels = new Set(modelLastSync.keys());
          let lastFullSyncStartedAt;
          let syncInterval;
          let start;
          let syncDuration;
          let lastStartedAt;
          await new Promise((resolve4, _reject) => {
            if (!this.runningProcesses.isOpen)
              resolve4();
            onTerminate.then(() => {
              resolve4();
            });
            syncQueriesSubscription = this.syncQueriesProcessor.start(modelLastSync).subscribe({
              next: async ({ namespace, modelDefinition, items, done, startedAt, isFullSync }) => {
                const modelConstructor = this.userModelClasses[modelDefinition.name];
                if (!count.has(modelConstructor)) {
                  count.set(modelConstructor, {
                    new: 0,
                    updated: 0,
                    deleted: 0
                  });
                  start = getNow();
                  lastStartedAt = lastStartedAt === void 0 ? startedAt : Math.max(lastStartedAt, startedAt);
                }
                await this.storage.runExclusive(async (storage) => {
                  const idsInOutbox = await this.outbox.getModelIds(storage);
                  const oneByOne = [];
                  const page = items.filter((item) => {
                    const itemId = getIdentifierValue(modelDefinition, item);
                    if (!idsInOutbox.has(itemId)) {
                      return true;
                    }
                    oneByOne.push(item);
                    return false;
                  });
                  const opTypeCount = [];
                  for (const item of oneByOne) {
                    const opType = await this.modelMerger.merge(storage, item, modelDefinition);
                    if (opType !== void 0) {
                      opTypeCount.push([item, opType]);
                    }
                  }
                  opTypeCount.push(...await this.modelMerger.mergePage(storage, modelConstructor, page, modelDefinition));
                  const counts = count.get(modelConstructor);
                  opTypeCount.forEach(([, opType]) => {
                    switch (opType) {
                      case OpType.INSERT:
                        counts.new++;
                        break;
                      case OpType.UPDATE:
                        counts.updated++;
                        break;
                      case OpType.DELETE:
                        counts.deleted++;
                        break;
                      default:
                        throw new Error(`Invalid opType ${opType}`);
                    }
                  });
                });
                if (done) {
                  const { name: modelName } = modelDefinition;
                  let modelMetadata = await this.getModelMetadata(namespace, modelName);
                  const { lastFullSync, fullSyncInterval } = modelMetadata;
                  syncInterval = fullSyncInterval;
                  lastFullSyncStartedAt = lastFullSyncStartedAt === void 0 ? lastFullSync : Math.max(lastFullSyncStartedAt, isFullSync ? startedAt : lastFullSync);
                  modelMetadata = this.modelClasses.ModelMetadata.copyOf(modelMetadata, (draft) => {
                    draft.lastSync = startedAt;
                    draft.lastFullSync = isFullSync ? startedAt : modelMetadata.lastFullSync;
                  });
                  await this.storage.save(modelMetadata, void 0, ownSymbol);
                  const counts = count.get(modelConstructor);
                  this.modelSyncedStatus.set(modelConstructor, true);
                  observer.next({
                    type: ControlMessage.SYNC_ENGINE_MODEL_SYNCED,
                    data: {
                      model: modelConstructor,
                      isFullSync,
                      isDeltaSync: !isFullSync,
                      counts
                    }
                  });
                  paginatingModels.delete(modelDefinition);
                  if (paginatingModels.size === 0) {
                    syncDuration = getNow() - start;
                    resolve4();
                    observer.next({
                      type: ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
                    });
                    syncQueriesSubscription.unsubscribe();
                  }
                }
              },
              error: (error) => {
                observer.error(error);
              }
            });
            observer.next({
              type: ControlMessage.SYNC_ENGINE_SYNC_QUERIES_STARTED,
              data: {
                models: Array.from(paginatingModels).map(({ name }) => name)
              }
            });
          });
          let msNextFullSync;
          if (!lastFullSyncStartedAt) {
            msNextFullSync = syncInterval - syncDuration;
          } else {
            msNextFullSync = lastFullSyncStartedAt + syncInterval - (lastStartedAt + syncDuration);
          }
          logger11.debug(`Next fullSync in ${msNextFullSync / 1e3} seconds. (${new Date(Date.now() + msNextFullSync)})`);
          await this.runningProcesses.add(async (onRunningProcessTerminate) => {
            let unsleep;
            const sleep = new Promise((resolve4) => {
              unsleep = resolve4;
              setTimeout(unsleep, msNextFullSync);
            });
            onRunningProcessTerminate.then(() => {
              terminated = true;
              this.syncQueriesObservableStartSleeping();
              unsleep();
            });
            this.unsleepSyncQueriesObservable = unsleep;
            this.syncQueriesObservableStartSleeping();
            return sleep;
          }, "syncQueriesObservable sleep");
          this.unsleepSyncQueriesObservable = null;
          this.waitForSleepState = new Promise((resolve4) => {
            this.syncQueriesObservableStartSleeping = resolve4;
          });
        }
      }, "syncQueriesObservable main");
    });
  }
  disconnectionHandler() {
    return (msg) => {
      if (CONTROL_MSG.CONNECTION_CLOSED === msg || CONTROL_MSG.TIMEOUT_DISCONNECT === msg) {
        this.datastoreConnectivity.socketDisconnected();
      }
    };
  }
  unsubscribeConnectivity() {
    this.datastoreConnectivity.unsubscribe();
  }
  /**
   * Stops all subscription activities and resolves when all activies report
   * that they're disconnected, done retrying, etc..
   */
  async stop() {
    logger11.debug("stopping sync engine");
    this.unsubscribeConnectivity();
    this.stopDisruptionListener && this.stopDisruptionListener();
    await this.mutationsProcessor.stop();
    await this.subscriptionsProcessor.stop();
    await this.datastoreConnectivity.stop();
    await this.syncQueriesProcessor.stop();
    await this.runningProcesses.close();
    await this.runningProcesses.open();
    logger11.debug("sync engine stopped and ready to restart");
  }
  async setupModels(params) {
    const { fullSyncInterval } = params;
    const ModelMetadataConstructor = this.modelClasses.ModelMetadata;
    const models = [];
    let savedModel;
    Object.values(this.schema.namespaces).forEach((namespace) => {
      Object.values(namespace.models).filter(({ syncable }) => syncable).forEach((model) => {
        models.push([namespace.name, model]);
        if (namespace.name === USER) {
          const modelConstructor = this.userModelClasses[model.name];
          this.modelSyncedStatus.set(modelConstructor, false);
        }
      });
    });
    const promises = models.map(async ([namespace, model]) => {
      const modelMetadata = await this.getModelMetadata(namespace, model.name);
      const syncPredicate = ModelPredicateCreator.getPredicates(this.syncPredicates.get(model), false);
      const lastSyncPredicate = syncPredicate ? JSON.stringify(syncPredicate) : null;
      if (modelMetadata === void 0) {
        [[savedModel]] = await this.storage.save(this.modelInstanceCreator(ModelMetadataConstructor, {
          model: model.name,
          namespace,
          lastSync: null,
          fullSyncInterval,
          lastFullSync: null,
          lastSyncPredicate
        }), void 0, ownSymbol);
      } else {
        const prevSyncPredicate = modelMetadata.lastSyncPredicate ? modelMetadata.lastSyncPredicate : null;
        const syncPredicateUpdated = prevSyncPredicate !== lastSyncPredicate;
        [[savedModel]] = await this.storage.save(ModelMetadataConstructor.copyOf(modelMetadata, (draft) => {
          draft.fullSyncInterval = fullSyncInterval;
          if (syncPredicateUpdated) {
            draft.lastSync = null;
            draft.lastFullSync = null;
            draft.lastSyncPredicate = lastSyncPredicate;
          }
        }));
      }
      return savedModel;
    });
    const result = {};
    for (const modelMetadata of await Promise.all(promises)) {
      const { model: modelName } = modelMetadata;
      result[modelName] = modelMetadata;
    }
    return result;
  }
  async getModelsMetadata() {
    const ModelMetadataCtor = this.modelClasses.ModelMetadata;
    const modelsMetadata = await this.storage.query(ModelMetadataCtor);
    return modelsMetadata;
  }
  async getModelMetadata(namespace, model) {
    const ModelMetadataCtor = this.modelClasses.ModelMetadata;
    const predicate = ModelPredicateCreator.createFromAST(this.schema.namespaces[SYNC].models[ModelMetadataCtor.name], { and: [{ namespace: { eq: namespace } }, { model: { eq: model } }] });
    const [modelMetadata] = await this.storage.query(ModelMetadataCtor, predicate, {
      page: 0,
      limit: 1
    });
    return modelMetadata;
  }
  getModelDefinition(modelConstructor) {
    const namespaceName = this.namespaceResolver(modelConstructor);
    const modelDefinition = this.schema.namespaces[namespaceName].models[modelConstructor.name];
    return modelDefinition;
  }
  static getNamespace() {
    const namespace = {
      name: SYNC,
      relationships: {},
      enums: {
        OperationType: {
          name: "OperationType",
          values: ["CREATE", "UPDATE", "DELETE"]
        }
      },
      nonModels: {},
      models: {
        MutationEvent: {
          name: "MutationEvent",
          pluralName: "MutationEvents",
          syncable: false,
          fields: {
            id: {
              name: "id",
              type: "ID",
              isRequired: true,
              isArray: false
            },
            model: {
              name: "model",
              type: "String",
              isRequired: true,
              isArray: false
            },
            data: {
              name: "data",
              type: "String",
              isRequired: true,
              isArray: false
            },
            modelId: {
              name: "modelId",
              type: "String",
              isRequired: true,
              isArray: false
            },
            operation: {
              name: "operation",
              type: {
                enum: "Operationtype"
              },
              isArray: false,
              isRequired: true
            },
            condition: {
              name: "condition",
              type: "String",
              isArray: false,
              isRequired: true
            }
          }
        },
        ModelMetadata: {
          name: "ModelMetadata",
          pluralName: "ModelsMetadata",
          syncable: false,
          fields: {
            id: {
              name: "id",
              type: "ID",
              isRequired: true,
              isArray: false
            },
            namespace: {
              name: "namespace",
              type: "String",
              isRequired: true,
              isArray: false
            },
            model: {
              name: "model",
              type: "String",
              isRequired: true,
              isArray: false
            },
            lastSync: {
              name: "lastSync",
              type: "Int",
              isRequired: false,
              isArray: false
            },
            lastFullSync: {
              name: "lastFullSync",
              type: "Int",
              isRequired: false,
              isArray: false
            },
            fullSyncInterval: {
              name: "fullSyncInterval",
              type: "Int",
              isRequired: true,
              isArray: false
            },
            lastSyncPredicate: {
              name: "lastSyncPredicate",
              type: "String",
              isRequired: false,
              isArray: false
            }
          }
        }
      }
    };
    return namespace;
  }
  /**
   * listen for websocket connection disruption
   *
   * May indicate there was a period of time where messages
   * from AppSync were missed. A sync needs to be triggered to
   * retrieve the missed data.
   */
  startDisruptionListener() {
    return Hub.listen("api", (data) => {
      if (data.source === "PubSub" && data.payload.event === CONNECTION_STATE_CHANGE) {
        const connectionState = data.payload.data.connectionState;
        switch (connectionState) {
          case ConnectionState.ConnectionDisrupted:
            this.connectionDisrupted = true;
            break;
          case ConnectionState.Connected:
            if (this.connectionDisrupted) {
              this.scheduleSync();
            }
            this.connectionDisrupted = false;
            break;
        }
      }
    });
  }
  /*
   * Schedule a sync to start when syncQueriesObservable enters sleep state
   * Start sync immediately if syncQueriesObservable is already in sleep state
   */
  scheduleSync() {
    return this.runningProcesses.isOpen && this.runningProcesses.add(() => this.waitForSleepState.then(() => {
      this.unsleepSyncQueriesObservable();
    }));
  }
};

// node_modules/@aws-amplify/datastore/dist/esm/predicates/next.mjs
var ops = [...comparisonKeys];
var predicateInternalsMap = /* @__PURE__ */ new Map();
var registerPredicateInternals = (condition, key) => {
  const finalKey = key || new PredicateInternalsKey();
  predicateInternalsMap.set(finalKey, condition);
  return finalKey;
};
var internals = (key) => {
  if (!predicateInternalsMap.has(key)) {
    throw new Error("Invalid predicate. Terminate your predicate with a valid condition (e.g., `p => p.field.eq('value')`) or pass `Predicates.ALL`.");
  }
  return predicateInternalsMap.get(key);
};
var negations = {
  and: "or",
  or: "and",
  not: "and",
  eq: "ne",
  ne: "eq",
  gt: "le",
  ge: "lt",
  lt: "ge",
  le: "gt",
  contains: "notContains",
  notContains: "contains"
};
var FieldCondition = class _FieldCondition {
  constructor(field, operator, operands) {
    this.field = field;
    this.operator = operator;
    this.operands = operands;
    this.validate();
  }
  /**
   * Creates a copy of self.
   * @param extract Not used. Present only to fulfill the `UntypedCondition` interface.
   * @returns A new, identitical `FieldCondition`.
   */
  copy() {
    return [
      new _FieldCondition(this.field, this.operator, [...this.operands]),
      void 0
    ];
  }
  /**
   * Produces a tree structure similar to a graphql condition. The returned
   * structure is "dumb" and is intended for another query/condition
   * generation mechanism to interpret, such as the cloud or storage query
   * builders.
   *
   * E.g.,
   *
   * ```json
   * {
   * 	"name": {
   * 		"eq": "robert"
   * 	}
   * }
   * ```
   */
  toAST() {
    return {
      [this.field]: {
        [this.operator]: this.operator === "between" ? [this.operands[0], this.operands[1]] : this.operands[0]
      }
    };
  }
  /**
   * Produces a new condition (`FieldCondition` or `GroupCondition`) that
   * matches the opposite of this condition.
   *
   * Intended to be used when applying De Morgan's Law, which can be done to
   * produce more efficient queries against the storage layer if a negation
   * appears in the query tree.
   *
   * For example:
   *
   * 1. `name.eq('robert')` becomes `name.ne('robert')`
   * 2. `price.between(100, 200)` becomes `m => m.or(m => [m.price.lt(100), m.price.gt(200)])`
   *
   * @param model The model meta to use when construction a new `GroupCondition`
   * for cases where the negation requires multiple `FieldCondition`'s.
   */
  negated(model) {
    if (this.operator === "between") {
      return new GroupCondition(model, void 0, void 0, "or", [
        new _FieldCondition(this.field, "lt", [this.operands[0]]),
        new _FieldCondition(this.field, "gt", [this.operands[1]])
      ]);
    } else if (this.operator === "beginsWith") {
      return new GroupCondition(model, void 0, void 0, "not", [
        new _FieldCondition(this.field, "beginsWith", [this.operands[0]])
      ]);
    } else {
      return new _FieldCondition(this.field, negations[this.operator], this.operands);
    }
  }
  /**
   * Not implemented. Not needed. GroupCondition instead consumes FieldConditions and
   * transforms them into legacy predicates. (*For now.*)
   * @param storage N/A. If ever implemented, the storage adapter to query.
   * @returns N/A. If ever implemented, return items from `storage` that match.
   */
  async fetch() {
    return Promise.reject("No implementation needed [yet].");
  }
  /**
   * Determins whether a given item matches the expressed condition.
   * @param item The item to test.
   * @returns `Promise<boolean>`, `true` if matches; `false` otherwise.
   */
  async matches(item) {
    const v2 = item[this.field];
    const operations = {
      eq: () => v2 === this.operands[0],
      ne: () => v2 !== this.operands[0],
      gt: () => v2 > this.operands[0],
      ge: () => v2 >= this.operands[0],
      lt: () => v2 < this.operands[0],
      le: () => v2 <= this.operands[0],
      contains: () => (v2 == null ? void 0 : v2.indexOf(this.operands[0])) > -1,
      notContains: () => !v2 ? true : v2.indexOf(this.operands[0]) === -1,
      beginsWith: () => v2 == null ? void 0 : v2.startsWith(this.operands[0]),
      between: () => v2 >= this.operands[0] && v2 <= this.operands[1]
    };
    const operation = operations[this.operator];
    if (operation) {
      const result = operation();
      return result;
    } else {
      throw new Error(`Invalid operator given: ${this.operator}`);
    }
  }
  /**
   * Checks `this.operands` for compatibility with `this.operator`.
   */
  validate() {
    const argumentCount = (count) => {
      const argsClause = count === 1 ? "argument is" : "arguments are";
      return () => {
        if (this.operands.length !== count) {
          return `Exactly ${count} ${argsClause} required.`;
        }
      };
    };
    const validations = {
      eq: argumentCount(1),
      ne: argumentCount(1),
      gt: argumentCount(1),
      ge: argumentCount(1),
      lt: argumentCount(1),
      le: argumentCount(1),
      contains: argumentCount(1),
      notContains: argumentCount(1),
      beginsWith: argumentCount(1),
      between: () => argumentCount(2)() || (this.operands[0] > this.operands[1] ? "The first argument must be less than or equal to the second argument." : null)
    };
    const validate2 = validations[this.operator];
    if (validate2) {
      const e = validate2();
      if (typeof e === "string")
        throw new Error(`Incorrect usage of \`${this.operator}()\`: ${e}`);
    } else {
      throw new Error(`Non-existent operator: \`${this.operator}()\``);
    }
  }
};
var getGroupId = /* @__PURE__ */ (() => {
  let seed = 1;
  return () => `group_${seed++}`;
})();
var GroupCondition = class _GroupCondition {
  constructor(model, field, relationshipType, operator, operands, isOptimized = false) {
    this.model = model;
    this.field = field;
    this.relationshipType = relationshipType;
    this.operator = operator;
    this.operands = operands;
    this.isOptimized = isOptimized;
    this.groupId = getGroupId();
  }
  /**
   * Returns a copy of a GroupCondition, which also returns the copy of a
   * given reference node to "extract".
   * @param extract A node of interest. Its copy will *also* be returned if the node exists.
   * @returns [The full copy, the copy of `extract` | undefined]
   */
  copy(extract) {
    const copied = new _GroupCondition(this.model, this.field, this.relationshipType, this.operator, []);
    let extractedCopy = extract === this ? copied : void 0;
    this.operands.forEach((o2) => {
      const [operandCopy, extractedFromOperand] = o2.copy(extract);
      copied.operands.push(operandCopy);
      extractedCopy = extractedCopy || extractedFromOperand;
    });
    return [copied, extractedCopy];
  }
  /**
   * Creates a new `GroupCondition` that contains only the local field conditions,
   * omitting related model conditions. That resulting `GroupCondition` can be
   * used to produce predicates that are compatible with the storage adapters and
   * Cloud storage.
   *
   * @param negate Whether the condition tree should be negated according
   * to De Morgan's law.
   */
  withFieldConditionsOnly(negate) {
    const negateChildren = negate !== (this.operator === "not");
    return new _GroupCondition(this.model, void 0, void 0, negate ? negations[this.operator] : this.operator, this.operands.filter((o2) => o2 instanceof FieldCondition).map((o2) => negateChildren ? o2.negated(this.model) : o2));
  }
  /**
   * Returns a version of the predicate tree with unnecessary logical groups
   * condensed and merged together. This is intended to create a dense tree
   * with leaf nodes (`FieldCondition`'s) aggregated under as few group conditions
   * as possible for the most efficient fetching possible -- it allows `fetch()`.
   *
   * E.g. a grouping like this:
   *
   * ```yaml
   * and:
   * 	and:
   * 		id:
   * 			eq: "abc"
   * 	and:
   * 		name:
   * 			eq: "xyz"
   * ```
   *
   * Will become this:
   *
   * ```yaml
   * and:
   * 	id:
   * 		eq: "abc"
   * 	name:
   * 		eq: "xyz"
   * ```
   *
   * This allows `fetch()` to pass both the `id` and `name` conditions to the adapter
   * together, which can then decide what index to use based on both fields together.
   *
   * @param preserveNode Whether to preserve the current node and to explicitly not eliminate
   * it during optimization. Used internally to preserve the root node and children of
   * `not` groups. `not` groups will always have a single child, so there's nothing to
   * optimize below a `not` (for now), and it makes the query logic simpler later.
   */
  optimized(preserveNode = true) {
    const operands = this.operands.map((o2) => o2 instanceof _GroupCondition ? o2.optimized(this.operator === "not") : o2);
    if (!preserveNode && ["and", "or"].includes(this.operator) && !this.field && operands.length === 1) {
      const operand = operands[0];
      if (operand instanceof FieldCondition) {
        if (operand.operator !== "between") {
          return operand;
        }
      } else {
        return operand;
      }
    }
    return new _GroupCondition(this.model, this.field, this.relationshipType, this.operator, operands, true);
  }
  /**
   * Fetches matching records from a given storage adapter using legacy predicates (for now).
   * @param storage The storage adapter this predicate will query against.
   * @param breadcrumb For debugging/troubleshooting. A list of the `groupId`'s this
   * GroupdCondition.fetch is nested within.
   * @param negate Whether to match on the `NOT` of `this`.
   * @returns An `Promise` of `any[]` from `storage` matching the child conditions.
   */
  async fetch(storage, breadcrumb = [], negate = false) {
    if (!this.isOptimized) {
      return this.optimized().fetch(storage);
    }
    const resultGroups = [];
    const operator = negate ? negations[this.operator] : this.operator;
    const negateChildren = negate !== (this.operator === "not");
    const groups = this.operands.filter((op) => op instanceof _GroupCondition);
    const conditions = this.operands.filter((op) => op instanceof FieldCondition);
    for (const g2 of groups) {
      const relatives = await g2.fetch(storage, [...breadcrumb, this.groupId], negateChildren);
      if (relatives.length === 0) {
        if (operator === "and") {
          return [];
        }
        resultGroups.push([]);
        continue;
      }
      if (g2.field) {
        const relationship = ModelRelationship.from(this.model, g2.field);
        if (relationship) {
          const allJoinConditions = [];
          for (const relative of relatives) {
            const relativeConditions = [];
            for (let i2 = 0; i2 < relationship.localJoinFields.length; i2++) {
              relativeConditions.push({
                [relationship.localJoinFields[i2]]: {
                  eq: relative[relationship.remoteJoinFields[i2]]
                }
              });
            }
            allJoinConditions.push({ and: relativeConditions });
          }
          const predicate = ModelPredicateCreator.createFromAST(this.model.schema, {
            or: allJoinConditions
          });
          resultGroups.push(await storage.query(this.model.builder, predicate));
        } else {
          throw new Error("Missing field metadata.");
        }
      } else {
        resultGroups.push(relatives);
      }
    }
    if (conditions.length > 0) {
      const predicate = this.withFieldConditionsOnly(negateChildren).toStoragePredicate();
      resultGroups.push(await storage.query(this.model.builder, predicate));
    } else if (conditions.length === 0 && resultGroups.length === 0) {
      resultGroups.push(await storage.query(this.model.builder));
    }
    const getPKValue = (item) => JSON.stringify(this.model.pkField.map((name) => item[name]));
    let resultIndex;
    if (operator === "and") {
      if (resultGroups.length === 0) {
        return [];
      }
      for (const group of resultGroups) {
        if (resultIndex === void 0) {
          resultIndex = new Map(group.map((item) => [getPKValue(item), item]));
        } else {
          const intersectWith = new Map(group.map((item) => [getPKValue(item), item]));
          for (const k2 of resultIndex.keys()) {
            if (!intersectWith.has(k2)) {
              resultIndex.delete(k2);
            }
          }
        }
      }
    } else if (operator === "or" || operator === "not") {
      resultIndex = /* @__PURE__ */ new Map();
      for (const group of resultGroups) {
        for (const item of group) {
          resultIndex.set(getPKValue(item), item);
        }
      }
    }
    return Array.from((resultIndex == null ? void 0 : resultIndex.values()) || []);
  }
  /**
   * Determines whether a single item matches the conditions of `this`.
   * When checking the target `item`'s properties, each property will be `await`'d
   * to ensure lazy-loading is respected where applicable.
   * @param item The item to match against.
   * @param ignoreFieldName Tells `match()` that the field name has already been dereferenced.
   * (Used for iterating over children on HAS_MANY checks.)
   * @returns A boolean (promise): `true` if matched, `false` otherwise.
   */
  async matches(item, ignoreFieldName = false) {
    const itemToCheck = this.field && !ignoreFieldName ? await item[this.field] : item;
    if (!itemToCheck) {
      return false;
    }
    if (this.relationshipType === "HAS_MANY" && typeof itemToCheck[Symbol.asyncIterator] === "function") {
      for await (const singleItem of itemToCheck) {
        if (await this.matches(singleItem, true)) {
          return true;
        }
      }
      return false;
    }
    if (this.operator === "or") {
      return asyncSome(this.operands, (c2) => c2.matches(itemToCheck));
    } else if (this.operator === "and") {
      return asyncEvery(this.operands, (c2) => c2.matches(itemToCheck));
    } else if (this.operator === "not") {
      if (this.operands.length !== 1) {
        throw new Error("Invalid arguments! `not()` accepts exactly one predicate expression.");
      }
      return !await this.operands[0].matches(itemToCheck);
    } else {
      throw new Error("Invalid group operator!");
    }
  }
  /**
   * Tranfsorm to a AppSync GraphQL compatible AST.
   * (Does not support filtering in nested types.)
   */
  toAST() {
    if (this.field)
      throw new Error("Nested type conditions are not supported!");
    return {
      [this.operator]: this.operands.map((operand) => operand.toAST())
    };
  }
  /**
   * Turn this predicate group into something a storage adapter
   * understands how to use.
   */
  toStoragePredicate() {
    return ModelPredicateCreator.createFromAST(this.model.schema, this.toAST());
  }
  /**
   * A JSON representation that's good for debugging.
   */
  toJSON() {
    return {
      ...this,
      model: this.model.schema.name
    };
  }
};
function recursivePredicateFor(ModelType, allowRecursion = true, field, query, tail) {
  const starter = new GroupCondition(ModelType, field, void 0, "and", []);
  const baseCondition = query && tail ? query : starter;
  const tailCondition = query && tail ? tail : starter;
  const link = {};
  registerPredicateInternals(baseCondition, link);
  const copyLink = () => {
    const [copiedQuery, newTail] = baseCondition.copy(tailCondition);
    const newLink = recursivePredicateFor(ModelType, allowRecursion, void 0, copiedQuery, newTail);
    return { query: copiedQuery, newTail, newLink };
  };
  ["and", "or"].forEach((op) => {
    link[op] = (builder) => {
      const { query: copiedLinkQuery, newTail } = copyLink();
      const childConditions = builder(recursivePredicateFor(ModelType, allowRecursion));
      if (!Array.isArray(childConditions)) {
        throw new Error(`Invalid predicate. \`${op}\` groups must return an array of child conditions.`);
      }
      newTail == null ? void 0 : newTail.operands.push(new GroupCondition(ModelType, field, void 0, op, childConditions.map((c2) => internals(c2))));
      return registerPredicateInternals(copiedLinkQuery);
    };
  });
  link.not = (builder) => {
    const { query: copiedLinkQuery, newTail } = copyLink();
    newTail == null ? void 0 : newTail.operands.push(new GroupCondition(ModelType, field, void 0, "not", [
      internals(builder(recursivePredicateFor(ModelType, allowRecursion)))
    ]));
    return registerPredicateInternals(copiedLinkQuery);
  };
  for (const fieldName in ModelType.schema.allFields) {
    Object.defineProperty(link, fieldName, {
      enumerable: true,
      get: () => {
        const def = ModelType.schema.allFields[fieldName];
        if (!def.association) {
          return ops.reduce((fieldMatcher, operator) => {
            return {
              ...fieldMatcher,
              // each operator on the fieldMatcher objcect is a function.
              // when the customer calls the function, it returns a new link
              // in the chain -- for now -- this is the "leaf" link that
              // cannot be further extended.
              [operator]: (...operands) => {
                const { query: copiedLinkQuery, newTail } = copyLink();
                const normalizedOperands = operands.map((o2) => o2 === void 0 ? null : o2);
                newTail == null ? void 0 : newTail.operands.push(new FieldCondition(fieldName, operator, normalizedOperands));
                return registerPredicateInternals(copiedLinkQuery);
              }
            };
          }, {});
        } else {
          if (!allowRecursion) {
            throw new Error("Predication on releated models is not supported in this context.");
          } else if (def.association.connectionType === "BELONGS_TO" || def.association.connectionType === "HAS_ONE" || def.association.connectionType === "HAS_MANY") {
            const relatedMeta = def.type.modelConstructor;
            if (!relatedMeta) {
              throw new Error("Related model metadata is missing. This is a bug! Please report it.");
            }
            const [newquery, oldtail] = baseCondition.copy(tailCondition);
            const newtail = new GroupCondition(relatedMeta, fieldName, def.association.connectionType, "and", []);
            oldtail.operands.push(newtail);
            const newlink = recursivePredicateFor(relatedMeta, allowRecursion, void 0, newquery, newtail);
            return newlink;
          } else {
            throw new Error("Related model definition doesn't have a typedef. This is a bug! Please report it.");
          }
        }
      }
    });
  }
  return link;
}
function predicateFor(ModelType) {
  return recursivePredicateFor(ModelType, false);
}

// node_modules/@aws-amplify/datastore/dist/esm/datastore/utils.mjs
var isNode2 = () => typeof process !== "undefined" && process.versions != null && process.versions.node != null;

// node_modules/@aws-amplify/datastore/dist/esm/datastore/datastore.mjs
sn(true);
T();
var logger12 = new ConsoleLogger("DataStore");
var ulid2 = monotonicUlidFactory(Date.now());
var SETTING_SCHEMA_VERSION = "schemaVersion";
var schema;
var modelNamespaceMap = /* @__PURE__ */ new WeakMap();
var modelPatchesMap = /* @__PURE__ */ new WeakMap();
var getModelDefinition = (modelConstructor) => {
  const namespace = modelNamespaceMap.get(modelConstructor);
  const definition = namespace ? schema.namespaces[namespace].models[modelConstructor.name] : void 0;
  return definition;
};
var isValidModelConstructor = (obj) => {
  return isModelConstructor(obj) && modelNamespaceMap.has(obj);
};
var namespaceResolver = (modelConstructor) => {
  const resolver = modelNamespaceMap.get(modelConstructor);
  if (!resolver) {
    throw new Error(`Namespace Resolver for '${modelConstructor.name}' not found! This is probably a bug in '@amplify-js/datastore'.`);
  }
  return resolver;
};
var buildSeedPredicate = (modelConstructor) => {
  if (!modelConstructor)
    throw new Error("Missing modelConstructor");
  const modelSchema = getModelDefinition(modelConstructor);
  if (!modelSchema)
    throw new Error("Missing modelSchema");
  const pks = extractPrimaryKeyFieldNames(modelSchema);
  if (!pks)
    throw new Error("Could not determine PK");
  return recursivePredicateFor({
    builder: modelConstructor,
    schema: modelSchema,
    pkField: pks
  });
};
var syncClasses;
var userClasses;
var dataStoreClasses;
var storageClasses;
var modelInstanceAssociationsMap = /* @__PURE__ */ new WeakMap();
var ModelAttachment;
(function(ModelAttachment2) {
  ModelAttachment2["Detached"] = "Detached";
  ModelAttachment2["DataStore"] = "DataStore";
  ModelAttachment2["API"] = "API";
})(ModelAttachment || (ModelAttachment = {}));
var attachedModelInstances = /* @__PURE__ */ new WeakMap();
function attached(result, attachment) {
  if (Array.isArray(result)) {
    result.map((record) => attached(record, attachment));
  } else {
    result && attachedModelInstances.set(result, attachment);
  }
  return result;
}
var getAttachment = (instance2) => {
  return attachedModelInstances.has(instance2) ? attachedModelInstances.get(instance2) : ModelAttachment.Detached;
};
var initSchema = (userSchema) => {
  if (schema !== void 0) {
    console.warn("The schema has already been initialized");
    return userClasses;
  }
  logger12.log("validating schema", { schema: userSchema });
  checkSchemaCodegenVersion(userSchema.codegenVersion);
  const internalUserNamespace = {
    name: USER,
    ...userSchema
  };
  logger12.log("DataStore", "Init models");
  userClasses = createTypeClasses(internalUserNamespace);
  logger12.log("DataStore", "Models initialized");
  const dataStoreNamespace = getNamespace();
  const storageNamespace = ExclusiveStorage.getNamespace();
  const syncNamespace = SyncEngine.getNamespace();
  dataStoreClasses = createTypeClasses(dataStoreNamespace);
  storageClasses = createTypeClasses(storageNamespace);
  syncClasses = createTypeClasses(syncNamespace);
  schema = {
    namespaces: {
      [dataStoreNamespace.name]: dataStoreNamespace,
      [internalUserNamespace.name]: internalUserNamespace,
      [storageNamespace.name]: storageNamespace,
      [syncNamespace.name]: syncNamespace
    },
    version: userSchema.version,
    codegenVersion: userSchema.codegenVersion
  };
  Object.keys(schema.namespaces).forEach((namespace) => {
    const [relations, keys] = establishRelationAndKeys(schema.namespaces[namespace]);
    schema.namespaces[namespace].relationships = relations;
    schema.namespaces[namespace].keys = keys;
    const modelAssociations = /* @__PURE__ */ new Map();
    Object.values(schema.namespaces[namespace].models).forEach((model) => {
      const connectedModels = [];
      Object.values(model.fields).filter((field) => field.association && field.association.connectionType === "BELONGS_TO" && field.type.model !== model.name).forEach((field) => connectedModels.push(field.type.model));
      modelAssociations.set(model.name, connectedModels);
      Object.values(model.fields).forEach((field) => {
        const relatedModel = userClasses[field.type.model];
        if (isModelConstructor(relatedModel)) {
          Object.defineProperty(field.type, "modelConstructor", {
            get: () => {
              const relatedModelDefinition = getModelDefinition(relatedModel);
              if (!relatedModelDefinition)
                throw new Error(`Could not find model definition for ${relatedModel.name}`);
              return {
                builder: relatedModel,
                schema: relatedModelDefinition,
                pkField: extractPrimaryKeyFieldNames(relatedModelDefinition)
              };
            }
          });
        }
      });
      const { indexes } = schema.namespaces[namespace].relationships[model.name];
      const indexFields = /* @__PURE__ */ new Set();
      for (const index of indexes) {
        for (const indexField of index[1]) {
          indexFields.add(indexField);
        }
      }
      model.allFields = {
        ...Object.fromEntries([...indexFields.values()].map((name) => [
          name,
          {
            name,
            type: "ID",
            isArray: false
          }
        ])),
        ...model.fields
      };
    });
    const result = /* @__PURE__ */ new Map();
    let count = 1e3;
    while (count > 0) {
      if (modelAssociations.size === 0) {
        break;
      }
      count--;
      if (count === 0) {
        throw new Error("Models are not topologically sortable. Please verify your schema.");
      }
      for (const modelName of Array.from(modelAssociations.keys())) {
        const parents = modelAssociations.get(modelName);
        if (parents == null ? void 0 : parents.every((x2) => result.has(x2))) {
          result.set(modelName, parents);
        }
      }
      Array.from(result.keys()).forEach((x2) => modelAssociations.delete(x2));
    }
    schema.namespaces[namespace].modelTopologicalOrdering = result;
  });
  return userClasses;
};
var checkSchemaInitialized = () => {
  if (schema === void 0) {
    const message = "Schema is not initialized. DataStore will not function as expected. This could happen if you have multiple versions of DataStore installed. Please see https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js/#check-for-duplicate-versions";
    logger12.error(message);
    throw new Error(message);
  }
};
var checkSchemaCodegenVersion = (codegenVersion) => {
  const majorVersion = 3;
  const minorVersion = 2;
  let isValid2 = false;
  try {
    const versionParts = codegenVersion.split(".");
    const [major, minor] = versionParts;
    isValid2 = Number(major) === majorVersion && Number(minor) >= minorVersion;
  } catch (err) {
    console.log(`Error parsing codegen version: ${codegenVersion}
${err}`);
  }
  if (!isValid2) {
    const message = `Models were generated with an unsupported version of codegen. Codegen artifacts are from ${codegenVersion || "an unknown version"}, whereas ^${majorVersion}.${minorVersion}.0 is required. Update to the latest CLI and run 'amplify codegen models'.`;
    logger12.error(message);
    throw new Error(message);
  }
};
var createTypeClasses = (namespace) => {
  const classes = {};
  Object.entries(namespace.models).forEach(([modelName, modelDefinition]) => {
    const clazz = createModelClass(modelDefinition);
    classes[modelName] = clazz;
    modelNamespaceMap.set(clazz, namespace.name);
  });
  Object.entries(namespace.nonModels || {}).forEach(([typeName, typeDefinition]) => {
    const clazz = createNonModelClass(typeDefinition);
    classes[typeName] = clazz;
  });
  return classes;
};
var instancesMetadata = /* @__PURE__ */ new WeakSet();
function modelInstanceCreator(ModelConstructor, init) {
  instancesMetadata.add(init);
  return new ModelConstructor(init);
}
var validateModelFields = (modelDefinition) => (k2, v2) => {
  const fieldDefinition = modelDefinition.fields[k2];
  if (fieldDefinition !== void 0) {
    const { type, isRequired, isArrayNullable, name, isArray } = fieldDefinition;
    const timestamps = isSchemaModelWithAttributes(modelDefinition) ? getTimestampFields(modelDefinition) : {};
    const isTimestampField = !!timestamps[name];
    if ((!isArray && isRequired || isArray && !isArrayNullable) && !isTimestampField && (v2 === null || v2 === void 0)) {
      throw new Error(`Field ${name} is required`);
    }
    if (isSchemaModelWithAttributes(modelDefinition) && !isIdManaged(modelDefinition)) {
      const keys = extractPrimaryKeyFieldNames(modelDefinition);
      if (keys.includes(k2) && v2 === "") {
        logger12.error(errorMessages.idEmptyString, { k: k2, value: v2 });
        throw new Error(errorMessages.idEmptyString);
      }
    }
    if (isGraphQLScalarType(type)) {
      const jsType = GraphQLScalarType.getJSType(type);
      const validateScalar = GraphQLScalarType.getValidationFunction(type);
      if (type === "AWSJSON") {
        if (typeof v2 === jsType) {
          return;
        }
        if (typeof v2 === "string") {
          try {
            JSON.parse(v2);
            return;
          } catch (error) {
            throw new Error(`Field ${name} is an invalid JSON object. ${v2}`);
          }
        }
      }
      if (isArray) {
        let errorTypeText = jsType;
        if (!isRequired) {
          errorTypeText = `${jsType} | null | undefined`;
        }
        if (!Array.isArray(v2) && !isArrayNullable) {
          throw new Error(`Field ${name} should be of type [${errorTypeText}], ${typeof v2} received. ${v2}`);
        }
        if (!isNullOrUndefined(v2) && v2.some((e) => isNullOrUndefined(e) ? isRequired : typeof e !== jsType)) {
          const elemTypes = v2.map((e) => e === null ? "null" : typeof e).join(",");
          throw new Error(`All elements in the ${name} array should be of type ${errorTypeText}, [${elemTypes}] received. ${v2}`);
        }
        if (validateScalar && !isNullOrUndefined(v2)) {
          const validationStatus = v2.map((e) => {
            if (!isNullOrUndefined(e)) {
              return validateScalar(e);
            } else if (isNullOrUndefined(e) && !isRequired) {
              return true;
            } else {
              return false;
            }
          });
          if (!validationStatus.every((s2) => s2)) {
            throw new Error(`All elements in the ${name} array should be of type ${type}, validation failed for one or more elements. ${v2}`);
          }
        }
      } else if (!isRequired && v2 === void 0) ;
      else if (typeof v2 !== jsType && v2 !== null) {
        throw new Error(`Field ${name} should be of type ${jsType}, ${typeof v2} received. ${v2}`);
      } else if (!isNullOrUndefined(v2) && validateScalar && !validateScalar(v2)) {
        throw new Error(`Field ${name} should be of type ${type}, validation failed. ${v2}`);
      }
    } else if (isNonModelFieldType(type)) {
      if (!isNullOrUndefined(v2)) {
        const subNonModelDefinition = schema.namespaces.user.nonModels[type.nonModel];
        const modelValidator = validateModelFields(subNonModelDefinition);
        if (isArray) {
          let errorTypeText = type.nonModel;
          if (!isRequired) {
            errorTypeText = `${type.nonModel} | null | undefined`;
          }
          if (!Array.isArray(v2)) {
            throw new Error(`Field ${name} should be of type [${errorTypeText}], ${typeof v2} received. ${v2}`);
          }
          v2.forEach((item) => {
            if (isNullOrUndefined(item) && isRequired || typeof item !== "object" && typeof item !== "undefined") {
              throw new Error(`All elements in the ${name} array should be of type ${type.nonModel}, [${typeof item}] received. ${item}`);
            }
            if (!isNullOrUndefined(item)) {
              Object.keys(subNonModelDefinition.fields).forEach((subKey) => {
                modelValidator(subKey, item[subKey]);
              });
            }
          });
        } else {
          if (typeof v2 !== "object") {
            throw new Error(`Field ${name} should be of type ${type.nonModel}, ${typeof v2} recieved. ${v2}`);
          }
          Object.keys(subNonModelDefinition.fields).forEach((subKey) => {
            modelValidator(subKey, v2[subKey]);
          });
        }
      }
    }
  }
};
var castInstanceType = (modelDefinition, k2, v2) => {
  const { isArray, type } = modelDefinition.fields[k2] || {};
  if (typeof v2 === "string" && (isArray || type === "AWSJSON" || isNonModelFieldType(type) || isModelFieldType(type))) {
    try {
      return JSON.parse(v2);
    } catch {
    }
  }
  if (typeof v2 === "number" && type === "Boolean") {
    return Boolean(v2);
  }
  return v2;
};
var initPatches = /* @__PURE__ */ new WeakMap();
var initializeInstance = (init, modelDefinition, draft) => {
  const modelValidator = validateModelFields(modelDefinition);
  Object.entries(init).forEach(([k2, v2]) => {
    const parsedValue = castInstanceType(modelDefinition, k2, v2);
    modelValidator(k2, parsedValue);
    draft[k2] = parsedValue;
  });
};
var normalize = (modelDefinition, draft) => {
  for (const k2 of Object.keys(modelDefinition.fields)) {
    if (draft[k2] === void 0)
      draft[k2] = null;
  }
};
var createModelClass = (modelDefinition) => {
  const clazz = class Model {
    constructor(init) {
      let patches = [];
      const baseInstance = fn(this, (draft) => {
        initializeInstance(init, modelDefinition, draft);
        const isInternallyInitialized = instancesMetadata.has(init);
        const modelInstanceMetadata = isInternallyInitialized ? init : {};
        const { id: _id } = modelInstanceMetadata;
        if (isIdManaged(modelDefinition)) {
          const isInternalModel = _id !== null && _id !== void 0;
          const id = isInternalModel ? _id : modelDefinition.syncable ? amplifyUuid() : ulid2();
          draft.id = id;
        } else if (isIdOptionallyManaged(modelDefinition)) {
          draft.id = draft.id || amplifyUuid();
        }
        if (!isInternallyInitialized) {
          checkReadOnlyPropertyOnCreate(draft, modelDefinition);
        }
        const { _version, _lastChangedAt, _deleted } = modelInstanceMetadata;
        if (modelDefinition.syncable) {
          draft._version = _version;
          draft._lastChangedAt = _lastChangedAt;
          draft._deleted = _deleted;
        }
      }, (p2) => patches = p2);
      const normalized = fn(baseInstance, (draft) => {
        normalize(modelDefinition, draft);
      });
      initPatches.set(normalized, patches);
      return normalized;
    }
    static copyOf(source, fn2) {
      const modelConstructor = Object.getPrototypeOf(source || {}).constructor;
      if (!isValidModelConstructor(modelConstructor)) {
        const msg = "The source object is not a valid model";
        logger12.error(msg, { source });
        throw new Error(msg);
      }
      let patches = [];
      const model = fn(source, (draft) => {
        fn2(draft);
        const keyNames = extractPrimaryKeyFieldNames(modelDefinition);
        keyNames.forEach((key) => {
          if (draft[key] !== source[key]) {
            logger12.warn(`copyOf() does not update PK fields. The '${key}' update is being ignored.`, { source });
          }
          draft[key] = source[key];
        });
        const modelValidator = validateModelFields(modelDefinition);
        Object.entries(draft).forEach(([k2, v2]) => {
          const parsedValue = castInstanceType(modelDefinition, k2, v2);
          modelValidator(k2, parsedValue);
        });
        normalize(modelDefinition, draft);
      }, (p2) => patches = p2);
      const hasExistingPatches = modelPatchesMap.has(source);
      if (patches.length || hasExistingPatches) {
        if (hasExistingPatches) {
          const [existingPatches, existingSource] = modelPatchesMap.get(source);
          const mergedPatches = mergePatches(existingSource, existingPatches, patches);
          modelPatchesMap.set(model, [mergedPatches, existingSource]);
          checkReadOnlyPropertyOnUpdate(mergedPatches, modelDefinition);
        } else {
          modelPatchesMap.set(model, [patches, source]);
          checkReadOnlyPropertyOnUpdate(patches, modelDefinition);
        }
      } else {
        modelPatchesMap.set(model, [[], source]);
      }
      return attached(model, ModelAttachment.DataStore);
    }
    // "private" method (that's hidden via `Setting`) for `withSSRContext` to use
    // to gain access to `modelInstanceCreator` and `clazz` for persisting IDs from server to client.
    static fromJSON(json) {
      if (Array.isArray(json)) {
        return json.map((init) => this.fromJSON(init));
      }
      const instance2 = modelInstanceCreator(clazz, json);
      const modelValidator = validateModelFields(modelDefinition);
      Object.entries(instance2).forEach(([k2, v2]) => {
        modelValidator(k2, v2);
      });
      return attached(instance2, ModelAttachment.DataStore);
    }
  };
  clazz[L] = true;
  Object.defineProperty(clazz, "name", { value: modelDefinition.name });
  const allModelRelationships = ModelRelationship.allFrom({
    builder: clazz,
    schema: modelDefinition,
    pkField: extractPrimaryKeyFieldNames(modelDefinition)
  });
  for (const relationship of allModelRelationships) {
    const { field } = relationship;
    Object.defineProperty(clazz.prototype, modelDefinition.fields[field].name, {
      set(model) {
        if (!(typeof model === "object" || typeof model === "undefined"))
          return;
        if (model) {
          if (Object.prototype.hasOwnProperty.call(model, "_version")) {
            const modelConstructor = Object.getPrototypeOf(model || {}).constructor;
            if (!isValidModelConstructor(modelConstructor)) {
              const msg = `Value passed to ${modelDefinition.name}.${field} is not a valid instance of a model`;
              logger12.error(msg, { model });
              throw new Error(msg);
            }
            if (modelConstructor.name.toLowerCase() !== relationship.remoteModelConstructor.name.toLowerCase()) {
              const msg = `Value passed to ${modelDefinition.name}.${field} is not an instance of ${relationship.remoteModelConstructor.name}`;
              logger12.error(msg, { model });
              throw new Error(msg);
            }
          }
        }
        if (relationship.isComplete) {
          for (let i2 = 0; i2 < relationship.localJoinFields.length; i2++) {
            this[relationship.localJoinFields[i2]] = model == null ? void 0 : model[relationship.remoteJoinFields[i2]];
          }
          const instanceMemos = modelInstanceAssociationsMap.has(this) ? modelInstanceAssociationsMap.get(this) : modelInstanceAssociationsMap.set(this, {}).get(this);
          instanceMemos[field] = model || void 0;
        }
      },
      get() {
        const instanceMemos = modelInstanceAssociationsMap.has(this) ? modelInstanceAssociationsMap.get(this) : modelInstanceAssociationsMap.set(this, {}).get(this);
        if (!Object.prototype.hasOwnProperty.call(instanceMemos, field)) {
          if (getAttachment(this) === ModelAttachment.DataStore) {
            const resultPromise = instance.query(relationship.remoteModelConstructor, (base) => base.and((q2) => {
              return relationship.remoteJoinFields.map((joinField, index) => {
                return q2[joinField].eq(this[relationship.localJoinFields[index]]);
              });
            }));
            if (relationship.type === "HAS_MANY") {
              instanceMemos[field] = new AsyncCollection(resultPromise);
            } else {
              instanceMemos[field] = resultPromise.then((rows) => {
                if (rows.length > 1) {
                  const err = new Error(`
									Data integrity error.
									Too many records found for a HAS_ONE/BELONGS_TO field '${modelDefinition.name}.${field}'
								`);
                  console.error(err);
                  throw err;
                } else {
                  return rows[0];
                }
              });
            }
          } else if (getAttachment(this) === ModelAttachment.API) {
            throw new Error("Lazy loading from API is not yet supported!");
          } else {
            if (relationship.type === "HAS_MANY") {
              return new AsyncCollection([]);
            } else {
              return Promise.resolve(void 0);
            }
          }
        }
        return instanceMemos[field];
      }
    });
  }
  return clazz;
};
var AsyncItem = class extends Promise {
};
var AsyncCollection = class {
  constructor(values) {
    this.values = values;
  }
  /**
   * Facilitates async iteration.
   *
   * ```ts
   * for await (const item of collection) {
   *   handle(item)
   * }
   * ```
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
   */
  [Symbol.asyncIterator]() {
    let values;
    let index = 0;
    return {
      next: async () => {
        if (!values)
          values = await this.values;
        if (index < values.length) {
          const result = {
            value: values[index],
            done: false
          };
          index++;
          return result;
        }
        return {
          value: null,
          done: true
        };
      }
    };
  }
  /**
   * Turns the collection into an array, up to the amount specified in `max` param.
   *
   * ```ts
   * const all = await collection.toArray();
   * const first100 = await collection.toArray({max: 100});
   * ```
   */
  async toArray({ max = Number.MAX_SAFE_INTEGER } = {}) {
    const output = [];
    let i2 = 0;
    for await (const element of this) {
      if (i2 < max) {
        output.push(element);
        i2++;
      } else {
        break;
      }
    }
    return output;
  }
};
var checkReadOnlyPropertyOnCreate = (draft, modelDefinition) => {
  const modelKeys = Object.keys(draft);
  const { fields: fields7 } = modelDefinition;
  modelKeys.forEach((key) => {
    if (fields7[key] && fields7[key].isReadOnly) {
      throw new Error(`${key} is read-only.`);
    }
  });
};
var checkReadOnlyPropertyOnUpdate = (patches, modelDefinition) => {
  const patchArray = patches.map((p2) => [p2.path[0], p2.value]);
  const { fields: fields7 } = modelDefinition;
  patchArray.forEach(([key, val]) => {
    if (!val || !fields7[key])
      return;
    if (fields7[key].isReadOnly) {
      throw new Error(`${key} is read-only.`);
    }
  });
};
var createNonModelClass = (typeDefinition) => {
  const clazz = class Model {
    constructor(init) {
      const instance2 = fn(this, (draft) => {
        initializeInstance(init, typeDefinition, draft);
      });
      return instance2;
    }
  };
  clazz[L] = true;
  Object.defineProperty(clazz, "name", { value: typeDefinition.name });
  registerNonModelClass(clazz);
  return clazz;
};
function isQueryOne(obj) {
  return typeof obj === "string";
}
function defaultConflictHandler(conflictData) {
  const { localModel, modelConstructor, remoteModel } = conflictData;
  const { _version } = remoteModel;
  return modelInstanceCreator(modelConstructor, { ...localModel, _version });
}
function defaultErrorHandler(error) {
  logger12.warn(error);
}
function getModelConstructorByModelName(namespaceName, modelName) {
  let result;
  switch (namespaceName) {
    case DATASTORE:
      result = dataStoreClasses[modelName];
      break;
    case USER:
      result = userClasses[modelName];
      break;
    case SYNC:
      result = syncClasses[modelName];
      break;
    case STORAGE:
      result = storageClasses[modelName];
      break;
    default:
      throw new Error(`Invalid namespace: ${namespaceName}`);
  }
  if (isValidModelConstructor(result)) {
    return result;
  } else {
    const msg = `Model name is not valid for namespace. modelName: ${modelName}, namespace: ${namespaceName}`;
    logger12.error(msg);
    throw new Error(msg);
  }
}
async function checkSchemaVersion(storage, version2) {
  const SettingCtor = dataStoreClasses.Setting;
  const modelDefinition = schema.namespaces[DATASTORE].models.Setting;
  await storage.runExclusive(async (s2) => {
    const [schemaVersionSetting] = await s2.query(SettingCtor, ModelPredicateCreator.createFromAST(modelDefinition, {
      and: { key: { eq: SETTING_SCHEMA_VERSION } }
    }), { page: 0, limit: 1 });
    if (schemaVersionSetting !== void 0 && schemaVersionSetting.value !== void 0) {
      const storedValue = JSON.parse(schemaVersionSetting.value);
      if (storedValue !== version2) {
        await s2.clear(false);
      }
    } else {
      await s2.save(modelInstanceCreator(SettingCtor, {
        key: SETTING_SCHEMA_VERSION,
        value: JSON.stringify(version2)
      }));
    }
  });
}
var syncSubscription;
function getNamespace() {
  const namespace = {
    name: DATASTORE,
    relationships: {},
    enums: {},
    nonModels: {},
    models: {
      Setting: {
        name: "Setting",
        pluralName: "Settings",
        syncable: false,
        fields: {
          id: {
            name: "id",
            type: "ID",
            isRequired: true,
            isArray: false
          },
          key: {
            name: "key",
            type: "String",
            isRequired: true,
            isArray: false
          },
          value: {
            name: "value",
            type: "String",
            isRequired: true,
            isArray: false
          }
        }
      }
    }
  };
  return namespace;
}
var DataStoreState;
(function(DataStoreState2) {
  DataStoreState2["NotRunning"] = "Not Running";
  DataStoreState2["Starting"] = "Starting";
  DataStoreState2["Running"] = "Running";
  DataStoreState2["Stopping"] = "Stopping";
  DataStoreState2["Clearing"] = "Clearing";
})(DataStoreState || (DataStoreState = {}));
var DataStore = class {
  constructor() {
    this.InternalAPI = InternalAPI;
    this.Cache = Cache;
    this.amplifyConfig = {};
    this.syncPredicates = /* @__PURE__ */ new WeakMap();
    this.amplifyContext = {
      InternalAPI: this.InternalAPI
    };
    this.runningProcesses = new BackgroundProcessManager();
    this.state = DataStoreState.NotRunning;
    this.start = async () => {
      return this.runningProcesses.add(async () => {
        this.state = DataStoreState.Starting;
        if (this.initialized === void 0) {
          logger12.debug("Starting DataStore");
          this.initialized = new Promise((resolve4, reject) => {
            this.initResolve = resolve4;
            this.initReject = reject;
          });
        } else {
          await this.initialized;
          return;
        }
        this.storage = new ExclusiveStorage(schema, namespaceResolver, getModelConstructorByModelName, modelInstanceCreator, this.storageAdapter, this.sessionId);
        await this.storage.init();
        checkSchemaInitialized();
        await checkSchemaVersion(this.storage, schema.version);
        const { aws_appsync_graphqlEndpoint } = this.amplifyConfig;
        if (aws_appsync_graphqlEndpoint) {
          logger12.debug("GraphQL endpoint available", aws_appsync_graphqlEndpoint);
          this.syncPredicates = await this.processSyncExpressions();
          this.sync = new SyncEngine(schema, namespaceResolver, syncClasses, userClasses, this.storage, modelInstanceCreator, this.conflictHandler, this.errorHandler, this.syncPredicates, this.amplifyConfig, this.authModeStrategy, this.amplifyContext, this.connectivityMonitor);
          const fullSyncIntervalInMilliseconds = this.fullSyncInterval * 1e3 * 60;
          syncSubscription = this.sync.start({ fullSyncInterval: fullSyncIntervalInMilliseconds }).subscribe({
            next: ({ type, data }) => {
              const readyType = isNode2() ? ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY : ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED;
              if (type === readyType) {
                this.initResolve();
              }
              Hub.dispatch("datastore", {
                event: type,
                data
              });
            },
            error: (err) => {
              logger12.warn("Sync error", err);
              this.initReject();
            }
          });
        } else {
          logger12.warn("Data won't be synchronized. No GraphQL endpoint configured. Did you forget `Amplify.configure(awsconfig)`?", {
            config: this.amplifyConfig
          });
          this.initResolve();
        }
        await this.initialized;
        this.state = DataStoreState.Running;
      }, "datastore start").catch(this.handleAddProcError("DataStore.start()"));
    };
    this.query = async (modelConstructor, identifierOrCriteria, paginationProducer) => {
      return this.runningProcesses.add(async () => {
        var _a;
        await this.start();
        let result;
        if (!this.storage) {
          throw new Error("No storage to query");
        }
        if (!isValidModelConstructor(modelConstructor)) {
          const msg = "Constructor is not for a valid model";
          logger12.error(msg, { modelConstructor });
          throw new Error(msg);
        }
        if (typeof identifierOrCriteria === "string") {
          if (paginationProducer !== void 0) {
            logger12.warn("Pagination is ignored when querying by id");
          }
        }
        const modelDefinition = getModelDefinition(modelConstructor);
        if (!modelDefinition) {
          throw new Error("Invalid model definition provided!");
        }
        const pagination = this.processPagination(modelDefinition, paginationProducer);
        const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
        if (isQueryOne(identifierOrCriteria)) {
          if (keyFields.length > 1) {
            const msg = errorMessages.queryByPkWithCompositeKeyPresent;
            logger12.error(msg, { keyFields });
            throw new Error(msg);
          }
          const predicate = ModelPredicateCreator.createFromFlatEqualities(modelDefinition, { [keyFields[0]]: identifierOrCriteria });
          result = await this.storage.query(modelConstructor, predicate, pagination);
        } else {
          if (isIdentifierObject(identifierOrCriteria, modelDefinition)) {
            const predicate = ModelPredicateCreator.createForPk(modelDefinition, identifierOrCriteria);
            result = await this.storage.query(modelConstructor, predicate, pagination);
          } else if (!identifierOrCriteria || isPredicatesAll(identifierOrCriteria)) {
            result = await ((_a = this.storage) == null ? void 0 : _a.query(modelConstructor, void 0, pagination));
          } else {
            const seedPredicate = recursivePredicateFor({
              builder: modelConstructor,
              schema: modelDefinition,
              pkField: extractPrimaryKeyFieldNames(modelDefinition)
            });
            const predicate = internals(identifierOrCriteria(seedPredicate));
            result = await predicate.fetch(this.storage);
            result = inMemoryPagination(result, pagination);
          }
        }
        const returnOne = isQueryOne(identifierOrCriteria) || isIdentifierObject(identifierOrCriteria, modelDefinition);
        return attached(returnOne ? result[0] : result, ModelAttachment.DataStore);
      }, "datastore query").catch(this.handleAddProcError("DataStore.query()"));
    };
    this.save = async (model, condition) => {
      return this.runningProcesses.add(async () => {
        await this.start();
        if (!this.storage) {
          throw new Error("No storage to save to");
        }
        const updatedPatchesTuple = modelPatchesMap.get(model);
        const initPatchesTuple = initPatches.has(model) ? [initPatches.get(model), {}] : void 0;
        const patchesTuple = updatedPatchesTuple || initPatchesTuple;
        const modelConstructor = model ? model.constructor : void 0;
        if (!isValidModelConstructor(modelConstructor)) {
          const msg = "Object is not an instance of a valid model";
          logger12.error(msg, { model });
          throw new Error(msg);
        }
        const modelDefinition = getModelDefinition(modelConstructor);
        if (!modelDefinition) {
          throw new Error("Model Definition could not be found for model");
        }
        const modelMeta = {
          builder: modelConstructor,
          schema: modelDefinition,
          pkField: extractPrimaryKeyFieldNames(modelDefinition)
        };
        await this.storage.runExclusive(async (s2) => {
          var _a;
          const nonHasManyRelationships = ModelRelationship.allFrom(modelMeta).filter((r2) => r2.type === "BELONGS_TO");
          for (const relationship of nonHasManyRelationships) {
            const queryObject = relationship.createRemoteQueryObject(model);
            if (queryObject !== null) {
              const related = await s2.query(relationship.remoteModelConstructor, ModelPredicateCreator.createFromFlatEqualities(relationship.remoteDefinition, queryObject));
              if (related.length === 0) {
                throw new Error([
                  `Data integrity error. You tried to save a ${modelDefinition.name} (${JSON.stringify(model)})`,
                  `but the instance assigned to the "${relationship.field}" property`,
                  `does not exist in the local database. If you're trying to create the related`,
                  `"${(_a = relationship.remoteDefinition) == null ? void 0 : _a.name}", you must save it independently first.`
                ].join(" "));
              }
            }
          }
        });
        const producedCondition = condition ? internals(condition(predicateFor(modelMeta))).toStoragePredicate() : void 0;
        const [savedModel] = await this.storage.runExclusive(async (s2) => {
          await s2.save(model, producedCondition, void 0, patchesTuple);
          return s2.query(modelConstructor, ModelPredicateCreator.createForPk(modelDefinition, model));
        });
        return attached(savedModel, ModelAttachment.DataStore);
      }, "datastore save").catch(this.handleAddProcError("DataStore.save()"));
    };
    this.setConflictHandler = (config) => {
      const { DataStore: configDataStore } = config;
      const conflictHandlerIsDefault = () => this.conflictHandler === defaultConflictHandler;
      if (configDataStore && configDataStore.conflictHandler) {
        return configDataStore.conflictHandler;
      }
      if (conflictHandlerIsDefault() && config.conflictHandler) {
        return config.conflictHandler;
      }
      return this.conflictHandler || defaultConflictHandler;
    };
    this.setErrorHandler = (config) => {
      const { DataStore: configDataStore } = config;
      const errorHandlerIsDefault = () => this.errorHandler === defaultErrorHandler;
      if (configDataStore && configDataStore.errorHandler) {
        return configDataStore.errorHandler;
      }
      if (errorHandlerIsDefault() && config.errorHandler) {
        return config.errorHandler;
      }
      return this.errorHandler || defaultErrorHandler;
    };
    this.delete = async (modelOrConstructor, identifierOrCriteria) => {
      return this.runningProcesses.add(async () => {
        await this.start();
        if (!this.storage) {
          throw new Error("No storage to delete from");
        }
        let condition;
        if (!modelOrConstructor) {
          const msg = "Model or Model Constructor required";
          logger12.error(msg, { modelOrConstructor });
          throw new Error(msg);
        }
        if (isValidModelConstructor(modelOrConstructor)) {
          const modelConstructor = modelOrConstructor;
          if (!identifierOrCriteria) {
            const msg = "Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL";
            logger12.error(msg, { identifierOrCriteria });
            throw new Error(msg);
          }
          const modelDefinition = getModelDefinition(modelConstructor);
          if (!modelDefinition) {
            throw new Error("Could not find model definition for modelConstructor.");
          }
          if (typeof identifierOrCriteria === "string") {
            const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
            if (keyFields.length > 1) {
              const msg = errorMessages.deleteByPkWithCompositeKeyPresent;
              logger12.error(msg, { keyFields });
              throw new Error(msg);
            }
            condition = ModelPredicateCreator.createFromFlatEqualities(modelDefinition, { [keyFields[0]]: identifierOrCriteria });
          } else {
            if (isIdentifierObject(identifierOrCriteria, modelDefinition)) {
              condition = ModelPredicateCreator.createForPk(modelDefinition, identifierOrCriteria);
            } else {
              condition = internals(identifierOrCriteria(predicateFor({
                builder: modelConstructor,
                schema: modelDefinition,
                pkField: extractPrimaryKeyFieldNames(modelDefinition)
              }))).toStoragePredicate();
            }
            if (!condition || !ModelPredicateCreator.isValidPredicate(condition)) {
              const msg = "Criteria required. Do you want to delete all? Pass Predicates.ALL";
              logger12.error(msg, { condition });
              throw new Error(msg);
            }
          }
          const [deleted] = await this.storage.delete(modelConstructor, condition);
          return attached(deleted, ModelAttachment.DataStore);
        } else {
          const model = modelOrConstructor;
          const modelConstructor = Object.getPrototypeOf(model || {}).constructor;
          if (!isValidModelConstructor(modelConstructor)) {
            const msg = "Object is not an instance of a valid model";
            logger12.error(msg, { model });
            throw new Error(msg);
          }
          const modelDefinition = getModelDefinition(modelConstructor);
          if (!modelDefinition) {
            throw new Error("Could not find model definition for modelConstructor.");
          }
          const pkPredicate = ModelPredicateCreator.createForPk(modelDefinition, model);
          if (identifierOrCriteria) {
            if (typeof identifierOrCriteria !== "function") {
              const msg = "Invalid criteria";
              logger12.error(msg, { identifierOrCriteria });
              throw new Error(msg);
            }
            condition = internals(identifierOrCriteria(predicateFor({
              builder: modelConstructor,
              schema: modelDefinition,
              pkField: extractPrimaryKeyFieldNames(modelDefinition)
            }))).toStoragePredicate();
          } else {
            condition = pkPredicate;
          }
          const [[deleted]] = await this.storage.delete(model, condition);
          return attached(deleted, ModelAttachment.DataStore);
        }
      }, "datastore delete").catch(this.handleAddProcError("DataStore.delete()"));
    };
    this.observe = (modelOrConstructor, identifierOrCriteria) => {
      let executivePredicate;
      const modelConstructor = modelOrConstructor && isValidModelConstructor(modelOrConstructor) ? modelOrConstructor : void 0;
      if (modelOrConstructor && modelConstructor === void 0) {
        const model = modelOrConstructor;
        const resolvedModelConstructor = model && Object.getPrototypeOf(model).constructor;
        if (isValidModelConstructor(resolvedModelConstructor)) {
          if (identifierOrCriteria) {
            logger12.warn("idOrCriteria is ignored when using a model instance", {
              model,
              identifierOrCriteria
            });
          }
          return this.observe(resolvedModelConstructor, model.id);
        } else {
          const msg = "The model is not an instance of a PersistentModelConstructor";
          logger12.error(msg, { model });
          throw new Error(msg);
        }
      }
      if (identifierOrCriteria && modelConstructor && isIdentifierObject(identifierOrCriteria, getModelDefinition(modelConstructor))) {
        const msg = errorMessages.observeWithObjectLiteral;
        logger12.error(msg, { objectLiteral: identifierOrCriteria });
        throw new Error(msg);
      }
      if (identifierOrCriteria !== void 0 && modelConstructor === void 0) {
        const msg = "Cannot provide criteria without a modelConstructor";
        logger12.error(msg, identifierOrCriteria);
        throw new Error(msg);
      }
      if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
        const msg = "Constructor is not for a valid model";
        logger12.error(msg, { modelConstructor });
        throw new Error(msg);
      }
      if (modelConstructor && typeof identifierOrCriteria === "string") {
        const buildIdPredicate = (seed) => seed.id.eq(identifierOrCriteria);
        executivePredicate = internals(buildIdPredicate(buildSeedPredicate(modelConstructor)));
      } else if (modelConstructor && typeof identifierOrCriteria === "function") {
        executivePredicate = internals(identifierOrCriteria(buildSeedPredicate(modelConstructor)));
      }
      return new Observable((observer) => {
        let source;
        this.runningProcesses.add(async () => {
          await this.start();
          source = this.storage.observe(modelConstructor).pipe(filter(({ model }) => namespaceResolver(model) === USER)).subscribe({
            next: (item) => this.runningProcesses.isOpen && this.runningProcesses.add(async () => {
              let message = item;
              if (item.opType !== "DELETE") {
                const modelDefinition = getModelDefinition(item.model);
                const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
                const primaryKeysAndValues = extractPrimaryKeysAndValues(item.element, keyFields);
                const freshElement = await this.query(item.model, primaryKeysAndValues);
                message = {
                  ...message,
                  element: freshElement
                };
              }
              if (!executivePredicate || await executivePredicate.matches(message.element)) {
                observer.next(message);
              }
            }, "datastore observe message handler"),
            error: (err) => {
              observer.error(err);
            },
            complete: () => {
              observer.complete();
            }
          });
        }, "datastore observe observable initialization").catch(this.handleAddProcError("DataStore.observe()")).catch((error) => {
          observer.error(error);
        });
        return this.runningProcesses.addCleaner(async () => {
          if (source) {
            source.unsubscribe();
          }
        }, "DataStore.observe() cleanup");
      });
    };
    this.observeQuery = (model, criteria, options) => {
      return new Observable((observer) => {
        const items = /* @__PURE__ */ new Map();
        const itemsChanged = /* @__PURE__ */ new Map();
        let deletedItemIds = [];
        let handle;
        let executivePredicate;
        const generateAndEmitSnapshot = () => {
          const snapshot = generateSnapshot();
          emitSnapshot(snapshot);
        };
        const limitTimerRace = new DeferredCallbackResolver({
          callback: generateAndEmitSnapshot,
          errorHandler: observer.error,
          maxInterval: 2e3
        });
        const { sort } = options || {};
        const sortOptions = sort ? { sort } : void 0;
        const modelDefinition = getModelDefinition(model);
        if (!modelDefinition) {
          throw new Error("Could not find model definition.");
        }
        if (model && typeof criteria === "function") {
          executivePredicate = internals(criteria(buildSeedPredicate(model)));
        } else if (isPredicatesAll(criteria)) {
          executivePredicate = void 0;
        }
        this.runningProcesses.add(async () => {
          try {
            (await this.query(model, criteria, sortOptions)).forEach((item) => {
              const itemModelDefinition = getModelDefinition(model);
              const idOrPk = getIdentifierValue(itemModelDefinition, item);
              items.set(idOrPk, item);
            });
            handle = this.observe(model).subscribe(({ element, model: observedModel, opType }) => this.runningProcesses.isOpen && this.runningProcesses.add(async () => {
              var _a;
              const itemModelDefinition = getModelDefinition(observedModel);
              const idOrPk = getIdentifierValue(itemModelDefinition, element);
              if (executivePredicate && !await executivePredicate.matches(element)) {
                if (opType === "UPDATE" && (items.has(idOrPk) || itemsChanged.has(idOrPk))) {
                  deletedItemIds.push(idOrPk);
                } else {
                  return;
                }
              }
              if (opType === "DELETE") {
                deletedItemIds.push(idOrPk);
              } else {
                itemsChanged.set(idOrPk, element);
              }
              const isSynced = ((_a = this.sync) == null ? void 0 : _a.getModelSyncedStatus(observedModel)) ?? false;
              const limit = itemsChanged.size - deletedItemIds.length >= this.syncPageSize;
              if (limit || isSynced) {
                limitTimerRace.resolve();
              }
              limitTimerRace.start();
            }, "handle observeQuery observed event"));
            generateAndEmitSnapshot();
          } catch (err) {
            observer.error(err);
          }
        }, "datastore observequery startup").catch(this.handleAddProcError("DataStore.observeQuery()")).catch((error) => {
          observer.error(error);
        });
        const generateSnapshot = () => {
          var _a;
          const isSynced = ((_a = this.sync) == null ? void 0 : _a.getModelSyncedStatus(model)) ?? false;
          const itemsArray = [
            ...Array.from(items.values()),
            ...Array.from(itemsChanged.values())
          ];
          items.clear();
          itemsArray.forEach((item) => {
            const itemModelDefinition = getModelDefinition(model);
            const idOrPk = getIdentifierValue(itemModelDefinition, item);
            items.set(idOrPk, item);
          });
          deletedItemIds.forEach((idOrPk) => items.delete(idOrPk));
          const snapshot = Array.from(items.values());
          if (options == null ? void 0 : options.sort) {
            sortItems(snapshot);
          }
          return {
            items: snapshot,
            isSynced
          };
        };
        const emitSnapshot = (snapshot) => {
          observer.next(snapshot);
          itemsChanged.clear();
          deletedItemIds = [];
        };
        const sortItems = (itemsToSort) => {
          const sortingModelDefinition = getModelDefinition(model);
          const pagination = this.processPagination(sortingModelDefinition, options);
          const sortPredicates = ModelSortPredicateCreator.getPredicates(pagination.sort);
          if (sortPredicates.length) {
            const compareFn = sortCompareFunction(sortPredicates);
            itemsToSort.sort(compareFn);
          }
        };
        const hubCallback = ({ payload }) => {
          var _a;
          const { event, data } = payload;
          if (event === ControlMessage.SYNC_ENGINE_MODEL_SYNCED && ((_a = data == null ? void 0 : data.model) == null ? void 0 : _a.name) === model.name) {
            generateAndEmitSnapshot();
            hubRemove();
          }
        };
        const hubRemove = Hub.listen("datastore", hubCallback);
        return this.runningProcesses.addCleaner(async () => {
          if (handle) {
            handle.unsubscribe();
          }
        }, "datastore observequery cleaner");
      });
    };
    this.configure = (config = {}) => {
      var _a;
      this.amplifyContext.InternalAPI = this.InternalAPI;
      const { DataStore: configDataStore, authModeStrategyType: configAuthModeStrategyType, maxRecordsToSync: configMaxRecordsToSync, syncPageSize: configSyncPageSize, fullSyncInterval: configFullSyncInterval, syncExpressions: configSyncExpressions, authProviders: configAuthProviders, storageAdapter: configStorageAdapter, ...configFromAmplify } = config;
      const currentAppSyncConfig = (_a = Amplify.getConfig().API) == null ? void 0 : _a.GraphQL;
      const appSyncConfig = {
        aws_appsync_graphqlEndpoint: currentAppSyncConfig == null ? void 0 : currentAppSyncConfig.endpoint,
        aws_appsync_authenticationType: currentAppSyncConfig == null ? void 0 : currentAppSyncConfig.defaultAuthMode,
        aws_appsync_region: currentAppSyncConfig == null ? void 0 : currentAppSyncConfig.region,
        aws_appsync_apiKey: currentAppSyncConfig == null ? void 0 : currentAppSyncConfig.apiKey
      };
      this.amplifyConfig = {
        ...this.amplifyConfig,
        ...configFromAmplify,
        ...currentAppSyncConfig && appSyncConfig
      };
      this.conflictHandler = this.setConflictHandler(config);
      this.errorHandler = this.setErrorHandler(config);
      const authModeStrategyType = configDataStore && configDataStore.authModeStrategyType || configAuthModeStrategyType || AuthModeStrategyType.DEFAULT;
      switch (authModeStrategyType) {
        case AuthModeStrategyType.MULTI_AUTH:
          this.authModeStrategy = multiAuthStrategy(this.amplifyContext);
          break;
        case AuthModeStrategyType.DEFAULT:
          this.authModeStrategy = defaultAuthStrategy;
          break;
        default:
          this.authModeStrategy = defaultAuthStrategy;
          break;
      }
      this.amplifyConfig.authProviders = configDataStore && configDataStore.authProviders || configAuthProviders;
      this.syncExpressions = configDataStore && configDataStore.syncExpressions || configSyncExpressions || this.syncExpressions;
      this.maxRecordsToSync = configDataStore && configDataStore.maxRecordsToSync || configMaxRecordsToSync || this.maxRecordsToSync || 1e4;
      this.amplifyConfig.maxRecordsToSync = this.maxRecordsToSync;
      this.syncPageSize = configDataStore && configDataStore.syncPageSize || configSyncPageSize || this.syncPageSize || 1e3;
      this.amplifyConfig.syncPageSize = this.syncPageSize;
      this.fullSyncInterval = configDataStore && configDataStore.fullSyncInterval || configFullSyncInterval || this.fullSyncInterval || 24 * 60;
      this.storageAdapter = configDataStore && configDataStore.storageAdapter || configStorageAdapter || this.storageAdapter || void 0;
      this.sessionId = this.retrieveSessionId();
    };
  }
  getModuleName() {
    return "DataStore";
  }
  /**
   * Builds a function to capture `BackgroundManagerNotOpenError`'s to produce friendlier,
   * more instructive errors for customers.
   *
   * @param operation The name of the operation (usually a Datastore method) the customer
   * tried to call.
   */
  handleAddProcError(operation) {
    const handler = (err) => {
      if (err.message.startsWith("BackgroundManagerNotOpenError")) {
        throw new Error([
          `DataStoreStateError: Tried to execute \`${operation}\` while DataStore was "${this.state}".`,
          `This can only be done while DataStore is "Started" or "Stopped". To remedy:`,
          "Ensure all calls to `stop()` and `clear()` have completed first.",
          "If this is not possible, retry the operation until it succeeds."
        ].join("\n"));
      } else {
        throw err;
      }
    };
    return handler;
  }
  /**
   * Clears all data from storage and removes all data, schema info, other
   * initialization details, and then stops DataStore.
   *
   * That said, reinitialization is required after clearing. This can be done
   * by explicitiliy calling `start()` or any method that implicitly starts
   * DataStore, such as `query()`, `save()`, or `delete()`.
   */
  async clear() {
    checkSchemaInitialized();
    this.state = DataStoreState.Clearing;
    await this.runningProcesses.close();
    if (this.storage === void 0) {
      this.storage = new ExclusiveStorage(schema, namespaceResolver, getModelConstructorByModelName, modelInstanceCreator, this.storageAdapter, this.sessionId);
      await this.storage.init();
    }
    if (syncSubscription && !syncSubscription.closed) {
      syncSubscription.unsubscribe();
    }
    if (this.sync) {
      await this.sync.stop();
    }
    await this.storage.clear();
    this.initialized = void 0;
    this.storage = void 0;
    this.sync = void 0;
    this.syncPredicates = /* @__PURE__ */ new WeakMap();
    await this.runningProcesses.open();
    this.state = DataStoreState.NotRunning;
  }
  /**
   * Stops all DataStore sync activities.
   *
   * TODO: "Waits for graceful termination of
   * running queries and terminates subscriptions."
   */
  async stop() {
    this.state = DataStoreState.Stopping;
    await this.runningProcesses.close();
    if (syncSubscription && !syncSubscription.closed) {
      syncSubscription.unsubscribe();
    }
    if (this.sync) {
      await this.sync.stop();
    }
    this.initialized = void 0;
    this.sync = void 0;
    await this.runningProcesses.open();
    this.state = DataStoreState.NotRunning;
  }
  /**
   * Validates given pagination input from a query and creates a pagination
   * argument for use against the storage layer.
   *
   * @param modelDefinition
   * @param paginationProducer
   */
  processPagination(modelDefinition, paginationProducer) {
    let sortPredicate;
    const { limit, page, sort } = paginationProducer || {};
    if (limit === void 0 && page === void 0 && sort === void 0) {
      return void 0;
    }
    if (page !== void 0 && limit === void 0) {
      throw new Error("Limit is required when requesting a page");
    }
    if (page !== void 0) {
      if (typeof page !== "number") {
        throw new Error("Page should be a number");
      }
      if (page < 0) {
        throw new Error("Page can't be negative");
      }
    }
    if (limit !== void 0) {
      if (typeof limit !== "number") {
        throw new Error("Limit should be a number");
      }
      if (limit < 0) {
        throw new Error("Limit can't be negative");
      }
    }
    if (sort) {
      sortPredicate = ModelSortPredicateCreator.createFromExisting(modelDefinition, sort);
    }
    return {
      limit,
      page,
      sort: sortPredicate
    };
  }
  /**
   * Examines the configured `syncExpressions` and produces a WeakMap of
   * SchemaModel -> predicate to use during sync.
   */
  async processSyncExpressions() {
    if (!this.syncExpressions || !this.syncExpressions.length) {
      return /* @__PURE__ */ new WeakMap();
    }
    const syncPredicates = await Promise.all(this.syncExpressions.map(async (syncExpression2) => {
      const { modelConstructor, conditionProducer } = await syncExpression2;
      const modelDefinition = getModelDefinition(modelConstructor);
      const condition = await this.unwrapPromise(conditionProducer);
      if (isPredicatesAll(condition)) {
        return [modelDefinition, null];
      }
      const predicate = internals(condition(predicateFor({
        builder: modelConstructor,
        schema: modelDefinition,
        pkField: extractPrimaryKeyFieldNames(modelDefinition)
      }))).toStoragePredicate();
      return [modelDefinition, predicate];
    }));
    return this.weakMapFromEntries(syncPredicates);
  }
  async unwrapPromise(conditionProducer) {
    try {
      const condition = await conditionProducer();
      return condition || conditionProducer;
    } catch (error) {
      if (error instanceof TypeError) {
        return conditionProducer;
      }
      throw error;
    }
  }
  weakMapFromEntries(entries) {
    return entries.reduce((map2, [modelDefinition, predicate]) => {
      if (map2.has(modelDefinition)) {
        const { name } = modelDefinition;
        logger12.warn(`You can only utilize one Sync Expression per model.
          Subsequent sync expressions for the ${name} model will be ignored.`);
        return map2;
      }
      if (predicate) {
        map2.set(modelDefinition, predicate);
      }
      return map2;
    }, /* @__PURE__ */ new WeakMap());
  }
  /**
   * A session ID to allow CMS to open databases against multiple apps.
   * This session ID is only expected be set by AWS Amplify Studio.
   */
  retrieveSessionId() {
    try {
      const sessionId = sessionStorage.getItem("datastoreSessionId");
      if (sessionId) {
        const { aws_appsync_graphqlEndpoint } = this.amplifyConfig;
        const appSyncUrl = aws_appsync_graphqlEndpoint.split("/")[2];
        const [appSyncId] = appSyncUrl.split(".");
        return `${sessionId}-${appSyncId}`;
      }
    } catch {
    }
    return void 0;
  }
};
var instance = new DataStore();
instance.configure({});
Hub.listen("core", (capsule) => {
  if (capsule.payload.event === "configure") {
    instance.configure({});
  }
});

// node_modules/@aws-amplify/datastore/dist/esm/index.mjs
var utils = {
  USER,
  traverseModel,
  validatePredicate,
  isNonModelConstructor,
  isModelConstructor
};
export {
  AsyncCollection,
  AsyncItem,
  AuthModeStrategyType,
  DISCARD,
  instance as DataStore,
  DataStore as DataStoreClass,
  GraphQLScalarType,
  LimitTimerRaceResolvedValues,
  ModelAttributeAuthAllow,
  ModelAttributeAuthProvider,
  ModelOperation,
  ModelPredicateCreator,
  ModelSortPredicateCreator,
  NAMESPACES,
  OpType,
  PredicateInternalsKey,
  Predicates,
  ProcessName,
  QueryOne,
  SortDirection,
  initSchema,
  isAssociatedWith,
  isEnumFieldType,
  isFieldAssociation,
  isGraphQLScalarType,
  isIdentifierObject,
  isModelAttributeAuth,
  isModelAttributeCompositeKey,
  isModelAttributeKey,
  isModelAttributePrimaryKey,
  isModelFieldType,
  isNonModelFieldType,
  isPredicateGroup,
  isPredicateObj,
  isSchemaModel,
  isSchemaModelWithAttributes,
  isTargetNameAssociation,
  syncExpression,
  utils
};
//# sourceMappingURL=@aws-amplify_datastore.js.map
