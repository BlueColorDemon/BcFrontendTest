[function (require, module, exports) {
    "use strict";
    var path = require("path")
      , ua = require("../ua");
    require("./modal");
    var nw = require("../app/nw")
      , storage = require("../storage/storage");
    require("../notification"),
    require("../app/appAutoRun"),
    require("../tool/tool"),
    require("../toast/toast");
    var EVENTS = require("../events")
      , limitConfig = require("../limitConfig")
      , semver = require("semver")
      , ddStorage = require("../storage/ddStorage")
      , i18nextManager = require("../i18next/i18nextManager")
      , fontSizeManager = require("../theme/fontSizeManager")
      , i18next = require("i18next");
    angular.module("ddWeb.modal.settingModal", ["ddWeb.modal", "ddWeb.notification", "ddWeb.appAutoRun", "ddWeb.service.tool", "ddWeb.toast", require("../../directive/widget/hotkey"), require("../widget/hotkeyManager"), require("../../directive/widget/radiobox"), require("../../service/modal/detector"), require("../../directive/widget/updateCheck/updateChecker")]).factory("settingModal", ["$modal", function (t) {
        return function (e) {
            var n = t.open({
                template: ' <div class="dialog middle settings-modal">\n     <div class="head">\n         <i class="iconfont close"></i>\n         <span class="title">{{::\'pc_setting_title\'| i18next}}</span>\n     </div>\n     <div class="body">\n         <div class="settings">\n             <div class="setting-item desk-notice" ng-if="settingModal.settingSwitcher.notification">\n                 <span class="rem">{{:: \'pc_setting_desktop_notifications\'| i18next}}</span>\n                 <div class="toggle" dd-checkbox ng-model="settingModal.localSetting.notification">\n                     <label></label>\n                 </div>\n             </div>\n             <div class="setting-item desk-notice" ng-if="settingModal.settingSwitcher.dingEmailNotification">\n                 <span class="rem">{{:: \'pc_setting_email_desktop_notifications\'| i18next}}</span>\n                 <div class="toggle" dd-checkbox ng-model="settingModal.localSetting.dingEmailNotification">\n                     <label></label>\n                 </div>\n             </div>\n             <div class="setting-item reminder-voice" ng-if="settingModal.settingSwitcher.beep">\n                 <span class="rem">{{::\'pc_setting_open_sound_notifications\'| i18next}}</span>\n                 <div class="toggle" dd-checkbox ng-model="settingModal.localSetting.beep">\n                     <label></label>\n                 </div>\n             </div>\n\n             <hotkey ng-repeat = "item in settingModal.hotkeyEditState" hotkey-setting="settingModal.localSetting[item.key]" identifier="{{item.key}}" ng-if="item.value"></hotkey>\n\n             <div class="setting-item" ng-if="settingModal.settingSwitcher.autorun">\n                 <span class="rem">{{::\'pc_setting_auto_start\'| i18next}}<span ng-if="!settingModal.canSetAutoRun" class="autorun-open-label">{{::\'pc_setting_auto_start_nonsupport\'| i18next}}</span></span>\n                 <div class="toggle" dd-checkbox ng-model="settingModal.localSetting.autorun">\n                     <label></label>\n                 </div>\n             </div>\n\n            <div class="dd-drop-down-setting clearfix">\n                <div class="text">\n                    <div class="title">{{:: \'pc_setting_change_language\'| i18next}}</div>\n                    <div class="desc">{{:: \'pc_setting_restart_tips\'| i18next}}</div>\n                </div> \n                <div class="input-wrap">\n                    <dd-drop-down\n                    class="setting-select"\n                    repeat-data="settingModal.LANGS"\n                    on-select="settingModal.onSelectLangType"\n                    ng-model="settingModal.selectLangType"\n                    >\n                        <dd-drop-down-match class="eye">\n                            <span class="choiced-content">{{$selectItem.text}}</span>\n                            <i class="iconfont select-icon">&#xe633;</i>\n                        </dd-drop-down-match>\n                        <dd-drop-down-choices>\n                            <span class="menu">{{$repeatItem.text}}</span>\n                        </dd-drop-down-choices>\n                    </dd-drop-down>\n                </div>\n             </div> \n\n             <div class="dd-drop-down-setting clearfix">\n                <div class="text">\n                    <div class="title">{{::\'pc_setting_change_fontsize\'| i18next}}</div>\n                </div> \n                <div class="input-wrap">\n                    <dd-drop-down\n                    class="setting-select"\n                    repeat-data="settingModal.FontSizeList"\n                    on-select="settingModal.onSelectFontLevel"\n                    ng-model="settingModal.selectLevelObj"\n                    >\n                        <dd-drop-down-match class="eye">\n                            <span class="choiced-content">{{$selectItem.text}}</span>\n                            <i class="iconfont select-icon">&#xe633;</i>\n                        </dd-drop-down-match>\n                        <dd-drop-down-choices>\n                            <span class="menu">{{$repeatItem.text}}</span>\n                        </dd-drop-down-choices>\n                    </dd-drop-down>\n                </div>\n             </div> \n          \n             <div class="setting-item clearfix">\n                 <span class="rem">{{::\'pc_setting_send_message_shortcut\'| i18next}}</span>\n                 <div class="radio-list">\n                     <dd-radiobox ng-model="settingModal.localSetting.sendMessageShortcut" value="Enter">\n                         {{::\'pc_setting_send_message_shortcut_type_1\'| i18next}}\n                     </dd-radiobox>\n                     <dd-radiobox ng-model="settingModal.localSetting.sendMessageShortcut" value="Ctrl+Enter">\n                         {{::\'pc_setting_send_message_shortcut_type_2\'| i18next}}\n                     </dd-radiobox>\n                 </div>\n             </div>\n\n             \n\n             <div class="dd-version-item">\n                 <span ng-if="settingModal.isDesktop">v{{settingModal.nwversion}}</span>\n                 <span ng-if="!settingModal.isDesktop">v{{settingModal.ddVersion}}</span>\n                 <update-checker ng-if="settingModal.isDesktop" class="dd-update-checker"></update-checker>\n                 <span ng-click="settingModal.networkTest()" class="dd-network-test">{{::\'pc_setting_network_detection\'| i18next}}</span>\n             </div>\n         </div>\n     </div>\n     <div class="foot">\n         <button class="blue" ng-click="settingModal.submitSetting()">{{::\'pc_setting_save\'| i18next}}</button>\n     </div>\n </div>\n',
                controller: "settingModalCtrl",
                controllerAs: "settingModal",
                resolve: {}
            });
            return n.result
        }
    }
    ]).controller("settingModalCtrl", ["$modalInstance", "$timeout", "detectorModalService", "notification", "appAutoRun", "hotkeyManager", "tool", "toastService", "$rootScope", function (t, e, n, i, o, a, s, l, c) {
        function d() {
            m.isDesktop && ua.isWin && (m.canSetAutoRun = !0)
        }
        function r() {
            h.forEach(function (t) {
                t.value && a.setHotkey(t.key, m.localSetting[t.key])
            })
        }
        function g() {
            h.forEach(function (t) {
                t.value && (m.localSetting[t.key] = a.getHotkey(t.key).value)
            })
        }
        function u() {
            var t = []
              , e = i18next.t("pc_setting_repeat_shortcut");
            if (h.forEach(function (e) {
                e.value && t.push(m.localSetting[e.key])
            }),
            p(t))
                return !0;
            var n = function (t, e) {
                return t && e && t === e
            };
            return !s.hasRepeatItem(t, n) || (l.show(e, {
                type: "error"
            }),
            !1)
        }
        function p(t) {
            return 0 === t.filter(function (t) {
                return t && t.length > 0
            }).length
        }
        function v() {
            var t = storage.local.getItem("notification")
              , e = storage.local.getItem("isBeepOpen")
              , n = storage.local.getItem("autorun")
              , i = ddStorage.getItemWithUid("dingEmailNotification")
              , o = ddStorage.getItem("sendMessageShortcut") || "Enter";
            t = "true" === t,
            e = "true" === e,
            i = "true" === i,
            m.canSetAutoRun && (n = !n || "true" === n,
            m.localSetting.autorun = n),
            g(),
            m.localSetting.notification = t,
            m.localSetting.beep = e,
            m.localSetting.dingEmailNotification = i,
            m.localSetting.sendMessageShortcut = o
        }
        function f() {
            u() && (m.localSetting.notification && i.init(function (t) {
                "granted" == t ? m.localSetting.notification = !0 : (m.localSetting.notification = !1,
                storage.local.setItem("notification", m.localSetting.notification))
            }),
            i18nextManager.changeLngAndCache(m.selectLangType.type),
            storage.local.setItem("notification", m.localSetting.notification),
            ddStorage.setItemWithUid("dingEmailNotification", m.localSetting.dingEmailNotification),
            ddStorage.setItem("sendMessageShortcut", m.localSetting.sendMessageShortcut),
            m.canSetAutoRun && (storage.local.setItem("autorun", m.localSetting.autorun),
            o.setAppAutoRun(m.localSetting.autorun)),
            storage.local.setItem("isBeepOpen", m.localSetting.beep),
            r(),
            m.currentLang !== m.selectLangType && l.show(i18next.t("pc_setting_restart_lang_tips"), {
                type: "success"
            }),
            m.currentLevelObj !== m.selectLevelObj && fontSizeManager.setLevel(m.selectLevelObj.level),
            t.close("ok"),
            c.$broadcast(EVENTS.SETTING_MODAL_CLOSE))
        }
        function S() {
            d(),
            v()
        }
        var m = this
          , h = a.getHotkeyEditState();
        this.title = i18next.t("pc_setting_title"),
        this.isNw = ua.isNw,
        this.isDesktop = ua.isDesktop,
        this.isMac = ua.isMac,
        this.settingSwitcher = {
            notification: !0,
            beep: !0,
            autorun: ua.isDingTalkWin,
            dingEmailNotification: !0
        },
        this.canSetAutoRun = null,
        this.localSetting = {},
        this.hotkeyEditState = h,
        m.LANGS = i18nextManager.LANGS,
        m.currentLang = m.selectLangType = i18nextManager.getCurrentLngObj(),
        m.onSelectLangType = function (t) {
            m.selectLangType = t
        }
        ;
        fontSizeManager.currentLevel;
        m.FontSizeList = [{
            level: fontSizeManager.FontSizeLevelEnum.DEFAULT,
            text: i18next.t("pc_setting_fontsize_default")
        }, {
            level: fontSizeManager.FontSizeLevelEnum.BIG,
            text: i18next.t("pc_setting_fontsize_large")
        }, {
            level: fontSizeManager.FontSizeLevelEnum.SUPER_BIG,
            text: i18next.t("pc_setting_fontsize_very_large")
        }],
        m.currentLevelObj = m.selectLevelObj = m.FontSizeList[0],
        m.FontSizeList.forEach(function (t) {
            t.level == fontSizeManager.currentLevel && (m.currentLevelObj = m.selectLevelObj = t)
        }),
        m.onSelectFontLevel = function (t) {
            m.selectLevelObj = t
        }
        ,
        S(),
        this.isDesktop && (this.nwversion = nw.version()),
        this.ddVersion = window.version,
        this.submitSetting = f,
        this.networkTest = function () {
            t.close("ok"),
            c.$broadcast(EVENTS.SETTING_MODAL_CLOSE),
            e(function () {
                n()
            }, 500)
        }
    }
    ]);
}
    , {
        "../../directive/widget/hotkey": 166,
        "../../directive/widget/radiobox": 175,
        "../../directive/widget/updateCheck/updateChecker": 197,
        "../../service/modal/detector": 472,
        "../app/appAutoRun": 253,
        "../app/nw": 264,
        "../events": 394,
        "../i18next/i18nextManager": 425,
        "../limitConfig": 434,
        "../notification": 509,
        "../storage/ddStorage": 674,
        "../storage/storage": 675,
        "../theme/fontSizeManager": 677,
        "../toast/toast": 682,
        "../tool/tool": 688,
        "../ua": 690,
        "../widget/hotkeyManager": 733,
        "./modal": 480,
        "i18next": 1036,
        "path": 7,
        "semver": 1069
    }]