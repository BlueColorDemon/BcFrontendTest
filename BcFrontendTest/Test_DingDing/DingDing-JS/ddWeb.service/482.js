[function(require, module, exports) {
	"use strict";
	var moduleName = "ddWeb.service.msgReceiverListModal",
		path = require("path"),
		_ = require("lodash"),
		MainScene = require("../../service/user/MainScene"),
		userHelper = require("../user/userHelper");
	require("./profileModal.js"),
		require("./modalHelper"),
		angular.module(moduleName, [require("@ali/ding-api").interface.IDLDing, "ddWeb.service.profileModal", require("../conversation/conversationWithSDK"), require("./modal"), require("./sendDingModal"), require("../ding/dinglist"), require("../ding/DingSendStatus"), require("../../service/log/lwlog")]).factory("msgReceiverListModalService", ["IDLDing", "profileModalService", "$modal", function(e, n, i) {
			function s(e, n) {
				var s = {
						isMsg: n,
						isShowDing: n && 1 === e.baseMessage.content.contentType,
						hasData: !1,
						isAllRead: !1
					},
					r = i.open({
						template: '<div class="dialog middle receiver-list-modal">\n    <div class="head">\n        <i class="close iconfont"></i>\n        <div class="header">\n            {{mrlCtrl.title}}\n        </div>\n    </div>\n    <div class="body">\n        <div class="ui list relaxed divided">\n            <span class="loading" ng-if="!mrlCtrl.dataReady">\n            <div class="bounce1"></div>\n            <div class="bounce2"></div>\n            <div class="bounce3"></div>\n            </span>\n            <div ng-if="mrlCtrl.unConfirmedRec.length === 0" class="unreadList-all-read">全部已读</div>\n\n            <div ng-if="mrlCtrl.unConfirmedRec.length > 0 && mrlCtrl.unConfirmedRec.length !== 0" class="clearfix">\n                <div>\n                    <span ng-if="!mrlCtrl.isMsg">未确认</span>\n                    <span ng-if="mrlCtrl.isMsg">未读</span>\n                    <span>({{mrlCtrl.unConfirmedRec.length}})</span>\n                    <a href="javascript:;" class="ding-again-btn" ng-click="mrlCtrl.dingAgain()" ng-if="!mrlCtrl.isMsg&&mrlCtrl.isShowDingAgain">再次提醒</a>\n                </div>\n\n                <div class="item-list clearfix">\n                    <div class="people" ng-repeat="item in mrlCtrl.unConfirmedRec" htitle="{{item.displayName}}{{item.status}}">\n                        <dd-avatar uid="item.user.userProfileModel.uid"\n                                   ng-click="mrlCtrl.showUserProfile(item.user.userProfileModel.uid)"\n                                   class="dinglist-tool-pointer"></dd-avatar>\n                        <div class="unconfirm-loading-box" ng-if="!mrlCtrl.isMsg && item.statusCode < 10&&mrlCtrl.isShowDingAgain">\n                            <i class="close iconfont unconfirm-loading-btn">&#xe668;</i>\n                        </div>\n                        <p ng-bind-html="item.displayName|emoj"></p>\n                    </div>\n                </div>\n            </div>\n\n            <div ng-if="mrlCtrl.confirmRec.length > 0 && mrlCtrl.unConfirmedRec.length !== 0">\n                <div>\n                    <span ng-if="!mrlCtrl.isMsg">已确认</span>\n                    <span ng-if="mrlCtrl.isMsg">已读</span>\n                    <span>({{mrlCtrl.confirmRec.length}})</span>\n                </div>\n                <div class="item-list clearfix">\n                    <div class="people" ng-repeat="item in mrlCtrl.confirmRec" htitle="{{item.displayName}}">\n                        <dd-avatar uid="item.user.userProfileModel.uid"\n                                   ng-click="mrlCtrl.showUserProfile(item.user.userProfileModel.uid)"\n                                   class="dinglist-tool-pointer"></dd-avatar>\n                        <p ng-bind-html="item.displayName|emoj"></p>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class="foot">\n        <button class="blue" ng-show="!mrlCtrl.isShowDing" ng-click="mrlCtrl.close()">确定</button>\n        <button class="blue" ng-show="mrlCtrl.isShowDing" ng-click="mrlCtrl.msgToDing()">DING一下</button>\n    </div>\n</div>\n',
						controller: "msgReceiverListCtrl",
						controllerAs: "mrlCtrl",
						resolve: {
							options: function() {
								return s
							},
							msg: function() {
								return e
							}
						}
					});
				return r.result
			}
			return {
				showModal: s
			}
		}]).controller("msgReceiverListCtrl", ["$modalInstance", "options", "msg", "profileModalService", "conversationWithSDK", "sendDingModalService", "dinglist", "DingSendStatus", "$scope", "lwlog", function(e, n, i, s, r, t, l, o, a, d) {
			function c() {
				try {
					a.$digest()
				} catch(e) {}
			}
			this.isMsg = n.isMsg,
				n.isMsg ? this.title = "消息接收人列表" : this.title = "消息确认详情",
				this.dataReady = !1,
				this.msg = i,
				this.isShowDing = n.isShowDing;
			var g = r.getConvObj(this.msg.baseMessage.conversationId);
			this.showUserProfile = function(n) {
					e.close("ok"),
						s(n)
				},
				this.msgToDing = function() {
					d.commLog("chat_unread_user_ding");
					var n = this,
						i = n.unConfirmedRec.map(function(e) {
							return e.user.userProfileModel.uid
						}),
						s = [];
					g.getMembers(function(r) {
						s = r.map(function(e) {
								return e.openIdEx.openId
							}),
							e.close("ok"),
							t.showModal({
								msgId: n.msg.baseMessage.messageId,
								content: n.msg ? n.msg.getContent().textContent.text : "",
								selectedUids: i,
								customUids: s,
								disableEdit: !0
							}),
							c()
					})
				},
				this.close = function() {
					e.close("ok")
				};
			var m = this;
			this.isMsg ?
				(i.getReceiverList().then(function(e) {
						var n = [],
							i = [],
							s = g.getScene(MainScene.RECEIVER_LIST);
						e.confirmReceivers.forEach(function(e) {
								var i = e.user;
								n.push(userHelper.getName(i, g.convId, s, {
									oid: g.orgId
								}).then(function(n) {
									return _.assign(e, {
										displayName: n
									})
								}))
							}),
							e.unConfirmReceivers.forEach(function(e) {
								var n = e.user;
								i.push(userHelper.getName(n, g.convId, s, {
									oid: g.orgId
								}).then(function(n) {
									return _.assign(e, {
										displayName: n
									})
								}))
							}),
							Promise.all([Promise.all(n), Promise.all(i)]).then(function(e) {
								m.confirmRec = e[0],
									m.unConfirmedRec = e[1],
									m.dataReady = !0,
									c()
							})
					}),
					i.on(i.EventsName.UPDATE_READ_STATUS, c)) :
				l.getDingById(i.baseMessage.memberExtension.dingId, function(e) {
					m.ding = e,
						e.on(e.EventsName.UPDATE_CONFIRM, c),
						e.on(e.EventsName.UPDATE_PARTICIPATOR, c),
						e.getReceiverList(function(n) {
							var i = [],
								s = [],
								r = g.getScene(MainScene.RECEIVER_LIST);
							n.confirmList.forEach(function(e) {
									var n = e.user;
									i.push(userHelper.getName(n, g.convId, r, {
										oid: g.orgId
									}).then(function(n) {
										return _.assign(e, {
											displayName: n
										})
									}))
								}),
								n.unConfirmList.forEach(function(e) {
									var n = e.user;
									s.push(userHelper.getName(n, g.convId, r, {
										oid: g.orgId
									}).then(function(n) {
										return _.assign(e, {
											displayName: n
										})
									}))
								}),
								Promise.all([Promise.all(i), Promise.all(s)]).then(function(n) {
									m.confirmRec = n[0],
										m.unConfirmedRec = n[1],
										m.dataReady = !0,
										m.isShowDingAgain = e.sendStatus !== o.NOTSEND,
										c()
								})
						})
				}),
				this.dingAgain = function() {
					t.dingAgain(i.baseMessage.memberExtension.dingId)
				},
				a.$on("$destroy", function() {
					m.ding && (m.ding.off(m.ding.EventsName.UPDATE_CONFIRM, c),
							m.ding.off(m.ding.EventsName.UPDATE_PARTICIPATOR, c)),
						m.isMsg && i.off(i.EventsName.UPDATE_READ_STATUS, c)
				})
		}]),
		module.exports = moduleName;
}, {
	"../../service/log/lwlog": 444,
	"../../service/user/MainScene": 698,
	"../conversation/conversationWithSDK": 316,
	"../ding/DingSendStatus": 349,
	"../ding/dinglist": 366,
	"../user/userHelper": 710,
	"./modal": 480,
	"./modalHelper": 481,
	"./profileModal.js": 488,
	"./sendDingModal": 494,
	"@ali/ding-api": 781,
	"lodash": 1057,
	"path": 7
}]