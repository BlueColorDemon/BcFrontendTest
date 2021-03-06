﻿[function (require, module, exports) {
    "use strict";
    var initManager = require("./libs/init/initManager")
      , WKEngine = {
          init: initManager.init,
          mainInit: initManager.mainInit,
          imInit: initManager.imInit,
          version: require("./libs/version"),
          errorCode: require("./libs/error/errorCode"),
          config: require("./libs/config/config"),
          syncProtocolStatus: require("./libs/syncProtocolStatus/syncProtocolStatus"),
          getSyncInfo: require("./libs/sync/getSyncInfo"),
          conversationService: require("./libs/conversation/conversationService"),
          banWordsType: require("./libs/conversation/banWordsType"),
          inBanBlackStatus: require("./libs/conversation/inBanBlackStatus"),
          inBanWhiteStatus: require("./libs/conversation/inBanWhiteStatus"),
          errorLogEventEmitter: require("./libs/error/errorLogEventEmitter"),
          typingStatus: require("./libs/conversation/typingStatus"),
          conversationStatus: require("./libs/conversation/conversationStatus"),
          groupAuthority: require("./libs/conversation/groupAuthority"),
          groupValidationStatus: require("./libs/conversation/groupValidationStatus"),
          iconOptionModelType: require("./libs/conversation/iconOptionModelType"),
          showHistoryType: require("./libs/conversation/showHistoryType"),
          batchGetConvIcon: require("./libs/conversation/batchGetConvIcon"),
          messageSendStatus: require("./libs/message/msgSendStatus"),
          messageType: require("./libs/message/msgType"),
          messageCreatorType: require("./libs/message/msgCreatorType"),
          syncSinglePackageActionMerge: require("./libs/sync/syncSinglePackageActionMerge"),
          syncMultiPackageActionMerge: require("./libs/sync/syncMultiPackageActionMerge"),
          conversationTableDef: require("./libs/dbEntry/conversationTableDef"),
          messageTableDef: require("./libs/dbEntry/messageTableDef"),
          aliasService: require("./libs/user/aliasService"),
          followService: require("./libs/user/followService"),
          groupNickService: require("./libs/user/groupNickService"),
          ws: require("./libs/io/mainWS"),
          decryptType: require("./libs/safety/decryptType"),
          subscribe: require("./libs/subscribe/subscribe"),
          upload: require("./libs/upload/upload"),
          trans: require("./libs/upload/trans"),
          groupValidationService: require("./libs/group/groupValidationService"),
          joinGroupStatus: require("./libs/group/joinGroupStatus"),
          cloudSetting: require("./libs/cloudSetting/cloudSetting"),
          clientLog: require("./libs/clientLog/clientLog"),
          syncRegister: require("./libs/sync/syncManager").register,
          IDL: require("./libs/idl/idl")
      };
    module.exports = WKEngine;
}
    , {
        "./libs/clientLog/clientLog": 874,
        "./libs/cloudSetting/cloudSetting": 875,
        "./libs/config/config": 877,
        "./libs/conversation/banWordsType": 878,
        "./libs/conversation/batchGetConvIcon": 879,
        "./libs/conversation/conversationService": 883,
        "./libs/conversation/conversationStatus": 884,
        "./libs/conversation/groupAuthority": 887,
        "./libs/conversation/groupValidationStatus": 889,
        "./libs/conversation/iconOptionModelType": 890,
        "./libs/conversation/inBanBlackStatus": 891,
        "./libs/conversation/inBanWhiteStatus": 892,
        "./libs/conversation/showHistoryType": 893,
        "./libs/conversation/typingStatus": 895,
        "./libs/dbEntry/conversationTableDef": 901,
        "./libs/dbEntry/messageTableDef": 908,
        "./libs/error/errorCode": 910,
        "./libs/error/errorLogEventEmitter": 911,
        "./libs/group/groupValidationService": 912,
        "./libs/group/joinGroupStatus": 913,
        "./libs/idl/idl": 914,
        "./libs/init/initManager": 916,
        "./libs/io/mainWS": 920,
        "./libs/message/msgCreatorType": 937,
        "./libs/message/msgSendStatus": 939,
        "./libs/message/msgType": 940,
        "./libs/safety/decryptType": 949,
        "./libs/subscribe/subscribe": 951,
        "./libs/sync/getSyncInfo": 953,
        "./libs/sync/syncManager": 955,
        "./libs/sync/syncMultiPackageActionMerge": 956,
        "./libs/sync/syncSinglePackageActionMerge": 958,
        "./libs/syncProtocolStatus/syncProtocolStatus": 961,
        "./libs/upload/trans": 965,
        "./libs/upload/upload": 966,
        "./libs/user/aliasService": 968,
        "./libs/user/followService": 971,
        "./libs/user/groupNickService": 973,
        "./libs/version": 974
    }]