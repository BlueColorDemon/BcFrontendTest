[function (require, module, exports) {
    "use strict";
    var Conv = require("./conv")
      , IDL = require("../idl/idl")
      , IDLConversation = IDL.interface.IDLConversation
      , _ = require("lodash")
      , Config = require("../config/config")
      , InitConvListSize = Config.get("initConvListSize")
      , EventEmitter = require("wolfy87-eventemitter")
      , conversationStatus = require("./conversationStatus")
      , conversationEventCenter = require("./conversationEventCenter")
      , conversationType = require("./conversationType")
      , getConversationFromServer = require("./getConversationFromServer")
      , sendMsgBuilder = require("../message/sendMsgBuilder")
      , msgContentType = require("../message/msgContentType")
      , msgCreatorType = require("../message/msgCreatorType")
      , msgType = require("../message/msgType")
      , decryptType = require("../safety/decryptType")
      , Class = require("../class/class")
      , conversationDbEntryService = require("../dbEntry/conversationDbEntryService")
      , afterAuthInit = require("../init/afterAuthInit")
      , mainWS = require("../io/mainWS")
      , syncProtocolStatus = require("../syncProtocolStatus/syncProtocolStatus")
      , decryptMsg = require("../safety/decryptMsg")
      , baseMsgTag = require("../message/baseMsgTag")
      , localLog = Config.get("log")
      , ConversationService = Class.create({
          initialize: function () {
              this.emitter = new EventEmitter,
              this.EventsName = {
                  CONV_LIST_UPDATE: "conv_list_update",
                  HIDE_CONV: "hide_conv"
              },
              this.convCache = {},
              this.convList = {
                  order: [],
                  pinOrder: []
              },
              this.conversationDbEntry = null,
              this.init(),
              this.afterAuthInit(),
              this._getDataFromLocalDBPromiseHandler = {
                  _resolve: function () { },
                  _reject: function () { }
              },
              this._getDataFromLocalDBPromise = new Promise(function (e, t) {
                  this._getDataFromLocalDBPromiseHandler._resolve = e,
                  this._getDataFromLocalDBPromiseHandler._reject = t
              }
              .bind(this))
          },
          init: function () {
              conversationEventCenter.addListener(conversationEventCenter.EventsName.MAKE_CONV_TO_TOP, function (e) {
                  var t = e.cid
                    , n = e.isPin
                    , i = this.convList.pinOrder.indexOf(t);
                  i > -1 && this.convList.pinOrder.splice(i, 1);
                  var r = this.convList.order.indexOf(t);
                  r > -1 && this.convList.order.splice(r, 1),
                  n ? this.convList.pinOrder.unshift(t) : this.convList.order.unshift(t),
                  this.emitListUpdateEvent(),
                  localLog.info("receive make conv to top event", JSON.stringify(e))
              }
              .bind(this)),
              conversationEventCenter.addListener(conversationEventCenter.EventsName.HIDE_CONV, function (e) {
                  this.handleHideConv(e.cid),
                  localLog.info("receive delete conv event", JSON.stringify(e))
              }
              .bind(this)),
              conversationEventCenter.addListener(conversationEventCenter.EventsName.MSG_CONTENT_CHANGE, function (e) {
                  var t = _.get(e, "baseMessage.conversationId");
                  t && this.getConvByCid(t, !0).then(function (t) {
                      t.updateMsgToDb(e)
                  })
              }
              .bind(this)),
              conversationEventCenter.addListener(conversationEventCenter.EventsName.DELETE_MSG, function (e) {
                  try {
                      var t = this.getConvByCidSync(e.cid);
                      t.deleteMsgById(e.messageId)
                  } catch (e) {
                      localLog.error("delete msg error", e)
                  }
                  localLog.info("receive delete msg event", JSON.stringify(e))
              }
              .bind(this)),
              conversationEventCenter.addListener(conversationEventCenter.EventsName.REMOVE_MSG, function (e) {
                  try {
                      var t = this.getConvByCidSync(e.cid);
                      t.receiveMsgChange({
                          deleted: !0,
                          messageId: e.messageId
                      })
                  } catch (e) {
                      localLog.error("remove msg error", e)
                  }
                  localLog.info("receive remove msg event", JSON.stringify(e))
              }
              .bind(this)),
              mainWS.addListener(mainWS.EventsName.WS_STATE_CHANGE, function (e) {
                  e === mainWS.WSState.SUBSCRIBED && syncProtocolStatus.status === syncProtocolStatus.STATUS.CLOSED && (localLog.info("pull conv list from server by mainWS status change, syncProtocolStatus is", syncProtocolStatus.status),
                  this.pullConvListFromServer())
              }
              .bind(this)),
              syncProtocolStatus.addListener(syncProtocolStatus.EventsName.STATUS_CHANGE, function () {
                  syncProtocolStatus.status === syncProtocolStatus.STATUS.CLOSED && (console.log("pull conv list from server by protocol status change"),
                  this.pullConvListFromServer())
              }
              .bind(this))
          },
          pullConvListFromServer: function () {
              var e = require("../config/config").get("dbCollection");
              if (e && e.TableEntry && e.TableEntry.eraseTables)
                  var t = e.TableEntry.eraseTables();
              else
                  var t = Promise.resolve();
              return this.getInitConvListFromServer().then(function (e) {
                  return Object.keys(this.convCache).forEach(function (e) {
                      var t = this.convCache[e];
                      t && t._clearSendedMsg()
                  }
                  .bind(this)),
                  t.then(function () {
                      return this._storeToDb(e).then(function () {
                          return this._handleInitConvList(e)
                      }
                      .bind(this))
                  }
                  .bind(this))
              }
              .bind(this)).catch(function (e) {
                  throw localLog.error("get conversation list from server fail", e),
                  e
              })
          },
          afterAuthInit: function () {
              afterAuthInit.register("conversationService", function () {
                  var e = conversationDbEntryService.getConversationEntry();
                  e ? (this.conversationDbEntry = new e,
                  this.conversationDbEntry.listNewest(1e3).then(function (e) {
                      return localLog.info("get conversation list from local db success", JSON.stringify(e.map(function (e) {
                          return e.baseConversation.conversationId
                      }))),
                      Promise.all(e.map(function (e) {
                          return this.tryDecryptConvData(e)
                      }
                      .bind(this)))
                  }
                  .bind(this)).then(this._handleInitConvList.bind(this)).then(function (e) {
                      return this._getDataFromLocalDBPromiseHandler._resolve(),
                      e
                  }
                  .bind(this)).catch(function (e) {
                      this._getDataFromLocalDBPromiseHandler._resolve(),
                      localLog.error("get conversation list from local DB fail", e)
                  }
                  .bind(this))) : this._getDataFromLocalDBPromiseHandler._resolve()
              }
              .bind(this))
          },
          _storeToDb: function (e) {
              return this.conversationDbEntry ? this.conversationDbEntry.multiInsertwkConversation(e).then(function (t) {
                  return localLog.info("write conversation to local DB success", JSON.stringify(e.map(function (e) {
                      return e.baseConversation.conversationId
                  }))),
                  t
              }).catch(function (e) {
                  return localLog.error("write conversation to local DB fail", e),
                  Promise.reject(e)
              }) : Promise.resolve()
          },
          getConvInstance: function (e) {
              var t = _.get(e, "baseConversation.conversationId");
              if (this.convCache[t])
                  return this.convCache[t].updateConvFromConvData(e),
                  this.convCache[t];
              var n = new Conv(e, this.conversationDbEntry);
              return this.convCache[t] = n,
              n
          },
          convIsSupportByCid: function (e) {
              var t = !0;
              if (e.indexOf(":") !== -1) {
                  var n = e.split(":");
                  parseInt(n[0]) > parseInt(n[1]) && (t = !1)
              }
              return t
          },
          convIsSupport: function (e) {
              var t = _.get(e, "baseConversation.conversationId")
                , n = this.convIsSupportByCid(t);
              return n
          },
          getUpdateTime: function (e) {
              var t = _.get(e, "_local.lastModify");
              if (t) {
                  if (_.get(e, "lastMessages[0].baseMessage.type") !== msgType.SILENCE && _.get(e, "lastMessages[0].baseMessage.tag") !== baseMsgTag.SILENCE)
                      return t;
                  if (_.get(e, "lastMessages[0].baseMessage.createdAt") !== t)
                      return t
              }
              return e.lastMessage && e.lastMessage.baseMessage && e.lastMessage.baseMessage.type !== msgType.SILENCE && e.lastMessage.baseMessage.tag !== baseMsgTag.SILENCE ? e.lastMessage.baseMessage.createdAt : e.lastMessages && e.lastMessages.length > 0 && e.lastMessages[0].baseMessage.type !== msgType.SILENCE && e.lastMessages[0].baseMessage.tag !== baseMsgTag.SILENCE ? e.lastMessages[0].baseMessage.createdAt : e.baseConversation.createAt || 0
          },
          getInitConvListFromServer: function () {
              return IDLConversation.listNewest(1e3).result.then(function (e) {
                  return e.body && Array.isArray(e.body) ? (localLog.info("get conversation list from server success", JSON.stringify(e.body.map(function (e) {
                      return e.baseConversation.conversationId
                  }))),
                  Promise.all(e.body.map(function (e) {
                      return this.tryDecryptConvData(e)
                  }
                  .bind(this))).then(function (e) {
                      return e.map(function (e) {
                          return e._local = {},
                          e._local.lastModify = this.getUpdateTime(e),
                          e
                      }
                      .bind(this))
                  }
                  .bind(this))) : []
              }
              .bind(this))
          },
          _handleInitConvList: function (e) {
              this.convList.pinOrder = [],
              this.convList.order = [],
              e.sort(function (e, t) {
                  return this.getUpdateTime(t) - this.getUpdateTime(e)
              }
              .bind(this)),
              e.forEach(function (e) {
                  if (this.convIsSupport(e)) {
                      var t = this.getConvInstance(e);
                      t.isVisible() && (t.baseConversation.sort > 0 ? this.convList.pinOrder.push(t.cid) : this.convList.order.push(t.cid))
                  }
              }
              .bind(this)),
              this.convList.order = this.convList.order.slice(0, InitConvListSize - this.convList.pinOrder.length),
              this.emitListUpdateEvent()
          },
          emitListUpdateEvent: function () {
              var e = {
                  order: [].concat(this.convList.order),
                  pinOrder: [].concat(this.convList.pinOrder)
              };
              this.emitter.emit(this.EventsName.CONV_LIST_UPDATE, e)
          },
          emitHideConvEvent: function (e) {
              this.emitter.emit(this.EventsName.HIDE_CONV, e)
          },
          getConvByCidSync: function (e) {
              if (this.convCache[e])
                  return this.convCache[e];
              throw new Error("conversation not exist at local: " + e)
          },
          tryDecryptConvData: function (e) {
              var t = e.lastMessages || [];
              return Promise.all(t.map(function (t) {
                  var n = _.get(t, "baseMessage.extension.oid") || _.get(e, "baseConversation.extension.id");
                  return n ? (t.baseMessage.extension = _.assign(t.baseMessage.extension || {}, {
                      oid: n
                  }),
                  decryptMsg.decryptMsg(t).then(function (e) {
                      return Promise.resolve(e)
                  }).catch(function (e) {
                      return Promise.resolve(t)
                  })) : Promise.resolve(t)
              })).then(function (t) {
                  return e.lastMessages = t,
                  Promise.resolve(e)
              })
          },
          getConvByCid: function (e, t) {
              return this.convIsSupportByCid(e) ? this._getDataFromLocalDBPromise.then(function () {
                  return this.convCache[e] ? this.convCache[e] : (localLog.info("get conv by cid, not hit cache, get conversation from server", e),
                  getConversationFromServer.getById(e).then(function (t) {
                      var n = Promise.resolve();
                      if (t.body && t.body.baseConversation) {
                          var i = t.body;
                          n = this.tryDecryptConvData(i)
                      } else {
                          if (e.indexOf(":") === -1)
                              return localLog.error("cid is not exist in server , and is not a single chat", e),
                              Promise.reject(new Error("cid not exist in server"));
                          var i = {
                              baseConversation: {
                                  conversationId: e,
                                  type: conversationType.SINGLE,
                                  memberCount: 2,
                                  title: "",
                                  icon: "",
                                  createAt: new Date - 0
                              },
                              lastMessages: []
                          };
                          localLog.info("the cid is a single chat , and not exist in server yet", e),
                          n = Promise.resolve(i)
                      }
                      return n.then(function (t) {
                          if (this.convCache[e])
                              return this.convCache[e];
                          this._storeToDb([t]);
                          var n = this.getConvInstance(t);
                          return n
                      }
                      .bind(this))
                  }
                  .bind(this)))
              }
              .bind(this)).then(function (e) {
                  return t || e.isDiscard() || this.convList.pinOrder.indexOf(e.cid) !== -1 || this.convList.order.indexOf(e.cid) !== -1 || (e.show(),
                  conversationEventCenter.emit(conversationEventCenter.EventsName.MAKE_CONV_TO_TOP, {
                      cid: e.cid,
                      isPin: e.isPin
                  })),
                  e
              }
              .bind(this)) : Promise.reject(new Error("conversation not support"))
          },
          makeConvTopByCid: function (e) {
              return this.getConvByCid(e).then(function (t) {
                  conversationEventCenter.emit(conversationEventCenter.EventsName.MAKE_CONV_TO_TOP, {
                      cid: e,
                      isPin: t.isPin
                  })
              })
          },
          handleHideConv: function (e) {
              if (this.convCache[e]) {
                  var t = this.convCache[e];
                  if (t.isPin) {
                      var n = this.convList.pinOrder.indexOf(t.cid);
                      n > -1 && this.convList.pinOrder.splice(n, 1)
                  } else {
                      var n = this.convList.order.indexOf(t.cid);
                      n > -1 && this.convList.order.splice(n, 1)
                  }
                  localLog.info("hide conv", e),
                  this.emitListUpdateEvent()
              }
              return Promise.resolve({
                  result: !0
              })
          },
          hideConv: function (e) {
              try {
                  var t = this.getConvByCidSync(e);
                  return t.hide().then(function () {
                      this.emitHideConvEvent(e)
                  }
                  .bind(this))
              } catch (e) {
                  return localLog.error("try hide conv, but conv not exist", e),
                  Promise.resolve(!0)
              }
          },
          getConvList: function () {
              return this.convList
          },
          receiveMsg: function (e) {
              var t = _.get(e, "baseMessage.conversationId")
                , n = _.get(e, "baseMessage.type") === msgType.SILENCE || _.get(e, "baseMessage.tag") === baseMsgTag.SILENCE;
              return this.getConvByCid(t, n).then(function (t) {
                  return t.receiveMsg(e)
              })
          },
          receiveConvPChange: function (e) {
              var t = _.get(e, "conversationId");
              return this._getDataFromLocalDBPromise.then(function () {
                  return this.getConvByCidSync(t)
              }
              .bind(this)).then(function (t) {
                  return t.receivePersonalChange(e)
              }).catch(function (e) {
                  return localLog.error("receive personal change error", e),
                  !0
              })
          },
          receiveConvChange: function (e) {
              var t = _.get(e, "conversationId");
              return this._getDataFromLocalDBPromise.then(function () {
                  return this.getConvByCidSync(t)
              }
              .bind(this)).then(function (t) {
                  return t.receiveConvChange(e)
              }, function (e) {
                  return localLog.info("receiveConvChange but not exist at local", t),
                  !0
              }).catch(function (e) {
                  return localLog.error("receiveConvChange error", e),
                  !0
              })
          },
          clearMsgByCid: function (e, t) {
              return this._getDataFromLocalDBPromise.then(function () {
                  return this.getConvByCidSync(e)
              }
              .bind(this)).then(function (e) {
                  return e.handleClearMsg(t)
              }).catch(function () {
                  return !0
              })
          },
          receiveMsgChange: function (e) {
              var t = _.get(e, "conversationId");
              return this._getDataFromLocalDBPromise.then(function () {
                  return this.getConvByCidSync(t)
              }
              .bind(this)).then(function (t) {
                  return t.receiveMsgChange(e)
              }).catch(function (e) {
                  return localLog.error("receive msg change error", e),
                  !0
              })
          },
          createConversation: function (e, t) {
              var n = sendMsgBuilder.buildMsg(null, {
                  contentType: msgContentType.TEXT,
                  textContent: {
                      text: t
                  }
              }, {
                  creatorType: msgCreatorType.SYSTEM
              });
              return localLog.info("create conversation", JSON.stringify(e), t),
              IDLConversation.create(e, n).result.then(function (e) {
                  return e.body
              }).catch(function (e) {
                  return localLog.error("create conversation fail", e),
                  Promise.reject(e)
              })
          },
          receiveTyping: function (e) {
              return Promise.resolve().then(function () {
                  return Promise.all(e.typingModels.map(function (e) {
                      var t = e.conversationId;
                      return Promise.resolve().then(function () {
                          return this.getConvByCidSync(t)
                      }
                      .bind(this)).then(function (t) {
                          return t.receiveTyping(e)
                      }).catch(function () {
                          return !0
                      })
                  }
                  .bind(this)))
              }
              .bind(this))
          },
          listAllGroup: function (e, t) {
              return IDLConversation.listAllGroup(e, t).result
          }
      });
    module.exports = new ConversationService;
}
    , {
        "../class/class": 873,
        "../config/config": 877,
        "../dbEntry/conversationDbEntryService": 900,
        "../idl/idl": 914,
        "../init/afterAuthInit": 915,
        "../io/mainWS": 920,
        "../message/baseMsgTag": 931,
        "../message/msgContentType": 936,
        "../message/msgCreatorType": 937,
        "../message/msgType": 940,
        "../message/sendMsgBuilder": 943,
        "../safety/decryptMsg": 948,
        "../safety/decryptType": 949,
        "../syncProtocolStatus/syncProtocolStatus": 961,
        "./conv": 880,
        "./conversationEventCenter": 881,
        "./conversationStatus": 884,
        "./conversationType": 885,
        "./getConversationFromServer": 886,
        "lodash": 1057,
        "wolfy87-eventemitter": 1083
    }]