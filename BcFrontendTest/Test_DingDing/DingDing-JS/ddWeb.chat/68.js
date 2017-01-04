[function (require, module, exports) {
    "use strict";
    var path = require("path")
      , urlParser = require("url")
      , moduleName = "ddWeb.chat.msgBox"
      , SendStatus = require("../../service/conversation/SendStatus")
      , i18next = require("i18next")
      , uriResolve = require("../../service/uriResolve/resolve")
      , ua = require("../../service/ua")
      , $my = require("../../service/user/my")
      , urlParser = require("url")
      , queryString = require("querystring")
      , globalSchema = require("../../service/globalSchema")
      , BASE_MSG_TAG = require("../../service/conversation/baseMsgTag")
      , EVENTS = require("../../service/events")
      , _ = require("lodash")
      , MSG_EXT_TYPE = {
          SYSTEM_MSG: "9999",
          RED_ENVELOPE: "100"
      }
      , ContentType = require("../../service/conversation/ContentType");
    angular.module(moduleName, [require("./msgContent/msgContent"), require("./msgContent/content/msgRecalled"), require("./profile"), require("./msgMenu/msgMenu"), require("./msgStatus/unConfirmCount"), require("./msgStatus/unreadCount"), require("../avatar/userAvatar"), require("../avatar/openProfile"), require("../../filter/emoj"), require("../../service/modal/switchOrgModal"), require("../../service/conversation/conversationWithSDK"), require("../../component/user/userDingTitleList")]).directive("msgBox", ["$filter", "conversationWithSDK", "switchOrgModalService", function (e, s, n) {
        return {
            restrict: "AE",
            scope: {
                isSafety: "=isSafety",
                info: "=info"
            },
            replace: !0,
            controller: ["$scope", function (n) {
                function t() {
                    o.shouldShowUnreadCount = !o.info.isSuperGroup && 2 !== o.info.msg.baseMessage.memberTag && !o.info.isSpecialConv && !o.info.isSendToMyself && o.info.type !== ContentType.MAIL,
                    o.shouldShowMsgMenu = !(i.indexOf(o.info.type) > -1) && !o.info.msg.needDecrypt() && o.info.msg.isSupport2Show();
                    try {
                        n.$digest()
                    } catch (e) {
                        console.log(e)
                    }
                }
                this.info = n.info,
                this.ua = ua,
                n.ContentType = ContentType,
                n.SendStatus = SendStatus,
                n.isShowMsgMenu = !1,
                n.isShowTime = !1,
                this.isSafetyTips = _.get(this.info.msg, "baseMessage.tag") === BASE_MSG_TAG.SAFETY_TIPS,
                this.TEXT = {
                    dt_message_tap_safe_icon_alert: i18next.t("dt_message_tap_safe_icon_alert")
                },
                this.isResponsiveBox = this.info.type === ContentType.TEXT;
                var i = [ContentType.RED_ENVELOPE_ENTERPRISE, ContentType.RED_ENVELOPE_RANDOM, ContentType.RED_ENVELOPE_NORMAL, ContentType.RED_ENVELOPE_SYSTEM, ContentType.RED_ENVELOPE_ALIPAY];
                this.shouldShowUnreadCount = !this.info.isSuperGroup && 2 !== this.info.msg.baseMessage.memberTag && !this.info.isSpecialConv && !this.info.isSendToMyself && this.info.type !== ContentType.MAIL && this.info.type !== ContentType.IMG_TEXT && this.info.type !== ContentType.VOIP,
                this.shouldShowMsgMenu = !(i.indexOf(this.info.type) > -1) && !this.info.msg.needDecrypt() && this.info.msg.isSupport2Show(),
                this.getSysMsg = function () {
                    var n, t = e("emoj"), i = this.info.msg.getContent().textContent.text, o = _.get(this.info.msg, "baseMessage.extension.links"), a = _.get(this.info.msg, "baseMessage.extension.type") || "", r = t(i);
                    if (o && "string" == typeof o && (o = JSON.parse(o)),
                    Array.isArray(o) && (n = o[0],
                    n.url = uriResolve.uniformLinkProtocolResolve(n.url)),
                    a === MSG_EXT_TYPE.SYSTEM_MSG && n) {
                        var g = urlParser.parse(n.url);
                        if (g.pathname === globalSchema.CHANGE_ENT_GROUP) {
                            var m = this.info.msg.getConvId()
                              , u = s.getConvObj(m);
                            u.isCompanyGroup && (n = null)
                        }
                    }
                    if (a === MSG_EXT_TYPE.RED_ENVELOPE && (n = null),
                    n && n.url) {
                        var f = parseInt(n.loc)
                          , l = parseInt(n.len);
                        r = t(i.substring(0, f)) + '<a href="' + n.url + '" target="_blank" type="' + a + '" class="system-link">' + t(i.substr(f, l)) + "</a>" + t(i.substr(f + l, i.length))
                    }
                    return "1" === _.get(this.info.msg, "baseMessage.extension.style") && (r = '<i class="icon-green-safety"></i>' + r),
                    r
                }
                ;
                var o = this
                  , a = this.info.msg;
                n.$watch(function () {
                    return this.info.time
                }
                .bind(this), function (e, s) {
                    e && _.get(a, "baseMessage.content.contentType") !== ContentType.OA ? this.showTime = e : this.showTime = null
                }
                .bind(this)),
                this.resend = function () {
                    a.reSend()
                }
                ,
                a.on(a.EventsName.UPDATE_TO_DING, t),
                a.on(a.EventsName.RECALL_STATUS_CHANGE, t),
                a.on(a.EventsName.PRIVATE_TAG_CHANGE, t),
                a.on(a.EventsName.SEND_FAIL, t),
                a.on(a.EventsName.DELETED_CHANGE, t),
                n.$on("$destroy", function () {
                    a.off(a.EventsName.UPDATE_TO_DING, t),
                    a.off(a.EventsName.RECALL_STATUS_CHANGE, t),
                    a.off(a.EventsName.PRIVATE_TAG_CHANGE, t),
                    a.off(a.EventsName.SEND_FAIL, t),
                    a.off(a.EventsName.DELETED_CHANGE, t)
                })
            }
            ],
            link: {
                pre: function (e, s, n) {
                    function t() {
                        s.find(".chat-item").attr("msg-id", i.baseMessage.messageId),
                        e.$evalAsync(function () { })
                    }
                    var i = e.info.msg;
                    i.on(i.EventsName.SEND_SUCCESS, t),
                    s.one("$destroy", function () {
                        e.info.msg.off(e.info.msg.EventsName.SEND_SUCCESS, t)
                    })
                },
                post: function (e, t, i) {
                    var o = e.info.msg;
                    t[0].style.display = "block",
                    e.$emit(EVENTS.CHAT_BUBBLE_SIZE_CHANGE, {
                        mid: e.info.mid
                    });
                    var a = function (e) {
                        if ("system-link" === e.target.className) {
                            var t = e.target.getAttribute("href")
                              , i = urlParser.parse(t);
                            if (i.pathname === globalSchema.CHANGE_ENT_GROUP) {
                                e.preventDefault(),
                                e.stopPropagation();
                                var a = s.getConvObj(_.get(o, "baseMessage.conversationId"));
                                if (a)
                                    return n.showModal($my).then(function (e) {
                                        var s = e.oid
                                          , n = e.orgName;
                                        a.convertToOrgGroup(s, {
                                            id: s,
                                            orgName: n
                                        })
                                    }),
                                    !1
                            }
                        }
                    }
                      , r = function (e) {
                          var s = e.target;
                          "IMG" === s.tagName
                      }
                      , g = function (e) {
                          var s = e.target;
                          "IMG" === s.tagName
                      };
                    t[0].addEventListener("load", r, !0),
                    t[0].addEventListener("error", g, !0),
                    t[0].addEventListener("click", a);
                    var m = null
                      , u = null;
                    if (e.msg.info.isFocused === !0) {
                        var f = new Event("msgRequestFocus", {
                            bubbles: !0
                        });
                        setTimeout(function () {
                            t[0].dispatchEvent(f)
                        }, 200),
                        m = setTimeout(function () {
                            t.find(".chat-item").addClass("focused-msg")
                        }, 700),
                        u = setTimeout(function () {
                            t.find(".chat-item").removeClass("focused-msg")
                        }, 1700)
                    }
                    t.one("$destroy", function () {
                        clearTimeout(m),
                        clearTimeout(u),
                        t[0].removeEventListener("load", r, !0),
                        t[0].removeEventListener("error", g, !0),
                        t[0].removeEventListener("click", a)
                    })
                }
            },
            controllerAs: "msg",
            template: '<div style="display: none;">\n    <!-- 普通消息 -->\n    <div class="chat-item" ng-if="msg.info.msg.baseMessage.creatorType===1 && msg.info.msg.isDisplay()" ng-class="{\'me\':!msg.info.position, \'not-me\':msg.info.position, \'responsive-box\': msg.isResponsiveBox}" msg-id="{{msg.info.msg.getId()}}">\n        <!-- OA消息，不显示chat-time -->\n         <div class="chat-status" ng-show="msg.showTime">{{::msg.showTime | dateTime:true}}</div>\n         <div class="chat-profile-info clearfix" ng-class="{\'img-text-msg-display-none\': msg.info.type === ContentType.IMG_TEXT}">\n            <profile ng-if="::!msg.info.isOAConv && !msg.info.msg.isMySend()" cid="msg.info.msg.getConvId()" uid="msg.info.uid" ></profile>\n            <span class="chat-time" ng-class="{\'oa-chat-time\':msg.info.isOAConv, \'my-send-time\': msg.info.msg.isMySend()}">{{msg.info.msg.baseMessage.createdAt | dateTime:true:true}}</span>\n         </div>\n        <div class="clearfix content-area" ng-class="{\'img-text-msg\': msg.info.type === ContentType.IMG_TEXT}">\n            <div class="avatar"><user-avatar class="normal" uid="{{msg.info.uid}}" open-profile="1"></user-avatar></div>\n            <user-ding-title-list just-show-main uid="{{msg.info.uid}}" class="user-ding-title-list" open-profile\n                    ng-class="{\'msg-left-title\':!msg.info.msg.isMySend(),\'msg-right-title\':msg.info.msg.isMySend()}"></user-ding-title-list>\n              <div class="msg-bubble-box">\n                <div ng-class="{\'safety-bubble\': msg.info.msg.isDecrypted() && isSafety && msg.ua.isDesktop}" htitle="{{::msg.TEXT.dt_message_tap_safe_icon_alert}}" htitle-direction="right" ng-if="msg.info.position"></div>\n                <div ng-class="{\'safety-bubble\': msg.info.msg.isDecrypted() && isSafety && msg.ua.isDesktop}" htitle="{{::msg.TEXT.dt_message_tap_safe_icon_alert}}" htitle-direction="left" ng-if="!msg.info.position"></div>\n                <div class="msg-bubble-area">\n                    <msg-content info="msg.info"></msg-content>\n                    <!-- 消息菜单 -->\n                    <msg-menu msg="msg.info.msg" is-special-conv="msg.info.isSpecialConv" ng-if="msg.info.msg.sendStatus===SendStatus.SENDED&&msg.shouldShowMsgMenu"></msg-menu>\n                    <!-- 普通消息有未读状态 -->\n                    <unread-count msg="msg.info.msg" ng-if="msg.shouldShowUnreadCount"></unread-count>\n                    <!-- ding消息有确认状态 -->\n                    <un-confirm-count msg="msg.info.msg" ng-if="msg.info.msg.baseMessage.memberTag===2&&!msg.info.position&&msg.info.msg.isDingContentType()"></un-confirm-count>\n                    <!-- 重发按钮 -->\n                    <a href="#" ng-click="msg.resend()" ng-if="msg.info.msg.sendStatus===SendStatus.SENDFAIL"><i class="iconfont icon-resend">&#xe63c;</i></a>\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- 系统消息 -->\n    <div ng-if="::msg.info.msg.baseMessage.creatorType===2" class="chat-status chat-system-notice" ng-class="{\'safety-tips\': msg.isSafetyTips}" ng-bind-html="msg.getSysMsg()"></div>\n    <msg-recalled msg="msg.info.msg" ng-if="msg.info.msg.baseMessage.recallStatus === 1"></msg-recalled>\n</div>\n'
        }
    }
    ]),
    module.exports = moduleName; 
}
   , {
       "../../component/user/userDingTitleList": 50,
       "../../filter/emoj": 201,
       "../../service/conversation/ContentType": 301,
       "../../service/conversation/SendStatus": 311,
       "../../service/conversation/baseMsgTag": 313,
       "../../service/conversation/conversationWithSDK": 316,
       "../../service/events": 394,
       "../../service/globalSchema": 416,
       "../../service/modal/switchOrgModal": 497,
       "../../service/ua": 690,
       "../../service/uriResolve/resolve": 697,
       "../../service/user/my": 704,
       "../avatar/openProfile": 55,
       "../avatar/userAvatar": 57,
       "./msgContent/content/msgRecalled": 81,
       "./msgContent/msgContent": 88,
       "./msgMenu/msgMenu": 89,
       "./msgStatus/unConfirmCount": 90,
       "./msgStatus/unreadCount": 91,
       "./profile": 92,
       "i18next": 1036,
       "lodash": 1057,
       "path": 7,
       "querystring": 12,
       "url": 13
   }]