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
				    template: '<div class="welcome">    <img ng-src="{{auth.welcomeImg}}" alt="">    <p ng-i18next="pc_login_auth_connect"></p></div>'
				}),
				n.setNestedState({
				    name: "login",
				    template: '<div id="header" class="login-header" ng-dblclick="login.onHeaderDblClick()"><!-- 此dom不可变更 -->    <window-operations></window-operations></div><div id="body">    <div class="login-form tab login-tab">        <ul class="tab-items" ng-click="login.changeLanguage()">            <li class="tab-item" ng-class="{current:login.currentState===\'login.scanCodeLogin\'}" ui-sref=".scanCodeLogin" >{{::login.text.scancode}}</li>            <li class="tab-item" ng-class="{current:login.currentState===\'login.passwordLogin\'}" ui-sref=".passwordLogin" >{{::login.text.password}}</li>        </ul>        <div ui-view class="tab-contents" ></div>    </div>    <div class="networkdetect" ng-click="login.networkdetect()" >{{::login.text.abnormal}}</div></div>',
				    controller: "login as login",
				    children: [{
				        name: "scanCodeLogin",
				        template: '<div class="tab-content qrcode-login current" id="qrcode-login">    <div class="qrcode-wrapper">        <qrcode class="qrcode-img" text="scanCodeLogin.qrcodeOpt.data" size="scanCodeLogin.qrcodeOpt.size" version="scanCodeLogin.qrcodeOpt.version" correct-level="scanCodeLogin.qrcodeOpt.level" ng-show="scanCodeLogin.hasQrcode"></qrcode>        <div class="qr-mask" ng-if="scanCodeLogin.maskDisplay"></div>        <loading ng-if="!scanCodeLogin.hasQrcode && !scanCodeLogin.maskDisplay && !scanCodeLogin.errMsg || scanCodeLogin.maskDisplay && !scanCodeLogin.errMsg"></loading>        <span class="err-info" ng-if="scanCodeLogin.maskDisplay && scanCodeLogin.errMsg">{{scanCodeLogin.errMsg}}</span>    </div>\t<p class="rem">        <span>{{::scanCodeLogin.text.pc_login_scancode_tip}}</span>        <a ng-class="{\'refresh-disabled\':!scanCodeLogin.canRefresh}" class="refresh-qrcode" href="#" ng-click="scanCodeLogin.updateQrCode()"><i class="iconfont">&#xe636;</i><span >{{::scanCodeLogin.text.pc_login_scancode_refresh}}</span></a>    </p>    <account-menus></account-menus></div>',
				        controller: "scanCodeLogin as scanCodeLogin"
				    }, {
				        name: "passwordLogin",
				        template: '<div class="tab-content password-login current">    <form ng-submit="passwordLogin.submit()" name="passwordForm">        <div class="avatar-halo" ng-show="passwordLogin.connecting"></div>        <div class="avatar biger border-thick" ng-if="(!passwordLogin.user.nick && !passwordLogin.user.avatarMediaId)|| !passwordLogin.isCurrentUser">            <img src="https://gtms03.alicdn.com/tps/i3/TB1opXxHXXXXXahXpXXvBLt6FXX-230-230.png" class="country-img" alt="" />        </div>        <dd-avatar mediaid="passwordLogin.user.avatarMediaId" nick="passwordLogin.user.nick" class="biger border-thick" ng-if="(passwordLogin.user.nick || passwordLogin.user.avatarMediaId) && passwordLogin.isCurrentUser"></dd-avatar>        <div class="clearfix">            <phone-input phone="passwordLogin.telephone" country-key="passwordLogin.countryKey" focus-on="passwordLogin.focusPhone" on-change="passwordLogin.onPhoneChange(data)"></phone-input>        </div>        <div class="clearfix">            <input class="fm-input password" ng-change="passwordLogin.submitable=true" ng-minlength="4" ng-model="passwordLogin.password" focus="passwordLogin.focusPhone" type="password" name="verification" placeholder="{{::passwordLogin.text.password_input_placeholder}}" ng-class="{disabled:!passwordLogin.phoneValid}" required>        </div>        <button type="submit" class="blue big" ng-disabled="!passwordLogin.submitable|| !passwordLogin.phoneValid || passwordForm.$invalid" >{{::passwordLogin.text.button}}</button>        <div class="toast warning" ng-click="passwordLogin.loginError.msg=\'\'"ng-if="passwordLogin.loginError.msg"><i class="iconfont">&#xe63d;</i>{{passwordLogin.loginError.msg}}</div>        <account-menus phone="passwordLogin.telephone" country-key="passwordLogin.countryKey"></account-menus>        <div class="auto-login-box" ng-if="passwordLogin.isDesktop" htitle="{{::passwordLogin.text.button_auto_tip}}" htitle-direction="top" htitle-offset="left">            <input type="checkbox" id="auto-login-input" ng-model="loginState.isAutoLogin"/>            <label for="auto-login-input" >{{::passwordLogin.text.button_auto}}</label>        </div>    </form>    <div class="sms-verify shadow" ng-show="passwordLogin.needSmsVerify">        <form ng-submit="passwordLogin.verifySmsCode()">            <p class="desc" >{{::passwordLogin.text.smscode_tip}}</p>            <div class="info-field clearfix">                <input class="fm-input phone" disabled="true" value="{{ passwordLogin.fullPhone }}" />                <div class="send-form-button-wrapper">                    <countdown count-from="passwordLogin.countFrom" on-timeout="passwordLogin.countTimeout()" ng-show="passwordLogin.countFrom > 0"></countdown>                    <button type="button" ng-class="{disabled:passwordLogin.sendCodeDisable}"  ng-click="passwordLogin.sendSmsCode()" class="send-form-button">{{::passwordLogin.text.code_send}}</button>                </div>            </div>            <input autocomplete="off" class="fm-input smscode" ng-change="passwordLogin.smsCodeChange()" placeholder="{{::passwordLogin.text.code_placeholder}}" ng-model="passwordLogin.smsCode" />            <button type="submit" class="blue big"  ng-disabled="!passwordLogin.smsCode || passwordLogin.smsCodeSubmitDisabled" >{{::passwordLogin.text.botton_confirm}}</button>            <div class="toast warning" ng-show="passwordLogin.smsCodeErrMsg" ng-click="passwordLogin.clearSendSmsErrMsg()"><i class="iconfont">&#xe63d;</i>{{passwordLogin.smsCodeErrMsg}}</div>        </form>    </div></div>',
				        controller: "passwordLogin as passwordLogin"
				    }]
				}),
				n.setNestedState({
				    name: "authorized",
				    template: '<div id="layout-main" dingtalk-theme>    <div id="header" ng-dblclick="home.onHeaderDblClick($event)">        <window-operations></window-operations>        <upload-list htitle="{{::home.text.pc_menu_upload_download}}" htitle-offset="left"></upload-list>        <!-- <div class="call-entry" htitle="{{::home.text.dt_menu_tel_title}}" htitle-offset="left">            <unread-call></unread-call>            <i class="iconfont" ng-click="home.onTelClick()">&#xe6ef;</i>        </div> -->        <ding-box ng-if="home.showDingBox"></ding-box>        <search-bar2 support-activate-shortcut="true" ng-cloak></search-bar2>    </div>    <div id="body">        <div id="menu-pannel"><!-- 此dom不可变更 -->            <div class="profile">                <user-avatar class="big-52 with-border" uid="{{ home.$my.userProfileModel.uid }}" open-profile="1"></user-avatar>                <div class="connecting-bar" >                    <div class="connecting-bar-inner" ng-if="home.login_state === 1">                        <div class="connecting-icon error"></div>                        <span class="connecting-tip">{{::home.text.pc_main_panel_connecting}}</span>                    </div>                </div>            </div>            <ul class="main-menus">                <li class="menu-item menu-message" ng-click="home.goState(\'authorized.im\')"                        ng-class="{selected:home.$state.includes(\'authorized.im\')}"                        ng-dblclick="home.scrollToUnReadConv()">                    <div class="menu-item-content">                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_conversation_title}}" htitle-direction="right"></i>                        <all-conv-unread-count></all-conv-unread-count>                    </div>                </li>                <li class="menu-item menu-ding" ng-click="home.goState(\'authorized.ding\')"                    ng-class="{selected:home.$state.includes(\'authorized.ding\')}">                    <div class="menu-item-content">                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_ding_title}}" htitle-direction="right"></i>                        <span class="unread-num ding-unread-num" ng-if="home.receiveList.newCount!==0"><em>{{home.receiveList.newCount}}</em></span>                        <i ng-if="home.receiveList.newCount===0&&(home.receiveList.hasNewComment||home.sendList.hasNewComment)" class="iconfont unread-dot ding-unread-dot">&#xe608;</i>                    </div>                </li>                <li class="menu-item menu-company-call-center" ng-click="home.onTelClick()"                    ng-class="{selected:home.$state.includes(\'authorized.companyCallCenter\')}" >                    <div class="menu-item-content">                    <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_tel_title}}" htitle-direction="right"></i>                        <unread-call></unread-call>                    </div>                </li>                <li class="menu-item menu-contact"                    ng-click="home.onContactClick()"                    ng-class="{selected:home.$state.includes(\'authorized.contact\')}">                    <div class="menu-item-content">                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_contact_title}}" htitle-direction="right"></i>                    </div>                </li>                <li class="menu-item menu-micro-app" ng-if="home.isShowMicroApp && !home.ua.isDesktop || home.isShowMicroApp && home.ua.isDesktop && !home.isShowWorkIndependent" ng-click="home.onMicroAppClick()"                    ng-class="{selected:home.$state.includes(\'authorized.microApp\')}">                    <div class="menu-item-content">                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_work_title}}" htitle-direction="right"></i>                    </div>                </li>                <li class="menu-item menu-micro-app" ng-if="home.ua.isDesktop && home.isShowMicroApp && home.isShowWorkIndependent" ng-click="home.openWork()"                    ng-class="{selected: home.workOpenState }">                    <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_work_title}}" htitle-direction="right"></i>                </li>                <li class="menu-item menu-cspace" ng-click="home.goState(\'authorized.cspace\')"                    ng-class="{selected:home.$state.includes(\'authorized.cspace\')}"                    log="tab_space_click">                    <div class="menu-item-content">                        <i class="iconfont menu-icon" htitle="{{::home.text.dt_menu_space_title}}" htitle-direction="right"></i>                        <unread-cspace></unread-cspace>                    </div>                </li>            </ul>            <ul class="extra-options">                <div class="extra-options-inner">                    <org-email></org-email>                    <li class="extra-item more-actions">                        <div function-menu></div>                    </li>                    <org-admin></org-admin>                    <li class="extra-item settings" >                        <div setting-menu></div>                    </li>                </div>            </ul>        </div>        <div ui-view id="menu-pannel-body"></div>    </div></div>',
				    controller: "home as home",
				    children: [{
				        name: "im",
				        template: '<div id="sub-menu-pannel" class="conv-list-pannel"    layout-resize="im.layoutResizeConf.direction"    min-width="im.layoutResizeConf.minWidth"    max-width="im.layoutResizeConf.maxWidth"    storage-key="im.layoutResizeConf.storageKey"    get-max-width="im.layoutResizeConf.getMaxWidth()">    <conv-list></conv-list></div><div ui-view id="content-pannel"></div>',
				        controller: "im as im",
				        children: [{
				            name: "nocontent",
				            template: '<div class="conv-detail-pannel">    <div class="nocontent-logo" >        <div>            <img ng-src="{{nocontent.welcomeImg}}" alt="欢迎">        </div>    </div>    <div class="nocontent-tips" >        <p ng-show="nocontent.timeType == \'morning\'"><img ng-src="{{nocontent.morningImg}}" alt="早上好"> 早上好，今天请继续加油！</p>        <p ng-show="nocontent.timeType == \'afternoon\'"><img ng-src="{{nocontent.afternoonImg}}" alt="下午好"> 下午好，喝杯茶吧，让精神抖擞起来。</p>        <p ng-show="nocontent.timeType == \'night\'"><img ng-src="{{nocontent.nightImg}}" alt="晚上好"> 晚上好，请注意休息。</p>    </div></div>',
				            controller: "nocontent as nocontent"
				        }, {
				            name: "chat",
				            template: '<div class="conv-detail-pannel" drag-to-upload>    <div class="content-pannel-head chat-head">        <div class="avatar-wrap">            <group-avatar cid="{{ chat.conv.convId }}"></group-avatar>            <user-ding-title-list just-show-main ng-if="chat.isSingle" uid=\'{{chat.uid}}\' class="user-ding-title-list"></user-ding-title-list>        </div>        <div class="conv-title">            <div class="title">                <span ng-bind-html="chat.conv.baseConversation.title|emoj"></span>                <i class="icon-company" htitleshow="{{!!chat.orgName}}" htitle="{{chat.orgName}}" ng-if="chat.conv.baseConversation.tag==chat.ConvType.COMPANY_GROUP||chat.conv.baseConversation.tag==chat.ConvType.ENCRYPT_CHAT" ng-class="{\'icon-safety-single\': chat.conv.isSafetySingle, \'icon-dept-company\':chat.conv.isDeptGroup ,\'icon-all-user-company\': chat.conv.isAllUserGroup, \'icon-safety\': chat.conv.isSafety}"></i>                <div class="conv-title-typing" ng-if="chat.conv.isShowTyping">({{chat.typingWords}})</div>            </div>            <div class="desc">{{ chat.titleDesc }}</div>        </div>        <div class="conv-operations">            <i class="iconfont icon-robot" ng-class="{\'has-new\': chat.isShowRobotRedpoint}" htitle="{{::chat.text.chatbot}}" ng-if="!chat.isSingle && chat.isShowRobotEntry && chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" ng-click="chat.showRobotEntry($event)">&#xe74e;</i>            <i class="iconfont icon-onebox" ng-class="{\'has-new\': chat.hasNewOneBoxMsg}"  ng-if="chat.isShowOnebox" ng-click="chat.showOnebox($event)"></i>            <i ng-if="chat.conv.baseConversation.type===2&&chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" ng-click="chat.showGroupBulletinModal($event)" class="iconfont icon-group-announcement" htitle="{{::chat.text.dt_chatbox_operations_announcement}}" htitle-offset="left"></i>            <i ng-if="chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY" ng-click="chat.goCloudDisk($event)" class="iconfont org-cloud-disk" htitle="{{::chat.spaceText}}" htitle-offset="left"></i>            <i ng-click="chat.createConference()" class="iconfont icon-createvideoconf" htitle="{{::chat.text.dt_chatbox_operations_videoconf}}" htitle-offset="left" ng-if="chat.conv.baseConversation.type===2&& chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT && chat.ua.isDesktop">&#xe72f;</i>            <i ng-click="chat.showGroupSettingModal($event)" class="iconfont icon-group-setting" htitle="{{::chat.text.dt_chatbox_operations_groupsetting}}" ng-if="chat.conv.baseConversation.type===2&&chat.conv.baseConversation.tag!==chat.ConvType.ANNOUNCEMENT" htitle-offset="left" log="groupchat_setting"></i>            <i ng-click="chat.addMember()" class="iconfont icon-add-new-member" htitle="{{::chat.text.dt_chatbox_operations_addMember}}" htitle-offset="left" ng-if="chat.isSingle&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY&&chat.uid!==chat.myuid"></i>            <i ng-click="chat.remoteAssist()" class="iconfont icon-yuanchengxiezhu" htitle="{{::chat.text.dt_chatbox_operetions_remote_assist}}" htitle-offset="left" ng-if="chat.isSingle&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY&&chat.uid!==chat.myuid && chat.ua.isDingTalkWin && chat.isShowRemoteAssist"></i>            <chat-call ng-if="chat.isSingle" uid=\'chat.uid\' nick="chat.conv.baseConversation.title" cid="chat.conv.convId"></chat-call>            <i ng-click="chat.showProfile()" class="iconfont icon-profile" htitle="{{::chat.text.dt_chatbox_operations_profile}}" htitle-offset="left" ng-if="chat.conv.baseConversation.type===1&&chat.conv.baseConversation.tag!==chat.ConvType.FILEHELPER&&chat.conv.baseConversation.tag!==chat.ConvType.SECRETARY"></i>        </div>    </div>    <!--<div chat-box conv="chat.conv" class="content-pannel-body" id="chat-box"></div>-->    <div chat-box-new conv="chat.conv" search-message-id="chat.searchMessageId" search-keyword="chat.keyword" class="content-pannel-body" id="chat-box"></div>    <div responsive-input conv="chat.conv" ng-if="!chat.conv.isOAConv"></div></div>',
				            controller: "chat as chat",
				            params: {
				                id: void 0,
				                searchMessageId: void 0,
				                keyword: void 0
				            }
				        }, {
				            name: "friendRequest",
				            template: '<div class="friend-request-pannel"><!-- 根据不同场景使用不同的class -->    <div class="content-pannel-head"><!-- 此dom，结构不可变更，但可根据场景确定是否要引入它 -->        <p class="head-title group-name">新的好友</p>    </div>    <div class="content-pannel-body"><!-- 如果没有content-pannel-head，则此dom不需引用 -->       <loading ng-if="friendRequest.friendData.isLoading"></loading>        <ul class="list-with-avatar-and-info group-member-lists" style="width:100%">            <li class="list-item group-member-item" ng-repeat="item in friendRequest.friendData.friendList track by item.user.userProfileModel.uid" ng-click=\'item.showProfileModal()\'>              <div class="avatar"><user-avatar class="normal" uid="{{::item.user.userProfileModel.uid }}"></user-avatar></div>                <div class="info">                    <p class="name">                    <span ng-if="item.user.status == 1"><strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong>想加你为好友</span>                    <span ng-if="item.user.status == 3">你已添加<strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong>为好友</span>                    <span ng-if="item.user.status == 2||item.user.status == 4"><strong ng-bind-html="::(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></strong></span>                    </p>                </div>                  <div class="info">                  <p class="title" ng-bind-html="::item.remark|emoj"></p>                </div>                <div class="status">                    <button class="blue small" ng-if="item.user.status === 1" ng-click=\'friendRequest.acceptFriend(item,$event)\'>接受</button>                    <span ng-if="item.user.status === 2">已发送</span>                    <a ng-if="item.user.status === 3" ng-click=\'item.showProfileModal($event)\' class="right floated view">查看/设置备注名</a>                    <button class="blue small" ng-if="item.user.status == 4" ng-click=\'item.showProfileModal(true,$event)\'>添加</button>                </div>            </li>        </ul>    </div></div>',
				            controller: "friendRequest as friendRequest"
				        }, {
				            name: "groupRequest",
				            template: '<div class="group-request-pannel">    <div class="content-pannel-head">        <p class="head-title group-name">入群申请</p>        <div class="head-operations contact-operations">          <span ng-if="groupRequest.groupData.groupRequestItems.length !== 0" class="operation clean-group-request" ng-click="groupRequest.cleanAll()">            清空          </span>          <span ng-if="groupRequest.groupData.groupRequestItems.length === 0" class="operation disable-clean" >            清空          </span>        </div>    </div>    <div class="content-pannel-body" >      <loading ng-if="groupRequest.isLoading"></loading>      <div class="group-member-wrapper" infinite-scroll infinite-scroll-bottom="groupRequest.loadMore()">        <div ng-if="groupRequest.groupData.groupRequestItems.length === 0" class="group-request-default">            <p class="group-request-default-text">暂无入群申请</p>        </div>        <ul class="list-with-avatar-and-info group-member-lists" >          <li class="list-item group-member-item" ng-repeat="item in groupRequest.groupData.groupRequestItems track by item.id" ng-click=\'groupRequest.showProfileModal(item.applicant.userProfileModel.uid, $event)\'>            <div class="avatar"><user-avatar class="normal" uid={{::item.applicant.userProfileModel.uid}}></user-avatar></div>              <div class="info">                  <p class="name">                  <span><strong ng-bind-html="::(item.applicant.remarkNameObj.alias || item.applicant.userProfileModel.nick)|emoj"></strong> 申请加入 <strong ng-bind-html="::(item.groupRequestModel.baseConversation.title)|emoj"></strong> 群</span>                  </p>              </div>              <div class="info">                <p class="title" ng-bind-html="::item.groupRequestModel.joinDescription|emoj"></p>              </div>              <div class="status">                  <button class="blue small" ng-if="item.groupRequestModel.status === groupRequest.JOIN_GROUP_STATUS.PENDING" ng-click="groupRequest.acceptGroupRequest(item, $event)">通过</button>                  <span class="accpeted" ng-if="item.groupRequestModel.status === groupRequest.JOIN_GROUP_STATUS.PASS">已通过</span>              </div>          </li>        </ul>      </div>    </div></div>',
				            controller: "groupRequest as groupRequest"
				        }]
				    }, {
				        name: "contact",
				        template: '<div id="sub-menu-pannel" class="contact-group-pannel">    <div class="org-list-pannel" ng-if="contact.isShowArchContact">        <div class="sub-menu-list">            <organization-list org-state= "contact.orgState" on-change-dept= "contact.changeDept(orgState)"></organization-list>        </div>    </div>    <ul class="list-with-icon-and-title contact-groups">        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.friend\'}" ui-sref=".friend" log=\'contact_myfriend_button_click\'>            <div class="item-wrapper">                <i class="iconfont">&#xe627;</i>                <span class="item-title group-name">{{::contact.text.pc_contact_my_friends}}</span>            </div>        </li>        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.group\'}" ui-sref=".group" log=\'contact_group_button_click\'>            <div class="item-wrapper">                <i class="iconfont">&#xe60d;</i>                <span class="item-title group-name">{{::contact.text.pc_contact_my_groups}}</span>            </div>        </li>        <li class="list-item contact-group-item" ng-class="{active:contact.currentState==\'authorized.contact.follow\'}" ui-sref=".follow" log=\'contact_group_button_click\'>            <div class="item-wrapper">                <i class="iconfont follow-icon">&#xe662;</i>                <span class="item-title group-name">{{::contact.text.pc_contact_my_concern}}</span>            </div>        </li>    </ul></div><div id="content-pannel" ui-view ng-if="contact.currentState !== \'authorized.contact\'"></div><div id="content-pannel" ng-if="contact.currentState === \'authorized.contact\'">    <div class="org-detail-pannel">        <div class="content-pannel-head">            <p class="head-title org-name">{{contact.orgData.orgDetail.orgName}}</p>            <div class="head-operations contact-operations" ng-if="contact.leavePermission === true" ng-click="contact.onQuitClick()">                <span class="operation">                    <i class="iconfont" htitle="{{contact.btnText}}" htitle-offset="left">&#xe645;</i>                </span>            </div>        </div>        <org-list org-state= "contact.orgState" on-change-dept= "contact.changeDept(orgState)" class="content-pannel-body"></org-list>    </div></div>',
				        controller: "contact as contact",
				        params: {
				            orgId: void 0,
				            deptId: void 0,
				            uid: void 0,
				            staffId: void 0
				        },
				        children: [{
				            name: "friend",
				            template: '<div class="contact-group-member-pannel">     <div class="content-pannel-head">         <p class="head-title group-name">{{::friendContact.text.pc_contact_my_friends}}</p>         <div class="head-operations contact-operations" log="mainpage_addfriend_click" ng-click="friendContact.searchFriend();">             <i class="iconfont icon-add-friend" htitle="添加好友" htitle-offset="left">&#xe631;</i>         </div>     </div>     <div class="content-pannel-body">        <loading ng-if="friendContact.friendData.isLoading"></loading>         <ul class="list-with-avatar-and-info group-member-lists" ng-if="friendContact.friendData.friendList.length!==0" style="width:100%">             <li class="list-item group-member-item has-no-title" ng-repeat="item in friendContact.friendData.friendList" ng-click=\'item.showProfileModal()\' ng-if="item.user.status===3">                 <dd-avatar class="profile" uid="item.user.userProfileModel.uid" nick="item.user.userProfileModel.nick"></dd-avatar>                 <div class="info">                     <p class="name"><span ng-bind-html="(item.userInstance.remarkNameObj.alias || item.user.userProfileModel.nick)|emoj"></span></p>                 </div>             </li>         </ul>         <div class="empty-container" ng-if="friendContact.friendData.friendList.length===0&&!friendContact.friendData.hasMore">             <div class="sprite-empty empty-contact"></div>             <p class="empty-info">暂时没有好友</p>         </div>     </div> </div>',
				            controller: "friendContact as friendContact"
				        }, {
				            name: "group",
				            template: ' <div class="contact-group-member-pannel">     <div class="content-pannel-head">         <p class="head-title group-name">{{::groupContact.text.pc_contact_my_groups}}</p>     </div>     <div class="content-pannel-body">         <group-list></group-list>     </div> </div>',
				            controller: "groupContact as groupContact"
				        }, {
				            name: "follow",
				            template: '<div class="contact-group-member-pannel">     <div class="content-pannel-head">         <p class="head-title group-name">{{::followContact.text.pc_contact_my_concern}}</p>         <!-- <div class="head-operations contact-operations" log="mainpage_addfriend_click" ng-click="friendContact.searchFriend();">             <i class="iconfont icon-add-friend" htitle="添加好友" htitle-offset="left">&#xe631;</i>         </div> -->     </div>     <div class="content-pannel-body">         <ul class="list-with-avatar-and-info group-member-lists" ng-if="followContact.followList.length!==0">             <li class="list-item group-member-item has-no-title" ng-repeat="item in followContact.followList" ng-click="followContact.showProfile(item)">                 <dd-avatar class="profile" uid="item.userProfileModel.uid" nick="item.userProfileModel.nick"></dd-avatar>                 <div class="info">                     <p class="name"><span ng-bind-html="(item.remarkNameObj.alias || item.userProfileModel.nick)|emoj"></span></p>                 </div>             </li>         </ul>         <div class="empty-container" ng-if="followContact.followList.length===0">             <div class="sprite-empty empty-contact"></div>             <p class="empty-info">暂时没有特别关注</p>         </div>     </div> </div>',
				            controller: "followContact as followContact"
				        }, {
				            name: "clients",
				            template: '<div class="org-detail-pannel client-contact-panel">    <div class="content-pannel-head">        <p class="head-title org-name">我的客户</p>        <div class="head-operations contact-operations">            <span class="operation" ng-click="clients.goToBatchManage()">批量管理</span>        </div>    </div>    <div class="content-pannel-body">        <loading ng-if="clients.isLoading"></loading>        <div infinite-scroll             infinite-scroll-bottom="clients.loadMore()"             ng-if="clients.contactClientList.showItems.length > 0"             class="org-member-inner">            <div class="org-member-inner-content" >                <ul class="list-with-avatar-and-info member-lists" >                    <li class="list-item member-item team-item"                        ng-class="{\'has-no-title\':!client.crmModel.summary}"                        ng-if="!client.EOF"                        ng-repeat="client in clients.contactClientList.showItems track by client.crmModel.customerId"                        ng-click="clients.openClientDetail($event,client.crmModel)">                        <div class="info">                            <p class="name">{{client.crmModel.name}}</p>                        </div>                        <div class="info"><p class="title">{{client.crmModel.summary}}</p></div>                        <span class="see-team extra">{{client.crmModel.ext}}</span>                    </li>                </ul>            </div>        </div>        <div ng-if="clients.contactClientList.showItems.length === 0 && !clients.isLoading" class="client-body-empty">            <p>当前还没有客户，请到手机钉钉上添加</p>        </div>    </div></div>',
				            controller: "clients as clients",
				            params: {
				                orgId: void 0
				            }
				        }, {
				            name: "externalContact",
				            template: '<div class="external-contact">    <nav class="nav">        <loading ng-if="externalContact.isLoadScope"></loading>        <ul class="tabs">            <li ng-class="{\'active\':item === externalContact.externalParam.scope}"                ng-repeat="item in externalContact.visibleScopes"                ng-click="externalContact.changeScope(item)"                ><p>                    {{::externalContact.scopeText[item]}}                </p></li>        </ul>        <div class="operations">            <a href="javascript:void();" ng-click="externalContact.showFilter()">{{::externalContact.text.pc_contact_external_contact_filter}}</a>            <a href="javascript:void();" ng-click="externalContact.goImportUrl()">{{::externalContact.text.pc_contact_external_contact_batch_manage}}</a>        </div>    </nav>    <div class="external-contact-body">        <div class="filter-bar" ng-if="externalContact.externalParam.queryModel.labelIds.length">            {{externalContact.labelText}}        </div>        <external-contact-list external-param="externalContact.externalParam" on-batch-manage = "externalContact.goImportUrl()"></external-contact-list>    </div></div>',
				            controller: "externalContact as externalContact",
				            params: {
				                orgId: void 0
				            }
				        }]
				    }, {
				        name: "ding",
				        template: '<div id="sub-menu-pannel" class="ding-group-pannel">    <ul class="list-with-icon-and-title ding-groups">        <li class="list-item ding-group-item" ui-sref=".receive" ng-class="{\'active\':list.$state.is(\'authorized.ding.receive\')}" log=\'ding_tab_receive\'>            <div class="item-wrapper ding-group-wrapper">                <i class="iconfont my-received ding-list-icon">&#xe62c;</i>                <span class="item-title ding-group-name">我收到的</span>                <i  class="iconfont unread-dot ding-unread-dot" ng-if="list.receiveList.hasNewComment">&#xe608;</i>            </div>        </li>        <li class="list-item ding-group-item" ui-sref=".send" ng-class="{\'active\':list.$state.is(\'authorized.ding.send\')}" log=\'ding_tab_send\'>            <div class="item-wrapper ding-group-wrapper">                <i class="iconfont ding-list-icon">&#xe630;</i>                <span class="item-title ding-group-name">我发出的</span>                <i class="iconfont unread-dot ding-unread-dot" ng-if="list.sendList.hasNewComment">&#xe608;</i>            </div>        </li>    </ul></div><div ui-view id="content-pannel"></div>',
				        controller: "list as list",
				        children: [{
				            name: "receive",
				            template: '<div class="ding-list-pannel">\r    <div class="content-pannel-head">\r        <p class="head-title ding-group-name">我收到的DING</p>\r        <div class="head-operations ding-operations">\r            <i class="iconfont" ng-click="receive.showDingModal()" htitle="DING一下" htitle-offset="left">&#xe62a;</i>\r        </div>\r    </div>\r    <div class="content-pannel-body" infinite-scroll infinite-scroll-bottom="receive.loadMore()">\r        <loading ng-if="receive.dingstate === 0"></loading>\r    \t<ul class="ding-lists" ng-if="receive.dingstate === 2">\r    \t\t<div ding-item ng-repeat="ding in receive.receiveList.showItems" ng-if="!ding.EOF" ding="ding"></div>\r    \t</ul>\r        <div class="empty-container" ng-if="receive.dingstate === 1">\r            <div class="sprite-empty empty-ding"></div>\r            <p class="empty-info">暂时没有收到任何钉</p>\r        </div>\r        <loading ng-if="!receive.isOver&&receive.isLoading&&receive.dingstate==2" position="\'bottom\'" class="bottom-loading"></loading>\r    </div>\r</div>',
				            controller: "receive as receive"
				        }, {
				            name: "send",
				            template: '<div class="ding-list-pannel">\r    <div class="content-pannel-head">\r        <p class="head-title ding-group-name">我发出的DING</p>\r        <div class="head-operations ding-operations">\r            <i class="iconfont" ng-click="send.showDingModal()" htitle="DING一下" htitle-offset="left">&#xe62a;</i>\r        </div>\r    </div>\r    <div class="content-pannel-body" infinite-scroll infinite-scroll-bottom="send.loadMore()">\r        <loading ng-if="send.dingstate === 0"></loading>\r        <ul class="ding-lists" ng-if="send.dingstate === 2">\r    \t\t<div ding-item ng-repeat="ding in send.sendList.showItems" ng-if="!ding.EOF" ding="ding"></div>\r    \t</ul>\r        <div class="empty-container" ng-if="send.dingstate === 1">\r            <div class="sprite-empty empty-ding"></div>\r            <p class="empty-info">暂时没有发过任何钉</p>\r        </div>\r        <loading ng-if="!send.isOver&&send.isLoading&&send.dingstate===2" position="\'bottom\'" class="bottom-loading"></loading>\r    </div>\r</div>',
				            controller: "send as send"
				        }]
				    }, {
				        name: "apiTest",
				        template: '<div id="sub-menu-pannel">    <h4>API Test</h4>    <!--<form ng-submit="apiTest.submitTestUrl()" style="padding:12px">-->    <input type="text" ng-model="apiTest.testUrl" style="margin-bottom:8px" />    <button class="button small" ng-click="apiTest.submitTestUrl();">打开</button>    <!--</form>--></div><div id="content-pannel">    <micro-app-container app-url="apiTest.resultUrl"></micro-app-container></div>',
				        controller: "apiTestCtrl as apiTest"
				    }, {
				        name: "microApp",
				        template: '<div id="sub-menu-pannel" class="micro-app-list-pannel" >                <dd-drop-down                    class="micro-app-selector"                    repeat-data="microApp.orgList"                    on-select="microApp.onOrgSelect"                    ng-model="microApp.currentOrg"                    ng-if="!microApp.isOnlyOneOrg">                    <dd-drop-down-match class="eye selected-country">                        <i class="iconfont title-icon">&#xe62e;</i>                        <span class="selector-panel-org-name">{{$selectItem.orgName}}</span>                        <i class="iconfont tri arrow">&#xe633;</i>                    </dd-drop-down-match>                    <dd-drop-down-choices>                        <span>{{$repeatItem.orgName}}</span>                    </dd-drop-down-choices>                </dd-drop-down>    <ul class="list-with-icon-and-title micro-app-list" ng-class="{\'only-one-org\': microApp.isOnlyOneOrg}">        <div class="list-item">            <li class="list-item icro-app-item sub-list-item" ng-if="microApp.apps.length !== 0" ng-class="{\'active\': microApp.currentApp.agent === app.agent}" ng-repeat="app in microApp.apps" ng-click="microApp.onAppClick(app)" >                <div class="item-wrapper micro-app-wrapper">                    <img class="micro-app-icon-img" ng-src="{{app.iconUrl}}" />                    <span class="item-title micro-app-name">{{app.name}}</span>                </div>            </li>            <li class="micro-app-empty" ng-if="microApp.apps.length === 0">该企业暂无PC端支持的微应用</li>        </div>    </ul></div><div id="content-pannel">    <micro-app-container ng-if="!microApp.showDefaultPage" app-url="microApp.resultUrl"></micro-app-container>    <div class="content-pannel-body" ng-if="microApp.showDefaultPage">        <div class="micro-app-default-page">            <div class="micro-app-default-icon"></div>            <p class="micro-app-default-text">                <span>欢迎使用微应用，更多应用持续开发中，敬请期待！</span>            </p>        </div>    </div></div>',
				        controller: "microAppSelector as microApp"
				    }, {
				        name: "cspace",
				        template: '<loading ng-if="cspace.isLoading"></loading><div class="space-file-iframe-wrap" style="background-color:#FFFFFF;position: relative;width: 100%;" cspace-iframe></div>',
				        controller: "cspaceSelector as cspace"
				    }, {
				        name: "companyCallCenter",
				        template: '<div id="sub-menu-pannel" class="conv-list-pannel">    <free-call-list class="free-call-list-wrap"></free-call-list></div><div  id="content-pannel">    <div>        <div class="content-pannel-head">            <ul class="telDial-videoConf-select-head">                <li  ng-click="companyCallCenter.goTelDial()" ng-class="{\'font-color-change\':companyCallCenter.isTabOnVideo}">{{::companyCallCenter.text.pc_tel_dial_title}}<div ng-hide="companyCallCenter.isTabOnVideo" class="tel-video-bar"></div></li>                <li  ng-click="companyCallCenter.goVideoConf()" ng-class="{\'font-color-change\':!companyCallCenter.isTabOnVideo}">{{::companyCallCenter.text.pc_tel_conf_video}}<div  ng-show="companyCallCenter.isTabOnVideo" class="tel-video-bar"></div></li>            </ul>        </div>        <div ui-view class="telDial-videoConf-select-body"></div>    </div></div>',
				        controller: "companyCallCenter as companyCallCenter",
				        children: [{
				            name: "videoConf",
				            template: '<div>    <div class="video-conf-img"><img ng-src="{{::videoConf.videoConfImg}}" alt="{{::videoConf.text.pc_tel_conf_video}}"> </div>    <div>        <button ng-if="videoConf.isDesktop" ng-click="videoConf.createConf()" class="call-button green"> <i class="iconfont video-conf-call-button-icon">&#xe6a2;</i>{{::videoConf.text.pc_tel_conf_video}}</button>        <div ng-if="!videoConf.isDesktop" class="call-nonsupport-tips">{{::videoConf.text.pc_tel_conf_tips_nonsupport_web}} <a href="{{videoConf.DOWNLOAD_URL}}" target="_blank">{{::videoConf.text.pc_tips_download_pc}}</a></div>        <div class="call-button-tips">{{::videoConf.text.pc_tel_conf_tips_support_types}}</div>    </div></div>',
				            controller: "videoConf as videoConf"
				        }, {
				            name: "telDial",
				            template: '<div>    <telephone-dial></telephone-dial>    <div class="call-button-tips">{{::telDial.text.pc_tel_dial_tips_who_call}}</div></div>',
				            controller: "telDial as telDial"
				        }, {
				            name: "openCompCallCenter",
				            template: '<div class="open-company-call-center">    <img ng-src="{{openCompCallCenter.noDialImgUrl}}">\t<div class="open-company-call-center-tip1">{{::openCompCallCenter.text.pc_tel_dial_tips_open_call}}</div>\t<div class="open-company-call-sub-tip">{{::openCompCallCenter.text.pc_tel_dial_explain_open_call}}</div></div>',
				            controller: "openCompCallCenter as openCompCallCenter"
				        }]
				    }, {
				        name: "cmail",
				        template: '<div ng-if="emailLogin" class="mail-container-wrap">\r    <mail-list is-proxy-mail="proxyMail" login-email="loginEmail" proxy-mail-url = "proxyMailUrl"></mail-list>\r</div>\r<div ng-if="!emailLogin" class="mail-iframe-wrap"  cmail-iframe></div>\r',
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