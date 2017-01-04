
[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.conversationWithSDK"
      , WKEngine = require("@ali/wksdk")
      , ConvExtensionType = require("./convExtensionType")
      , SHOW_HISTORY_TYPE = WKEngine.showHistoryType
      , _ = require("lodash")
      , $my = require("../user/my")
      , EventEmitter = require("wolfy87-eventemitter")
      , localLog = require("../log/localLog")
      , EVENTS = require("../events");
    angular.module(moduleName, [require("./ConvWithSDK"), require("../log/log"), require("../log/lwlog"), require("@ali/ding-api").interface.ConversationI, require("../microApp/microAppData"), require("./msg/msgFactoryWithSDK"), require("./../user/userManager")]).factory("conversationWithSDK", ["$rootScope", "$state", "log", "ConvWithSDK", "ConversationI", "microAppData", "userManager", "lwlog", function (e, n, t, i, r, o, a, u) {
        var c = WKEngine.conversationService
          , d = {}
          , s = {
              order: [],
              pinOrder: [],
              activeConvId: null,
              lastActiveConvId: null,
              isLoading: !0
          }
          , v = !1
          , l = null
          , f = new EventEmitter
          , g = {
              emitter: f,
              EVENTS: {
                  ORDER_CHANGE: "order_change",
                  ACTIVE_CONV_CHANGE: "active_conv_change"
              }
          }
          , C = function () {
              return g
          }
          , m = function () {
              setTimeout(function () {
                  var e = P();
                  e ? c.makeConvTopByCid(e.convId) : r.getFilesHelperConversationId(function (e) {
                      if (200 === e.code) {
                          var n = e.body;
                          c.makeConvTopByCid(n)
                      }
                  })
              }, 5e3)
          }
          , p = function () {
              return s
          }
          , h = function () {
              return d
          }
          , E = function () {
              return s.activeConvId ? d[s.activeConvId] : null
          }
          , y = function (e, t, i) {
              return M(e).then(function (r) {
                  if (r) {
                      var o = !1;
                      return s.activeConvId === e && i && (o = !0),
                      s.activeConvId && d[s.activeConvId] && d[s.activeConvId].deactive(),
                      r.active(),
                      s.activeConvId = s.lastActiveConvId = e,
                      g.emitter.emitEvent(g.EVENTS.ACTIVE_CONV_CHANGE),
                      r.isRedirectType ? r.baseConversation.extension && r.baseConversation.extension.type === ConvExtensionType.FRIEND ? n.go("authorized.im.friendRequest") : r.baseConversation.extension && r.baseConversation.extension.type === ConvExtensionType.GROUPREQUEST ? n.go("authorized.im.groupRequest") : Promise.resolve() : n.go("authorized.im.chat", {
                          id: e,
                          searchMessageId: t,
                          keyword: i
                      }, {
                          reload: o
                      })
                  }
                  return Promise.resolve()
              })
          }
          , I = function (e) {
              return d[e] ? d[e] : (t.error("File: conversationWithSDK, Func: getConvObj, Detail: cannot find convObj with id: ", e),
              null)
          }
          , O = function (e, n, t) {
              return c.hideConv(e)
          }
          , w = function (e) {
              if (d[e])
                  return d[e].quit()
          }
          , S = function (e) {
              return c.hideConv(e)
          }
          , T = function (e, n, t) {
              return d[e].addMembers(n, t)
          }
          , N = function (e, n, t) {
              d[e].removeMembers(n, t)
          }
          , M = function (e, n) {
              return c.getConvByCid(e, n).then(function (e) {
                  return D(e)
              })
          }
          , b = function (e, n) {
              d[e].updateTitle(n)
          }
          , q = function (e) {
              return e.sort(function (e, n) {
                  return parseInt(e, 10) - parseInt(n, 10)
              }).join(":")
          }
          , A = function (e, n, t, i) {
              if (e.unshift($my.uid),
              e = _.uniq(e),
              2 === e.length) {
                  var r = q(e);
                  return void (i && i(!0, r))
              }
              var o, u = e.slice(0, 5), n = n || "", d = t.isOrg, s = t.oid;
              if (d && (void 0 === s || null === s))
                  throw new Error("创建企业群需要oid");
              var v = d ? 2 : 0;
              a.getUsers(u).then(function (t) {
                  n || (n = t.map(function (e) {
                      return e.userProfileModel.nick
                  }).join(","),
                  e.length > 5 && (n += "等")),
                  o = "$:" + JSON.stringify(t.slice(0, 4).map(function (e) {
                      return {
                          uId: e.userProfileModel.uid.toString(),
                          mediaId: e.userProfileModel.avatarMediaId,
                          nick: e.userProfileModel.nick
                      }
                  }));
                  var r = {
                      openIds: e,
                      title: n,
                      showHistoryType: SHOW_HISTORY_TYPE.ON,
                      icon: o,
                      type: 2,
                      tag: v
                  };
                  return s && (r.extension = {
                      id: String(s)
                  }),
                  c.createConversation(r, $my.userProfileModel.nick + "发起了群聊").then(function (e) {
                      i && i(!0, e)
                  }).catch(function (e) {
                      i && i(!1, e)
                  })
              })
          }
          , x = function (e) { }
          , D = function (e) {
              var n = e.cid;
              return d[n] ? d[n] : d[n] = new i(e, !0)
          }
          , H = function (e, n) {
              var e = e || s.activeConvId;
              e && M(e, !0).then(function (e) {
                  n && _.get(e, "baseConversation.extension.id") != n || e.messages.forEach(function (e) {
                      e.decrypt()
                  })
              });
              var t = h();
              Object.keys(t).forEach(function (e) {
                  var i = t[e];
                  n && _.get(i, "baseConversation.extension.id") != n || i && i._lastMsg && i._lastMsg.decrypt()
              })
          }
          , k = function (e) {
              return e ? M(e, !0).then(function (e) {
                  return e.getOrgData()
              }) : Promise.reject(new Error("get corpid by cid error when cid is null"))
          }
          , W = function (n) {
              var t = d[n];
              t && t.destroy(),
              d[n] = null,
              t && t.newMsg && 0 != t.newMsg && e.$broadcast(EVENTS.NEW_MSG_COUNT_CHANGE)
          }
          , $ = function (t) {
              var i = !1
                , r = [];
              t.pinOrder.forEach(function (e) {
                  if (d[e])
                      var n = d[e];
                  else {
                      var n = D(c.getConvByCidSync(e));
                      !n.notificationOff && n.newMsg && (i = !0)
                  }
                  n.allowedShow === !0 && r.push(e)
              }),
              s.pinOrder = r;
              var o = [];
              if (t.order.forEach(function (e) {
                  if (d[e])
                      var n = d[e];
              else {
                      var n = D(c.getConvByCidSync(e));
                      !n.notificationOff && n.newMsg && (i = !0)
              }
                  n.allowedShow === !0 && (o.push(e),
                  !n.notificationOff && n.newMsg && (i = !0))
              }),
              s.order = o,
              WKEngine.syncSinglePackageActionMerge.registerAction("conversaionListUpdate", function () {
                  s.activeConvId && s.pinOrder.indexOf(s.activeConvId) === -1 && s.order.indexOf(s.activeConvId) === -1 && (n.go("^.nocontent"),
                  e.$digest(),
                  s.activeConvId = null,
                  s.lastActiveConvId = null),
                  i === !0 && e.$broadcast(EVENTS.NEW_MSG_COUNT_CHANGE),
                  g.emitter.emitEvent(g.EVENTS.ORDER_CHANGE)
              }
              .bind(this)),
              (t.pinOrder && t.pinOrder.length || t.order && t.order.length) && (s.isLoading = !1,
              l)) {
                  var a = window.performance.now()
                    , v = Math.floor(a - l);
                  u.commLog("pc_conversation_list_init_time", "time=" + v),
                  l = null
              }
          }
          , P = function () {
              for (var e, n = 0; n < s.pinOrder.length - 1;) {
                  var t = d[s.pinOrder[n]];
                  if (t && t.isFileHelper()) {
                      e = t;
                      break
                  }
                  n += 1
              }
              if (e)
                  return e;
              for (var n = 0; n < s.order.length - 1;) {
                  var t = d[s.order[n]];
                  if (t && t.isFileHelper()) {
                      e = t;
                      break
                  }
                  n += 1
              }
              return e
          }
          , L = function () {
              if (!v) {
                  v = !0;
                  var t = c.getConvList();
                  m(),
                  $(t),
                  c.emitter.addListener(c.EventsName.CONV_LIST_UPDATE, function (e) {
                      $(e)
                  }),
                  c.emitter.addListener(c.EventsName.HIDE_CONV, function (e) {
                      W(e)
                  }),
                  e.$on("leftpannel.openChatByUid", function (e, n) {
                      var t = n.uid
                        , i = n.messageId
                        , r = n.keyword
                        , o = $my.uid
                        , a = [t, o]
                        , u = a.sort(function (e, n) {
                            return e - n
                        }).join(":");
                      return y(u, i, r)
                  }),
                  e.$on("leftpannel.openChatByGroup", function (e, n) {
                      var t = n.conversationId
                        , i = n.messageId
                        , r = n.keyword;
                      return y(t, i, r)
                  }),
                  e.$on("openUnreadChat", function (e, t) {
                      return t ? y(t) : void (n.current.name.indexOf("authorized") !== -1 && n.current.name.indexOf("authorized.im") === -1 && n.go("authorized.im"))
                  }),
                  e.$on("$stateChangeSuccess", function (e, n, t, i, r) {
                      n.name.indexOf("authorized.im") === -1 && i.name.indexOf("authorized.im") !== -1 && (s.activeConvId && d[s.activeConvId] && d[s.activeConvId].deactive(),
                      s.activeConvId = null)
                  }),
                  l = window.performance.now()
              }
          };
        return {
            getConvList: p,
            getAllConv: h,
            activeConv: y,
            getConvObj: I,
            hideConv: O,
            quitConv: w,
            deleteConv: S,
            addMembers: T,
            removeMembers: N,
            getConvById: M,
            updateDingMsg: x,
            createConversation: A,
            createCid: q,
            updateTitle: b,
            tryDecryptMsgs: H,
            getCurrentActiveConv: E,
            getConvListChangeEvents: C,
            getOrgDataByCid: k,
            init: L
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../events": 394,
        "../log/localLog": 441,
        "../log/log": 442,
        "../log/lwlog": 444,
        "../microApp/microAppData": 457,
        "../user/my": 704,
        "./../user/userManager": 711,
        "./ConvWithSDK": 303,
        "./convExtensionType": 314,
        "./msg/msgFactoryWithSDK": 325,
        "@ali/ding-api": 781,
        "@ali/wksdk": 869,
        "lodash": 1057,
        "wolfy87-eventemitter": 1083
    }]