[function (require, module, exports) {
    "use strict";

    var angular = require("angular");

    require("angular-ui-router"),
		require("angular-ui-router.statehelper"),
		require("angular-sanitize"),
		require("@ali/ui-select"),
		require("./service/i18next/i18nextManager").initI18next();

    var path = require("path"),
		WK = require("@ali/wksdk"),
		appKey = require("./service/appInfo").APP_KEY,
		hostConfig = require("./service/hostConfig"),
		dbCollection = require("./service/db/dbCollection"),
		AtOpenIdType = require("./service/conversation/AtOpenIdType"),
		ua = require("./service/ua"),
		storage = require("./service/storage/storage"),
		nw = require("./service/app/nw"),
		env = require("./service/env/env"),
		localLog = require("./service/log/localLog");

    env.isNativeLWP && (
			dingtalk.login.setWVHeader("im:3,au:3,sy:2"),

			dingtalk.login.registerOnSubscribe(function (n) {
			    try {
			        var e = JSON.parse(n)
			    } catch (n) {
			        throw localLog.error("on subscribe "),
						n
			    }
			    var i = e.openId,
					t = WK.getSyncInfo.getSyncInfo(i);
			    WK.cloudSetting.setOpenId(i);
			    var o = WK.cloudSetting.getVersion(),
					a = t.pts + "," + t.highPts + ";" + t.seq + ";" + t.timestamp + ";" + (t.tooLong2Tag ? t.tooLong2Tag : "");
			    console.log("set sync and ver", a, o),
					dingtalk.login.setSyncAndVer(a, o + "")
			}),

			WK.config.set("NET", dingtalk.net)
		),

		WK.config.set("appKey", appKey),
		WK.config.set("beforeAuthLWPWhiteList", ["/r/Adaptor/LoginI/umidToken", "/r/Adaptor/LoginI/login", "/r/Adaptor/LoginI/sendSmsCode", "/r/Adaptor/LoginI/tokenLogin"]),
		WK.config.set("ua", ua.fullUA),
		WK.config.set("AtOpenIdType", AtOpenIdType),
		WK.config.set("log", require("./service/log/localLog")),
		WK.config.set("didByCookie", !0),
		WK.config.set("backUpWSURL", hostConfig.wsAlternative),
		WK.config.set("aladinUrl", hostConfig.aladin),

		ua.isDesktop && WK.config.set("dbCollection", dbCollection),

		WK.mainInit(),

		require("./module/chat/index"),
		require("./module/contact/index"),
		require("./module/contact/friendRequest"),
		require("./module/login/auth"),
		require("./module/login/index"),
		require("./module/list/index"),
		require("./module/companyCallCenter/index"),
		require("./module/nocontent/nocontent"),
		require("./module/home/index"),
		require("./module/im/index"),
		require("./directive/infiniteScroll"),
		require("./directive/log"),
		require("./filter/filter"),
		require("./directive/widget/preventDrag"),
		require("./service/goldlog/staylog"),
		require("./module/login/scanCodeLogin"),
		require("./service/widget/screenshot.js"),
		require("./service/log/exceptionLog"),
		require("./service/toast/toast"),
		require("./service/appInit/init"),
		require("./directive/widget/avatar/avatar"),
		require("./directive/widget/breadcrumbs"),
		require("./directive/widget/hoverTip"),

		angular.module("ddWeb", ["ui.router", "ui.router.stateHelper",
			"ddWeb.contact", "ddWeb.chat", "ddWeb.home", "ddWeb.im", "ddWeb.list", "ddWeb.companyCallCenter", "ddWeb.auth", "ddWeb.nocontent", "ddWeb.login", "ddWeb.filter", "ddWeb.infiniteScroll", "ddWeb.log", "ddWeb.scanCodeLogin", "ddWeb.friendRequest", "ddWeb.service.screenshot", "ddWeb.log.exceptionLog", "ddWeb.preventDrag", "ddWeb.goldlog.staylog", "ddWeb.widget.avatar", "ddWeb.widget.breadcrumbs", "ddWeb.widget.hoverTip", "ddWeb.appInit.init", require("./lib/ng-i18next"), require("./module/contact/groupRequest"), require("./directive/widget/loading/loading"), require("./service/log/log"), require("./directive/widget/ddCopy"), require("./directive/widget/ddClickUrl"), require("./module/apiTest/apiTest"), require("./module/microApp/index"), require("./service/app/silentUpdate"), require("./module/cspace/index"), require("./module/cmail/index"), require("./module/contact/clients"), require("./module/contact/externalContact")
		])
		.config(["stateHelperProvider", "$compileProvider", function (n, e) {
		    e.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|app|chrome-extension):|data:image\/)/),
				n.setNestedState({
				    name: "auth",
				    controller: "auth as auth",
				    template: '<div class="welcome">\n    <img ng-src="{{auth.welcomeImg}}" alt="">\n    <p ng-i18next="pc_login_auth_connect"></p>\n</div>\n'
				}),
				n.setNestedState({
				    name: "login",
				    template: '<div id="header" class="login-header" ng-dblclick="login.onHeaderDblClick()"><!-- 此dom不可变更 -->\n    <window-operations></window-operations>\n</div>\n<div id="body">\n    <div class="login-form tab login-tab">\n        <ul class="tab-items" ng-click="login.changeLanguage()">\n            <li class="tab-item" ng-class="{current:login.currentState===\'login.scanCodeLogin\'}" ui-sref=".scanCodeLogin" >{{::login.text.scancode}}</li>\n            <li class="tab-item" ng-class="{current:login.currentState===\'login.passwordLogin\'}" ui-sref=".passwordLogin" >{{::login.text.password}}</li>\n        </ul>\n        <div ui-view class="tab-contents" ></div>\n    </div>\n    <div class="networkdetect" ng-click="login.networkdetect()" >{{::login.text.abnormal}}</div>\n</div>\n',
				    controller: "login as login",
				    children: [{
				        name: "scanCodeLogin",
				        template: '<div class="tab-content qrcode-login current" id="qrcode-login">\n    <div class="qrcode-wrapper">\n        <qrcode class="qrcode-img" text="scanCodeLogin.qrcodeOpt.data" size="scanCodeLogin.qrcodeOpt.size" version="scanCodeLogin.qrcodeOpt.version" correct-level="scanCodeLogin.qrcodeOpt.level" ng-show="scanCodeLogin.hasQrcode"></qrcode>\n        <div class="qr-mask" ng-if="scanCodeLogin.maskDisplay"></div>\n        <loading ng-if="!scanCodeLogin.hasQrcode && !scanCodeLogin.maskDisplay && !scanCodeLogin.errMsg || scanCodeLogin.maskDisplay && !scanCodeLogin.errMsg"></loading>\n        <span class="err-info" ng-if="scanCodeLogin.maskDisplay && scanCodeLogin.errMsg">{{scanCodeLogin.errMsg}}</span>\n    </div>\n\t<p class="rem">\n        <span>{{::scanCodeLogin.text.pc_login_scancode_tip}}</span>\n        <a ng-class="{\'refresh-disabled\':!scanCodeLogin.canRefresh}" class="refresh-qrcode" href="#" ng-click="scanCodeLogin.updateQrCode()"><i class="iconfont">&#xe636;</i><span >{{::scanCodeLogin.text.pc_login_scancode_refresh}}</span></a>\n    </p>\n    <account-menus></account-menus>\n</div>\n',
				        controller: "scanCodeLogin as scanCodeLogin"
				    }, {
				        name: "passwordLogin",
				        template: '<div class="tab-content password-login current">\n    <form ng-submit="passwordLogin.submit()" name="passwordForm">\n        <div class="avatar-halo" ng-show="passwordLogin.connecting"></div>\n        <div class="avatar biger border-thick" ng-if="(!passwordLogin.user.nick && !passwordLogin.user.avatarMediaId)|| !passwordLogin.isCurrentUser">\n            <img src="https://gtms03.alicdn.com/tps/i3/TB1opXxHXXXXXahXpXXvBLt6FXX-230-230.png" class="country-img" alt="" />\n        </div>\n        <dd-avatar mediaid="passwordLogin.user.avatarMediaId" nick="passwordLogin.user.nick" class="biger border-thick" ng-if="(passwordLogin.user.nick || passwordLogin.user.avatarMediaId) && passwordLogin.isCurrentUser"></dd-avatar>\n        <div class="clearfix">\n            <phone-input phone="passwordLogin.telephone" country-key="passwordLogin.countryKey" focus-on="passwordLogin.focusPhone" on-change="passwordLogin.onPhoneChange(data)"></phone-input>\n        </div>\n        <div class="clearfix">\n            <input class="fm-input password" ng-change="passwordLogin.submitable=true" ng-minlength="4" ng-model="passwordLogin.password" focus="passwordLogin.focusPhone" type="password" name="verification" placeholder="{{::passwordLogin.text.password_input_placeholder}}" ng-class="{disabled:!passwordLogin.phoneValid}" required>\n        </div>\n        <button type="submit" class="blue big" ng-disabled="!passwordLogin.submitable|| !passwordLogin.phoneValid || passwordForm.$invalid" >{{::passwordLogin.text.button}}</button>\n        <div class="toast warning" ng-click="passwordLogin.loginError.msg=\'\'"ng-if="passwordLogin.loginError.msg"><i class="iconfont">&#xe63d;</i>{{passwordLogin.loginError.msg}}</div>\n        <account-menus phone="passwordLogin.telephone" country-key="passwordLogin.countryKey"></account-menus>\n        <div class="auto-login-box" ng-if="passwordLogin.isDesktop" htitle="{{::passwordLogin.text.button_auto_tip}}" htitle-direction="top" htitle-offset="left">\n            <input type="checkbox" id="auto-login-input" ng-model="loginState.isAutoLogin"/>\n            <label for="auto-login-input" >{{::passwordLogin.text.button_auto}}</label>\n        </div>\n    </form>\n    <div class="sms-verify shadow" ng-show="passwordLogin.needSmsVerify">\n        <form ng-submit="passwordLogin.verifySmsCode()">\n            <p class="desc" >{{::passwordLogin.text.smscode_tip}}</p>\n            <div class="info-field clearfix">\n                <input class="fm-input phone" disabled="true" value="{{ passwordLogin.fullPhone }}" />\n                <div class="send-form-button-wrapper">\n                    <countdown count-from="passwordLogin.countFrom" on-timeout="passwordLogin.countTimeout()" ng-show="passwordLogin.countFrom > 0"></countdown>\n                    <button type="button" ng-class="{disabled:passwordLogin.sendCodeDisable}"  ng-click="passwordLogin.sendSmsCode()" class="send-form-button">{{::passwordLogin.text.code_send}}</button>\n                </div>\n            </div>\n            <input autocomplete="off" class="fm-input smscode" ng-change="passwordLogin.smsCodeChange()" placeholder="{{::passwordLogin.text.code_placeholder}}" ng-model="passwordLogin.smsCode" />\n            <button type="submit" class="blue big"  ng-disabled="!passwordLogin.smsCode || passwordLogin.smsCodeSubmitDisabled" >{{::passwordLogin.text.botton_confirm}}</button>\n            <div class="toast warning" ng-show="passwordLogin.smsCodeErrMsg" ng-click="passwordLogin.clearSendSmsErrMsg()"><i class="iconfont">&#xe63d;</i>{{passwordLogin.smsCodeErrMsg}}</div>\n        </form>\n    </div>\n</div>\n',
				        controller: "passwordLogin as passwordLogin"
				    }]
				}),
				n.setNestedState({
				    name: "authorized",
				    template: '<div id="layout-main" dingtalk-theme>\n    <div id="header" ng-dblclick="home.onHeaderDblClick($event)">\n        <window-operations></window-operations>\n        <upload-list htitle="{{::home.text.pc_menu_upload_download}}" htitle-offset="left"></upload-list>\n        <!-- <div class="call-entry" htitle="{{::home.text.dt_menu_tel_title}}" htitle-offset="left">\n            <unread-call></unread-call>\n            <i class="iconfont" ng-click="home.onTelClick()">&#xe6ef;</i>\n        </div> -->\n        <ding-box ng-if="home.showDingBox"></ding-box>\n        <search-bar2 support-activate-shortcut="true" ng-cloak></search-bar2>\n    </div>\n    <div id="body">\n        <div id="menu-pannel"><!-- 此dom不可变更 -->\n            <div class="profile">\n                <user-avatar class="big-52 with-border" uid="{{ home.$my.userProfileModel.uid }}" open-profile="1"></user-avatar>\n                <div class="connecting-bar" >\n                    <div class="connecting-bar-inner" ng-if="home.login_state === 1">\n                        <div class="connecting-icon error"></div>\n                        <span class="connecting-tip">{{::home.text.pc_main_panel_connecting}}</span>\n                    </div>\n                </div>\n            </div>\n\n            <ul class="main-menus">\n                <li class="menu-item menu-message" ng-click="home.goState(\'authorized.im\')"\n                        ng-class="{selected:home.$state.includes(\'authorized.im\')}"\n                        ng-dblclick="home.scrollToUnReadConv()">\n                    <div class="menu-item-content">\n                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_conversation_title}}" htitle-direction="right"></i>\n                        <all-conv-unread-count></all-conv-unread-count>\n                    </div>\n                </li>\n                <li class="menu-item menu-ding" ng-click="home.goState(\'authorized.ding\')"\n                    ng-class="{selected:home.$state.includes(\'authorized.ding\')}">\n                    <div class="menu-item-content">\n                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_ding_title}}" htitle-direction="right"></i>\n                        <span class="unread-num ding-unread-num" ng-if="home.receiveList.newCount!==0"><em>{{home.receiveList.newCount}}</em></span>\n                        <i ng-if="home.receiveList.newCount===0&&(home.receiveList.hasNewComment||home.sendList.hasNewComment)" class="iconfont unread-dot ding-unread-dot">&#xe608;</i>\n                    </div>\n                </li>\n                <li class="menu-item menu-company-call-center" ng-click="home.onTelClick()"\n                    ng-class="{selected:home.$state.includes(\'authorized.companyCallCenter\')}" >\n                    <div class="menu-item-content">\n                    <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_tel_title}}" htitle-direction="right"></i>\n                        <unread-call></unread-call>\n                    </div>\n                </li>\n                <li class="menu-item menu-contact"\n                    ng-click="home.onContactClick()"\n                    ng-class="{selected:home.$state.includes(\'authorized.contact\')}">\n                    <div class="menu-item-content">\n                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_contact_title}}" htitle-direction="right"></i>\n                    </div>\n                </li>\n                <li class="menu-item menu-micro-app" ng-if="home.isShowMicroApp && !home.ua.isDesktop || home.isShowMicroApp && home.ua.isDesktop && !home.isShowWorkIndependent" ng-click="home.onMicroAppClick()"\n                    ng-class="{selected:home.$state.includes(\'authorized.microApp\')}">\n                    <div class="menu-item-content">\n                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_work_title}}" htitle-direction="right"></i>\n                    </div>\n                </li>\n                <li class="menu-item menu-micro-app" ng-if="home.ua.isDesktop && home.isShowMicroApp && home.isShowWorkIndependent" ng-click="home.openWork()"\n                    ng-class="{selected: home.workOpenState }">\n                    <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_work_title}}" htitle-direction="right"></i>\n                </li>\n                <li class="menu-item menu-cspace" ng-click="home.goState(\'authorized.cspace\')"\n                    ng-class="{selected:home.$state.includes(\'authorized.cspace\')}"\n                    log="tab_space_click">\n                    <div class="menu-item-content">\n                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_space_title}}" htitle-direction="right"></i>\n                        <unread-cspace></unread-cspace>\n                    </div>\n                </li>\n            </ul>\n            <ul class="extra-options">\n                <div class="extra-options-inner">\n                    <org-email></org-email>\n                    <li class="extra-item more-actions">\n                        <div function-menu></div>\n                    </li>\n                    <org-admin></org-admin>\n                    <li class="extra-item settings" >\n                        <div setting-menu></div>\n                    </li>\n                </div>\n            </ul>\n        </div>\n        <div ui-view id="menu-pannel-body"></div>\n    </div>\n</div>\n',
				    controller: "home as home",
				    children: [{
				        name: "im",
				        template: '<div id="sub-menu-pannel" class="conv-list-pannel"\n    layout-resize="im.layoutResizeConf.direction"\n    min-width="im.layoutResizeConf.minWidth"\n    max-width="im.layoutResizeConf.maxWidth"\n    storage-key="im.layoutResizeConf.storageKey"\n    get-max-width="im.layoutResizeConf.getMaxWidth()">\n    <conv-list></conv-list>\n</div>\n<div ui-view id="content-pannel"></div>\n',
				        controller: "im as im",
				        children: [{
				            name: "nocontent",
				            template: '<div class="conv-detail-pannel">\n    <div class="nocontent-logo" >\n        <div>\n            <img ng-src="{{nocontent.welcomeImg}}" alt="欢迎">\n        </div>\n    </div>\n    <div class="nocontent-tips" >\n        <p ng-show="nocontent.timeType == \'morning\'"><img ng-src="{{nocontent.morningImg}}" alt="早上好"> 早上好，今天请继续加油！</p>\n        <p ng-show="nocontent.timeType == \'afternoon\'"><img ng-src="{{nocontent.afternoonImg}}" alt="下午好"> 下午好，喝杯茶吧，让精神抖擞起来。</p>\n        <p ng-show="nocontent.timeType == \'night\'"><img ng-src="{{nocontent.nightImg}}" alt="晚上好"> 晚上好，请注意休息。</p>\n    </div>\n\n</div>\n',
				            controller: "nocontent as nocontent"
				        }, {
				            name: "chat",
				            template: '<div class="conv-detail-pannel" drag-to-upload>\n    <div class="content-pannel-head chat-head">\n        <div class="avatar-wrap">\n            <group-avatar cid="{{ chat.conv.convId }}"></group-avatar>\n            <user-ding-title-list just-show-main ng-if="chat.isSingle" uid=\'{{chat.uid}}\' class="user-ding-title-list"></user-ding-title-list>\n        </div>\n        <div class="conv-title">\n            <div class="title">\n                <span ng-bind-html="chat.conv.baseConversation.title|emoj"></span>\n                <i class="icon-company" htitleshow="{{!!chat.orgName}}" htitle="{{chat.orgName}}" ng-if="chat.conv.baseConversation.tag==chat.ConvType.COMPANY_GROUP||chat.conv.baseConversation.tag==chat.ConvType.ENCRYPT_CHAT" ng-class="{\'icon-safety-single\': chat.conv.isSafetySingle, \'icon-dept-company\':chat.conv.isDeptGroup ,\'icon-all-user-company\': chat.conv.isAllUserGroup, \'icon-safety\': chat.conv.isSafety}"></i>\n                <div class="conv-title-typing" ng-if="chat.conv.isShowTyping">({{chat.typingWords}})</div>\n            </div>\n            <div class="desc">{{ chat.titleDesc }}</div>\n        </div>\n        <div class="conv-operations">\n            <i class="iconfont icon-robot" ng-class="{\'has-new\': chat.isShowRobotRedpoint}" htitle="{{::chat.text.chatbot}}" ng-if="!chat.isSingle && chat.isShowRobotEntry && chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" ng-click="chat.showRobotEntry($event)">&#xe74e;</i>\n            <i class="iconfont icon-onebox" ng-class="{\'has-new\': chat.hasNewOneBoxMsg}"  ng-if="chat.isShowOnebox" ng-click="chat.showOnebox($event)"></i>\n            <i ng-if="chat.conv.baseConversation.type===2&&chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" ng-click="chat.showGroupBulletinModal($event)" class="iconfont icon-group-announcement" htitle="{{::chat.text.dt_chatbox_operations_announcement}}" htitle-offset="left"></i>\n            <i ng-if="chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY" ng-click="chat.goCloudDisk($event)" class="iconfont org-cloud-disk" htitle="{{::chat.spaceText}}" htitle-offset="left"></i>\n            <i ng-click="chat.createConference()" class="iconfont icon-createvideoconf" htitle="{{::chat.text.dt_chatbox_operations_videoconf}}" htitle-offset="left" ng-if="chat.conv.baseConversation.type===2&& chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT && chat.ua.isDesktop">&#xe72f;</i>\n            <i ng-click="chat.showGroupSettingModal($event)" class="iconfont icon-group-setting" htitle="{{::chat.text.dt_chatbox_operations_groupsetting}}" ng-if="chat.conv.baseConversation.type===2&&chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" htitle-offset="left" log="groupchat_setting"></i>\n            <i ng-click="chat.addMember()" class="iconfont icon-add-new-member" htitle="{{::chat.text.dt_chatbox_operations_addMember}}" htitle-offset="left" ng-if="chat.isSingle&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY&&chat.uid!==chat.myuid"></i>\n            <i ng-click="chat.remoteAssist()" class="iconfont icon-yuanchengxiezhu" htitle="{{::chat.text.dt_chatbox_operetions_remote_assist}}" htitle-offset="left" ng-if="chat.isSingle&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY&&chat.uid!==chat.myuid && chat.ua.isDingTalkWin && chat.isShowRemoteAssist"></i>\n            <chat-call ng-if="chat.isSingle" uid=\'chat.uid\' nick="chat.conv.baseConversation.title" cid="chat.conv.convId"></chat-call>\n            <i ng-click="chat.showProfile()" class="iconfont icon-profile" htitle="{{::chat.text.dt_chatbox_operations_profile}}" htitle-offset="left" ng-if="chat.conv.baseConversation.type===1&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY"></i>\n        </div>\n    </div>\n    <!--<div chat-box conv="chat.conv" class="content-pannel-body" id="chat-box"></div>-->\n    <div chat-box-new conv="chat.conv" search-message-id="chat.searchMessageId" search-keyword="chat.keyword" class="content-pannel-body" id="chat-box"></div>\n    <div responsive-input conv="chat.conv" ng-if="!chat.conv.isOAConv"></div>\n</div>\n',
				            controller: "chat as chat",
				            params: {
				                id: void 0,
				                searchMessageId: void 0,
				                keyword: void 0
				            }
				        }, {
				            name: "friendRequest",
				            template: '<div class="friend-request-pannel"><!-- 根据不同场景使用不同的class -->\n    <div class="content-pannel-head"><!-- 此dom，结构不可变更，但可根据场景确定是否要引入它 -->\n        <p class="head-title group-name">新的好友</p>\n    </div>\n    <div class="content-pannel-body"><!-- 如果没有content-pannel-head，则此dom不需引用 -->\n       <loading ng-if="friendRequest.friendData.isLoading"></loading>\n        <ul class="list-with-avatar-and-info group-member-lists" style="width:100%">\n            <li class="list-item group-member-item" ng-repeat="item in friendRequest.friendData.friendList track by item.user.userProfileModel.uid" ng-click=\'item.showProfileModal()\'>\n              <div class="avatar"><user-avatar class="normal" uid="{{::item.user.userProfileModel.uid }}"></user-avatar></div>\n                <div class="info">\n                    <p class="name">\n                    <span ng-if="item.user.status == 1"><strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong>想加你为好友</span>\n                    <span ng-if="item.user.status == 3">你已添加<strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong>为好友</span>\n                    <span ng-if="item.user.status == 2||item.user.status == 4"><strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong></span>\n                    </p>\n                </div>  \n                <div class="info">\n                  <p class="title" ng-bind-html="::item.remark|emoj"></p>\n                </div>\n                <div class="status">\n                    <button class="blue small" ng-if="item.user.status === 1" ng-click=\'friendRequest.acceptFriend(item,$event)\'>接受</button>\n                    <span ng-if="item.user.status === 2">已发送</span>\n                    <a ng-if="item.user.status === 3" ng-click=\'item.showProfileModal($event)\' class="right floated view">查看/设置备注名</a>\n                    <button class="blue small" ng-if="item.user.status == 4" ng-click=\'item.showProfileModal(true,$event)\'>添加</button>\n                </div>\n            </li>\n        </ul>\n    </div>\n</div>\n',
				            controller: "friendRequest as friendRequest"
				        }, {
				            name: "groupRequest",
				            template: '<div class="group-request-pannel">\n    <div class="content-pannel-head">\n        <p class="head-title group-name">入群申请</p>\n        <div class="head-operations contact-operations">\n          <span ng-if="groupRequest.groupData.groupRequestItems.length !== 0" class="operation clean-group-request" ng-click="groupRequest.cleanAll()">\n            清空\n          </span>\n          <span ng-if="groupRequest.groupData.groupRequestItems.length === 0" class="operation disable-clean" >\n            清空\n          </span>\n        </div>\n    </div>\n    <div class="content-pannel-body" >\n      <loading ng-if="groupRequest.isLoading"></loading>\n      <div class="group-member-wrapper" infinite-scroll infinite-scroll-bottom="groupRequest.loadMore()">\n        <div ng-if="groupRequest.groupData.groupRequestItems.length === 0" class="group-request-default">\n            <p class="group-request-default-text">暂无入群申请</p>\n        </div>\n        <ul class="list-with-avatar-and-info group-member-lists" >\n          <li class="list-item group-member-item" ng-repeat="item in groupRequest.groupData.groupRequestItems track by item.id" ng-click=\'groupRequest.showProfileModal(item.applicant.userProfileModel.uid, $event)\'>\n            <div class="avatar"><user-avatar class="normal" uid={{::item.applicant.userProfileModel.uid}}></user-avatar></div>\n              <div class="info">\n                  <p class="name">\n                  <span><strong ng-bind-html="::(item.applicant.remarkNameObj.alias || item.applicant.userProfileModel.nick)|emoj"></strong> 申请加入 <strong ng-bind-html="::(item.groupRequestModel.baseConversation.title)|emoj"></strong> 群</span>\n                  </p>\n              </div>\n              <div class="info">\n                <p class="title" ng-bind-html="::item.groupRequestModel.joinDescription|emoj"></p>\n              </div>\n              <div class="status">\n                  <button class="blue small" ng-if="item.groupRequestModel.status === groupRequest.JOIN_GROUP_STATUS.PENDING" ng-click="groupRequest.acceptGroupRequest(item, $event)">通过</button>\n                  <span class="accpeted" ng-if="item.groupRequestModel.status === groupRequest.JOIN_GROUP_STATUS.PASS">已通过</span>\n              </div>\n          </li>\n        </ul>\n      </div>\n    </div>\n</div>\n',
				            controller: "groupRequest as groupRequest"
				        }]
				    }, {
				        name: "contact",
				        template: '<div id="sub-menu-pannel" class="contact-group-pannel">\n    <div class="org-list-pannel" ng-if="contact.isShowArchContact">\n        <div class="sub-menu-list">\n            <organization-list org-state= "contact.orgState" on-change-dept= "contact.changeDept(orgState)"></organization-list>\n        </div>\n    </div>\n    <ul class="list-with-icon-and-title contact-groups">\n        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.friend\'}" ui-sref=".friend" log=\'contact_myfriend_button_click\'>\n            <div class="item-wrapper">\n                <i class="iconfont">&#xe627;</i>\n                <span class="item-title group-name">{{::contact.text.pc_contact_my_friends}}</span>\n            </div>\n        </li>\n        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.group\'}" ui-sref=".group" log=\'contact_group_button_click\'>\n            <div class="item-wrapper">\n                <i class="iconfont">&#xe60d;</i>\n                <span class="item-title group-name">{{::contact.text.pc_contact_my_groups}}</span>\n            </div>\n        </li>\n        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.follow\'}" ui-sref=".follow" log=\'contact_group_button_click\'>\n            <div class="item-wrapper">\n                <i class="iconfont follow-icon">&#xe662;</i>\n                <span class="item-title group-name">{{::contact.text.pc_contact_my_concern}}</span>\n            </div>\n        </li>\n    </ul>\n</div>\n\n<div id="content-pannel" ui-view ng-if="contact.currentState !== \'authorized.contact\'"></div>\n<div id="content-pannel" ng-if="contact.currentState === \'authorized.contact\'">\n    <div class="org-detail-pannel">\n        <div class="content-pannel-head">\n            <p class="head-title org-name">{{contact.orgData.orgDetail.orgName}}</p>\n            <div class="head-operations contact-operations" ng-if="contact.leavePermission === true" ng-click="contact.onQuitClick()">\n                <span class="operation">\n                    <i class="iconfont" htitle="{{contact.btnText}}" htitle-offset="left">&#xe645;</i>\n                </span>\n            </div>\n        </div>\n        <org-list org-state= "contact.orgState" on-change-dept= "contact.changeDept(orgState)" class="content-pannel-body"></org-list>\n    </div>\n</div>\n',
				        controller: "contact as contact",
				        params: {
				            orgId: void 0,
				            deptId: void 0,
				            uid: void 0,
				            staffId: void 0
				        },
				        children: [{
				            name: "friend",
				            template: '<div class="contact-group-member-pannel">\n     <div class="content-pannel-head">\n         <p class="head-title group-name">{{::friendContact.text.pc_contact_my_friends}}</p>\n         <div class="head-operations contact-operations" log="mainpage_addfriend_click" ng-click="friendContact.searchFriend();">\n             <i class="iconfont icon-add-friend" htitle="添加好友" htitle-offset="left">&#xe631;</i>\n         </div>\n     </div>\n     <div class="content-pannel-body">\n        <loading ng-if="friendContact.friendData.isLoading"></loading>\n         <ul class="list-with-avatar-and-info group-member-lists" ng-if="friendContact.friendData.friendList.length!==0" style="width:100%">\n             <li class="list-item group-member-item has-no-title" ng-repeat="item in friendContact.friendData.friendList" ng-click=\'item.showProfileModal()\' ng-if="item.user.status===3">\n                 <dd-avatar class="profile" uid="item.user.userProfileModel.uid" nick="item.user.userProfileModel.nick"></dd-avatar>\n                 <div class="info">\n                     <p class="name"><span ng-bind-html="(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></span></p>\n                 </div>\n             </li>\n         </ul>\n         <div class="empty-container" ng-if="friendContact.friendData.friendList.length===0&&!friendContact.friendData.hasMore">\n             <div class="sprite-empty empty-contact"></div>\n             <p class="empty-info">暂时没有好友</p>\n         </div>\n     </div>\n </div>\n',
				            controller: "friendContact as friendContact"
				        }, {
				            name: "group",
				            template: ' <div class="contact-group-member-pannel">\n     <div class="content-pannel-head">\n         <p class="head-title group-name">{{::groupContact.text.pc_contact_my_groups}}</p>\n     </div>\n     <div class="content-pannel-body">\n         <group-list></group-list>\n     </div>\n </div>\n',
				            controller: "groupContact as groupContact"
				        }, {
				            name: "follow",
				            template: '<div class="contact-group-member-pannel">\n     <div class="content-pannel-head">\n         <p class="head-title group-name">{{::followContact.text.pc_contact_my_concern}}</p>\n         <!-- <div class="head-operations contact-operations" log="mainpage_addfriend_click" ng-click="friendContact.searchFriend();">\n             <i class="iconfont icon-add-friend" htitle="添加好友" htitle-offset="left">&#xe631;</i>\n         </div> -->\n     </div>\n     <div class="content-pannel-body">\n         <ul class="list-with-avatar-and-info group-member-lists" ng-if="followContact.followList.length!==0">\n             <li class="list-item group-member-item has-no-title" ng-repeat="item in followContact.followList" ng-click="followContact.showProfile(item)">\n                 <dd-avatar class="profile" uid="item.userProfileModel.uid" nick="item.userProfileModel.nick"></dd-avatar>\n                 <div class="info">\n                     <p class="name"><span ng-bind-html="(item.remarkNameObj.alias || item.userProfileModel.nick)|emoj"></span></p>\n                 </div>\n             </li>\n         </ul>\n         <div class="empty-container" ng-if="followContact.followList.length===0">\n             <div class="sprite-empty empty-contact"></div>\n             <p class="empty-info">暂时没有特别关注</p>\n         </div>\n     </div>\n </div>\n',
				            controller: "followContact as followContact"
				        }, {
				            name: "clients",
				            template: '<div class="org-detail-pannel client-contact-panel">\n    <div class="content-pannel-head">\n        <p class="head-title org-name">我的客户</p>\n        <div class="head-operations contact-operations">\n            <span class="operation" ng-click="clients.goToBatchManage()">批量管理</span>\n        </div>\n    </div>\n    <div class="content-pannel-body">\n        <loading ng-if="clients.isLoading"></loading>\n        <div infinite-scroll\n             infinite-scroll-bottom="clients.loadMore()"\n             ng-if="clients.contactClientList.showItems.length > 0"\n             class="org-member-inner">\n            <div class="org-member-inner-content" >\n                <ul class="list-with-avatar-and-info member-lists" >\n                    <li class="list-item member-item team-item"\n                        ng-class="{\'has-no-title\':!client.crmModel.summary}"\n                        ng-if="!client.EOF"\n                        ng-repeat="client in clients.contactClientList.showItems track by client.crmModel.customerId"\n                        ng-click="clients.openClientDetail($event,client.crmModel)">\n                        <div class="info">\n                            <p class="name">{{client.crmModel.name}}</p>\n                        </div>\n                        <div class="info"><p class="title">{{client.crmModel.summary}}</p></div>\n                        <span class="see-team extra">{{client.crmModel.ext}}</span>\n                    </li>\n                </ul>\n            </div>\n        </div>\n        <div ng-if="clients.contactClientList.showItems.length === 0 && !clients.isLoading" class="client-body-empty">\n            <p>当前还没有客户，请到手机钉钉上添加</p>\n        </div>\n    </div>\n</div>\n',
				            controller: "clients as clients",
				            params: {
				                orgId: void 0
				            }
				        }, {
				            name: "externalContact",
				            template: '<div class="external-contact">\n    <nav class="nav">\n        <loading ng-if="externalContact.isLoadScope"></loading>\n        <ul class="tabs">\n            <li ng-class="{\'active\':item === externalContact.externalParam.scope}"\n                ng-repeat="item in externalContact.visibleScopes"\n                ng-click="externalContact.changeScope(item)"\n                ><p>\n                    {{::externalContact.scopeText[item]}}\n                </p></li>\n        </ul>\n        <div class="operations">\n            <a href="javascript:void();" ng-click="externalContact.showFilter()">{{::externalContact.text.pc_contact_external_contact_filter}}</a>\n            <a href="javascript:void();" ng-click="externalContact.goImportUrl()">{{::externalContact.text.pc_contact_external_contact_batch_manage}}</a>\n        </div>\n    </nav>\n    <div class="external-contact-body">\n        <div class="filter-bar" ng-if="externalContact.externalParam.queryModel.labelIds.length">\n            {{externalContact.labelText}}\n        </div>\n        <external-contact-list external-param="externalContact.externalParam" on-batch-manage = "externalContact.goImportUrl()"></external-contact-list>\n    </div>\n</div>\n',
				            controller: "externalContact as externalContact",
				            params: {
				                orgId: void 0
				            }
				        }]
				    }, {
				        name: "ding",
				        template: '<div id="sub-menu-pannel" class="ding-group-pannel">\n    <ul class="list-with-icon-and-title ding-groups">\n        <li class="list-item ding-group-item" ui-sref=".receive" ng-class="{\'active\':list.$state.is(\'authorized.ding.receive\')}" log=\'ding_tab_receive\'>\n            <div class="item-wrapper ding-group-wrapper">\n                <i class="iconfont my-received ding-list-icon">&#xe62c;</i>\n                <span class="item-title ding-group-name">我收到的</span>\n                <i  class="iconfont unread-dot ding-unread-dot" ng-if="list.receiveList.hasNewComment">&#xe608;</i>\n            </div>\n        </li>\n        <li class="list-item ding-group-item" ui-sref=".send" ng-class="{\'active\':list.$state.is(\'authorized.ding.send\')}" log=\'ding_tab_send\'>\n            <div class="item-wrapper ding-group-wrapper">\n                <i class="iconfont ding-list-icon">&#xe630;</i>\n                <span class="item-title ding-group-name">我发出的</span>\n                <i class="iconfont unread-dot ding-unread-dot" ng-if="list.sendList.hasNewComment">&#xe608;</i>\n            </div>\n        </li>\n    </ul>\n</div>\n<div ui-view id="content-pannel"></div>\n',
				        controller: "list as list",
				        children: [{
				            name: "receive",
				            template: '<div class="ding-list-pannel">\r\n    <div class="content-pannel-head">\r\n        <p class="head-title ding-group-name">我收到的DING</p>\r\n        <div class="head-operations ding-operations">\r\n            <i class="iconfont" ng-click="receive.showDingModal()" htitle="DING一下" htitle-offset="left">&#xe62a;</i>\r\n        </div>\r\n    </div>\r\n    <div class="content-pannel-body" infinite-scroll infinite-scroll-bottom="receive.loadMore()">\r\n        <loading ng-if="receive.dingstate === 0"></loading>\r\n    \t<ul class="ding-lists" ng-if="receive.dingstate === 2">\r\n    \t\t<div ding-item ng-repeat="ding in receive.receiveList.showItems" ng-if="!ding.EOF" ding="ding"></div>\r\n    \t</ul>\r\n        <div class="empty-container" ng-if="receive.dingstate === 1">\r\n            <div class="sprite-empty empty-ding"></div>\r\n            <p class="empty-info">暂时没有收到任何钉</p>\r\n        </div>\r\n        <loading ng-if="!receive.isOver&&receive.isLoading&&receive.dingstate==2" position="\'bottom\'" class="bottom-loading"></loading>\r\n    </div>\r\n</div>',
				            controller: "receive as receive"
				        }, {
				            name: "send",
				            template: '<div class="ding-list-pannel">\r\n    <div class="content-pannel-head">\r\n        <p class="head-title ding-group-name">我发出的DING</p>\r\n        <div class="head-operations ding-operations">\r\n            <i class="iconfont" ng-click="send.showDingModal()" htitle="DING一下" htitle-offset="left">&#xe62a;</i>\r\n        </div>\r\n    </div>\r\n    <div class="content-pannel-body" infinite-scroll infinite-scroll-bottom="send.loadMore()">\r\n        <loading ng-if="send.dingstate === 0"></loading>\r\n        <ul class="ding-lists" ng-if="send.dingstate === 2">\r\n    \t\t<div ding-item ng-repeat="ding in send.sendList.showItems" ng-if="!ding.EOF" ding="ding"></div>\r\n    \t</ul>\r\n        <div class="empty-container" ng-if="send.dingstate === 1">\r\n            <div class="sprite-empty empty-ding"></div>\r\n            <p class="empty-info">暂时没有发过任何钉</p>\r\n        </div>\r\n        <loading ng-if="!send.isOver&&send.isLoading&&send.dingstate===2" position="\'bottom\'" class="bottom-loading"></loading>\r\n    </div>\r\n</div>',
				            controller: "send as send"
				        }]
				    }, {
				        name: "apiTest",
				        template: '<div id="sub-menu-pannel">\n    <h4>API Test</h4>\n    <!--<form ng-submit="apiTest.submitTestUrl()" style="padding:12px">-->\n    <input type="text" ng-model="apiTest.testUrl" style="margin-bottom:8px" />\n    <button class="button small" ng-click="apiTest.submitTestUrl();">打开</button>\n    <!--</form>-->\n</div>\n<div id="content-pannel">\n    <micro-app-container app-url="apiTest.resultUrl"></micro-app-container>\n</div>\n',
				        controller: "apiTestCtrl as apiTest"
				    }, {
				        name: "microApp",
				        template: '<div id="sub-menu-pannel" class="micro-app-list-pannel" >\n\n                <dd-drop-down\n                    class="micro-app-selector"\n                    repeat-data="microApp.orgList"\n                    on-select="microApp.onOrgSelect"\n                    ng-model="microApp.currentOrg"\n                    ng-if="!microApp.isOnlyOneOrg">\n                    <dd-drop-down-match class="eye selected-country">\n                        <i class="iconfont title-icon">&#xe62e;</i>\n                        <span class="selector-panel-org-name">{{$selectItem.orgName}}</span>\n                        <i class="iconfont tri arrow">&#xe633;</i>\n                    </dd-drop-down-match>\n                    <dd-drop-down-choices>\n                        <span>{{$repeatItem.orgName}}</span>\n                    </dd-drop-down-choices>\n                </dd-drop-down>\n\n    <ul class="list-with-icon-and-title micro-app-list" ng-class="{\'only-one-org\': microApp.isOnlyOneOrg}">\n        <div class="list-item">\n            <li class="list-item icro-app-item sub-list-item" ng-if="microApp.apps.length !== 0" ng-class="{\'active\': microApp.currentApp.agent === app.agent}" ng-repeat="app in microApp.apps" ng-click="microApp.onAppClick(app)" >\n                <div class="item-wrapper micro-app-wrapper">\n                    <img class="micro-app-icon-img" ng-src="{{app.iconUrl}}" />\n                    <span class="item-title micro-app-name">{{app.name}}</span>\n                </div>\n            </li>\n            <li class="micro-app-empty" ng-if="microApp.apps.length === 0">该企业暂无PC端支持的微应用</li>\n        </div>\n    </ul>\n\n</div>\n<div id="content-pannel">\n    <micro-app-container ng-if="!microApp.showDefaultPage" app-url="microApp.resultUrl"></micro-app-container>\n    <div class="content-pannel-body" ng-if="microApp.showDefaultPage">\n        <div class="micro-app-default-page">\n            <div class="micro-app-default-icon"></div>\n            <p class="micro-app-default-text">\n                <span>欢迎使用微应用，更多应用持续开发中，敬请期待！</span>\n            </p>\n        </div>\n    </div>\n</div>\n',
				        controller: "microAppSelector as microApp"
				    }, {
				        name: "cspace",
				        template: '<loading ng-if="cspace.isLoading"></loading>\n<div class="space-file-iframe-wrap" style="background-color:#FFFFFF;position: relative;width: 100%;" cspace-iframe></div>\n',
				        controller: "cspaceSelector as cspace"
				    }, {
				        name: "companyCallCenter",
				        template: '<div id="sub-menu-pannel" class="conv-list-pannel">\n    <free-call-list class="free-call-list-wrap"></free-call-list>\n</div>\n<div  id="content-pannel">\n    <div>\n        <div class="content-pannel-head">\n            <ul class="telDial-videoConf-select-head">\n                <li  ng-click="companyCallCenter.goTelDial()" ng-class="{\'font-color-change\':companyCallCenter.isTabOnVideo}">{{::companyCallCenter.text.pc_tel_dial_title}}<div ng-hide="companyCallCenter.isTabOnVideo" class="tel-video-bar"></div></li>\n                <li  ng-click="companyCallCenter.goVideoConf()" ng-class="{\'font-color-change\':!companyCallCenter.isTabOnVideo}">{{::companyCallCenter.text.pc_tel_conf_video}}<div  ng-show="companyCallCenter.isTabOnVideo" class="tel-video-bar"></div></li>\n            </ul>\n        </div>\n        <div ui-view class="telDial-videoConf-select-body"></div>\n    </div>\n</div>\n',
				        controller: "companyCallCenter as companyCallCenter",
				        children: [{
				            name: "videoConf",
				            template: '<div>\n    <div class="video-conf-img"><img ng-src="{{::videoConf.videoConfImg}}" alt="{{::videoConf.text.pc_tel_conf_video}}"> </div>\n    <div>\n        <button ng-if="videoConf.isDesktop" ng-click="videoConf.createConf()" class="call-button green"> <i class="iconfont video-conf-call-button-icon">&#xe6a2;</i>{{::videoConf.text.pc_tel_conf_video}}</button>\n        <div ng-if="!videoConf.isDesktop" class="call-nonsupport-tips">{{::videoConf.text.pc_tel_conf_tips_nonsupport_web}} <a href="{{videoConf.DOWNLOAD_URL}}" target="_blank">{{::videoConf.text.pc_tips_download_pc}}</a></div>\n        <div class="call-button-tips">{{::videoConf.text.pc_tel_conf_tips_support_types}}</div>\n    </div>\n</div>\n',
				            controller: "videoConf as videoConf"
				        }, {
				            name: "telDial",
				            template: '<div>\n    <telephone-dial></telephone-dial>\n    <div class="call-button-tips">{{::telDial.text.pc_tel_dial_tips_who_call}}</div>\n</div>\n',
				            controller: "telDial as telDial"
				        }, {
				            name: "openCompCallCenter",
				            template: '<div class="open-company-call-center">\n    <img ng-src="{{openCompCallCenter.noDialImgUrl}}">\n\t<div class="open-company-call-center-tip1">{{::openCompCallCenter.text.pc_tel_dial_tips_open_call}}</div>\n\t<div class="open-company-call-sub-tip">{{::openCompCallCenter.text.pc_tel_dial_explain_open_call}}</div>\n</div>\n',
				            controller: "openCompCallCenter as openCompCallCenter"
				        }]
				    }, {
				        name: "cmail",
				        template: '<div ng-if="emailLogin" class="mail-container-wrap">\r\n    <mail-list is-proxy-mail="proxyMail" login-email="loginEmail" proxy-mail-url = "proxyMailUrl"></mail-list>\r\n</div>\r\n<div ng-if="!emailLogin" class="mail-iframe-wrap"  cmail-iframe></div>\r\n',
				        controller: "cmailSelector as cmail",
				        params: {
				            emailLogin: void 0,
				            proxyMail: void 0,
				            proxyMailUrl: void 0,
				            cmailPageType: void 0,
				            loginEmail: void 0
				        }
				    }]
				})
		}])
		.run(["$rootScope", "$state", "screenshotService", "exceptionLog", "staylog", "$appInit", "silentUpdate", function (n, e, i, t, o, a, s) {
		    t.init(),
				e.go("auth"),
				o.init(),
				a.init(),
				ua.isDesktop && s.init();
		    try {
		        var c = ua.isDesktop ? nw.version() : "";
		        storage.local.setItem("appVersion", [window.version, c].join("#"))
		    } catch (n) {
		        console.log(n)
		    }
		}]),

		angular.bootstrap(document, ["ddWeb"]);

}, {
    "./directive/infiniteScroll": 119,
    "./directive/log": 120,
    "./directive/widget/avatar/avatar": 150,
    "./directive/widget/breadcrumbs": 154,
    "./directive/widget/ddClickUrl": 160,
    "./directive/widget/ddCopy": 161,
    "./directive/widget/hoverTip": 168,
    "./directive/widget/loading/loading": 170,
    "./directive/widget/preventDrag": 173,
    "./filter/filter": 202,
    "./lib/ng-i18next": 208,
    "./module/apiTest/apiTest": 213,
    "./module/chat/index": 214,
    "./module/cmail/index": 215,
    "./module/companyCallCenter/index": 216,
    "./module/contact/clients": 220,
    "./module/contact/externalContact": 221,
    "./module/contact/friendRequest": 224,
    "./module/contact/groupRequest": 226,
    "./module/contact/index": 227,
    "./module/cspace/index": 228,
    "./module/home/index": 229,
    "./module/im/index": 230,
    "./module/list/index": 231,
    "./module/login/auth": 234,
    "./module/login/index": 235,
    "./module/login/scanCodeLogin": 238,
    "./module/microApp/index": 239,
    "./module/nocontent/nocontent": 240,
    "./service/app/nw": 264,
    "./service/app/silentUpdate": 269,
    "./service/appInfo": 273,
    "./service/appInit/init": 275,
    "./service/conversation/AtOpenIdType": 298,
    "./service/db/dbCollection": 335,
    "./service/env/env": 392,
    "./service/goldlog/staylog": 419,
    "./service/hostConfig": 424,
    "./service/i18next/i18nextManager": 425,
    "./service/log/exceptionLog": 438,
    "./service/log/localLog": 441,
    "./service/log/log": 442,
    "./service/storage/storage": 675,
    "./service/toast/toast": 682,
    "./service/ua": 690,
    "./service/widget/screenshot.js": 734,
    "@ali/ui-select": 838,
    "@ali/wksdk": 869,
    "angular": 980,
    "angular-sanitize": 976,
    "angular-ui-router": 978,
    "angular-ui-router.statehelper": 977,
    "path": 7
}]