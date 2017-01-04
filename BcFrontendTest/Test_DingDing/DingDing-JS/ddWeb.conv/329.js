[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.conversation.unreadConv"
      , EventEmitter = require("wolfy87-eventemitter")
      , Class = require("../../lib/class")
      , SuperGroupStatus = require("./SuperGroupStatus")
      , $my = require("../user/my")
      , EVENTS = require("../events");
    angular.module(moduleName, [require("./conversationWithSDK"), require("../audio")]).factory("unreadConv", ["conversationWithSDK", "$rootScope", "audioService", function (e, t, n) {
        var r = Class.create({
            initialize: function () {
                this.unreadMsgCount = 0,
                this.unreadConvList = [],
                t.$on(EVENTS.NEW_MSG_COUNT_CHANGE, function () {
                    this._reGenerate()
                }
                .bind(this))
            },
            Implements: EventEmitter,
            EventsName: {
                UNREAD_UPDATE: "unread_update"
            },
            _reGenerate: function () {
                var t = e.getConvList()
                  , r = e.getAllConv()
                  , i = 0
                  , u = [];
                [].concat(t.pinOrder, t.order).forEach(function (e) {
                    var t = r[e];
                    t && t.newMsg && !t.notificationOff && (i += t.newMsg,
                    u.push(t))
                });
                var o = this.unreadMsgCount;
                this.unreadConvList = u,
                this.unreadMsgCount = i,
                $my.syncProtocol && this.unreadMsgCount > o && n.play("message"),
                this.emit(this.EventsName.UNREAD_UPDATE, {
                    unreadMsgCount: this.unreadMsgCount,
                    unreadConvList: this.unreadConvList
                })
            }
        });
        return new r
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../lib/class": 206,
        "../audio": 276,
        "../events": 394,
        "../user/my": 704,
        "./SuperGroupStatus": 312,
        "./conversationWithSDK": 316,
        "wolfy87-eventemitter": 1083
    }]