[function (require, module, exports) {
    "use strict";
    var moduleName = "ddWeb.emotion.EmotionManager"
      , mediaIdFactory = require("@ali/ding-mediaid")
      , wksdk = require("@ali/wksdk")
      , uriResolve = require("../uriResolve/resolve")
      , localLog = require("../log/localLog")
      , wkUpload = wksdk.upload
      , Class = require("../../lib/class")
      , EventEmitter = require("wolfy87-eventemitter")
      , msgpack = require("@ali/msgpack")
      , myEmotionService = require("./myEmotionService")
      , MyEmotionStatus = require("./myEmotionStatus")
      , EMOTION_TYPE = {
          OTHER: 1,
          GIF: 2
      };
    angular.module(moduleName, [require("../../service/face/default"), require("../../service/file/fileTypes"), require("../../service/toast/toast"), require("./emotionPkgApi")]).factory("EmotionManager", ["faces_default", "$fileTypes", "toastService", "EmotionPkgApi", function (e, t, i, o) {
        var n = Class.create({
            initialize: function () {
                this.activeItem = "default",
                this.cusVersion = 0,
                this.pkgVersion = 0,
                this.pageStart = 0,
                this.pageEnd = 7,
                this.MEDIA_SIZE_LIMIT = 102400,
                this.pkgList = [],
                this.myEmotions = [],
                this.defaultHeaders = [{
                    packageId: "default",
                    icon: uriResolve.assetsResolve("app/img/face/icon_face.png"),
                    name: "默认表情"
                }, {
                    packageId: "custom",
                    icon: uriResolve.assetsResolve("app/img/face/icon_heart.png"),
                    name: "自定义表情"
                }],
                this.emotionHeaders = this.defaultHeaders,
                this.pkgCache = {
                    default: e,
                    custom: []
                },
                this.ERROR_MSG = {
                    OVER_LIMIT: "添加失败，表情大小超过100K",
                    PULL_ERROR: "获取表情失败，请检查网络后再试",
                    PIC_ERROR: "图片获取失败",
                    REMOVE_ERROR: "删除表情失败，请重试",
                    ADD_ERROR: "添加失败，请检查网络后再试",
                    NETWORK_ERROR: "您现在处于离线状态，请检查网络后再试",
                    OVER_LIST_LIMIT: "自定义表情达到上限",
                    TYPE_ERROR: "表情不支持此类型",
                    RATIO_ERROR: "添加失败，表情尺寸超过300x300"
                },
                myEmotionService.on(myEmotionService.EventsName.UPDATE_LIST, function (e) {
                    var t = [];
                    e.forEach(function (e) {
                        e.status === MyEmotionStatus.USED && t.push(this.getEmotionHeader(e))
                    }
                    .bind(this)),
                    this.emotionHeaders = this.defaultHeaders.concat(t),
                    this.myEmotions = e,
                    this.emit(this.EventsName.MY_EMOTION_UPDATE_LIST, this.myEmotions)
                }
                .bind(this)),
                myEmotionService.on(myEmotionService.EventsName.UPDATE, function (e) {
                    var t = e.packageId;
                    this.emit(this.EventsName.MY_EMOTION_UPDATE + "_" + t, e)
                }
                .bind(this)),
                myEmotionService.getAll()
            },
            Implements: EventEmitter,
            EventsName: {
                MY_EMOTION_UPDATE_LIST: "my_emotion_update_list",
                MY_EMOTION_UPDATE: "my_emotion_update",
                UPDATE_LIST: "updateList",
                CHANGE_EMOTION: "changeEmotion",
                PKG_LIST_UPDATE: "pkgListUpdate",
                EMOTION_UPDATE: "emotionUpdate"
            },
            getEmotionHeader: function (e) {
                return e.icon = mediaIdFactory.mid2Url(e.iconMediaId, {
                    imageSize: "origin"
                }),
                e
            },
            getEmotionPackageModel: function (e) {
                return e.iconSrc = mediaIdFactory.mid2Url(e.iconMediaId, {
                    imageSize: "origin"
                }),
                e
            },
            getEmotionModel: function (e) {
                var t = mediaIdFactory.mid2Url(e.emotionMediaId, {
                    imageSize: "origin"
                })
                  , i = this.gifToPng(t);
                return _.isUndefined(e.type) && (e.type = this.getEmotionTypeFromUrl(t)),
                {
                    id: e.emotionId,
                    name: e.name,
                    packageName: e.packageName,
                    orgSrc: t,
                    previewSrc: i,
                    src: i,
                    size: e.emotionMediaSize,
                    mediaId: e.emotionMediaId,
                    packageId: e.packageId,
                    type: e.type
                }
            },
            getEmotionTypeFromUrl: function (e) {
                var t = e.split(".").pop();
                return "gif" === t ? EMOTION_TYPE.GIF : EMOTION_TYPE.OTHER
            },
            gifToPng: function (e) {
                return "gif" !== e.split(".").pop() ? e : e + "_" + e.split("_").slice(-2).join("_").replace("gif", "png")
            },
            isSizeValid: function (e, t) {
                var t = !!_.isUndefined(t) || t;
                return !(!_.isUndefined(e) && 0 !== e) || (!(e > this.MEDIA_SIZE_LIMIT) || (t && this.showErrorMsg(this.ERROR_MSG.OVER_LIMIT),
                !1))
            },
            showErrorMsg: function (e) {
                i.show(e, {
                    type: "error",
                    timeout: 5e3
                })
            },
            getCurrEmotions: function () {
                return this.pkgCache[this.activeItem] || []
            },
            checkEmotionExist: function (e) {
                return o.checkEmotionExist(e)
            },
            checkMediaIdValid: function (e) {
                if (!e)
                    return "PIC_ERROR";
                try {
                    e = e.replace(/-/gi, "+").replace(/_/gi, "/");
                    var i = msgpack.decodeFromB64(e.substr(1))
                } catch (e) {
                    return localLog.error("checkMediaIdValid, parse error", e),
                    "PIC_ERROR"
                }
                var o = t.getCateTypeById(i[0]).split("_");
                return "IMAGE" !== o[0] ? "TYPE_ERROR" : i[2] > 300 || i[3] > 300 ? "RATIO_ERROR" : void 0
            },
            addPkgEmotion: function (e) {
                var t = e.packageId;
                myEmotionService.addEmotion(t, e).then(function () {
                    i.show("表情下载成功", {
                        type: "success",
                        timeout: 2e3
                    })
                })
            },
            removePkgEmotion: function (e) {
                var t = e.packageId;
                myEmotionService.removeEmotion(t, e).then(function () {
                    i.show("表情移除成功", {
                        type: "success",
                        timeout: 2e3
                    })
                })
            },
            addCustomEmotion: function (e, t) {
                var i = this.checkMediaIdValid(t);
                return i ? (this.showErrorMsg(this.ERROR_MSG[i]),
                Promise.reject("mediaId invalid: " + i)) : o.addCustomEmotion("", t).then(function (e) {
                    var t = this.getEmotionModel(e);
                    this.pkgCache.custom.filter(function (e) {
                        return e.id === t.id
                    }).length > 0 || (this.pkgCache.custom.push(this.getEmotionModel(e)),
                    this.emit(this.EventsName.EMOTION_UPDATE))
                }
                .bind(this)).catch(function (e) {
                    return e.body && "060002" === e.body.code ? this.showErrorMsg(this.ERROR_MSG.OVER_LIMIT) : this.showErrorMsg(e.body && e.body.reason || this.ERROR_MSG.ADD_ERROR),
                    Promise.reject(e)
                }
                .bind(this))
            },
            uploadEmotion: function (e) {
                var i = t.getTypeByName(e.name)
                  , o = t.isImg(i);
                if (!o)
                    return this.showErrorMsg(this.ERROR_MSG.TYPE_ERROR),
                    Promise.reject("file type error");
                var n = e.size;
                return this.isSizeValid(n) ? wkUpload.upload(e).then(function (t) {
                    return this.addCustomEmotion(e.name, t.uri)
                }
                .bind(this)) : Promise.reject("file size error")
            },
            getCustomEmotions: function () {
                return o.getCustomEmotions(this.cusVersion).then(function (e) {
                    return this.cusVersion = e.version,
                    Promise.resolve(e.customEmotions)
                }
                .bind(this))
            },
            getEmotionPackageList: function () {
                return o.getEmotionPackageList(this.pkgVersion).then(function (e) {
                    return this.pkgVersion = e.version,
                    this.pkgList = e.emotionPackages.map(function (e) {
                        return this.getEmotionPackageModel(e)
                    }
                    .bind(this)),
                    this.emit(this.EventsName.PKG_LIST_UPDATE),
                    Promise.resolve(this.pkgList)
                }
                .bind(this)).catch(function () { })
            },
            changeEmotion: function (e) {
                "default" === e ? (this.activeItem = e,
                this.emit(this.EventsName.CHANGE_EMOTION)) : "custom" === e ? (this.activeItem = e,
                this.emit(this.EventsName.CHANGE_EMOTION),
                this.getCustomEmotions().then(function (t) {
                    this.pkgCache[e] = t.map(function (e) {
                        return this.getEmotionModel(e)
                    }
                    .bind(this)),
                    this.emit(this.EventsName.EMOTION_UPDATE)
                }
                .bind(this)).catch(function (e) { })) : (this.activeItem = e,
                this.emit(this.EventsName.CHANGE_EMOTION),
                this.getPackageDetail(e).then(function (t) {
                    this.pkgCache[e] = t.emotions,
                    this.emit(this.EventsName.EMOTION_UPDATE)
                }
                .bind(this)))
            },
            removeEmotion: function (e) {
                o.removeEmotions([e]).then(function () {
                    _.remove(this.pkgCache.custom, function (t) {
                        return t.id === e
                    }),
                    this.emit(this.EventsName.EMOTION_UPDATE)
                }
                .bind(this)).catch(function (e) {
                    return this.showErrorMsg(e.body && e.body.reason || this.ERROR_MSG.REMOVE_ERROR),
                    Promise.reject(e)
                }
                .bind(this))
            },
            getPackageDetail: function (e) {
                return o.getPackageDetail(e).then(function (t) {
                    t.bannerSrc = mediaIdFactory.mid2Url(t.bannerMediaId, {
                        imageSize: "origin"
                    }),
                    t.isGif = _.get(t, "emotions[0].type") === EMOTION_TYPE.GIF,
                    t.emotions = t.emotions.map(function (e) {
                        return e.packageName = t.name,
                        this.getEmotionModel(e)
                    }
                    .bind(this));
                    var i = _.findIndex(this.myEmotions, function (t) {
                        return t.packageId === e
                    });
                    return i !== -1 && (t.myEmotionStatus = this.myEmotions[i].status),
                    this.emit(this.EventsName.EMOTION_UPDATE),
                    Promise.resolve(t)
                }
                .bind(this)).catch(function (e) {
                    return this.showErrorMsg(e.body && e.body.reason || this.ERROR_MSG.PULL_ERROR),
                    Promise.reject(e)
                }
                .bind(this))
            }
        });
        return n
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../lib/class": 206,
        "../../service/face/default": 395,
        "../../service/file/fileTypes": 399,
        "../../service/toast/toast": 682,
        "../log/localLog": 441,
        "../uriResolve/resolve": 697,
        "./emotionPkgApi": 385,
        "./myEmotionService": 388,
        "./myEmotionStatus": 389,
        "@ali/ding-mediaid": 786,
        "@ali/msgpack": 800,
        "@ali/wksdk": 869,
        "wolfy87-eventemitter": 1083
    }]