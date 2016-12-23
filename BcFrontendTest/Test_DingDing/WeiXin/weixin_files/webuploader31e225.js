define("webuploader.js", function (e, t, n) {
    !function (e, t) {
        var r, i = {}, o = function (e, t) {
            var n, r, i;
            if ("string" == typeof e)
                return u(e);
            for (n = [],
            r = e.length,
            i = 0; r > i; i++)
                n.push(u(e[i]));
            return t.apply(null, n)
        }, a = function (e, t, n) {
            2 === arguments.length && (n = t,
            t = null),
            o(t || [], function () {
                s(e, n, arguments)
            })
        }, s = function (e, t, n) {
            var r, a = {
                exports: t
            };
            "function" == typeof t && (n.length || (n = [o, a.exports, a]),
            r = t.apply(null, n),
            void 0 !== r && (a.exports = r)),
            i[e] = a.exports
        }, u = function (t) {
            var n = i[t] || e[t];
            if (!n)
                throw new Error("`" + t + "` is undefined");
            return n
        }, c = function (e) {
            var t, n, r, o, a, s;
            s = function (e) {
                return e && e.charAt(0).toUpperCase() + e.substr(1)
            }
            ;
            for (t in i)
                if (n = e,
                i.hasOwnProperty(t)) {
                    for (r = t.split("/"),
                    a = s(r.pop()) ; o = s(r.shift()) ;)
                        n[o] = n[o] || {},
                        n = n[o];
                    n[a] = i[t]
                }
            return e
        }, l = function (n) {
            return e.__dollar = n,
            c(t(e, a, o))
        };
        "object" == typeof n && "object" == typeof n.exports ? n.exports = l() : "function" == typeof define && define.amd ? define(["jquery"], l) : (r = e.WebUploader,
        e.WebUploader = l(),
        e.WebUploader.noConflict = function () {
            e.WebUploader = r
        }
        )
    }(window, function (e, t, n) {
        return t("dollar-third", [], function () {
            var t = e.__dollar || e.jQuery || e.Zepto;
            if (!t)
                throw new Error("jQuery or Zepto not found!");
            return t
        }),
        t("dollar", ["dollar-third"], function (e) {
            return e
        }),
        t("promise-third", ["dollar"], function (e) {
            return {
                Deferred: e.Deferred,
                when: e.when,
                isPromise: function (e) {
                    return e && "function" == typeof e.then
                }
            }
        }),
        t("promise", ["promise-third"], function (e) {
            return e
        }),
        t("base", ["dollar", "promise"], function (t, n) {
            function r(e) {
                return function () {
                    return s.apply(e, arguments)
                }
            }
            function i(e, t) {
                return function () {
                    return e.apply(t, arguments)
                }
            }
            function o(e) {
                var t;
                return Object.create ? Object.create(e) : (t = function () { }
                ,
                t.prototype = e,
                new t)
            }
            var a = function () { }
              , s = Function.call;
            return {
                version: "0.1.5",
                $: t,
                Deferred: n.Deferred,
                isPromise: n.isPromise,
                when: n.when,
                browser: function (e) {
                    var t = {}
                      , n = e.match(/WebKit\/([\d.]+)/)
                      , r = e.match(/Chrome\/([\d.]+)/) || e.match(/CriOS\/([\d.]+)/)
                      , i = e.match(/MSIE\s([\d\.]+)/) || e.match(/(?:trident)(?:.*rv:([\w.]+))?/i)
                      , o = e.match(/Firefox\/([\d.]+)/)
                      , a = e.match(/Safari\/([\d.]+)/)
                      , s = e.match(/OPR\/([\d.]+)/);
                    return n && (t.webkit = parseFloat(n[1])),
                    r && (t.chrome = parseFloat(r[1])),
                    i && (t.ie = parseFloat(i[1])),
                    o && (t.firefox = parseFloat(o[1])),
                    a && (t.safari = parseFloat(a[1])),
                    s && (t.opera = parseFloat(s[1])),
                    t
                }(navigator.userAgent),
                os: function (e) {
                    var t = {}
                      , n = e.match(/(?:Android);?[\s\/]+([\d.]+)?/)
                      , r = e.match(/(?:iPad|iPod|iPhone).*OS\s([\d_]+)/);
                    return n && (t.android = parseFloat(n[1])),
                    r && (t.ios = parseFloat(r[1].replace(/_/g, "."))),
                    t
                }(navigator.userAgent),
                inherits: function (e, n, r) {
                    var i;
                    return "function" == typeof n ? (i = n,
                    n = null) : i = n && n.hasOwnProperty("constructor") ? n.constructor : function () {
                        return e.apply(this, arguments)
                    }
                    ,
                    t.extend(!0, i, e, r || {}),
                    i.__super__ = e.prototype,
                    i.prototype = o(e.prototype),
                    n && t.extend(!0, i.prototype, n),
                    i
                },
                noop: a,
                bindFn: i,
                log: function () {
                    return e.console ? i(console.log, console) : a
                }(),
                nextTick: function () {
                    return function (e) {
                        setTimeout(e, 1)
                    }
                }(),
                slice: r([].slice),
                guid: function () {
                    var e = 0;
                    return function (t) {
                        for (var n = (+new Date).toString(32), r = 0; 5 > r; r++)
                            n += Math.floor(65535 * Math.random()).toString(32);
                        return (t || "wu_") + n + (e++).toString(32)
                    }
                }(),
                formatSize: function (e, t, n) {
                    var r;
                    for (n = n || ["B", "K", "M", "G", "TB"]; (r = n.shift()) && e > 1024;)
                        e /= 1024;
                    return ("B" === r ? e : e.toFixed(t || 2)) + r
                }
            }
        }),
        t("mediator", ["base"], function (e) {
            function t(e, t, n, r) {
                return o.grep(e, function (e) {
                    return !(!e || t && e.e !== t || n && e.cb !== n && e.cb._cb !== n || r && e.ctx !== r)
                })
            }
            function n(e, t, n) {
                o.each((e || "").split(s), function (e, r) {
                    n(r, t)
                })
            }
            function r(e, t) {
                for (var n, r = !1, i = -1, o = e.length; ++i < o;)
                    if (n = e[i],
                    n.cb.apply(n.ctx2, t) === !1) {
                        r = !0;
                        break
                    }
                return !r
            }
            var i, o = e.$, a = [].slice, s = /\s+/;
            return i = {
                on: function (e, t, r) {
                    var i, o = this;
                    return t ? (i = this._events || (this._events = []),
                    n(e, t, function (e, t) {
                        var n = {
                            e: e
                        };
                        n.cb = t,
                        n.ctx = r,
                        n.ctx2 = r || o,
                        n.id = i.length,
                        i.push(n)
                    }),
                    this) : this
                },
                once: function (e, t, r) {
                    var i = this;
                    return t ? (n(e, t, function (e, t) {
                        var n = function () {
                            return i.off(e, n),
                            t.apply(r || i, arguments)
                        };
                        n._cb = t,
                        i.on(e, n, r)
                    }),
                    i) : i
                },
                off: function (e, r, i) {
                    var a = this._events;
                    return a ? e || r || i ? (n(e, r, function (e, n) {
                        o.each(t(a, e, n, i), function () {
                            delete a[this.id]
                        })
                    }),
                    this) : (this._events = [],
                    this) : this
                },
                trigger: function (e) {
                    var n, i, o;
                    return this._events && e ? (n = a.call(arguments, 1),
                    i = t(this._events, e),
                    o = t(this._events, "all"),
                    r(i, n) && r(o, arguments)) : this
                }
            },
            o.extend({
                installTo: function (e) {
                    return o.extend(e, i)
                }
            }, i)
        }),
        t("uploader", ["base", "mediator"], function (e, t) {
            function n(e) {
                this.options = r.extend(!0, {}, n.options, e),
                this._init(this.options)
            }
            var r = e.$;
            return n.options = {},
            t.installTo(n.prototype),
            r.each({
                upload: "start-upload",
                stop: "stop-upload",
                getFile: "get-file",
                getFiles: "get-files",
                addFile: "add-file",
                addFiles: "add-file",
                sort: "sort-files",
                removeFile: "remove-file",
                cancelFile: "cancel-file",
                skipFile: "skip-file",
                retry: "retry",
                isInProgress: "is-in-progress",
                makeThumb: "make-thumb",
                md5File: "md5-file",
                getDimension: "get-dimension",
                addButton: "add-btn",
                predictRuntimeType: "predict-runtime-type",
                refresh: "refresh",
                disable: "disable",
                enable: "enable",
                reset: "reset"
            }, function (e, t) {
                n.prototype[e] = function () {
                    return this.request(t, arguments)
                }
            }),
            r.extend(n.prototype, {
                state: "pending",
                _init: function (e) {
                    var t = this;
                    t.request("init", e, function () {
                        t.state = "ready",
                        t.trigger("ready")
                    })
                },
                option: function (e, t) {
                    var n = this.options;
                    return arguments.length > 1 ? void (r.isPlainObject(t) && r.isPlainObject(n[e]) ? r.extend(n[e], t) : n[e] = t) : e ? n[e] : n
                },
                getStats: function () {
                    var e = this.request("get-stats");
                    return e ? {
                        successNum: e.numOfSuccess,
                        progressNum: e.numOfProgress,
                        cancelNum: e.numOfCancel,
                        invalidNum: e.numOfInvalid,
                        uploadFailNum: e.numOfUploadFailed,
                        queueNum: e.numOfQueue,
                        interruptNum: e.numofInterrupt
                    } : {}
                },
                trigger: function (e) {
                    var n = [].slice.call(arguments, 1)
                      , i = this.options
                      , o = "on" + e.substring(0, 1).toUpperCase() + e.substring(1);
                    return t.trigger.apply(this, arguments) === !1 || r.isFunction(i[o]) && i[o].apply(this, n) === !1 || r.isFunction(this[o]) && this[o].apply(this, n) === !1 || t.trigger.apply(t, [this, e].concat(n)) === !1 ? !1 : !0
                },
                destroy: function () {
                    this.request("destroy", arguments),
                    this.off()
                },
                request: e.noop
            }),
            e.create = n.create = function (e) {
                return new n(e)
            }
            ,
            e.Uploader = n,
            n
        }),
        t("runtime/runtime", ["base", "mediator"], function (e, t) {
            function n(t) {
                this.options = r.extend({
                    container: document.body
                }, t),
                this.uid = e.guid("rt_")
            }
            var r = e.$
              , i = {}
              , o = function (e) {
                  for (var t in e)
                      if (e.hasOwnProperty(t))
                          return t;
                  return null
              };
            return r.extend(n.prototype, {
                getContainer: function () {
                    var e, t, n = this.options;
                    return this._container ? this._container : (e = r(n.container || document.body),
                    t = r(document.createElement("div")),
                    t.attr("id", "rt_" + this.uid),
                    t.css({
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        width: "1px",
                        height: "1px",
                        overflow: "hidden"
                    }),
                    e.append(t),
                    e.addClass("webuploader-container"),
                    this._container = t,
                    this._parent = e,
                    t)
                },
                init: e.noop,
                exec: e.noop,
                destroy: function () {
                    this._container && this._container.remove(),
                    this._parent && this._parent.removeClass("webuploader-container"),
                    this.off()
                }
            }),
            n.orders = "html5,flash",
            n.addRuntime = function (e, t) {
                i[e] = t
            }
            ,
            n.hasRuntime = function (e) {
                return !!(e ? i[e] : o(i))
            }
            ,
            n.create = function (e, t) {
                var a, s;
                if (t = t || n.orders,
                r.each(t.split(/\s*,\s*/g), function () {
                    return i[this] ? (a = this,
                    !1) : void 0
                }),
                a = a || o(i),
                !a)
                    throw new Error("Runtime Error");
                return s = new i[a](e)
            }
            ,
            t.installTo(n.prototype),
            n
        }),
        t("runtime/client", ["base", "mediator", "runtime/runtime"], function (e, t, n) {
            function r(t, r) {
                var o, a = e.Deferred();
                this.uid = e.guid("client_"),
                this.runtimeReady = function (e) {
                    return a.done(e)
                }
                ,
                this.connectRuntime = function (t, s) {
                    if (o)
                        throw new Error("already connected!");
                    return a.done(s),
                    "string" == typeof t && i.get(t) && (o = i.get(t)),
                    o = o || i.get(null, r),
                    o ? (e.$.extend(o.options, t),
                    o.__promise.then(a.resolve),
                    o.__client++) : (o = n.create(t, t.runtimeOrder),
                    o.__promise = a.promise(),
                    o.once("ready", a.resolve),
                    o.init(),
                    i.add(o),
                    o.__client = 1),
                    r && (o.__standalone = r),
                    o
                }
                ,
                this.getRuntime = function () {
                    return o
                }
                ,
                this.disconnectRuntime = function () {
                    o && (o.__client--,
                    o.__client <= 0 && (i.remove(o),
                    delete o.__promise,
                    o.destroy()),
                    o = null)
                }
                ,
                this.exec = function () {
                    if (o) {
                        var n = e.slice(arguments);
                        return t && n.unshift(t),
                        o.exec.apply(this, n)
                    }
                }
                ,
                this.getRuid = function () {
                    return o && o.uid
                }
                ,
                this.destroy = function (e) {
                    return function () {
                        e && e.apply(this, arguments),
                        this.trigger("destroy"),
                        this.off(),
                        this.exec("destroy"),
                        this.disconnectRuntime()
                    }
                }(this.destroy)
            }
            var i;
            return i = function () {
                var e = {};
                return {
                    add: function (t) {
                        e[t.uid] = t
                    },
                    get: function (t, n) {
                        var r;
                        if (t)
                            return e[t];
                        for (r in e)
                            if (!n || !e[r].__standalone)
                                return e[r];
                        return null
                    },
                    remove: function (t) {
                        delete e[t.uid]
                    }
                }
            }(),
            t.installTo(r.prototype),
            r
        }),
        t("lib/dnd", ["base", "mediator", "runtime/client"], function (e, t, n) {
            function r(e) {
                e = this.options = i.extend({}, r.options, e),
                e.container = i(e.container),
                e.container.length && n.call(this, "DragAndDrop")
            }
            var i = e.$;
            return r.options = {
                accept: null,
                disableGlobalDnd: !1
            },
            e.inherits(n, {
                constructor: r,
                init: function () {
                    var e = this;
                    e.connectRuntime(e.options, function () {
                        e.exec("init"),
                        e.trigger("ready")
                    })
                }
            }),
            t.installTo(r.prototype),
            r
        }),
        t("widgets/widget", ["base", "uploader"], function (e, t) {
            function n(e) {
                if (!e)
                    return !1;
                var t = e.length
                  , n = i.type(e);
                return 1 === e.nodeType && t ? !0 : "array" === n || "function" !== n && "string" !== n && (0 === t || "number" == typeof t && t > 0 && t - 1 in e)
            }
            function r(e) {
                this.owner = e,
                this.options = e.options
            }
            var i = e.$
              , o = t.prototype._init
              , a = t.prototype.destroy
              , s = {}
              , u = [];
            return i.extend(r.prototype, {
                init: e.noop,
                invoke: function (e, t) {
                    var n = this.responseMap;
                    return n && e in n && n[e] in this && i.isFunction(this[n[e]]) ? this[n[e]].apply(this, t) : s
                },
                request: function () {
                    return this.owner.request.apply(this.owner, arguments)
                }
            }),
            i.extend(t.prototype, {
                _init: function () {
                    var e = this
                      , t = e._widgets = []
                      , n = e.options.disableWidgets || "";
                    return i.each(u, function (r, i) {
                        (!n || !~n.indexOf(i._name)) && t.push(new i(e))
                    }),
                    o.apply(e, arguments)
                },
                request: function (t, r, i) {
                    var o, a, u, c, l = 0, f = this._widgets, d = f && f.length, h = [], p = [];
                    for (r = n(r) ? r : [r]; d > l; l++)
                        o = f[l],
                        a = o.invoke(t, r),
                        a !== s && (e.isPromise(a) ? p.push(a) : h.push(a));
                    return i || p.length ? (u = e.when.apply(e, p),
                    c = u.pipe ? "pipe" : "then",
                    u[c](function () {
                        var t = e.Deferred()
                          , n = arguments;
                        return 1 === n.length && (n = n[0]),
                        setTimeout(function () {
                            t.resolve(n)
                        }, 1),
                        t.promise()
                    })[i ? c : "done"](i || e.noop)) : h[0]
                },
                destroy: function () {
                    a.apply(this, arguments),
                    this._widgets = null
                }
            }),
            t.register = r.register = function (t, n) {
                var o, a = {
                    init: "init",
                    destroy: "destroy",
                    name: "anonymous"
                };
                return 1 === arguments.length ? (n = t,
                i.each(n, function (e) {
                    return "_" === e[0] || "name" === e ? void ("name" === e && (a.name = n.name)) : void (a[e.replace(/[A-Z]/g, "-$&").toLowerCase()] = e)
                })) : a = i.extend(a, t),
                n.responseMap = a,
                o = e.inherits(r, n),
                o._name = a.name,
                u.push(o),
                o
            }
            ,
            t.unRegister = r.unRegister = function (e) {
                if (e && "anonymous" !== e)
                    for (var t = u.length; t--;)
                        u[t]._name === e && u.splice(t, 1)
            }
            ,
            r
        }),
        t("widgets/filednd", ["base", "uploader", "lib/dnd", "widgets/widget"], function (e, t, n) {
            var r = e.$;
            return t.options.dnd = "",
            t.register({
                name: "dnd",
                init: function (t) {
                    if (t.dnd && "html5" === this.request("predict-runtime-type")) {
                        var i, o = this, a = e.Deferred(), s = r.extend({}, {
                            disableGlobalDnd: t.disableGlobalDnd,
                            container: t.dnd,
                            accept: t.accept
                        });
                        return this.dnd = i = new n(s),
                        i.once("ready", a.resolve),
                        i.on("drop", function (e) {
                            o.request("add-file", [e])
                        }),
                        i.on("accept", function (e) {
                            return o.owner.trigger("dndAccept", e)
                        }),
                        i.init(),
                        a.promise()
                    }
                },
                destroy: function () {
                    this.dnd && this.dnd.destroy()
                }
            })
        }),
        t("lib/filepaste", ["base", "mediator", "runtime/client"], function (e, t, n) {
            function r(e) {
                e = this.options = i.extend({}, e),
                e.container = i(e.container || document.body),
                n.call(this, "FilePaste")
            }
            var i = e.$;
            return e.inherits(n, {
                constructor: r,
                init: function () {
                    var e = this;
                    e.connectRuntime(e.options, function () {
                        e.exec("init"),
                        e.trigger("ready")
                    })
                }
            }),
            t.installTo(r.prototype),
            r
        }),
        t("widgets/filepaste", ["base", "uploader", "lib/filepaste", "widgets/widget"], function (e, t, n) {
            var r = e.$;
            return t.register({
                name: "paste",
                init: function (t) {
                    if (t.paste && "html5" === this.request("predict-runtime-type")) {
                        var i, o = this, a = e.Deferred(), s = r.extend({}, {
                            container: t.paste,
                            accept: t.accept
                        });
                        return this.paste = i = new n(s),
                        i.once("ready", a.resolve),
                        i.on("paste", function (e) {
                            o.owner.request("add-file", [e])
                        }),
                        i.init(),
                        a.promise()
                    }
                },
                destroy: function () {
                    this.paste && this.paste.destroy()
                }
            })
        }),
        t("lib/blob", ["base", "runtime/client"], function (e, t) {
            function n(e, n) {
                var r = this;
                r.source = n,
                r.ruid = e,
                this.size = n.size || 0,
                this.type = !n.type && this.ext && ~"jpg,jpeg,png,gif,bmp".indexOf(this.ext) ? "image/" + ("jpg" === this.ext ? "jpeg" : this.ext) : n.type || "application/octet-stream",
                t.call(r, "Blob"),
                this.uid = n.uid || this.uid,
                e && r.connectRuntime(e)
            }
            return e.inherits(t, {
                constructor: n,
                slice: function (e, t) {
                    return this.exec("slice", e, t)
                },
                getSource: function () {
                    return this.source
                }
            }),
            n
        }),
        t("lib/file", ["base", "lib/blob"], function (e, t) {
            function n(e, n) {
                var o;
                this.name = n.name || "untitled" + r++,
                o = i.exec(n.name) ? RegExp.$1.toLowerCase() : "",
                !o && n.type && (o = /\/(jpg|jpeg|png|gif|bmp)$/i.exec(n.type) ? RegExp.$1.toLowerCase() : "",
                this.name += "." + o),
                this.ext = o,
                this.lastModifiedDate = n.lastModifiedDate || (new Date).toLocaleString(),
                t.apply(this, arguments)
            }
            var r = 1
              , i = /\.([^.]+)$/;
            return e.inherits(t, n)
        }),
        t("lib/filepicker", ["base", "runtime/client", "lib/file"], function (t, n, r) {
            function i(e) {
                if (e = this.options = o.extend({}, i.options, e),
                e.container = o(e.id),
                !e.container.length)
                    throw new Error("按钮指定错误");
                e.innerHTML = e.innerHTML || e.label || e.container.html() || "",
                e.button = o(e.button || document.createElement("div")),
                e.button.html(e.innerHTML),
                e.container.html(e.button),
                n.call(this, "FilePicker", !0)
            }
            var o = t.$;
            return i.options = {
                button: null,
                container: null,
                label: null,
                innerHTML: null,
                multiple: !0,
                accept: null,
                name: "file"
            },
            t.inherits(n, {
                constructor: i,
                init: function () {
                    var n = this
                      , i = n.options
                      , a = i.button;
                    a.addClass("webuploader-pick"),
                    n.on("all", function (e) {
                        var t;
                        switch (e) {
                            case "mouseenter":
                                a.addClass("webuploader-pick-hover");
                                break;
                            case "mouseleave":
                                a.removeClass("webuploader-pick-hover");
                                break;
                            case "change":
                                t = n.exec("getFiles"),
                                n.trigger("select", o.map(t, function (e) {
                                    return e = new r(n.getRuid(), e),
                                    e._refer = i.container,
                                    e
                                }), i.container)
                        }
                    }),
                    n.connectRuntime(i, function () {
                        n.refresh(),
                        n.exec("init", i),
                        n.trigger("ready")
                    }),
                    this._resizeHandler = t.bindFn(this.refresh, this),
                    o(e).on("resize", this._resizeHandler)
                },
                refresh: function () {
                    var e = this.getRuntime().getContainer()
                      , t = this.options.button
                      , n = t.outerWidth ? t.outerWidth() : t.width()
                      , r = t.outerHeight ? t.outerHeight() : t.height()
                      , i = t.offset();
                    n && r && e.css({
                        bottom: "auto",
                        right: "auto",
                        width: n + "px",
                        height: r + "px"
                    }).offset(i)
                },
                enable: function () {
                    var e = this.options.button;
                    e.removeClass("webuploader-pick-disable"),
                    this.refresh()
                },
                disable: function () {
                    var e = this.options.button;
                    this.getRuntime().getContainer().css({
                        top: "-99999px"
                    }),
                    e.addClass("webuploader-pick-disable")
                },
                destroy: function () {
                    var t = this.options.button;
                    o(e).off("resize", this._resizeHandler),
                    t.removeClass("webuploader-pick-disable webuploader-pick-hover webuploader-pick")
                }
            }),
            i
        }),
        t("widgets/filepicker", ["base", "uploader", "lib/filepicker", "widgets/widget"], function (e, t, n) {
            var r = e.$;
            return r.extend(t.options, {
                pick: null,
                accept: null
            }),
            t.register({
                name: "picker",
                init: function (e) {
                    return this.pickers = [],
                    e.pick && this.addBtn(e.pick)
                },
                refresh: function () {
                    r.each(this.pickers, function () {
                        this.refresh()
                    })
                },
                addBtn: function (t) {
                    var i = this
                      , o = i.options
                      , a = o.accept
                      , s = [];
                    return t ? (r.isPlainObject(t) || (t = {
                        id: t
                    }),
                    r(t.id).each(function () {
                        var u, c, l;
                        l = e.Deferred(),
                        u = r.extend({}, t, {
                            accept: r.isPlainObject(a) ? [a] : a,
                            swf: o.swf,
                            runtimeOrder: o.runtimeOrder,
                            id: this
                        }),
                        c = new n(u),
                        c.once("ready", l.resolve),
                        c.on("select", function (e) {
                            i.owner.request("add-file", [e])
                        }),
                        c.init(),
                        i.pickers.push(c),
                        s.push(l.promise())
                    }),
                    e.when.apply(e, s)) : void 0
                },
                disable: function () {
                    r.each(this.pickers, function () {
                        this.disable()
                    })
                },
                enable: function () {
                    r.each(this.pickers, function () {
                        this.enable()
                    })
                },
                destroy: function () {
                    r.each(this.pickers, function () {
                        this.destroy()
                    }),
                    this.pickers = null
                }
            })
        }),
        t("lib/image", ["base", "runtime/client", "lib/blob"], function (e, t, n) {
            function r(e) {
                this.options = i.extend({}, r.options, e),
                t.call(this, "Image"),
                this.on("load", function () {
                    this._info = this.exec("info"),
                    this._meta = this.exec("meta")
                })
            }
            var i = e.$;
            return r.options = {
                quality: 90,
                crop: !1,
                preserveHeaders: !1,
                allowMagnify: !1
            },
            e.inherits(t, {
                constructor: r,
                info: function (e) {
                    return e ? (this._info = e,
                    this) : this._info
                },
                meta: function (e) {
                    return e ? (this._meta = e,
                    this) : this._meta
                },
                loadFromBlob: function (e) {
                    var t = this
                      , n = e.getRuid();
                    this.connectRuntime(n, function () {
                        t.exec("init", t.options),
                        t.exec("loadFromBlob", e)
                    })
                },
                resize: function () {
                    var t = e.slice(arguments);
                    return this.exec.apply(this, ["resize"].concat(t))
                },
                crop: function () {
                    var t = e.slice(arguments);
                    return this.exec.apply(this, ["crop"].concat(t))
                },
                getAsDataUrl: function (e) {
                    return this.exec("getAsDataUrl", e)
                },
                getAsBlob: function (e) {
                    var t = this.exec("getAsBlob", e);
                    return new n(this.getRuid(), t)
                }
            }),
            r
        }),
        t("widgets/image", ["base", "uploader", "lib/image", "widgets/widget"], function (e, t, n) {
            var r, i = e.$;
            return r = function (e) {
                var t = 0
                  , n = []
                  , r = function () {
                      for (var r; n.length && e > t;)
                          r = n.shift(),
                          t += r[0],
                          r[1]()
                  };
                return function (e, i, o) {
                    n.push([i, o]),
                    e.once("destroy", function () {
                        t -= i,
                        setTimeout(r, 1)
                    }),
                    setTimeout(r, 1)
                }
            }(5242880),
            i.extend(t.options, {
                thumb: {
                    width: 110,
                    height: 110,
                    quality: 70,
                    allowMagnify: !0,
                    crop: !0,
                    preserveHeaders: !1,
                    type: "image/jpeg"
                },
                compress: {
                    width: 1600,
                    height: 1600,
                    quality: 90,
                    allowMagnify: !1,
                    crop: !1,
                    preserveHeaders: !0
                }
            }),
            t.register({
                name: "image",
                makeThumb: function (e, t, o, a) {
                    var s, u;
                    return e = this.request("get-file", e),
                    e.type.match(/^image/) ? (s = i.extend({}, this.options.thumb),
                    i.isPlainObject(o) && (s = i.extend(s, o),
                    o = null),
                    o = o || s.width,
                    a = a || s.height,
                    u = new n(s),
                    u.once("load", function () {
                        e._info = e._info || u.info(),
                        e._meta = e._meta || u.meta(),
                        1 >= o && o > 0 && (o = e._info.width * o),
                        1 >= a && a > 0 && (a = e._info.height * a),
                        u.resize(o, a)
                    }),
                    u.once("complete", function () {
                        t(!1, u.getAsDataUrl(s.type)),
                        u.destroy()
                    }),
                    u.once("error", function (e) {
                        t(e || !0),
                        u.destroy()
                    }),
                    void r(u, e.source.size, function () {
                        e._info && u.info(e._info),
                        e._meta && u.meta(e._meta),
                        u.loadFromBlob(e.source)
                    })) : void t(!0)
                },
                beforeSendFile: function (t) {
                    var r, o, a = this.options.compress || this.options.resize, s = a && a.compressSize || 0, u = a && a.noCompressIfLarger || !1;
                    return t = this.request("get-file", t),
                    !a || !~"image/jpeg,image/jpg".indexOf(t.type) || t.size < s || t._compressed ? void 0 : (a = i.extend({}, a),
                    o = e.Deferred(),
                    r = new n(a),
                    o.always(function () {
                        r.destroy(),
                        r = null
                    }),
                    r.once("error", o.reject),
                    r.once("load", function () {
                        var e = a.width
                          , n = a.height;
                        t._info = t._info || r.info(),
                        t._meta = t._meta || r.meta(),
                        1 >= e && e > 0 && (e = t._info.width * e),
                        1 >= n && n > 0 && (n = t._info.height * n),
                        r.resize(e, n)
                    }),
                    r.once("complete", function () {
                        var e, n;
                        try {
                            e = r.getAsBlob(a.type),
                            n = t.size,
                            (!u || e.size < n) && (t.source = e,
                            t.size = e.size,
                            t.trigger("resize", e.size, n)),
                            t._compressed = !0,
                            o.resolve()
                        } catch (i) {
                            o.resolve()
                        }
                    }),
                    t._info && r.info(t._info),
                    t._meta && r.meta(t._meta),
                    r.loadFromBlob(t.source),
                    o.promise())
                }
            })
        }),
        t("file", ["base", "mediator"], function (e, t) {
            function n() {
                return o + a++
            }
            function r(e) {
                this.name = e.name || "Untitled",
                this.size = e.size || 0,
                this.type = e.type || "application/octet-stream",
                this.lastModifiedDate = e.lastModifiedDate || 1 * new Date,
                this.id = n(),
                this.ext = s.exec(this.name) ? RegExp.$1 : "",
                this.statusText = "",
                u[this.id] = r.Status.INITED,
                this.source = e,
                this.loaded = 0,
                this.on("error", function (e) {
                    this.setStatus(r.Status.ERROR, e)
                })
            }
            var i = e.$
              , o = "WU_FILE_"
              , a = 0
              , s = /\.([^.]+)$/
              , u = {};
            return i.extend(r.prototype, {
                setStatus: function (e, t) {
                    var n = u[this.id];
                    "undefined" != typeof t && (this.statusText = t),
                    e !== n && (u[this.id] = e,
                    this.trigger("statuschange", e, n))
                },
                getStatus: function () {
                    return u[this.id]
                },
                getSource: function () {
                    return this.source
                },
                destroy: function () {
                    this.off(),
                    delete u[this.id]
                }
            }),
            t.installTo(r.prototype),
            r.Status = {
                INITED: "inited",
                QUEUED: "queued",
                PROGRESS: "progress",
                ERROR: "error",
                COMPLETE: "complete",
                CANCELLED: "cancelled",
                INTERRUPT: "interrupt",
                INVALID: "invalid"
            },
            r
        }),
        t("queue", ["base", "mediator", "file"], function (e, t, n) {
            function r() {
                this.stats = {
                    numOfQueue: 0,
                    numOfSuccess: 0,
                    numOfCancel: 0,
                    numOfProgress: 0,
                    numOfUploadFailed: 0,
                    numOfInvalid: 0,
                    numofDeleted: 0,
                    numofInterrupt: 0
                },
                this._queue = [],
                this._map = {}
            }
            var i = e.$
              , o = n.Status;
            return i.extend(r.prototype, {
                append: function (e) {
                    return this._queue.push(e),
                    this._fileAdded(e),
                    this
                },
                prepend: function (e) {
                    return this._queue.unshift(e),
                    this._fileAdded(e),
                    this
                },
                getFile: function (e) {
                    return "string" != typeof e ? e : this._map[e]
                },
                fetch: function (e) {
                    var t, n, r = this._queue.length;
                    for (e = e || o.QUEUED,
                    t = 0; r > t; t++)
                        if (n = this._queue[t],
                        e === n.getStatus())
                            return n;
                    return null
                },
                sort: function (e) {
                    "function" == typeof e && this._queue.sort(e)
                },
                getFiles: function () {
                    for (var e, t = [].slice.call(arguments, 0), n = [], r = 0, o = this._queue.length; o > r; r++)
                        e = this._queue[r],
                        (!t.length || ~i.inArray(e.getStatus(), t)) && n.push(e);
                    return n
                },
                removeFile: function (e) {
                    var t = this._map[e.id];
                    t && (delete this._map[e.id],
                    e.destroy(),
                    this.stats.numofDeleted++)
                },
                _fileAdded: function (e) {
                    var t = this
                      , n = this._map[e.id];
                    n || (this._map[e.id] = e,
                    e.on("statuschange", function (e, n) {
                        t._onFileStatusChange(e, n)
                    }))
                },
                _onFileStatusChange: function (e, t) {
                    var n = this.stats;
                    switch (t) {
                        case o.PROGRESS:
                            n.numOfProgress--;
                            break;
                        case o.QUEUED:
                            n.numOfQueue--;
                            break;
                        case o.ERROR:
                            n.numOfUploadFailed--;
                            break;
                        case o.INVALID:
                            n.numOfInvalid--;
                            break;
                        case o.INTERRUPT:
                            n.numofInterrupt--
                    }
                    switch (e) {
                        case o.QUEUED:
                            n.numOfQueue++;
                            break;
                        case o.PROGRESS:
                            n.numOfProgress++;
                            break;
                        case o.ERROR:
                            n.numOfUploadFailed++;
                            break;
                        case o.COMPLETE:
                            n.numOfSuccess++;
                            break;
                        case o.CANCELLED:
                            n.numOfCancel++;
                            break;
                        case o.INVALID:
                            n.numOfInvalid++;
                            break;
                        case o.INTERRUPT:
                            n.numofInterrupt++
                    }
                }
            }),
            t.installTo(r.prototype),
            r
        }),
        t("widgets/queue", ["base", "uploader", "queue", "file", "lib/file", "runtime/client", "widgets/widget"], function (e, t, n, r, i, o) {
            var a = e.$
              , s = /\.\w+$/
              , u = r.Status;
            return t.register({
                name: "queue",
                init: function (t) {
                    var r, i, s, u, c, l, f, d = this;
                    if (a.isPlainObject(t.accept) && (t.accept = [t.accept]),
                    t.accept) {
                        for (c = [],
                        s = 0,
                        i = t.accept.length; i > s; s++)
                            u = t.accept[s].extensions,
                            u && c.push(u);
                        c.length && (l = "\\." + c.join(",").replace(/,/g, "$|\\.").replace(/\*/g, ".*") + "$"),
                        d.accept = new RegExp(l, "i")
                    }
                    return d.queue = new n,
                    d.stats = d.queue.stats,
                    "html5" === this.request("predict-runtime-type") ? (r = e.Deferred(),
                    this.placeholder = f = new o("Placeholder"),
                    f.connectRuntime({
                        runtimeOrder: "html5"
                    }, function () {
                        d._ruid = f.getRuid(),
                        r.resolve()
                    }),
                    r.promise()) : void 0
                },
                _wrapFile: function (e) {
                    if (!(e instanceof r)) {
                        if (!(e instanceof i)) {
                            if (!this._ruid)
                                throw new Error("Can't add external files.");
                            e = new i(this._ruid, e)
                        }
                        e = new r(e)
                    }
                    return e
                },
                acceptFile: function (e) {
                    var t = !e || !e.size || this.accept && s.exec(e.name) && !this.accept.test(e.name);
                    return !t
                },
                _addFile: function (e) {
                    var t = this;
                    return e = t._wrapFile(e),
                    t.owner.trigger("beforeFileQueued", e) ? t.acceptFile(e) ? (t.queue.append(e),
                    t.owner.trigger("fileQueued", e),
                    e) : void t.owner.trigger("error", "Q_TYPE_DENIED", e) : void 0
                },
                getFile: function (e) {
                    return this.queue.getFile(e)
                },
                addFile: function (e) {
                    var t = this;
                    e.length || (e = [e]),
                    e = a.map(e, function (e) {
                        return t._addFile(e)
                    }),
                    t.owner.trigger("filesQueued", e),
                    t.options.auto && setTimeout(function () {
                        t.request("start-upload")
                    }, 20)
                },
                getStats: function () {
                    return this.stats
                },
                removeFile: function (e, t) {
                    var n = this;
                    e = e.id ? e : n.queue.getFile(e),
                    this.request("cancel-file", e),
                    t && this.queue.removeFile(e)
                },
                getFiles: function () {
                    return this.queue.getFiles.apply(this.queue, arguments)
                },
                fetchFile: function () {
                    return this.queue.fetch.apply(this.queue, arguments)
                },
                retry: function (e, t) {
                    var n, r, i, o = this;
                    if (e)
                        return e = e.id ? e : o.queue.getFile(e),
                        e.setStatus(u.QUEUED),
                        void (t || o.request("start-upload"));
                    for (n = o.queue.getFiles(u.ERROR),
                    r = 0,
                    i = n.length; i > r; r++)
                        e = n[r],
                        e.setStatus(u.QUEUED);
                    o.request("start-upload")
                },
                sortFiles: function () {
                    return this.queue.sort.apply(this.queue, arguments)
                },
                reset: function () {
                    this.owner.trigger("reset"),
                    this.queue = new n,
                    this.stats = this.queue.stats
                },
                destroy: function () {
                    this.reset(),
                    this.placeholder && this.placeholder.destroy()
                }
            })
        }),
        t("widgets/runtime", ["uploader", "runtime/runtime", "widgets/widget"], function (e, t) {
            return e.support = function () {
                return t.hasRuntime.apply(t, arguments)
            }
            ,
            e.register({
                name: "runtime",
                init: function () {
                    if (!this.predictRuntimeType())
                        throw Error("Runtime Error")
                },
                predictRuntimeType: function () {
                    var e, n, r = this.options.runtimeOrder || t.orders, i = this.type;
                    if (!i)
                        for (r = r.split(/\s*,\s*/g),
                        e = 0,
                        n = r.length; n > e; e++)
                            if (t.hasRuntime(r[e])) {
                                this.type = i = r[e];
                                break
                            }
                    return i
                }
            })
        }),
        t("lib/transport", ["base", "runtime/client", "mediator"], function (e, t, n) {
            function r(e) {
                var n = this;
                e = n.options = i.extend(!0, {}, r.options, e || {}),
                t.call(this, "Transport"),
                this._blob = null,
                this._formData = e.formData || {},
                this._headers = e.headers || {},
                this.on("progress", this._timeout),
                this.on("load error", function () {
                    n.trigger("progress", 1),
                    clearTimeout(n._timer)
                })
            }
            var i = e.$;
            return r.options = {
                server: "",
                method: "POST",
                withCredentials: !1,
                fileVal: "file",
                timeout: 12e4,
                formData: {},
                headers: {},
                sendAsBinary: !1
            },
            i.extend(r.prototype, {
                appendBlob: function (e, t, n) {
                    var r = this
                      , i = r.options;
                    r.getRuid() && r.disconnectRuntime(),
                    r.connectRuntime(t.ruid, function () {
                        r.exec("init")
                    }),
                    r._blob = t,
                    i.fileVal = e || i.fileVal,
                    i.filename = n || i.filename
                },
                append: function (e, t) {
                    "object" == typeof e ? i.extend(this._formData, e) : this._formData[e] = t
                },
                setRequestHeader: function (e, t) {
                    "object" == typeof e ? i.extend(this._headers, e) : this._headers[e] = t
                },
                send: function (e) {
                    this.exec("send", e),
                    this._timeout()
                },
                abort: function () {
                    return clearTimeout(this._timer),
                    this.exec("abort")
                },
                destroy: function () {
                    this.trigger("destroy"),
                    this.off(),
                    this.exec("destroy"),
                    this.disconnectRuntime()
                },
                getResponse: function () {
                    return this.exec("getResponse")
                },
                getResponseAsJson: function () {
                    return this.exec("getResponseAsJson")
                },
                getStatus: function () {
                    return this.exec("getStatus")
                },
                _timeout: function () {
                    var e = this
                      , t = e.options.timeout;
                    t && (clearTimeout(e._timer),
                    e._timer = setTimeout(function () {
                        e.abort(),
                        e.trigger("error", "timeout")
                    }, t))
                }
            }),
            n.installTo(r.prototype),
            r
        }),
        t("widgets/upload", ["base", "uploader", "file", "lib/transport", "widgets/widget"], function (e, t, n, r) {
            function i(e, t) {
                var n, r, i = [], o = e.source, a = o.size, s = t ? Math.ceil(a / t) : 1, u = 0, c = 0;
                for (r = {
                    file: e,
                    has: function () {
                        return !!i.length
                },
                    shift: function () {
                        return i.shift()
                },
                    unshift: function (e) {
                        i.unshift(e)
                }
                }; s > c;)
                    n = Math.min(t, a - u),
                    i.push({
                        file: e,
                        start: u,
                        end: t ? u + n : a,
                        total: a,
                        chunks: s,
                        chunk: c++,
                        cuted: r
                    }),
                    u += n;
                return e.blocks = i.concat(),
                e.remaning = i.length,
                r
            }
            var o = e.$
              , a = e.isPromise
              , s = n.Status;
            o.extend(t.options, {
                prepareNextFile: !1,
                chunked: !1,
                chunkSize: 5242880,
                chunkRetry: 2,
                threads: 3,
                formData: {}
            }),
            t.register({
                name: "upload",
                init: function () {
                    var t = this.owner
                      , n = this;
                    this.runing = !1,
                    this.progress = !1,
                    t.on("startUpload", function () {
                        n.progress = !0
                    }).on("uploadFinished", function () {
                        n.progress = !1
                    }),
                    this.pool = [],
                    this.stack = [],
                    this.pending = [],
                    this.remaning = 0,
                    this.__tick = e.bindFn(this._tick, this),
                    t.on("uploadComplete", function (e) {
                        e.blocks && o.each(e.blocks, function (e, t) {
                            t.transport && (t.transport.abort(),
                            t.transport.destroy()),
                            delete t.transport
                        }),
                        delete e.blocks,
                        delete e.remaning
                    })
                },
                reset: function () {
                    this.request("stop-upload", !0),
                    this.runing = !1,
                    this.pool = [],
                    this.stack = [],
                    this.pending = [],
                    this.remaning = 0,
                    this._trigged = !1,
                    this._promise = null
                },
                startUpload: function (t) {
                    var n = this;
                    if (o.each(n.request("get-files", s.INVALID), function () {
                        n.request("remove-file", this)
                    }),
                    t)
                        if (t = t.id ? t : n.request("get-file", t),
                        t.getStatus() === s.INTERRUPT)
                            o.each(n.pool, function (e, n) {
                                n.file === t && n.transport && n.transport.send()
                            }),
                            t.setStatus(s.QUEUED);
                        else {
                            if (t.getStatus() === s.PROGRESS)
                                return;
                            t.setStatus(s.QUEUED)
                        }
                    else
                        o.each(n.request("get-files", [s.INITED]), function () {
                            this.setStatus(s.QUEUED)
                        });
                    if (!n.runing) {
                        n.runing = !0;
                        var r = [];
                        o.each(n.pool, function (e, t) {
                            var i = t.file;
                            i.getStatus() === s.INTERRUPT && (r.push(i),
                            n._trigged = !1,
                            t.transport && t.transport.send())
                        });
                        for (var t; t = r.shift() ;)
                            t.setStatus(s.PROGRESS);
                        t || o.each(n.request("get-files", s.INTERRUPT), function () {
                            this.setStatus(s.PROGRESS)
                        }),
                        n._trigged = !1,
                        e.nextTick(n.__tick),
                        n.owner.trigger("startUpload")
                    }
                },
                stopUpload: function (t, n) {
                    var r = this;
                    if (t === !0 && (n = t,
                    t = null),
                    r.runing !== !1) {
                        if (t) {
                            if (t = t.id ? t : r.request("get-file", t),
                            t.getStatus() !== s.PROGRESS && t.getStatus() !== s.QUEUED)
                                return;
                            return t.setStatus(s.INTERRUPT),
                            o.each(r.pool, function (e, n) {
                                n.file === t && (n.transport && n.transport.abort(),
                                r._putback(n),
                                r._popBlock(n))
                            }),
                            e.nextTick(r.__tick)
                        }
                        r.runing = !1,
                        this._promise && this._promise.file && this._promise.file.setStatus(s.INTERRUPT),
                        n && o.each(r.pool, function (e, t) {
                            t.transport && t.transport.abort(),
                            t.file.setStatus(s.INTERRUPT)
                        }),
                        r.owner.trigger("stopUpload")
                    }
                },
                cancelFile: function (e) {
                    e = e.id ? e : this.request("get-file", e),
                    e.blocks && o.each(e.blocks, function (e, t) {
                        var n = t.transport;
                        n && (n.abort(),
                        n.destroy(),
                        delete t.transport)
                    }),
                    e.setStatus(s.CANCELLED),
                    this.owner.trigger("fileDequeued", e)
                },
                isInProgress: function () {
                    return !!this.progress
                },
                _getStats: function () {
                    return this.request("get-stats")
                },
                skipFile: function (e, t) {
                    e = e.id ? e : this.request("get-file", e),
                    e.setStatus(t || s.COMPLETE),
                    e.skipped = !0,
                    e.blocks && o.each(e.blocks, function (e, t) {
                        var n = t.transport;
                        n && (n.abort(),
                        n.destroy(),
                        delete t.transport)
                    }),
                    this.owner.trigger("uploadSkip", e)
                },
                _tick: function () {
                    var t, n, r = this, i = r.options;
                    return r._promise ? r._promise.always(r.__tick) : void (r.pool.length < i.threads && (n = r._nextBlock()) ? (r._trigged = !1,
                    t = function (t) {
                        r._promise = null,
                        t && t.file && r._startSend(t),
                        e.nextTick(r.__tick)
                    }
                    ,
                    r._promise = a(n) ? n.always(t) : t(n)) : r.remaning || r._getStats().numOfQueue || r._getStats().numofInterrupt || (r.runing = !1,
                    r._trigged || e.nextTick(function () {
                        r.owner.trigger("uploadFinished")
                    }),
                    r._trigged = !0))
                },
                _putback: function (e) {
                    var t;
                    e.cuted.unshift(e),
                    t = this.stack.indexOf(e.cuted),
                    ~t || this.stack.unshift(e.cuted)
                },
                _getStack: function () {
                    for (var e, t = 0; e = this.stack[t++];) {
                        if (e.has() && e.file.getStatus() === s.PROGRESS)
                            return e;
                        (!e.has() || e.file.getStatus() !== s.PROGRESS && e.file.getStatus() !== s.INTERRUPT) && this.stack.splice(--t, 1)
                    }
                    return null
                },
                _nextBlock: function () {
                    var e, t, n, r, o = this, s = o.options;
                    return (e = this._getStack()) ? (s.prepareNextFile && !o.pending.length && o._prepareNextFile(),
                    e.shift()) : o.runing ? (!o.pending.length && o._getStats().numOfQueue && o._prepareNextFile(),
                    t = o.pending.shift(),
                    n = function (t) {
                        return t ? (e = i(t, s.chunked ? s.chunkSize : 0),
                        o.stack.push(e),
                        e.shift()) : null
                    }
                    ,
                    a(t) ? (r = t.file,
                    t = t[t.pipe ? "pipe" : "then"](n),
                    t.file = r,
                    t) : n(t)) : void 0
                },
                _prepareNextFile: function () {
                    var e, t = this, n = t.request("fetch-file"), r = t.pending;
                    n && (e = t.request("before-send-file", n, function () {
                        return n.getStatus() === s.PROGRESS || n.getStatus() === s.INTERRUPT ? n : t._finishFile(n)
                    }),
                    t.owner.trigger("uploadStart", n),
                    n.setStatus(s.PROGRESS),
                    e.file = n,
                    e.done(function () {
                        var t = o.inArray(e, r);
                        ~t && r.splice(t, 1, n)
                    }),
                    e.fail(function (e) {
                        n.setStatus(s.ERROR, e),
                        t.owner.trigger("uploadError", n, e),
                        t.owner.trigger("uploadComplete", n)
                    }),
                    r.push(e))
                },
                _popBlock: function (e) {
                    var t = o.inArray(e, this.pool);
                    this.pool.splice(t, 1),
                    e.file.remaning--,
                    this.remaning--
                },
                _startSend: function (t) {
                    var n, r = this, i = t.file;
                    return i.getStatus() !== s.PROGRESS ? void (i.getStatus() === s.INTERRUPT && r._putback(t)) : (r.pool.push(t),
                    r.remaning++,
                    t.blob = 1 === t.chunks ? i.source : i.source.slice(t.start, t.end),
                    n = r.request("before-send", t, function () {
                        i.getStatus() === s.PROGRESS ? r._doSend(t) : (r._popBlock(t),
                        e.nextTick(r.__tick))
                    }),
                    void n.fail(function () {
                        1 === i.remaning ? r._finishFile(i).always(function () {
                            t.percentage = 1,
                            r._popBlock(t),
                            r.owner.trigger("uploadComplete", i),
                            e.nextTick(r.__tick)
                        }) : (t.percentage = 1,
                        r.updateFileProgress(i),
                        r._popBlock(t),
                        e.nextTick(r.__tick))
                    }))
                },
                _doSend: function (t) {
                    var n, i, a = this, u = a.owner, c = a.options, l = t.file, f = new r(c), d = o.extend({}, c.formData), h = o.extend({}, c.headers);
                    t.transport = f,
                    f.on("destroy", function () {
                        delete t.transport,
                        a._popBlock(t),
                        e.nextTick(a.__tick)
                    }),
                    f.on("progress", function (e) {
                        t.percentage = e,
                        a.updateFileProgress(l)
                    }),
                    n = function (e) {
                        var n;
                        return i = f.getResponseAsJson() || {},
                        i._raw = f.getResponse(),
                        n = function (t) {
                            e = t
                        }
                        ,
                        u.trigger("uploadAccept", t, i, n) || (e = e || "server"),
                        e
                    }
                    ,
                    f.on("error", function (e, r) {
                        t.retried = t.retried || 0,
                        t.chunks > 1 && ~"http,abort".indexOf(e) && t.retried < c.chunkRetry ? (t.retried++,
                        f.send()) : (r || "server" !== e || (e = n(e)),
                        l.setStatus(s.ERROR, e),
                        u.trigger("uploadError", l, e),
                        u.trigger("uploadComplete", l))
                    }),
                    f.on("load", function () {
                        var e;
                        return (e = n()) ? void f.trigger("error", e, !0) : void (1 === l.remaning ? a._finishFile(l, i) : f.destroy())
                    }),
                    d = o.extend(d, {
                        id: l.id,
                        name: l.name,
                        type: l.type,
                        lastModifiedDate: l.lastModifiedDate,
                        size: l.size
                    }),
                    t.chunks > 1 && o.extend(d, {
                        chunks: t.chunks,
                        chunk: t.chunk
                    }),
                    u.trigger("uploadBeforeSend", t, d, h),
                    f.appendBlob(c.fileVal, t.blob, l.name),
                    f.append(d),
                    f.setRequestHeader(h),
                    f.send()
                },
                _finishFile: function (e, t, n) {
                    var r = this.owner;
                    return r.request("after-send-file", arguments, function () {
                        e.setStatus(s.COMPLETE),
                        r.trigger("uploadSuccess", e, t, n)
                    }).fail(function (t) {
                        e.getStatus() === s.PROGRESS && e.setStatus(s.ERROR, t),
                        r.trigger("uploadError", e, t)
                    }).always(function () {
                        r.trigger("uploadComplete", e)
                    })
                },
                updateFileProgress: function (e) {
                    var t = 0
                      , n = 0;
                    e.blocks && (o.each(e.blocks, function (e, t) {
                        n += (t.percentage || 0) * (t.end - t.start)
                    }),
                    t = n / e.size,
                    this.owner.trigger("uploadProgress", e, t || 0))
                }
            })
        }),
        t("widgets/validator", ["base", "uploader", "file", "widgets/widget"], function (e, t, n) {
            var r, i = e.$, o = {};
            return r = {
                addValidator: function (e, t) {
                    o[e] = t
                },
                removeValidator: function (e) {
                    delete o[e]
                }
            },
            t.register({
                name: "validator",
                init: function () {
                    var t = this;
                    e.nextTick(function () {
                        i.each(o, function () {
                            this.call(t.owner)
                        })
                    })
                }
            }),
            r.addValidator("fileNumLimit", function () {
                var e = this
                  , t = e.options
                  , n = 0
                  , r = parseInt(t.fileNumLimit, 10)
                  , i = !0;
                r && (e.on("beforeFileQueued", function (e) {
                    return n >= r && i && (i = !1,
                    this.trigger("error", "Q_EXCEED_NUM_LIMIT", r, e),
                    setTimeout(function () {
                        i = !0
                    }, 1)),
                    n >= r ? !1 : !0
                }),
                e.on("fileQueued", function () {
                    n++
                }),
                e.on("fileDequeued", function () {
                    n--
                }),
                e.on("reset", function () {
                    n = 0
                }))
            }),
            r.addValidator("fileSizeLimit", function () {
                var e = this
                  , t = e.options
                  , n = 0
                  , r = parseInt(t.fileSizeLimit, 10)
                  , i = !0;
                r && (e.on("beforeFileQueued", function (e) {
                    var t = n + e.size > r;
                    return t && i && (i = !1,
                    this.trigger("error", "Q_EXCEED_SIZE_LIMIT", r, e),
                    setTimeout(function () {
                        i = !0
                    }, 1)),
                    t ? !1 : !0
                }),
                e.on("fileQueued", function (e) {
                    n += e.size
                }),
                e.on("fileDequeued", function (e) {
                    n -= e.size
                }),
                e.on("reset", function () {
                    n = 0
                }))
            }),
            r.addValidator("fileSingleSizeLimit", function () {
                var e = this
                  , t = e.options
                  , r = t.fileSingleSizeLimit;
                r && e.on("beforeFileQueued", function (e) {
                    return e.size > r ? (e.setStatus(n.Status.INVALID, "exceed_size"),
                    this.trigger("error", "F_EXCEED_SIZE", r, e),
                    !1) : void 0
                })
            }),
            r.addValidator("duplicate", function () {
                function e(e) {
                    for (var t, n = 0, r = 0, i = e.length; i > r; r++)
                        t = e.charCodeAt(r),
                        n = t + (n << 6) + (n << 16) - n;
                    return n
                }
                var t = this
                  , n = t.options
                  , r = {};
                n.duplicate || (t.on("beforeFileQueued", function (t) {
                    var n = t.__hash || (t.__hash = e(t.name + t.size + t.lastModifiedDate));
                    return r[n] ? (this.trigger("error", "F_DUPLICATE", t),
                    !1) : void 0
                }),
                t.on("fileQueued", function (e) {
                    var t = e.__hash;
                    t && (r[t] = !0)
                }),
                t.on("fileDequeued", function (e) {
                    var t = e.__hash;
                    t && delete r[t]
                }),
                t.on("reset", function () {
                    r = {}
                }))
            }),
            r
        }),
        t("lib/md5", ["runtime/client", "mediator"], function (e, t) {
            function n() {
                e.call(this, "Md5")
            }
            return t.installTo(n.prototype),
            n.prototype.loadFromBlob = function (e) {
                var t = this;
                t.getRuid() && t.disconnectRuntime(),
                t.connectRuntime(e.ruid, function () {
                    t.exec("init"),
                    t.exec("loadFromBlob", e)
                })
            }
            ,
            n.prototype.getResult = function () {
                return this.exec("getResult")
            }
            ,
            n
        }),
        t("widgets/md5", ["base", "uploader", "lib/md5", "lib/blob", "widgets/widget"], function (e, t, n, r) {
            return t.register({
                name: "md5",
                md5File: function (t, i, o) {
                    var a = new n
                      , s = e.Deferred()
                      , u = t instanceof r ? t : this.request("get-file", t).source;
                    return a.on("progress load", function (e) {
                        e = e || {},
                        s.notify(e.total ? e.loaded / e.total : 1)
                    }),
                    a.on("complete", function () {
                        s.resolve(a.getResult())
                    }),
                    a.on("error", function (e) {
                        s.reject(e)
                    }),
                    arguments.length > 1 && (i = i || 0,
                    o = o || 0,
                    0 > i && (i = u.size + i),
                    0 > o && (o = u.size + o),
                    o = Math.min(o, u.size),
                    u = u.slice(i, o)),
                    a.loadFromBlob(u),
                    s.promise()
                }
            })
        }),
        t("runtime/compbase", [], function () {
            function e(e, t) {
                this.owner = e,
                this.options = e.options,
                this.getRuntime = function () {
                    return t
                }
                ,
                this.getRuid = function () {
                    return t.uid
                }
                ,
                this.trigger = function () {
                    return e.trigger.apply(e, arguments)
                }
            }
            return e
        }),
        t("runtime/html5/runtime", ["base", "runtime/runtime", "runtime/compbase"], function (t, n, r) {
            function i() {
                var e = {}
                  , r = this
                  , i = this.destroy;
                n.apply(r, arguments),
                r.type = o,
                r.exec = function (n, i) {
                    var o, s = this, u = s.uid, c = t.slice(arguments, 2);
                    return a[n] && (o = e[u] = e[u] || new a[n](s, r),
                    o[i]) ? o[i].apply(o, c) : void 0
                }
                ,
                r.destroy = function () {
                    return i && i.apply(this, arguments)
                }
            }
            var o = "html5"
              , a = {};
            return t.inherits(n, {
                constructor: i,
                init: function () {
                    var e = this;
                    setTimeout(function () {
                        e.trigger("ready")
                    }, 1)
                }
            }),
            i.register = function (e, n) {
                var i = a[e] = t.inherits(r, n);
                return i
            }
            ,
            e.Blob && e.FileReader && e.DataView && n.addRuntime(o, i),
            i
        }),
        t("runtime/html5/blob", ["runtime/html5/runtime", "lib/blob"], function (e, t) {
            return e.register("Blob", {
                slice: function (e, n) {
                    var r = this.owner.source
                      , i = r.slice || r.webkitSlice || r.mozSlice;
                    return r = i.call(r, e, n),
                    new t(this.getRuid(), r)
                }
            })
        }),
        t("runtime/html5/dnd", ["base", "runtime/html5/runtime", "lib/file"], function (e, t, n) {
            var r = e.$
              , i = "webuploader-dnd-";
            return t.register("DragAndDrop", {
                init: function () {
                    var t = this.elem = this.options.container;
                    this.dragEnterHandler = e.bindFn(this._dragEnterHandler, this),
                    this.dragOverHandler = e.bindFn(this._dragOverHandler, this),
                    this.dragLeaveHandler = e.bindFn(this._dragLeaveHandler, this),
                    this.dropHandler = e.bindFn(this._dropHandler, this),
                    this.dndOver = !1,
                    t.on("dragenter", this.dragEnterHandler),
                    t.on("dragover", this.dragOverHandler),
                    t.on("dragleave", this.dragLeaveHandler),
                    t.on("drop", this.dropHandler),
                    this.options.disableGlobalDnd && (r(document).on("dragover", this.dragOverHandler),
                    r(document).on("drop", this.dropHandler))
                },
                _dragEnterHandler: function (e) {
                    var t, n = this, r = n._denied || !1;
                    return e = e.originalEvent || e,
                    n.dndOver || (n.dndOver = !0,
                    t = e.dataTransfer.items,
                    t && t.length && (n._denied = r = !n.trigger("accept", t)),
                    n.elem.addClass(i + "over"),
                    n.elem[r ? "addClass" : "removeClass"](i + "denied")),
                    e.dataTransfer.dropEffect = r ? "none" : "copy",
                    !1
                },
                _dragOverHandler: function (e) {
                    var t = this.elem.parent().get(0);
                    return t && !r.contains(t, e.currentTarget) ? !1 : (clearTimeout(this._leaveTimer),
                    this._dragEnterHandler.call(this, e),
                    !1)
                },
                _dragLeaveHandler: function () {
                    var e, t = this;
                    return e = function () {
                        t.dndOver = !1,
                        t.elem.removeClass(i + "over " + i + "denied")
                    }
                    ,
                    clearTimeout(t._leaveTimer),
                    t._leaveTimer = setTimeout(e, 100),
                    !1
                },
                _dropHandler: function (e) {
                    var t, o, a = this, s = a.getRuid(), u = a.elem.parent().get(0);
                    if (u && !r.contains(u, e.currentTarget))
                        return !1;
                    e = e.originalEvent || e,
                    t = e.dataTransfer;
                    try {
                        o = t.getData("text/html")
                    } catch (c) { }
                    return o ? void 0 : (a._getTansferFiles(t, function (e) {
                        a.trigger("drop", r.map(e, function (e) {
                            return new n(s, e)
                        }))
                    }),
                    a.dndOver = !1,
                    a.elem.removeClass(i + "over"),
                    !1)
                },
                _getTansferFiles: function (t, n) {
                    var r, i, o, a, s, u, c, l = [], f = [];
                    for (r = t.items,
                    i = t.files,
                    c = !(!r || !r[0].webkitGetAsEntry),
                    s = 0,
                    u = i.length; u > s; s++)
                        o = i[s],
                        a = r && r[s],
                        c && a.webkitGetAsEntry().isDirectory ? f.push(this._traverseDirectoryTree(a.webkitGetAsEntry(), l)) : l.push(o);
                    e.when.apply(e, f).done(function () {
                        l.length && n(l)
                    })
                },
                _traverseDirectoryTree: function (t, n) {
                    var r = e.Deferred()
                      , i = this;
                    return t.isFile ? t.file(function (e) {
                        n.push(e),
                        r.resolve()
                    }) : t.isDirectory && t.createReader().readEntries(function (t) {
                        var o, a = t.length, s = [], u = [];
                        for (o = 0; a > o; o++)
                            s.push(i._traverseDirectoryTree(t[o], u));
                        e.when.apply(e, s).then(function () {
                            n.push.apply(n, u),
                            r.resolve()
                        }, r.reject)
                    }),
                    r.promise()
                },
                destroy: function () {
                    var e = this.elem;
                    e && (e.off("dragenter", this.dragEnterHandler),
                    e.off("dragover", this.dragOverHandler),
                    e.off("dragleave", this.dragLeaveHandler),
                    e.off("drop", this.dropHandler),
                    this.options.disableGlobalDnd && (r(document).off("dragover", this.dragOverHandler),
                    r(document).off("drop", this.dropHandler)))
                }
            })
        }),
        t("runtime/html5/filepaste", ["base", "runtime/html5/runtime", "lib/file"], function (e, t, n) {
            return t.register("FilePaste", {
                init: function () {
                    var t, n, r, i, o = this.options, a = this.elem = o.container, s = ".*";
                    if (o.accept) {
                        for (t = [],
                        n = 0,
                        r = o.accept.length; r > n; n++)
                            i = o.accept[n].mimeTypes,
                            i && t.push(i);
                        t.length && (s = t.join(","),
                        s = s.replace(/,/g, "|").replace(/\*/g, ".*"))
                    }
                    this.accept = s = new RegExp(s, "i"),
                    this.hander = e.bindFn(this._pasteHander, this),
                    a.on("paste", this.hander)
                },
                _pasteHander: function (e) {
                    var t, r, i, o, a, s = [], u = this.getRuid();
                    for (e = e.originalEvent || e,
                    t = e.clipboardData.items,
                    o = 0,
                    a = t.length; a > o; o++)
                        r = t[o],
                        "file" === r.kind && (i = r.getAsFile()) && s.push(new n(u, i));
                    s.length && (e.preventDefault(),
                    e.stopPropagation(),
                    this.trigger("paste", s))
                },
                destroy: function () {
                    this.elem.off("paste", this.hander)
                }
            })
        }),
        t("runtime/html5/filepicker", ["base", "runtime/html5/runtime"], function (e, t) {
            var n = e.$;
            return t.register("FilePicker", {
                init: function () {
                    var e, t, r, i, o = this.getRuntime().getContainer(), a = this, s = a.owner, u = a.options, c = this.label = n(document.createElement("label")), l = this.input = n(document.createElement("input"));
                    if (l.attr("type", "file"),
                    l.attr("name", u.name),
                    l.addClass("webuploader-element-invisible"),
                    c.on("click", function () {
                        l.trigger("click")
                    }),
                    c.css({
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                        display: "block",
                        cursor: "pointer",
                        background: "#ffffff"
                    }),
                    u.multiple && l.attr("multiple", "multiple"),
                    u.accept && u.accept.length > 0) {
                        for (e = [],
                        t = 0,
                        r = u.accept.length; r > t; t++)
                            e.push(u.accept[t].mimeTypes);
                        l.attr("accept", e.join(","))
                    }
                    o.append(l),
                    o.append(c),
                    i = function (e) {
                        s.trigger(e.type)
                    }
                    ,
                    l.on("change", function (e) {
                        var t, r = arguments.callee;
                        a.files = e.target.files,
                        t = this.cloneNode(!0),
                        t.value = null,
                        this.parentNode.replaceChild(t, this),
                        l.off(),
                        l = n(t).on("change", r).on("mouseenter mouseleave", i),
                        s.trigger("change")
                    }),
                    c.on("mouseenter mouseleave", i)
                },
                getFiles: function () {
                    return this.files
                },
                destroy: function () {
                    this.input.off(),
                    this.label.off()
                }
            })
        }),
        t("runtime/html5/util", ["base"], function (t) {
            var n = e.createObjectURL && e || e.URL && URL.revokeObjectURL && URL || e.webkitURL
              , r = t.noop
              , i = r;
            return n && (r = function () {
                return n.createObjectURL.apply(n, arguments)
            }
            ,
            i = function () {
                return n.revokeObjectURL.apply(n, arguments)
            }
            ),
            {
                createObjectURL: r,
                revokeObjectURL: i,
                dataURL2Blob: function (e) {
                    var t, n, r, i, o, a;
                    for (a = e.split(","),
                    t = ~a[0].indexOf("base64") ? atob(a[1]) : decodeURIComponent(a[1]),
                    r = new ArrayBuffer(t.length),
                    n = new Uint8Array(r),
                    i = 0; i < t.length; i++)
                        n[i] = t.charCodeAt(i);
                    return o = a[0].split(":")[1].split(";")[0],
                    this.arrayBufferToBlob(r, o)
                },
                dataURL2ArrayBuffer: function (e) {
                    var t, n, r, i;
                    for (i = e.split(","),
                    t = ~i[0].indexOf("base64") ? atob(i[1]) : decodeURIComponent(i[1]),
                    n = new Uint8Array(t.length),
                    r = 0; r < t.length; r++)
                        n[r] = t.charCodeAt(r);
                    return n.buffer
                },
                arrayBufferToBlob: function (t, n) {
                    var r, i = e.BlobBuilder || e.WebKitBlobBuilder;
                    return i ? (r = new i,
                    r.append(t),
                    r.getBlob(n)) : new Blob([t], n ? {
                        type: n
                    } : {})
                },
                canvasToDataUrl: function (e, t, n) {
                    return e.toDataURL(t, n / 100)
                },
                parseMeta: function (e, t) {
                    t(!1, {})
                },
                updateImageHead: function (e) {
                    return e
                }
            }
        }),
        t("runtime/html5/imagemeta", ["runtime/html5/util"], function (e) {
            var t;
            return t = {
                parsers: {
                    65505: []
                },
                maxMetaDataSize: 262144,
                parse: function (e, t) {
                    var n = this
                      , r = new FileReader;
                    r.onload = function () {
                        t(!1, n._parse(this.result)),
                        r = r.onload = r.onerror = null
                    }
                    ,
                    r.onerror = function (e) {
                        t(e.message),
                        r = r.onload = r.onerror = null
                    }
                    ,
                    e = e.slice(0, n.maxMetaDataSize),
                    r.readAsArrayBuffer(e.getSource())
                },
                _parse: function (e, n) {
                    if (!(e.byteLength < 6)) {
                        var r, i, o, a, s = new DataView(e), u = 2, c = s.byteLength - 4, l = u, f = {};
                        if (65496 === s.getUint16(0)) {
                            for (; c > u && (r = s.getUint16(u),
                            r >= 65504 && 65519 >= r || 65534 === r) && (i = s.getUint16(u + 2) + 2,
                            !(u + i > s.byteLength)) ;) {
                                if (o = t.parsers[r],
                                !n && o)
                                    for (a = 0; a < o.length; a += 1)
                                        o[a].call(t, s, u, i, f);
                                u += i,
                                l = u
                            }
                            l > 6 && (f.imageHead = e.slice ? e.slice(2, l) : new Uint8Array(e).subarray(2, l))
                        }
                        return f
                    }
                },
                updateImageHead: function (e, t) {
                    var n, r, i, o = this._parse(e, !0);
                    return i = 2,
                    o.imageHead && (i = 2 + o.imageHead.byteLength),
                    r = e.slice ? e.slice(i) : new Uint8Array(e).subarray(i),
                    n = new Uint8Array(t.byteLength + 2 + r.byteLength),
                    n[0] = 255,
                    n[1] = 216,
                    n.set(new Uint8Array(t), 2),
                    n.set(new Uint8Array(r), t.byteLength + 2),
                    n.buffer
                }
            },
            e.parseMeta = function () {
                return t.parse.apply(t, arguments)
            }
            ,
            e.updateImageHead = function () {
                return t.updateImageHead.apply(t, arguments)
            }
            ,
            t
        }),
        t("runtime/html5/imagemeta/exif", ["base", "runtime/html5/imagemeta"], function (e, t) {
            var n = {};
            return n.ExifMap = function () {
                return this
            }
            ,
            n.ExifMap.prototype.map = {
                Orientation: 274
            },
            n.ExifMap.prototype.get = function (e) {
                return this[e] || this[this.map[e]]
            }
            ,
            n.exifTagTypes = {
                1: {
                    getValue: function (e, t) {
                        return e.getUint8(t)
                    },
                    size: 1
                },
                2: {
                    getValue: function (e, t) {
                        return String.fromCharCode(e.getUint8(t))
                    },
                    size: 1,
                    ascii: !0
                },
                3: {
                    getValue: function (e, t, n) {
                        return e.getUint16(t, n)
                    },
                    size: 2
                },
                4: {
                    getValue: function (e, t, n) {
                        return e.getUint32(t, n)
                    },
                    size: 4
                },
                5: {
                    getValue: function (e, t, n) {
                        return e.getUint32(t, n) / e.getUint32(t + 4, n)
                    },
                    size: 8
                },
                9: {
                    getValue: function (e, t, n) {
                        return e.getInt32(t, n)
                    },
                    size: 4
                },
                10: {
                    getValue: function (e, t, n) {
                        return e.getInt32(t, n) / e.getInt32(t + 4, n)
                    },
                    size: 8
                }
            },
            n.exifTagTypes[7] = n.exifTagTypes[1],
            n.getExifValue = function (t, r, i, o, a, s) {
                var u, c, l, f, d, h, p = n.exifTagTypes[o];
                if (!p)
                    return void e.log("Invalid Exif data: Invalid tag type.");
                if (u = p.size * a,
                c = u > 4 ? r + t.getUint32(i + 8, s) : i + 8,
                c + u > t.byteLength)
                    return void e.log("Invalid Exif data: Invalid data offset.");
                if (1 === a)
                    return p.getValue(t, c, s);
                for (l = [],
                f = 0; a > f; f += 1)
                    l[f] = p.getValue(t, c + f * p.size, s);
                if (p.ascii) {
                    for (d = "",
                    f = 0; f < l.length && (h = l[f],
                    "\x00" !== h) ; f += 1)
                        d += h;
                    return d
                }
                return l
            }
            ,
            n.parseExifTag = function (e, t, r, i, o) {
                var a = e.getUint16(r, i);
                o.exif[a] = n.getExifValue(e, t, r, e.getUint16(r + 2, i), e.getUint32(r + 4, i), i)
            }
            ,
            n.parseExifTags = function (t, n, r, i, o) {
                var a, s, u;
                if (r + 6 > t.byteLength)
                    return void e.log("Invalid Exif data: Invalid directory offset.");
                if (a = t.getUint16(r, i),
                s = r + 2 + 12 * a,
                s + 4 > t.byteLength)
                    return void e.log("Invalid Exif data: Invalid directory size.");
                for (u = 0; a > u; u += 1)
                    this.parseExifTag(t, n, r + 2 + 12 * u, i, o);
                return t.getUint32(s, i)
            }
            ,
            n.parseExifData = function (t, r, i, o) {
                var a, s, u = r + 10;
                if (1165519206 === t.getUint32(r + 4)) {
                    if (u + 8 > t.byteLength)
                        return void e.log("Invalid Exif data: Invalid segment size.");
                    if (0 !== t.getUint16(r + 8))
                        return void e.log("Invalid Exif data: Missing byte alignment offset.");
                    switch (t.getUint16(u)) {
                        case 18761:
                            a = !0;
                            break;
                        case 19789:
                            a = !1;
                            break;
                        default:
                            return void e.log("Invalid Exif data: Invalid byte alignment marker.")
                    }
                    if (42 !== t.getUint16(u + 2, a))
                        return void e.log("Invalid Exif data: Missing TIFF marker.");
                    s = t.getUint32(u + 4, a),
                    o.exif = new n.ExifMap,
                    s = n.parseExifTags(t, u, u + s, a, o)
                }
            }
            ,
            t.parsers[65505].push(n.parseExifData),
            n
        }),
        t("runtime/html5/jpegencoder", [], function () {
            function e(e) {
                function t(e) {
                    for (var t = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99], n = 0; 64 > n; n++) {
                        var r = E((t[n] * e + 50) / 100);
                        1 > r ? r = 1 : r > 255 && (r = 255),
                        k[M[n]] = r
                    }
                    for (var i = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], o = 0; 64 > o; o++) {
                        var a = E((i[o] * e + 50) / 100);
                        1 > a ? a = 1 : a > 255 && (a = 255),
                        S[M[o]] = a
                    }
                    for (var s = [1, 1.387039845, 1.306562965, 1.175875602, 1, .785694958, .5411961, .275899379], u = 0, c = 0; 8 > c; c++)
                        for (var l = 0; 8 > l; l++)
                            T[u] = 1 / (k[M[u]] * s[c] * s[l] * 8),
                            F[u] = 1 / (S[M[u]] * s[c] * s[l] * 8),
                            u++
                }
                function n(e, t) {
                    for (var n = 0, r = 0, i = new Array, o = 1; 16 >= o; o++) {
                        for (var a = 1; a <= e[o]; a++)
                            i[t[r]] = [],
                            i[t[r]][0] = n,
                            i[t[r]][1] = o,
                            r++,
                            n++;
                        n *= 2
                    }
                    return i
                }
                function r() {
                    _ = n(j, N),
                    y = n(V, G),
                    w = n($, Q),
                    x = n(W, J)
                }
                function i() {
                    for (var e = 1, t = 2, n = 1; 15 >= n; n++) {
                        for (var r = e; t > r; r++)
                            U[32767 + r] = n,
                            A[32767 + r] = [],
                            A[32767 + r][1] = n,
                            A[32767 + r][0] = r;
                        for (var i = -(t - 1) ; -e >= i; i++)
                            U[32767 + i] = n,
                            A[32767 + i] = [],
                            A[32767 + i][1] = n,
                            A[32767 + i][0] = t - 1 + i;
                        e <<= 1,
                        t <<= 1
                    }
                }
                function o() {
                    for (var e = 0; 256 > e; e++)
                        H[e] = 19595 * e,
                        H[e + 256 >> 0] = 38470 * e,
                        H[e + 512 >> 0] = 7471 * e + 32768,
                        H[e + 768 >> 0] = -11059 * e,
                        H[e + 1024 >> 0] = -21709 * e,
                        H[e + 1280 >> 0] = 32768 * e + 8421375,
                        H[e + 1536 >> 0] = -27439 * e,
                        H[e + 1792 >> 0] = -5329 * e
                }
                function a(e) {
                    for (var t = e[0], n = e[1] - 1; n >= 0;)
                        t & 1 << n && (C |= 1 << q),
                        n--,
                        q--,
                        0 > q && (255 == C ? (s(255),
                        s(0)) : s(C),
                        q = 7,
                        C = 0)
                }
                function s(e) {
                    I.push(z[e])
                }
                function u(e) {
                    s(e >> 8 & 255),
                    s(255 & e)
                }
                function c(e, t) {
                    var n, r, i, o, a, s, u, c, l, f = 0, d = 8, h = 64;
                    for (l = 0; d > l; ++l) {
                        n = e[f],
                        r = e[f + 1],
                        i = e[f + 2],
                        o = e[f + 3],
                        a = e[f + 4],
                        s = e[f + 5],
                        u = e[f + 6],
                        c = e[f + 7];
                        var p = n + c
                          , g = n - c
                          , m = r + u
                          , v = r - u
                          , b = i + s
                          , _ = i - s
                          , y = o + a
                          , w = o - a
                          , x = p + y
                          , R = p - y
                          , E = m + b
                          , k = m - b;
                        e[f] = x + E,
                        e[f + 4] = x - E;
                        var S = .707106781 * (k + R);
                        e[f + 2] = R + S,
                        e[f + 6] = R - S,
                        x = w + _,
                        E = _ + v,
                        k = v + g;
                        var T = .382683433 * (x - k)
                          , F = .5411961 * x + T
                          , A = 1.306562965 * k + T
                          , U = .707106781 * E
                          , O = g + U
                          , I = g - U;
                        e[f + 5] = I + F,
                        e[f + 3] = I - F,
                        e[f + 1] = O + A,
                        e[f + 7] = O - A,
                        f += 8
                    }
                    for (f = 0,
                    l = 0; d > l; ++l) {
                        n = e[f],
                        r = e[f + 8],
                        i = e[f + 16],
                        o = e[f + 24],
                        a = e[f + 32],
                        s = e[f + 40],
                        u = e[f + 48],
                        c = e[f + 56];
                        var C = n + c
                          , q = n - c
                          , B = r + u
                          , L = r - u
                          , P = i + s
                          , z = i - s
                          , H = o + a
                          , M = o - a
                          , j = C + H
                          , N = C - H
                          , $ = B + P
                          , Q = B - P;
                        e[f] = j + $,
                        e[f + 32] = j - $;
                        var V = .707106781 * (Q + N);
                        e[f + 16] = N + V,
                        e[f + 48] = N - V,
                        j = M + z,
                        $ = z + L,
                        Q = L + q;
                        var G = .382683433 * (j - Q)
                          , W = .5411961 * j + G
                          , J = 1.306562965 * Q + G
                          , X = .707106781 * $
                          , Z = q + X
                          , K = q - X;
                        e[f + 40] = K + W,
                        e[f + 24] = K - W,
                        e[f + 8] = Z + J,
                        e[f + 56] = Z - J,
                        f++
                    }
                    var Y;
                    for (l = 0; h > l; ++l)
                        Y = e[l] * t[l],
                        D[l] = Y > 0 ? Y + .5 | 0 : Y - .5 | 0;
                    return D
                }
                function l() {
                    u(65504),
                    u(16),
                    s(74),
                    s(70),
                    s(73),
                    s(70),
                    s(0),
                    s(1),
                    s(1),
                    s(0),
                    u(1),
                    u(1),
                    s(0),
                    s(0)
                }
                function f(e, t) {
                    u(65472),
                    u(17),
                    s(8),
                    u(t),
                    u(e),
                    s(3),
                    s(1),
                    s(17),
                    s(0),
                    s(2),
                    s(17),
                    s(1),
                    s(3),
                    s(17),
                    s(1)
                }
                function d() {
                    u(65499),
                    u(132),
                    s(0);
                    for (var e = 0; 64 > e; e++)
                        s(k[e]);
                    s(1);
                    for (var t = 0; 64 > t; t++)
                        s(S[t])
                }
                function h() {
                    u(65476),
                    u(418),
                    s(0);
                    for (var e = 0; 16 > e; e++)
                        s(j[e + 1]);
                    for (var t = 0; 11 >= t; t++)
                        s(N[t]);
                    s(16);
                    for (var n = 0; 16 > n; n++)
                        s($[n + 1]);
                    for (var r = 0; 161 >= r; r++)
                        s(Q[r]);
                    s(1);
                    for (var i = 0; 16 > i; i++)
                        s(V[i + 1]);
                    for (var o = 0; 11 >= o; o++)
                        s(G[o]);
                    s(17);
                    for (var a = 0; 16 > a; a++)
                        s(W[a + 1]);
                    for (var c = 0; 161 >= c; c++)
                        s(J[c])
                }
                function p() {
                    u(65498),
                    u(12),
                    s(3),
                    s(1),
                    s(0),
                    s(2),
                    s(17),
                    s(3),
                    s(17),
                    s(0),
                    s(63),
                    s(0)
                }
                function g(e, t, n, r, i) {
                    for (var o, s = i[0], u = i[240], l = 16, f = 63, d = 64, h = c(e, t), p = 0; d > p; ++p)
                        O[M[p]] = h[p];
                    var g = O[0] - n;
                    n = O[0],
                    0 == g ? a(r[0]) : (o = 32767 + g,
                    a(r[U[o]]),
                    a(A[o]));
                    for (var m = 63; m > 0 && 0 == O[m]; m--)
                        ;
                    if (0 == m)
                        return a(s),
                        n;
                    for (var v, b = 1; m >= b;) {
                        for (var _ = b; 0 == O[b] && m >= b; ++b)
                            ;
                        var y = b - _;
                        if (y >= l) {
                            v = y >> 4;
                            for (var w = 1; v >= w; ++w)
                                a(u);
                            y = 15 & y
                        }
                        o = 32767 + O[b],
                        a(i[(y << 4) + U[o]]),
                        a(A[o]),
                        b++
                    }
                    return m != f && a(s),
                    n
                }
                function m() {
                    for (var e = String.fromCharCode, t = 0; 256 > t; t++)
                        z[t] = e(t)
                }
                function v(e) {
                    if (0 >= e && (e = 1),
                    e > 100 && (e = 100),
                    R != e) {
                        var n = 0;
                        n = Math.floor(50 > e ? 5e3 / e : 200 - 2 * e),
                        t(n),
                        R = e
                    }
                }
                function b() {
                    e || (e = 50),
                    m(),
                    r(),
                    i(),
                    o(),
                    v(e)
                }
                var _, y, w, x, R, E = (Math.round,
                Math.floor), k = new Array(64), S = new Array(64), T = new Array(64), F = new Array(64), A = new Array(65535), U = new Array(65535), D = new Array(64), O = new Array(64), I = [], C = 0, q = 7, B = new Array(64), L = new Array(64), P = new Array(64), z = new Array(256), H = new Array(2048), M = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63], j = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], N = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], $ = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125], Q = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250], V = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], G = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], W = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119], J = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];
                this.encode = function (e, t) {
                    t && v(t),
                    I = new Array,
                    C = 0,
                    q = 7,
                    u(65496),
                    l(),
                    d(),
                    f(e.width, e.height),
                    h(),
                    p();
                    var n = 0
                      , r = 0
                      , i = 0;
                    C = 0,
                    q = 7,
                    this.encode.displayName = "_encode_";
                    for (var o, s, c, m, b, R, E, k, S, A = e.data, U = e.width, D = e.height, O = 4 * U, z = 0; D > z;) {
                        for (o = 0; O > o;) {
                            for (b = O * z + o,
                            R = b,
                            E = -1,
                            k = 0,
                            S = 0; 64 > S; S++)
                                k = S >> 3,
                                E = 4 * (7 & S),
                                R = b + k * O + E,
                                z + k >= D && (R -= O * (z + 1 + k - D)),
                                o + E >= O && (R -= o + E - O + 4),
                                s = A[R++],
                                c = A[R++],
                                m = A[R++],
                                B[S] = (H[s] + H[c + 256 >> 0] + H[m + 512 >> 0] >> 16) - 128,
                                L[S] = (H[s + 768 >> 0] + H[c + 1024 >> 0] + H[m + 1280 >> 0] >> 16) - 128,
                                P[S] = (H[s + 1280 >> 0] + H[c + 1536 >> 0] + H[m + 1792 >> 0] >> 16) - 128;
                            n = g(B, T, n, _, w),
                            r = g(L, F, r, y, x),
                            i = g(P, F, i, y, x),
                            o += 32
                        }
                        z += 8
                    }
                    if (q >= 0) {
                        var M = [];
                        M[1] = q + 1,
                        M[0] = (1 << q + 1) - 1,
                        a(M)
                    }
                    u(65497);
                    var j = "data:image/jpeg;base64," + btoa(I.join(""));
                    return I = [],
                    j
                }
                ,
                b()
            }
            return e.encode = function (t, n) {
                var r = new e(n);
                return r.encode(t)
            }
            ,
            e
        }),
        t("runtime/html5/androidpatch", ["runtime/html5/util", "runtime/html5/jpegencoder", "base"], function (e, t, n) {
            var r, i = e.canvasToDataUrl;
            e.canvasToDataUrl = function (e, o, a) {
                var s, u, c, l, f;
                return n.os.android ? ("image/jpeg" === o && "undefined" == typeof r && (l = i.apply(null, arguments),
                f = l.split(","),
                l = ~f[0].indexOf("base64") ? atob(f[1]) : decodeURIComponent(f[1]),
                l = l.substring(0, 2),
                r = 255 === l.charCodeAt(0) && 216 === l.charCodeAt(1)),
                "image/jpeg" !== o || r ? i.apply(null, arguments) : (u = e.width,
                c = e.height,
                s = e.getContext("2d"),
                t.encode(s.getImageData(0, 0, u, c), a))) : i.apply(null, arguments)
            }
        }),
        t("runtime/html5/image", ["base", "runtime/html5/runtime", "runtime/html5/util"], function (e, t, n) {
            var r = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D";
            return t.register("Image", {
                modified: !1,
                init: function () {
                    var e = this
                      , t = new Image;
                    t.onload = function () {
                        e._info = {
                            type: e.type,
                            width: this.width,
                            height: this.height
                        },
                        e._metas || "image/jpeg" !== e.type ? e.owner.trigger("load") : n.parseMeta(e._blob, function (t, n) {
                            e._metas = n,
                            e.owner.trigger("load")
                        })
                    }
                    ,
                    t.onerror = function () {
                        e.owner.trigger("error")
                    }
                    ,
                    e._img = t
                },
                loadFromBlob: function (e) {
                    var t = this
                      , r = t._img;
                    t._blob = e,
                    t.type = e.type,
                    r.src = n.createObjectURL(e.getSource()),
                    t.owner.once("load", function () {
                        n.revokeObjectURL(r.src)
                    })
                },
                resize: function (e, t) {
                    var n = this._canvas || (this._canvas = document.createElement("canvas"));
                    this._resize(this._img, n, e, t),
                    this._blob = null,
                    this.modified = !0,
                    this.owner.trigger("complete", "resize")
                },
                crop: function (e, t, n, r, i) {
                    var o = this._canvas || (this._canvas = document.createElement("canvas"))
                      , a = this.options
                      , s = this._img
                      , u = s.naturalWidth
                      , c = s.naturalHeight
                      , l = this.getOrientation();
                    i = i || 1,
                    o.width = n,
                    o.height = r,
                    a.preserveHeaders || this._rotate2Orientaion(o, l),
                    this._renderImageToCanvas(o, s, -e, -t, u * i, c * i),
                    this._blob = null,
                    this.modified = !0,
                    this.owner.trigger("complete", "crop")
                },
                getAsBlob: function (e) {
                    var t, r = this._blob, i = this.options;
                    if (e = e || this.type,
                    this.modified || this.type !== e) {
                        if (t = this._canvas,
                        "image/jpeg" === e) {
                            if (r = n.canvasToDataUrl(t, e, i.quality),
                            i.preserveHeaders && this._metas && this._metas.imageHead)
                                return r = n.dataURL2ArrayBuffer(r),
                                r = n.updateImageHead(r, this._metas.imageHead),
                                r = n.arrayBufferToBlob(r, e)
                        } else
                            r = n.canvasToDataUrl(t, e);
                        r = n.dataURL2Blob(r)
                    }
                    return r
                },
                getAsDataUrl: function (e) {
                    var t = this.options;
                    return e = e || this.type,
                    "image/jpeg" === e ? n.canvasToDataUrl(this._canvas, e, t.quality) : this._canvas.toDataURL(e)
                },
                getOrientation: function () {
                    return this._metas && this._metas.exif && this._metas.exif.get("Orientation") || 1
                },
                info: function (e) {
                    return e ? (this._info = e,
                    this) : this._info
                },
                meta: function (e) {
                    return e ? (this._meta = e,
                    this) : this._meta
                },
                destroy: function () {
                    var e = this._canvas;
                    this._img.onload = null,
                    e && (e.getContext("2d").clearRect(0, 0, e.width, e.height),
                    e.width = e.height = 0,
                    this._canvas = null),
                    this._img.src = r,
                    this._img = this._blob = null
                },
                _resize: function (e, t, n, r) {
                    var i, o, a, s, u, c = this.options, l = e.width, f = e.height, d = this.getOrientation();
                    ~[5, 6, 7, 8].indexOf(d) && (n ^= r,
                    r ^= n,
                    n ^= r),
                    i = Math[c.crop ? "max" : "min"](n / l, r / f),
                    c.allowMagnify || (i = Math.min(1, i)),
                    o = l * i,
                    a = f * i,
                    c.crop ? (t.width = n,
                    t.height = r) : (t.width = o,
                    t.height = a),
                    s = (t.width - o) / 2,
                    u = (t.height - a) / 2,
                    c.preserveHeaders || this._rotate2Orientaion(t, d),
                    this._renderImageToCanvas(t, e, s, u, o, a)
                },
                _rotate2Orientaion: function (e, t) {
                    var n = e.width
                      , r = e.height
                      , i = e.getContext("2d");
                    switch (t) {
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                            e.width = r,
                            e.height = n
                    }
                    switch (t) {
                        case 2:
                            i.translate(n, 0),
                            i.scale(-1, 1);
                            break;
                        case 3:
                            i.translate(n, r),
                            i.rotate(Math.PI);
                            break;
                        case 4:
                            i.translate(0, r),
                            i.scale(1, -1);
                            break;
                        case 5:
                            i.rotate(.5 * Math.PI),
                            i.scale(1, -1);
                            break;
                        case 6:
                            i.rotate(.5 * Math.PI),
                            i.translate(0, -r);
                            break;
                        case 7:
                            i.rotate(.5 * Math.PI),
                            i.translate(n, -r),
                            i.scale(-1, 1);
                            break;
                        case 8:
                            i.rotate(-.5 * Math.PI),
                            i.translate(-n, 0)
                    }
                },
                _renderImageToCanvas: function () {
                    function t(e, t, n) {
                        var r, i, o, a = document.createElement("canvas"), s = a.getContext("2d"), u = 0, c = n, l = n;
                        for (a.width = 1,
                        a.height = n,
                        s.drawImage(e, 0, 0),
                        r = s.getImageData(0, 0, 1, n).data; l > u;)
                            i = r[4 * (l - 1) + 3],
                            0 === i ? c = l : u = l,
                            l = c + u >> 1;
                        return o = l / n,
                        0 === o ? 1 : o
                    }
                    function n(e) {
                        var t, n, r = e.naturalWidth, i = e.naturalHeight;
                        return r * i > 1048576 ? (t = document.createElement("canvas"),
                        t.width = t.height = 1,
                        n = t.getContext("2d"),
                        n.drawImage(e, -r + 1, 0),
                        0 === n.getImageData(0, 0, 1, 1).data[3]) : !1
                    }
                    return e.os.ios ? e.os.ios >= 7 ? function (e, n, r, i, o, a) {
                        var s = n.naturalWidth
                          , u = n.naturalHeight
                          , c = t(n, s, u);
                        return e.getContext("2d").drawImage(n, 0, 0, s * c, u * c, r, i, o, a)
                    }
                    : function (e, r, i, o, a, s) {
                        var u, c, l, f, d, h, p, g = r.naturalWidth, m = r.naturalHeight, v = e.getContext("2d"), b = n(r), _ = "image/jpeg" === this.type, y = 1024, w = 0, x = 0;
                        for (b && (g /= 2,
                        m /= 2),
                        v.save(),
                        u = document.createElement("canvas"),
                        u.width = u.height = y,
                        c = u.getContext("2d"),
                        l = _ ? t(r, g, m) : 1,
                        f = Math.ceil(y * a / g),
                        d = Math.ceil(y * s / m / l) ; m > w;) {
                            for (h = 0,
                            p = 0; g > h;)
                                c.clearRect(0, 0, y, y),
                                c.drawImage(r, -h, -w),
                                v.drawImage(u, 0, 0, y, y, i + p, o + x, f, d),
                                h += y,
                                p += f;
                            w += y,
                            x += d
                        }
                        v.restore(),
                        u = c = null
                    }
                    : function (t) {
                        var n = e.slice(arguments, 1)
                          , r = t.getContext("2d");
                        r.drawImage.apply(r, n)
                    }
                }()
            })
        }),
        t("runtime/html5/transport", ["base", "runtime/html5/runtime"], function (e, t) {
            var n = e.noop
              , r = e.$;
            return t.register("Transport", {
                init: function () {
                    this._status = 0,
                    this._response = null
                },
                send: function () {
                    var t, n, i, o = this.owner, a = this.options, s = this._initAjax(), u = o._blob, c = a.server;
                    a.sendAsBinary ? (c += (/\?/.test(c) ? "&" : "?") + r.param(o._formData),
                    n = u.getSource()) : (t = new FormData,
                    r.each(o._formData, function (e, n) {
                        t.append(e, n)
                    }),
                    t.append(a.fileVal, u.getSource(), a.filename || o._formData.name || "")),
                    a.withCredentials && "withCredentials" in s ? (s.open(a.method, c, !0),
                    s.withCredentials = !0) : s.open(a.method, c),
                    this._setRequestHeader(s, a.headers),
                    n ? (s.overrideMimeType && s.overrideMimeType("application/octet-stream"),
                    e.os.android ? (i = new FileReader,
                    i.onload = function () {
                        s.send(this.result),
                        i = i.onload = null
                    }
                    ,
                    i.readAsArrayBuffer(n)) : s.send(n)) : s.send(t)
                },
                getResponse: function () {
                    return this._response
                },
                getResponseAsJson: function () {
                    return this._parseJson(this._response)
                },
                getStatus: function () {
                    return this._status
                },
                abort: function () {
                    var e = this._xhr;
                    e && (e.upload.onprogress = n,
                    e.onreadystatechange = n,
                    e.abort(),
                    this._xhr = e = null)
                },
                destroy: function () {
                    this.abort()
                },
                _initAjax: function () {
                    var e = this
                      , t = new XMLHttpRequest
                      , r = this.options;
                    return !r.withCredentials || "withCredentials" in t || "undefined" == typeof XDomainRequest || (t = new XDomainRequest),
                    t.upload.onprogress = function (t) {
                        var n = 0;
                        return t.lengthComputable && (n = t.loaded / t.total),
                        e.trigger("progress", n)
                    }
                    ,
                    t.onreadystatechange = function () {
                        return 4 === t.readyState ? (t.upload.onprogress = n,
                        t.onreadystatechange = n,
                        e._xhr = null,
                        e._status = t.status,
                        t.status >= 200 && t.status < 300 ? (e._response = t.responseText,
                        e.trigger("load")) : t.status >= 500 && t.status < 600 ? (e._response = t.responseText,
                        e.trigger("error", "server")) : e.trigger("error", e._status ? "http" : "abort")) : void 0
                    }
                    ,
                    e._xhr = t,
                    t
                },
                _setRequestHeader: function (e, t) {
                    r.each(t, function (t, n) {
                        e.setRequestHeader(t, n)
                    })
                },
                _parseJson: function (e) {
                    var t;
                    try {
                        t = JSON.parse(e)
                    } catch (n) {
                        t = {}
                    }
                    return t
                }
            })
        }),
        t("runtime/html5/md5", ["runtime/html5/runtime"], function (e) {
            var t = function (e, t) {
                return e + t & 4294967295
            }
              , n = function (e, n, r, i, o, a) {
                  return n = t(t(n, e), t(i, a)),
                  t(n << o | n >>> 32 - o, r)
              }
              , r = function (e, t, r, i, o, a, s) {
                  return n(t & r | ~t & i, e, t, o, a, s)
              }
              , i = function (e, t, r, i, o, a, s) {
                  return n(t & i | r & ~i, e, t, o, a, s)
              }
              , o = function (e, t, r, i, o, a, s) {
                  return n(t ^ r ^ i, e, t, o, a, s)
              }
              , a = function (e, t, r, i, o, a, s) {
                  return n(r ^ (t | ~i), e, t, o, a, s)
              }
              , s = function (e, n) {
                  var s = e[0]
                    , u = e[1]
                    , c = e[2]
                    , l = e[3];
                  s = r(s, u, c, l, n[0], 7, -680876936),
                  l = r(l, s, u, c, n[1], 12, -389564586),
                  c = r(c, l, s, u, n[2], 17, 606105819),
                  u = r(u, c, l, s, n[3], 22, -1044525330),
                  s = r(s, u, c, l, n[4], 7, -176418897),
                  l = r(l, s, u, c, n[5], 12, 1200080426),
                  c = r(c, l, s, u, n[6], 17, -1473231341),
                  u = r(u, c, l, s, n[7], 22, -45705983),
                  s = r(s, u, c, l, n[8], 7, 1770035416),
                  l = r(l, s, u, c, n[9], 12, -1958414417),
                  c = r(c, l, s, u, n[10], 17, -42063),
                  u = r(u, c, l, s, n[11], 22, -1990404162),
                  s = r(s, u, c, l, n[12], 7, 1804603682),
                  l = r(l, s, u, c, n[13], 12, -40341101),
                  c = r(c, l, s, u, n[14], 17, -1502002290),
                  u = r(u, c, l, s, n[15], 22, 1236535329),
                  s = i(s, u, c, l, n[1], 5, -165796510),
                  l = i(l, s, u, c, n[6], 9, -1069501632),
                  c = i(c, l, s, u, n[11], 14, 643717713),
                  u = i(u, c, l, s, n[0], 20, -373897302),
                  s = i(s, u, c, l, n[5], 5, -701558691),
                  l = i(l, s, u, c, n[10], 9, 38016083),
                  c = i(c, l, s, u, n[15], 14, -660478335),
                  u = i(u, c, l, s, n[4], 20, -405537848),
                  s = i(s, u, c, l, n[9], 5, 568446438),
                  l = i(l, s, u, c, n[14], 9, -1019803690),
                  c = i(c, l, s, u, n[3], 14, -187363961),
                  u = i(u, c, l, s, n[8], 20, 1163531501),
                  s = i(s, u, c, l, n[13], 5, -1444681467),
                  l = i(l, s, u, c, n[2], 9, -51403784),
                  c = i(c, l, s, u, n[7], 14, 1735328473),
                  u = i(u, c, l, s, n[12], 20, -1926607734),
                  s = o(s, u, c, l, n[5], 4, -378558),
                  l = o(l, s, u, c, n[8], 11, -2022574463),
                  c = o(c, l, s, u, n[11], 16, 1839030562),
                  u = o(u, c, l, s, n[14], 23, -35309556),
                  s = o(s, u, c, l, n[1], 4, -1530992060),
                  l = o(l, s, u, c, n[4], 11, 1272893353),
                  c = o(c, l, s, u, n[7], 16, -155497632),
                  u = o(u, c, l, s, n[10], 23, -1094730640),
                  s = o(s, u, c, l, n[13], 4, 681279174),
                  l = o(l, s, u, c, n[0], 11, -358537222),
                  c = o(c, l, s, u, n[3], 16, -722521979),
                  u = o(u, c, l, s, n[6], 23, 76029189),
                  s = o(s, u, c, l, n[9], 4, -640364487),
                  l = o(l, s, u, c, n[12], 11, -421815835),
                  c = o(c, l, s, u, n[15], 16, 530742520),
                  u = o(u, c, l, s, n[2], 23, -995338651),
                  s = a(s, u, c, l, n[0], 6, -198630844),
                  l = a(l, s, u, c, n[7], 10, 1126891415),
                  c = a(c, l, s, u, n[14], 15, -1416354905),
                  u = a(u, c, l, s, n[5], 21, -57434055),
                  s = a(s, u, c, l, n[12], 6, 1700485571),
                  l = a(l, s, u, c, n[3], 10, -1894986606),
                  c = a(c, l, s, u, n[10], 15, -1051523),
                  u = a(u, c, l, s, n[1], 21, -2054922799),
                  s = a(s, u, c, l, n[8], 6, 1873313359),
                  l = a(l, s, u, c, n[15], 10, -30611744),
                  c = a(c, l, s, u, n[6], 15, -1560198380),
                  u = a(u, c, l, s, n[13], 21, 1309151649),
                  s = a(s, u, c, l, n[4], 6, -145523070),
                  l = a(l, s, u, c, n[11], 10, -1120210379),
                  c = a(c, l, s, u, n[2], 15, 718787259),
                  u = a(u, c, l, s, n[9], 21, -343485551),
                  e[0] = t(s, e[0]),
                  e[1] = t(u, e[1]),
                  e[2] = t(c, e[2]),
                  e[3] = t(l, e[3])
              }
              , u = function (e) {
                  var t, n = [];
                  for (t = 0; 64 > t; t += 4)
                      n[t >> 2] = e.charCodeAt(t) + (e.charCodeAt(t + 1) << 8) + (e.charCodeAt(t + 2) << 16) + (e.charCodeAt(t + 3) << 24);
                  return n
              }
              , c = function (e) {
                  var t, n = [];
                  for (t = 0; 64 > t; t += 4)
                      n[t >> 2] = e[t] + (e[t + 1] << 8) + (e[t + 2] << 16) + (e[t + 3] << 24);
                  return n
              }
              , l = function (e) {
                  var t, n, r, i, o, a, c = e.length, l = [1732584193, -271733879, -1732584194, 271733878];
                  for (t = 64; c >= t; t += 64)
                      s(l, u(e.substring(t - 64, t)));
                  for (e = e.substring(t - 64),
                  n = e.length,
                  r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  t = 0; n > t; t += 1)
                      r[t >> 2] |= e.charCodeAt(t) << (t % 4 << 3);
                  if (r[t >> 2] |= 128 << (t % 4 << 3),
                  t > 55)
                      for (s(l, r),
                      t = 0; 16 > t; t += 1)
                          r[t] = 0;
                  return i = 8 * c,
                  i = i.toString(16).match(/(.*?)(.{0,8})$/),
                  o = parseInt(i[2], 16),
                  a = parseInt(i[1], 16) || 0,
                  r[14] = o,
                  r[15] = a,
                  s(l, r),
                  l
              }
              , f = function (e) {
                  var t, n, r, i, o, a, u = e.length, l = [1732584193, -271733879, -1732584194, 271733878];
                  for (t = 64; u >= t; t += 64)
                      s(l, c(e.subarray(t - 64, t)));
                  for (e = u > t - 64 ? e.subarray(t - 64) : new Uint8Array(0),
                  n = e.length,
                  r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  t = 0; n > t; t += 1)
                      r[t >> 2] |= e[t] << (t % 4 << 3);
                  if (r[t >> 2] |= 128 << (t % 4 << 3),
                  t > 55)
                      for (s(l, r),
                      t = 0; 16 > t; t += 1)
                          r[t] = 0;
                  return i = 8 * u,
                  i = i.toString(16).match(/(.*?)(.{0,8})$/),
                  o = parseInt(i[2], 16),
                  a = parseInt(i[1], 16) || 0,
                  r[14] = o,
                  r[15] = a,
                  s(l, r),
                  l
              }
              , d = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]
              , h = function (e) {
                  var t, n = "";
                  for (t = 0; 4 > t; t += 1)
                      n += d[e >> 8 * t + 4 & 15] + d[e >> 8 * t & 15];
                  return n
              }
              , p = function (e) {
                  var t;
                  for (t = 0; t < e.length; t += 1)
                      e[t] = h(e[t]);
                  return e.join("")
              }
              , g = function (e) {
                  return p(l(e))
              }
              , m = function () {
                  this.reset()
              };
            return "5d41402abc4b2a76b9719d911017c592" !== g("hello") && (t = function (e, t) {
                var n = (65535 & e) + (65535 & t)
                  , r = (e >> 16) + (t >> 16) + (n >> 16);
                return r << 16 | 65535 & n
            }
            ),
            m.prototype.append = function (e) {
                return /[\u0080-\uFFFF]/.test(e) && (e = unescape(encodeURIComponent(e))),
                this.appendBinary(e),
                this
            }
            ,
            m.prototype.appendBinary = function (e) {
                this._buff += e,
                this._length += e.length;
                var t, n = this._buff.length;
                for (t = 64; n >= t; t += 64)
                    s(this._state, u(this._buff.substring(t - 64, t)));
                return this._buff = this._buff.substr(t - 64),
                this
            }
            ,
            m.prototype.end = function (e) {
                var t, n, r = this._buff, i = r.length, o = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (t = 0; i > t; t += 1)
                    o[t >> 2] |= r.charCodeAt(t) << (t % 4 << 3);
                return this._finish(o, i),
                n = e ? this._state : p(this._state),
                this.reset(),
                n
            }
            ,
            m.prototype._finish = function (e, t) {
                var n, r, i, o = t;
                if (e[o >> 2] |= 128 << (o % 4 << 3),
                o > 55)
                    for (s(this._state, e),
                    o = 0; 16 > o; o += 1)
                        e[o] = 0;
                n = 8 * this._length,
                n = n.toString(16).match(/(.*?)(.{0,8})$/),
                r = parseInt(n[2], 16),
                i = parseInt(n[1], 16) || 0,
                e[14] = r,
                e[15] = i,
                s(this._state, e)
            }
            ,
            m.prototype.reset = function () {
                return this._buff = "",
                this._length = 0,
                this._state = [1732584193, -271733879, -1732584194, 271733878],
                this
            }
            ,
            m.prototype.destroy = function () {
                delete this._state,
                delete this._buff,
                delete this._length
            }
            ,
            m.hash = function (e, t) {
                /[\u0080-\uFFFF]/.test(e) && (e = unescape(encodeURIComponent(e)));
                var n = l(e);
                return t ? n : p(n)
            }
            ,
            m.hashBinary = function (e, t) {
                var n = l(e);
                return t ? n : p(n)
            }
            ,
            m.ArrayBuffer = function () {
                this.reset()
            }
            ,
            m.ArrayBuffer.prototype.append = function (e) {
                var t, n = this._concatArrayBuffer(this._buff, e), r = n.length;
                for (this._length += e.byteLength,
                t = 64; r >= t; t += 64)
                    s(this._state, c(n.subarray(t - 64, t)));
                return this._buff = r > t - 64 ? n.subarray(t - 64) : new Uint8Array(0),
                this
            }
            ,
            m.ArrayBuffer.prototype.end = function (e) {
                var t, n, r = this._buff, i = r.length, o = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (t = 0; i > t; t += 1)
                    o[t >> 2] |= r[t] << (t % 4 << 3);
                return this._finish(o, i),
                n = e ? this._state : p(this._state),
                this.reset(),
                n
            }
            ,
            m.ArrayBuffer.prototype._finish = m.prototype._finish,
            m.ArrayBuffer.prototype.reset = function () {
                return this._buff = new Uint8Array(0),
                this._length = 0,
                this._state = [1732584193, -271733879, -1732584194, 271733878],
                this
            }
            ,
            m.ArrayBuffer.prototype.destroy = m.prototype.destroy,
            m.ArrayBuffer.prototype._concatArrayBuffer = function (e, t) {
                var n = e.length
                  , r = new Uint8Array(n + t.byteLength);
                return r.set(e),
                r.set(new Uint8Array(t), n),
                r
            }
            ,
            m.ArrayBuffer.hash = function (e, t) {
                var n = f(new Uint8Array(e));
                return t ? n : p(n)
            }
            ,
            e.register("Md5", {
                init: function () { },
                loadFromBlob: function (e) {
                    var t, n, r = e.getSource(), i = 2097152, o = Math.ceil(r.size / i), a = 0, s = this.owner, u = new m.ArrayBuffer, c = this, l = r.mozSlice || r.webkitSlice || r.slice;
                    n = new FileReader,
                    (t = function () {
                        var f, d;
                        f = a * i,
                        d = Math.min(f + i, r.size),
                        n.onload = function (t) {
                            u.append(t.target.result),
                            s.trigger("progress", {
                                total: e.size,
                                loaded: d
                            })
                        }
                        ,
                        n.onloadend = function () {
                            n.onloadend = n.onload = null,
                            ++a < o ? setTimeout(t, 1) : setTimeout(function () {
                                s.trigger("load"),
                                c.result = u.end(),
                                t = e = r = u = null,
                                s.trigger("complete")
                            }, 50)
                        }
                        ,
                        n.readAsArrayBuffer(l.call(r, f, d))
                    }
                    )()
                },
                getResult: function () {
                    return this.result
                }
            })
        }),
        t("runtime/flash/runtime", ["base", "runtime/runtime", "runtime/compbase"], function (t, n, r) {
            function i() {
                var e;
                try {
                    e = navigator.plugins["Shockwave Flash"],
                    e = e.description
                } catch (t) {
                    try {
                        e = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")
                    } catch (n) {
                        e = "0.0"
                    }
                }
                return e = e.match(/\d+/g),
                parseFloat(e[0] + "." + e[1], 10)
            }
            function o() {
                function r(e, t) {
                    var n, r, i = e.type || e;
                    n = i.split("::"),
                    r = n[0],
                    i = n[1],
                    "Ready" === i && r === c.uid ? c.trigger("ready") : o[r] && o[r].trigger(i.toLowerCase(), e, t)
                }
                var i = {}
                  , o = {}
                  , a = this.destroy
                  , c = this
                  , l = t.guid("webuploader_");
                n.apply(c, arguments),
                c.type = s,
                c.exec = function (e, n) {
                    var r, a = this, s = a.uid, l = t.slice(arguments, 2);
                    return o[s] = a,
                    u[e] && (i[s] || (i[s] = new u[e](a, c)),
                    r = i[s],
                    r[n]) ? r[n].apply(r, l) : c.flashExec.apply(a, arguments)
                }
                ,
                e[l] = function () {
                    var e = arguments;
                    setTimeout(function () {
                        r.apply(null, e)
                    }, 1)
                }
                ,
                this.jsreciver = l,
                this.destroy = function () {
                    return a && a.apply(this, arguments)
                }
                ,
                this.flashExec = function (e, n) {
                    var r = c.getFlash()
                      , i = t.slice(arguments, 2);
                    return r.exec(this.uid, e, n, i)
                }
            }
            var a = t.$
              , s = "flash"
              , u = {};
            return t.inherits(n, {
                constructor: o,
                init: function () {
                    var e, n = this.getContainer(), r = this.options;
                    n.css({
                        position: "absolute",
                        top: "-8px",
                        left: "-8px",
                        width: "9px",
                        height: "9px",
                        overflow: "hidden"
                    }),
                    e = '<object id="' + this.uid + '" type="application/x-shockwave-flash" data="' + r.swf + '" ',
                    t.browser.ie && (e += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '),
                    e += 'width="100%" height="100%" style="outline:0"><param name="movie" value="' + r.swf + '" /><param name="flashvars" value="uid=' + this.uid + "&jsreciver=" + this.jsreciver + '" /><param name="wmode" value="transparent" /><param name="allowscriptaccess" value="always" /></object>',
                    n.html(e)
                },
                getFlash: function () {
                    return this._flash ? this._flash : (this._flash = a("#" + this.uid).get(0),
                    this._flash)
                }
            }),
            o.register = function (e, n) {
                return n = u[e] = t.inherits(r, a.extend({
                    flashExec: function () {
                        var e = this.owner
                          , t = this.getRuntime();
                        return t.flashExec.apply(e, arguments)
                    }
                }, n))
            }
            ,
            i() >= 11.4 && n.addRuntime(s, o),
            o
        }),
        t("runtime/flash/filepicker", ["base", "runtime/flash/runtime"], function (e, t) {
            var n = e.$;
            return t.register("FilePicker", {
                init: function (e) {
                    var t, r, i = n.extend({}, e);
                    for (t = i.accept && i.accept.length,
                    r = 0; t > r; r++)
                        i.accept[r].title || (i.accept[r].title = "Files");
                    delete i.button,
                    delete i.id,
                    delete i.container,
                    this.flashExec("FilePicker", "init", i)
                },
                destroy: function () {
                    this.flashExec("FilePicker", "destroy")
                }
            })
        }),
        t("runtime/flash/image", ["runtime/flash/runtime"], function (e) {
            return e.register("Image", {
                loadFromBlob: function (e) {
                    var t = this.owner;
                    t.info() && this.flashExec("Image", "info", t.info()),
                    t.meta() && this.flashExec("Image", "meta", t.meta()),
                    this.flashExec("Image", "loadFromBlob", e.uid)
                }
            })
        }),
        t("runtime/flash/transport", ["base", "runtime/flash/runtime", "runtime/client"], function (t, n, r) {
            var i = t.$;
            return n.register("Transport", {
                init: function () {
                    this._status = 0,
                    this._response = null,
                    this._responseJson = null
                },
                send: function () {
                    var e, t = this.owner, n = this.options, r = this._initAjax(), o = t._blob, a = n.server;
                    r.connectRuntime(o.ruid),
                    n.sendAsBinary ? (a += (/\?/.test(a) ? "&" : "?") + i.param(t._formData),
                    e = o.uid) : (i.each(t._formData, function (e, t) {
                        r.exec("append", e, t)
                    }),
                    r.exec("appendBlob", n.fileVal, o.uid, n.filename || t._formData.name || "")),
                    this._setRequestHeader(r, n.headers),
                    r.exec("send", {
                        method: n.method,
                        url: a,
                        forceURLStream: n.forceURLStream,
                        mimeType: "application/octet-stream"
                    }, e)
                },
                getStatus: function () {
                    return this._status
                },
                getResponse: function () {
                    return this._response || ""
                },
                getResponseAsJson: function () {
                    return this._responseJson
                },
                abort: function () {
                    var e = this._xhr;
                    e && (e.exec("abort"),
                    e.destroy(),
                    this._xhr = e = null)
                },
                destroy: function () {
                    this.abort()
                },
                _initAjax: function () {
                    var t = this
                      , n = new r("XMLHttpRequest");
                    return n.on("uploadprogress progress", function (e) {
                        var n = e.loaded / e.total;
                        return n = Math.min(1, Math.max(0, n)),
                        t.trigger("progress", n)
                    }),
                    n.on("load", function () {
                        var r, i = n.exec("getStatus"), o = !1, a = "";
                        return n.off(),
                        t._xhr = null,
                        i >= 200 && 300 > i ? o = !0 : i >= 500 && 600 > i ? (o = !0,
                        a = "server") : a = "http",
                        o && (t._response = n.exec("getResponse"),
                        t._response = decodeURIComponent(t._response),
                        r = e.JSON && e.JSON.parse || function (e) {
                            try {
                                return new Function("return " + e).call()
                            } catch (t) {
                                return {}
                            }
                        }
                        ,
                        t._responseJson = t._response ? r(t._response) : {}),
                        n.destroy(),
                        n = null,
                        a ? t.trigger("error", a) : t.trigger("load")
                    }),
                    n.on("error", function () {
                        n.off(),
                        t._xhr = null,
                        t.trigger("error", "http")
                    }),
                    t._xhr = n,
                    n
                },
                _setRequestHeader: function (e, t) {
                    i.each(t, function (t, n) {
                        e.exec("setRequestHeader", t, n)
                    })
                }
            })
        }),
        t("runtime/flash/blob", ["runtime/flash/runtime", "lib/blob"], function (e, t) {
            return e.register("Blob", {
                slice: function (e, n) {
                    var r = this.flashExec("Blob", "slice", e, n);
                    return new t(r.uid, r)
                }
            })
        }),
        t("runtime/flash/md5", ["runtime/flash/runtime"], function (e) {
            return e.register("Md5", {
                init: function () { },
                loadFromBlob: function (e) {
                    return this.flashExec("Md5", "loadFromBlob", e.uid)
                }
            })
        }),
        t("preset/all", ["base", "widgets/filednd", "widgets/filepaste", "widgets/filepicker", "widgets/image", "widgets/queue", "widgets/runtime", "widgets/upload", "widgets/validator", "widgets/md5", "runtime/html5/blob", "runtime/html5/dnd", "runtime/html5/filepaste", "runtime/html5/filepicker", "runtime/html5/imagemeta/exif", "runtime/html5/androidpatch", "runtime/html5/image", "runtime/html5/transport", "runtime/html5/md5", "runtime/flash/filepicker", "runtime/flash/image", "runtime/flash/transport", "runtime/flash/blob", "runtime/flash/md5"], function (e) {
            return e
        }),
        t("widgets/log", ["base", "uploader", "widgets/widget"], function (e, t) {
            function n(e) {
                var t = i.extend({}, r, e)
                  , n = o.replace(/^(.*)\?/, "$1" + i.param(t))
                  , a = new Image;
                a.src = n
            }
            var r, i = e.$, o = " http://static.tieba.baidu.com/tb/pms/img/st.gif??", a = (location.hostname || location.host || "protected").toLowerCase(), s = a && /baidu/i.exec(a);
            return s ? (r = {
                dv: 3,
                master: "webuploader",
                online: /test/.exec(a) ? 0 : 1,
                module: "",
                product: a,
                type: 0
            },
            t.register({
                name: "log",
                init: function () {
                    var e = this.owner
                      , t = 0
                      , r = 0;
                    e.on("error", function (e) {
                        n({
                            type: 2,
                            c_error_code: e
                        })
                    }).on("uploadError", function (e, t) {
                        n({
                            type: 2,
                            c_error_code: "UPLOAD_ERROR",
                            c_reason: "" + t
                        })
                    }).on("uploadComplete", function (e) {
                        t++,
                        r += e.size
                    }).on("uploadFinished", function () {
                        n({
                            c_count: t,
                            c_size: r
                        }),
                        t = r = 0
                    }),
                    n({
                        c_usage: 1
                    })
                }
            })) : void 0
        }),
        t("webuploader", ["preset/all", "widgets/log"], function (e) {
            return e
        }),
        n("webuploader")
    })
});
