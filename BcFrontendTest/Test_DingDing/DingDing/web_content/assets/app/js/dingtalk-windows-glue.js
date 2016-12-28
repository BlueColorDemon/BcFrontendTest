(function e(t, n, r) {
	function s(o, u) {
		if(!n[o]) {
			if(!t[o]) {
				var a = typeof require == "function" && require;
				if(!u && a) return a(o, !0);
				if(i) return i(o, !0);
				var f = new Error("Cannot find module '" + o + "'");
				throw f.code = "MODULE_NOT_FOUND", f
			}
			var l = n[o] = {
				exports: {}
			};
			t[o][0].call(l.exports, function(e) {
				var n = t[o][1][e];
				return s(n ? n : e)
			}, l, l.exports, e, t, n, r)
		}
		return n[o].exports
	}
	var i = typeof require == "function" && require;
	for(var o = 0; o < r.length; o++) s(r[o]);
	return s
})({
	1: [function(require, module, exports) {
		"object" != typeof window.dingtalkWindowsGlue && (window.dingtalkWindowsGlue = {});
		var sqlite3 = require("./dingtalkWindows/sqlite3"),
			eventProxy = require("./dingtalkWindows/eventProxy"),
			SearchIndex = require("./dingtalkWindows/SearchIndex"),
			SearchProvider = require("./dingtalkWindows/SearchProvider"),
			globalShortcut = require("./dingtalkWindows/globalShortCut");
		window.dingtalkWindowsGlue.sqlite3 = sqlite3, window.dingtalkWindowsGlue.SearchIndex = SearchIndex, window.dingtalkWindowsGlue.SearchProvider = SearchProvider, window.dingtalkWindowsGlue.eventProxy = eventProxy, window.dingtalkWindowsGlue.globalShortcut = globalShortcut;
	}, {
		"./dingtalkWindows/SearchIndex": 2,
		"./dingtalkWindows/SearchProvider": 3,
		"./dingtalkWindows/eventProxy": 5,
		"./dingtalkWindows/globalShortCut": 6,
		"./dingtalkWindows/sqlite3": 7
	}],
	2: [function(require, module, exports) {
		function SearchIndex() {
			this.reset()
		}
		SearchIndex.prototype.reset = function() {
			this.index_field = [], this.index_source = {}
		}, SearchIndex.prototype.TokenizerType = {
			TOKENZIER_TYPE_NAME: 0,
			TOKENZIER_TYPE_PHONE: 1,
			TOKENZIER_TYPE_TEXT: 2,
			TOKENZIER_TYPE_NOTOKEN: 3
		}, SearchIndex.prototype.addIndexField = function(e, i) {
			var n = {};
			n.field_name = e, n.tokenizer_type = i, this.index_field.push(n)
		}, SearchIndex.prototype.getIndexField = function() {
			return this.index_field
		}, SearchIndex.prototype.addIndexSource = function(e, i, n, t, d, r) {
			this.index_source.index_name = e, this.index_source.db_name = i, this.index_source.table_name = n, this.index_source.key_field = t, this.index_source.where_condition = d, this.index_source.start_rowid = r
		}, SearchIndex.prototype.getIndexSource = function() {
			return this.index_source
		}, SearchIndex.prototype.stringify = function() {
			return this.index_source.index_field = this.index_field, JSON.stringify(this.index_source)
		}, module.exports = SearchIndex;

	}, {}],
	3: [function(require, module, exports) {
		function SearchProvider() {
			this.searchProvider = dingtalk.sqlite3.searchProvider()
		}
		SearchProvider.prototype.open = function(r, e) {
			this.searchProvider.open(r, e)
		}, SearchProvider.prototype.setDBConnection = function(r, e, o, t) {
			this.searchProvider.setDBConnection(r, e.sqliteHandler(""), o.sqliteHandler(""), t.sqliteHandler(""))
		}, SearchProvider.prototype.addSourceToIndex = function(r) {
			this.searchProvider.addSourceToIndex(r)
		}, SearchProvider.prototype.search = function(r, e, o, t, i, c) {
			this.searchProvider.search(r, e, o, t, i, function(r) {
				var e = require("./SearchResult"),
					o = new e;
				o.parseSearchResult(r), c && c(o)
			})
		}, SearchProvider.prototype.startScan = function() {
			this.searchProvider.startScan()
		}, SearchProvider.prototype.startHook = function() {
			this.searchProvider.startHook()
		}, SearchProvider.prototype.deleteAllIndexAndData = function(r) {
			this.searchProvider.deleteAllIndexAndData(function() {
				r && r()
			})
		}, SearchProvider.prototype.close = function() {
			this.searchProvider.close()
		}, SearchProvider.prototype.stop = function() {
			this.searchProvider.stop()
		}, module.exports = SearchProvider;

	}, {
		"./SearchResult": 4
	}],
	4: [function(require, module, exports) {
		function SearchResult() {
			this.docs_found = 0, this.docs_return = 0, this.table_result = []
		}

		function TableResult() {
			this.db_name = "", this.table_name = "", this.key_field = "", this.docs_found = 0, this.docs_return = 0, this.row_result = []
		}

		function RowResult() {
			this.pkey = 0, this.field_id = 0
		}
		SearchResult.prototype.parseSearchResult = function(e) {
			var t = JSON.parse(e);
			this.docs_found = t.docs_found, this.docs_return = t.docs_return;
			for(var s = t.table_result, r = 0; r < s.length; ++r) {
				var o = s[r],
					u = new TableResult;
				u.db_name = o.db_name, u.table_name = o.table_name, u.key_field = o.key_field, u.docs_found = o.docs_found, u.docs_return = o.docs_return;
				for(var d = o.row_result, l = 0; l < d.length; ++l) {
					var n = d[l],
						_ = new RowResult;
					_.pkey = n.pkey, _.field_id = n.field_id, u.row_result.push(_)
				}
				this.table_result.push(u)
			}
		}, module.exports = SearchResult;
	}, {}],
	5: [function(require, module, exports) {
		var EventEmitter = require("wolfy87-eventemitter"),
			eventProxy = new EventEmitter;
		dingtalk.event.register(function(e, t) {
			try {
				var t = JSON.parse(t)
			} catch(e) {}
			eventProxy.emit(e, t)
		}), module.exports = eventProxy;
	}, {
		"wolfy87-eventemitter": 8
	}],
	6: [function(require, module, exports) {
		"use strict";
		var eventProxy = require("./eventProxy"),
			hotKeyHandlerCache = {},
			isInited = !1,
			_eventHandler = function(e) {
				hotKeyHandlerCache[e] && "function" == typeof hotKeyHandlerCache[e].onActive && hotKeyHandlerCache[e].onActive()
			},
			initEvent = function() {
				eventProxy.addListener("ShortCutKey", _eventHandler)
			},
			registerGlobalHotKey = function(e, t, n) {
				isInited === !1 && initEvent(), dingtalk.window.regHotKey(e, function(o, r) {
					o ? n && n(o) : hotKeyHandlerCache[e] = {
						onActive: t,
						onFail: n
					}
				})
			},
			unregisterGlobalHotKey = function(e, t, n) {
				dingtalk.window.unRegHotKey(e), hotKeyHandlerCache[e] = {}
			};
		exports.registerGlobalHotKey = registerGlobalHotKey, exports.unregisterGlobalHotKey = unregisterGlobalHotKey;

	}, {
		"./eventProxy": 5
	}],
	7: [function(require, module, exports) {
		function normalizeMethod(t) {
			return function(n) {
				var e, i = Array.prototype.slice.call(arguments, 1);
				if("function" == typeof i[i.length - 1]) {
					var a = i[i.length - 1];
					e = function(t) {
						t && a(t)
					}
				}
				var r = new Statement(this.database, n, e);
				return t.call(this, r, i)
			}
		}

		function Database(t, n) {
			var e = dingtalk.sqlite3.database(t, n);
			Object.keys(e).map(function(t) {
				var n = e[t];
				"function" == typeof n ? this[t] = n.bind(e) : function() {
					Object.defineProperty(this, t, {
						enumerable: !0,
						get: function() {
							return e[t]
						},
						set: function(n) {
							return e[t] = n
						}
					})
				}.bind(this)(t)
			}.bind(this)), this.database = e, this.prepare = normalizeMethod(function(t, n) {
				return n.length ? t.bind.apply(t, n) : t
			}), this.run = normalizeMethod(function(t, n) {
				return t.run.apply(t, n).finalize(), this
			}), this.get = normalizeMethod(function(t, n) {
				return t.get.apply(t, n).finalize(), this
			}), this.all = normalizeMethod(function(t, n) {
				return t.all.apply(t, n).finalize(), this
			}), this.each = normalizeMethod(function(t, n) {
				return t.each.apply(t, n).finalize(), this
			}), this.map = normalizeMethod(function(t, n) {
				return t.map.apply(t, n).finalize(), this
			})
		}

		function Statement(t, n, e) {
			var i = dingtalk.sqlite3.statement(t, n, e);
			return i.map = function() {
				var t = Array.prototype.slice.call(arguments),
					n = t.pop();
				return t.push(function(t, e) {
					if(t) return n(t);
					var i = {};
					if(e.length) {
						var a = Object.keys(e[0]),
							r = a[0];
						if(a.length > 2)
							for(var l = 0; l < e.length; l++) i[e[l][r]] = e[l];
						else
							for(var o = a[1], l = 0; l < e.length; l++) i[e[l][r]] = e[l][o]
					}
					n(t, i)
				}), this.all.apply(this, t)
			}, i
		}
		exports.Database = Database;

	}, {}],
	8: [function(require, module, exports) {
		(function() {
			"use strict";

			function e() {}

			function t(e, t) {
				for(var n = e.length; n--;)
					if(e[n].listener === t) return n;
				return -1
			}

			function n(e) {
				return function() {
					return this[e].apply(this, arguments)
				}
			}
			var r = e.prototype,
				i = this,
				s = i.EventEmitter;
			r.getListeners = function(e) {
				var t, n, r = this._getEvents();
				if(e instanceof RegExp) {
					t = {};
					for(n in r) r.hasOwnProperty(n) && e.test(n) && (t[n] = r[n])
				} else t = r[e] || (r[e] = []);
				return t
			}, r.flattenListeners = function(e) {
				var t, n = [];
				for(t = 0; t < e.length; t += 1) n.push(e[t].listener);
				return n
			}, r.getListenersAsObject = function(e) {
				var t, n = this.getListeners(e);
				return n instanceof Array && (t = {}, t[e] = n), t || n
			}, r.addListener = function(e, n) {
				var r, i = this.getListenersAsObject(e),
					s = "object" == typeof n;
				for(r in i) i.hasOwnProperty(r) && t(i[r], n) === -1 && i[r].push(s ? n : {
					listener: n,
					once: !1
				});
				return this
			}, r.on = n("addListener"), r.addOnceListener = function(e, t) {
				return this.addListener(e, {
					listener: t,
					once: !0
				})
			}, r.once = n("addOnceListener"), r.defineEvent = function(e) {
				return this.getListeners(e), this
			}, r.defineEvents = function(e) {
				for(var t = 0; t < e.length; t += 1) this.defineEvent(e[t]);
				return this
			}, r.removeListener = function(e, n) {
				var r, i, s = this.getListenersAsObject(e);
				for(i in s) s.hasOwnProperty(i) && (r = t(s[i], n), r !== -1 && s[i].splice(r, 1));
				return this
			}, r.off = n("removeListener"), r.addListeners = function(e, t) {
				return this.manipulateListeners(!1, e, t)
			}, r.removeListeners = function(e, t) {
				return this.manipulateListeners(!0, e, t)
			}, r.manipulateListeners = function(e, t, n) {
				var r, i, s = e ? this.removeListener : this.addListener,
					o = e ? this.removeListeners : this.addListeners;
				if("object" != typeof t || t instanceof RegExp)
					for(r = n.length; r--;) s.call(this, t, n[r]);
				else
					for(r in t) t.hasOwnProperty(r) && (i = t[r]) && ("function" == typeof i ? s.call(this, r, i) : o.call(this, r, i));
				return this
			}, r.removeEvent = function(e) {
				var t, n = typeof e,
					r = this._getEvents();
				if("string" === n) delete r[e];
				else if(e instanceof RegExp)
					for(t in r) r.hasOwnProperty(t) && e.test(t) && delete r[t];
				else delete this._events;
				return this
			}, r.removeAllListeners = n("removeEvent"), r.emitEvent = function(e, t) {
				var n, r, i, s, o = this.getListenersAsObject(e);
				for(i in o)
					if(o.hasOwnProperty(i))
						for(r = o[i].length; r--;) n = o[i][r], n.once === !0 && this.removeListener(e, n.listener), s = n.listener.apply(this, t || []), s === this._getOnceReturnValue() && this.removeListener(e, n.listener);
				return this
			}, r.trigger = n("emitEvent"), r.emit = function(e) {
				var t = Array.prototype.slice.call(arguments, 1);
				return this.emitEvent(e, t)
			}, r.setOnceReturnValue = function(e) {
				return this._onceReturnValue = e, this
			}, r._getOnceReturnValue = function() {
				return !this.hasOwnProperty("_onceReturnValue") || this._onceReturnValue
			}, r._getEvents = function() {
				return this._events || (this._events = {})
			}, e.noConflict = function() {
				return i.EventEmitter = s, e
			}, "function" == typeof define && define.amd ? define(function() {
				return e
			}) : "object" == typeof module && module.exports ? module.exports = e : i.EventEmitter = e
		}).call(this);
	}, {}]
}, {}, [1]);