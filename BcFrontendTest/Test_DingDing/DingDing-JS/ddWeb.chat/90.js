[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.chat.unConfirmCount"
      , path = require("path")
      , i18next = require("i18next");
    angular.module(moduleName, [require("../../../service/ding/dinglist"), require("../../../service/modal/msgReceiverListModal")]).directive("unConfirmCount", ["dinglist", "msgReceiverListModalService", function (e, i) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                msg: "=msg"
            },
            template: '<div log=\'chat_unread_user_click\' ng-show="dataReady">\n    <a href="javascript:;" class="read-status confirm-list" ng-if="ding.unConfirmCount>0&&!isSingleChat">{{ding.unConfirmCount}}{{::text.pc_im_msgstate_peopleconfirm}}</a>\n    <a href="javascript:;" class="read-status confirm-list" ng-if="ding.unConfirmCount>0&&isSingleChat">{{::text.pc_im_msgstate_unconfirm}}</a>\n    <span class="read-status all-read" ng-if="ding.unConfirmCount===0">{{::text.pc_im_msgstate_allconfirmed}}</span>\n</div>\n',
            link: function (n, t, a) {
                var s = n.msg
                  , m = s.baseMessage.memberExtension.dingId;
                n.dataReady = !1,
                n.text = {
                    pc_im_msgstate_peopleconfirm: i18next.t("pc_im_msgstate_peopleconfirm"),
                    pc_im_msgstate_unconfirm: i18next.t("pc_im_msgstate_unconfirm"),
                    pc_im_msgstate_confirmed: i18next.t("pc_im_msgstate_confirmed"),
                    pc_im_msgstate_allconfirmed: i18next.t("pc_im_msgstate_allconfirmed")
                };
                var r = s.baseMessage.conversationId
                  , o = !1;
                r.indexOf(":") > 0 && (o = !0),
                n.isSingleChat = o,
                n.ding = null;
                var c = function () {
                    try {
                        n.$digest()
                    } catch (e) { }
                };
                e.getDingById(m, function (e) {
                    n.ding = e,
                    n.dataReady = !0,
                    c(),
                    n.ding.on(n.ding.EventsName.UPDATE_CONFIRM, c)
                }),
                t.on("click", ".confirm-list", function (e) {
                    e.preventDefault(),
                    i.showModal(s, !1)
                }),
                t.one("$destroy", function () {
                    t.off("click", ".confirm-list"),
                    n.ding && n.ding.off(n.ding.EventsName.UPDATE_CONFIRM, c)
                })
            }
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../../service/ding/dinglist": 366,
        "../../../service/modal/msgReceiverListModal": 482,
        "i18next": 1036,
        "path": 7
    }]