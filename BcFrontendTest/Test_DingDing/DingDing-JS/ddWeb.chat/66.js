[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.chat.responsiveInput"
      , path = require("path")
      , _ = require("lodash")
      , moment = require("moment");
    require("../../widget/focus"),
    require("../../../service/safe/safe"),
    require("../../../service/toast/toast");
    var i18next = require("i18next")
      , ua = require("../../../service/ua")
      , LoginStatusCode = require("../../../service/login/LoginStatusCode")
      , limitConfig = require("../../../service/limitConfig")
      , TEXT_LIMIT = limitConfig.TEXT_MSG_LIMIT
      , BOTTOM_MAX_DISTANCE = 50;
    require("./atInput"),
    require("./ddPaste"),
    require("./cursorAdjust"),
    require("../../../service/chat/textCellService"),
    require("../toolBar/toolBar");
    var storage = require("../../../service/storage/storage")
      , ddStorage = require("../../../service/storage/ddStorage")
      , getCaretCoordinates = require("../../../service/widget/textareaCaretPosition")
      , layoutResizeConf = require("../../../service/layoutResize/layoutResizeConf")
      , EVENTS = require("../../../service/events")
      , nwWindow = require("../../../service/app/nwWindow")
      , app = angular.module(moduleName, ["ddWeb.safe", "ddWeb.widget.focus", "ddWeb.chat.ddPaste", "ddWeb.chat.atInput", "ddWeb.toast", "ddWeb.chat.cursorAdjust", "ddWeb.service.textCellService", "ddWeb.chat.toolBar", require("./typing"), require("../../../service/microApp/space"), require("../../widget/layoutResize"), require("../../../service/tool/tool")]);
    app.directive("responsiveInput", ["$rootScope", "safe", "$timeout", "toastService", "textCellService", "spaceApp", "tool", function (e, t, n, i, o, r, a) {
        return {
            restrict: "AE",
            scope: {
                conv: "=conv"
            },
            controller: ["$scope", function (t) {
                var n = this;
                n.text = {
                    dt_chatbox_common_send: i18next.t("dt_chatbox_common_send"),
                    dt_conversation_encrypt_text_placeholder: i18next.t("dt_conversation_encrypt_text_placeholder"),
                    dt_group_setting_all_silent_input_tips_all_member: i18next.t("dt_group_setting_all_silent_input_tips_all_member"),
                    dt_group_setting_all_silent_input_tips: i18next.t("dt_group_setting_all_silent_input_tips_all_member")
                },
                this.isMac = ua.isMac,
                this.isDesktop = ua.isDesktop,
                this.msgInputFocus = !0,
                this.beforeSendMsgCallbacks = [],
                this.beforeSendMsg = function (e) {
                    n.beforeSendMsgCallbacks.push(e)
                }
                ,
                n.conv = t.conv,
                n._saveDraft = $.proxy(t.conv.saveDraft, n.conv),
                n.draft = t.conv.draft,
                n.isShowInputTip = "secTip" === storage.local.getItem("newUserState"),
                r.hasPermission().then(function (e) {
                    n.showSelectFileBtn = e,
                    t.$digest()
                }),
                n.spaceId = null,
                n.conv.getIMSpaceId().then(function (e) {
                    n.spaceId = e,
                    t.$digest()
                }),
                n.layoutResizeObj = layoutResizeConf.inputArea,
                n.layoutResizeObj.onResizing = function () {
                    e.$broadcast(EVENTS.CHAT_BUBBLE_SIZE_CHANGE)
                }
            }
            ],
            link: function (t, n, r, s) {
                function l() {
                    b = ddStorage.getItem("sendMessageShortcut"),
                    "Ctrl+Enter" === b ? (C.enter = d,
                    C.ctrlAndEnter = u,
                    t.hintText = "Enter 换行 , Ctrl+Enter 发送") : (C.enter = u,
                    C.ctrlAndEnter = d,
                    t.hintText = "Enter 发送 , Ctrl+Enter 换行")
                }
                function u() {
                    var n = m.val();
                    if (E.isFaceOpen = !1,
                    0 !== n.trim().length) {
                        if (n.length > TEXT_LIMIT)
                            return void i.show("您的文字消息过长，请调整至" + TEXT_LIMIT + "字以内再发送", {
                                type: "error"
                            });
                        for (var r = {
                            contentType: 1,
                            textContent: {
                            text: n
                        }
                        }, a = 0; a < E.beforeSendMsgCallbacks.length; a++) {
                            var s = E.beforeSendMsgCallbacks[a](r);
                            if (!s)
                                return;
                            r = s
                        }
                        r.textContent.text = o.filterFaceCell(r.textContent.text),
                        o.reset(),
                        t.conv.sendTextMsg(r.textContent.text, {
                            atOpenIds: r.atOpenIds
                        }),
                        e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM),
                        setTimeout(function () {
                            m.val(""),
                            m.trigger("input")
                        }, 0)
                    }
                }
                function c(e) {
                    return isNaN(e) ? 0 : e
                }
                function d() {
                    g("\n");
                    var e = m[0]
                      , t = getComputedStyle(e)
                      , n = getCaretCoordinates(e, e.selectionEnd)
                      , i = c(parseFloat(t.lineHeight))
                      , o = n.top + i + c(parseFloat(t.paddingBottom))
                      , r = e.scrollTop
                      , a = e.clientHeight;
                    o > r + a && (e.scrollTop = o - a)
                }
                function v() {
                    var e = p(m.val().trim());
                    0 === e.length ? T.addClass("disabled") : T.removeClass("disabled")
                }
                function p(e) {
                    var t = /^[\u0000-\u0002\u200B-\u200D\uFEFF]+/g
                      , n = /[\u0000-\u0002\u200B-\u200D\uFEFF]+$/g;
                    return e.replace(t, "").replace(n, "")
                }
                function g(e, t, n, i) {
                    var o = m[0]
                      , r = e
                      , n = _.isNumber(n) ? n : o.selectionStart
                      , i = _.isNumber(i) ? i : o.selectionEnd
                      , t = _.isNumber(t) ? t : e.length
                      , a = o.value;
                    o.value = a.substring(0, n) + r + a.substring(i, a.length),
                    m.focus(),
                    o.selectionStart = o.selectionEnd = i + t,
                    m.trigger("input")
                }
                function f(t) {
                    E.conv.sendImgMsg(null, t),
                    e.$broadcast(EVENTS.SENDMSG_SCROLLTOBOTTOM)
                }
                var E = t.input
                  , m = n.find(".input-msg-box")
                  , T = n.find(".send-message-button")
                  , S = n.find(".input-area")
                  , b = null
                  , h = null;
                E.disableToolBar = !1;
                var x = function () {
                    var e = m[0]
                      , n = m.val();
                    if (E.disableToolBar = E.conv.getBanWordsStatus(),
                    E.disableToolBar) {
                        h || (h = nwWindow.addListener(nwWindow.EventsName.VISIBILITY_CHANGE, x)),
                        e.setAttribute("disabled", "disabled");
                        var i = E.conv.isInBanBlack() ? i18next.t("dt_group_setting_all_silent_input_tips", {
                            value1: a.formatBanTime(E.conv.baseConversation.banWordsTime)
                        }) : E.text.dt_group_setting_all_silent_input_tips_all_member;
                        e.setAttribute("placeholder", i),
                        T.addClass("disabled"),
                        n.length > 0 && (m.val(""),
                        E._saveDraft(n))
                    } else {
                        h && (nwWindow.removeListener(nwWindow.EventsName.VISIBILITY_CHANGE, x),
                        h = null),
                        e.removeAttribute("disabled");
                        var i = E.conv.isSafety ? E.text.dt_conversation_encrypt_text_placeholder : "";
                        e.setAttribute("placeholder", i),
                        E.conv.draft && E.conv.draft.length > 0 && (m.val(E.conv.draft),
                        m.trigger("input")),
                        0 !== m.val().length && T.removeClass("disabled"),
                        E._saveDraft("")
                    }
                    t.$evalAsync()
                };
                x();
                var C = {
                    enter: null,
                    ctrlAndEnter: null
                };
                l(),
                t.$on(EVENTS.SETTING_MODAL_CLOSE, l),
                m.on("keydown", function (e) {
                    var n = e.which
                      , i = 13 === n;
                    i && !t.input.isAtOpen && (e.preventDefault(),
                    !e.shiftKey && !e.altKey || e.ctrlKey ? !e.ctrlKey || e.shiftKey || e.altKey ? C.enter() : C.ctrlAndEnter() : d())
                }),
                m.on("paste", function () {
                    if (E.disableToolBar)
                        return !1
                }),
                m.on("input", function () {
                    v()
                }),
                S.on("click", function () {
                    m.focus()
                }),
                T.on("click", u),
                t.insertText = g,
                E.insertText = g,
                E.sendImgMsg = f,
                E.conv.EventEmitter.on(E.conv.EVENTS.UPDATE_SAFETY_STATUS, x),
                E.conv.EventEmitter.on(E.conv.EVENTS.UPDATE_BAN_WORDS_STATUS, x),
                E.conv.EventEmitter.on(E.conv.EVENTS.UPDATE_BASE_CONV, x),
                t.$on("afterSendAttatchment", function () {
                    m[0] && m[0].focus()
                }),
                t.$on(EVENTS.QUOTE_MSG, function (e, t) {
                    t.getQuoteContent().then(function (e) {
                        var t = m[0];
                        g(e.textContent.text, t.value.length + e.textContent.text.length, 0, 0)
                    })
                }),
                n.on("$destroy", function () {
                    if (!E.disableToolBar) {
                        var e = m.val();
                        E._saveDraft(e)
                    }
                    nwWindow.removeListener(nwWindow.EventsName.VISIBILITY_CHANGE, x),
                    E.conv.EventEmitter.off(E.conv.EVENTS.UPDATE_BAN_WORDS_STATUS, x),
                    E.conv.EventEmitter.off(E.conv.EVENTS.UPDATE_BASE_CONV, x),
                    E.conv.EventEmitter.off(E.conv.EVENTS.UPDATE_SAFETY_STATUS, x),
                    T.off("click"),
                    S.off("click"),
                    m.off("keydown"),
                    m.off("input"),
                    m.off("paste")
                })
            },
            controllerAs: "input",
            template: '<div\n    class="send-msg-box-wrapper"\n    layout-resize="input.layoutResizeObj.direction"\n    max-height="input.layoutResizeObj.maxHeight"\n    min-height="input.layoutResizeObj.minHeight"\n    storage-key= "input.layoutResizeObj.storageKey"\n    on-resizing="input.layoutResizeObj.onResizing()"\n    >\n    <div class="input-area">\n        <div tool-bar input="input" conv="conv" disable="input.disableToolBar" add-at="addAt"></div>\n        <span class="user-guide" ng-if="!input.isShowInputTip">{{ hintText }}</span>\n        <div class="msg-box">\n            <textarea class="textarea input-msg-box" dd-paste ng-trim="false" at-input cursor-adjust typing focus="input.msgInputFocus"></textarea>\n        </div>\n    </div>\n    <div class="action-area">\n        <a href="javascript:;" class="send-message-button disabled">{{::input.text.dt_chatbox_common_send}} <i ng-if="conv.isSafety" class="send-msg-safety-icon"></i></a>\n    </div>\n</div>\n'
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../../service/app/nwWindow": 266,
        "../../../service/chat/textCellService": 287,
        "../../../service/events": 394,
        "../../../service/layoutResize/layoutResizeConf": 432,
        "../../../service/limitConfig": 434,
        "../../../service/login/LoginStatusCode": 449,
        "../../../service/microApp/space": 460,
        "../../../service/safe/safe": 567,
        "../../../service/storage/ddStorage": 674,
        "../../../service/storage/storage": 675,
        "../../../service/toast/toast": 682,
        "../../../service/tool/tool": 688,
        "../../../service/ua": 690,
        "../../../service/widget/textareaCaretPosition": 737,
        "../../widget/focus": 165,
        "../../widget/layoutResize": 169,
        "../toolBar/toolBar": 100,
        "./atInput": 63,
        "./cursorAdjust": 64,
        "./ddPaste": 65,
        "./typing": 67,
        "i18next": 1036,
        "lodash": 1057,
        "moment": 1062,
        "path": 7
    }]