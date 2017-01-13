[function (require, module, exports) {
    "use strict";
    var IDL = require("../idl/idl")
      , IDLSend = IDL.interface.IDLSend
      , IDLMessage = IDL.interface.IDLMessage
      , IDLMessageStatus = IDL.interface.IDLMessageStatus
      , _ = require("lodash")
      , SEND_STATUS = require("./msgSendStatus")
      , updateToRead = require("./updateToRead")
      , senderExtFactory = require("./senderExtFactory")
      , conversationEventCenter = require("../conversation/conversationEventCenter")
      , My = require("../my/my")
      , EventEmitter = require("wolfy87-eventemitter")
      , Config = require("../config/config")
      , localLog = Config.get("log")
      , Class = require("../class/class")
      , MsgType = require("./msgType")
      , MsgCreatorType = require("./msgCreatorType")
      , decryptType = require("../safety/decryptType")
      , decryptMsg = require("../safety/decryptMsg")
      , baseMsgTag = require("./baseMsgTag")
      , batchUpdateMsgRead = require("./batchUpdateMsgRead")
      , BaseMsg = Class.create({
          initialize: function (e, s) {
              if (this.baseMessage = {},
              this.cancelAble = !1,
              this.hasAtMe = !1,
              this._isViewed = !1,
              this._local = {},
              e)
                  this._initWithMessageModel(e);
              else {
                  if (!s)
                      throw localLog.error("WKSDK", "实例化 msg 失败, baseMsg 和 sendMsgParam 都不存在"),
                      new Error("实例化 msg 失败, baseMsg 和 sendMsgParam 都不存在");
                  this._initWithSendMsgParam(s)
              }
          },
          Implements: EventEmitter,
          EventsName: {
              SEND_STATUS_CHANGE: "send_status_change",
              SEND_PROGRESS: "send_progress",
              SENDER_MESSAGE_STATUS_CHANGE: "sender_message_status_change",
              CANCELABLE_STATUS_CHANGE: "cancelable_status_change",
              RECALL_STATUS_CHANGE: "recall_status_change",
              EXTENSION_CHANGE: "extension_change",
              PRIVATE_TAG_CHANGE: "private_tag_change",
              PRIVATE_EXTENSION_CHANGE: "private_extension_change",
              RECEIVER_MESSAGE_STATUS_CHANGE: "receiver_message_status_change",
              DELETED_CHANGE: "deleted_change",
              DECRYPT_STATUS_CHANGE: "decrypt_status_change"
          },
          SEND_STATUS: SEND_STATUS,
          _initWithSendMsgParam: function (e) {
              this.sendStatus = SEND_STATUS.WAITING_SEND,
              this.baseMessage.openIdEx = senderExtFactory.genOpenIdEx(),
              this.baseMessage.isDecrypt = decryptType.YES,
              _.assign(this.baseMessage, e),
              this.senderMessageStatus = {},
              this.receiverMessageStatus = {},
              this.sendProgress = 0
          },
          _initWithMessageModel: function (e) {
              _.assign(this, e),
              this.baseMessage.groupNickTag = this.baseMessage.groupNick || 0,
              this.sendStatus = SEND_STATUS.SENDED,
              this.baseMessage.type === MsgType.ENCRYPTED && this.baseMessage.isDecrypt !== decryptType.YES && this.baseMessage.isDecrypt !== decryptType.NEVER && (this.baseMessage.isDecrypt = decryptType.NO)
          },
          decrypt: function () {
              return decryptMsg.decryptMsg(this.getMessageModel()).then(function (e) {
                  this.baseMessage.isDecrypt = decryptType.YES,
                  this.baseMessage.content = e.baseMessage.content,
                  this.emit(this.EventsName.DECRYPT_STATUS_CHANGE),
                  conversationEventCenter.emit(conversationEventCenter.EventsName.MSG_CONTENT_CHANGE, this.getMessageModel())
              }
              .bind(this)).catch(function (e) {
                  return this.baseMessage.isDecrypt !== decryptType.YES && (this.baseMessage.isDecrypt = decryptType.NO),
                  Promise.reject(e)
              }
              .bind(this))
          },
          send: function () {
              var e = this;
              if (this.sendStatus === SEND_STATUS.SENDED)
                  throw localLog.error("Can't send multi time, this msg have been sended, messageId: " + this.getId()),
                  new Error("Can't send multi time, this msg have been sended");
              this._setSendStatus(SEND_STATUS.SENDING);
              var s = function (s) {
                  return new Promise(function (t, a) {
                      IDLSend.send(s, function (s) {
                          200 === s.code ? (_.assign(e.senderMessageStatus, s.body.model),
                          e.baseMessage.messageId = s.body.messageId,
                          e.baseMessage.createdAt = s.body.createdAt,
                          this._setSendStatus(SEND_STATUS.SENDED),
                          this.sendProgress = 1,
                          this.emit(this.EventsName.SEND_PROGRESS, this.sendProgress),
                          t(s)) : (localLog.error("msg send error", JSON.stringify(s)),
                          this._setSendStatus(SEND_STATUS.SENDFAIL),
                          a(s))
                      }
                      .bind(this))
                  }
                  .bind(this))
              }
              .bind(this)
                , t = e._getSendMessageModel()
                , a = Config.get("msgEncryptor");
              return Promise.resolve(t).then(function (e) {
                  return e.type === MsgType.ENCRYPTED ? a ? a.encryptMsg(e).catch(function (s) {
                      return localLog.error("encrypt send msg error", s),
                      e.type = MsgType.NORMAL,
                      e
                  }
                  .bind(this)) : (e.type = MsgType.NORMAL,
                  e) : e
              }
              .bind(this)).then(function (e) {
                  return s(e)
              })
          },
          _setSendStatus: function (e) {
              e !== this.sendStatus && (this.sendStatus = e,
              this.emit(this.EventsName.SEND_STATUS_CHANGE, e))
          },
          resend: function () {
              return this.send()
          },
          _getSendMessageModel: function () {
              return {
                  uuid: this.baseMessage.uuid,
                  conversationId: this.baseMessage.conversationId,
                  type: this.baseMessage.type,
                  creatorType: this.baseMessage.creatorType,
                  content: this.baseMessage.content,
                  tag: this.baseMessage.tag,
                  extension: this.baseMessage.extension,
                  nickName: Config.get("nickName"),
                  xpnModel: this.baseMessage.xpnModel
              }
          },
          getMessageModel: function () {
              return {
                  _local: this._local,
                  baseMessage: this.baseMessage,
                  receiverMessageStatus: this.receiverMessageStatus,
                  senderMessageStatus: this.senderMessageStatus
              }
          },
          getId: function () {
              if (this.sendStatus === SEND_STATUS.SENDED) {
                  if (this.baseMessage.messageId)
                      return String(this.baseMessage.messageId);
                  throw localLog.error("msg#getId error, message is is not exist", JSON.stringify(this.baseMessage)),
                  new Error("message id 不存在")
              }
              return this.baseMessage.uuid ? String(this.baseMessage.uuid) : new Error("uuid 不存在")
          },
          getCreatedAt: function () {
              return this.baseMessage.createdAt
          },
          getMessageId: function () {
              if (this.baseMessage.messageId)
                  return this.baseMessage.messageId;
              throw new Error("messageId 不存在")
          },
          getLocalId: function () {
              if (this.baseMessage.uuid)
                  return String(this.baseMessage.uuid);
              if (this.baseMessage.messageId)
                  return String(this.baseMessage.messageId);
              throw new Error("messageId 和 uuid都不存在")
          },
          getOpenId: function () {
              return parseInt(this.baseMessage.openIdEx.openId)
          },
          getConvId: function () {
              return String(this.baseMessage.conversationId)
          },
          receiveMsgChange: function (e) {
              var s = [];
              Object.keys(e).forEach(function (t) {
                  if ("conversationId" !== t && "messageId" !== t) {
                      var a = e[t];
                      if ("senderMessageStatus" === t && _.get(a, "unReadCount") < _.get(this, "senderMessageStatus.unReadCount"))
                          _.assign(this.senderMessageStatus, e.senderMessageStatus),
                          s.push([t, a]);
                      else if ("receiverMessageStatus" !== t || _.isEqual(a, this.receiverMessageStatus))
                          if ("privateTag" === t && a !== this.baseMessage.memberTag)
                              this.baseMessage.memberTag = a,
                              s.push([t, a]);
                          else if ("privateExtension" !== t || _.isEqual(a, this.baseMessage.memberExtension))
                              if ("viewStatus" === t)
                                  this._isViewed = 2 === a;
                              else if ("deleted" === t) {
                                  var i = a ? 1 : 0;
                                  i !== this._local.isDel && (this._local.isDel = i,
                                  s.push([t, i]))
                              } else
                                    (_.isNumber(a) || _.isString(a)) && this.baseMessage[t] !== a ? (this.baseMessage[t] = a,
                                                                                                    s.push([t, a])) : _.isPlainObject(a) && !_.isEqual(a, this.baseMessage[t]) && (this.baseMessage[t] = a,
                                                                                                    s.push([t, a]));
                          else
                              this.baseMessage.memberExtension = a,
                              s.push([t, a]);
                      else
                          this.receiverMessageStatus = a,
                          s.push([t, a])
                  }
              }
              .bind(this)),
              s.forEach(function (e) {
                  this._emitMsgChangeEvent(e[0], e[1])
              }
              .bind(this))
          },
          _emitMsgChangeEvent: function (e, s) {
              var t;
              switch (e) {
                  case "senderMessageStatus":
                      t = this.EventsName.SENDER_MESSAGE_STATUS_CHANGE;
                      break;
                  case "recallStatus":
                      t = this.EventsName.RECALL_STATUS_CHANGE;
                      break;
                  case "extension":
                      t = this.EventsName.EXTENSION_CHANGE;
                      break;
                  case "privateTag":
                      t = this.EventsName.PRIVATE_TAG_CHANGE;
                      break;
                  case "privateExtension":
                      t = this.EventsName.PRIVATE_EXTENSION_CHANGE;
                      break;
                  case "receiverMessageStatus":
                      t = this.EventsName.RECEIVER_MESSAGE_STATUS_CHANGE;
                      break;
                  case "deleted":
                      t = this.EventsName.DELETED_CHANGE
              }
              t && this.emit(t, s)
          },
          getReceivers: function () {
              return IDLMessage.listMemberStatusByMessageId(null, this.getMessageId()).result.then(function (e) {
                  if (e.body && Array.isArray(e.body)) {
                      var s = e.body.filter(function (e) {
                          return 2 === e.status
                      });
                      this.receiveMsgChange({
                          senderMessageStatus: {
                              unReadCount: s,
                              totalCount: e.body.length
                          }
                      })
                  }
                  return e.body
              }
              .bind(this))
          },
          updateReadStatus: function (e) {
              _.get(e, "readStatus") > _.get(this, "receiverMessageStatus.readStatus") && (this.receiverMessageStatus = e)
          },
          updateToView: function () {
              return this._isViewed || this.isMeRead() || this.isMe() ? Promise.resolve() : (this._isViewed = !0,
              IDLMessageStatus.updateToView(this.getConvId(), this.getMessageId()))
          },
          updateToRead: function () {
              this.isMe() || this.isMeRead() || this.isSys() || this._updateToRead()
          },
          _updateToRead: function () {
              try {
                  var e = this.getMessageId()
              } catch (e) {
                  localLog.error("get messageId error, id: ", this.getId())
              }
              e && batchUpdateMsgRead.updateMsgToRead(e).then(function () {
                  this.receiveMsgChange({
                      receiverMessageStatus: {
                          readStatus: 2
                      }
                  })
              }
              .bind(this)).catch(function (e) {
                  localLog.error("wksdk", "update msg to read error", e, JSON.stringify(e._originMsg))
              })
          },
          isToMySelf: function () {
              var e = this.getConvId().split(":");
              return e[0] === e[1]
          },
          isMe: function () {
              return this.getOpenId() === My.get("openId")
          },
          isMeRead: function () {
              return !!this.isMe() || 2 === _.get(this, "receiverMessageStatus.readStatus")
          },
          isNoDcrypt: function () {
              return _.get(this, "baseMessage.isDecrypt") === decryptType.NO
          },
          isSys: function () {
              return _.get(this, "baseMessage.creatorType") === MsgCreatorType.SYSTEM
          },
          recallMessage: function () {
              return this.isSended() ? IDLMessage.recallMessage(this.getMessageId()).result.then(function (e) {
                  return this.receiveMsgChange({
                      recallStatus: 1
                  }),
                  e
              }
              .bind(this)) : Promise.reject(new Error("不能撤回未发送成功的消息"))
          },
          remove: function () {
              return this.isDel() ? Promise.reject(new Error("不能删除已经删除了的消息")) : IDLMessage.removes([this.getMessageId()]).result.then(function (e) {
                  conversationEventCenter.emit(conversationEventCenter.EventsName.REMOVE_MSG, {
                      cid: this.baseMessage.conversationId,
                      messageId: this.getMessageId()
                  })
              }
              .bind(this))
          },
          isSilence: function () {
              return _.get(this, "baseMessage.type") === MsgType.SILENCE || _.get(this, "baseMessage.tag") === baseMsgTag.SILENCE
          },
          isDel: function () {
              return 1 === this._local.isDel
          },
          isSended: function () {
              return this.sendStatus === SEND_STATUS.SENDED
          },
          needDecrypt: function () {
              return _.get(this, "baseMessage.type") === MsgType.ENCRYPTED && _.get(this, "baseMessage.isDecrypt") === decryptType.NO
          }
      });
    module.exports = BaseMsg;
}
    , {
        "../class/class": 873,
        "../config/config": 877,
        "../conversation/conversationEventCenter": 881,
        "../idl/idl": 914,
        "../my/my": 947,
        "../safety/decryptMsg": 948,
        "../safety/decryptType": 949,
        "./baseMsgTag": 931,
        "./batchUpdateMsgRead": 932,
        "./msgCreatorType": 937,
        "./msgSendStatus": 939,
        "./msgType": 940,
        "./senderExtFactory": 944,
        "./updateToRead": 945,
        "lodash": 1057,
        "wolfy87-eventemitter": 1083
    }]