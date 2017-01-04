[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.conv.msgFactoryWithSDK"
      , $my = require("../../user/my")
      , _ = require("lodash")
      , SendStatus = require("./../SendStatus")
      , MsgType = require("./../MsgType")
      , MsgCreatorType = require("./../MsgCreatorType")
      , fileCache = require("./fileCache")
      , limitConfig = require("../../limitConfig")
      , fileTypes = require("@ali/ding-filetypes")
      , uriResolve = require("../../uriResolve/resolve")
      , ContentType = require("../ContentType");
    angular.module(moduleName, [require("../../file/fileHelper"), require("../../senderExt/senderExtFactory")]).factory("msgFactoryWithSDK", ["$fileHelper", "senderExtFactory", function (e, t) {
        return {
            genSysMsg: function (e, n) {
                var s = e.buildTextMsg(n.text, MsgCreatorType.SYSTEM)
                  , a = this
                  , r = new Date - 0
                  , i = r - n.lastTime > 0 ? r : n.lastTime + 1
                  , o = {
                      isCustom: !0,
                      baseMessage: {
                          content: {
                              contentType: 1,
                              textContent: {
                                  text: n.text
                              }
                          },
                          conversationId: n.cid,
                          createdAt: i,
                          creatorType: 2,
                          memberTag: 0,
                          messageId: n.mid || a.genUUID(),
                          openIdEx: t.genOpenIdEx()
                      },
                      senderMessageStatus: {
                          totalCount: 0,
                          unReadCount: 0
                      }
                  };
                return _.merge(s, o)
            },
            genSendingTextMsg: function (e, n) {
                var s = n.text
                  , a = n.lastTime
                  , r = _.get(n, "extra.atOpenIds")
                  , i = {
                      contentType: 1,
                      textContent: {
                          text: s
                      }
                  };
                r && (i.atOpenIds = r);
                var o = +new Date
                  , l = o - a > 0 ? o : a + 1
                  , d = {
                      conversationId: e.cid,
                      type: 1,
                      creatorType: 1,
                      content: i,
                      tag: 0,
                      nickName: $my.userProfileModel.nick,
                      createdAt: l,
                      memberTag: 0,
                      openIdEx: t.genOpenIdEx()
                  }
                  , c = {
                      isCustom: !0,
                      baseMessage: d,
                      senderMessageStatus: {},
                      sendStatus: SendStatus.SENDING,
                      sdkConv: e
                  };
                return Promise.resolve(c)
            },
            genSendingSpaceFileMsg: function (e) {
                var n, s = e.cid, a = e.spaceFileObj, r = !!e.spaceFileObj, i = e.file, o = e.lastTime, l = e.isCompanyGroup, d = parseInt(r ? a.orgId : e.orgId), c = e.getSpaceIdPromise, u = new Date - 0, p = u - o > 0 ? u : o + 1, g = r ? a.name : i.name;
                n = r || l ? ContentType.ORG_SPACE_FILE : ContentType.IM_SPACE_FILE;
                var m = {
                    contentType: n,
                    attachments: [{
                        extension: {
                            f_name: g,
                            f_size: r ? a.size + "" : i.size + "",
                            f_type: fileTypes.getTypeByName(g),
                            path: r ? a.path : null,
                            s_id: r ? a.spaceId + "" : null,
                            f_id: r ? a.id : null,
                            cid: s
                        },
                        isPreload: 0,
                        size: 0,
                        type: 0,
                        url: ""
                    }]
                };
                l && _.set(m, "attachments[0].extension.oid", d + "");
                var y = {
                    uuid: this.genUUID(),
                    conversationId: s,
                    type: MsgType.NORMAL,
                    creatorType: MsgCreatorType.SELF,
                    content: m,
                    tag: 0,
                    nickName: $my.userProfileModel.nick,
                    createdAt: p,
                    memberTag: 0,
                    openIdEx: t.genOpenIdEx()
                }
                  , T = {
                      isCustom: !0,
                      baseMessage: y,
                      senderMessageStatus: {},
                      sendStatus: SendStatus.SENDING
                  };
                return !r && i && (_.set(T, "_local.fileId", fileCache.cache(i)),
                _.set(T, "_local.getSpaceIdPromise", c)),
                Promise.resolve(T)
            },
            genSendingImgMsg: function (n, s) {
                var a = s.lastTime
                  , r = s.file
                  , i = s.mediaId || null
                  , o = 0;
                r ? (o = r.size,
                i = null) : i && (o = s.picSize || 0);
                var l = new Date - 0
                  , d = l - a > 0 ? l : a + 1
                  , c = s.extension || null;
                if (!r && !i)
                    return Promise.reject({
                        body: {
                            reason: "file 和 mediaId 都为空"
                        }
                    });
                var u = {
                    mediaId: i,
                    picSize: o,
                    type: 1,
                    orientation: 1,
                    extension: c
                }
                  , p = {
                      contentType: 2,
                      photoContent: u
                  }
                  , g = {
                      type: 1,
                      creatorType: 1,
                      content: p,
                      tag: 0,
                      nickName: $my.userProfileModel.nick,
                      createdAt: d,
                      memberTag: 0,
                      openIdEx: t.genOpenIdEx()
                  }
                  , m = {
                      isCustom: !0,
                      baseMessage: g,
                      senderMessageStatus: {},
                      sendStatus: SendStatus.SENDING,
                      _local: {
                          fileId: fileCache.cache(r)
                      },
                      sdkConv: n
                  };
                return r ? (_.set(m, "_local.fileId", fileCache.cache(r)),
                o > limitConfig.IMAGE_READ_B64_SIZE_LIMIT ? (_.set(m, "_local.localURI", uriResolve.assetsResolve("/app/img/filelogo/pic.png")),
                Promise.resolve(m)) : new Promise(function (t, n) {
                    e.readFile(r, function () {
                        var e = fileTypes.getTypeByName(r.name);
                        _.set(m, "_local.localURI", r.dataURI),
                        "jpg" !== e && "jpeg" !== e || !r.orientation || (p.photoContent.orientation = r.orientation),
                        t(m)
                    })
                }
                )) : Promise.resolve(m)
            },
            genEOFMsg: function (e) {
                var t = e.buildTextMsg("", MsgCreatorType.EOF)
                  , n = {
                      isCustom: !0,
                      baseMessage: {
                          createdAt: 0,
                          creatorType: MsgCreatorType.EOF,
                          content: {
                              contentType: ContentType.EOF
                          }
                      },
                      EOF: !0
                  };
                return _.merge(t, n)
            }
        }
    }
    ]),
    module.exports = moduleName;
}
    , {
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