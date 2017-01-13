[function (require, module, exports) {
    "use strict";
    var _ = require("lodash")
      , messageTableDef = require("./messageTableDef")
      , indexDefs = messageTableDef.indexDefs
      , tableDef = messageTableDef.tableDef
      , colsEnums = messageTableDef.colsEnums
      , MessageEntry = null
      , indexEnums = messageTableDef.indexEnums
      , Config = require("../config/config")
      , localLog = Config.get("log")
      , md5 = require("md5")
      , MSG_DELETE_STATUS = require("../message/msgDelStatus")
      , initMessageEntry = function (e) {
          var s = e.TableEntry;
          MessageEntry = s.extend({
              initialize: function (e) {
                  this.conversationId = e,
                  MessageEntry.superclass.initialize.call(this),
                  this._genName(),
                  this._customIndexDef(),
                  this._initTable()
              },
              _genName: function () {
                  var e = md5(this.conversationId);
                  this.tableName = "ddmsg_" + e
              },
              _customIndexDef: function () {
                  this.indexDefs = [{
                      name: "index_" + this.tableName + "_messageId",
                      colName: colsEnums.MESSAGE_ID,
                      isUnique: !0
                  }, {
                      name: "index_" + this.tableName + "_createdId",
                      colName: colsEnums.CREATED_AT
                  }]
              },
              _defineTable: function () {
                  this.tableDef = tableDef,
                  this.colsDefs = this.tableDef.map(function (e) {
                      return e.name + " " + e.constraint
                  }),
                  this.cols = this.tableDef.map(function (e) {
                      return e.name
                  }),
                  this.indexDefs = indexDefs
              },
              _defineSerializationMap: function () {
                  this.serializeMap = {},
                  this.serializeMap[colsEnums.CONVERSATION_ID] = "baseMessage.conversationId",
                  this.serializeMap[colsEnums.MESSAGE_ID] = "baseMessage.messageId",
                  this.serializeMap[colsEnums.SENDER_ID] = "baseMessage.openIdEx.openId",
                  this.serializeMap[colsEnums.TYPE] = "baseMessage.type",
                  this.serializeMap[colsEnums.CREATOR_TYPE] = "baseMessage.creatorType",
                  this.serializeMap[colsEnums.CREATED_AT] = "baseMessage.createdAt",
                  this.serializeMap[colsEnums.READ_STATUS] = "receiverMessageStatus.readStatus",
                  this.serializeMap[colsEnums.UNREAD_COUNT] = "senderMessageStatus.unReadCount",
                  this.serializeMap[colsEnums.TOTAL_COUNT] = "senderMessageStatus.totalCount",
                  this.serializeMap[colsEnums.CONTENT_TYPE] = "baseMessage.content.contentType",
                  this.serializeMap[colsEnums.CONTENT] = "baseMessage.content",
                  this.serializeMap[colsEnums.TAG] = "baseMessage.tag",
                  this.serializeMap[colsEnums.EXTENSION] = "baseMessage.extension",
                  this.serializeMap[colsEnums.MEMBER_TAG] = "baseMessage.memberTag",
                  this.serializeMap[colsEnums.MEMBER_EXTENSION] = "baseMessage.memberExtension",
                  this.serializeMap[colsEnums.RECALL_STATUS] = "baseMessage.recallStatus",
                  this.serializeMap[colsEnums.SENDER_TAG] = "baseMessage.openIdEx.tag",
                  this.serializeMap[colsEnums.LOCAL_ID] = "_local.localId",
                  this.serializeMap[colsEnums.IS_DEL] = "_local.isDel",
                  this.serializeMap[colsEnums.CLIENT_EXTENSION] = "_local.clientExtension",
                  this.serializeMap[colsEnums.PRIMARY_KEY] = "_local.primaryKey",
                  this.serializeMap[colsEnums.IS_DECRYPT] = "baseMessage.isDecrypt",
                  this.serializeMap[colsEnums.GROUP_NICK_TAG] = "baseMessage.groupNickTag",
                  this.serializeMap[colsEnums.SEND_STATUS] = "_local.sendStatus"
              },
              multiInsertWkmsgs: function (e, s) {
                  var t = this
                    , a = e.map(function (e) {
                        return t._serialization(e)
                    });
                  return this.getTableWrapper.then(function () {
                      return this.tableWrapper.insertAll(this.cols, a, !0, s)
                  }
                  .bind(this))
              },
              listMessages: function (e, s, t, a) {
                  var n = this
                    , i = ["*"]
                    , r = ""
                    , u = colsEnums.CREATED_AT;
                  e ? (r = colsEnums.CREATED_AT + " >= ? AND (" + colsEnums.IS_DEL + " IS NULL OR " + colsEnums.IS_DEL + " = " + MSG_DELETE_STATUS.NORMAL + ")",
                  u += " ASC") : (r = colsEnums.CREATED_AT + " <= ? AND (" + colsEnums.IS_DEL + " IS NULL OR " + colsEnums.IS_DEL + " = " + MSG_DELETE_STATUS.NORMAL + ")",
                  u += " DESC");
                  var o = [s]
                    , l = "" + t
                    , E = {
                        columns: i,
                        selection: r,
                        selectionArgs: o,
                        orderBy: u,
                        limit: l
                    };
                  return this.getTableWrapper.then(function () {
                      return this.tableWrapper.query(E, a)
                  }
                  .bind(this)).then(function (e) {
                      var s = e.map(function (e) {
                          return n._deserialization(e)
                      });
                      return Promise.resolve(s)
                  })
              },
              getMessageById: function (e, s) {
                  var t = ["*"]
                    , a = colsEnums.MESSAGE_ID + " = ?"
                    , n = [e]
                    , i = {
                        columns: t,
                        selection: a,
                        selectionArgs: n
                    };
                  return this.getTableWrapper.then(function () {
                      return this.tableWrapper.query(i, s)
                  }
                  .bind(this)).then(function (e) {
                      var s = e.map(function (e) {
                          return this._deserialization(e)
                      }
                      .bind(this));
                      return s && s.length ? Promise.resolve(s[0]) : Promise.reject("not in local db")
                  }
                  .bind(this))
              },
              recallMessage: function (e, s) {
                  var t = {};
                  t[colsEnums.RECALL_STATUS] = 1;
                  var a = colsEnums.MESSAGE_ID + "=?"
                    , n = [e];
                  return this.getTableWrapper.then(function () {
                      return this.tableWrapper.update(t, a, n, s)
                  }
                  .bind(this))
              },
              _updateByMessageId: function (e, s, t) {
                  var a = colsEnums.MESSAGE_ID + "=?"
                    , n = [e];
                  return this.getTableWrapper.then(function () {
                      return this.tableWrapper.update(s, a, n, t)
                  }
                  .bind(this)).catch(function (e) {
                      return localLog.error("db update message error", JSON.stringify(Object.keys(s)), e),
                      Promise.reject(e)
                  })
              },
              updateReadStatus: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.READ_STATUS] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateUnReadCount: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.UNREAD_COUNT] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateIsDel: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.IS_DEL] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateSendStatus: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.SEND_STATUS] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateClientExtension: function (e, s, t) {
                  var a = {};
                  try {
                      var n = JSON.stringify(s)
                  } catch (e) {
                      return Promise.reject(e)
                  }
                  return a[colsEnums.CLIENT_EXTENSION] = n,
                  this._updateByMessageId(e, a, t)
              },
              updateLocalId: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.LOCAL_ID] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateSenderTag: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.SENDER_TAG] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateMemberExtension: function (e, s, t) {
                  var a = {};
                  try {
                      var n = JSON.stringify(s)
                  } catch (e) {
                      return Promise.reject(e)
                  }
                  return a[colsEnums.MEMBER_EXTENSION] = n,
                  this._updateByMessageId(e, a, t)
              },
              updateMessageId: function (e, s, t) {
                  var a = {};
                  a[colsEnums.MESSAGE_ID] = s;
                  var n = colsEnums.LOCAL_ID + "=?"
                    , i = [e];
                  return this.tableWrapper.update(a, n, i, t)
              },
              updateTag: function (e, s, t) {
                  var a = {};
                  return a[colsEnums.TAG] = s,
                  this._updateByMessageId(e, a, t)
              },
              updateExtension: function (e, s, t) {
                  var a = {};
                  try {
                      var n = JSON.stringify(s)
                  } catch (e) {
                      return Promise.reject(e)
                  }
                  return a[colsEnums.EXTENSION] = n,
                  this._updateByMessageId(e, a, t)
              },
              removeFromCreatedAt: function (e, s) {
                  var t = colsEnums.CREATED_AT + " < ?"
                    , a = [e];
                  return this.tableWrapper.remove(t, a, s)
              },
              updateMsg: function (e, s, t) {
                  var a = this._serialization(s)
                    , n = {}
                    , i = !1;
                  return a.forEach(function (e, s) {
                      void 0 !== e && (n[this.cols[s]] = e,
                      i = !0)
                  }
                  .bind(this)),
                  i === !0 ? this._updateByMessageId(e, n, t) : Promise.resolve()
              }
          })
      };
    module.exports = {
        initMessageEntry: initMessageEntry,
        getMessageEntry: function () {
            return MessageEntry
        }
    };
}
    , {
        "../config/config": 877,
        "../message/msgDelStatus": 938,
        "./messageTableDef": 908,
        "lodash": 1057,
        "md5": 1059
    }]