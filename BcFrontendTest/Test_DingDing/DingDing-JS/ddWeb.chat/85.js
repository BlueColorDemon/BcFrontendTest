[function (require, module, exports) {
    "use strict";
    var path = require("path")
      , localLog = require("../../../../service/log/localLog")
      , _ = require("lodash")
      , EVENTS = require("../../../../service/events")
      , moduleName = "ddWeb.chat.msgText";
    angular.module(moduleName, [require("../../../widget/loading/loading"), require("../../../../service/conversation/conversationWithSDK"), require("../../../../filter/msgfilter"), require("../../../../service/modal/profileModal"), require("../../../../component/rich-text/code-snippet-container"), require("../../../../service/toast/toast")]).directive("msgText", ["profileModalService", "conversationWithSDK", "toastService", function (e, t, n) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                info: "="
            },
            controller: ["$scope", function (e) {
                this.info = e.info,
                this.msgModel = this.info.msg,
                this.content = this.msgModel.baseMessage.content,
                this.atOpenIds = this.content.atOpenIds,
                this.isCodeSnippet = "code_snippet" === _.get(this.msgModel, "baseMessage.extension.text_type"),
                this.codeLanguage = _.get(this.msgModel, "baseMessage.extension.code_language"),
                this.onCodeRender = function () {
                    e.$emit(EVENTS.CHAT_BUBBLE_SIZE_CHANGE, {})
                }
                .bind(this)
            }
            ],
            link: function (t, n, i) {
                var o = n[0]
                  , s = function (t) {
                      for (var n = t.target; n && n !== o;) {
                          if (Array.prototype.indexOf.call(n.classList, "chat-content-text-link") > -1) {
                              var i = n.getAttribute("data-uid");
                              return void (i && e(i))
                          }
                          n = n.parentElement
                      }
                  }
                  , r = function (e) {
                      var t = e.target;
                      if ("IMG" === t.tagName) {
                          var e = new Event(EVENTS.CHAT_BUBBLE_SIZE_CHANGE, {
                              bubbles: !0
                          });
                          o.dispatchEvent(e)
                      }
                  }
                  , a = function (e) {
                      var t = e.target;
                      if ("IMG" === t.tagName) {
                          var e = new Event(EVENTS.CHAT_BUBBLE_SIZE_CHANGE, {
                              bubbles: !0
                          });
                          o.dispatchEvent(e)
                      }
                  };
                o.addEventListener("load", r, !0),
                o.addEventListener("error", a, !0),
                o.addEventListener("click", s, !1),
                t.$on("$destroy", function () {
                    o.removeEventListener("load", r, !0),
                    o.removeEventListener("error", a, !0),
                    o.removeEventListener("click", s, !1)
                })
            },
            controllerAs: "msg",
            template: '<div class="msg-bubble" ng-class=\'{"msg-code-snippet": msg.isCodeSnippet }\'>\n    <pre ng-if="::!msg.isCodeSnippet" class="text" ng-bind-html="msg.content.textContent.text | msgfilter : msg.atOpenIds : msg.info.highlightKeyword"></pre>\n    <code-snippet-container ng-if="::msg.isCodeSnippet" is-line-wrap="1" on-render="msg.onCodeRender()" is-read-only="1" code-content="{{:: msg.content.textContent.text }}" code-language="{{ msg.codeLanguage }}"></code-snippet-container>\n</div>\n\n'
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../../../component/rich-text/code-snippet-container": 48,
        "../../../../filter/msgfilter": 203,
        "../../../../service/conversation/conversationWithSDK": 316,
        "../../../../service/events": 394,
        "../../../../service/log/localLog": 441,
        "../../../../service/modal/profileModal": 488,
        "../../../../service/toast/toast": 682,
        "../../../widget/loading/loading": 170,
        "lodash": 1057,
        "path": 7
    }]