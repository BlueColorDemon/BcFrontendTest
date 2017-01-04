[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.chat.msgMenu"
      , path = require("path")
      , SendStatus = require("../../../service/conversation/SendStatus")
      , _ = require("lodash")
      , $my = require("../../../service/user/my")
      , ua = require("../../../service/ua")
      , MsgTag = require("../../../service/conversation/MsgTag")
      , cloudSetting = require("@ali/wksdk").cloudSetting
      , CSMap = require("../../../service/CSConfig/CSMap")
      , AtOpenIdType = require("../../../service/conversation/AtOpenIdType")
      , ConvType = require("../../../service/conversation/ConvType")
      , ATTACHMENT_INSTANCE_TYPE = require("../../../service/ding/AttachmentInstanceType")
      , EVENTS = require("../../../service/events")
      , ContentType = require("../../../service/conversation/ContentType")
      , PanelType = require("../../../service/selectorPanel/PanelType")
      , i18next = require("i18next");
    angular.module(moduleName, [require("../../../service/conversation/conversationWithSDK"), require("../../../service/modal/sendDingModal"), require("../../../service/modal/forwardMsg"), require("../../../service/toast/toast"), require("../../../service/log/log"), require("../../../service/log/lwlog"), require("../../../service/emotion/emotionPackageFactory"), require("../../../service/ding/DingAttachmentType"), require("../../../service/tool/multiOrgTool"), require("../../../service/search/search/SearchType")]).directive("msgMenu", ["conversationWithSDK", "sendDingModalService", "forwardMsg", "log", "lwlog", "EmotionPackageFactory", "DingAttachmentType", "multiOrgTool", "SearchType", function (e, t, n, s, o, i, a, r, c) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                msg: "=",
                isSpecialConv: "="
            },
            controller: ["$scope", "$rootScope", "$element", function (s, i, a) {
                function d() {
                    l.baseMessage.conversationId && l.baseMessage.messageId && e.getConvById(l.baseMessage.conversationId).then(function (e) {
                        e && e.getMembers(function (n) {
                            var s, o;
                            if (e.isSingleChat) {
                                var i;
                                i = e.isToMySelf ? n[0].openIdEx.openId : n[0].openIdEx.openId === l.getSenderOpenId() ? n[1].openIdEx.openId : n[0].openIdEx.openId,
                                s = [i]
                            }
                            o = n.map(function (e) {
                                return e.openIdEx.openId
                            });
                            var a = l.getContent();
                            a.hasOwnProperty("atOpenIds") && Object.keys(a.atOpenIds).length > 0 && (s = Object.keys(a.atOpenIds),
                            s.indexOf(AtOpenIdType.ALL) !== -1 && (s = o)),
                            [ConvType.JUMP, ConvType.SECRETARY, ConvType.FILEHELPER, ConvType.ANNOUNCEMENT, ConvType.CRM_GROUP].indexOf(e.baseConversation.tag) !== -1 && (s = [],
                            o = [$my.uid]);
                            var d, g, u = "", m = !0;
                            if (a.contentType === ContentType.TEXT && (d = l.baseMessage.messageId,
                            u = _.get(a, "textContent.text") || ""),
                            a.contentType === ContentType.GROUP_ANNOUNCE && (d = "",
                            u = _.get(a, "attachments[0].extension.text") || ""),
                            !e.isSafety || a.contentType !== ContentType.IM_SPACE_FILE && a.contentType !== ContentType.ORG_SPACE_FILE)
                                if ($my.orgEmployees)
                                    var p = [PanelType.DING_CONV, PanelType.ORG, PanelType.FRIEND, PanelType.EXTERNAL_CONTACT]
                                      , T = [c.ORG, c.FRIEND, c.LOCAL]
                                      , y = r.convertOrgEmployeeExtensionModelListToOrgDataList($my.orgEmployees);
                                else
                                    var p = [PanelType.DING_CONV, PanelType.FRIEND]
                                      , T = [c.FRIEND, c.LOCAL];
                            else
                                var v = $my.orgEmployees.filter(function (t) {
                                    return String(_.get(t, "orgDetail.orgId")) === e.orgId
                                })
                                  , p = [PanelType.DING_CONV, PanelType.ORG]
                                  , T = [c.ORG]
                                  , y = r.convertOrgEmployeeExtensionModelListToOrgDataList(v);
                            if (g = {
                                msgId: d,
                                content: u,
                                selectedUids: s,
                                cid: l.baseMessage.conversationId,
                                searchType: T,
                                panelTypeArr: p,
                                orgDataArr: y,
                                customUids: o,
                                disableEdit: m
                            },
                            a.contentType === ContentType.IMG) {
                                d = l.baseMessage.messageId;
                                var E = _.assign({}, a.photoContent, {
                                    instanceType: ATTACHMENT_INSTANCE_TYPE.IMAGE
                                });
                                g.dingAttachments = [E],
                                g.disableEdit = !1,
                                g.disableUpload = !0,
                                g.msgId = d
                            }
                            if (a.contentType === ContentType.FILE) {
                                d = l.baseMessage.messageId;
                                var E = _.assign({}, a.fileContent, {
                                    instanceType: ATTACHMENT_INSTANCE_TYPE.FILE
                                });
                                g.dingAttachments = [E],
                                g.disableEdit = !1,
                                g.disableUpload = !0,
                                g.msgId = d
                            }
                            if (a.contentType === ContentType.IM_SPACE_FILE || a.contentType === ContentType.ORG_SPACE_FILE) {
                                d = l.baseMessage.messageId;
                                var C = {
                                    extension: _.get(a, "attachments[0].extension"),
                                    text: "",
                                    type: a.contentType
                                }
                                  , E = {
                                      instanceType: ATTACHMENT_INSTANCE_TYPE.LINK,
                                      linkContent: C
                                  };
                                g.dingAttachments = [E],
                                g.disableEdit = !1,
                                g.disableUpload = !0,
                                g.msgId = d
                            }
                            if (a.contentType === ContentType.SHARE) {
                                var C = {
                                    linkUrl: _.get(a, "attachments[0].url") || "",
                                    picMediaId: _.get(a, "attachments[0].extension.picUrl") || "",
                                    text: _.get(a, "attachments[0].extension.text") || "",
                                    title: _.get(a, "attachments[0].extension.title") || "",
                                    type: a.contentType
                                }
                                  , E = {
                                      instanceType: ATTACHMENT_INSTANCE_TYPE.LINK,
                                      linkContent: C
                                  };
                                g.dingAttachments = [E],
                                g.disableEdit = !1,
                                g.disableUpload = !0,
                                g.msgId = l.baseMessage.messageId
                            }
                            if (a.contentType === ContentType.OA) {
                                var C = {
                                    linkUrl: _.get(a, "attachments[0].url") || "",
                                    text: _.get(a, "attachments[0].extension.h_tl") || "",
                                    title: _.get(a, "attachments[0].extension.b_tl") || "",
                                    type: a.contentType
                                }
                                  , E = {
                                      instanceType: ATTACHMENT_INSTANCE_TYPE.LINK,
                                      linkContent: C
                                  };
                                g.dingAttachments = [E],
                                g.disableEdit = !1,
                                g.disableUpload = !0,
                                g.msgId = l.baseMessage.messageId
                            }
                            a.contentType === ContentType.AUDIO && (g.disableUpload = !0,
                            g.msgId = l.baseMessage.messageId,
                            g.contentType = l.baseMessage.content.contentType,
                            g.content = l.baseMessage.content.audioContent),
                            t.showModal(g)
                        })
                    })
                }
                var g = a.find(".tip-menu");
                s.SendStatus = SendStatus,
                this.msg = s.msg;
                var u = s.msgMenu
                  , l = u.msg
                  , m = l.baseMessage.openIdEx.openId === $my.uid
                  , p = 864e5
                  , T = cloudSetting.getConfig(CSMap.RECALL.module, CSMap.RECALL.key)
                  , y = _.isObject(T) ? 1e3 * parseInt(T.settingValue) : p
                  , v = {
                      withdraw: 1,
                      ding: 2,
                      forword: 3,
                      quote: 4,
                      addEmotion: 5,
                      saveAs: 6,
                      remove: 7
                  }
                  , E = {
                      withDraw: {
                          isShow: function () {
                              var e = (new Date).getTime()
                                , t = e - l.baseMessage.createdAt
                                , n = cloudSetting.getConfig(CSMap.RECALL.module, CSMap.RECALL.key)
                                , s = _.isObject(n) ? 1e3 * parseInt(n.settingValue) : p
                                , o = t <= s
                                , i = l.baseMessage.content.contentType;
                              return m && 2 !== l.baseMessage.memberTag && o && i !== ContentType.OA && i !== ContentType.MAIL
                          },
                          text: i18next.t("dt_chatbox_msgmenu_withdraw"),
                          type: v.withdraw,
                          click: function () {
                              l.withDraw()
                          }
                      },
                      msgToDing: {
                          isShow: function () {
                              l.baseMessage.content.contentType,
                              e.getConvObj(l.baseMessage.conversationId);
                              return !u.msg.isEmotion() && u.msg.baseMessage.memberTag !== MsgTag.DING && u.msg.isDingContentType()
                          },
                          text: i18next.t("dt_chatbox_msgmenu_ding"),
                          type: v.ding,
                          click: function () {
                              d(),
                              o.commLog("chat_ding_success", "")
                          }
                      },
                      quoteMsg: {
                          isShow: function () {
                              return u.msg.canBeQuote()
                          },
                          text: i18next.t("dt_chatbox_msgmenu_quote"),
                          type: v.quote,
                          click: function () {
                              i.$broadcast(EVENTS.QUOTE_MSG, l),
                              g.hide()
                          }
                      },
                      addEmotion: {
                          isShow: function () {
                              return u.msg.canAddEmotion()
                          },
                          text: i18next.t("dt_chatbox_msgmenu_addemotion"),
                          type: v.addEmotion,
                          click: function () {
                              l.addEmotion().then(function () {
                                  i.$broadcast("addEmotion")
                              }),
                              g.hide()
                          }
                      },
                      saveAs: {
                          isShow: function () {
                              return u.msg.canSaveAs()
                          },
                          text: i18next.t("dt_chatbox_msgmenu_saveas"),
                          type: v.saveAs,
                          click: function () {
                              l.saveAs()
                          }
                      },
                      remove: {
                          isShow: function () {
                              return u.msg.canRemove()
                          },
                          text: i18next.t("dt_chatbox_msgmenu_delete"),
                          type: v.remove,
                          click: function () {
                              l.remove()
                          }
                      },
                      forwardMsg: {
                          isShow: function () {
                              var t = e.getConvObj(l.baseMessage.conversationId)
                                , n = t.baseConversation
                                , s = n.ownerId === $my.uid
                                , o = n.extension || {}
                                , i = !s && "1" === o.doc_readonly || !1;
                              return u.msg.canBeForward() && !i
                          },
                          text: i18next.t("dt_chatbox_msgmenu_forward"),
                          type: v.forword,
                          click: function () {
                              n.show(l)
                          }
                      }
                  };
                u.Menu = [],
                Object.keys(E).forEach(function (e) {
                    E[e].isShow() && u.Menu.push(E[e])
                }),
                u.showMenu = u.Menu.length;
                var C = y - ((new Date).getTime() - l.baseMessage.createdAt)
                  , I = null;
                C > 0 && C <= y && (I = setTimeout(function () {
                    u.Menu = u.Menu.filter(function (e) {
                        return e.type !== v.withdraw
                    }),
                    s.$digest()
                }, C)),
                u.isUp = !0,
                s.$on("$destroy", function () {
                    clearTimeout(I)
                })
            }
            ],
            link: function (e, t, n) {
                var s = t.find(".ellipsis")
                  , o = t.find(".tip-menu")
                  , i = function () {
                      o.toggle()
                  };
                s.on("click", i);
                var a = t.offset().top
                  , r = angular.element(document).height();
                a < r / 2 && (e.msgMenu.isUp = !1);
                var c = null
                  , d = function (e) {
                      clearTimeout(c),
                      c = setTimeout(function () {
                          o.hide()
                      }, 500)
                  }
                  , g = function (e) {
                      clearTimeout(c)
                  };
                t.on("mouseleave", ".ellipsis,.tip-menu", d),
                t.on("mouseenter", ".ellipsis,.tip-menu", g),
                t.one("$destroy", function () {
                    s.off("click", i),
                    t.off("mouseleave", d),
                    t.off("mouseenter", g),
                    clearTimeout(c)
                })
            },
            controllerAs: "msgMenu",
            template: '<div class="msg-menu-box" ng-show="msgMenu.showMenu">\n    <i class="iconfont ellipsis"></i>\n    <div class="tip-menu" ng-class="{down: !msgMenu.isUp, up: msgMenu.isUp}">\n        <div class="msg-menu-tri">\n        </div>\n        <ul class="menus">\n            <li class="menu-item" ng-repeat="item in msgMenu.Menu" ng-click="item.click()">{{item.text}}</a>\n        </ul>\n    </div>\n</div>\n'
        }
    }
    ]),
    module.exports = moduleName;
}
   , {
       "../../../service/CSConfig/CSMap": 244,
       "../../../service/conversation/AtOpenIdType": 298,
       "../../../service/conversation/ContentType": 301,
       "../../../service/conversation/ConvType": 302,
       "../../../service/conversation/MsgTag": 307,
       "../../../service/conversation/SendStatus": 311,
       "../../../service/conversation/conversationWithSDK": 316,
       "../../../service/ding/AttachmentInstanceType": 338,
       "../../../service/ding/DingAttachmentType": 342,
       "../../../service/emotion/emotionPackageFactory": 384,
       "../../../service/events": 394,
       "../../../service/log/log": 442,
       "../../../service/log/lwlog": 444,
       "../../../service/modal/forwardMsg": 478,
       "../../../service/modal/sendDingModal": 494,
       "../../../service/search/search/SearchType": 605,
       "../../../service/selectorPanel/PanelType": 613,
       "../../../service/toast/toast": 682,
       "../../../service/tool/multiOrgTool": 685,
       "../../../service/ua": 690,
       "../../../service/user/my": 704,
       "@ali/wksdk": 869,
       "i18next": 1036,
       "lodash": 1057,
       "path": 7
   }]