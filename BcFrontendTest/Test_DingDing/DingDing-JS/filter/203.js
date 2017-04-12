[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.filter.msgfilter";
    require("../service/safe/safe"),
    require("../service/face/default"),
    require("../service/tool/tool");
    var emoji = require("../service/emoji/emoji")
      , URI = require("../lib/uri/src/URI")
      , AtOpenIdType = require("../service/conversation/AtOpenIdType");
    angular.module(moduleName, ["ngSanitize", "ddWeb.safe", "ddWeb.faces_default", "ddWeb.service.tool"]).filter("msgfilter", ["safe", "$sce", "faces_default", "tool", function (e, t, r, a) {
        function n(e) {
            return e.replace(o, function (e) {
                var t = e.substring(1, e.length - 1)
                  , a = r.filter(function (e) {
                      return e.name === t
                  })[0];
                if (a) {
                    var n = a.gifsrc || a.src;
                    return "<img draggable='false' class='chat-content-face' title='[" + a.name + "]'src='" + n + "' />"
                }
                return e
            })
        }
        function c(e) {
            return e.indexOf(".") == -1 && e.indexOf(":") == -1 || (e = URI.withinString(e, function (e) {
                return e.indexOf(":&#x2F;&#x2F;") === -1 ? "<a  data-spm-protocol=\"i\" class='chat-content-text-url' target='_blank' href='http://" + e + "'>" + e + "</a>" : "<a  data-spm-protocol=\"i\" class='chat-content-text-url' target='_blank' href='" + e + "'>" + e + "</a>"
            })),
            e
        }
        function i(t, r) {
            var a = /@[0-9]+[^\s@]/g
              , n = t.match(a);
            return n && n.length && r && n.forEach(function (a) {
                var n = a.slice(1)
                  , c = r[n];
                c && (c = e.escapeHTML(c),
                c = emoji.parse(c),
                t = n === AtOpenIdType.ALL ? t.replace(a, "@" + c) : t.replace(a, '<a class="chat-content-text-link chat-content-text-at" data-uid="' + n + '">@' + c + "</a>"))
            }),
            t
        }
        function s(e) {
            return e.replace(/\t/g, "  ")
        }
        function u(t, r) {
            return t.replace(new RegExp(_.escapeRegExp(r), "ig"), function (t) {
                return '<span class="keyword">' + e.escapeHTML(t) + "</span>"
            })
        }
        var o = /\[[^\]]+\]/gi;
        return function (r, a, o) {
            var l = null;
            return l = e.escapeHTML(r),
            l = c(l),
            l = emoji.parse(l),
            l = n(l),
            a && (l = i(l, a)),
            o && (l = u(l, o)),
            l = s(l),
            t.trustAsHtml(l)
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../lib/uri/src/URI": 211,
        "../service/conversation/AtOpenIdType": 298,
        "../service/emoji/emoji": 381,
        "../service/face/default": 395,
        "../service/safe/safe": 567,
        "../service/tool/tool": 688
    }]