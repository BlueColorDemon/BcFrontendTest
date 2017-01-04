[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.chat.chatBoxNew"
      , path = require("path")
      , _ = require("lodash")
      , fileTypes = require("@ali/ding-filetypes")
      , ConvType = require("../../service/conversation/ConvType")
      , localLog = require("../../service/log/localLog")
      , nwWindow = require("../../service/app/nwWindow")
      , WKErrorCode = require("@ali/wksdk").errorCode
      , MsgType = require("@ali/wksdk").messageType
      , watermarkLocation = require("../../service/watermark/watermarkLocation")
      , SCROLL_STATUS = {
          KEEP_BOTTOM: 0,
          KEEP_POSITION_RELATIVE_TO_TOP: 1,
          KEEP_POSITION_RELATIVE_TO_BOTTOM: 2
      }
      , VIEW_MODE = {
          NORMAL: 0,
          SEARCH_FOCUSING: 1,
          SEARCH_FOCUSED: 2
      }
      , BOTTOM_MAX_DISTANCE = 50
      , TOP_MAX_DISTANCE = 50
      , EVENTS = require("../../service/events");
    angular.module(moduleName, [require("./msgBox"), require("./imgPreview"), require("../watermark")]).directive("chatBoxNew", ["$rootScope", function (e) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                conv: "=conv",
                searchMessageId: "=searchMessageId",
                searchKeyword: "=searchKeyword"
            },
            link: function (n, o) {
                function t() {
                    "visible" === nwWindow.visibilityState ? (h(),
                    r.messages.length > 0 && r.messages[r.messages.length - 1].updateToView(),
                    r.setUIVisibleStatus(!0)) : r.setUIVisibleStatus(!1)
                }
                function s(e, n) {
                    var t = null
                      , s = null
                      , i = !1
                      , a = o.find(".chat-item");
                    localLog.info("updateReadStatus:", "top:" + e, "bottom" + n);
                    for (var l = a.length - 1; l >= 0; l--)
                        if (a[l] && a[l].offsetTop) {
                            var c = a[l].offsetTop;
                            if (i === !1 && c <= n) {
                                s = a[l].getAttribute("msg-id"),
                                t = s,
                                i = !0;
                                continue
                            }
                            if (i === !0) {
                                if (c < e)
                                    break;
                                t = a[l].getAttribute("msg-id")
                            }
                        }
                    localLog.info("updateReadStatus:", "topId:" + t, "bottomId:" + s),
                    r.updateToRead(t, s)
                }
                function i(n) {
                    r.sendSpaceFileMsg(n),
                    e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM)
                }
                function a(n) {
                    r.sendImgMsg(n),
                    e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM)
                }
                var r = n.conv
                  , l = r.isSingleChat
                  , c = r.isCompanyGroup
                  , T = r.isSafetySingle
                  , d = void 0;
                n.watermarkLocation = watermarkLocation,
                (c || T) && r.baseConversation.extension && r.baseConversation.extension.id && (d = r.baseConversation.extension.id),
                n.orgId = d,
                n.hasNewMsg = !1;
                var E = o[0].querySelector(".main-chat")
                  , S = o.find(".main-chat")
                  , g = parseInt(n.searchMessageId)
                  , u = n.searchKeyword;
                g && r.search(g);
                var m = (SCROLL_STATUS.KEEP_BOTTOM,
                0)
                  , v = VIEW_MODE.NORMAL
                  , O = 9999999
                  , f = -9999999
                  , p = _.debounce(function () {
                      var e = E.scrollHeight - E.scrollTop - E.clientHeight;
                      if (e < BOTTOM_MAX_DISTANCE && (v === VIEW_MODE.SEARCH_FOCUSED && (r.clearSearchResult(),
                      v = VIEW_MODE.NORMAL,
                      u = null,
                      g = null,
                      localLog.info("clear search result", r.convId)),
                      n.hasNewMsg === !0)) {
                          n.hasNewMsg = !1;
                          try {
                              n.$digest()
                          } catch (e) { }
                      }
                  }, 130)
                  , I = null
                  , h = function (e) {
                      var n = E.scrollTop
                        , o = E.clientHeight;
                      O = O < n ? O : n,
                      f = f > n ? f : n,
                      p(),
                      clearTimeout(I),
                      I = setTimeout(function () {
                          s(O, f + o),
                          O = 9999999,
                          f = -9999999
                      }, 300)
                  };
                nwWindow.addListener(nwWindow.EventsName.VISIBILITY_CHANGE, t);
                var L = null
                  , A = null
                  , M = function (e, o) {
                      if (e.stopPropagation && e.stopPropagation(),
                      window.cancelAnimationFrame(L),
                      null === A) {
                          var t = E.scrollHeight
                            , s = E.clientHeight
                            , i = t - E.scrollTop - s;
                          i < BOTTOM_MAX_DISTANCE ? A = SCROLL_STATUS.KEEP_BOTTOM : E.scrollTop < TOP_MAX_DISTANCE ? (A = SCROLL_STATUS.KEEP_POSITION_RELATIVE_TO_BOTTOM,
                          m = i) : A = SCROLL_STATUS.KEEP_POSITION_RELATIVE_TO_TOP
                      }
                      L = window.requestAnimationFrame(function () {
                          A === SCROLL_STATUS.KEEP_BOTTOM ? w() : A === SCROLL_STATUS.KEEP_POSITION_RELATIVE_TO_BOTTOM && R(),
                          A !== SCROLL_STATUS.KEEP_BOTTOM && B === !0 && (n.hasNewMsg = !0,
                          n.$evalAsync(function () { })),
                          A === SCROLL_STATUS.KEEP_BOTTOM && 0 === E.scrollTop && h(),
                          B = !1,
                          A = null
                      })
                  }
                  , C = function (e) {
                      setTimeout(function () {
                          var n = e.target
                            , o = n.offsetTop
                            , t = n.getBoundingClientRect()
                            , s = E.clientHeight
                            , i = o - s / 2 + t.height / 2;
                          i > o && (i = o),
                          i < 0 && (i = 0),
                          E.scrollTop = i,
                          v = VIEW_MODE.SEARCH_FOCUSED
                      }, 10)
                  }
                  , N = n.$on(EVENTS.CHAT_BUBBLE_SIZE_CHANGE, M);
                E.addEventListener("scroll", h),
                E.addEventListener("msgRequestFocus", C);
                var w = function () {
                    E.scrollTop = E.scrollHeight + 1e3,
                    n.hasNewMsg = !1
                };
                n.scrollToBottom = w;
                var y = n.$on(EVENTS.SENDMSG_SCROLLTOBOTTOM, function (e) {
                    w()
                })
                  , R = function () {
                      E.scrollTop = E.scrollHeight - E.clientHeight - m
                  }
                  , b = n.conv.baseConversation.tag === ConvType.FILEHELPER
                  , P = n.conv.baseConversation.tag === ConvType.SECRETARY
                  , B = !1
                  , V = function () {
                      var e = 0
                        , o = []
                        , t = {};
                      Array.isArray(n.msgInfoList) && n.msgInfoList.forEach(function (e) {
                          t[e.msg._localId] = e
                      });
                      for (var s = 0; s < r.messages.length; s++) {
                          var i = r.messages[s]
                            , a = !1
                            , T = i.baseMessage.createdAt
                            , E = T - e > 6e5 ? T : null;
                          if (e = T,
                          i.baseMessage.type === MsgType.GAP)
                              break;
                          var S = null;
                          if (g) {
                              v = VIEW_MODE.SEARCH_FOCUSING;
                              try {
                                  var m = i.getMessageId();
                                  m === g && (a = !0)
                              } catch (e) { }
                          }
                          a && (S = u),
                          t[i._localId] ? (t[i._localId].time = E,
                          o.push(t[i._localId])) : (o.push({
                              msg: i,
                              type: _.get(i, "baseMessage.content.contentType"),
                              position: !i.isMySend(),
                              isSingleChat: l,
                              isCompanyGroup: c,
                              isFocused: a,
                              isSpecialConv: b || P,
                              highlightKeyword: S,
                              orgId: d,
                              isOAConv: r.isOAConv,
                              uid: i.getSenderOpenId(),
                              mid: i.getId(),
                              time: E,
                              isSuperGroup: r.baseConversation.superGroup,
                              isGroupShowRealName: r.isGroupShowRealName
                          }),
                          s !== r.messages.length - 1 || i.isMySend() || (B = !0))
                      }
                      r.messages.length > 0 && "visible" === nwWindow.visibilityState && r.messages[r.messages.length - 1].updateToView(),
                      n.msgInfoList = o
                  };
                V();
                var U = function () {
                    V(),
                    n.$evalAsync(function () { })
                };
                r.EventEmitter.addListener(r.EVENTS.UPDATE_SAFETY_STATUS, U),
                r.EventEmitter.addListener(r.EVENTS.UPDATE_MSG, U);
                var D = ['<span class="loading">', '<div class="bounce1"></div>', '<div class="bounce2"></div>', '<div class="bounce3"></div>', "</span>"].join("")
                  , H = angular.element(D)
                  , G = !1;
                n.pullHistory = function () {
                    return G === !0 ? Promise.resolve() : (S.prepend(H),
                    n.conv.pullHistory().then(function () {
                        return H.remove(),
                        !0
                    }).catch(function (e) {
                        return e.code === WKErrorCode.CONVERSATION.NO_MORE_MSGS && (G = !0),
                        H.remove(),
                        !0
                    }))
                }
                ;
                var k = function (e) {
                    var n = e.file
                      , o = fileTypes.getTypeByName(n.name)
                      , t = fileTypes.isImg(o);
                    t ? a(n) : i(n)
                }
                  , q = n.$on("uploadFile:send", function (o, t) {
                      if (t && t.file && t.file.mediaId) {
                          var s = {
                              mediaId: t.file.mediaId,
                              name: t.file.name,
                              type: 1
                          };
                          try {
                              n.conv.sendImgMsg(null, s),
                              e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM)
                          } catch (e) {
                              console.log(e)
                          }
                      } else
                          k(t);
                      e.$broadcast("afterSendAttatchment")
                  })
                  , F = n.$on("spaceFile:send", function (n, o) {
                      o && o.files && o.files.length && (o.files.forEach(function (n) {
                          try {
                              n.orgId = o.orgId,
                              n.spaceId = o.spaceId,
                              r.sendSpaceFileMsg(null, n),
                              e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM)
                          } catch (e) {
                              console.log(e),
                              localLog.error("send space file error : " + e.toString())
                          }
                      }),
                      e.$broadcast("afterSendAttatchment"))
                  });
                n.$on("$destroy", function () {
                    r.EventEmitter.removeListener(r.EVENTS.UPDATE_MSG, U),
                    r.EventEmitter.removeListener(r.EVENTS.UPDATE_SAFETY_STATUS, U),
                    E.removeEventListener("scroll", h),
                    E.removeEventListener("msgRequestFocus", C),
                    nwWindow.removeListener(nwWindow.EventsName.VISIBILITY_CHANGE, t),
                    N(),
                    p.cancel(),
                    y(),
                    q(),
                    F()
                })
            },
            controllerAs: "chatBox",
            template: '<div class="chat-box-new">\n    <div class="main-chat chat-items" img-preview infinite-scroll infinite-scroll-top="pullHistory();" infinite-scroll-threshold=\'5\' watermark watermark-location="{{watermarkLocation.GROUP}}" org-id="{{orgId}}" is-safety="{{conv.isSafety}}" is-safety-single="{{conv.isSafetySingle}}">\n        <div class="msg-items">\n          <msg-box ng-repeat="info in msgInfoList track by info.msg._localId" info="info" is-safety="conv.isSafety" class="msg-box"></msg-box>\n        </div>\n    </div>\n    <a href="javascript:;" style="" class="new-chat-reminder" ng-show="hasNewMsg" ng-click="scrollToBottom()">\n        <span>您有新消息</span>\n    </a>\n</div>\n'
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../service/app/nwWindow": 266,
        "../../service/conversation/ConvType": 302,
        "../../service/events": 394,
        "../../service/log/localLog": 441,
        "../../service/watermark/watermarkLocation": 724,
        "../watermark": 147,
        "./imgPreview": 62,
        "./msgBox": 68,
        "@ali/ding-filetypes": 784,
        "@ali/wksdk": 869,
        "lodash": 1057,
        "path": 7
    }]