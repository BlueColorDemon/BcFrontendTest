[function (require, module, exports) {
    "use strict";
    var path = require("path")
      , _ = require("lodash")
      , MsgTag = require("../../../service/conversation/MsgTag")
      , MsgType = require("../../../service/conversation/MsgType")
      , ua = require("../../../service/ua")
      , moduleName = "ddWeb.chat.msgContent"
      , ContentType = require("../../../service/conversation/ContentType");
    angular.module(moduleName, [require("./content/msgText"), require("./content/msgImg"), require("./content/msgImgText"), require("./content/msgVoice"), require("./content/msgVoip"), require("./content/msgFile"), require("./content/msgShare"), require("./content/msgErr"), require("./content/dingText"), require("./content/dingVoice"), require("./content/msgSpaceFile"), require("./content/msgCard"), require("./content/msgMail"), require("./content/msgGroupAnnounce"), require("./content/msgOA"), require("./content/msgNeedDecrypt"), require("./content/msgRedEnvelope"), require("./content/encryptedMsgInWeb"), require("../../../component/msgContent/msgEncryptFile"), require("../../../component/msgContent/msgEncryptAudio"), require("../../../component/msgContent/msgEncryptImg"), require("../../../component/msgContent/msgMarkdown")]).directive("msgContent", [function () {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                info: "=info"
            },
            controller: ["$scope", function (e) { }
            ],
            link: function (e, n, t) {
                var s = e.info.msg;
                e.msgType = "msg-err",
                e.needDecrypt = s.needDecrypt();
                var g = function () {
                    var n = _.get(s, "baseMessage.content.contentType");
                    if (s.needDecrypt())
                        ua.isDesktop ? e.msgType = "msg-need-decrypt" : e.msgType = "encrypted-msg-in-web";
                    else {
                        switch (n) {
                            case ContentType.TEXT:
                                e.msgType = "msg-text";
                                break;
                            case ContentType.AUDIO:
                                e.msgType = "msg-audio";
                                break;
                            case ContentType.IMG:
                                e.msgType = "msg-img";
                                break;
                            case ContentType.IMG_TEXT:
                                e.msgType = "msg-img-text";
                                break;
                            case ContentType.FILE:
                                e.msgType = "msg-file";
                                break;
                            case ContentType.SHARE:
                                e.msgType = "msg-share";
                                break;
                            case ContentType.CARD:
                                e.msgType = "msg-card";
                                break;
                            case ContentType.VOIP:
                                e.msgType = "msg-voip";
                                break;
                            case ContentType.MAIL:
                                e.msgType = "msg-mail";
                                break;
                            case ContentType.ORG_SPACE_FILE:
                            case ContentType.IM_SPACE_FILE:
                                e.msgType = "msg-space-file";
                                break;
                            case ContentType.SAFETY_IM_SPACE_FILE:
                                e.msgType = "msg-encrypt-file";
                                break;
                            case ContentType.SAFETY_AUDIO:
                                e.msgType = "msg-encrypt-audio";
                                break;
                            case ContentType.SAFETY_IMG:
                                e.msgType = "msg-encrypt-img";
                                break;
                            case ContentType.OA:
                                e.msgType = "msg-oa";
                                break;
                            case ContentType.GROUP_ANNOUNCE:
                                e.msgType = "msg-announce";
                                break;
                            case ContentType.RED_ENVELOPE_ENTERPRISE:
                            case ContentType.RED_ENVELOPE_RANDOM:
                            case ContentType.RED_ENVELOPE_NORMAL:
                            case ContentType.RED_ENVELOPE_SYSTEM:
                            case ContentType.RED_ENVELOPE_ALIPAY:
                            case ContentType.RED_ENVELOPE_FESTIVAL:
                            case ContentType.RED_ENVELOPE_MOMENT:
                                e.msgType = "msg-red-envelope";
                                break;
                            case ContentType.ROBOT_MARKDOWN:
                                e.msgType = "msg-markdown";
                                break;
                            default:
                                e.msgType = "msg-err"
                        }
                        if (_.get(s, "baseMessage.memberTag") === MsgTag.DING)
                            switch (n) {
                                case ContentType.TEXT:
                                    e.msgType = "ding-text";
                                    break;
                                case ContentType.AUDIO:
                                    e.msgType = "ding-audio"
                            }
                        s.isSafetyFile() && !ua.isDesktop && (e.msgType = "encrypted-msg-in-web")
                    }
                };
                g();
                var i = function () {
                    g();
                    try {
                        e.$digest()
                    } catch (e) { }
                };
                s.addListener(s.EventsName.PRIVATE_TAG_CHANGE, i),
                s.addListener(s.EventsName.DECRYPT_STATUS_CHANGE, i),
                n.on("$destroy", function () {
                    s.removeListener(s.EventsName.PRIVATE_TAG_CHANGE, i),
                    s.removeListener(s.EventsName.DECRYPT_STATUS_CHANGE, i)
                })
            },
            controllerAs: "content",
            template: '<div class="msg-content-wrapper" ng-switch="msgType" >\n    <!-- 文字内容 -->\n    <msg-text ng-switch-when="msg-text" info="info"></msg-text>\n    <!-- 图片内容 -->\n    <msg-img ng-switch-when="msg-img" info="info"></msg-img>\n    <!-- 图文内容 -->\n    <msg-img-text ng-switch-when="msg-img-text" info="info"></msg-img-text>\n    <!-- 语音内容 -->\n    <msg-voice ng-switch-when="msg-audio" info="info"></msg-voice>\n    <!-- 语VOIP内容 -->\n    <msg-voip ng-switch-when="msg-voip" info="info"></msg-voip>\n    <!-- 普通文件内容(旧数据) -->\n    <msg-file ng-switch-when="msg-file" info="info"></msg-file>\n    <!-- 分享内容 -->\n    <msg-share ng-switch-when="msg-share" info="info"></msg-share>\n    <!-- 名片内容 -->\n    <msg-card ng-switch-when="msg-card" info="info"></msg-card>\n    <!-- 邮件内容 -->\n    <msg-mail ng-switch-when="msg-mail" info="info"></msg-mail>\n    <!-- 云盘内容 -->\n    <msg-space-file ng-switch-when="msg-space-file" info="info"></msg-space-file>\n    <!-- 不支持消息内容 -->\n    <msg-err info="info" ng-switch-when="msg-err"></msg-err>\n    <!-- OA消息 -->\n    <msg-oa ng-switch-when="msg-oa" info="info"></msg-oa>\n    <!-- ding文字内容 -->\n    <ding-text ng-switch-when="ding-text" info="info"></ding-text>\n    <!-- ding语音内容 -->\n    <ding-voice ng-switch-when="ding-audio" info="info"></ding-voice>\n    <!-- 群公告 -->\n    <group-announce ng-switch-when="msg-announce" info="info"></group-announce>\n    <!-- 红包消息 -->\n    <msg-red-envelope ng-switch-when="msg-red-envelope" info="info"></msg-red-envelope>\n    <msg-need-decrypt ng-switch-when="msg-need-decrypt" info="info"></msg-need-decrypt>\n    <msg-encrypt-file ng-switch-when="msg-encrypt-file" info="info"></msg-encrypt-file>\n    <msg-encrypt-img ng-switch-when="msg-encrypt-img" info="info"></msg-encrypt-img>\n    <msg-encrypt-audio ng-switch-when="msg-encrypt-audio" info="info"></msg-encrypt-audio>\n    <encrypted-msg-in-web ng-switch-when="encrypted-msg-in-web"></encrypted-msg-in-web>\n\n    <msg-markdown info="info" ng-switch-when="msg-markdown"></msg-markdown>\n    <msg-err info="info" ng-switch-default></msg-err>\n</div>\n\n'
        }
    }
    ]),
    module.exports = moduleName;
}
   , {
       "../../../component/msgContent/msgEncryptAudio": 39,
       "../../../component/msgContent/msgEncryptFile": 40,
       "../../../component/msgContent/msgEncryptImg": 41,
       "../../../component/msgContent/msgMarkdown": 42,
       "../../../service/conversation/ContentType": 301,
       "../../../service/conversation/MsgTag": 307,
       "../../../service/conversation/MsgType": 308,
       "../../../service/ua": 690,
       "./content/dingText": 69,
       "./content/dingVoice": 70,
       "./content/encryptedMsgInWeb": 71,
       "./content/msgCard": 72,
       "./content/msgErr": 73,
       "./content/msgFile": 74,
       "./content/msgGroupAnnounce": 75,
       "./content/msgImg": 76,
       "./content/msgImgText": 77,
       "./content/msgMail": 78,
       "./content/msgNeedDecrypt": 79,
       "./content/msgOA": 80,
       "./content/msgRedEnvelope": 82,
       "./content/msgShare": 83,
       "./content/msgSpaceFile": 84,
       "./content/msgText": 85,
       "./content/msgVoice": 86,
       "./content/msgVoip": 87,
       "lodash": 1057,
       "path": 7
   }]