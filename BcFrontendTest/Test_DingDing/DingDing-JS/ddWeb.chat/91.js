[function(require, module, exports) {
	"use strict";
	var moduleName = "ddWeb.chat.unreadCount",
		path = require("path"),
		$my = require("../../../service/user/my"),
		ContentType = require("../../../service/conversation/ContentType"),
		i18next = require("i18next");
	angular.module(moduleName, [require("../../../service/modal/msgReceiverListModal")]).directive("unreadCount", ["msgReceiverListModalService", function(e) {
			return {
				restrict: "AE",
				replace: !0,
				scope: {
					msg: "=msg"
				},
				template: '<div ng-show="shouldShow">\n    <div ng-show="msg.senderMessageStatus.unReadCount > 0" log=\'chat_unread_user_click\'>\n        <a href="#" class="read-status unreadlist" ng-show="isSingleChat">{{ ::text.unread }}</a>\n        <a href="#" class="read-status unreadlist" ng-show="!isSingleChat">{{ msg.senderMessageStatus.unReadCount }}{{ ::text.groupUnread }}{{ state.isSingleChat }}</a>\n    </div>\n    <div ng-show="msg.senderMessageStatus.unReadCount === 0">\n        <span class="read-status all-read" ng-show="!isSingleChat">{{ ::text.allReaded }}</span>\n        <span class="read-status all-read" ng-show="isSingleChat">{{ ::text.readed }}</span>\n    </div>\n</div>\n',
				link: function(t, a, s) {
					var n = t.msg;
					n.baseMessage.openIdEx ? t.isMine = n.baseMessage.openIdEx.openId === $my.uid : t.isMine = !0;
					var i = n.baseMessage.conversationId,
						r = !1,
						d = !1;
					if(i.indexOf(":") > 0 && (r = !0),
						r) {
						var u = i.split(":").map(function(e) {
							return parseInt(e)
						});
						u[0] === $my.uid && u[1] === $my.uid && (d = !0)
					}
					var o = n.baseMessage.content.contentType,
						l = {
							spaceFile: {
								unread: i18next.t("pc_im_msgstate_unreceive"),
								groupUnread: i18next.t("pc_im_msgstate_peopleunreceive"),
								readed: i18next.t("pc_im_msgstate_received"),
								allReaded: i18next.t("pc_im_msgstate_allreceived")
							},
							default: {
								unread: i18next.t("pc_im_msgstate_unread"),
								groupUnread: i18next.t("pc_im_msgstate_peopleunread"),
								readed: i18next.t("pc_im_msgstate_readed"),
								allReaded: i18next.t("pc_im_msgstate_allreaded")
							}
						};
					o === ContentType.IM_SPACE_FILE || o === ContentType.ORG_SPACE_FILE || o === ContentType.SAFETY_IM_SPACE_FILE ?
						t.text = l.spaceFile :
						t.text = l.default,
						t.isSingleChat = r,
						t.shouldShow = t.isMine && !d;
					var c = function() {
						try {
							t.$digest()
						} catch(e) {}
					};
					n.on(n.EventsName.UPDATE_READ_STATUS, c),
						a.on("click", ".unreadlist", function(t) {
							t.preventDefault(),
								e.showModal(n, !0)
						}),
						a.one("$destroy", function() {
							a.off("click", ".unreadlist"),
								n.off(n.EventsName.UPDATE_READ_STATUS, c)
						})
				}
			}
		}]),
		module.exports = moduleName;
}, {
	"../../../service/conversation/ContentType": 301,
	"../../../service/modal/msgReceiverListModal": 482,
	"../../../service/user/my": 704,
	"i18next": 1036,
	"path": 7
}]