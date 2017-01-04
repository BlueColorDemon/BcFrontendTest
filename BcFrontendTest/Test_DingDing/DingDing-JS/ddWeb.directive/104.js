[function(require, module, exports) {
	"use strict";
	var moduleName = "ddWeb.directive.convItem",
		path = require("path"),
		ConvExtensionType = require("../../service/conversation/convExtensionType"),
		$my = require("../../service/user/my"),
		ConvType = require("../../service/conversation/ConvType"),
		SuperGroupStatus = require("../../service/conversation/SuperGroupStatus"),
		WKEngine = require("@ali/wksdk"),
		conversationStatus = WKEngine.conversationStatus,
		groupAuthority = WKEngine.groupAuthority,
		RemindText = require("../../service/conversation/RemindText"),
		RemindEnum = require("../../service/conversation/RemindEnum"),
		IMLogType = require("../../service/log/imLogType");
	angular.module(moduleName, [require("../../service/conversation/conversationWithSDK"), require("../../service/modal/confirm"), require("../../service/modal/profileModal"), require("../../service/unPopModal/groupSetting"), require("../../service/modal/groupAddMembersModal"), require("../widget/contextMenu"), require("../avatar/groupAvatar"), require("../../service/toast/toast"), require("../../service/modal/updateConfirm"), require("../../service/log/imLog")]).directive("convItem", ["$rootScope", "conversationWithSDK", "$confirm", "profileModalService", "groupSettingService", "groupAddMembersModalService", "toastService", "updateConfirmService", "imLog", function(e, n, t, o, i, r, c, s, a) {
			return {
				restrict: "AE",
				scope: {
					convId: "="
				},
				controllerAs: "convItem",
				controller: ["$scope", function(s) {
					function a(e) {
						r.showModal(e).then(function(t) {
							t = t.concat(parseInt(e.lockedIds[0] != $my.uid ? e.lockedIds[0] : e.lockedIds[1])),
								n.createConversation(t, null, {
									isOrg: !1
								}, function(e, n) {
									e && u(n)
								})
						}).catch(function(e) {
							e instanceof Error && c.show(e.message, {
								type: "error"
							})
						})
					}

					function v(e, t) {
						r.showModal(t).then(function(t) {
							n.addMembers(e, t, function() {
								u(e)
							})
						}).catch(function(e) {
							e instanceof Error && c.show(e.message, {
								type: "error"
							})
						})
					}

					function u(n) {
						e.$broadcast("leftpannel.openChatByGroup", {
							conversationId: n
						})
					}
					var m = this;
					m.ConvType = ConvType,
						m.allConv = n.getAllConv(),
						m.SuperGroupStatus = SuperGroupStatus,
						m.convId = s.convId;
					var d = m.allConv[m.convId];
					m.conv = d,
						m.convListObj = n.getConvList(),
						this.RemindText = RemindText;
					var p = function() {
						s.$evalAsync(function() {})
					};
					this.hideConv = function(e, t) {
							n.hideConv(e, !0),
								t.stopPropagation()
						},
						this.isShowMsgCount = function() {
							if(m.conv.notificationOff && m.conv.newMsg > 1) {
								if(!m.conv.remindType)
									return !0;
								if(m.conv.remindType === RemindEnum.EMPTY)
									return !0
							}
							return !1
						};
					var l = {
						del: {
							type: "del",
							text: "删除会话"
						},
						groupSetting: {
							type: "group-setting",
							text: "群设置"
						},
						profile: {
							type: "profile",
							text: "个人信息"
						},
						addNewMember: {
							type: "addNewMember",
							text: "添加新成员"
						},
						clearMsg: {
							type: "clearMsg",
							text: "清空聊天记录"
						}
					};
					this.getMenuItem = function(e) {
							var t = n.getConvObj(e).baseConversation,
								o = t.sort > 0;
							if(l.pin = {
									type: "pin",
									text: o ? "取消置顶" : "置顶会话"
								},
								t.extension && t.extension.type === ConvExtensionType.FILESHELPER)
								return [l.pin, l.del];
							if(t.extension && t.extension.type === ConvExtensionType.GROUPREQUEST)
								return [l.del];
							if(t.extension && t.extension.type === ConvExtensionType.FRIEND)
								return [l.del];
							if(t.tag === ConvType.SECRETARY)
								return [l.pin, l.del];
							if(t.tag === ConvType.ANNOUNCEMENT)
								return [l.pin, l.groupSetting, l.del];
							if(2 === t.type)
								return t.authority === groupAuthority.ONLY_OWNER && t.ownerId != $my.uid ? [l.pin, l.groupSetting, l.del, l.clearMsg] : [l.pin, l.groupSetting, l.del, l.addNewMember, l.clearMsg];
							if(1 === t.type) {
								var i = t.conversationId.split(":");
								return i[0] == $my.uid && i[1] == $my.uid ? [l.pin, l.profile, l.del, l.clearMsg] : [l.pin, l.profile, l.del, l.addNewMember, l.clearMsg]
							}
							return []
						},
						this.onMenuItemClick = function(r, c) {
							var u = n.getConvObj(r),
								m = u.baseConversation;
							switch(c) {
								case "del":
									n.hideConv(r);
									break;
								case "pin":
									var d = m.sort > 0;
									n.getConvObj(r).setTop(!d);
									break;
								case "profile":
									var p = m.conversationId.split(":");
									o(p[0] != $my.uid ? p[0] : p[1]);
									break;
								case "group-setting":
									n.activeConv(r).then(function() {
										i.open(null, {
											cid: r
										})
									});
									break;
								case "addNewMember":
									var l = {
										isCompanyGroup: !1,
										oid: null,
										orgName: null,
										lockedIds: [],
										conversationId: r
									};
									n.activeConv(r).then(function() {
										if(1 === m.type)
											l.lockedIds = m.conversationId.split(":").map(function(e) {
												return parseInt(e)
											}),
											a(l);
										else if(2 === m.type) {
											if(u.baseConversation.tag === ConvType.COMPANY_GROUP && (l.isCompanyGroup = !0,
													u.baseConversation.extension && u.baseConversation.extension.id)) {
												l.oid = u.baseConversation.extension.id;
												var n = $my.getOrgByOid(l.oid);
												n && (l.orgName = n.orgEmployeeModel.orgName)
											}
											u.getMembers(function(e) {
												l.lockedIds = e.map(function(e) {
														return e.openIdEx.openId
													}),
													v(m.conversationId, l)
											})
										}
										e.$digest()
									});
									break;
								case "clearMsg":
									t({
										title: "清空聊天记录",
										content: "确定清空此会话聊天记录？"
									}).then(function() {
										u.clearMsg(function() {
											s.$digest()
										})
									})
							}
						},
						d.EventEmitter.on(d.EVENTS.UPDATE_SAFETY_STATUS, p),
						d.EventEmitter.on(d.EVENTS.UPDATE_BASE_CONV, p),
						d.EventEmitter.on(d.EVENTS.LAST_MSG_REMIND_UPDATE, p),
						d.EventEmitter.on(d.EVENTS.NOTIFICATION_STATUS_CHANGE, p),
						d.EventEmitter.on(d.EVENTS.UPDATE_TITLE, p),
						s.$on("$destroy", function() {
							d.EventEmitter.off(d.EVENTS.UPDATE_SAFETY_STATUS, p),
								d.EventEmitter.off(d.EVENTS.UPDATE_BASE_CONV, p),
								d.EventEmitter.off(d.EVENTS.LAST_MSG_REMIND_UPDATE, p),
								d.EventEmitter.off(d.EVENTS.NOTIFICATION_STATUS_CHANGE, p),
								d.EventEmitter.off(d.EVENTS.UPDATE_TITLE, p)
						})
				}],
				link: function(e, o) {
					function i(e) {
						return t({
							title: "确认消息",
							content: "你已被移出此群，是否删除该对话入口？"
						}).then(function() {
							n.deleteConv(e)
						}, function() {
							n.activeConv(e)
						})
					}

					function r(e, o) {
						return t({
							title: "确认消息",
							content: "该群组已经被解散了，是否删除该对话入口？"
						}).then(function() {
							n.deleteConv(e)
						}, function() {
							n.activeConv(e)
						})
					}

					function c() {
						return s({
							title: "确认信息",
							content: "当前版本过低，无法打开本会话"
						})
					}
					var v = e.convId,
						u = n.getAllConv(),
						m = u[v],
						d = function() {
							m.baseConversation.status === conversationStatus.KICKED ?
								i(v) :
								m.asbeConversation.status === conversationStatus.DISBANDED ?
								r(v) :
								m.baseConversation.tag === ConvType.FILEHELPER &&
                            _.values(ConvExtensionType).indexOf(m.baseConversation.extension.type) === -1 ?
								c() :
								(a.trace(v, IMLogType.MAIPAGE_MSG_LIST),
									n.activeConv(v))
						};
					o[0].addEventListener("click", d),
						e.$on("$destroy", function() {
							o[0].removeEventListener("click", d)
						})
				},
				template: '<div class="list-item conv-item context-menu"\n    ng-class="{\'active\' : convItem.convListObj.activeConvId === convItem.convId,\'pin\':convItem.conv.baseConversation.sort > 0,\'notice-mute\': convItem.conv.notificationOff,\'conv-item-company\':convItem.conv.baseConversation.tag===convItem.ConvType.COMPANY_GROUP || convItem.conv.baseConversation.tag===convItem.ConvType.ENCRYPT_CHAT,\'safety-item\': convItem.conv.isSafety}"\n    context-menu menu-data="{{convItem.conv.convId}}" menu-item-get="convItem.getMenuItem" menu-item-click="convItem.onMenuItemClick">\n    <i class="iconfont icon-delete-conv" htitle="删除会话" htitle-direction="left" ng-click="convItem.hideConv(convItem.conv.convId,$event)">&#xe632;</i>\n    <div class="avatar-wrap"><group-avatar cid="{{:: convItem.conv.convId }}"></group-avatar></div>\n    <i class="icon-safety-avatar" ng-show="convItem.conv.isSafety"></i>\n    <div class="conv-item-content">\n        <divf class="title-wrap info">\n            <div class="name-wrap">\n                <p class="name" ng-bind-html="convItem.conv.baseConversation.title|emoj"></p>\n                <i class="icon-company" ng-if="::convItem.conv.isCompanyGroup" ng-class="{\'icon-dept-company\':convItem.conv.isDeptGroup ,\'icon-all-user-company\': convItem.conv.isAllUserGroup}"></i>\n            </div>\n            <span class="time">{{convItem.conv.updateTime|dateTime}}</span>\n        </divf>\n        <div class="latest-msg-info">\n            <p class="latest-msg">\n                <span ng-show="convItem.conv.remindType" class="highlight">{{convItem.RemindText[convItem.conv.remindType]}}</span>\n                <span ng-show="convItem.isShowMsgCount()" ng-bind-html="\'[\' + (convItem.conv.newMsg)+\'条]\'"></span>\n                <span ng-bind-html="convItem.conv.lastMessageContent|emoj"></span>\n            </p>\n            <div class="noti">\n                <i class="iconfont icon-conv-mute" ng-show="convItem.conv.notificationOff">&#xe605;</i>\n                <span class="unread-num" ng-if="convItem.conv.newMsg">\n                    <em ng-show="!convItem.conv.notificationOff">{{convItem.conv.newMsg}}</em>\n                    <em ng-show="convItem.conv.notificationOff"></em>\n                </span>\n            </div>\n        </div>\n    </div>\n</div>\n'
			}
		}]),
		module.exports = moduleName;
}, {
	"../../service/conversation/ConvType": 302,
	"../../service/conversation/RemindEnum": 309,
	"../../service/conversation/RemindText": 310,
	"../../service/conversation/SuperGroupStatus": 312,
	"../../service/conversation/convExtensionType": 314,
	"../../service/conversation/conversationWithSDK": 316,
	"../../service/log/imLog": 439,
	"../../service/log/imLogType": 440,
	"../../service/modal/confirm": 467,
	"../../service/modal/groupAddMembersModal": 479,
	"../../service/modal/profileModal": 488,
	"../../service/modal/updateConfirm": 500,
	"../../service/toast/toast": 682,
	"../../service/unPopModal/groupSetting": 695,
	"../../service/user/my": 704,
	"../avatar/groupAvatar": 53,
	"../widget/contextMenu": 157,
	"@ali/wksdk": 869,
	"path": 7
}]