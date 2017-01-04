[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.conv.MsgWithSDK"
      , semver = require("semver")
      , MIN_OA_VERSION = require("../../limitConfig").MIN_MICRO_APP_NW_VERSION
      , MsgType = require("@ali/wksdk").messageType
      , MsgCreatorType = require("@ali/wksdk").messageCreatorType
      , MsgTag = require("../MsgTag")
      , DecryptType = require("@ali/wksdk").decryptType
      , spaceFileHelper = require("../../../service/file/spaceFileHelper")
      , ua = require("../../ua")
      , fileCache = require("./fileCache")
      , ConversationErrorText = require("../ErrorText")
      , nwWindow = require("../../app/nwWindow");
    require("../../log/log");
    var $my = require("../../user/my");
    require("../../user/userManager");
    var Class = require("../../../lib/class")
      , SendStatus = require("../SendStatus")
      , localLog = require("../../../service/log/localLog")
      , _ = require("lodash")
      , EventEmitter = require("wolfy87-eventemitter")
      , msgContentTypeChecker = require("../msgContentTypeChecker")
      , ContentType = require("../ContentType");
    angular.module(moduleName, [require("@ali/ding-api").interface.IMI, "ddWeb.log.log", "ddWeb.user.userManager", require("./msgFactory"), require("../../toast/toast"), require("../../../service/app/download/fileFactory"), require("../../../service/mediaId/mediaId"), require("../../../service/emotion/emotionPackageFactory"), require("../../../service/safety/safetyHelper"), require("../../../service/error/conversationError")]).factory("MsgWithSDK", ["IMI", "log", "userManager", "textCellService", "msgFactory", "toastService", "fileFactory", "mediaId", "EmotionPackageFactory", "safetyHelper", "conversationError", function (e, t, n, s, i, r, o, a, c, d, u) {
        var p = Class.create({
            initialize: function (e) {
                this.sdkMsg = e,
                this.sendProgress = this.uploadProgress = 0,
                this._initListener(),
                this._syncSdkAttribute(this.sdkMsg),
                this._localId = this.getLocalId();
                var t = _.get(e, "baseMessage.openIdEx.openId");
                t && n.compareTag(t, e.baseMessage.openIdEx.tag)
            },
            Implements: EventEmitter,
            EventsName: {
                SEND_SUCCESS: "sendSuccess",
                SEND_FAIL: "sendFail",
                UPDATE_EXTENSION: "update_extension",
                UPDATE_READ_STATUS: "update_read_status",
                UPDATE_TO_DING: "update_to_ding",
                PROGRESS_UPDATE: "progress_update",
                RECALL_STATUS_CHANGE: "recall_status_change",
                PRIVATE_TAG_CHANGE: "private_tag_change",
                DELETED_CHANGE: "deleted_change",
                DECRYPT_STATUS_CHANGE: "decrypt_status_change"
            },
            _initListener: function () {
                var e = this.sdkMsg;
                e.addListener(e.EventsName.SEND_STATUS_CHANGE, function (t) {
                    this.sendStatus = t,
                    this.baseMessage = e.baseMessage,
                    t === e.SEND_STATUS.SENDED && (this.emit(this.EventsName.SEND_SUCCESS),
                    delete this.localInfo),
                    t === e.SEND_STATUS.SENDFAIL && this.emit(this.EventsName.SEND_FAIL)
                }
                .bind(this)),
                e.addListener(e.EventsName.SENDER_MESSAGE_STATUS_CHANGE, function () {
                    this.senderMessageStatus = e.senderMessageStatus,
                    this.emit(this.EventsName.UPDATE_READ_STATUS)
                }
                .bind(this)),
                e.addListener(e.EventsName.SEND_PROGRESS, function (e) {
                    this.sendProgress = this.uploadProgress = Math.ceil(100 * e),
                    this.emit(this.EventsName.PROGRESS_UPDATE)
                }
                .bind(this)),
                e.addListener(e.EventsName.RECALL_STATUS_CHANGE, function (e) {
                    this.emit(this.EventsName.RECALL_STATUS_CHANGE)
                }
                .bind(this)),
                e.addListener(e.EventsName.DELETED_CHANGE, function (e) {
                    this.emit(this.EventsName.DELETED_CHANGE)
                }
                .bind(this)),
                e.addListener(e.EventsName.PRIVATE_TAG_CHANGE, function (e) {
                    this.emit(this.EventsName.PRIVATE_TAG_CHANGE)
                }
                .bind(this)),
                e.addListener(e.EventsName.DECRYPT_STATUS_CHANGE, function () {
                    this.emit(this.EventsName.DECRYPT_STATUS_CHANGE)
                }
                .bind(this)),
                e.addListener(e.EventsName.RECEIVER_MESSAGE_STATUS_CHANGE, function () {
                    this.receiverMessageStatus = e.receiverMessageStatus || {}
                }
                .bind(this))
            },
            _syncSdkAttribute: function (e) {
                this.baseMessage = e.baseMessage,
                this._local = e._local,
                this.senderMessageStatus = e.senderMessageStatus || {},
                this.receiverMessageStatus = e.receiverMessageStatus || {},
                this.sendStatus = e.sendStatus,
                e.localInfo && (this.localInfo = e.localInfo)
            },
            getConvId: function () {
                return _.get(this, "baseMessage.conversationId")
            },
            getId: function () {
                return this.sdkMsg.getId()
            },
            getSenderOpenId: function () {
                return this.sdkMsg.getOpenId()
            },
            getLocalId: function () {
                return this.sdkMsg.getLocalId()
            },
            getMessageId: function () {
                return this.sdkMsg.getMessageId()
            },
            isMySend: function () {
                return this.sdkMsg.isMe()
            },
            needDecrypt: function () {
                return this.sdkMsg.needDecrypt()
            },
            decrypt: function () {
                var e = _.get(this.baseMessage, "content.contentType");
                if (this.needDecrypt()) {
                    if (e === ContentType.TEXT)
                        return this.sdkMsg.decrypt()
                } else
                    localLog.info("contentType is not support to decrypt", this.getId(), e);
                return Promise.resolve()
            },
            isDecrypted: function () {
                if (this.baseMessage.type === MsgType.ENCRYPTED && this.baseMessage.isDecrypt === DecryptType.YES)
                    return !0;
                var e = this.baseMessage.content.contentType;
                return [ContentType.SAFETY_IMG, ContentType.SAFETY_AUDIO].indexOf(e) !== -1
            },
            cancelSending: function () {
                if (this.sdkMsg.cancel)
                    return this.sdkMsg.cancel();
                throw new Error("can't cancel sending msg")
            },
            updateToRead: function (e) {
                var t = this.baseMessage.content.contentType;
                if (e)
                    return this._updateToRead();
                if (this.baseMessage.openIdEx && this.baseMessage.openIdEx.openId !== $my.getId() && (!this.receiverMessageStatus || 2 !== this.receiverMessageStatus.readStatus)) {
                    if (this.baseMessage && this.baseMessage.content) {
                        if (t === ContentType.AUDIO)
                            return;
                        if (t === ContentType.IM_SPACE_FILE || t === ContentType.ORG_SPACE_FILE)
                            return
                    }
                    this.isSupport2Show && "hidden" !== document.visibilityState && "hidden" !== nwWindow.visibilityState && this._updateToRead()
                }
            },
            updateToView: function () {
                return this.sdkMsg.updateToView()
            },
            updateAudioMsgToRead: function () {
                this._updateToRead()
            },
            updateSpaceFileMsgToRead: function () {
                this._updateToRead()
            },
            _updateToRead: function () {
                var e = this;
                return e.sendStatus !== SendStatus.SENDING && e.sendStatus !== SendStatus.SENDFAIL && (t.info("update msgs to read", e.getId()),
                e.sdkMsg.updateToRead(),
                !0)
            },
            reSend: function () {
                return this.sdkMsg.resend().catch(u.handleSendMsgError)
            },
            getQuoteContent: function () {
                return this.getQuoterNick().then(function (e) {
                    var t = this.getContent()
                      , n = s.createCell({
                          replaceText: "@" + this.getSenderOpenId() + " ",
                          toReplaceText: "@" + e + " "
                      });
                    return t.textContent.text = "「 " + n + "：" + t.textContent.text + " 」\n--------\n",
                    Promise.resolve(t)
                }
                .bind(this))
            },
            getContent: function () {
                var e = angular.copy(this.baseMessage.content)
                  , t = e.contentType
                  , n = /@[0-9]+[^\s@]/g;
                if (t == ContentType.TEXT) {
                    var s = e.atOpenIds
                      , i = e.textContent.text
                      , r = i.match(n);
                    r && s && r.forEach(function (e) {
                        var t = s[e.substr(1, e.length - 1)];
                        t && (i = i.replace(e, "@" + s[e.substr(1, e.length - 1)]))
                    }),
                    e.textContent.text = i
                }
                return e
            },
            getSenderNick: function () {
                return new Promise(function (e, s) {
                    n.getUsers([this.getSenderOpenId()]).then(function (n) {
                        if (n && n[0]) {
                            var s = n[0];
                            e(s.remarkNameObj.alias || s.userProfileModel.nick)
                        } else
                            e(""),
                            t.error("get sender nick fail, msg id: " + this.getId() + ", openId: " + this.getSenderOpenId())
                    }
                    .bind(this))
                }
                .bind(this))
            },
            getQuoterNick: function () {
                return new Promise(function (e, s) {
                    n.getUsers([this.getSenderOpenId()]).then(function (n) {
                        if (n && n[0]) {
                            var s = n[0];
                            e(s.userProfileModel.nick)
                        } else
                            e(""),
                            t.error("get sender nick fail, msg id: " + this.getId() + ", openId: " + this.getSenderOpenId())
                    }
                    .bind(this))
                }
                .bind(this))
            },
            dingToMsg: function () { },
            isDingContentType: function () {
                var e = _.get(this, "baseMessage.content.contentType");
                return [ContentType.TEXT, ContentType.IMG, ContentType.FILE, ContentType.ORG_SPACE_FILE, ContentType.IM_SPACE_FILE, ContentType.SHARE, ContentType.GROUP_ANNOUNCE, ContentType.OA, ContentType.AUDIO].indexOf(e) !== -1
            },
            hasRead: function () {
                return this.sdkMsg.isMeRead()
            },
            isDisplay: function () {
                return 1 !== this.baseMessage.recallStatus && !this.sdkMsg.isDel()
            },
            isDel: function () {
                return this.sdkMsg.isDel()
            },
            isEmotion: function () {
                return msgContentTypeChecker.isEmotionImage(this)
            },
            isEmotionPackage: function () {
                return !0
            },
            isSupport2Show: function () {
                var e = this.baseMessage
                  , t = !0
                  , n = [ContentType.RED_ENVELOPE_ENTERPRISE, ContentType.RED_ENVELOPE_RANDOM, ContentType.RED_ENVELOPE_NORMAL, ContentType.RED_ENVELOPE_SYSTEM, ContentType.RED_ENVELOPE_ALIPAY].indexOf(e.content.contentType) > -1
                  , s = [ContentType.SAFETY_IM_SPACE_FILE, ContentType.SAFETY_IMG].indexOf(e.content.contentType) > -1;
                return 2 === e.memberTag || e.content.contentType === ContentType.TEXT || e.content.contentType === ContentType.IMG || e.content.contentType === ContentType.AUDIO || e.content.contentType === ContentType.FILE || e.content.contentType === ContentType.SHARE && (16 === e.content.attachments[0].type || 102 === e.content.attachments[0].type) || e.content.contentType === ContentType.ORG_SPACE_FILE || e.content.contentType === ContentType.IM_SPACE_FILE || e.content.contentType === ContentType.CARD || e.content.contentType === ContentType.OA && t || e.content.contentType === ContentType.MAIL || e.content.contentType === ContentType.GROUP_ANNOUNCE || e.content.contentType === ContentType.ROBOT_MARKDOWN || s || n
            },
            withDraw: function (t) {
                var n = this;
                if (n.sendStatus === SendStatus.SENDING || n.sendStatus === SendStatus.SENDFAIL || 1 === n.baseMessage.recallStatus)
                    return !1;
                var s = _.get(n, "baseMessage.content.contentType");
                return s === ContentType.ORG_SPACE_FILE || s === ContentType.IM_SPACE_FILE || this.isSafetyFile() ? e.recallYunpanMsg(parseInt(this.baseMessage.messageId), function (e) {
                    200 === e.code ? n.sdkMsg.receiveMsgChange({
                        recallStatus: 1
                    }) : n._hintWithDrawFail()
                }) : n.sdkMsg.recallMessage().catch(function () {
                    n._hintWithDrawFail()
                }),
                !0
            },
            addEmotion: function () {
                var e = _.get(this.baseMessage, "content.photoContent.picSize");
                if (!this.canAddEmotion())
                    return Promise.reject("addEmotion, params error");
                if (!c.isSizeValid(e))
                    return Promise.reject("addEmotion, file size error");
                var t = _.get(this.baseMessage, "content.photoContent.mediaId")
                  , n = _.get(this.baseMessage, "content.photoContent.filename") || "";
                return c.addCustomEmotion(n, t)
            },
            saveAs: function (e) {
                if (this.canSaveAs()) {
                    var t = this.baseMessage.content.contentType;
                    if (t === ContentType.SAFETY_IMG) {
                        var n = _.get(this, "baseMessage.content.attachments[0].extension") || {}
                          , s = spaceFileHelper.getFileUri(n)
                          , i = n.f_name
                          , r = o.create({
                              url: s,
                              name: i
                          });
                        d.decryptFile(r, n.s_id, n.f_id)
                    } else {
                        var c = _.get(this.baseMessage, "content.photoContent.mediaId")
                          , i = _.get(this.baseMessage, "content.photoContent.filename") || ""
                          , s = a.mid2Url(c, {
                              imageSize: "origin"
                          })
                          , r = o.create({
                              url: s,
                              name: i
                          });
                        r.download()
                    }
                }
            },
            remove: function () {
                return this.sdkMsg.remove().catch(function (e) {
                    r.show("删除消息失败", {
                        type: "error"
                    })
                })
            },
            _hintWithDrawFail: function (e) {
                r.show("撤回消息失败", {
                    type: "error"
                })
            },
            getReceiverList: function () {
                var e = this;
                if (e.sendStatus === SendStatus.SENDING || e.sendStatus === SendStatus.SENDFAIL)
                    return Promise.reject("消息还未发送");
                var t = {}
                  , s = []
                  , i = [];
                return e.sdkMsg.getReceivers().then(function (e) {
                    for (var r = [], o = [], a = 0; a < e.length; a++)
                        e[a].openIdEx.openId !== $my.uid && (2 === e[a].status ? r.push(e[a].openIdEx.openId) : o.push(e[a].openIdEx.openId));
                    return Promise.all([n.getUsers(r), n.getUsers(o)]).then(function (e) {
                        return s = e[0].map(function (e) {
                            return {
                                user: e
                            }
                        }),
                        i = e[1].map(function (e) {
                            return {
                                user: e
                            }
                        }),
                        t.confirmReceivers = s,
                        t.unConfirmReceivers = i,
                        t
                    })
                })
            },
            canRemove: function () {
                return this.baseMessage.creatorType === MsgCreatorType.SELF && !this.isMySend()
            },
            canAddEmotion: function () {
                var e = [ContentType.IMG]
                  , t = this.baseMessage.content.contentType;
                return e.indexOf(t) !== -1
            },
            canBeDecrypt: function () {
                var e = [ContentType.TEXT]
                  , t = this.baseMessage.content.contentType;
                return e.indexOf(t) !== -1
            },
            isSafetyFile: function () {
                var e = this.baseMessage.content.contentType
                  , t = [ContentType.SAFETY_IM_SPACE_FILE, ContentType.SAFETY_IMG, ContentType.SAFETY_AUDIO, ContentType.SAFETY_VIDEO, ContentType.SAFETY_NORMAL_VIDEO];
                return t.indexOf(e) !== -1
            },
            canSaveAs: function () {
                var e = [ContentType.IMG, ContentType.SAFETY_IMG]
                  , t = this.baseMessage.content.contentType;
                return e.indexOf(t) !== -1 && ua.isDesktop
            },
            canBeQuote: function () {
                var e = [ContentType.TEXT]
                  , t = this.baseMessage.content.contentType;
                return e.indexOf(t) !== -1 && this.baseMessage.memberTag !== MsgTag.DING && !this.isMySend() && !msgContentTypeChecker.isEmotionImage(this)
            },
            canBeForward: function () {
                var e = [ContentType.TEXT, ContentType.IMG, ContentType.FILE, ContentType.SHARE, ContentType.OA, ContentType.CARD, ContentType.GROUP_ANNOUNCE, ContentType.ORG_SPACE_FILE, ContentType.IM_SPACE_FILE, ContentType.SAFETY_IMG, ContentType.SAFETY_IM_SPACE_FILE, ContentType.ROBOT_MARKDOWN]
                  , t = this.baseMessage.content.contentType;
                return e.indexOf(t) !== -1 && 2 !== this.baseMessage.memberTag
            }
        });
        return p
    }
    ]),
    module.exports = moduleName;
}
   , {
       "../../../lib/class": 206,
       "../../../service/app/download/fileFactory": 261,
       "../../../service/emotion/emotionPackageFactory": 384,
       "../../../service/error/conversationError": 393,
       "../../../service/file/spaceFileHelper": 403,
       "../../../service/log/localLog": 441,
       "../../../service/mediaId/mediaId": 453,
       "../../../service/safety/safetyHelper": 579,
       "../../app/nwWindow": 266,
       "../../limitConfig": 434,
       "../../log/log": 442,
       "../../toast/toast": 682,
       "../../ua": 690,
       "../../user/my": 704,
       "../../user/userManager": 711,
       "../ContentType": 301,
       "../ErrorText": 304,
       "../MsgTag": 307,
       "../SendStatus": 311,
       "../msgContentTypeChecker": 326,
       "./fileCache": 323,
       "./msgFactory": 324,
       "@ali/ding-api": 781,
       "@ali/wksdk": 869,
       "lodash": 1057,
       "semver": 1069,
       "wolfy87-eventemitter": 1083
   }]