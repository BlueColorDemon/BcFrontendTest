define("ZeroClipboard.js", function (e, t, n) {
    !function (e, t) {
        "use strict";
        var r, a = e, i = a.document, o = a.navigator, l = a.setTimeout, s = a.Number.parseInt || a.parseInt, u = a.Number.parseFloat || a.parseFloat, c = a.Number.isNaN || a.isNaN, f = a.encodeURIComponent, p = a.Math, d = a.Date, h = a.ActiveXObject, y = a.Array.prototype.slice, v = a.Object.keys, g = a.Object.prototype.hasOwnProperty, m = function () {
            return "function" == typeof a.Object.defineProperty && function () {
                try {
                    var e = {};
                    return a.Object.defineProperty(e, "y", {
                        value: "z"
                    }),
                    "z" === e.y
                } catch (t) {
                    return !1
                }
            }() ? a.Object.defineProperty : void 0
        }(), b = function (e) {
            return y.call(e, 0)
        }, w = function (e, t, n) {
            if ("function" == typeof t.indexOf)
                return t.indexOf(e, n);
            var r, a = t.length;
            for ("undefined" == typeof n ? n = 0 : 0 > n && (n = a + n),
            r = n; a > r; r++)
                if (g.call(t, r) && t[r] === e)
                    return r;
            return -1
        }, C = function () {
            var e, n, r, a, i, o, l = b(arguments), s = l[0] || {};
            for (e = 1,
            n = l.length; n > e; e++)
                if (null != (r = l[e]))
                    for (a in r)
                        if (g.call(r, a)) {
                            if (i = s[a],
                            o = r[a],
                            s === o)
                                continue;
                            o !== t && (s[a] = o)
                        }
            return s
        }, T = function (e) {
            var t, n, r, a;
            if ("object" != typeof e || null == e)
                t = e;
            else if ("number" == typeof e.length)
                for (t = [],
                n = 0,
                r = e.length; r > n; n++)
                    g.call(e, n) && (t[n] = T(e[n]));
            else {
                t = {};
                for (a in e)
                    g.call(e, a) && (t[a] = T(e[a]))
            }
            return t
        }, x = function (e, t) {
            for (var n = {}, r = 0, a = t.length; a > r; r++)
                t[r] in e && (n[t[r]] = e[t[r]]);
            return n
        }, E = function (e, t) {
            var n = {};
            for (var r in e)
                -1 === w(r, t) && (n[r] = e[r]);
            return n
        }, j = function (e) {
            if (null == e)
                return [];
            if (v)
                return v(e);
            var t = [];
            for (var n in e)
                g.call(e, n) && t.push(n);
            return t
        }, D = function (e) {
            if (e)
                for (var t in e)
                    g.call(e, t) && delete e[t];
            return e
        }, I = function (e, t) {
            t in e && "function" == typeof m && m(e, t, {
                value: e[t],
                writable: !1,
                configurable: !0,
                enumerable: !0
            })
        }, k = function (e) {
            return function () {
                var t;
                return t = e.now ? e.now() : (new e).getTime()
            }
        }(d), N = function (e, t) {
            if (e && 1 === e.nodeType && t && (1 === t.nodeType || 9 === t.nodeType))
                do {
                    if (e === t)
                        return !0;
                    e = e.parentNode
                } while (e); return !1
        }, O = {
            bridge: null,
            version: "0.0.0",
            pluginType: "unknown",
            disabled: null,
            outdated: null,
            unavailable: null,
            deactivated: null,
            overdue: null,
            ready: null
        }, L = "11.0.0", z = {}, S = {}, _ = null, F = {
            ready: "Flash communication is established",
            error: {
                "flash-disabled": "Flash is disabled or not installed",
                "flash-outdated": "Flash is too outdated to support ZeroClipboard",
                "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
                "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
                "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
            }
        }, X = function () {
            var e, t, n, r, a = "ZeroClipboard.swf";
            if (!i.currentScript || !(r = i.currentScript.src)) {
                var o = i.getElementsByTagName("script");
                if ("readyState" in o[0])
                    for (e = o.length; e-- && ("interactive" !== o[e].readyState || !(r = o[e].src)) ;)
                        ;
                else if ("loading" === i.readyState)
                    r = o[o.length - 1].src;
                else {
                    for (e = o.length; e--;) {
                        if (n = o[e].src,
                        !n) {
                            t = null;
                            break
                        }
                        if (n = n.split("#")[0].split("?")[0],
                        n = n.slice(0, n.lastIndexOf("/") + 1),
                        null == t)
                            t = n;
                        else if (t !== n) {
                            t = null;
                            break
                        }
                    }
                    null !== t && (r = t)
                }
            }
            return r && (r = r.split("#")[0].split("?")[0],
            a = r.slice(0, r.lastIndexOf("/") + 1) + a),
            a
        }(), A = {
            swfPath: X,
            trustedDomains: e.location.host ? [e.location.host] : [],
            cacheBust: !0,
            forceEnhancedClipboard: !1,
            flashLoadTimeout: 3e4,
            autoActivate: !0,
            bubbleEvents: !0,
            containerId: "global-zeroclipboard-html-bridge",
            containerClass: "global-zeroclipboard-container",
            swfObjectId: "global-zeroclipboard-flash-bridge",
            hoverClass: "zeroclipboard-is-hover",
            activeClass: "zeroclipboard-is-active",
            forceHandCursor: !1,
            title: null,
            zIndex: 999999999
        }, Y = function (e) {
            if ("object" == typeof e && null !== e)
                for (var t in e)
                    if (g.call(e, t))
                        if (/^(?:forceHandCursor|title|zIndex|bubbleEvents)$/.test(t))
                            A[t] = e[t];
                        else if (null == O.bridge)
                            if ("containerId" === t || "swfObjectId" === t) {
                                if (!W(e[t]))
                                    throw new Error("The specified `" + t + "` value is not valid as an HTML4 Element ID");
                                A[t] = e[t]
                            } else
                                A[t] = e[t];
            {
                if ("string" != typeof e || !e)
                    return T(A);
                if (g.call(A, e))
                    return A[e]
            }
        }, $ = function () {
            return {
                browser: x(o, ["userAgent", "platform", "appName"]),
                flash: E(O, ["bridge"]),
                zeroclipboard: {
                    version: It.version,
                    config: It.config()
                }
            }
        }, B = function () {
            return !!(O.disabled || O.outdated || O.unavailable || O.deactivated)
        }, H = function (e, t) {
            var n, r, a, i = {};
            if ("string" == typeof e && e)
                a = e.toLowerCase().split(/\s+/);
            else if ("object" == typeof e && e && "undefined" == typeof t)
                for (n in e)
                    g.call(e, n) && "string" == typeof n && n && "function" == typeof e[n] && It.on(n, e[n]);
            if (a && a.length) {
                for (n = 0,
                r = a.length; r > n; n++)
                    e = a[n].replace(/^on/, ""),
                    i[e] = !0,
                    z[e] || (z[e] = []),
                    z[e].push(t);
                if (i.ready && O.ready && It.emit({
                    type: "ready"
                }),
                i.error) {
                    var o = ["disabled", "outdated", "unavailable", "deactivated", "overdue"];
                    for (n = 0,
                    r = o.length; r > n; n++)
                        if (O[o[n]] === !0) {
                            It.emit({
                                type: "error",
                                name: "flash-" + o[n]
                            });
                            break
                        }
                }
            }
            return It
        }, M = function (e, t) {
            var n, r, a, i, o;
            if (0 === arguments.length)
                i = j(z);
            else if ("string" == typeof e && e)
                i = e.split(/\s+/);
            else if ("object" == typeof e && e && "undefined" == typeof t)
                for (n in e)
                    g.call(e, n) && "string" == typeof n && n && "function" == typeof e[n] && It.off(n, e[n]);
            if (i && i.length)
                for (n = 0,
                r = i.length; r > n; n++)
                    if (e = i[n].toLowerCase().replace(/^on/, ""),
                    o = z[e],
                    o && o.length)
                        if (t)
                            for (a = w(t, o) ; -1 !== a;)
                                o.splice(a, 1),
                                a = w(t, o, a);
                        else
                            o.length = 0;
            return It
        }, P = function (e) {
            var t;
            return t = "string" == typeof e && e ? T(z[e]) || null : T(z)
        }, Z = function (e) {
            var t, n, r;
            return e = q(e),
            e && !at(e) ? "ready" === e.type && O.overdue === !0 ? It.emit({
                type: "error",
                name: "flash-overdue"
            }) : (t = C({}, e),
            rt.call(this, t),
            "copy" === e.type && (r = ct(S),
            n = r.data,
            _ = r.formatMap),
            n) : void 0
        }, R = function () {
            if ("boolean" != typeof O.ready && (O.ready = !1),
            !It.isFlashUnusable() && null === O.bridge) {
                var e = A.flashLoadTimeout;
                "number" == typeof e && e >= 0 && l(function () {
                    "boolean" != typeof O.deactivated && (O.deactivated = !0),
                    O.deactivated === !0 && It.emit({
                        type: "error",
                        name: "flash-deactivated"
                    })
                }, e),
                O.overdue = !1,
                st()
            }
        }, V = function () {
            It.clearData(),
            It.deactivate(),
            It.emit("destroy"),
            ut(),
            It.off()
        }, K = function (e, t) {
            var n;
            if ("object" == typeof e && e && "undefined" == typeof t)
                n = e,
                It.clearData();
            else {
                if ("string" != typeof e || !e)
                    return;
                n = {},
                n[e] = t
            }
            for (var r in n)
                "string" == typeof r && r && g.call(n, r) && "string" == typeof n[r] && n[r] && (S[r] = n[r])
        }, U = function (e) {
            "undefined" == typeof e ? (D(S),
            _ = null) : "string" == typeof e && g.call(S, e) && delete S[e]
        }, G = function (e) {
            if (e && 1 === e.nodeType) {
                r && (mt(r, A.activeClass),
                r !== e && mt(r, A.hoverClass)),
                r = e,
                gt(e, A.hoverClass);
                var t = e.getAttribute("title") || A.title;
                if ("string" == typeof t && t) {
                    var n = lt(O.bridge);
                    n && n.setAttribute("title", t)
                }
                var a = A.forceHandCursor === !0 || "pointer" === wt(e, "cursor");
                Et(a),
                xt()
            }
        }, J = function () {
            var e = lt(O.bridge);
            e && (e.removeAttribute("title"),
            e.style.left = "0px",
            e.style.top = "-9999px",
            e.style.width = "1px",
            e.style.top = "1px"),
            r && (mt(r, A.hoverClass),
            mt(r, A.activeClass),
            r = null)
        }, W = function (e) {
            return "string" == typeof e && e && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(e)
        }, q = function (e) {
            var t;
            if ("string" == typeof e && e ? (t = e,
            e = {}) : "object" == typeof e && e && "string" == typeof e.type && e.type && (t = e.type),
            t) {
                C(e, {
                    type: t.toLowerCase(),
                    target: e.target || r || null,
                    relatedTarget: e.relatedTarget || null,
                    currentTarget: O && O.bridge || null,
                    timeStamp: e.timeStamp || k() || null
                });
                var n = F[e.type];
                return "error" === e.type && e.name && n && (n = n[e.name]),
                n && (e.message = n),
                "ready" === e.type && C(e, {
                    target: null,
                    version: O.version
                }),
                "error" === e.type && (/^flash-(disabled|outdated|unavailable|deactivated|overdue)$/.test(e.name) && C(e, {
                    target: null,
                    minimumVersion: L
                }),
                /^flash-(outdated|unavailable|deactivated|overdue)$/.test(e.name) && C(e, {
                    version: O.version
                })),
                "copy" === e.type && (e.clipboardData = {
                    setData: It.setData,
                    clearData: It.clearData
                }),
                "aftercopy" === e.type && (e = ft(e, _)),
                e.target && !e.relatedTarget && (e.relatedTarget = Q(e.target)),
                e = et(e)
            }
        }, Q = function (e) {
            var t = e && e.getAttribute && e.getAttribute("data-clipboard-target");
            return t ? i.getElementById(t) : null
        }, et = function (e) {
            if (e && /^_(?:click|mouse(?:over|out|down|up|move))$/.test(e.type)) {
                var n = e.target
                  , r = "_mouseover" === e.type && e.relatedTarget ? e.relatedTarget : t
                  , o = "_mouseout" === e.type && e.relatedTarget ? e.relatedTarget : t
                  , l = Tt(n)
                  , s = a.screenLeft || a.screenX || 0
                  , u = a.screenTop || a.screenY || 0
                  , c = i.body.scrollLeft + i.documentElement.scrollLeft
                  , f = i.body.scrollTop + i.documentElement.scrollTop
                  , p = l.left + ("number" == typeof e._stageX ? e._stageX : 0)
                  , d = l.top + ("number" == typeof e._stageY ? e._stageY : 0)
                  , h = p - c
                  , y = d - f
                  , v = s + h
                  , g = u + y
                  , m = "number" == typeof e.movementX ? e.movementX : 0
                  , b = "number" == typeof e.movementY ? e.movementY : 0;
                delete e._stageX,
                delete e._stageY,
                C(e, {
                    srcElement: n,
                    fromElement: r,
                    toElement: o,
                    screenX: v,
                    screenY: g,
                    pageX: p,
                    pageY: d,
                    clientX: h,
                    clientY: y,
                    x: h,
                    y: y,
                    movementX: m,
                    movementY: b,
                    offsetX: 0,
                    offsetY: 0,
                    layerX: 0,
                    layerY: 0
                })
            }
            return e
        }, tt = function (e) {
            var t = e && "string" == typeof e.type && e.type || "";
            return !/^(?:(?:before)?copy|destroy)$/.test(t)
        }, nt = function (e, t, n, r) {
            r ? l(function () {
                e.apply(t, n)
            }, 0) : e.apply(t, n)
        }, rt = function (e) {
            if ("object" == typeof e && e && e.type) {
                var t = tt(e)
                  , n = z["*"] || []
                  , r = z[e.type] || []
                  , i = n.concat(r);
                if (i && i.length) {
                    var o, l, s, u, c, f = this;
                    for (o = 0,
                    l = i.length; l > o; o++)
                        s = i[o],
                        u = f,
                        "string" == typeof s && "function" == typeof a[s] && (s = a[s]),
                        "object" == typeof s && s && "function" == typeof s.handleEvent && (u = s,
                        s = s.handleEvent),
                        "function" == typeof s && (c = C({}, e),
                        nt(s, u, [c], t))
                }
                return this
            }
        }, at = function (e) {
            var t = e.target || r || null
              , n = "swf" === e._source;
            switch (delete e._source,
            e.type) {
                case "error":
                    w(e.name, ["flash-disabled", "flash-outdated", "flash-deactivated", "flash-overdue"]) && C(O, {
                        disabled: "flash-disabled" === e.name,
                        outdated: "flash-outdated" === e.name,
                        unavailable: "flash-unavailable" === e.name,
                        deactivated: "flash-deactivated" === e.name,
                        overdue: "flash-overdue" === e.name,
                        ready: !1
                    });
                    break;
                case "ready":
                    var a = O.deactivated === !0;
                    C(O, {
                        disabled: !1,
                        outdated: !1,
                        unavailable: !1,
                        deactivated: !1,
                        overdue: a,
                        ready: !a
                    });
                    break;
                case "copy":
                    var i, o, l = e.relatedTarget;
                    !S["text/html"] && !S["text/plain"] && l && (o = l.value || l.outerHTML || l.innerHTML) && (i = l.value || l.textContent || l.innerText) ? (e.clipboardData.clearData(),
                    e.clipboardData.setData("text/plain", i),
                    o !== i && e.clipboardData.setData("text/html", o)) : !S["text/plain"] && e.target && (i = e.target.getAttribute("data-clipboard-text")) && (e.clipboardData.clearData(),
                    e.clipboardData.setData("text/plain", i));
                    break;
                case "aftercopy":
                    It.clearData(),
                    t && t !== vt() && t.focus && t.focus();
                    break;
                case "_mouseover":
                    It.activate(t),
                    A.bubbleEvents === !0 && n && (t && t !== e.relatedTarget && !N(e.relatedTarget, t) && it(C({}, e, {
                        type: "mouseenter",
                        bubbles: !1,
                        cancelable: !1
                    })),
                    it(C({}, e, {
                        type: "mouseover"
                    })));
                    break;
                case "_mouseout":
                    It.deactivate(),
                    A.bubbleEvents === !0 && n && (t && t !== e.relatedTarget && !N(e.relatedTarget, t) && it(C({}, e, {
                        type: "mouseleave",
                        bubbles: !1,
                        cancelable: !1
                    })),
                    it(C({}, e, {
                        type: "mouseout"
                    })));
                    break;
                case "_mousedown":
                    gt(t, A.activeClass),
                    A.bubbleEvents === !0 && n && it(C({}, e, {
                        type: e.type.slice(1)
                    }));
                    break;
                case "_mouseup":
                    mt(t, A.activeClass),
                    A.bubbleEvents === !0 && n && it(C({}, e, {
                        type: e.type.slice(1)
                    }));
                    break;
                case "_click":
                case "_mousemove":
                    A.bubbleEvents === !0 && n && it(C({}, e, {
                        type: e.type.slice(1)
                    }))
            }
            return /^_(?:click|mouse(?:over|out|down|up|move))$/.test(e.type) ? !0 : void 0
        }, it = function (e) {
            if (e && "string" == typeof e.type && e) {
                var t, n = e.target || e.srcElement || null, r = n && n.ownerDocument || i, o = {
                    view: r.defaultView || a,
                    canBubble: !0,
                    cancelable: !0,
                    detail: "click" === e.type ? 1 : 0,
                    button: "number" == typeof e.which ? e.which - 1 : "number" == typeof e.button ? e.button : r.createEvent ? 0 : 1
                }, l = C(o, e);
                n && (r.createEvent && n.dispatchEvent ? (l = [l.type, l.canBubble, l.cancelable, l.view, l.detail, l.screenX, l.screenY, l.clientX, l.clientY, l.ctrlKey, l.altKey, l.shiftKey, l.metaKey, l.button, l.relatedTarget],
                t = r.createEvent("MouseEvents"),
                t.initMouseEvent && (t.initMouseEvent.apply(t, l),
                n.dispatchEvent(t))) : r.createEventObject && n.fireEvent && (t = r.createEventObject(l),
                n.fireEvent("on" + l.type, t)))
            }
        }, ot = function () {
            var e = i.createElement("div");
            return e.id = A.containerId,
            e.className = A.containerClass,
            e.style.position = "absolute",
            e.style.left = "0px",
            e.style.top = "-9999px",
            e.style.width = "1px",
            e.style.height = "1px",
            e.style.zIndex = "" + jt(A.zIndex),
            e
        }, lt = function (e) {
            for (var t = e && e.parentNode; t && "OBJECT" === t.nodeName && t.parentNode;)
                t = t.parentNode;
            return t || null
        }, st = function () {
            var e, t = O.bridge, n = lt(t);
            if (!t) {
                var r = yt(a.location.host, A)
                  , o = "never" === r ? "none" : "all"
                  , l = dt(A)
                  , s = A.swfPath + pt(A.swfPath, A);
                n = ot();
                var u = i.createElement("div");
                n.appendChild(u),
                i.body.appendChild(n);
                var c = i.createElement("div")
                  , f = "activex" === O.pluginType;
                c.innerHTML = '<object id="' + A.swfObjectId + '" name="' + A.swfObjectId + '" width="100%" height="100%" ' + (f ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : 'type="application/x-shockwave-flash" data="' + s + '"') + ">" + (f ? '<param name="movie" value="' + s + '"/>' : "") + '<param name="allowScriptAccess" value="' + r + '"/><param name="allowNetworking" value="' + o + '"/><param name="menu" value="false"/><param name="wmode" value="transparent"/><param name="flashvars" value="' + l + '"/></object>',
                t = c.firstChild,
                c = null,
                t.ZeroClipboard = It,
                n.replaceChild(t, u)
            }
            return t || (t = i[A.swfObjectId],
            t && (e = t.length) && (t = t[e - 1]),
            !t && n && (t = n.firstChild)),
            O.bridge = t || null,
            t
        }, ut = function () {
            var e = O.bridge;
            if (e) {
                var t = lt(e);
                t && ("activex" === O.pluginType && "readyState" in e ? (e.style.display = "none",
                function n() {
                    if (4 === e.readyState) {
                        for (var r in e)
                            "function" == typeof e[r] && (e[r] = null);
                        e.parentNode && e.parentNode.removeChild(e),
                        t.parentNode && t.parentNode.removeChild(t)
                    } else
                        l(n, 10)
                }()) : (e.parentNode && e.parentNode.removeChild(e),
                t.parentNode && t.parentNode.removeChild(t))),
                O.ready = null,
                O.bridge = null,
                O.deactivated = null
            }
        }, ct = function (e) {
            var t = {}
              , n = {};
            if ("object" == typeof e && e) {
                for (var r in e)
                    if (r && g.call(e, r) && "string" == typeof e[r] && e[r])
                        switch (r.toLowerCase()) {
                            case "text/plain":
                            case "text":
                            case "air:text":
                            case "flash:text":
                                t.text = e[r],
                                n.text = r;
                                break;
                            case "text/html":
                            case "html":
                            case "air:html":
                            case "flash:html":
                                t.html = e[r],
                                n.html = r;
                                break;
                            case "application/rtf":
                            case "text/rtf":
                            case "rtf":
                            case "richtext":
                            case "air:rtf":
                            case "flash:rtf":
                                t.rtf = e[r],
                                n.rtf = r
                        }
                return {
                    data: t,
                    formatMap: n
                }
            }
        }, ft = function (e, t) {
            if ("object" != typeof e || !e || "object" != typeof t || !t)
                return e;
            var n = {};
            for (var r in e)
                if (g.call(e, r)) {
                    if ("success" !== r && "data" !== r) {
                        n[r] = e[r];
                        continue
                    }
                    n[r] = {};
                    var a = e[r];
                    for (var i in a)
                        i && g.call(a, i) && g.call(t, i) && (n[r][t[i]] = a[i])
                }
            return n
        }, pt = function (e, t) {
            var n = null == t || t && t.cacheBust === !0;
            return n ? (-1 === e.indexOf("?") ? "?" : "&") + "noCache=" + k() : ""
        }, dt = function (e) {
            var t, n, r, i, o = "", l = [];
            if (e.trustedDomains && ("string" == typeof e.trustedDomains ? i = [e.trustedDomains] : "object" == typeof e.trustedDomains && "length" in e.trustedDomains && (i = e.trustedDomains)),
            i && i.length)
                for (t = 0,
                n = i.length; n > t; t++)
                    if (g.call(i, t) && i[t] && "string" == typeof i[t]) {
                        if (r = ht(i[t]),
                        !r)
                            continue;
                        if ("*" === r) {
                            l = [r];
                            break
                        }
                        l.push.apply(l, [r, "//" + r, a.location.protocol + "//" + r])
                    }
            return l.length && (o += "trustedOrigins=" + f(l.join(","))),
            e.forceEnhancedClipboard === !0 && (o += (o ? "&" : "") + "forceEnhancedClipboard=true"),
            "string" == typeof e.swfObjectId && e.swfObjectId && (o += (o ? "&" : "") + "swfObjectId=" + f(e.swfObjectId)),
            o
        }, ht = function (e) {
            if (null == e || "" === e)
                return null;
            if (e = e.replace(/^\s+|\s+$/g, ""),
            "" === e)
                return null;
            var t = e.indexOf("//");
            e = -1 === t ? e : e.slice(t + 2);
            var n = e.indexOf("/");
            return e = -1 === n ? e : -1 === t || 0 === n ? null : e.slice(0, n),
            e && ".swf" === e.slice(-4).toLowerCase() ? null : e || null
        }, yt = function () {
            var e = function (e, t) {
                var n, r, a;
                if (null != e && "*" !== t[0] && ("string" == typeof e && (e = [e]),
                "object" == typeof e && "number" == typeof e.length))
                    for (n = 0,
                    r = e.length; r > n; n++)
                        if (g.call(e, n) && (a = ht(e[n]))) {
                            if ("*" === a) {
                                t.length = 0,
                                t.push("*");
                                break
                            }
                            -1 === w(a, t) && t.push(a)
                        }
            };
            return function (t, n) {
                var r = ht(n.swfPath);
                null === r && (r = t);
                var a = [];
                e(n.trustedOrigins, a),
                e(n.trustedDomains, a);
                var i = a.length;
                if (i > 0) {
                    if (1 === i && "*" === a[0])
                        return "always";
                    if (-1 !== w(t, a))
                        return 1 === i && t === r ? "sameDomain" : "always"
                }
                return "never"
            }
        }(), vt = function () {
            try {
                return i.activeElement
            } catch (e) {
                return null
            }
        }, gt = function (e, t) {
            if (!e || 1 !== e.nodeType)
                return e;
            if (e.classList)
                return e.classList.contains(t) || e.classList.add(t),
                e;
            if (t && "string" == typeof t) {
                var n = (t || "").split(/\s+/);
                if (1 === e.nodeType)
                    if (e.className) {
                        for (var r = " " + e.className + " ", a = e.className, i = 0, o = n.length; o > i; i++)
                            r.indexOf(" " + n[i] + " ") < 0 && (a += " " + n[i]);
                        e.className = a.replace(/^\s+|\s+$/g, "")
                    } else
                        e.className = t
            }
            return e
        }, mt = function (e, t) {
            if (!e || 1 !== e.nodeType)
                return e;
            if (e.classList)
                return e.classList.contains(t) && e.classList.remove(t),
                e;
            if ("string" == typeof t && t) {
                var n = t.split(/\s+/);
                if (1 === e.nodeType && e.className) {
                    for (var r = (" " + e.className + " ").replace(/[\n\t]/g, " "), a = 0, i = n.length; i > a; a++)
                        r = r.replace(" " + n[a] + " ", " ");
                    e.className = r.replace(/^\s+|\s+$/g, "")
                }
            }
            return e
        }, bt = function () {
            var e = /\-([a-z])/g
              , t = function (e, t) {
                  return t.toUpperCase()
              };
            return function (n) {
                return n.replace(e, t)
            }
        }(), wt = function (e, t) {
            var n, r, i;
            return a.getComputedStyle ? n = a.getComputedStyle(e, null).getPropertyValue(t) : (r = bt(t),
            n = e.currentStyle ? e.currentStyle[r] : e.style[r]),
            "cursor" !== t || n && "auto" !== n || (i = e.tagName.toLowerCase(),
            "a" !== i) ? n : "pointer"
        }, Ct = function () {
            var e, t, n, r = 1;
            return "function" == typeof i.body.getBoundingClientRect && (e = i.body.getBoundingClientRect(),
            t = e.right - e.left,
            n = i.body.offsetWidth,
            r = p.round(t / n * 100) / 100),
            r
        }, Tt = function (e) {
            var t = {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
            if (e.getBoundingClientRect) {
                var n, r, o, l = e.getBoundingClientRect();
                "pageXOffset" in a && "pageYOffset" in a ? (n = a.pageXOffset,
                r = a.pageYOffset) : (o = Ct(),
                n = p.round(i.documentElement.scrollLeft / o),
                r = p.round(i.documentElement.scrollTop / o));
                var s = i.documentElement.clientLeft || 0
                  , u = i.documentElement.clientTop || 0;
                t.left = l.left + n - s,
                t.top = l.top + r - u,
                t.width = "width" in l ? l.width : l.right - l.left,
                t.height = "height" in l ? l.height : l.bottom - l.top
            }
            return t
        }, xt = function () {
            var e;
            if (r && (e = lt(O.bridge))) {
                var t = Tt(r);
                C(e.style, {
                    width: t.width + "px",
                    height: t.height + "px",
                    top: t.top + "px",
                    left: t.left + "px",
                    zIndex: "" + jt(A.zIndex)
                })
            }
        }, Et = function (e) {
            O.ready === !0 && (O.bridge && "function" == typeof O.bridge.setHandCursor ? O.bridge.setHandCursor(e) : O.ready = !1)
        }, jt = function (e) {
            if (/^(?:auto|inherit)$/.test(e))
                return e;
            var t;
            return "number" != typeof e || c(e) ? "string" == typeof e && (t = jt(s(e, 10))) : t = e,
            "number" == typeof t ? t : "auto"
        }, Dt = function (e) {
            function t(e) {
                var t = e.match(/[\d]+/g);
                return t.length = 3,
                t.join(".")
            }
            function n(e) {
                return !!e && (e = e.toLowerCase()) && (/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(e) || "chrome.plugin" === e.slice(-13))
            }
            function r(e) {
                e && (s = !0,
                e.version && (p = t(e.version)),
                !p && e.description && (p = t(e.description)),
                e.filename && (f = n(e.filename)))
            }
            var a, i, l, s = !1, c = !1, f = !1, p = "";
            if (o.plugins && o.plugins.length)
                a = o.plugins["Shockwave Flash"],
                r(a),
                o.plugins["Shockwave Flash 2.0"] && (s = !0,
                p = "2.0.0.11");
            else if (o.mimeTypes && o.mimeTypes.length)
                l = o.mimeTypes["application/x-shockwave-flash"],
                a = l && l.enabledPlugin,
                r(a);
            else if ("undefined" != typeof e) {
                c = !0;
                try {
                    i = new e("ShockwaveFlash.ShockwaveFlash.7"),
                    s = !0,
                    p = t(i.GetVariable("$version"))
                } catch (d) {
                    try {
                        i = new e("ShockwaveFlash.ShockwaveFlash.6"),
                        s = !0,
                        p = "6.0.21"
                    } catch (h) {
                        try {
                            i = new e("ShockwaveFlash.ShockwaveFlash"),
                            s = !0,
                            p = t(i.GetVariable("$version"))
                        } catch (y) {
                            c = !1
                        }
                    }
                }
            }
            O.disabled = s !== !0,
            O.outdated = p && u(p) < u(L),
            O.version = p || "0.0.0",
            O.pluginType = f ? "pepper" : c ? "activex" : s ? "netscape" : "unknown"
        };
        Dt(h);
        var It = function () {
            return this instanceof It ? void ("function" == typeof It._createClient && It._createClient.apply(this, b(arguments))) : new It
        };
        It.version = "2.0.2",
        I(It, "version"),
        It.config = function () {
            return Y.apply(this, b(arguments))
        }
        ,
        It.state = function () {
            return $.apply(this, b(arguments))
        }
        ,
        It.isFlashUnusable = function () {
            return B.apply(this, b(arguments))
        }
        ,
        It.on = function () {
            return H.apply(this, b(arguments))
        }
        ,
        It.off = function () {
            return M.apply(this, b(arguments))
        }
        ,
        It.handlers = function () {
            return P.apply(this, b(arguments))
        }
        ,
        It.emit = function () {
            return Z.apply(this, b(arguments))
        }
        ,
        It.create = function () {
            return R.apply(this, b(arguments))
        }
        ,
        It.destroy = function () {
            return V.apply(this, b(arguments))
        }
        ,
        It.setData = function () {
            return K.apply(this, b(arguments))
        }
        ,
        It.clearData = function () {
            return U.apply(this, b(arguments))
        }
        ,
        It.activate = function () {
            return G.apply(this, b(arguments))
        }
        ,
        It.deactivate = function () {
            return J.apply(this, b(arguments))
        }
        ;
        var kt = 0
          , Nt = {}
          , Ot = 0
          , Lt = {}
          , zt = {};
        C(A, {
            autoActivate: !0
        });
        var St = function (e) {
            var t = this;
            t.id = "" + kt++,
            Nt[t.id] = {
                instance: t,
                elements: [],
                handlers: {}
            },
            e && t.clip(e),
            It.on("*", function (e) {
                return t.emit(e)
            }),
            It.on("destroy", function () {
                t.destroy()
            }),
            It.create()
        }
          , _t = function (e, t) {
              var n, r, a, i = {}, o = Nt[this.id] && Nt[this.id].handlers;
              if ("string" == typeof e && e)
                  a = e.toLowerCase().split(/\s+/);
              else if ("object" == typeof e && e && "undefined" == typeof t)
                  for (n in e)
                      g.call(e, n) && "string" == typeof n && n && "function" == typeof e[n] && this.on(n, e[n]);
              if (a && a.length) {
                  for (n = 0,
                  r = a.length; r > n; n++)
                      e = a[n].replace(/^on/, ""),
                      i[e] = !0,
                      o[e] || (o[e] = []),
                      o[e].push(t);
                  if (i.ready && O.ready && this.emit({
                      type: "ready",
                      client: this
                  }),
                  i.error) {
                      var l = ["disabled", "outdated", "unavailable", "deactivated", "overdue"];
                      for (n = 0,
                      r = l.length; r > n; n++)
                          if (O[l[n]]) {
                              this.emit({
                                  type: "error",
                                  name: "flash-" + l[n],
                                  client: this
                              });
                              break
                          }
                  }
              }
              return this
          }
          , Ft = function (e, t) {
              var n, r, a, i, o, l = Nt[this.id] && Nt[this.id].handlers;
              if (0 === arguments.length)
                  i = j(l);
              else if ("string" == typeof e && e)
                  i = e.split(/\s+/);
              else if ("object" == typeof e && e && "undefined" == typeof t)
                  for (n in e)
                      g.call(e, n) && "string" == typeof n && n && "function" == typeof e[n] && this.off(n, e[n]);
              if (i && i.length)
                  for (n = 0,
                  r = i.length; r > n; n++)
                      if (e = i[n].toLowerCase().replace(/^on/, ""),
                      o = l[e],
                      o && o.length)
                          if (t)
                              for (a = w(t, o) ; -1 !== a;)
                                  o.splice(a, 1),
                                  a = w(t, o, a);
                          else
                              o.length = 0;
              return this
          }
          , Xt = function (e) {
              var t = null
                , n = Nt[this.id] && Nt[this.id].handlers;
              return n && (t = "string" == typeof e && e ? n[e] ? n[e].slice(0) : [] : T(n)),
              t
          }
          , At = function (e) {
              if (Mt.call(this, e)) {
                  "object" == typeof e && e && "string" == typeof e.type && e.type && (e = C({}, e));
                  var t = C({}, q(e), {
                      client: this
                  });
                  Pt.call(this, t)
              }
              return this
          }
          , Yt = function (e) {
              e = Zt(e);
              for (var t = 0; t < e.length; t++)
                  if (g.call(e, t) && e[t] && 1 === e[t].nodeType) {
                      e[t].zcClippingId ? -1 === w(this.id, Lt[e[t].zcClippingId]) && Lt[e[t].zcClippingId].push(this.id) : (e[t].zcClippingId = "zcClippingId_" + Ot++,
                      Lt[e[t].zcClippingId] = [this.id],
                      A.autoActivate === !0 && Kt(e[t]));
                      var n = Nt[this.id] && Nt[this.id].elements;
                      -1 === w(e[t], n) && n.push(e[t])
                  }
              return this
          }
          , $t = function (e) {
              var t = Nt[this.id];
              if (!t)
                  return this;
              var n, r = t.elements;
              e = "undefined" == typeof e ? r.slice(0) : Zt(e);
              for (var a = e.length; a--;)
                  if (g.call(e, a) && e[a] && 1 === e[a].nodeType) {
                      for (n = 0; -1 !== (n = w(e[a], r, n)) ;)
                          r.splice(n, 1);
                      var i = Lt[e[a].zcClippingId];
                      if (i) {
                          for (n = 0; -1 !== (n = w(this.id, i, n)) ;)
                              i.splice(n, 1);
                          0 === i.length && (A.autoActivate === !0 && Ut(e[a]),
                          delete e[a].zcClippingId)
                      }
                  }
              return this
          }
          , Bt = function () {
              var e = Nt[this.id];
              return e && e.elements ? e.elements.slice(0) : []
          }
          , Ht = function () {
              this.unclip(),
              this.off(),
              delete Nt[this.id]
          }
          , Mt = function (e) {
              if (!e || !e.type)
                  return !1;
              if (e.client && e.client !== this)
                  return !1;
              var t = Nt[this.id] && Nt[this.id].elements
                , n = !!t && t.length > 0
                , r = !e.target || n && -1 !== w(e.target, t)
                , a = e.relatedTarget && n && -1 !== w(e.relatedTarget, t)
                , i = e.client && e.client === this;
              return r || a || i ? !0 : !1
          }
          , Pt = function (e) {
              if ("object" == typeof e && e && e.type) {
                  var t = tt(e)
                    , n = Nt[this.id] && Nt[this.id].handlers["*"] || []
                    , r = Nt[this.id] && Nt[this.id].handlers[e.type] || []
                    , i = n.concat(r);
                  if (i && i.length) {
                      var o, l, s, u, c, f = this;
                      for (o = 0,
                      l = i.length; l > o; o++)
                          s = i[o],
                          u = f,
                          "string" == typeof s && "function" == typeof a[s] && (s = a[s]),
                          "object" == typeof s && s && "function" == typeof s.handleEvent && (u = s,
                          s = s.handleEvent),
                          "function" == typeof s && (c = C({}, e),
                          nt(s, u, [c], t))
                  }
                  return this
              }
          }
          , Zt = function (e) {
              return "string" == typeof e && (e = []),
              "number" != typeof e.length ? [e] : e
          }
          , Rt = function (e, t, n) {
              return e && 1 === e.nodeType ? (e.addEventListener ? e.addEventListener(t, n, !1) : e.attachEvent && e.attachEvent("on" + t, n),
              e) : e
          }
          , Vt = function (e, t, n) {
              return e && 1 === e.nodeType ? (e.removeEventListener ? e.removeEventListener(t, n, !1) : e.detachEvent && e.detachEvent("on" + t, n),
              e) : e
          }
          , Kt = function (e) {
              if (e && 1 === e.nodeType) {
                  var t = function (t) {
                      (t || a.event) && It.activate(e)
                  };
                  Rt(e, "mouseover", t),
                  zt[e.zcClippingId] = {
                      mouseover: t
                  }
              }
          }
          , Ut = function (e) {
              if (e && 1 === e.nodeType) {
                  var t = zt[e.zcClippingId];
                  "object" == typeof t && t && ("function" == typeof t.mouseover && Vt(e, "mouseover", t.mouseover),
                  delete zt[e.zcClippingId])
              }
          };
        It._createClient = function () {
            St.apply(this, b(arguments))
        }
        ,
        It.prototype.on = function () {
            return _t.apply(this, b(arguments))
        }
        ,
        It.prototype.off = function () {
            return Ft.apply(this, b(arguments))
        }
        ,
        It.prototype.handlers = function () {
            return Xt.apply(this, b(arguments))
        }
        ,
        It.prototype.emit = function () {
            return At.apply(this, b(arguments))
        }
        ,
        It.prototype.clip = function () {
            return Yt.apply(this, b(arguments))
        }
        ,
        It.prototype.unclip = function () {
            return $t.apply(this, b(arguments))
        }
        ,
        It.prototype.elements = function () {
            return Bt.apply(this, b(arguments))
        }
        ,
        It.prototype.destroy = function () {
            return Ht.apply(this, b(arguments))
        }
        ,
        It.prototype.setText = function (e) {
            return It.setData("text/plain", e),
            this
        }
        ,
        It.prototype.setHtml = function (e) {
            return It.setData("text/html", e),
            this
        }
        ,
        It.prototype.setRichText = function (e) {
            return It.setData("application/rtf", e),
            this
        }
        ,
        It.prototype.setData = function () {
            return It.setData.apply(this, b(arguments)),
            this
        }
        ,
        It.prototype.clearData = function () {
            return It.clearData.apply(this, b(arguments)),
            this
        }
        ,
        "function" == typeof define && define.amd ? define(function () {
            return It
        }) : "object" == typeof n && n && "object" == typeof n.exports && n.exports ? n.exports = It : e.ZeroClipboard = It
    }(function () {
        return this
    }())
});
