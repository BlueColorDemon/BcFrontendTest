[function(require, module, exports) {
	"use strict";
	var moduleName = "ddWeb.conv.msgFactory",
		$my = require("../../user/my"),
		_ = require("lodash"),
		SendStatus = require("./../SendStatus"),
		MsgType = require("./../MsgType"),
		MsgCreatorType = require("./../MsgCreatorType"),
		fileCache = require("./fileCache"),
		limitConfig = require("../../limitConfig"),
		fileTypes = require("@ali/ding-filetypes"),
		ContentType = require("../ContentType"),
		uriResolve = require("../../uriResolve/resolve");
	angular.module(moduleName, [require("../../file/fileHelper"), require("../../senderExt/senderExtFactory")]).factory("msgFactory", ["$fileHelper", "senderExtFactory", function(e, t) {
			return {
				genUUID: function() {
					return(new Date).getTime().toString() + parseInt(1e3 * Math.random())
				},
				genSysMsg: function(e) {
					var n = this,
						a = new Date - 0,
						s = a - e.lastTime > 0 ? a : e.lastTime + 1,
						r = {
							baseMessage: {
								content: {
									contentType: 1,
									textContent: {
										text: e.text
									}
								},
								conversationId: e.cid,
								createdAt: s,
								creatorType: 2,
								memberTag: 0,
								messageId: e.mid || n.genUUID(),
								openIdEx: t.genOpenIdEx()
							},
							senderMessageStatus: {
								totalCount: 0,
								unReadCount: 0
							}
						};
					return r
				},
				genSendingMsg: function(e, n, a, s) {
					var r = new Date - 0,
						i = r - a > 0 ? r : a + 1,
						o = {
							uuid: n,
							conversationId: e,
							type: 1,
							creatorType: 1,
							content: s,
							tag: 0,
							nickName: $my.userProfileModel.nick,
							createdAt: i,
							memberTag: 0,
							openIdEx: t.genOpenIdEx()
						},
						d = {
							baseMessage: o,
							senderMessageStatus: {},
							sendStatus: SendStatus.SENDING
						};
					return d
				},
				genReceiveMsg: function(e, t) {
					var n = {
						baseMessage: e,
						senderMessageStatus: {
							totalCount: t,
							unReadCount: t - 1
						},
						receiverMessageStatus: {
							readStatus: 1
						},
						sendStatus: 1
					};
					return void 0 === n.baseMessage.memberTag && (n.baseMessage.memberTag = 0),
						n
				},
				genCreateConvMsg: function(e) {
					var t = this.genUUID(),
						n = new Date - 0,
						a = {
							uuid: t,
							type: 1,
							creatorType: 2,
							content: {
								contentType: 1,
								textContent: {
									text: $my.userProfileModel.nick + "发起了群聊"
								}
							},
							tag: 0,
							nickName: $my.userProfileModel.nick,
							createdAt: n,
							memberTag: 0
						};
					e && e(a)
				},
				genSendingTextMsg: function(e) {
					var n = e.cid,
						a = e.text,
						s = e.lastTime,
						r = _.get(e, "extra.atOpenIds"),
						i = {
							contentType: 1,
							textContent: {
								text: a
							}
						};
					r && (i.atOpenIds = r);
					var o = new Date - 0,
						d = o - s > 0 ? o : s + 1,
						c = {
							uuid: this.genUUID(),
							conversationId: n,
							type: 1,
							creatorType: 1,
							content: i,
							tag: 0,
							nickName: $my.userProfileModel.nick,
							createdAt: d,
							memberTag: 0,
							openIdEx: t.genOpenIdEx()
						},
						u = {
							baseMessage: c,
							senderMessageStatus: {},
							sendStatus: SendStatus.SENDING
						};
					return Promise.resolve(u)
				},
				genSendingSpaceFileMsg: function(e) {
					var n, a = e.cid,
						s = e.spaceFileObj,
						r = !!e.spaceFileObj,
						i = e.file,
						o = e.lastTime,
						d = e.isCompanyGroup,
						c = parseInt(r ? s.orgId : e.orgId),
						u = e.getSpaceIdPromise,
						g = new Date - 0,
						l = g - o > 0 ? g : o + 1,
						p = r ? s.name : i.name;
					n = r || d ? ContentType.ORG_SPACE_FILE : ContentType.IM_SPACE_FILE;
					var m = {
						contentType: n,
						attachments: [{
							extension: {
								f_name: p,
								f_size: r ? s.size + "" : i.size + "",
								f_type: fileTypes.getTypeByName(p),
								path: r ? s.path : null,
								s_id: r ? s.spaceId + "" : null,
								f_id: r ? s.id : null,
								cid: a
							},
							isPreload: 0,
							size: 0,
							type: 0,
							url: ""
						}]
					};
					d && _.set(m, "attachments[0].extension.oid", c + "");
					var y = {
							uuid: this.genUUID(),
							conversationId: a,
							type: MsgType.NORMAL,
							creatorType: MsgCreatorType.SELF,
							content: m,
							tag: 0,
							nickName: $my.userProfileModel.nick,
							createdAt: l,
							memberTag: 0,
							openIdEx: t.genOpenIdEx()
						},
						I = {
							baseMessage: y,
							senderMessageStatus: {},
							sendStatus: SendStatus.SENDING
						};
					return !r && i && (_.set(I, "_local.fileId", fileCache.cache(i)),
							_.set(I, "_local.getSpaceIdPromise", u)),
						Promise.resolve(I)
				},
				genForwardMsg: function(e, t, n) {
					var a = {
						uuid: this.genUUID(),
						messageId: e,
						toConversationId: t,
						nickName: n
					};
					return a
				},
				genSendLinkMsg: function(e) {
					var t = {
						uuid: this.genUUID(),
						conversationId: e.conversationId,
						type: 1,
						creatorType: 1,
						content: {
							contentType: ContentType.SHARE,
							attachments: [e.attachment]
						}
					};
					return t
				},
				genSendingImgMsg: function(n) {
					var a = n.cid,
						s = n.lastTime,
						r = n.file,
						i = n.mediaId || null,
						o = 0;
					r ? (o = r.size,
						i = null) : i && (o = n.picSize || 0);
					var d = new Date - 0,
						c = d - s > 0 ? d : s + 1,
						u = n.extension || null;
					if(!r && !i)
						return Promise.reject({
							body: {
								reason: "file 和 mediaId 都为空"
							}
						});
					var g = {
							mediaId: i,
							picSize: o,
							type: 1,
							orientation: 1,
							extension: u
						},
						l = {
							contentType: 2,
							photoContent: g
						},
						p = {
							uuid: this.genUUID(),
							conversationId: a,
							type: 1,
							creatorType: 1,
							content: l,
							tag: 0,
							nickName: $my.userProfileModel.nick,
							createdAt: c,
							memberTag: 0,
							openIdEx: t.genOpenIdEx()
						},
						m = {
							baseMessage: p,
							senderMessageStatus: {},
							sendStatus: SendStatus.SENDING,
							_local: {
								fileId: fileCache.cache(r)
							}
						};
					return r ? (_.set(m, "_local.fileId", fileCache.cache(r)),
						o > limitConfig.IMAGE_READ_B64_SIZE_LIMIT ? (_.set(m, "_local.localURI", uriResolve.assetsResolve("/app/img/filelogo/pic.png")),
							Promise.resolve(m)) : new Promise(function(t, n) {
							e.readFile(r, function() {
								var e = fileTypes.getTypeByName(r.name);
								_.set(m, "_local.localURI", r.dataURI),
									"jpg" !== e && "jpeg" !== e || !r.orientation || (l.photoContent.orientation = r.orientation),
									t(m)
							})
						})) : Promise.resolve(m)
				},
				genEOFMsg: function() {
					var e = {
						baseMessage: {
							createdAt: 0,
							messageId: this.genUUID(),
							creatorType: MsgCreatorType.EOF,
							content: {
								contentType: ContentType.EOF
							}
						},
						EOF: !0
					};
					return e
				}
			}
		}]),
		module.exports = moduleName;
}, {
	"../../file/fileHelper": 397,
	"../../limitConfig": 434,
	"../../senderExt/senderExtFactory": 622,
	"../../uriResolve/resolve": 697,
	"../../user/my": 704,
	"../ContentType": 301,
	"./../MsgCreatorType": 306,
	"./../MsgType": 308,
	"./../SendStatus": 311,
	"./fileCache": 323,
	"@ali/ding-filetypes": 784,
	"lodash": 1057
}]