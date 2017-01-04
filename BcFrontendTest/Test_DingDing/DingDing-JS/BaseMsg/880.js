[function (require, module, exports) {
    "use strict";
    var conversationEventCenter = require("./conversationEventCenter")
      , conversationStatus = require("./conversationStatus")
      , typingStatus = require("./typingStatus")
      , typingCommand = require("./typingCommand")
      , errorCode = require("../error/errorCode")
      , syncSinglePackageActionMerge = require("../sync/syncSinglePackageActionMerge")
      , syncDBTransaction = require("../sync/syncDBTransaction")
      , batchGetConvIcon = require("./batchGetConvIcon")
      , msgType = require("../message/msgType")
      , BaseMsg = require("../message/BaseMsg")
      , TextMsg = require("../message/TextMsg")
      , ImgMsg = require("../message/ImgMsg")
      , CustomMsg = require("../message/CustomMsg")
      , GapMsg = require("../message/GapMsg")
      , SystemMsg = require("../message/SystemMsg")
      , decryptType = require("../safety/decryptType")
      , sendMsgBuilder = require("../message/sendMsgBuilder")
      , msgContentType = require("../message/msgContentType")
      , msgCreatorType = require("../message/msgCreatorType")
      , msgReadStatus = require("../message/messageReadStatus")
      , msgViewStatus = require("../message/msgViewStatus")
      , forwardMsgBuilder = require("../message/forwardMsgBuilder")
      , SEND_STATUS = require("../message/msgSendStatus")
      , groupAuthority = require("./groupAuthority")
      , showHistoryType = require("./showHistoryType")
      , msgInstanceHelper = require("../message/receiveMsgInstanceHelper")
      , messageDbEntryService = require("../dbEntry/messageDbEntryService")
      , groupNickService = require("../user/groupNickService")
      , getConversationFromServer = require("./getConversationFromServer")
      , IDL = require("../idl/idl")
      , IDLConversation = IDL.interface.IDLConversation
      , IDLMessage = IDL.interface.IDLMessage
      , Typing = IDL.interface.Typing
      , GroupRole = require("./groupRole")
      , ConversationType = require("./conversationType")
      , BanWordsType = require("./banWordsType")
      , InBanBlackStatus = require("./inBanBlackStatus")
      , InBanWhiteStatus = require("./inBanWhiteStatus")
      , decryptMsg = require("../safety/decryptMsg")
      , Config = require("../config/config")
      , EventEmitter = require("wolfy87-eventemitter")
      , Class = require("../class/class")
      , My = require("../my/my")
      , INIT_SIZE = 15
      , DEFAULT_MEMBER_LIMIT = 1e3
      , MEMBER_MAX_NUMBER = 2147483647
      , SEARCH_PRE_CONTEXT_LIMIT = 3
      , SEARCH_CONTEXT_LIMIT = 10
      , OVER_NORMAL_MEMBER_LIMIT = 1500
      , MEMBERS_CACHE_MAX_TIME = 18e5
      , _ = require("lodash")
      , Conv = Class.create({
          initialize: function (e, t) {
              if (this.baseConversation = _.assign({
                  memberCount: 0,
                  title: "",
                  icon: "",
                  createAt: 0,
                  memberExtension: 0,
                  notificationOff: 0,
                  tag: 0,
                  sort: 0,
                  status: 1,
                  authority: 0,
                  ownerId: 0,
                  groupValidationInfo: {
                  type: 1
              },
                  iconOption: {},
                  showHistoryType: showHistoryType.OFF,
                  memberLimit: 0,
                  superGroup: 0,
                  unreadPoint: 0,
                  banWordsType: BanWordsType.OFF,
                  inBanWhite: InBanBlackStatus.OFF,
                  inBanBlack: InBanWhiteStatus.OFF,
                  banWordsTime: 0
              }, e.baseConversation),
              this._local = e._local || {},
              this.cid = e.baseConversation.conversationId,
              this.isSingleChat = !1,
              this.isToMySelf = !1,
              this.members = null,
              this.isPin = this.baseConversation.sort > 0,
              this.isActive = !1,
              this.isUIVisible = !0,
              this.baseConversation.type === ConversationType.SINGLE) {
                  this.isSingleChat = !0;
                  var s = this.baseConversation.conversationId.split(":");
                  this.isToMySelf = s[0] === s[1]
              } else
                  this.isSingleChat = !1;
              if (this.myTypingStatus = typingStatus.IDLE,
              this.peerTypingStatus = typingStatus.IDLE,
              this.latestPeerMsgCreatedTime = 0,
              this._sendTypingTimer = null,
              this._cancelPeerTypingTimer = null,
              this._latestTextChangeTime = 0,
              this._isPullingHistory = !1,
              this.conversationDbEntry = t,
              this._msgCache = {
                  createdIndex: {},
                  msgIdIndex: {}
              },
              this.conversationDbEntry) {
                  var i = messageDbEntryService.getMessageEntry();
                  this.messageDbEntry = new i(this.cid)
              }
              if (this.messages = [],
              this._msgIds = [],
              this._lastMsg = null,
              this.localLog = Config.get("log"),
              this._handleLastMsgChangeBindThis = this._handleLastMsgChange.bind(this),
              e.lastMessages = e.lastMessages || [],
              e.lastMessages.length > 0) {
                  var n = e.lastMessages.map(function (e) {
                      return this._getMsgInstance(e)
                  }
                  .bind(this));
                  this._batchInsertToMsgList(n)
              }
              _.get(e, "_local.clientExtension.complete") === !1 && this._completeConv(),
              this._getMembersTime = 0
          },
          Implements: EventEmitter,
          EventsName: {
              MESSAGES_UPDATE: "messages_update",
              SHOW_HISTORY_TYPE_UPDATE: "showHistoryTypeUpdate",
              RECEIVE_NEW_MESSAGE: "receive_new_message",
              NOTIFICATION_STATUS_UPDATE: "notification_status_update",
              AUTHORITY_UPDATE: "authority_update",
              EXTENSION_UPDATE: "extension_update",
              MEMBER_COUNT_UPDATE: "member_count_update",
              MEMBER_LIMIT_UPDATE: "member_limit_update",
              OWNER_ID_UPDATE: "owner_id_update",
              STATUS_UPDATE: "status_update",
              SUPER_GROUP_UPDATE: "super_group_update",
              TAG_UPDATE: "tag_update",
              TITLE_UPDATE: "title_update",
              GROUP_VALIDATION_UPDATE: "group_validation_update",
              ICON_UPDATE: "icon_update",
              SORT_UPDATE: "sort_update",
              NO_MORE_MSG: "no_more_msg",
              UNREAD_POINT_UPDATE: "unread_point_update",
              MEMBERS_UPDATE: "members_update",
              REMIND_TYPE_UPDATE: "remind_type_update",
              SAVE_DRAFT: "save_draft",
              DESTROY: "destroy",
              BAN_WORDS_STATUS_UPDATE: "ban_words_update",
              PEER_TYPING_STATUS_UPDATE: "peer_typing_status_update"
          },
          active: function (e) {
              return this.isActive === !0 ? Promise.resolve() : (this.isActive = !0,
              this.clearUnReadPoint(),
              this.localLog.info("active conv", this.cid),
              this._setSize(e || INIT_SIZE))
          },
          deactive: function () {
              if (this.isActive === !1)
                  return Promise.resolve();
              this.isActive = !1,
              this.isUIVisible = !0;
              this._safeClearMsgList(),
              this._safeClearGap();
              this._cancelTyping(),
              this.localLog.info("deactive conv", this.cid)
          },
          setUIVisibleStatus: function (e) {
              return this.isUIVisible = e,
              e === !0 && this.clearUnReadPoint(),
              !0
          },
          search: function (e) {
              return this._safeClearMsgList(),
              this.localLog.info("search by messageId", e),
              this._searchByMessageId(e).catch(function (e) {
                  this.localLog.error("search by message id error", e)
              }
              .bind(this))
          },
          clearSearchResult: function () {
              var e = this._safeClearGap();
              if (e === !0)
                  return this.messages.length >= INIT_SIZE ? Promise.resolve() : this._setSize(INIT_SIZE)
          },
          _batchInsertToMsgList: function (e) {
              return e.forEach(function (e) {
                  return this._insertToMsgList(e)
              }
              .bind(this)),
              !0
          },
          _searchByMessageId: function (e) {
              return this.messageDbEntry ? Promise.resolve().then(function () {
                  return this.messageDbEntry.getMessageById(e)
              }
              .bind(this)).then(function (e) {
                  var t = _.get(e, "baseMessage.createdAt");
                  if (t) {
                      var s = this.messageDbEntry.listMessages(!1, t, SEARCH_PRE_CONTEXT_LIMIT)
                        , i = this.messageDbEntry.listMessages(!0, t, SEARCH_CONTEXT_LIMIT);
                      return Promise.all([s, i]).then(function (e) {
                          var t = e[0]
                            , s = e[1];
                          return _.uniqBy(t.concat(s), function (e) {
                              return e.baseMessage.messageId
                          }).sort(function (e, t) {
                              return _.get(e, "baseMessage.createdAt") - _.get(t, "baseMessage.createdAt")
                          })
                      })
                  }
                  return Promise.reject(new Error("cannot get createdAt from search message"))
              }
              .bind(this)).then(function (e) {
                  var t = e.map(function (e) {
                      return this._getMsgInstance(e)
                  }
                  .bind(this));
                  return this._insertSearchResult(t)
              }
              .bind(this)) : Promise.reject(new Error("message db entry not exist, can't search"))
          },
          _insertSearchResult: function (e) {
              if (!e || 0 === e.length)
                  return !1;
              var t = e[e.length - 1]
                , s = t.getCreatedAt()
                , i = new GapMsg(this.cid, s + 1);
              return 0 === this.messages.length ? e.push(i) : s < this.messages[0].getCreatedAt() && e.push(i),
              this._batchInsertToMsgList(e)
          },
          _insertToMsgList: function (e) {
              try {
                  var t = e.getId()
              } catch (e) {
                  return this.localLog.error("insert to msg list error, msg id not exist", e),
                  !1
              }
              if (this._msgIds.indexOf(t) !== -1)
                  return !1;
              for (var s = e.getCreatedAt(), i = this.messages.length; i > 0 && !(s > this.messages[i - 1].getCreatedAt()) ;)
                  i--;
              return this.messages.splice(i, 0, e),
              this._msgIds.splice(i, 0, t),
              this.isActive === !1 && this._safeClearMsgList(INIT_SIZE),
              syncSinglePackageActionMerge.registerAction("updateConvLastMessages_" + this.cid, function () {
                  this._detectLastMsgChange()
              }
              .bind(this)),
              this._emitMsgUpdateEvent(),
              !0
          },
          _safeClearMsgList: function (e) {
              for (var e = e || 20, t = 0; this.messages.length - t >= e && this.messages[t].sendStatus === SEND_STATUS.SENDED;)
                  t++;
              return t > 0 && (this.messages.splice(0, t - 1),
              this._msgIds.splice(0, t - 1),
              this._emitMsgUpdateEvent(),
              !0)
          },
          _safeClearGap: function () {
              var e = -1;
              if (this.messages.some(function (t, s) {
                  return t instanceof GapMsg && (e = s,
                  !0)
              }),
              e > -1) {
                  var t = e + 1;
                  return this.messages.splice(0, t),
                  this._msgIds.splice(0, t),
                  this._emitMsgUpdateEvent(),
                  !0
              }
              return !1
          },
          _deleteMsgFromMsgList: function (e) {
              var t = this._msgIds.indexOf(e);
              t > -1 && (this._msgIds.splice(t, 1),
              this.messages.splice(t, 1),
              this._emitMsgUpdateEvent())
          },
          _cleanSendingMsg: function (e) {
              var t = e.getId()
                , s = e.getLocalId()
                , i = this._msgIds.indexOf(t);
              i > -1 && (this.messages.splice(i, 1),
              this._msgIds.splice(i, 1));
              var n = this._msgIds.indexOf(s);
              return n > -1 && this._msgIds.splice(n, 1, t),
              !0
          },
          _forceClearMsgs: function () {
              this.messages = [],
              this._msgIds = [],
              this._emitMsgUpdateEvent()
          },
          _detectLastMsgChange: function () {
              for (var e = null, t = this.messages.length - 1; t >= 0;) {
                  var s = this.messages[t];
                  if (s.sendStatus === SEND_STATUS.SENDED && !s.isDel()) {
                      e = s;
                      break
                  }
                  t--
              }
              return !e || e === this._lastMsg || (this._lastMsg = e,
              void this._handleLastMsgChangeBindThis())
          },
          _handleLastMsgChange: function () {
              if (this._lastMsg) {
                  var e = this._lastMsg.getMessageModel();
                  this._lastMsg.isSilence() || (this._local.lastModify = _.get(e, "baseMessage.createdAt")),
                  this.conversationDbEntry && (this.localLog.info("update last messages for conversation : ", this.cid, this._lastMsg.getId()),
                  syncDBTransaction.registerAction("1_updateLastMsg_" + this.cid, function (t) {
                      return this.conversationDbEntry.updateLastMessages(this.cid, [e], this._local.lastModify, t)
                  }
                  .bind(this)))
              }
          },
          _emitMsgUpdateEvent: function () {
              syncSinglePackageActionMerge.registerAction("convMessagesUpdateEvent" + this.cid, function () {
                  this.emit(this.EventsName.MESSAGES_UPDATE, this.messages)
              }
              .bind(this))
          },
          pullSafetyInfo: function () {
              return IDLConversation.getByIdUnlimited(this.cid).result.then(function (e) {
                  if (e.body && e.body.baseConversation) {
                      var t = e.body.baseConversation
                        , s = {
                            tag: t.tag,
                            extension: t.extension
                        };
                      return this.receiveConvChange(s),
                      Promise.resolve(s)
                  }
                  return this.localLog.error("pull safety conv info resp body empty", this.cid),
                  Promise.reject("pull safety conv info resp body empty")
              }
              .bind(this))
          },
          pullHistory: function () {
              if (this._isPullingHistory === !0) {
                  var e = new Error("pull history is locked");
                  return e.code = errorCode.CONVERSATION.PULL_HISTORY_IS_LOCKED,
                  this.localLog.info("pull history locked", this.cid),
                  Promise.reject(e)
              }
              var t = this.messages.length + INIT_SIZE;
              return this._isPullingHistory = !0,
              this._setSize(t).then(function (e) {
                  return this._isPullingHistory = !1,
                  this.localLog.info("pull history success"),
                  e
              }
              .bind(this)).catch(function (e) {
                  return this._isPullingHistory = !1,
                  this.localLog.error("pull history fail", e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          isVisible: function () {
              return this.baseConversation.status === conversationStatus.VISIBLE
          },
          isDiscard: function () {
              return this.baseConversation.status === conversationStatus.DISBANDED || this.baseConversation.status === conversationStatus.KICKED || this.baseConversation.status === conversationStatus.QUIT
          },
          _getMsgInstance: function (e) {
              var t = msgInstanceHelper.instance(e);
              return t
          },
          _setSize: function (e) {
              return Promise.resolve().then(function () {
                  var t = this.messages.length;
                  if (e <= t) {
                      this.localLog.info("set size, old size is greater than new size", t, e);
                      var s = this._safeClearMsgList(e);
                      return s
                  }
                  var i = (new Date).getTime();
                  return this.messages.length > 0 && (i = _.get(this.messages[0], "baseMessage.createdAt")),
                  this._pullData(i, e - t).then(function (e) {
                      var t = !1;
                      return e.forEach(function (e) {
                          var s = _.get(e, "baseMessage.messageId") + "";
                          if (this._msgIds.indexOf(s) === -1) {
                              var i = this._getMsgInstance(e);
                              this._insertToMsgList(i),
                              t = !0
                          }
                      }
                      .bind(this)),
                      t
                  }
                  .bind(this))
              }
              .bind(this)).catch(function (e) {
                  return e.code === errorCode.CONVERSATION.NO_MORE_MSGS && this.emit(this.EventsName.NO_MORE_MSG),
                  this.localLog.error("set size error", e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          _pullData: function (e, t) {
              return this.localLog.info("pull data", e, t),
              this._pullMsgsFromCache(e, t).then(function (e) {
                  return e
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("pull msgs from cache error", this.cid, e),
                  []
              }
              .bind(this)).then(function (s) {
                  return s.length >= t ? s : (s.length > 0 && (e = s[s.length - 1].baseMessage.createdAt),
                  this.localLog.info("list messages from server", this.cid, e, t),
                  IDLMessage.listMessages(this.cid, !1, e, t).result.then(function (e) {
                      return e.body && e.body.length > 0 ? this._cacheMsgs(e.body).then(function (e) {
                          return this.localLog.info("pull from server result", this.cid, JSON.stringify(e.map(function (e) {
                              return e.baseMessage.messageId
                          }))),
                          e.sort(function (e, t) {
                              return _.get(t, "baseMessage.createdAt") - _.get(e, "baseMessage.createdAt")
                          })
                      }
                      .bind(this)) : []
                  }
                  .bind(this)).then(function (e) {
                      return s.concat(e)
                  }).catch(function (e) {
                      return this.localLog.error("pull data error", this.cid, e),
                      Promise.reject(e)
                  }
                  .bind(this)))
              }
              .bind(this))
          },
          receiveMsg: function (e) {
              var t = String(_.get(e, "baseMessage.messageId"));
              return e.senderMessageStatus || parseInt(_.get(e, "baseMessage.openIdEx.openId")) !== My.get("openId") || (e.senderMessageStatus = {
                  totalCount: this.baseConversation.memberCount,
                  unReadCount: this.baseConversation.memberCount - 1
              }),
              e.receiverMessageStatus || (e.receiverMessageStatus = {
                  readStatus: 1
              }),
              this._cacheMsgs([e]).then(function (e) {
                  var s = Promise.resolve()
                    , i = e[0];
                  if (this.localLog.info("conv module receive msg ", this.cid, t),
                  this._msgIds.indexOf(t) === -1) {
                      var n = this._getMsgInstance(i)
                        , r = this._insertToMsgList(n);
                      (n.isMe() || n.isMeRead()) && this.clearUnReadPoint(),
                      r === !0 && (n.isMe() || n.isMeRead() || n.isSys() || this.isActive && this.isUIVisible || this.isDiscard() || n.isSilence() || this.addUnReadPoint(),
                      n.isMe() || (this.latestPeerMsgCreatedTime = n.baseMessage.createdAt),
                      this.emit(this.EventsName.RECEIVE_NEW_MESSAGE, {
                          message: n
                      }),
                      this.isDiscard() || n.isSilence() || this._makeThisConvToTop(),
                      this.baseConversation.status === conversationStatus.QUIT && (s = getConversationFromServer.getById(this.cid).then(function (e) {
                          return e.body && e.body.baseConversation && (this.receiveConvChange({
                              status: e.body.baseConversation.status
                          }),
                          this.isDiscard() || n.isSilence() || this._makeThisConvToTop()),
                          !0
                      }
                      .bind(this)).catch(function (e) {
                          return this.localLog.error("get conv from server", this.cid, e),
                          !0
                      }
                      .bind(this))))
                  }
                  return s
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("receive message error", this.cid, e),
                  !0
              }
              .bind(this))
          },
          _makeThisConvToTop: function () {
              conversationEventCenter.emit(conversationEventCenter.EventsName.MAKE_CONV_TO_TOP, {
                  cid: this.cid,
                  isPin: this.isPin
              })
          },
          cleanMsgFromCreatedAt: function (e) {
              this.messageDbEntry && syncSinglePackageActionMerge.registerAction("convDropMsg_" + this.cid, function () {
                  this.messageDbEntry.removeFromCreatedAt(e).then(function () {
                      var t = _.findIndex(this.messages, function (t) {
                          return t.baseMessage.createdAt === e
                      });
                      this._msgIds = this._msgIds.splice(t),
                      this.messages = this.messages.splice(t),
                      this._emitMsgUpdateEvent()
                  }
                  .bind(this)).catch(function (e) {
                      this.localLog.error("drop msg from created at error", e)
                  }
                  .bind(this))
              }
              .bind(this))
          },
          addUnReadPoint: function () {
              this._updateUnreadPoint(this.baseConversation.unreadPoint + 1)
          },
          clearUnReadPoint: function (e) {
              var t = this.baseConversation.unreadPoint;
              0 !== t && (this._updateUnreadPoint(0),
              e && this.messages.length > 0 && this.messages[this.messages.length - 1].updateToView())
          },
          _updateUnreadPoint: function (e) {
              this.localLog.info("update unread point to ", e, this.cid),
              this.baseConversation.unreadPoint = e,
              this.emit(this.EventsName.UNREAD_POINT_UPDATE, {
                  unreadPoint: this.baseConversation.unreadPoint
              }),
              syncSinglePackageActionMerge.registerAction("convUpdateUnreadPoint" + this.cid, function () {
                  syncDBTransaction.registerAction("1_convUpdateUnreadPoint" + this.cid, function (e) {
                      return this.conversationDbEntry && this.conversationDbEntry.updateUnreadCount(this.cid, this.baseConversation.unreadPoint, e)
                  }
                  .bind(this))
              }
              .bind(this))
          },
          deleteMsgById: function (e) {
              return this._deleteMsgFromMsgList(String(e)),
              !0
          },
          receiveMsgChange: function (e) {
              var t = e.messageId;
              (e.receiverMessageStatus && e.receiverMessageStatus.readStatus === msgReadStatus.READ || e.viewStatus === msgViewStatus.VIEWED) && this.clearUnReadPoint(),
              this.messages.some(function (s, i) {
                  try {
                      if (s.getMessageId() === t)
                          return s.receiveMsgChange(e),
                          !0
                  } catch (e) { }
              }
              .bind(this));
              var s = {
                  baseMessage: {},
                  _local: {}
              };
              if (Object.keys(e).forEach(function (t) {
                  if ("conversationId" !== t && "messageId" !== t) {
                      var i = e[t];
                      if ("senderMessageStatus" === t)
                          s.senderMessageStatus = i;
              else if ("receiverMessageStatus" === t)
                          s.receiverMessageStatus = i;
              else if ("privateTag" === t)
                          s.baseMessage.memberTag = i;
              else if ("privateExtension" === t)
                          s.baseMessage.memberExtension = i;
              else if ("deleted" === t) {
                          var n = i === !0 ? 1 : 0;
                          s._local.isDel = n,
                          this._detectLastMsgChange()
              } else
                          s.baseMessage[t] = i
              }
              }
              .bind(this)),
              this.messageDbEntry)
                  syncDBTransaction.registerAction("2_updateMsg_" + t + "_" + JSON.stringify(Object.keys(e)), function (e) {
                      return this.messageDbEntry.updateMsg(t, s, e).then(function (e) { }).catch(function (e) {
                          this.localLog.error("update msg status error", e)
                      }
                      .bind(this))
                  }
                  .bind(this));
              else {
                  var i = this._msgCache.msgIdIndex[t];
                  i && (this._msgCache.msgIdIndex[t] = _.defaultsDeep(i, s))
              }
              return this._lastMsg && this._lastMsg.getMessageId() === t && this._handleLastMsgChange(),
              this.localLog.info("receive message change", JSON.stringify(e)),
              !0
          },
          receiveTyping: function (e) {
              return Promise.resolve().then(function () {
                  return e.command === typingCommand.CANCEL ? this._cancelPeerTyping() : e.command === typingCommand.TYPING && this._showPeerTyping(),
                  !0
              }
              .bind(this))
          },
          _showPeerTyping: function () {
              this.peerTypingStatus === typingStatus.IDLE && (this.peerTypingStatus = typingStatus.TYPING,
              this.emit(this.EventsName.PEER_TYPING_STATUS_UPDATE, typingStatus.TYPING)),
              clearTimeout(this._cancelPeerTypingTimer),
              this._cancelPeerTypingTimer = setTimeout(function () {
                  this._cancelPeerTyping()
              }
              .bind(this), 5e3)
          },
          _cancelPeerTyping: function () {
              this.peerTypingStatus === typingStatus.TYPING && (this.peerTypingStatus = typingStatus.IDLE,
              this.emit(this.EventsName.PEER_TYPING_STATUS_UPDATE, typingStatus.IDLE))
          },
          inputTextHasChanged: function (e) {
              if (this.isSingleChat) {
                  var e = e || "";
                  e = e.trim();
                  var t = (new Date).getTime();
                  this._latestTextChangeTime = t,
                  0 === e.length && this.myTypingStatus === typingStatus.TYPING ? this._cancelTyping() : e.length > 0 && t - this.latestPeerMsgCreatedTime < 1e4 && this.myTypingStatus === typingStatus.IDLE && this._startSendTyping()
              }
          },
          _startSendTyping: function () {
              this.myTypingStatus === typingStatus.IDLE && (this.myTypingStatus = typingStatus.TYPING,
              this._sendTypingCommand(typingCommand.TYPING),
              clearInterval(this._sendTypingTimer),
              this._sendTypingTimer = setInterval(function () {
                  var e = (new Date).getTime();
                  e - this._latestTextChangeTime < 5e3 ? this._sendTypingCommand(typingCommand.TYPING) : (clearInterval(this._sendTypingTimer),
                  this.myTypingStatus = typingStatus.IDLE)
              }
              .bind(this), 4500))
          },
          _cancelTyping: function () {
              this.myTypingStatus === typingStatus.TYPING && (this.myTypingStatus = typingStatus.IDLE,
              this._sendTypingCommand(typingCommand.CANCEL),
              clearTimeout(this._sendTypingTimer))
          },
          _sendTypingCommand: function (e) {
              return Typing.send({
                  conversationId: this.cid,
                  type: msgContentType.TEXT,
                  command: e
              }).result
          },
          getMembers: function () {
              return this.members && Date.now() - this._getMembersTime < MEMBERS_CACHE_MAX_TIME ? Promise.resolve(this.members) : this.isSingleChat ? (this.members = this.cid.split(":").map(function (e) {
                  return {
                      openIdEx: {
                          openId: parseInt(e),
                          tag: -1
                      },
                      role: GroupRole.MEMBER
                  }
              }),
              this.isToMySelf && (this.members = this.members.slice(0, 1)),
              Promise.resolve(this.members)) : IDLConversation.listMembers(this.cid, 0, MEMBER_MAX_NUMBER).result.then(function (e) {
                  this.members = e.body,
                  this.localLog.info("list members success", this.cid, "length: " + this.members.length),
                  this._getMembersTime = Date.now(),
                  this.members.length < MEMBER_MAX_NUMBER && this.members.length != this.baseConversation.memberCount && this.receiveConvChange({
                      memberCount: this.members.length
                  });
                  var t = [];
                  return this.members.forEach(function (e) {
                      if (0 !== e.groupNickModel.tag) {
                          var s = {
                              conversationId: this.cid,
                              openId: e.openIdEx.openId,
                              groupNickModel: e.groupNickModel
                          };
                          t.push(groupNickService.receiveChange(s).catch(function (e) {
                              return this.localLog.error("groupNick receiveChange error", e),
                              Promise.resolve()
                          }
                          .bind(this)))
                      }
                  }
                  .bind(this)),
                  Promise.all(t).then(function () {
                      return this.members
                  }
                  .bind(this))
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("list members error", e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          removeMembers: function (e, t, s) {
              var i = sendMsgBuilder.buildMsg(this.cid, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: s
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM,
                  receivers: t
              });
              return IDLConversation.removeMembers(this.cid, e, !0, i).result
          },
          addMembers: function (e, t) {
              var s = this
                , e = e || [];
              if (this.isSingleChat)
                  return Promise.reject(new Error("single chat can't addMembers"));
              if (e = e.map(function (e) {
                  return parseInt(e)
              }),
              0 === e.length)
                  return Promise.reject(new Error("uids 为空"));
              var i = sendMsgBuilder.buildMsg(this.cid, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: t
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM
              });
              return IDLConversation.addMembers(s.cid, e, i).result
          },
          updateTitle: function (e, t) {
              var s = sendMsgBuilder.buildMsg(this.cid, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: t || "修改群名为" + e
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM
              })
                , i = this.baseConversation.title;
              return this.receiveConvChange({
                  title: e
              }),
              IDLConversation.updateTitle(this.cid, e, s).result.catch(function (e) {
                  return this.localLog.error("wksdk conv update title fail", e, JSON.stringify(e._originMsg)),
                  this.receiveConvChange({
                      title: i
                  }),
                  Promise.reject(e)
              }
              .bind(this))
          },
          quitSilent: function (e, t) {
              var s = sendMsgBuilder.buildMsg(this.cid, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: t
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM
              });
              return IDLConversation.quitSilent(this.cid, e, s).result.then(function (e) {
                  return this.receiveConvChange({
                      isQuit: !0
                  }),
                  e
              }
              .bind(this))
          },
          updateOwner: function (e, t) {
              var s = sendMsgBuilder.buildMsg(this.cid, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: t
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM
              });
              return IDLConversation.updateOwner(this.cid, e, s).result.then(function (t) {
                  return this.receiveConvChange({
                      ownerId: e
                  }),
                  t
              }
              .bind(this))
          },
          disband: function () {
              return IDLConversation.disband(this.cid).result.then(function (e) {
                  return this.receiveConvChange({
                      isDisband: !0
                  }),
                  conversationEventCenter.emit(conversationEventCenter.EventsName.HIDE_CONV, {
                      cid: this.cid,
                      isPin: this.isPin
                  }),
                  e
              }
              .bind(this))
          },
          updateNotificationOffStatus: function (e) {
              var e = !!e
                , t = e ? 1 : 0;
              return IDLConversation.updateNotificationOff(this.cid, t).result.then(function (e) {
                  return this.receivePersonalChange({
                      notificationOff: t
                  }),
                  e
              }
              .bind(this))
          },
          updateShowHistoryType: function (e) {
              var t = {
                  conversationId: this.cid,
                  showHistoryType: e
              };
              return IDLConversation.updateShowHistoryType(t).result.then(function (t) {
                  return this.receiveConvChange({
                      showHistoryType: e
                  }),
                  !0
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("update group show history type error", e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          updateGroupValidationType: function (e) {
              var t = {
                  type: e
              };
              return IDLConversation.updateGroupValidationInfo(this.cid, t).result.then(function (s) {
                  this.localLog.info("update group validation", this.cid, e),
                  this.receiveConvChange({
                      groupValidationInfo: t
                  })
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("update group validation error", e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          acceptForwardMsg: function (e) {
              if (1 === e.baseMessage.recallStatus)
                  return Promise.reject(new Error("该消息已被撤回，不能被转发"));
              var t = e.baseMessage.content.contentType;
              switch (t) {
                  case msgContentType.TEXT:
                      return this.sendTextMsg(this._removeTextContentOpenId(e.baseMessage.content));
                  case msgContentType.IMG:
                      var s = e.baseMessage.content
                        , i = sendMsgBuilder.buildMsg(this.cid, s, {
                            minimumCreatedAt: this._getLastMessageCreatedAt()
                        })
                        , e = new ImgMsg(null, i);
                      return this.sendMsg(e);
                  default:
                      var s = e.baseMessage.content
                        , i = sendMsgBuilder.buildMsg(this.cid, s, {
                            minimumCreatedAt: this._getLastMessageCreatedAt()
                        })
                        , e = new BaseMsg(null, i);
                      return this.sendMsg(e)
              }
          },
          _removeTextContentOpenId: function (e) {
              var t = _.get(e, "textContent.text")
                , s = e.atOpenIds
                , i = /@(\d+)(?=\s)/g
                , n = t.replace(i, function (e, t) {
                    return "@" + (s[t] || t)
                });
              return n
          },
          updateAuthority: function (e) {
              var t = this.baseConversation.authority
                , s = e ? groupAuthority.ONLY_OWNER : groupAuthority.ALL;
              return this.receiveConvChange({
                  authority: s
              }),
              IDLConversation.updateAuthority(this.cid, s).result.then(function () { }
              .bind(this)).catch(function (e) {
                  return this.receiveConvChange({
                      authority: t
                  }),
                  this.localLog.error("update authority fail", e, JSON.stringify(e._originMsg)),
                  Promise.reject(e)
              }
              .bind(this))
          },
          _getLastMessageCreatedAt: function () {
              if (this.messages.length > 0) {
                  var e = this.messages[this.messages.length - 1];
                  return e.getCreatedAt()
              }
              return (new Date).getTime()
          },
          updateMsgToDb: function (e) {
              var t = _.get(e, "baseMessage.messageId");
              this.messageDbEntry && t && this.messageDbEntry.updateMsg(t, e),
              this._lastMsg && this._lastMsg.getMessageId() === t && this._handleLastMsgChange()
          },
          sendCustomMsg: function (e, t, s, i) {
              var n = CustomMsg.createWithCustomSendFunction(this.cid, e, t, s, i, this._getLastMessageCreatedAt());
              return this.sendMsg(n)
          },
          sendTextMsg: function (e, t, s) {
              var s = s || {};
              s.minimumCreatedAt = this._getLastMessageCreatedAt();
              var i = TextMsg.createWithText(this.cid, e, t, s);
              return this.sendMsg(i)
          },
          sendImgMsg: function (e) {
              var t = ImgMsg.createWithImgFile(this.cid, e, this._getLastMessageCreatedAt());
              return this.sendMsg(t)
          },
          sendImgMsgWithMediaId: function (e) {
              var t = ImgMsg.createWithMediaIdOption(this.cid, e, this._getLastMessageCreatedAt());
              return this.sendMsg(t)
          },
          sendMsg: function (e) {
              var t = e.getId();
              this._insertToMsgList(e),
              this._cancelTyping(),
              this._makeThisConvToTop();
              var s = function (t) {
                  if (t === SEND_STATUS.SENDED) {
                      var i = e.getMessageModel();
                      this._cacheMsgs([i]).then(function () {
                          this.localLog.info("msg send success, clean sending msg", this.cid, e.getId()),
                          this._cleanSendingMsg(e),
                          this._detectLastMsgChange()
                      }
                      .bind(this)).catch(function (e) {
                          this.localLog.error("cache msg error after send success", e)
                      }
                      .bind(this)),
                      e.removeListener(e.EventsName.SEND_STATUS_CHANGE, s)
                  }
              }
              .bind(this);
              return e.addListener(e.EventsName.SEND_STATUS_CHANGE, s),
              this.emit(this.EventsName.RECEIVE_NEW_MESSAGE, {
                  message: e
              }),
              e.send().then(function (e) {
                  return e
              }
              .bind(this)).catch(function (e) {
                  return this.localLog.error("send msg error", this.cid, t, e),
                  Promise.reject(e)
              }
              .bind(this))
          },
          setPin: function (e) {
              return IDLConversation.setTop(this.cid, e).result.then(function (e) {
                  var t = e.body;
                  return this.receivePersonalChange({
                      sort: t
                  })
              }
              .bind(this))
          },
          hide: function () {
              return this.receivePersonalChange({
                  status: 0
              }),
              IDLConversation.updateStatus([this.cid], conversationStatus.HIDE).result.then(function () {
                  this.localLog.info("hide conversation success", this.cid)
              }
              .bind(this)).catch(function () {
                  this.localLog.error("hide conversation fail", this.cid)
              }
              .bind(this))
          },
          show: function () {
              return this.baseConversation.status === conversationStatus.HIDE ? (this.receivePersonalChange({
                  status: 1
              }),
              IDLConversation.updateStatus([this.cid], conversationStatus.VISIBLE).result.then(function () {
                  this.localLog.info("make conversation visible success", this.cid)
              }
              .bind(this)).catch(function () {
                  this.localLog.error("make conversation visible fail", this.cid)
              }
              .bind(this))) : Promise.resolve(!0)
          },
          getMemberLimitState: function () {
              var e = this.baseConversation.memberLimit;
              return this.baseConversation.memberLimit || (e = this.baseConversation.memberCount <= DEFAULT_MEMBER_LIMIT ? DEFAULT_MEMBER_LIMIT : OVER_NORMAL_MEMBER_LIMIT),
              {
                  memberLimit: e,
                  memberCount: this.baseConversation.memberCount
              }
          },
          clearMsg: function () {
              return IDLConversation.clear(this.cid).result.then(function (e) {
                  return this.handleClearMsg()
              }
              .bind(this))
          },
          setRemindType: function (e) {
              this.receiveConvChange({
                  remindType: e
              })
          },
          saveDraft: function (e) {
              this.receiveConvChange({
                  draft: e
              })
          },
          handleClearMsg: function (e) {
              return this._forceClearMsgs(),
              e && this.receivePersonalChange({
                  status: 0
              }),
              this._clearCache().then(function (e) {
                  return this.baseConversation.unreadPoint > 0 && this.clearUnReadPoint(),
                  e
              }
              .bind(this))
          },
          receivePersonalChange: function (e) {
              return void 0 !== e.notificationOff && this.baseConversation.notificationOff !== e.notificationOff && (this.baseConversation.notificationOff = e.notificationOff,
              this.emit(this.EventsName.NOTIFICATION_STATUS_UPDATE, e.notificationOff)),
              void 0 !== e.sort && this.baseConversation.sort !== e.sort && (this.baseConversation.sort = e.sort,
              this.isPin = !!e.sort,
              this._makeThisConvToTop(),
              this.emit(this.EventsName.SORT_UPDATE, e.sort)),
              e.status === conversationStatus.HIDE && this.baseConversation.status === conversationStatus.VISIBLE && (this.baseConversation.status = conversationStatus.HIDE,
              this.deactive()),
              e.status === conversationStatus.HIDE && conversationEventCenter.emit(conversationEventCenter.EventsName.HIDE_CONV, {
                  cid: this.cid,
                  isPin: this.isPin
              }),
              e.status === conversationStatus.VISIBLE && this.baseConversation.status === conversationStatus.HIDE && (this.baseConversation.status = conversationStatus.VISIBLE),
              this.conversationDbEntry && this._saveToDb(),
              !0
          },
          getDataFromServer: function (e) {
              return getConversationFromServer.getById(this.cid).then(function (t) {
                  if (t.body && t.body.baseConversation) {
                      var s = {};
                      return e.forEach(function (e) {
                          s[e] = t.body.baseConversation[e]
                      }),
                      this.receiveConvChange(s),
                      s
                  }
                  return {}
              }
              .bind(this)).catch(function (t) {
                  return this.localLog("conv, getDataFromServer error", this.cid, e, t, JSON.stringify(t)),
                  Promise.reject(t)
              }
              .bind(this))
          },
          _clearSendedMsg: function () {
              var e = []
                , t = [];
              this.messages.forEach(function (s) {
                  s.isSended() || (e.push(s),
                  t.push(s.getId()))
              }),
              this.messages = e,
              this._msgIds = t,
              this._emitMsgUpdateEvent()
          },
          updateConvFromConvData: function (e, t) {
              var s = {}
                , i = {}
                , n = e.baseConversation
                , r = ["title", "memberCount", "icon", "isKicked", "tag", "extension", "status", "authority", "memberLimit", "superGroup", "ownerId", "groupValidationInfo"]
                , a = ["status", "sort", "notificationOff"];
              r.forEach(function (e) {
                  void 0 !== n[e] && (s[e] = n[e])
              }),
              a.forEach(function (e) {
                  void 0 !== n[e] && (i[e] = n[e])
              });
              var o = _.get(e, "_local.lastModify");
              return o && (this._local.lastModify = o),
              Promise.resolve().then(function () {
                  if (e.lastMessages && e.lastMessages.length > 0 && !t) {
                      for (var s = e.lastMessages[e.lastMessages.length - 1], i = s.baseMessage.messageId, r = s.baseMessage.createdAt, a = this.messages.length - 1, o = 0, c = 0; a >= 0;) {
                          var h = this.messages[a];
                          if (h.isSended()) {
                              o = h.getMessageId(),
                              c = h.getCreatedAt();
                              break
                          }
                          a--
                      }
                      if (i !== o && r >= c) {
                          this._updateUnreadPoint(n.unreadPoint);
                          var g = Promise.resolve();
                          return o && (g = g.then(function () {
                              return this._clearCache()
                          }
                          .bind(this))),
                          g.then(function () {
                              return this._cacheMsgs(e.lastMessages)
                          }
                          .bind(this)).then(function (e) {
                              var t = e.map(function (e) {
                                  return this._getMsgInstance(e)
                              }
                              .bind(this));
                              this._batchInsertToMsgList(t),
                              this.isActive && this._setSize(INIT_SIZE)
                          }
                          .bind(this))
                      }
                      return Promise.resolve()
                  }
              }
              .bind(this)).then(function () {
                  this.receiveConvChange(s),
                  this.receivePersonalChange(i)
              }
              .bind(this))
          },
          receiveConvChange: function (e) {
              var t = null;
              e.isQuit === !0 ? t = conversationStatus.QUIT : e.isDisband === !0 ? t = conversationStatus.DISBANDED : e.isKicked === !0 ? t = conversationStatus.KICKED : e.isQuit === !1 && e.isKicked === !1 && e.isDisband === !1 && this.baseConversation.status !== conversationStatus.HIDE && (t = conversationStatus.VISIBLE),
              delete e.isQuit,
              delete e.isKicked,
              delete e.isDisband,
              null !== t && (e.status = t),
              Object.keys(e).forEach(function (t) {
                  var s = e[t];
                  if ("title" === t)
                      s && this.baseConversation.title !== s && (this.baseConversation[t] = s,
                      this._handleConvChange(t, s));
                  else if ("icon" === t)
                      s && this.baseConversation.value !== s && (this.baseConversation[t] = s,
                      this._handleConvChange(t, s));
                  else if ("remindType" === t)
                      _.isUndefined(s) || this._local.remindType === s || (this._local.remindType = s,
                      this._handleConvChange(t, s));
                  else if ("draft" === t)
                      this._local.draft !== s && (this._local.draft = s,
                      this._handleConvChange(t, s));
                  else if ("groupValidationInfo" === t)
                      s && s.type && _.get(this.baseConversation, "groupValidationInfo.type") !== s.type && (this.baseConversation[t] = s,
                      this._handleConvChange(t, s));
                  else {
                      if ("unreadPoint" === t)
                          return;
                      _.isNumber(s) || _.isString(s) ? this.baseConversation[t] !== s && (this.baseConversation[t] = s,
                      this._handleConvChange(t, s)) : _.isPlainObject(s) && (_.isEqual(this.baseConversation[t], s) || (this.baseConversation[t] = s,
                      this._handleConvChange(t, s)))
                  }
              }
              .bind(this)),
              this.conversationDbEntry && this._saveToDb()
          },
          _handleConvChange: function (e, t) {
              var s;
              switch (e) {
                  case "memberCount":
                      s = this.EventsName.MEMBER_COUNT_UPDATE,
                      this.members = null;
                      break;
                  case "title":
                      s = this.EventsName.TITLE_UPDATE;
                      break;
                  case "showHistoryType":
                      s = this.EventsName.SHOW_HISTORY_TYPE_UPDATE;
                      break;
                  case "iconOption":
                      s = this.EventsName.ICON_UPDATE;
                      break;
                  case "icon":
                      s = this.EventsName.ICON_UPDATE;
                      break;
                  case "draft":
                      s = this.EventsName.SAVE_DRAFT;
                      break;
                  case "remindType":
                      s = this.EventsName.REMIND_TYPE_UPDATE;
                      break;
                  case "groupValidationInfo":
                      s = this.EventsName.GROUP_VALIDATION_UPDATE;
                      break;
                  case "status":
                      s = this.EventsName.STATUS_UPDATE,
                      t === conversationStatus.QUIT && conversationEventCenter.emit(conversationEventCenter.EventsName.HIDE_CONV, {
                          cid: this.cid,
                          isPin: this.isPin
                      });
                      break;
                  case "tag":
                      s = this.EventsName.TAG_UPDATE;
                      break;
                  case "extension":
                      s = this.EventsName.EXTENSION_UPDATE;
                      break;
                  case "authority":
                      s = this.EventsName.AUTHORITY_UPDATE;
                      break;
                  case "memberLimit":
                      s = this.EventsName.MEMBER_LIMIT_UPDATE;
                      break;
                  case "superGroup":
                      s = this.EventsName.SUPER_GROUP_UPDATE;
                      break;
                  case "banWordsType":
                  case "inBanWhite":
                  case "inBanBlack":
                  case "banWordsTime":
                      s = this.EventsName.BAN_WORDS_STATUS_UPDATE;
                      break;
                  case "ownerId":
                      s = this.EventsName.OWNER_ID_UPDATE
              }
              return s && syncSinglePackageActionMerge.registerAction("convChangeEmit_" + this.cid + "_" + s, function () {
                  this.emit(s, t)
              }
              .bind(this)),
              s
          },
          getMsgDataByMid: function (e) {
              return this.messageDbEntry ? this.messageDbEntry.getMessageById(e) : Promise.resolve(this._msgCache.msgIdIndex[e])
          },
          getIconOption: function () {
              return this.baseConversation.iconOption && "undefined" != typeof this.baseConversation.iconOption.type ? this.baseConversation.iconOption : (batchGetConvIcon.getConvIcon(this.cid).then(function (e) {
                  this.receiveConvChange({
                      iconOption: e
                  })
              }
              .bind(this)).catch(function (e) {
                  this.localLog.error("get conv icon error", e)
              }
              .bind(this)),
              {})
          },
          _cacheMsgs: function (e) {
              return decryptMsg.tryDecryptMsgs(e).then(function (e) {
                  return this.messageDbEntry ? (syncDBTransaction.registerAction("0_insertMsgs_" + JSON.stringify(e.map(function (e) {
                      return e.baseMessage.messageId
                  })), function (t) {
                      return this.messageDbEntry.multiInsertWkmsgs(e, t)
                  }
                  .bind(this)),
                  Promise.resolve(e)) : (e.forEach(function (e) {
                      var t = _.get(e, "baseMessage.messageId");
                      if (!this._msgCache.msgIdIndex[t]) {
                          this._msgCache.msgIdIndex[t] = e;
                          var s = _.get(e, "baseMessage.createdAt");
                          Array.isArray(this._msgCache.createdIndex[s]) || (this._msgCache.createdIndex[s] = []),
                          this._msgCache.createdIndex[s].push(t)
                      }
                  }
                  .bind(this)),
                  Promise.resolve(e))
              }
              .bind(this)).then(function (e) {
                  return e.forEach(function (e) {
                      var t = _.get(e, "baseMessage.openIdEx.openId")
                        , s = _.get(e, "baseMessage.groupNickTag") || 0;
                      syncSinglePackageActionMerge.registerAction("receiveChange_" + this.cid + "_" + t + "_" + s, function () {
                          var e = {
                              conversationId: this.cid,
                              openId: t,
                              groupNickModel: {
                                  tag: s
                              }
                          };
                          groupNickService.receiveChange(e)
                      }
                      .bind(this))
                  }
                  .bind(this)),
                  Promise.resolve(e)
              }
              .bind(this))
          },
          _clearCache: function () {
              return this._clearSendedMsg(),
              this.messageDbEntry ? this.messageDbEntry.rebuild() : (this._msgCache.msgIdIndex = {},
              this._msgCache.createdIndex = {},
              Promise.resolve())
          },
          _pullMsgsFromCache: function (e, t) {
              if (this.messageDbEntry)
                  return this.messageDbEntry.listMessages(!1, e, t).then(function (e) {
                      this.localLog.info("pull from cache result", this.cid, JSON.stringify(e.map(function (e) {
                          return e.baseMessage.messageId
                      })));
                      var e = e || []
                        , t = e.filter(function (e) {
                            return e.baseMessage.type === msgType.ENCRYPTED && e.baseMessage.isDecrypt !== decryptType.YES && e.baseMessage.isDecrypt !== decryptType.NEVER
                        });
                      return Promise.all(t.map(function (e) {
                          return decryptMsg.decryptMsg(e).then(function (e) {
                              return e.baseMessage.isDecrypt = decryptType.YES,
                              this.updateMsgToDb(e),
                              e
                          }
                          .bind(this)).catch(function () {
                              return e
                          })
                      }
                      .bind(this))).then(function (t) {
                          var s = {};
                          return t.forEach(function (e) {
                              s[e.baseMessage.messageId] = e
                          }),
                          e.forEach(function (t, i) {
                              var n = t.baseMessage.messageId;
                              s[n] && (e[i] = s[n])
                          }),
                          e = e.sort(function (e, t) {
                              return _.get(t, "baseMessage.createdAt") - _.get(e, "baseMessage.createdAt")
                          })
                      })
                  }
                  .bind(this));
              var s = [];
              Object.keys(this._msgCache.createdIndex).filter(function (t) {
                  return t <= e
              }).sort(function (e, t) {
                  return t - e
              }).some(function (e) {
                  return this._msgCache.createdIndex[e].some(function (e) {
                      return s.push(e),
                      s.length >= t
                  })
              }
              .bind(this));
              var i = s.map(function (e) {
                  return this._msgCache.msgIdIndex[e]
              }
              .bind(this));
              return Promise.resolve(i)
          },
          _completeConv: function () {
              return IDLConversation.getByIdUnlimited(this.cid).result.then(function (e) {
                  if (this._local.clientExtension.complete = !0,
                  e.body && e.body.baseConversation) {
                      var t = e.body.baseConversation;
                      this.baseConversation.createdAt = t.createAt,
                      this.receiveConvChange({
                          conversationId: t.conversationId,
                          memberCount: t.memberCount,
                          title: t.title,
                          icon: t.icon,
                          tag: t.tag,
                          extension: t.extension,
                          authority: t.authority,
                          memberLimit: t.memberLimit,
                          groupValidationInfo: t.groupValidationInfo,
                          superGroup: t.superGroup,
                          ownerId: t.ownerId
                      }),
                      this.receivePersonalChange({
                          conversationId: t.conversationId,
                          sort: t.sort,
                          notificationOff: t.notificationOff
                      })
                  } else
                      this.localLog.info("complete conv resp body empty", this.cid, this.isSingleChat),
                      this.isSingleChat || this.receiveConvChange({
                          isQuit: !0
                      })
              }
              .bind(this))
          },
          _saveToDb: function () {
              var e = this.baseConversation
                , t = this._local
                , s = {
                    baseConversation: e,
                    _local: t
                };
              syncDBTransaction.registerAction("1_updateConv_" + this.cid, function (e) {
                  return this.conversationDbEntry.updateConversation(this.cid, s, e)
              }
              .bind(this))
          },
          destroy: function () {
              this._forceClearMsgs(),
              this.emit(this.EventsName.DESTROY)
          }
      });
    module.exports = Conv;
}
   , {
       "../class/class": 873,
       "../config/config": 877,
       "../dbEntry/messageDbEntryService": 907,
       "../error/errorCode": 910,
       "../idl/idl": 914,
       "../message/BaseMsg": 925,
       "../message/CustomMsg": 926,
       "../message/GapMsg": 927,
       "../message/ImgMsg": 928,
       "../message/SystemMsg": 929,
       "../message/TextMsg": 930,
       "../message/forwardMsgBuilder": 934,
       "../message/messageReadStatus": 935,
       "../message/msgContentType": 936,
       "../message/msgCreatorType": 937,
       "../message/msgSendStatus": 939,
       "../message/msgType": 940,
       "../message/msgViewStatus": 941,
       "../message/receiveMsgInstanceHelper": 942,
       "../message/sendMsgBuilder": 943,
       "../my/my": 947,
       "../safety/decryptMsg": 948,
       "../safety/decryptType": 949,
       "../sync/syncDBTransaction": 954,
       "../sync/syncSinglePackageActionMerge": 958,
       "../user/groupNickService": 973,
       "./banWordsType": 878,
       "./batchGetConvIcon": 879,
       "./conversationEventCenter": 881,
       "./conversationStatus": 884,
       "./conversationType": 885,
       "./getConversationFromServer": 886,
       "./groupAuthority": 887,
       "./groupRole": 888,
       "./inBanBlackStatus": 891,
       "./inBanWhiteStatus": 892,
       "./showHistoryType": 893,
       "./typingCommand": 894,
       "./typingStatus": 895,
       "lodash": 1057,
       "wolfy87-eventemitter": 1083
   }]