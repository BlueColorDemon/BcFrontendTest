[function (require, module, exports) {
    "use strict";
    var path = require("path")
      , moduleName = "ddWeb.service.profileModal"
      , serviceName = "profileModalService"
      , localLog = require("../log/localLog")
      , EVENTS = require("../events.js")
      , $my = require("../user/my")
      , UserType = require("../user/UserType")
      , Jsuri = require("jsuri")
      , mediaId = require("@ali/ding-mediaid")
      , uriResolve = require("../../service/uriResolve/resolve")
      , _ = require("lodash")
      , watermarkLocation = require("../../service/watermark/watermarkLocation")
      , watermarkTypeKey = require("../../service/watermark/watermarkType").key
      , orgNodeType = require("../../service/org/OrgNodeType.js")
      , orgEmpMobileSource = require("../user/orgEmpMobileSource")
      , userHelper = require("../user/userHelper")
      , bridgeEvent = require("../bridge/bridgeEvent")
      , viewBridge = require("../bridge/viewBridge")
      , $my = require("../../service/user/my")
      , IMLogType = require("../../service/log/imLogType")
      , mediaId = require("@ali/ding-mediaid")
      , globalURL = require("../../service/globalUrl")
      , i18next = require("i18next")
      , wksdk = require("@ali/wksdk")
      , cloudSetting = wksdk.cloudSetting
      , CSMap = require("../CSConfig/CSMap")
      , FriendType = require("../friend/FriendType");
    angular.module(moduleName, [require("./modal"), require("../log/lwlog"), require("@ali/ding-api").interface.FriendI, require("@ali/ding-api").interface.ExternalContactI, require("@ali/ding-api").interface.ContactI, require("@ali/ding-api").interface.IDLGroupApp, require("../toast/toast"), require("../../directive/widget/focus"), require("./confirm"), require("../conversation/conversationWithSDK"), require("../../directive/widget/editBar"), require("../../service/modal/sendDingModal"), require("../../directive/watermark"), require("../../directive/avatar/userAvatar"), require("../img/imgPreviewService"), require("./sendCardToConv"), require("../../directive/widget/extContactLabel"), require("./permissionManage"), require("../onebox/oneboxModal.js"), require("./externalLabelEditModal.js"), require("../../component/user/userDingTitleList.js"), require("./callSelectorModal.js"), require("../user/userManager"), require("../../service/log/imLog"), require("../../service/frameContainer/commModal")]).factory(serviceName, ["$modal", "userManager", function (e, o) {
        var t = {
            NORMAL: "normal",
            ROBOT: "robot"
        };
        return function (r, i, n, l, a, d, s) {
            return Promise.resolve().then(function () {
                return r ? o.getUsers([r]).then(function (e) {
                    return e && e[0] && e[0].userProfileModel.type === UserType.ROBOT ? t.ROBOT : t.NORMAL
                }) : Promise.resolve(t.NORMAL)
            }).then(function (o) {
                if (o === t.ROBOT)
                    var c = e.open({
                        template: '<div class="profile-card profile-robot">\n    <header class="header">\n        <div class="bg"  ng-class="{\'default-bg-img\':!robotProfile.robot.iconURL,\'user-bg-img\':robotProfile.robot.iconURL}" style="background-image:url({{ robotProfile.robot.iconURL }})"></div>\n        <i class="iconfont close dialog-close"></i>\n        <div class="avatar-wrap">\n            <static-user-avatar  on-click-avatar="robotProfile.onClickAvatar()" class="big" media-id="{{robotProfile.robot.iconURL}}" name="{{robotProfile.robot.name }}"></static-user-avatar>\n        </div>\n        <div class="detail-info">\n            <div class="name" title=""><span ng-bind-html=" robotProfile.robot.name |emoj"></span></div>\n            <i class="iconfont icon-card"  htitle="发送该名片" ng-click="robotProfile.sendCardToConv()">&#xe6ae;</i>\n        </div>\n    </header>\n    <article class="detail-content">\n        <section ng-if="robotProfile.robot.desc">\n            <h4>{{::robotProfile.TEXT.intro }}</h4>\n            <p>{{ robotProfile.robot.desc }}</p>\n        </section>\n        <section ng-if="robotProfile.robot.previewURL">\n            <h4>{{::robotProfile.TEXT.msgPreview }}</h4>\n            <div><img style="max-width:100%" ng-src="{{ robotProfile.robot.previewURL }}" /></div>\n        </section>\n        <section ng-if="robotProfile.robot.dev">\n            <h4>{{::robotProfile.TEXT.developer }}</h4>\n            <p>{{ robotProfile.robot.dev }}</p>\n        </section>\n        <section ng-if="robotProfile.robot.sourceURL">\n            <h4>{{::robotProfile.TEXT.source }}</h4>\n            <p><a href="{{ robotProfile.robot.sourceURL }}" target="_blank">{{ robotProfile.robot.sourceURL }}</a></p>\n        </section>\n    </article>\n    <footer ng-if="::robotProfile.isShowRobotEntry" class="footer">\n        <a href="javascript:;" class="footer-action" ng-click="robotProfile.addMore()">\n            <span>+ {{::robotProfile.TEXT.addRobot }}</span>\n        </a>\n    </footer>\n</div>\n',
                        controller: "robotProfileCtrl",
                        controllerAs: "robotProfile",
                        resolve: {
                            uid: function () {
                                return r
                            }
                        },
                        enterTriggerEl: ".chatto-action-btn"
                    });
                else
                    var c = e.open({
                        template: ' <div class="profile-card">\n     <header class="header">\n         <div class="bg"  ng-class="{\'default-bg-img\':!profileModal.user.userProfileModel.avatarMediaId,\'user-bg-img\':profileModal.user.userProfileModel.avatarMediaId}" style="background-image:url({{profileModal.avatarUrl}})"></div>\n         <i class="iconfont close dialog-close"></i>\n         <div class="avatar-wrap">\n             <user-avatar ng-if="profileModal.uid" on-click-avatar="profileModal.onClickAvatar()" class="big" uid="{{ profileModal.uid }}"></user-avatar>\n             <static-user-avatar ng-if="!profileModal.uid" on-click-avatar="profileModal.onClickAvatar()" class="big" media-id="{{profileModal.user.userProfileModel.avatarMediaId}}" name="{{profileModal.user.userProfileModal.nick || profileModal.user.extContact.orgEmployeeModel.orgUserName}}"></static-user-avatar>\n         </div>\n         <div class="detail-info" ng-class="{\'has-user-ding-title\':profileModal.userInstance.dingTitles.length}">\n             <div class="name" title=""><span ng-bind-html="((!profileModal.user.userProfileModel.isDataComplete?profileModal.card.name:\'\') ||profileModal.user.remarkNameObj.alias||profileModal.user.userProfileModel.nick || profileModal.user.extContact.orgEmployeeModel.orgUserName)|emoj"></span></div>\n            <i class="iconfont icon-org" ng-if="profileModal.user.userProfileModel.isOrgUser"></i>\n            <i class="iconfont icon-follow"  htitle="{{profileModal.followMsg}}" ng-class="{\'follow\':profileModal.userInstance.isFollowing,\'unfollow\':!profileModal.userInstance.isFollowing}" ng-click="profileModal.toggleFollow()" ng-if="profileModal.showFollow && profileModal.uid"></i>\n            <i class="iconfont icon-card" ng-if="profileModal.user.userProfileModel" htitle="{{::\'dt_profile_send_card\'|i18next}}" ng-click="profileModal.sendCardToConv()">&#xe6ae;</i>\n         </div>\n         <div class="ding-title-container" ng-if="profileModal.userInstance.dingTitles.length">\n             <user-ding-title-list uid="{{profileModal.uid}}"></user-ding-title-list>\n         </div>\n         <div class="certification" ng-if="profileModal.showCertification" title="{{profileModal.certificationTitle}}">{{::\'dt_profile_dingtalk_auth\'|i18next}}{{profileModal.certificationTitle}}</div>\n         <button class="button add-friend" ng-if="profileModal.uid && profileModal.user.userPermissionModel.canBeSendFriendRequest && (profileModal.user.friendRequestModel.status === profileModal.FriendType.NON_RELATION||profileModal.user.friendRequestModel.status === profileModal.FriendType.PHONE_RELATION)" ng-click="profileModal.openRequestFriend()">{{::\'dt_profile_add_friend\'|i18next}}</button>\n         <button class="button red del-friend" ng-if="profileModal.uid &&profileModal.user.friendRequestModel.status === profileModal.FriendType.FRIEND"  ng-click="profileModal.removeFriend()">{{::\'dt_profile_remove_friend\'|i18next}}</button>\n         <button class="button disabled" ng-if="profileModal.uid && profileModal.user.friendRequestModel.status === profileModal.FriendType.HAVE_SEND_FRIEND_REQUEST">{{::\'dt_profile_request_friend\'|i18next}}</button>\n         <button class="button add-friend" ng-if="profileModal.uid && profileModal.user.friendRequestModel.status === profileModal.FriendType.RECEIVE_FRIEND_REQUEST" ng-click="profileModal.acceptFriend($event)">{{::\'dt_profile_accept_friend\'|i18next}}</button>\n     </header>\n     <article class="detail-content">\n         <loading ng-hide="!profileModal.isLoading"></loading>\n         <section ng-hide="profileModal.isLoading" class="detail-box" ng-repeat="orgData in profileModal.user.orgEmployees" ng-if="orgData.orgEmployeeModel" watermark watermark-location="{{profileModal.watermarkLocation.CONTACT}}" watermark-type="{{profileModal.watermarkTypeKey.SMALL}}" org-id="{{orgData.orgEmployeeModel.orgId}}">\n             <h5 class="box-title">{{orgData.orgEmployeeModel.orgName}}</h5>\n             <dl class="box-item">\n                 <dt class="label" htitle="{{::\'dt_profile_name\'|i18next}}">{{::\'dt_profile_name\'|i18next}}</dt>\n                 <dd class="cnt">{{orgData.orgEmployeeModel.orgUserName}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="profileModal.hideMobileNumber(orgData.orgEmployeeModel.orgUserMobile);">\n                 <dt class="label" htitle="{{::\'dt_profile_phone\'|i18next}}">{{::\'dt_profile_phone\'|i18next}}</dt>\n                 <dd class="cnt">+{{orgData.orgEmployeeModel.stateCode}}-{{profileModal.hideMobileNumber(orgData.orgEmployeeModel.orgUserMobile)}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="!profileModal.hideMobileNumber(orgData.orgEmployeeModel.orgUserMobile) && orgData.orgEmployeeModel.orgUserMobileDesensitize">\n                 <dt class="label" htitle="{{::\'dt_profile_phone\'|i18next}}">{{::\'dt_profile_phone\'|i18next}}</dt>\n                 <dd class="cnt">{{orgData.orgEmployeeModel._orgEmpMobile || orgData.orgEmployeeModel.orgUserMobileDesensitize}}</dd>\n                 <dd class="cnt show-number" ng-if="!orgData.orgEmployeeModel._orgEmpMobile">\n                     <a ng-class="{\'disabled\':orgData._tryShowing}" href="#" ng-click="profileModal.showUserOrgEmpMobile(orgData)">点击查看</a>\n                 </dd>\n             </dl>\n             <dl class="box-item" ng-if="orgData.orgEmployeeModel.orgAuthEmail || orgData.orgEmployeeModel.orgEmail">\n                 <dt class="label" htitle="{{::\'dt_profile_email\'|i18next}}">{{::\'dt_profile_email\'|i18next}}</dt>\n                 <dd class="cnt"><a href="mailto:{{orgData.orgEmployeeModel.orgAuthEmail || orgData.orgEmployeeModel.orgEmail}}">{{orgData.orgEmployeeModel.orgAuthEmail || orgData.orgEmployeeModel.orgEmail}}</a></dd>\n             </dl>\n             <dl class="box-item" ng-if="orgData.orgEmployeeModel.orgMasterDisplayName">\n                 <dt class="label" htitle="{{::\'dt_profile_master\'|i18next}}">{{::\'dt_profile_master\'|i18next}}</dt>\n                 <dd class="cnt">{{orgData.orgEmployeeModel.orgMasterDisplayName}}</dd>\n             </dl>\n             <dl class="box-item" ng-repeat="orgNodeItem in orgData.orgNodeItemList">\n                 <dt class="label" htitle="{{::\'dt_profile_dept\'|i18next}}">{{::\'dt_profile_dept\'|i18next}}</dt>\n                 <dd class="cnt">\n                     <a href="#" ng-click="profileModal.goApartment(orgData.orgDetail.orgId,orgNodeItem.deptId)">{{orgNodeItem.dept.deptName || orgData.orgEmployeeModel.depts[$index].deptName}}</a>\n                 </dd>\n             </dl>\n             <dl class="box-item" ng-repeat="item in orgData.orgExtPropertyList" class="item" ng-show="item.itemValue && item.itemValue.length > 0">\n                 <dt class="label" htitle="{{item.itemName}}">{{item.itemName}}</dt>\n                 <dd class="cnt">{{item.itemValue}}</dd>\n             </dl>\n         </section>\n         <section ng-hide="profileModal.isLoading" class="detail-box" ng-if="profileModal.showCustomerContact">\n             <h5 class="box-title">{{::\'dt_profile_customer_info\'|i18next}}</h5>\n             <dl class="box-item" ng-repeat="item in profileModal.crmContact track by $index" ng-if="item.itemValue">\n                 <dt class="label" >{{item.itemName}}</dt>\n                 <dd class="cnt">{{item.itemValue}}</dd>\n             </dl>\n\n         </section>\n\n         <section ng-hide="profileModal.isLoading" class="detail-box" ng-if="profileModal.showExternalContact" watermark watermark-location="{{profileModal.watermarkLocation.CONTACT}}" watermark-type="{{profileModal.watermarkTypeKey.SMALL}}" org-id="{{profileModal.user.extContact.orgEmployeeModel.orgId}}" ng-repeat="extContact in profileModal.user.extContacts">\n             <h5 class="box-title">{{::\'dt_profile_external_contacts\'|i18next}}<span ng-if="profileModal.user.extContacts.length > 1">-{{extContact.orgEmployeeModel.orgName}}</span></h5>\n             <dl class="box-item">\n                 <dt class="label" htitle="{{::\'dt_profile_name\'|i18next}}">{{::\'dt_profile_name\'|i18next}}</dt>\n                 <dd class="cnt">{{extContact.orgEmployeeModel.orgUserName}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="profileModal.hideMobileNumber(extContact.orgEmployeeModel.orgUserMobile);">\n                 <dt class="label" htitle="{{::\'dt_profile_phone\'|i18next}}">{{::\'dt_profile_phone\'|i18next}}</dt>\n                 <dd class="cnt">+{{extContact.orgEmployeeModel.stateCode}}-{{profileModal.hideMobileNumber(extContact.orgEmployeeModel.orgUserMobile)}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="extContact.orgEmployeeModel.orgEmail">\n                 <dt class="label" htitle="{{::\'dt_profile_email\'|i18next}}">{{::\'dt_profile_email\'|i18next}}</dt>\n                 <dd class="cnt"><a href="mailto:{{profileModal.user.extContact.orgEmployeeModel.orgEmail}}">{{extContact.orgEmployeeModel.orgEmail}}</a></dd>\n             </dl>\n             <dl class="box-item" ng-if="extContact.orgEmployeeModel.deptName">\n                 <dt class="label" htitle="{{::\'dt_profile_dept\'|i18next}}">{{::\'dt_profile_dept\'|i18next}}</dt>\n                 <dd class="cnt">{{extContact.orgEmployeeModel.deptName}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="extContact.orgEmployeeModel.companyName">\n                 <dt class="label" htitle="{{::\'dt_profile_company\'|i18next}}">{{::\'dt_profile_company\'|i18next}}</dt>\n                 <dd class="cnt">{{extContact.orgEmployeeModel.companyName}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="extContact.orgEmployeeModel.orgTitle">\n                 <dt class="label" htitle="{{::\'dt_profile_title\'|i18next}}">{{::\'dt_profile_title\'|i18next}}</dt>\n                 <dd class="cnt">{{extContact.orgEmployeeModel.orgTitle}}</dd>\n             </dl>\n             <dl class="box-item" ng-if="extContact.remark">\n                 <dt class="label" htitle="{{::\'dt_profile_remark\'|i18next}}">{{::\'dt_profile_remark\'|i18next}}</dt>\n                 <dd class="cnt">{{extContact.remark}}</dd>\n             </dl>\n             <dl class="box-item can-click" ng-click="profileModal.showOneBox()" ng-if="extContact.followRecordsBrief">\n                 <dt class="label" htitle="{{::\'dt_profile_one_box\'|i18next}}">{{::\'dt_profile_one_box\'|i18next}}</dt>\n                 <dd class="cnt">{{::\'dt_profile_one_box_detail\'|i18next:{value1:extContact.followRecordsBrief.totalCount || 0, value2:extContact.noFollowDay  }  }}</dd>\n                 <i class="iconfont right-arrow"></i>\n             </dl>\n             <dl class="box-item" ng-click="profileModal.onClickLabel(extContact)" ng-if="extContact.orgEmployeeModel.labels && extContact.orgEmployeeModel.labels.length > 0">\n                 <dt class="label" htitle="{{::\'dt_profile_tag\'|i18next}}">{{::\'dt_profile_tag\'|i18next}}</dt>\n                 <dd class="cnt">\n                     <ext-contact-label ng-repeat="label in extContact.orgEmployeeModel.labels" color="label.color" text="label.name"></ext-contact-label>\n                 </dd>\n                 <i class="iconfont right-arrow"></i>\n             </dl>\n             <dl class="box-item can-click" ng-if="extContact.bizCardMediaId" ng-click="profileModal.previewImg(extContact.bizCardMediaId)">\n                 <dt class="label" htitle="{{::\'dt_profile_card\'|i18next}}">{{::\'dt_profile_card\'|i18next}}</dt>\n                 <dd class="cnt" >{{::\'dt_profile_check_picture\'|i18next}}</dd>\n                 <i class="iconfont right-arrow"></i>\n             </dl>\n             <dl class="box-item can-click" ng-click="profileModal.openPermissionManage(extContact)">\n                 <dt class="label" htitle="{{::\'dt_profile_permission\'|i18next}}">{{::\'dt_profile_permission\'|i18next}}</dt>\n                 <dd class="cnt">\n                     <span ng-if="extContact.follower.orgEmployeeModel.orgUserName">{{::\'dt_profile_owner\'|i18next:{value1: extContact.follower.orgEmployeeModel.orgUserName} }}</span>\n                     <span ng-if="!extContact.follower.orgEmployeeModel.orgUserName">{{::\'dt_profile_permission_no_one\'|i18next}}</span>\n                     <span ng-if="extContact.permisstionCoWorkerNum!==0 || extContact.permisstionDeptNum!==0">{{::\'dt_profile_permission_share_info\'|i18next:{value1: extContact.permisstionCoWorkerNum, value2: extContact.permisstionDeptNum} }}</span>\n                 </dd>\n                 <i ng-if="extContact.permisstionCoWorkerNum!==0 || extContact.permisstionDeptNum!==0" class="iconfont right-arrow"></i>\n             </dl>\n             <dl class="box-item" ng-repeat="item in extContact.orgExtPropertyList track by item.itemName" ng-show="item.itemValue">\n                <dt class="label" htitle="{{item.itemName}}">{{item.itemName}}</dt>\n                 <dd class="cnt">{{item.itemValue}}</dd>\n             </dl>\n\n         </section>\n\n        <section class="detail-box" ng-hide="profileModal.isLoading || !profileModal.uid">\n            <h5 class="box-title">{{::\'dt_profile_personal_info\'|i18next}}</h5>\n            <dl class="box-item">\n                <dt class="label">{{::\'dt_profile_nick\'|i18next}}</dt>\n                <dd class="cnt">\n                    <span ng-bind-html="profileModal.user.userProfileModel.nick|emoj"></span>\n                    <span class="unactived" ng-if="!profileModal.user.userProfileModel.isActive">{{::\'dt_profile_not_active\'|i18next}}</span>\n                </dd>\n            </dl>\n            <dl class="box-item" ng-if="profileModal.showRemarkEdit">\n                <dt class="label">{{::\'dt_profile_remark\'|i18next}}</dt>\n                <edit-bar is-edit-bar-open="profileModal.isEditBarOpen" custom-value="profileModal.userInstance.remarkNameObj.alias" default-value="profileModal.userInstance.userProfileModel.nick" save-action="profileModal.saveRemarkName"></edit-bar>\n            </dl>\n            <dl class="box-item" ng-if="profileModal.user.userProfileModel.city">\n                <dt class="label">{{::\'dt_profile_region\'|i18next}}</dt>\n                <dd class="cnt">{{profileModal.user.userProfileModel.city}}</dd>\n            </dl>\n        </section>\n\n     </article>\n     <footer class="footer">\n        <div class="actions-wrapper" ng-show="!profileModal.isOpenAddFriend && (profileModal.user.userPermissionModel.canBeSentMsg || profileModal.showChatCall || profileModal.showSendDing)">\n             <a href="javascript:;" class="footer-item send-msg chatto-action-btn" ng-click="profileModal.chatTo(profileModal.user.userProfileModel.uid,$event)" ng-class="{\'disabled\':!profileModal.user.userPermissionModel.canBeSentMsg}">\n                 <i class="iconfont">&#xe61c;</i><span>{{::\'dt_profile_send_message\'|i18next}}</span>\n             </a>\n             <a href="javascript:;" class="footer-item free-call" ng-click="profileModal.createCall()" ng-class="{\'disabled\':!profileModal.showChatCall}">\n                 <i class="iconfont">&#xe6ef;</i><span>{{::\'dt_profile_dingtalk_call\'|i18next}}</span>\n             </a>\n             <a href="javascript:;" class="footer-item send-ding" ng-click="profileModal.sendDing()" ng-class="{\'disabled\':!profileModal.showSendDing}" >\n                 <i class="iconfont">&#xe6e5;</i><span>{{::\'dt_profile_send_ding\'|i18next}}</span>\n             </a>\n         </div>\n         <div class="add-friend-wrapper" ng-show="profileModal.isOpenAddFriend">\n             <p class="des">{{::\'dt_profile_input_friend_explain\'|i18next}}<a href="javascript:void(0)" class="profile-addFriend-back" ng-click="profileModal.closeRequestFriend();">{{::\'dt_common_back\'|i18next}}</a></p>\n\n             <input type="text" class="input req-msg" placeholder="{{::\'dt_profile_input_friend_explain\'|i18next}}" ng-model="profileModal.addFriendInfo" focus="profileModal.focusOnAddFriendInfo"/>\n             <button class="send-friend-req add-friend-btn" ng-class="{disabled:profileModal.isAdding || !profileModal.addFriendInfo}" ng-click="profileModal.sendFriend(profileModal.user.userProfileModel.uid,$event)">{{::\'dt_common_send\'|i18next}}</button>\n         </div>\n     </footer>\n </div>\n',
                        controller: "profileModalCtrl",
                        controllerAs: "profileModal",
                        resolve: {
                            uid: function () {
                                return r
                            },
                            orgStaffId: function () {
                                return i
                            },
                            orgExtId: function () {
                                return s
                            },
                            orgId: function () {
                                return n
                            },
                            mobile: function () {
                                return l
                            },
                            isAutoOpenRequest: function () {
                                return a
                            },
                            card: function () {
                                return d
                            }
                        },
                        enterTriggerEl: ".chatto-action-btn"
                    });
                return c.result
            })
        }
    }
    ]).controller("profileModalCtrl", ["$scope", "$modalInstance", "uid", "lwlog", "orgStaffId", "orgId", "mobile", "FriendI", "$rootScope", "toastService", "$timeout", "$confirm", "conversationWithSDK", "isAutoOpenRequest", "sendDingModalService", "card", "$state", "imgPreviewService", "ExternalContactI", "orgExtId", "sendCardToConv", "permissionManageModal", "openOneBox", "externalLabelEditModal", "callSelectorModal", "ContactI", "userManager", "imLog", function (e, o, t, r, i, n, l, a, d, s, c, f, u, p, g, m, M, b, h, x, v, y, E, w, C, I, k, T) {
        function P() {
            N.followMsg = N.userInstance && N.userInstance.isFollowing ? i18next.t("dt_profile_follow_cancel") : i18next.t("dt_profile_follow_vip")
        }
        var N = this
          , R = $my.uid;
        N.showChatCall = !1,
        N.isLoading = !0,
        N.isOpenAddFriend = !1,
        N.uid = t,
        N.focusOnAddFriendInfo = !1,
        N.addFriendInfo = null,
        N.showRemarkEdit = !1,
        N.showSendDing = !1,
        N.FriendType = FriendType,
        N.isEditBarOpen = !1,
        N.isCalling = !1,
        N.card = m,
        N.showCertification = !1,
        N.certificationTitle = "",
        N.isFollowing = !1,
        N.followMsg = i18next.t("dt_profile_follow_vip"),
        N.showFollow = !1,
        N.showExternalContact = !1,
        N.showCustomerContact = !1,
        N.watermarkLocation = watermarkLocation,
        N.watermarkTypeKey = watermarkTypeKey,
        t && (r.commLog("profile_one_user_enter", "uid=" + t),
        n = null);
        var L = function () {
            e.$evalAsync()
        }
          , D = function (e) {
              N.userInstance = e,
              P(),
              L()
          };
        N.previewImg = function (e) {
            b.preview({
                mediaId: e
            }, null, null, {
                hideSaveEmotion: !0,
                hideDownloadBtn: !0,
                hideSaveToCloud: !0
            }),
            o.close()
        }
        ,
        N.requestExtContact = function (e, o, t) {
            function r(e) {
                200 === e.code && (N.user.extContacts = [].concat(e.body),
                N.user.extContacts.forEach(function (e) {
                    e.followRecordsBrief && (e.followRecordsBrief.lastRecordDate ? e.noFollowDay = parseInt((+new Date - e.followRecordsBrief.lastRecordDate) / 1e3 / 3600 / 24, 10) : e.noFollowDay = 0),
                    _.get(e, "permission.permits") && (e.permisstionCoWorkerNum = e.permission.permits.filter(function (e) {
                        return e.nodeType === orgNodeType.PEOPLE
                    }).length,
                    e.permisstionDeptNum = e.permission.permits.filter(function (e) {
                        return e.nodeType === orgNodeType.DEPT
                    }).length)
                }),
                N.showExternalContact = !0),
                N.isLoading = !1,
                L()
            }
            N.isLoading = !0,
            e ? h.getContactsByUid(e, r.bind(this)) : o && h.getContact(o, t || 0, r.bind(this))
        }
        ,
        k.getUserWithExt(t, i, l, n).then(function (o) {
            if (o && e.$$destroyed !== !0) {
                if (N.isLoading = !1,
                N.isAdding = !1,
                N.user = o,
                N.uid = o.userProfileModel.uid,
                _.get(o, "relationModel.isInExternalContact") === !0 && N.requestExtContact(N.uid, i, x),
                o.userPermissionModel.canBeSendConference && parseInt(R) !== N.uid && (N.showChatCall = !0),
                o.userPermissionModel.canBeSendDing && parseInt(R) !== N.uid && (N.showSendDing = !0),
                parseInt(R) !== N.uid && (N.showFollow = !0),
                o.crmContactsV2 && o.crmContactsV2[0]) {
                    N.showCustomerContact = !0;
                    var t = o.crmContactsV2[0]
                      , n = [{
                          itemName: i18next.t("dt_profile_name"),
                          itemValue: t.name
                      }, {
                          itemName: i18next.t("dt_profile_phone"),
                          itemValue: "+" + t.stateCode + "-" + t.mobile
                      }, {
                          itemName: i18next.t("dt_profile_customer_company"),
                          itemValue: t.customerName
                      }];
                    Array.isArray(t.contactExtPropertyList) && (n = n.concat(t.contactExtPropertyList)),
                    N.crmContact = n
                }
                p && N.openRequestFriend(),
                N.uid && parseInt(R) !== N.uid && (N.showRemarkEdit = !0),
                N.avatarUrl = uriResolve.assetsResolve("app/img/profile_modal_bg.png"),
                o.userProfileModel.avatarMediaId && (N.avatarUrl = mediaId.mid2Url(o.userProfileModel.avatarMediaId, {
                    imageSize: "origin"
                })),
                N.showCertification = o.userProfileModel.isOrgUser && o.userProfileModel.labels.length,
                N.showCertification && (N.certificationTitle = o.userProfileModel.labels.join(" ")),
                N.uid && (viewBridge.addHostListener(bridgeEvent.USER_UPDATE, N.uid, D),
                k.getUsers([N.uid]).then(function (o) {
                    o && o[0] && e.$$destroyed !== !0 && (N.userInstance = o[0],
                    D(o[0]))
                })),
                L(),
                r.nativeLog(r.CODES.PROFILE_SAFE, [(new Date).getTime(), N.uid].join(String.fromCharCode(7)))
            }
        }, function () {
            setTimeout(function () {
                s.show(i18next.t("pc_error_get_user"), {
                    type: "error"
                }),
                o.dismiss()
            }, 400)
        }),
        e.$watch(function () {
            return N.isEditBarOpen
        }, function (e) {
            e ? o.changeEnterEl(".edit-bar-confirm-btn") : o.changeEnterEl(".chatto-action-btn")
        }),
        N.showOneBox = function () {
            r.commLog("profile_record_click", ""),
            E.openModal({
                openId: t
            })
        }
        ,
        N.createCall = function () {
            N.showChatCall && (localLog.info("create call from profile", t),
            o.close(),
            C({
                uid: t
            }))
        }
        ,
        N.saveRemarkName = function (e) {
            return N.userInstance ? userHelper.setRemark(N.userInstance, e.value).then(function () {
                return Promise.resolve()
            }, function () {
                return s.show(i18next.t("pc_error_modify_remark"), {
                    type: "error"
                }),
                Promise.reject()
            }) : (localLog.error("user instance is not ready when save remark name"),
            s.show(i18next.t("pc_error_modify_remark"), {
                type: "error"
            }),
            Promise.reject())
        }
        ,
        N.toggleFollow = function () {
            N.userInstance ? N.userInstance.isFollowing ? userHelper.unFollow(N.userInstance).then(function () { }, function () {
                s.show(i18next.t("pc_error_cancel_follow"), {
                    type: "error"
                })
            }) : userHelper.follow(N.userInstance).then(function () { }, function () {
                s.show(i18next.t("pc_error_follow"), {
                    type: "error"
                })
            }) : localLog.error("user instance is not ready when toggle follow")
        }
        ,
        N.hideMobileNumber = function (e) {
            if (this.user.userPermissionModel.couldShowMobile)
                return e;
            if (!e)
                return "";
            for (var e = e.toString(), o = e.substring(0, 3), t = e.length, r = e.substring(t - 4, t), i = t - 7, n = "", l = 0; l < i; l++)
                n += "*";
            return o + n + r
        }
        ,
        N.openPermissionManage = function (e) {
            0 === e.permisstionCoWorkerNum && 0 === e.permisstionDeptNum || (r.commLog("profile_shareto_click", ""),
            o.close(),
            y(e))
        }
        ,
        N.onClickLabel = function (e) {
            r.commLog("profile_lable_click", ""),
            o.close(),
            w(e)
        }
        ,
        N.chatTo = function (e) {
            if (N.user.userPermissionModel.canBeSentMsg) {
                var t = [e, $my.uid].sort(function (e, o) {
                    return e - o
                }).join(":");
                T.trace(t, IMLogType.PROFILE),
                d.$broadcast("leftpannel.openChatByUid", {
                    uid: e
                }),
                r.commLog("profile_sendmsg_click", "uid=" + e),
                o.close()
            }
        }
        ,
        N.openRequestFriend = function () {
            if (N.user.friendRequestModel.status == FriendType.NON_RELATION || N.user.friendRequestModel.status == FriendType.RECEIVE_FRIEND_REQUEST || N.user.friendRequestModel.status == FriendType.PHONE_RELATION) {
                N.isOpenAddFriend = !0;
                var e = $my.userProfileModel.nick;
                N.addFriendInfo = i18next.t("dt_profile_i_am") + e,
                c(function () {
                    N.focusOnAddFriendInfo = !0
                }, 200)
            }
            o.changeEnterEl(".add-friend-btn")
        }
        ,
        N.closeRequestFriend = function () {
            N.isOpenAddFriend = !1,
            o.changeEnterEl(".chatto-action-btn")
        }
        ,
        N.sendFriend = function (e) {
            if (N.addFriendInfo && e && !N.isAdding) {
                if (N.addFriendInfo.length > 20)
                    return void s.show(i18next.t("pc_error_request_note_digit"), {
                        type: "error"
                    });
                N.isAdding = !0,
                a.sendFriendRequest({
                    uid: e,
                    source: 3,
                    remark: N.addFriendInfo
                }, function (e) {
                    200 == e.code ? N.user.friendRequestModel.status = FriendType.HAVE_SEND_FRIEND_REQUEST : e.body && e.body.reason && s.show(e.body.reason, {
                        type: "error"
                    }),
                    N.isAdding = !1,
                    N.isOpenAddFriend = !1,
                    o.changeEnterEl(".chatto-action-btn"),
                    L()
                })
            }
        }
        ,
        N.acceptFriend = function (e) {
            e.preventDefault(),
            N.userInstance ? userHelper.acceptFriend(N.userInstance).then(function (e) {
                N.user.friendRequestModel.status = FriendType.FRIEND,
                N.user.userPermissionModel && (N.user.userPermissionModel.canBeSentMsg = !0),
                L()
            }).catch(function (e) {
                e.body && e.body.reason && s.show(e.body.reason, {
                    type: "error"
                })
            }) : localLog.error("user instance is not ready when accept friend")
        }
        ,
        N.removeFriend = function () {
            o.close(),
            f({
                title: i18next.t("pc_comfirm_sure_title"),
                content: i18next.t("pc_comfirm_remove_friend_content"),
                isWarning: !0
            }).then(function () {
                N.userInstance ? userHelper.removeFriend(N.userInstance).then(function () {
                    N.user.friendRequestModel.status = FriendType.NON_RELATION;
                    var e = u.createCid([N.user.userProfileModel.uid, $my.uid]);
                    u.hideConv(e, !1)
                }) : localLog.error("user instance is not ready when remote friend")
            })
        }
        ,
        N.sendDing = function () {
            if (N.showSendDing) {
                var e = []
                  , o = [];
                e.push(N.user.userProfileModel.uid),
                o.push(N.user.userProfileModel.uid),
                g.showModal({
                    selectedUids: e,
                    customUids: o
                }),
                r.commLog("profile_bottom_ding_click", "")
            }
        }
        ,
        N.goApartment = function (e, r) {
            var n = {
                orgId: e,
                deptId: r,
                uid: t,
                staffId: i
            };
            M.go("authorized.contact", n, {
                reload: !0
            }),
            o.close()
        }
        ,
        N.onClickAvatar = function () {
            if (N.user && N.user.userProfileModel && N.user.userProfileModel.avatarMediaId) {
                var e = N.user.userProfileModel.avatarMediaId;
                e && (b.preview({
                    mediaId: e
                }, null, null, {
                    hideSaveEmotion: !0,
                    hideDownloadBtn: !0,
                    hideSaveToCloud: !0
                }),
                o.close())
            }
        }
        ,
        N.sendCardToConv = function () {
            N.user && N.user.userProfileModel && (o.close(),
            v.show(N.user.userProfileModel))
        }
        ,
        N.showUserOrgEmpMobile = function (e) {
            e._tryShowing || (e._tryShowing = !0,
            I.getOrgEmpMobile(e.orgDetail.orgId, N.user.userProfileModel.uid, orgEmpMobileSource.PROFILE).result.then(function (o) {
                e.orgEmployeeModel._orgEmpMobile = o.body,
                e._tryShowing = !1,
                L()
            }).catch(function (o) {
                e._tryShowing = !1,
                s.show(i18next.t("pc_error_check"), {
                    type: "error"
                }),
                localLog.error("getOrgEmpMobile error", JSON.stringify(o)),
                L()
            }))
        }
        ,
        e.$on("$destroy", function () {
            N.userInstance && viewBridge.addHostListener(bridgeEvent.USER_UPDATE, userHelper.getId(N.userInstance), D)
        })
    }
    ]).controller("robotProfileCtrl", ["$scope", "$modalInstance", "uid", "IDLGroupApp", "toastService", "openCommModal", "sendCardToConv", "userManager", "lwlog", function (e, o, t, r, i, n, l, a, d) {
        this.robot = null,
        this.TEXT = {
            intro: i18next.t("dt_im_robot_intro"),
            msgPreview: i18next.t("dt_robot_message_preview"),
            developer: i18next.t("dt_robot_developer"),
            source: i18next.t("dt_robot_source"),
            addRobot: i18next.t("dt_robot_add_robot"),
            robotManagement: i18next.t("dt_robot_robot_management")
        };
        var s = cloudSetting.getConfig(CSMap.ROBOT.module, CSMap.ROBOT.key);
        this.isShowRobotEntry = !1,
        _.isObject(s) && (this.isShowRobotEntry = "1" === s.settingValue),
        r.getBotProfile(t).result.then(function (o) {
            this.robot = o.body,
            this.robot.icon && (this.robot.iconURL = mediaId.mid2Url(this.robot.icon)),
            this.robot.previewMediaId && (this.robot.previewURL = mediaId.mid2Url(this.robot.previewMediaId)),
            e.$evalAsync()
        }
        .bind(this)).catch(function (e) {
            var t = _.get(e, "body.reason") || i18next.t("pc_error_get_robot");
            setTimeout(function () {
                i.show(t, {
                    type: "error"
                }),
                o.dismiss()
            }, 400)
        }),
        this.sendCardToConv = function () {
            a.getUsers([t]).then(function (e) {
                e && e[0] && (o.close(),
                l.show(e[0].userProfileModel))
            })
        }
        ,
        this.addMore = function () {
            var e = new Jsuri(globalURL.ROBOT_SETTING_URL);
            this.robot && this.robot.templateId && e.addQueryParam("template_id", this.robot.templateId),
            n({
                size: "default",
                url: e.toString(),
                title: this.TEXT.robotManagement
            }),
            d.commLog("open_robot_setting_from_profile", "template_id=" + this.robot.templateId + "&openid=" + t),
            o.close()
        }
        .bind(this)
    }
    ]),
    module.exports = moduleName;
}
    , {
        "../../component/user/userDingTitleList.js": 50,
        "../../directive/avatar/userAvatar": 57,
        "../../directive/watermark": 147,
        "../../directive/widget/editBar": 163,
        "../../directive/widget/extContactLabel": 164,
        "../../directive/widget/focus": 165,
        "../../service/frameContainer/commModal": 405,
        "../../service/globalUrl": 417,
        "../../service/log/imLog": 439,
        "../../service/log/imLogType": 440,
        "../../service/modal/sendDingModal": 494,
        "../../service/org/OrgNodeType.js": 557,
        "../../service/uriResolve/resolve": 697,
        "../../service/user/my": 704,
        "../../service/watermark/watermarkLocation": 724,
        "../../service/watermark/watermarkType": 725,
        "../CSConfig/CSMap": 244,
        "../bridge/bridgeEvent": 278,
        "../bridge/viewBridge": 280,
        "../conversation/conversationWithSDK": 316,
        "../events.js": 394,
        "../friend/FriendType": 413,
        "../img/imgPreviewService": 428,
        "../log/localLog": 441,
        "../log/lwlog": 444,
        "../onebox/oneboxModal.js": 511,
        "../toast/toast": 682,
        "../user/UserType": 701,
        "../user/my": 704,
        "../user/orgEmpMobileSource": 706,
        "../user/userHelper": 710,
        "../user/userManager": 711,
        "./callSelectorModal.js": 466,
        "./confirm": 467,
        "./externalLabelEditModal.js": 477,
        "./modal": 480,
        "./permissionManage": 485,
        "./sendCardToConv": 493,
        "@ali/ding-api": 781,
        "@ali/ding-mediaid": 786,
        "@ali/wksdk": 869,
        "i18next": 1036,
        "jsuri": 1039,
        "lodash": 1057,
        "path": 7
    }]