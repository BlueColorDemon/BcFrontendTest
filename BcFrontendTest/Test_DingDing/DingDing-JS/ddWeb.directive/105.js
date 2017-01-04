[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.directive.convList"
      , path = require("path")
      , $my = require("../../service/user/my")
      , EVENTS = require("../../service/events");
    angular.module(moduleName, [require("../../service/conversation/conversationWithSDK"), require("./convItem")]).directive("convList", ["$rootScope", "conversationWithSDK", function (n, o) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {},
            controllerAs: "convList",
            controller: ["$scope", function (n) {
                function i() {
                    n.$evalAsync(function () { })
                }
                this.showType = ["pinOrder", "order"],
                this.convListObj = o.getConvList(),
                this.convListObj.activeConvId !== this.convListObj.lastActiveConvId && o.activeConv(this.convListObj.lastActiveConvId);
                var t = o.getConvListChangeEvents();
                t.emitter.on(t.EVENTS.ORDER_CHANGE, i),
                n.$on("$destroy", function () {
                    t.emitter.off(t.EVENTS.ORDER_CHANGE, i)
                })
            }
            ],
            link: function (n, i, t) {
                function e() {
                    var n = [];
                    return r.showType.forEach(function (o) {
                        r.convListObj[o].forEach(function (o) {
                            n.push(o)
                        })
                    }),
                    n
                }
                function c() {
                    a || (a = i.find(".conv-item").outerHeight() || d),
                    l = parseInt(v.scrollTop() / a),
                    v.stop();
                    var n = e()
                      , o = s(l + 1, n.length, n);
                    o !== -1 ? v.animate({
                        scrollTop: o * a
                    }, u) : v.animate({
                        scrollTop: 0
                    }, u),
                    l = o
                }
                function s(n, o, i) {
                    for (var t = i.map(function (n) {
                        return f[n]
                    }), e = n; e < o; e++)
                        if (0 !== t[e].newMsg && !t[e].notificationOff)
                            return e;
                    for (var e = 0; e < n; e++)
                        if (0 !== t[e].newMsg && !t[e].notificationOff)
                            return e;
                    return -1
                }
                var r = n.convList
                  , v = i
                  , a = null
                  , d = 55
                  , l = 0
                  , u = 100
                  , f = o.getAllConv()
                  , p = n.$on(EVENTS.SCROLL_TO_UNREAD_CONV, function () {
                      c()
                  });
                n.$on("$destroy", function () {
                    p()
                })
            },
            template: '<div class="conv-lists-box">\n    <div class="conv-lists" ng-repeat="showType in convList.showType">\n        <conv-item ng-repeat = "convId in convList.convListObj[showType] track by convId" conv-id = "convId" con-id="{{convId}}"></conv-item>\n    </div>\n    <div class="conv-list-loading" ng-if="convList.convListObj.isLoading">\n        <div class="loading">\n            <div class="bounce1"></div>\n            <div class="bounce2"></div>\n            <div class="bounce3"></div>\n        </div>\n    </div>\n</div>\n'
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../service/conversation/conversationWithSDK": 316,
        "../../service/events": 394,
        "../../service/user/my": 704,
        "./convItem": 104,
        "path": 7
    }]