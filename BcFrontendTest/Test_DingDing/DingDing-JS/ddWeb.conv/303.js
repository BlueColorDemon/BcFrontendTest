[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.conv.ConvWithSDK"
      , i18next = require("i18next")
      , WKim = require("@ali/wksdk")
      , groupSupportType = require("../groupSupportType/groupSupportType")
      , $my = require("../user/my")
      , ConvType = require("./ConvType")
      , ConvExtensionType = require("./convExtensionType")
      , MsgType = require("./MsgType")
      , SuperGroupStatus = require("./SuperGroupStatus")
      , _ = require("lodash")
      , EventEmitter = require("wolfy87-eventemitter")
      , Class = require("../../lib/class")
      , localLog = require("../log/localLog")
      , fileCache = require("./msg/fileCache")
      , spaceUploadQueue = require("../api/spaceUploadQueue")
      , fileTypes = require("@ali/ding-filetypes")
      , avatarType = require("../../directive/widget/avatar/avatarType")
      , ConversationErrorText = require("./ErrorText")
      , RemindEnum = require("./RemindEnum")
      , nwWindow = require("../app/nwWindow")
      , nw = require("../app/nw")
      , ua = require("../ua")
      , messageCreatorType = WKim.messageCreatorType
      , messageType = WKim.messageType
      , BanWordsType = WKim.banWordsType
      , InBanBlackStatus = WKim.inBanBlackStatus
      , InBanWhiteStatus = WKim.inBanWhiteStatus
      , msgSourceFromType = require("./msgSourceFromType")
      , BaseMsgTag = require("./baseMsgTag")
      , msgContentTypeChecker = require("./msgContentTypeChecker")
      , ddStorage = require("../storage/ddStorage")
      , EVENTS = require("../events")
      , NAME_SCENE = require("../../service/user/NameScene")
      , MainScene = require("../../service/user/MainScene")
      , userHelper = require("../../service/user/userHelper")
      , viewBridge = require("../../service/bridge/viewBridge")
      , bridgeEvent = require("../../service/bridge/bridgeEvent")
      , safetyEncryptFileStatus = require("../safety/safetyEncryptFileStatus")
      , SAFETY_PRIORITY = require("../safety/safetyPriority")
      , CSpaceKey = require("./CSpaceKey")
      , CSpaceType = require("./CSpaceType")
      , LocalFile = require("../../service/file/LocalFile")
      , ContentType = require("./ContentType")
      , limitConfig = require("../limitConfig")
      , XpnTemplateId = require("./xpnTemplateId")
      , serviceBridge = require("../../service/bridge/serviceBridge.js")
      , AnHengResCode = require("../safety/anHengResCode")
      , RemindPriority = [RemindEnum.EMPTY, RemindEnum.FOLLOW, RemindEnum.ANNOUNCE, RemindEnum.AT_ALL, RemindEnum.RED_ENVELOPE_ENTERPRISE, RemindEnum.DRAFT, RemindEnum.AT]
      , UserType = require("../user/UserType")
      , id = 0
      , IMLogType = require("../../service/log/imLogType")
      , FORWARD_MSG_EXTENSION_WHITELIST = ["code_language", "text_type"];
    angular.module(moduleName, [require("./msgInstanceHelper"), require("./msgInstanceHelper"), require("../toast/toast"), require("./msg/MsgWithSDK"), require("../audio"), require("@ali/ding-api").interface.IMI, require("@ali/ding-api").interface.ContactI, require("@ali/ding-api").interface.CSpace, require("../widget/emailOpenService"), require("../email/emailNotify"), require("../notification"), require("../microApp/microAppData"), require("../api/SpaceUpload"), require("../safety/safetyLog"), require("../../filter/secondTohhmmss"), require("../file/fileHelper"), require("../safety/fileEncryptor"), require("../user/userManager.js"), require("../../service/error/conversationError"), require("../../service/log/imLog"), require("../../service/log/lwlog")]).factory("ConvWithSDK", ["$rootScope", "$filter", "msgInstanceHelper", "toastService", "MsgWithSDK", "audioService", "IMI", "ContactI", "CSpace", "emailOpenService", "emailNotify", "notification", "microAppData", "SpaceUpload", "safetyLog", "$fileHelper", "fileEncryptor", "vipLogManager", "userManager", "conversationError", "imLog", "lwlog", function (e, t, i, n, s, a, r, o, d, h, p, c, u, g, l, T, E, m, v, y, f, S) {
        var I = groupSupportType.conversation.allowedShowJumpType
          , C = groupSupportType.conversation.fullSupportGroupType
          , M = {
              dt_message_decrypt_error_dismission: i18next.t("dt_message_decrypt_error_dismission"),
              dt_message_decrypt_error_no_key: i18next.t("dt_message_decrypt_error_no_key"),
              pc_safety_upgrade_tips: i18next.t("pc_safety_upgrade_tips"),
              and_im_encrypt_decrypt_error_prefix: i18next.t("and_im_encrypt_decrypt_error_prefix")
          }
          , A = Class.create({
              initialize: function (e, t) {
                  if (this.sdkConv = e,
                  this.myuid = $my.uid,
                  this.baseConversation = e.baseConversation,
                  this.convId = e.cid,
                  this.updateTime = 0,
                  this._lastMsgId = 0,
                  this._lastMsgIdIncre = 0,
                  this.lastMessageContent = "",
                  this.lastMessageType = "",
                  this.msgIds = [],
                  this.showSize = 0,
                  this.recentAtUids = [],
                  this.newMsg = e.baseConversation.unreadPoint,
                  this.isSingleChat = e.isSingleChat,
                  this.notificationOff = this.sdkConv.baseConversation.notificationOff,
                  this.hasNewMsgButNotNotify = !1,
                  this.isToMySelf = e.isToMySelf,
                  this.isShowTyping = !1,
                  this.isOAConv = !1,
                  this.isGroupShowRealName = !1,
                  this.EventEmitter = new EventEmitter,
                  this._handleSingleChatOppisiteUserUpdateBindThis = this.handleSingleChatOppisiteUserUpdate.bind(this),
                  this.EVENTS = {
                      TYPING_SHOW: "typing_show",
                      UPDATE_BASE_CONV: "update_base_conv",
                      GROUP_VALIDATION_UPDATE: "group_validation_update",
                      UPDATE_MSG: "update_msg",
                      NOTIFICATION_STATUS_CHANGE: "notification_status_change",
                      UPDATE_TITLE: "update_title",
                      AUTHORITY_UPDATE: "authority_update",
                      SORT_UPDATE: "sort_update",
                      MEMBER_COUNT_UPDATE: "member_count_update",
                      OWNER_ID_UPDATE: "owner_id_update",
                      REMIND_TYPE_UPDATE: "remind_type_update",
                      SAVE_DRAFT: "save_draft",
                      LAST_MSG_REMIND_UPDATE: "last_msg_remind_update",
                      SHOW_HISTORY_TYPE_UPDATE: "show_history_type_update",
                      UPDATE_BAN_WORDS_STATUS: "update_ban_words_status",
                      UPDATE_SAFETY_STATUS: "update_safety_status",
                      UNREAD_POINT_UPDATE: "unread_point_update"
                  },
                  this.isSingleChat === !0) {
                      var n = this.convId.split(":");
                      this.oppositeUid = this.myuid === parseInt(n[0], 10) ? parseInt(n[1], 10) : parseInt(n[0], 10),
                      this.baseConversation.icon = "uids:" + this.oppositeUid + ";",
                      viewBridge.addHostListener(bridgeEvent.USER_UPDATE, this.oppositeUid, this._handleSingleChatOppisiteUserUpdateBindThis),
                      v.getUsers([this.oppositeUid]).then(function (e) {
                          var t = e[0];
                          localLog.info("ConvWithSDK get user success", this.oppositeUid),
                          t && this.handleSingleChatOppisiteUserUpdate(t)
                      }
                      .bind(this)).catch(function (e) {
                          localLog.error("ConvWithSDK get user fail", e)
                      })
                  }
                  if (this.allowedShow = !0,
                  this.isDiscard = !1,
                  this.remindType = this.sdkConv._local.remindType || RemindEnum.EMPTY,
                  this.draft = this.sdkConv._local.draft,
                  this.isSingleChat) {
                      var n = this.convId.split(":").map(function (e) {
                          return parseInt(e, 10)
                      });
                      n[0] > n[1] && (this.allowedShow = !1,
                      this.isDiscard = !0)
                  }
                  this.isCompanyGroup = !1,
                  this.isAllUserGroup = !1,
                  this.isDeptGroup = !1,
                  this.isSafetySingle = !1,
                  this.orgId = _.get(this.baseConversation, "extension.id"),
                  this._tagHandle(),
                  this.safetyAppId = null,
                  this.isSafety = !1,
                  this.hasTryDecrypt = !1,
                  this.hasPullBanInfo = !1,
                  this.AT_NOTI_CACHE = [],
                  this.EMAIL_NOTI = [],
                  this.ANNOUNCE_NOTI = [],
                  this._lastMsg = null,
                  this._handleLastMsgChangeBindThis = this._handleLastMsgChange.bind(this),
                  this._handleMsgUpdateBindThis = this._updateMessages.bind(this),
                  this._handleUnreadPointUpdateBindThis = this.handleUnreadPointUpdate.bind(this),
                  this._handleNotificationUpdateBindThis = this.handleNotificationUpdate.bind(this),
                  this._handleAuthorityUpdateBindThis = this.handleAuthorityUpdate.bind(this),
                  this._handleGroupValidationUpdateBindThis = this.handleGroupValidationUpdate.bind(this),
                  this._handleIconUpdateBindThis = this.handleIconUpdate.bind(this),
                  this._handleTitleUpdateBindThis = this.handleTitleUpdate.bind(this),
                  this._handleSortUpdateBindThis = this.handleSortUpdate.bind(this),
                  this._handleExtensionUpdateBindThis = this.handleExtensionUpdate.bind(this),
                  this._handleMemberCountUpdateBindThis = this.handleMemberCountUpdate.bind(this),
                  this._handleOwnerIdUpdateBindThis = this.handleOwnerIdUpdate.bind(this),
                  this._handleTypingStatusUpdateBindThis = this.handleTypingStatusUpdate.bind(this),
                  this._handleReceiveNewMessageBindThis = this.handleReceiveNewMessage.bind(this),
                  this._handleTagUpdateBindThis = this.handleTagUpdate.bind(this),
                  this._handleBanWordsStatusUpdateBindThis = this.handleBanWordsStatusUpdate.bind(this),
                  this._handleShowHistoryTypeUpdateBindThis = this.handleShowHistoryTypeUpdate.bind(this),
                  this.messages = [],
                  this.avatarType = this.isSingleChat ? avatarType.SINGLE : avatarType.MULTI,
                  e.messages.length > 0 && this._genLastMsg(i.instance(e.messages[e.messages.length - 1])),
                  this.updateSafetyAppBindThis = this.updateSafetyApp.bind(this),
                  this.updateSafetyAppBindThis(),
                  this._initListener()
              },
              handleSingleChatOppisiteUserUpdate: function (e) {
                  this.baseConversation.title = e.remarkNameObj.alias || e.userProfileModel.nick,
                  this.EventEmitter.emit(this.EVENTS.UPDATE_TITLE, this.baseConversation.title),
                  localLog.info("ConvWithSDK set Title", this.convId)
              },
              updateSafetyApp: function () {
                  if (this.orgId)
                      return u.getSafetyApp(this.orgId).then(function (e) {
                          var t = this.isSafety;
                          return this.safetyAppId = e,
                          this.isSafety = !0,
                          this.isSafety !== t && this.EventEmitter.emit(this.EVENTS.UPDATE_SAFETY_STATUS),
                          Promise.resolve()
                      }
                      .bind(this)).catch(function () {
                          var e = this.isSafety;
                          return this.safetyAppId = null,
                          this.isSafety = !1,
                          this.isSafety !== e && this.EventEmitter.emit(this.EVENTS.UPDATE_SAFETY_STATUS),
                          Promise.resolve()
                      }
                      .bind(this));
                  var e = this.isSafety;
                  return this.safetyAppId = null,
                  this.isSafety = !1,
                  this.isSafety !== e && this.EventEmitter.emit(this.EVENTS.UPDATE_SAFETY_STATUS),
                  Promise.resolve()
              },
              isFileHelper: function () {
                  var e, t = 4248001;
                  return e = t < this.myuid ? [t, this.myuid].join(":") : [this.myuid, t].join(":"),
                  e === this.convId
              },
              _tagHandle: function () {
                  var e = this.baseConversation.tag;
                  if (e && (C.indexOf(e) !== -1 ? this.allowedShow = !0 : this.allowedShow = !1),
                  e === ConvType.JUMP && (this.isRedirectType = !0,
                  this.allowedShow = !1,
                  this.baseConversation.extension && I.indexOf(this.baseConversation.extension.type) !== -1 && (this.allowedShow = !0)),
                  e === ConvType.ANNOUNCEMENT && (this.isOAConv = !0),
                  e === ConvType.FILEHELPER && (this.baseConversation.extension && "1" === this.baseConversation.extension.show_in_web ? (this.baseConversation.extension.type === ConvExtensionType.GROUPREQUEST && (this.isRedirectType = !0),
                  this.allowedShow = !0) : this.allowedShow = !1),
                  e === ConvType.ENCRYPT_CHAT && this.orgId && u.getSafetyApp(this.orgId).then(function (e) {
                      this.isSafetySingle = !0
                  }
                  .bind(this)).catch(function () { }
                  .bind(this)),
                  e === ConvType.COMPANY_GROUP && this.baseConversation.extension) {
                      var t = this.baseConversation.extension.id;
                      if (t) {
                          this.orgId = t;
                          var i = $my.getOrgByOid(t);
                          this.isGroupShowRealName = _.get(i, "orgDetail.organizationSettingsModel.groupRealName", !1)
                      }
                      this.isCompanyGroup = !0,
                      this.isAllUserGroup = "1" === _.get(this, "baseConversation.extension.isAllUsrGrp"),
                      this.isDeptGroup = !!_.get(this, "baseConversation.extension.deptId") && !this.isAllUserGroup
                  } else
                      this.isCompanyGroup = !1,
                      this.isAllUserGroup = !1,
                      this.isDeptGroup = !1;
                  this._initRedirectType()
              },
              _initRedirectType: function () {
                  this.isRedirectType && this.baseConversation.extension && this.baseConversation.extension.type === ConvExtensionType.EMAIL && p.emit(p.EventsName.SHOW_EMAIL, this)
              },
              handleUnreadPointUpdate: function (t) {
                  var i = this.newMsg;
                  this.newMsg = t.unreadPoint,
                  0 === this.newMsg && (localLog.info("clear at noti cache, clear email noti, clear remind type, because new msg reset to 0", this.convId),
                  this.AT_NOTI_CACHE = [],
                  this.EMAIL_NOTI = [],
                  this.ANNOUNCE_NOTI = [],
                  this._clearRemindType(),
                  this.draft && this._setRemindType(RemindEnum.DRAFT)),
                  WKim.syncSinglePackageActionMerge.registerAction("unread_point_update_" + this.convId, function () {
                      this.EventEmitter.emit(this.EVENTS.UNREAD_POINT_UPDATE),
                      this.sdkConv.isActive && "hidden" !== nwWindow.visibilityState || !this.notificationOff && this.baseConversation.superGroup !== SuperGroupStatus.SUPER && this.newMsg > i && this.allowedShow && (a.play("message"),
                      nw.setRequestAttention())
                  }
                  .bind(this)),
                  WKim.syncSinglePackageActionMerge.registerAction("all_new_msg_count_change", function () {
                      e.$broadcast(EVENTS.NEW_MSG_COUNT_CHANGE)
                  }
                  .bind(this))
              },
              handleNotificationUpdate: function () {
                  this.notificationOff = this.sdkConv.baseConversation.notificationOff,
                  this.EventEmitter.emit(this.EVENTS.NOTIFICATION_STATUS_CHANGE, this.notificationOff)
              },
              handleAuthorityUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.AUTHORITY_UPDATE)
              },
              handleTagUpdate: function () {
                  this._tagHandle(),
                  this.EventEmitter.emit(this.EVENTS.UPDATE_BASE_CONV),
                  serviceBridge.sendPush(bridgeEvent.CONV_UPDATE_BASE_CONV, this.convId, "")
              },
              handleGroupValidationUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.GROUP_VALIDATION_UPDATE)
              },
              handleIconUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.UPDATE_BASE_CONV),
                  serviceBridge.sendPush(bridgeEvent.CONV_UPDATE_BASE_CONV, this.convId, "")
              },
              handleTitleUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.UPDATE_TITLE)
              },
              handleSortUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.SORT_UPDATE)
              },
              handleExtensionUpdate: function () {
                  this.orgId = _.get(this.baseConversation, "extension.id"),
                  this._tagHandle(),
                  this.updateSafetyAppBindThis(),
                  this.EventEmitter.emit(this.EVENTS.UPDATE_BASE_CONV),
                  serviceBridge.sendPush(bridgeEvent.CONV_UPDATE_BASE_CONV, this.convId, "")
              },
              handleMemberCountUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.MEMBER_COUNT_UPDATE)
              },
              handleShowHistoryTypeUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.SHOW_HISTORY_TYPE_UPDATE)
              },
              handleOwnerIdUpdate: function () {
                  this.EventEmitter.emit(this.EVENTS.OWNER_ID_UPDATE)
              },
              handleTypingStatusUpdate: function (e) {
                  e === WKim.typingStatus.TYPING ? this.isShowTyping = !0 : this.isShowTyping = !1,
                  this.EventEmitter.emit(this.EVENTS.TYPING_SHOW, this.isShowTyping)
              },
              handleReceiveNewMessage: function (t) {
                  var n = this
                    , s = t.message;
                  if ((msgContentTypeChecker.hasAtMe(s) || msgContentTypeChecker.hasAtAll(s)) && (this.AT_NOTI_CACHE.push(t),
                  localLog.info("receive sone one at me event", _.get(s, "baseMessage.messageId")),
                  this.newMsg > 0 && (msgContentTypeChecker.hasAtMe(s) ? this._setRemindType(RemindEnum.AT) : this._setRemindType(RemindEnum.AT_ALL)),
                  WKim.syncMultiPackageActionMerge.registerAction("been_at_" + this.convId, function () {
                      if (this.AT_NOTI_CACHE.length > 0) {
                          var t = this.AT_NOTI_CACHE;
                          this.AT_NOTI_CACHE = [],
                          this.newMsg > 0 && t.forEach(function (t) {
                              var s = t.message
                                , a = _.get(s, "baseMessage.openIdEx.openId");
                              v.getUsers([a]).then(function (t) {
                                  if (0 !== t.length) {
                                      var a = t[0]
                                        , r = n.getScene(MainScene.CHAT);
                                      userHelper.getName(a, n.convId, r, {
                      oid: n.orgId
                  }).then(function (t) {
                                          var n = {
                      name: t,
                      text: i.instance(s).getContent().textContent.text,
                      tip: ""
                  };
                                          c.notify(n, function () {
                                              f.trace(this.convId, IMLogType.NOTIFICATION),
                                              e.$broadcast("leftpannel.openChatByGroup", {
                      conversationId: this.convId,
                      messageId: s.baseMessage.messageId
                  }),
                                              ua.isDesktop && nwWindow.activeWindow()
                  }
                                          .bind(this))
                  }
                                      .bind(this))
                  }
                  }
                              .bind(this)),
                              localLog.info("start notification messageId is " + s.baseMessage.messageId, "conv id is " + this.convId)
                  }
                          .bind(this))
                  }
                  }
                  .bind(this))),
                  _.get(s, "baseMessage.content.contentType") === ContentType.RED_ENVELOPE_ENTERPRISE && 0 !== this.newMsg && this._setRemindType(RemindEnum.RED_ENVELOPE_ENTERPRISE),
                  s.baseMessage.creatorType !== messageCreatorType.SYSTEM && s.baseMessage.openIdEx && s.baseMessage.openIdEx.openId && s.baseMessage.openIdEx.openId !== n.myuid) {
                      var a = WKim.followService.getFollowRelationByOpenId(s.baseMessage.openIdEx.openId);
                      !a || a.status !== WKim.followService.FOLLOW_STATUS.FOLLOWING && a.status !== WKim.followService.FOLLOW_STATUS.FOLLOW_EACH_OTHER || 0 !== this.newMsg && this._setRemindType(RemindEnum.FOLLOW)
                  }
                  if (s.baseMessage.content.contentType === ContentType.GROUP_ANNOUNCE && (this.ANNOUNCE_NOTI.push(t),
                  0 !== this.newMsg && this._setRemindType(RemindEnum.ANNOUNCE),
                  WKim.syncMultiPackageActionMerge.registerAction("receive_announce_" + this.convId, function () {
                      if (this.ANNOUNCE_NOTI.length > 0) {
                          var t = this.ANNOUNCE_NOTI;
                          this.ANNOUNCE_NOTI = [],
                          this.newMsg > 0 && t.forEach(function (t) {
                              var s = t.message
                                , a = _.get(s, "baseMessage.openIdEx.openId");
                              v.getUsers([a]).then(function (t) {
                                  if (0 !== t.length) {
                                      var a = t[0]
                                        , r = n.getScene(MainScene.CHAT);
                                      userHelper.getName(a, n.convId, r, {
                      oid: n.orgId
                  }).then(function (t) {
                                          var n = {
                      name: t,
                      text: "[群公告] " + _.get(i.instance(s).getContent(), "attachments[0].extension.text"),
                      tip: ""
                  };
                                          c.notify(n, function () {
                                              f.trace(this.convId, IMLogType.NOTIFICATION),
                                              e.$broadcast("leftpannel.openChatByGroup", {
                      conversationId: this.convId,
                      messageId: s.baseMessage.messageId
                  }),
                                              ua.isDesktop && nwWindow.activeWindow()
                  }
                                          .bind(this))
                  }
                                      .bind(this))
                  }
                  }
                              .bind(this))
                  }
                          .bind(this))
                  }
                  }
                  .bind(this))),
                  this.isRedirectType && this.baseConversation.extension && this.baseConversation.extension.type === ConvExtensionType.EMAIL && s.baseMessage.extension && "5" !== s.baseMessage.extension.folderType && (this.EMAIL_NOTI.push(s),
                  WKim.syncMultiPackageActionMerge.registerAction("receive_new_email_" + this.convId, function () {
                      var e = "true" == ddStorage.getItemWithUid("dingEmailNotification");
                      if (e && this.EMAIL_NOTI.length > 0) {
                          var t = this.EMAIL_NOTI;
                          if (this.EMAIL_NOTI = [],
                          t.length > 5) {
                              var i = {
                      name: "新邮件提醒",
                      text: "您有新邮件，请注意查收",
                      tip: "",
                      type: "mail"
                  };
                              c.notify(i, function () {
                                  S.commLog("mail_notice_list_click", ""),
                                  h.openEmail(),
                                  this.clearNewMsg()
                  }
                              .bind(this))
                  } else
                              t.forEach(function (e) {
                                  var t = {
                      name: "",
                      text: "",
                      tip: "",
                      type: "mail"
                  };
                                  t.name = e.baseMessage.extension && e.baseMessage.extension.fromName ? "【" + e.baseMessage.extension.fromName + "】" : t.name,
                                  t.name += e.baseMessage.extension && e.baseMessage.extension.subject ? e.baseMessage.extension.subject : "【无主题】",
                                  t.text = e.baseMessage.extension && e.baseMessage.extension.summary ? e.baseMessage.extension.summary : "",
                                  c.notify(t, function () {
                                      S.commLog("mail_notice_list_click", ""),
                                      h.openEmail(),
                                      this.clearNewMsg()
                  }
                                  .bind(this))
                  }
                              .bind(this))
                  }
                  }
                  .bind(this)),
                  localLog.info("receive email msg", s.baseMessage.messageId),
                  p.emit(p.EventsName.SHOW_EMAIL, this)),
                  s.baseMessage.tag === BaseMsgTag.DROP_MSG) {
                      var r = s.baseMessage.createdAt;
                      this.sdkConv.cleanMsgFromCreatedAt(r)
                  }
              },
              isInBanBlack: function () {
                  return this.baseConversation.inBanBlack === InBanBlackStatus.ON && this.baseConversation.banWordsTime - Date.now() > 0
              },
              getBanWordsStatus: function () {
                  var e = this.baseConversation.ownerId === this.myuid;
                  return !e && (!!this.isInBanBlack() || this.baseConversation.banWordsType === BanWordsType.ON && this.baseConversation.inBanWhite === InBanWhiteStatus.OFF)
              },
              handleBanWordsStatusUpdate: function () {
                  this.getBanWordsStatus() ? this.remindType === RemindEnum.DRAFT && this._clearRemindType() : this.draft && this.saveDraft(this.draft),
                  this._genLastMsg(this._lastMsg),
                  this.EventEmitter.emit(this.EVENTS.UPDATE_BAN_WORDS_STATUS)
              },
              _initListener: function () {
                  var e = this.sdkConv;
                  e.addListener(e.EventsName.UNREAD_POINT_UPDATE, this._handleUnreadPointUpdateBindThis),
                  e.addListener(e.EventsName.NOTIFICATION_STATUS_UPDATE, this._handleNotificationUpdateBindThis),
                  e.addListener(e.EventsName.AUTHORITY_UPDATE, this._handleAuthorityUpdateBindThis),
                  e.addListener(e.EventsName.TAG_UPDATE, this._handleTagUpdateBindThis),
                  e.addListener(e.EventsName.GROUP_VALIDATION_UPDATE, this._handleGroupValidationUpdateBindThis),
                  e.addListener(e.EventsName.ICON_UPDATE, this._handleIconUpdateBindThis),
                  e.addListener(e.EventsName.TITLE_UPDATE, this._handleTitleUpdateBindThis),
                  e.addListener(e.EventsName.SORT_UPDATE, this._handleSortUpdateBindThis),
                  e.addListener(e.EventsName.EXTENSION_UPDATE, this._handleExtensionUpdateBindThis),
                  e.addListener(e.EventsName.MEMBER_COUNT_UPDATE, this._handleMemberCountUpdateBindThis),
                  e.addListener(e.EventsName.OWNER_ID_UPDATE, this._handleOwnerIdUpdateBindThis),
                  e.addListener(e.EventsName.PEER_TYPING_STATUS_UPDATE, this._handleTypingStatusUpdateBindThis),
                  e.addListener(e.EventsName.MESSAGES_UPDATE, this._handleMsgUpdateBindThis),
                  e.addListener(e.EventsName.RECEIVE_NEW_MESSAGE, this._handleReceiveNewMessageBindThis),
                  e.addListener(e.EventsName.SHOW_HISTORY_TYPE_UPDATE, this._handleShowHistoryTypeUpdateBindThis),
                  e.addListener(e.EventsName.BAN_WORDS_STATUS_UPDATE, this._handleBanWordsStatusUpdateBindThis),
                  u.addListener(u.EventsName.UPDATE, this.updateSafetyAppBindThis),
                  $my.addListener($my.EventsName.update, this.updateSafetyAppBindThis)
              },
              removeListener: function () {
                  var e = this.sdkConv;
                  e.removeListener(e.EventsName.UNREAD_POINT_UPDATE, this._handleUnreadPointUpdateBindThis),
                  e.removeListener(e.EventsName.NOTIFICATION_STATUS_UPDATE, this._handleNotificationUpdateBindThis),
                  e.removeListener(e.EventsName.AUTHORITY_UPDATE, this._handleAuthorityUpdateBindThis),
                  e.removeListener(e.EventsName.TAG_UPDATE, this._handleTagUpdateBindThis),
                  e.removeListener(e.EventsName.GROUP_VALIDATION_UPDATE, this._handleGroupValidationUpdateBindThis),
                  e.removeListener(e.EventsName.ICON_UPDATE, this._handleIconUpdateBindThis),
                  e.removeListener(e.EventsName.TITLE_UPDATE, this._handleTitleUpdateBindThis),
                  e.removeListener(e.EventsName.SORT_UPDATE, this._handleSortUpdateBindThis),
                  e.removeListener(e.EventsName.EXTENSION_UPDATE, this._handleExtensionUpdateBindThis),
                  e.removeListener(e.EventsName.MEMBER_COUNT_UPDATE, this._handleMemberCountUpdateBindThis),
                  e.removeListener(e.EventsName.OWNER_ID_UPDATE, this._handleOwnerIdUpdateBindThis),
                  e.removeListener(e.EventsName.PEER_TYPING_STATUS_UPDATE, this._handleTypingStatusUpdateBindThis),
                  e.removeListener(e.EventsName.MESSAGES_UPDATE, this._handleMsgUpdateBindThis),
                  e.removeListener(e.EventsName.RECEIVE_NEW_MESSAGE, this._handleReceiveNewMessageBindThis),
                  e.removeListener(e.EventsName.SHOW_HISTORY_TYPE_UPDATE, this._handleShowHistoryTypeUpdateBindThis),
                  e.removeListener(e.EventsName.BAN_WORDS_STATUS_UPDATE, this._handleBanWordsStatusUpdateBindThis),
                  u.removeListener(u.EventsName.UPDATE, this.updateSafetyAppBindThis),
                  $my.removeListener($my.EventsName.update, this.updateSafetyAppBindThis),
                  this.oppositeUid && viewBridge.removeHostListener(bridgeEvent.USER_UPDATE, this.oppositeUid, this._handleSingleChatOppisiteUserUpdateBindThis),
                  viewBridge.removeHostListener(bridgeEvent.GROUP_NICK_UPDATE, this.convId, this._handleLastMsgChangeBindThis),
                  this.lastMsgUid && viewBridge.removeHostListener(bridgeEvent.USER_UPDATE, this.lastMsgUid, this._handleLastMsgChangeBindThis)
              },
              _updateMessages: function () {
                  if (this.sdkConv.isActive) {
                      var e = {};
                      this.messages.forEach(function (t) {
                          e[t.getId()] = t
                      }),
                      this.messages = this.sdkConv.messages.map(function (t) {
                          var n = t.getId();
                          return e[n] ? e[n] : i.instance(t)
                      }
                      .bind(this)),
                      this.EventEmitter.emit(this.EVENTS.UPDATE_MSG)
                  }
                  var t = this._calLastMsg();
                  return this._genLastMsg(t),
                  this.messages
              },
              _calLastMsg: function () {
                  var e = null
                    , t = [];
                  if (this.messages.length > 0)
                      t = this.messages;
                  else {
                      if (!(this.sdkConv.messages.length > 0))
                          return e;
                      t = this.sdkConv.messages
                  }
                  for (var n = t.length - 1; n >= 0;) {
                      if (t[n].sdkMsg)
                          var s = t[n];
                      else
                          var s = i.instance(t[n]);
                      if (!s.isDel()) {
                          e = s;
                          break
                      }
                      n--
                  }
                  return e
              },
              active: function (e) {
                  f.active(this);
                  var t = this.sdkConv.active(e);
                  return setTimeout(function () {
                      if (this._handleMsgUpdateBindThis(),
                      this.isRedirectType && this.messages.length > 0) {
                          var e = this.messages[this.messages.length - 1].getId();
                          this.updateToRead(e, e)
                      }
                      !this.hasPullBanInfo && this.getBanWordsStatus() && (this.hasPullBanInfo = !0,
                      this.sdkConv.getDataFromServer(["banWordsType", "inBanWhite", "inBanBlack", "banWordsTime"])),
                      this.hasTryDecrypt === !1 && this.isSingleChat && u.hasJoinSafetyOrg().then(function (e) {
                          return this.hasTryDecrypt = !0,
                          e ? void this.sdkConv.pullSafetyInfo().then(function (e) {
                              this._tagHandle(),
                              this.updateSafetyAppBindThis().then(function () {
                                  this.messages.forEach(function (e) {
                                      e.decrypt()
                                  })
                              }
                              .bind(this))
                          }
                          .bind(this)) : Promise.resolve()
                      }
                      .bind(this))
                  }
                  .bind(this), 10),
                  t
              },
              deactive: function () {
                  return f.deactive(this),
                  this.messages = [],
                  this.sdkConv.deactive()
              },
              setUIVisibleStatus: function (e) {
                  return this.sdkConv.setUIVisibleStatus(e)
              },
              search: function (e) {
                  return this.sdkConv.search(e)
              },
              clearSearchResult: function () {
                  return this.sdkConv.clearSearchResult()
              },
              getIMSpaceKey: function (e) {
                  var t;
                  switch (e) {
                      case ContentType.SAFETY_NORMAL_VIDEO:
                      case ContentType.SAFETY_VIDEO:
                      case ContentType.SAFETY_IMG:
                          t = CSpaceKey.CONV_SPACE_NORMAL;
                          break;
                      case ContentType.SAFETY_AUDIO:
                          t = CSpaceKey.CONV_SPACE_HIDDEN;
                          break;
                      default:
                          t = CSpaceKey.NEW_CSPACE_ID_IM
                  }
                  return t
              },
              getIMSpaceIdByKey: function (e) {
                  var t = this
                    , i = _.get(t, "baseConversation.extension." + e);
                  if (i)
                      return Promise.resolve(String(i));
                  var n = CSpaceType[e];
                  return d.getConversationSpace(this.convId, n).result.then(function (i) {
                      return _.set(t, "baseConversation.extension." + e, String(i.body)),
                      Promise.resolve(String(i.body))
                  })
              },
              getIMSpaceId: function () {
                  var e = this
                    , t = _.get(e, "baseConversation.extension.newCSpaceIdIM");
                  if (t)
                      return Promise.resolve(String(t));
                  if (this.isSingleChat)
                      var i = e.convId;
                  else
                      var i = e.baseConversation.title;
                  return new Promise(function (t, n) {
                      o.generateCSpaceIdAndConsistent(null, e.convId, i, function (i) {
                          200 === i.code ? (t(String(i.body)),
                          _.set(e, "baseConversation.extension.newCSpaceIdIM", String(i.body))) : n(i)
                      })
                  }
                  )
              },
              getTitle: function (e) {
                  var t = this
                    , i = t.baseConversation;
                  if (i.title)
                      return void (e && e(i.title));
                  var n = function () {
                      e(i.title),
                      t.EventEmitter.removeListener(t.EVENTS.UPDATE_TITLE, n)
                  };
                  t.EventEmitter.addListener(t.EVENTS.UPDATE_TITLE, n)
              },
              saveDraft: function (e) {
                  var e = e || "";
                  e = e.trim(),
                  e ? (this.draft = e,
                  this.sdkConv.saveDraft(e),
                  this._setRemindType(RemindEnum.DRAFT)) : this.draft && (this.draft = null,
                  this.sdkConv.saveDraft(null),
                  this.remindType === RemindEnum.DRAFT && this._clearRemindType())
              },
              updateToRead: function (e, t) {
                  for (var i = this.messages.length, n = !1; i > 0;) {
                      i--;
                      var s = this.messages[i]
                        , a = s.getId();
                      if (a === t && (n = !0),
                      n !== !0 || s.needDecrypt() || s.isSafetyFile() || s.updateToRead(),
                      s.needDecrypt() && l.asyncAlarm(s.getId(), "会话里消息解密失败"),
                      a === e) {
                          n = !1;
                          break
                      }
                  }
              },
              pullHistory: function () {
                  return this.sdkConv.pullHistory()
              },
              _updateLastMsgInfo: function (e, t, i, n, s) {
                  e && e < this._lastMsgId || (this.updateTime = t,
                  this._lastMsgId = e,
                  (this.isSingleChat || this.isOAConv) && (i = null),
                  i ? this.lastMessageContent = s ? i + ": " + n : i + n : this.lastMessageContent = n,
                  WKim.syncSinglePackageActionMerge.registerAction("genLastMsg" + this.convId, function () {
                      this.EventEmitter.emit(this.EVENTS.LAST_MSG_REMIND_UPDATE)
                  }
                  .bind(this)))
              },
              getMembers: function (e) {
                  return this.sdkConv.getMembers().then(function (t) {
                      return e && e(t),
                      t
                  }
                  .bind(this)).catch(function (e) {
                      return Promise.reject(e)
                  })
              },
              inputTextHasChanged: function (e) {
                  return this.sdkConv.inputTextHasChanged(e)
              },
              _setRemindType: function (e) {
                  if (this.sdkConv.isActive)
                      return !1;
                  var t = RemindPriority.indexOf(e)
                    , i = RemindPriority.indexOf(this.remindType);
                  t >= i && (this.remindType = e,
                  this._genLastMsg(this._lastMsg),
                  this.sdkConv.setRemindType(e))
              },
              _clearRemindType: function () {
                  this.remindType = RemindEnum.EMPTY,
                  this._genLastMsg(this._lastMsg),
                  this.sdkConv.setRemindType(RemindEnum.EMPTY)
              },
              _handleLastMsgChange: function () {
                  this._genLastMsg(this._calLastMsg())
              },
              _getAuthor: function (e) {
                  return viewBridge.addHostListener(bridgeEvent.USER_UPDATE, e, this._handleLastMsgChangeBindThis),
                  viewBridge.addHostListener(bridgeEvent.GROUP_NICK_UPDATE, this.convId, this._handleLastMsgChangeBindThis),
                  v.getUsers([e]).then(function (e) {
                      if (e[0]) {
                          var t = e[0]
                            , i = this.getScene(MainScene.CHAT);
                          return userHelper.getName(t, this.convId, i, {
                              oid: this.orgId
                          }).then(function (e) {
                              return Promise.resolve(e)
                          }
                          .bind(this))
                      }
                      return Promise.resolve("")
                  }
                  .bind(this)).catch(function () {
                      return Promise.resolve("")
                  })
              },
              _genLastMsg: function (e) {
                  var i = this
                    , n = this._lastMsgIdIncre++;
                  if (this.getBanWordsStatus() ? this.remindType === RemindEnum.DRAFT && (this.remindType = RemindEnum.EMPTY) : this.draft && this.remindType === RemindEnum.DRAFT,
                  this.remindType === RemindEnum.DRAFT)
                      return void this._updateLastMsgInfo(n, new Date - 0, null, this.draft, !0);
                  if (!e)
                      return void this._updateLastMsgInfo(n, (new Date).getTime(), null, "", !0);
                  var s = e;
                  this._lastMsg && s.getId() === this._lastMsg.getId() || (this._lastMsg && this._lastMsg.removeListener(this._lastMsg.EventsName.RECALL_STATUS_CHANGE, this._handleLastMsgChangeBindThis),
                  this._lastMsg && this._lastMsg.removeListener(this._lastMsg.EventsName.DECRYPT_STATUS_CHANGE, this._handleLastMsgChangeBindThis),
                  this._lastMsg && this._lastMsg.removeListener(this._lastMsg.EventsName.DELETED_CHANGE, this._handleLastMsgChangeBindThis),
                  this._lastMsg = s,
                  s.addListener(s.EventsName.RECALL_STATUS_CHANGE, this._handleLastMsgChangeBindThis),
                  s.addListener(s.EventsName.DECRYPT_STATUS_CHANGE, this._handleLastMsgChangeBindThis),
                  s.addListener(s.EventsName.DELETED_CHANGE, this._handleLastMsgChangeBindThis)),
                  viewBridge.removeHostListener(bridgeEvent.GROUP_NICK_UPDATE, this.convId, this._handleLastMsgChangeBindThis),
                  this.lastMsgUid && viewBridge.removeHostListener(bridgeEvent.USER_UPDATE, this.lastMsgUid, this._handleLastMsgChangeBindThis),
                  this.lastMsgUid = _.get(s, "baseMessage.openIdEx.openId");
                  var i = this
                    , a = ""
                    , r = null
                    , o = !0;
                  if (e.isDel()) {
                      var d = this._calLastMsg();
                      if (!d)
                          return void i._updateLastMsgInfo(n, (new Date).getTime(), r, a);
                      e = d
                  }
                  if (1 === s.baseMessage.recallStatus)
                      s.isMySend() ? (a = "你撤回了一条消息",
                      i._updateLastMsgInfo(n, s.baseMessage.createdAt, r, a, o)) : (a = "撤回了一条消息",
                      i._getAuthor(this.lastMsgUid).then(function (e) {
                          i._updateLastMsgInfo(n, s.baseMessage.createdAt, e, a, o)
                      }));
                  else if (s && s.baseMessage && s.baseMessage.content) {
                      var h = s.getContent()
                        , p = h.contentType;
                      if (p === ContentType.TEXT)
                          a = h.textContent.text;
                      else if (p === ContentType.IMG || p === ContentType.SAFETY_IMG)
                          a = s.isEmotion() ? "[表情]" : "[图片]";
                      else if (p === ContentType.VOIP) {
                          var c = h.attachments[0].extension.duration;
                          a = 0 === parseInt(c) ? "[语音通话]未接通，点击重拨" : "[语音通话]通话时长 " + t("secondTohhmmss")(c)
                      } else if (p === ContentType.AUDIO || p === ContentType.SAFETY_AUDIO)
                          a = "[语音]";
                      else if (p === ContentType.FILE || p === ContentType.ORG_SPACE_FILE || p === ContentType.IM_SPACE_FILE || p === ContentType.SAFETY_IM_SPACE_FILE)
                          a = "[文件]";
                      else if (p === ContentType.SHARE)
                          a = "[分享]";
                      else if (p === ContentType.OA)
                          a = "[微应用消息]",
                          h.attachments.length && h.attachments[0].extension && h.attachments[0].extension.h_tl && (a = "[" + h.attachments[0].extension.h_tl + "]");
                      else if (p === ContentType.MAIL)
                          a = "[邮件]";
                      else if (p === ContentType.CARD)
                          a = "[名片]";
                      else if (p === ContentType.GROUP_ANNOUNCE)
                          a = _.get(h, "attachments[0].extension.text") || "";
                      else if ([ContentType.RED_ENVELOPE_RANDOM, ContentType.RED_ENVELOPE_NORMAL, ContentType.RED_ENVELOPE_SYSTEM, ContentType.RED_ENVELOPE_ALIPAY, ContentType.RED_ENVELOPE_FESTIVAL, ContentType.RED_ENVELOPE_MOMENT].indexOf(p) > -1)
                          a = "[红包]";
                      else if (p === ContentType.RED_ENVELOPE_MOMENT_NOTICE)
                          a = "[吉时红包通知]";
                      else if (p === ContentType.RED_ENVELOPE_ENTERPRISE) {
                          var u = [];
                          try {
                              u = _.get(h, "attachments[0].extension.receivers")
                          } catch (e) { }
                          u.indexOf(i.myuid) !== -1 ? (a = "给你发了红包",
                          o = !1) : a = _.get(h, "attachments[0].extension.congrats")
                      } else
                          a = p === ContentType.IMG_TEXT ? _.get(h, "attachments[0].extension.title") || "" : p === ContentType.ROBOT_MARKDOWN ? _.get(h, "attachments[0].extension.title") || "" : "";
                      if (s && s.needDecrypt())
                          if (l.asyncAlarm(s.getId(), "lastMsg解密失败"),
                          s.canBeDecrypt()) {
                              var g = !$my.getOrgByOid(_.get(s, "baseMessage.extension.oid"));
                              if (g)
                                  a = M.dt_message_decrypt_error_dismission;
                              else {
                                  var T = l.getStack(s.getId()) || {};
                                  a = !T.code || T.code !== AnHengResCode.DTMsgRetLocalKeyIsOnRequestButNotReturn && T.code !== AnHengResCode.DTMsgRetLocalKeyNoExists ? M.and_im_encrypt_decrypt_error_prefix : M.dt_message_decrypt_error_no_key
                              }
                          } else
                              a = M.pc_safety_upgrade_tips;
                      _.get(s, "baseMessage.openIdEx.openId") !== i.myuid && 1 === s.baseMessage.creatorType || p === ContentType.RED_ENVELOPE_ENTERPRISE ? i._getAuthor(this.lastMsgUid).then(function (e) {
                          i._updateLastMsgInfo(n, s.baseMessage.createdAt, e, a, o)
                      }) : i._updateLastMsgInfo(n, s.baseMessage.createdAt, r, a, o)
                  }
              },
              getOrgData: function () {
                  var e = _.get(this, "baseConversation.extension.id");
                  if (!e)
                      return localLog.error("getOrgData error no orgId"),
                      Promise.reject(new Error("no orgId"));
                  var t = $my.getOrgByOid(e);
                  return t ? Promise.resolve(t) : (localLog.error("getOrgData error, can not find org data"),
                  Promise.reject(new Error("can not find org data")))
              },
              getXpnTemplateId: function (e) {
                  if (this.isSafety) {
                      var t;
                      switch (e) {
                          case ContentType.TEXT:
                              t = this.isSingleChat ? XpnTemplateId.TEXT_SINGLE : XpnTemplateId.TEXT;
                              break;
                          case ContentType.SAFETY_IMG:
                              t = this.isSingleChat ? XpnTemplateId.SAFETY_IMG_SINGLE : XpnTemplateId.SAFETY_IMG;
                              break;
                          case ContentType.SAFETY_AUDIO:
                              t = this.isSingleChat ? XpnTemplateId.SAFETY_AUDIO_SINGLE : XpnTemplateId.SAFETY_AUDIO;
                              break;
                          case ContentType.SAFETY_VIDEO:
                              t = this.isSingleChat ? XpnTemplateId.SAFETY_VIDEO_SINGLE : XpnTemplateId.SAFETY_VIDEO;
                              break;
                          case ContentType.SAFETY_NORMAL_VIDEO:
                              t = this.isSingleChat ? XpnTemplateId.SAFETY_NORMAL_VIDEO_SINGLE : XpnTemplateId.SAFETY_NORMAL_VIDEO;
                              break;
                          case ContentType.SAFETY_IM_SPACE_FILE:
                              t = this.isSingleChat ? XpnTemplateId.SAFETY_IM_SPACE_SINGLE : XpnTemplateId.SAFETY_IM_SPACE
                      }
                      return t
                  }
              },
              sendTextMsg: function (e, t, i) {
                  f.sendMsg(this);
                  var t = t || {}
                    , i = i || {};
                  return this.safetyAppId && (i.extension || (i.extension = {}),
                  i.extension = _.assign(i.extension, {
                      safety_app_id: this.safetyAppId
                  }),
                  i.type = messageType.ENCRYPTED,
                  i.xpnModel || (i.xpnModel = {}),
                  i.xpnModel = _.assign(i.xpnModel, {
                      templateId: this.getXpnTemplateId(ContentType.TEXT)
                  })),
                  this.sdkConv.sendTextMsg(e, t.atOpenIds, i).catch(y.handleSendMsgError)
              },
              _sendImgMsg: function (e, t) {
                  return t ? this.sdkConv.sendImgMsgWithMediaId(t).catch(y.handleSendMsgError) : T.getExif(e).then(function (e) {
                      return this.sdkConv.sendImgMsg(e).catch(y.handleSendMsgError)
                  }
                  .bind(this))
              },
              sendImgMsg: function (e, t) {
                  return f.sendMsg(this),
                  this.isSafety && e && ua.isDesktop ? this.getOrgData().then(function (i) {
                      var n = _.get(i, "orgDetail.organizationSettingsModel.thirdPartyEncryptFileAudioImage") || !1;
                      if (n) {
                          var s = _.get(i, "orgDetail.organizationSettingsModel.thirdPartyEcryptPriority")
                            , a = 0;
                          return T.getExif(e).then(function () {
                              return a = e.orientation,
                              Promise.resolve(e)
                          }).then(function (e) {
                              return T.fileObjectToFile(e).then(function (e) {
                                  return T.getImgObj(e).then(function (t) {
                                      return this.sendCustomMsgByFile(e, ContentType.SAFETY_IMG, {
                                          extension: {
                                              path: e.path,
                                              p_width: String(t.width),
                                              p_height: String(t.height),
                                              orientation: String(a),
                                              appId: this.safetyAppId,
                                              oid: this.orgId,
                                              isEncrypt: safetyEncryptFileStatus.FALSE,
                                              priority: s ? SAFETY_PRIORITY.third : SAFETY_PRIORITY.dingTalk
                                          }
                                      })
                                  }
                                  .bind(this))
                              }
                              .bind(this))
                          }
                          .bind(this))
                      }
                      return this._sendImgMsg(e, t)
                  }
                  .bind(this)) : this._sendImgMsg(e, t)
              },
              sendSpaceFileMsg: function (e, t) {
                  return f.sendMsg(this),
                  e ? this.sendSpaceFileMsgByFile(e).catch(y.handleSendMsgError) : t ? this.sendSpaceFileBySpaceFileObj(t).catch(y.handleSendMsgError) : void 0
              },
              sendSpaceFileBySpaceFileObj: function (e, t) {
                  var t = t || {}
                    , i = e.name
                    , n = {
                        contentType: 1 === e.encrypt ? ContentType.SAFETY_IM_SPACE_FILE : ContentType.IM_SPACE_FILE,
                        attachments: [{
                            extension: {
                                f_name: i,
                                f_size: e.size + "",
                                f_type: fileTypes.getTypeByName(i),
                                path: e.path,
                                s_id: e.spaceId + "",
                                f_id: e.id,
                                cid: this.convId
                            },
                            isPreload: 0,
                            size: 0,
                            type: 0,
                            url: ""
                        }]
                    };
                  if (this.isCompanyGroup && this.baseConversation && this.baseConversation.extension && this.baseConversation.extension.id) {
                      var s = this.baseConversation.extension.id;
                      n.attachments[0].extension.oid = s + ""
                  }
                  _.assign(n, t.sendMsgModel),
                  _.assign(n.attachments[0].extension, t.extension);
                  var a = Promise.resolve();
                  return 1 === e.encrypt && (a = d.infoDentry({
                      spaceId: e.spaceId,
                      id: e.id
                  }).result.then(function (e) {
                      if (0 === e.body.resultCode) {
                          var t = _.get(e, "body.data.dentryModel.items[0].encryptDetail") || {};
                          return Promise.resolve(t)
                      }
                      return localLog.error("get CSpace infoDentry error", JSON.stringify(e.body)),
                      Promise.reject(new Error("get CSpace infoDentry error"))
                  })),
                  a.then(function (t) {
                      return t && (_.assign(n.attachments[0].extension, t),
                      _.assign(n.attachments[0].extension, {
                          isEncrypt: 1 === e.encrypt ? safetyEncryptFileStatus.TRUE : safetyEncryptFileStatus.FALSE
                      })),
                      this.sdkConv.sendCustomMsg(n, null, {
                          extension: {
                              source_from_type: msgSourceFromType.PC
                          }
                      }).catch(y.handleSendMsgError)
                  }
                  .bind(this))
              },
              sendCardMsg: function (e) {
                  var t = {
                      contentType: ContentType.CARD,
                      attachments: [{
                          extension: {
                              avatarMediaId: e.avatarMediaId,
                              name: e.nick || "",
                              phone: e.mobile + "",
                              type: e.type + "",
                              uid: e.uid + ""
                          },
                          isPreload: 0,
                          size: 0,
                          type: 0,
                          url: ""
                      }]
                  };
                  return this.sdkConv.sendCustomMsg(t, null, {
                      extension: {
                          source_from_type: msgSourceFromType.PC
                      }
                  }).catch(y.handleSendMsgError)
              },
              sendCustomMsgByFile: function (e, t, i) {
                  if (t === ContentType.SAFETY_IM_SPACE_FILE && e.size > limitConfig.SAEFTY_FILE_UPLOAD_LIMIT)
                      return void n.show("单个加密文件不能超过50M", {
                          type: "error"
                      });
                  if (t === ContentType.SAFETY_IMG && e.size > limitConfig.SAEFTY_IMAGE_UPLOAD_LIMIT)
                      return void n.show("单个加密文件不能超过30M", {
                          type: "error"
                      });
                  var i = i || {}
                    , s = []
                    , a = fileCache.cache(e)
                    , r = e.name
                    , o = {
                        contentType: t,
                        attachments: [{
                            extension: {
                                f_name: r,
                                f_size: e.size + "",
                                f_type: fileTypes.getTypeByName(r),
                                path: null,
                                s_id: null,
                                f_id: null,
                                cid: this.convId
                            },
                            isPreload: 0,
                            size: 0,
                            type: 0,
                            url: ""
                        }]
                    };
                  if (_.assign(o.attachments[0].extension, i.extension),
                  this.isCompanyGroup && this.baseConversation && this.baseConversation.extension && this.baseConversation.extension.id) {
                      var d = this.baseConversation.extension.id;
                      o.attachments[0].extension.oid = d + ""
                  }
                  var h = {
                      fileId: a,
                      dataURI: fileTypes.isImg(fileTypes.getTypeByName(r)) ? e.dataURI : null
                  }
                    , p = function (t, i, n) {
                        var a, d = !1, h = t.fileId;
                        if (!h)
                            throw new Error("file Id not exist");
                        var p = fileCache.get(h);
                        if (!p)
                            throw new Error("file not exist");
                        var c, u = function () {
                            d = !0,
                            a && (a.cancel(),
                            spaceUploadQueue.delete(a),
                            T.removeFiles(s))
                        }, l = this.getIMSpaceKey(o.contentType), v = this.getIMSpaceIdByKey(l).then(function (h) {
                            if (c = h,
                            d === !0) {
                                var u = new Error("user cancel upload");
                                return u.delete = !0,
                                Promise.reject(u)
                            }
                            var l = {}
                              , v = Promise.resolve(p);
                            if (msgContentTypeChecker.isSafetyFile(o.contentType)) {
                                var y = _.get(o, "attachments[0].extension") || {};
                                l.addArgs = {
                                    encryptDetail: {
                                        appId: y.appId,
                                        orgId: y.oid,
                                        priority: y.priority
                                    }
                                },
                                v = this.getOrgData().then(function (i) {
                                    var n = _.get(i, "orgDetail.corpId")
                                      , a = _.get(i, "orgDetail.organizationSettingsModel.thirdPartyEcryptPriority");
                                    if (e.path)
                                        var d = Promise.resolve(e);
                                    else
                                        var d = T.fileObjectToFile(e).then(function (e) {
                                            return s.push(e.path),
                                            o.attachments[0].extension.path = e.path,
                                            Promise.resolve(e)
                                        });
                                    return d.then(function (e) {
                                        return t.srcFile = e,
                                        E.encrypt(n, this.safetyAppId, a, e.path).then(function (e) {
                                            var t = new LocalFile(e.destPath, {
                                                name: r
                                            });
                                            return s = s.concat(e.tmpFiles),
                                            o.attachments[0].extension.isEncrypt = safetyEncryptFileStatus.TRUE,
                                            Promise.resolve(t)
                                        }).catch(function (e) {
                                            return m.alarm(m.Name.Safety, m.SubType.EncryptFail, "加密文件失败", {
                                                corpId: n,
                                                spaceId: h,
                                                error: e && e.error || e.toString(),
                                                code: e.code
                                            }),
                                            T.removeFiles(s),
                                            Promise.reject(e)
                                        })
                                    }
                                    .bind(this))
                                }
                                .bind(this))
                            }
                            return v.then(function (e) {
                                return a = new g(e, h, function (e) {
                                    i(e)
                                }
                                , l),
                                spaceUploadQueue.add(a, function () {
                                    n && n()
                                }),
                                a.result
                            })
                        }
                        .bind(this)).then(function (e) {
                            if (o.contentType === ContentType.SAFETY_IMG) {
                                var i = [c, e.data.id].join("_") + "." + fileTypes.getTypeByName(e.data.name);
                                return T.rename(t.srcFile.path, T.getImagePath(i)).then(function () {
                                    return Promise.resolve(e)
                                }).catch(function (t) {
                                    return localLog.error("file rename error", t, _.isObject(t) && JSON.stringify(t)),
                                    Promise.resolve(e)
                                })
                            }
                            return Promise.resolve(e)
                        }).then(function (e) {
                            return T.removeFiles(s).then(function () {
                                return Promise.resolve(e)
                            })
                        }).then(function (e) {
                            return _.assign(o.attachments[0].extension, {
                                f_name: e.data.name,
                                f_size: e.data.size + "",
                                f_type: fileTypes.getTypeByName(e.data.name),
                                path: e.data.path,
                                s_id: c + "",
                                f_id: e.data.id
                            }),
                            localLog.info("send custom msg ", o.attachments[0].extension.s_id, o.attachments[0].extension.f_id),
                            fileCache.delCache(h),
                            o
                        }).catch(function (e) {
                            return e.body && 1 == e.body.silent && (e.delete = !0),
                            Promise.reject(e)
                        });
                        return {
                            cancel: u,
                            result: v
                        }
                    }
                  .bind(this)
                    , c = Promise.resolve()
                    , i = {
                        extension: {
                            source_from_type: msgSourceFromType.PC
                        }
                    }
                    , u = this.getXpnTemplateId(t);
                  return u && (i.xpnModel = {
                      templateId: u
                  }),
                  c.then(function () {
                      return this.sdkConv.sendCustomMsg(o, h, i, p)
                  }
                  .bind(this))
              },
              sendSpaceFileMsgByFile: function (e) {
                  return this.isSafety && ua.isDesktop ? this.getOrgData().then(function (t) {
                      var i = _.get(t, "orgDetail.organizationSettingsModel.thirdPartyEncryptFileAudioImage") || !1;
                      if (i) {
                          var n = _.get(t, "orgDetail.organizationSettingsModel.thirdPartyEcryptPriority");
                          return this.sendCustomMsgByFile(e, ContentType.SAFETY_IM_SPACE_FILE, {
                              extension: {
                                  appId: this.safetyAppId,
                                  oid: this.orgId,
                                  isEncrypt: safetyEncryptFileStatus.FALSE,
                                  priority: n ? SAFETY_PRIORITY.third : SAFETY_PRIORITY.dingTalk
                              }
                          })
                      }
                      return this.sendCustomMsgByFile(e, ContentType.IM_SPACE_FILE)
                  }
                  .bind(this)) : this.sendCustomMsgByFile(e, ContentType.IM_SPACE_FILE)
              },
              destroy: function () {
                  this.messages = [],
                  this.removeListener()
              },
              getMsgById: function (e) {
                  for (var t = this.messages.length, i = null; t > 0;)
                      if (t--,
                      this.messages[t].getId() === e) {
                          i = this.messages[t];
                          break
                      }
                  return i
              },
              getMsgDataByMessageId: function (e) {
                  return this.sdkConv.getMsgDataByMid(e)
              },
              setTop: function (e) {
                  return this.sdkConv.setPin(e).then(function (e) {
                      return e
                  }).catch(function (e) {
                      console.error(e)
                  })
              },
              getMemberLimitState: function () {
                  return this.sdkConv.getMemberLimitState()
              },
              updateTitle: function (e) {
                  return v.getUsers([$my.uid]).then(function (e) {
                      if (e[0]) {
                          var t = e[0]
                            , i = this.convId
                            , n = this.getScene(MainScene.SYSTEM_MSG);
                          return userHelper.getName(t, i, n, {
                              oid: this.orgId
                          })
                      }
                      return Promise.resolve("")
                  }
                  .bind(this)).then(function (t) {
                      var i = t + ' 修改群名称为"' + e + '"';
                      return this.sdkConv.updateTitle(e, i)
                  }
                  .bind(this))
              },
              addMembers: function (e, t) {
                  var i = [];
                  return i.push(v.getUsers([$my.uid]).then(function (e) {
                      if (e[0]) {
                          var t = e[0]
                            , i = this.convId
                            , n = this.getScene(MainScene.SYSTEM_MSG);
                          return userHelper.getName(t, i, n, {
                              oid: this.orgId
                          })
                      }
                      return Promise.resolve("")
                  }
                  .bind(this))),
                  i.push(v.getUsers(e).then(function (e) {
                      var t = []
                        , i = [];
                      return e.forEach(function (e) {
                          t.push(e.userProfileModel.uid);
                          var n = this.convId
                            , s = this.getScene(MainScene.SYSTEM_MSG);
                          i.push(userHelper.getName(e, n, s, {
                              oid: this.orgId
                          }))
                      }
                      .bind(this)),
                      Promise.all(i).then(function (e) {
                          return {
                              uids: t,
                              nickName: e.join(",")
                          }
                      })
                  }
                  .bind(this))),
                  Promise.all(i).then(function (e) {
                      return this.sdkConv.addMembers(e[1].uids, e[0] + "把 " + e[1].nickName + " 加入群").then(function (e) {
                          return t && t(e),
                          e
                      })
                  }
                  .bind(this))
              },
              removeMembers: function (e, t, i) {
                  var n = [];
                  return n.push(v.getUsers([$my.uid]).then(function (e) {
                      if (e[0]) {
                          var t = e[0]
                            , i = this.convId
                            , n = this.getScene(MainScene.SYSTEM_MSG);
                          return userHelper.getName(t, i, n, {
                              oid: this.orgId
                          })
                      }
                      return Promise.resolve("")
                  }
                  .bind(this))),
                  n.push(v.getUsers(e).then(function (e) {
                      var t = []
                        , i = [];
                      return e.forEach(function (e) {
                          t.push(e.userProfileModel.uid);
                          var n = this.convId
                            , s = this.getScene(MainScene.SYSTEM_MSG);
                          i.push(userHelper.getName(e, n, s, {
                              oid: this.orgId
                          }))
                      }
                      .bind(this)),
                      Promise.all(i).then(function (e) {
                          return {
                              uids: t,
                              nickName: e.join(",")
                          }
                      })
                  }
                  .bind(this))),
                  Promise.all(n).then(function (i) {
                      var n = i[1].nickName + " 被管理员 " + i[0] + " 移出群";
                      return this.sdkConv.removeMembers(e, t, n)
                  }
                  .bind(this))
              },
              quit: function () {
                  return v.getUsers([$my.uid]).then(function (e) {
                      if (e[0]) {
                          var t = e[0]
                            , i = this.convId
                            , n = this.getScene(MainScene.SYSTEM_MSG);
                          return userHelper.getName(t, i, n, {
                              oid: this.orgId
                          })
                      }
                      return Promise.resolve("")
                  }
                  .bind(this)).then(function (e) {
                      var t = e + " 退出群聊";
                      return this.sdkConv.quitSilent(!0, t)
                  }
                  .bind(this))
              },
              updateOwner: function (e, t) {
                  var i = "你已被" + t + "设置为该群群主";
                  return this.sdkConv.updateOwner(e, i)
              },
              disband: function () {
                  return this.sdkConv.disband()
              },
              setNotificationOff: function (e) {
                  return this.sdkConv.updateNotificationOffStatus(e)
              },
              updateShowHistoryType: function (e) {
                  return this.sdkConv.updateShowHistoryType(e)
              },
              setGroupValidationType: function (e) {
                  return this.sdkConv.updateGroupValidationType(e).catch(function (e) {
                      n.show("设置群主审核失败", {
                          type: "error"
                      })
                  })
              },
              updateAuthority: function (e) {
                  return this.sdkConv.updateAuthority(e).catch(function (e) {
                      n.show("设置仅群主可管理失败", {
                          type: "error"
                      })
                  })
              },
              clearMsg: function (e) {
                  return this.sdkConv.clearMsg().then(function () {
                      e && e()
                  }).catch(function () {
                      n.show("清空会话聊天失败", {
                          type: "error"
                      })
                  })
              },
              clearNewMsg: function () {
                  return this.sdkConv.clearUnReadPoint(!0)
              },
              convertToOrgGroup: function (e, t, i) {
                  var s = this
                    , a = _.assign({}, this.baseConversation.extension)
                    , o = this.baseConversation.tag
                    , t = _.assign({}, this.baseConversation.extension, t);
                  this.sdkConv.receiveConvChange({
                      extension: t,
                      tag: ConvType.COMPANY_GROUP
                  }),
                  r.convertToOrgGroup(s.convId, e).result.catch(function (e) {
                      return n.show(e.body.reason || "设置失败", {
                          type: "error"
                      }),
                      this.sdkConv.receiveConvChange({
                          extension: a,
                          tag: o
                      }),
                      Promise.reject(e)
                  }
                  .bind(this))
              },
              copySpaceFileObj: function (e) {
                  var t = null
                    , i = e.baseMessage.content.contentType
                    , s = this.getIMSpaceKey(i)
                    , a = _.get(e, "baseMessage.content.attachments[0].extension") || {};
                  return this.getIMSpaceIdByKey(s).then(function (i) {
                      var n = {}
                        , s = _.get(e, "baseMessage.content.attachments[0].extension.s_id")
                        , a = _.get(e, "baseMessage.content.attachments[0].extension.f_id");
                      return t = i,
                      n.handle = {
                          type: 0
                      },
                      n.transferType = 0,
                      n.sourceSpaceId = s,
                      n.sourceIds = [a],
                      n.targetSpaceId = Number(i),
                      n.targetFolderId = "0",
                      n.targetFolderPath = null,
                      n
                  }).then(function (e) {
                      return d.transferDentry(e).result.then(function (e) {
                          if (200 === e.code && 0 === e.body.resultCode) {
                              var i = _.get(e.body.data.transferModel, "transferredItems")[0];
                              return i.spaceId = t,
                              Promise.resolve(i)
                          }
                          13020005 === e.body.resultCode ? n.show("企业内文件暂不支持发送给企业外人员", {
                              type: "error"
                          }) : 13026e3 === e.body.resultCode ? n.show("空间容量不足", {
                              type: "error"
                          }) : 13023e3 === e.body.resultCode ? n.show("文件已被删除", {
                              type: "error"
                          }) : n.show("未知错误", {
                              type: "error"
                          })
                      })
                  }).then(function (e) {
                      return this.sendSpaceFileBySpaceFileObj(e, {
                          extension: {
                              p_width: a.p_width,
                              p_height: a.p_height,
                              orientation: a.orientation
                          },
                          sendMsgModel: {
                              contentType: i
                          }
                      })
                  }
                  .bind(this))
              },
              acceptForwardMsg: function (e) {
                  if (!e.canBeForward())
                      return Promise.reject(new Error("该消息类型不支持转发"));
                  if (1 === e.baseMessage.recallStatus)
                      return Promise.reject(new Error("该消息已被撤回，不能被转发"));
                  var t = e.baseMessage.content.contentType;
                  switch (t) {
                      case ContentType.TEXT:
                          var i = e.getContent().textContent.text
                            , n = _.get(e, "baseMessage.extension")
                            , s = {};
                          return n && Object.keys(n).forEach(function (e) {
                              FORWARD_MSG_EXTENSION_WHITELIST.indexOf(e) > -1 && (s[e] = n[e])
                          }),
                          this.sendTextMsg(i, null, {
                              extension: s
                          });
                      case ContentType.IM_SPACE_FILE:
                      case ContentType.ORG_SPACE_FILE:
                      case ContentType.SAFETY_IMG:
                      case ContentType.SAFETY_AUDIO:
                      case ContentType.SAFETY_VIDEO:
                      case ContentType.SAFETY_NORMAL_VIDEO:
                      case ContentType.SAFETY_IM_SPACE_FILE:
                          return this.copySpaceFileObj(e);
                      default:
                          return this.sdkConv.acceptForwardMsg(e.sdkMsg).catch(y.handleSendMsgError)
                  }
              },
              getScene: function (e) {
                  var t = e + "_";
                  return t += this.isSingleChat ? "SINGLE" : this.orgId && this.isCompanyGroup ? this.isGroupShowRealName ? "GROUP_ENTERPRISE_ONLY_REAL_NAME" : "GROUP_ENTERPRISE" : "GROUP_NORMAL",
                  NAME_SCENE[t]
              },
              getIconOption: function () {
                  return this.sdkConv.getIconOption()
              },
              getFocusMessageId: function () {
                  return this.sdkConv.focusMessageId
              },
              getNextImgMsg: function (e) {
                  var t = this._getIndexImgMsg(e)
                    , i = null;
                  if (t !== -1)
                      for (var n = t + 1; n < this.messages.length; n++) {
                          var s = this.messages[n];
                          if (_.get(s, "baseMessage.content.contentType") === ContentType.IMG && !msgContentTypeChecker.isEmotionImage(s) && msgContentTypeChecker.hasImageMediaId(s) && s.isDisplay()) {
                              i = s;
                              break
                          }
                      }
                  return i
              },
              getPreImgMsg: function (e) {
                  var t = this._getIndexImgMsg(e)
                    , i = null;
                  if (t !== -1)
                      for (var n = t - 1; n >= 0; n--) {
                          var s = this.messages[n];
                          if (_.get(s, "baseMessage.content.contentType") === ContentType.IMG && !msgContentTypeChecker.isEmotionImage(s) && msgContentTypeChecker.hasImageMediaId(s) && s.isDisplay()) {
                              i = s;
                              break
                          }
                      }
                  return i
              },
              _getIndexImgMsg: function (e) {
                  var e = e + "";
                  if (!isNaN(e))
                      return this.messages.map(function (e) {
                          return e.getId()
                      }).indexOf(e)
              },
              _toastError: function (e) {
                  n.show(e, {
                      type: "error"
                  })
              }
          });
        return A
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../directive/widget/avatar/avatarType": 153,
        "../../filter/secondTohhmmss": 204,
        "../../lib/class": 206,
        "../../service/bridge/bridgeEvent": 278,
        "../../service/bridge/serviceBridge.js": 279,
        "../../service/bridge/viewBridge": 280,
        "../../service/error/conversationError": 393,
        "../../service/file/LocalFile": 396,
        "../../service/log/imLog": 439,
        "../../service/log/imLogType": 440,
        "../../service/log/lwlog": 444,
        "../../service/user/MainScene": 698,
        "../../service/user/NameScene": 699,
        "../../service/user/userHelper": 710,
        "../api/SpaceUpload": 249,
        "../api/spaceUploadQueue": 251,
        "../app/nw": 264,
        "../app/nwWindow": 266,
        "../audio": 276,
        "../email/emailNotify": 380,
        "../events": 394,
        "../file/fileHelper": 397,
        "../groupSupportType/groupSupportType": 423,
        "../limitConfig": 434,
        "../log/localLog": 441,
        "../microApp/microAppData": 457,
        "../notification": 509,
        "../safety/anHengResCode": 569,
        "../safety/fileEncryptor": 574,
        "../safety/safetyEncryptFileStatus": 577,
        "../safety/safetyLog": 582,
        "../safety/safetyPriority": 583,
        "../storage/ddStorage": 674,
        "../toast/toast": 682,
        "../ua": 690,
        "../user/UserType": 701,
        "../user/my": 704,
        "../user/userManager.js": 711,
        "../widget/emailOpenService": 731,
        "./CSpaceKey": 299,
        "./CSpaceType": 300,
        "./ContentType": 301,
        "./ConvType": 302,
        "./ErrorText": 304,
        "./MsgType": 308,
        "./RemindEnum": 309,
        "./SuperGroupStatus": 312,
        "./baseMsgTag": 313,
        "./convExtensionType": 314,
        "./msg/MsgWithSDK": 322,
        "./msg/fileCache": 323,
        "./msgContentTypeChecker": 326,
        "./msgInstanceHelper": 327,
        "./msgSourceFromType": 328,
        "./xpnTemplateId": 330,
        "@ali/ding-api": 781,
        "@ali/ding-filetypes": 784,
        "@ali/wksdk": 869,
        "i18next": 1036,
        "lodash": 1057,
        "wolfy87-eventemitter": 1083
    }]