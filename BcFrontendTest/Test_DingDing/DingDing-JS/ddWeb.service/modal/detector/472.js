[function (require, module, exports) {
    "use strict";
    var path = require("path"),
		ua = require("../ua"),
		_ = require("lodash"),
		Uri = require("jsuri"),
		mydetector = require("@ali/ding-detector"),
		moduleName = "ddWeb.service.modal.detector",
		serviceName = "detectorModalService";
    angular.module(moduleName, [require("./modal"), require("../../directive/widget/localTime")])
		.factory(serviceName, ["$modal", function (e) {
		    return function () {
		        var t = e.open({
		            template: '<div class="detector-modal dialog middle">\n    <div class="head">\n        <i class="close iconfont"></i>\n        <span class="title">网络检测</span>\n    </div>\n    <div class="body">\n       <section class="base-info">\n            <h3><strong>基础信息</strong></h3>\n            <ul class="base-info-list">\n                <li>系统信息：<span >{{::detectorModal.os}}</span></li>\n                <li>系统时间：<span local-time></span> (请确认你的时间是否正确)</li>\n                <li ng-show="!detectorModal.notshowProxy">代理服务器：<span ng-bind-html="detectorModal.proxy" ng-class="{\'red-proxy\': detectorModal.showRedProxy}"></span></li>\n            </ul>\n        </section>\n        <section class="net-info">\n            <h3><strong>网络信息</strong></h3>\n            <ul class="net-info-list">\n                <li>钉钉图片服务：<span ng-show="!detectorModal.laodingOK" ng-bind-html="detectorModal.showloading"></span><span ng-bind-html="detectorModal.imgCDN"></span></li>\n                <li>钉钉登录服务：<span ng-show="!detectorModal.laodingOK" ng-bind-html="detectorModal.showloading"></span><span ng-bind-html="detectorModal.login"></span></li>\n                <li>钉钉云盘服务：<span ng-show="!detectorModal.laodingOK" ng-bind-html="detectorModal.showloading"></span><span ng-bind-html="detectorModal.space"></span></li>\n                <li>钉钉聊天服务：<span ng-show="!detectorModal.laodingOK" ng-bind-html="detectorModal.showloading"></span><span ng-bind-html="detectorModal.WS"></span></li>\n            </ul>\n        </section>\n         <section class="net-info">\n            <h3><strong>检测结果</strong></h3>\n            <span ng-bind-html="detectorModal.networkres"></span>\n        </section>\n    </div>\n    <div class="foot">\n        <span ng-if="!detectorModal.isNormal"><span>如未能解决你的问题，可在手机端发消息给"钉小秘"反馈</span><br> 或 <a href="{{detectorModal.matiltoUrl}}">发送反馈邮件到 dingding@service.taobao.com</a> </span>\n        <button ng-if="detectorModal.isNormal" type="button" class="blue close">关闭</button>\n    </div>\n  </div>\n',
		            controller: "detectorModalCtrl",
		            controllerAs: "detectorModal",
		            resolve: {},
		            enterTriggerEl: ".chatto-action-btn"
		        });
		        return t.result
		    }
		}])
		.controller("detectorModalCtrl", ["$scope", function (e) {
		    var t = this;
		    t.ua = mydetector.baseInfo.ua,
				t.os = mydetector.baseInfo.os,
				t.showloading = "<a></a>",
				t.laodingOK = !1,
				t.notshowProxy = !1;
		    var o = '<i class="iconfont success">&#xe63b;</i>',
				n = '<i class="iconfont error">&#xe63d;</i>',
				r = "https://static.dingtalk.com/media",
				i = [{
				    url: r + "/lALOAFF1eczIzMg_200_200.png_120x120q90.jpg",
				    height: 120,
				    width: 120
				}],
				s = "wss://webalfa-cm3.dingtalk.com/lwp",
				a = "wss://webalfa-cm10.dingtalk.com/lwp",
				d = {
				    ERROR: n,
				    OPEN: o,
				    CLOSE: n,
				    NONSUPPORT: n
				},
				l = "https://login.dingtalk.com/user/qrcode/generate.jsonp",
				c = "https://space.dingtalk.com/v1/ding/token?callback=jQuery191019606852415017784_1446696153504",
				p = "http://login.dingtalk.com/",
				g = "https://login.dingtalk.com/",
				m = function () {
				    t.os.indexOf("mac") > -1 ? t.networkres = "你的网络异常,请参照以下方法检查HTTP代理：<br/>系统偏好设置->网络->高级->代理" : t.networkres = "你的网络异常,请参照以下方法检查HTTP代理：<br/>开始->控制面板->网络和Internet->Internet选项->连接->局域网设置"
				};
		    t.isNormal = !0;
		    var x = function (e) {
		        var t = new Uri("mailto:dingding@service.taobao.com");
		        t.addQueryParam("subject", "[钉钉PC版网络检测反馈]-[这里填入钉钉号]");
		        var o = "！！！服务异常",
                    n = "服务正常",
                    r = {
                        imgCDN: {
                            pre_text: "钉钉图片服务："
                        },
                        login: {
                            pre_text: "钉钉登录服务："
                        },
                        space: {
                            pre_text: "钉钉云盘服务："
                        },
                        WS: {
                            pre_text: "钉钉聊天服务："
                        },
                        proxy: {
                            pre_text: "你的代理服务器："
                        },
                        networkres: {
                            pre_text: "诊断结果："
                        }
                    },
                    i = "";
		        return e.os && (i += "系统信息：\n" + mydetector.baseInfo.os + "\n"),
                    i += "系统时间：" + new Date + "\n",
                    i += "钉钉服务情况：\n",
                    Object.keys(r).forEach(function (t) {
                        _.isString(e[t]) ? i += r[t].pre_text + e[t] + "\n" : _.isBoolean(e[t]) && (i += r[t].pre_text,
                            i += e[t] ? n : o,
                            i += "\n")
                    }),
                    i += "为了以便我们联系你帮你解决当前问题，请填写你的钉钉号码：___(跟主题一致填写)__\n",
                    i += "详细问题描述：____________",
                    t.addQueryParam("body", i),
                    t.toString()
		    },
				f = {};

		    f.os = mydetector.baseInfo.os,

				ua.isNw ?
				Promise.all([mydetector.testImageCDN(i[0]),
                    mydetector.testDns("static.dingtalk.com"),
                    mydetector.testNetWork(l),
                    mydetector.testDns("login.dingtalk.com"),
                    mydetector.testNetWork(c),
                    mydetector.testDns("space.dingtalk.com"),
                    mydetector.testWebSocket(s),
                    mydetector.testDns("webalfa-cm3.dingtalk.com"),
                    mydetector.testHttpProxy(p),
                    mydetector.testHttpProxy(g),
                    mydetector.testWebSocket(a)])
				.then(function (r) {
				    t.imgCDN = r[0] ? o : n,
						t.imgCDN.indexOf("error") > -1 ? r[1] ? t.imgCDN += f.imgCDN = " (连接" + r[1] + "失败)" : t.imgCDN += f.imgCDN = " (DNS解析失败)" : f.imgCDN = !0,
						t.login = r[2] ? o : n,
						t.login.indexOf("error") > -1 ? r[3] ? t.login += f.login = " (连接" + r[3] + "失败)" : t.login += f.login = " (DNS解析失败)" : f.login = !0,
						t.space = r[4] ? o : n,
						t.space.indexOf("error") > -1 ? r[5] ? t.space += f.space = " (连接" + r[5] + "失败)" : t.space += f.space = " (DNS解析失败)" : f.space = !0,
						d[r[6].state].indexOf("error") === -1 || d[r[10].state].indexOf("error") === -1 ? (t.WS = o,
							f.WS = !0) : (t.WS = d[r[6].state],
							r[7] ? t.WS += f.WS = " (连接" + r[7] + "失败)" : t.WS += f.WS = " (DNS解析失败)"),
						t.proxyHttp = r[8],
						t.proxyHttps = r[9],
						t.networkres = "你的网络一切正常!",
						t.showRedProxy = !1,
						t.proxyHttp.indexOf("DIRECT") > -1 && t.proxyHttp.indexOf("PROXY") === -1 && t.proxyHttps.indexOf("PROXY") === -1 && t.proxyHttps.indexOf("SOCKS") === -1 ? t.proxy = "无" : t.proxyHttps.indexOf("SOCKS") > -1 ? (t.proxy = "有 (" + t.proxyHttps + ")",
							t.showRedProxy = !0) : t.proxyHttps.indexOf("PROXY") > -1 ? (t.proxy = "有 (" + t.proxyHttps + ")",
							t.showRedProxy = !0) : t.proxyHttp.indexOf("PROXY") > -1 && (t.proxy = "有 (" + t.proxyHttp + ")",
							t.showRedProxy = !0),
						f.proxy = t.proxy,
						(t.imgCDN.indexOf("error") > -1 || t.login.indexOf("error") > -1 || t.space.indexOf("error") > -1 || t.WS.indexOf("error") > -1) && (t.networkres = "当前部分网络异常",
							t.isNormal = !1),
						t.WS.indexOf("error") > -1 && (t.proxyHttp.indexOf("PROXY") > -1 || t.proxyHttps.indexOf("PROXY") > -1 || t.proxyHttps.indexOf("SOCKS") > -1 ? m() : !window.navigator.onLine && t.imgCDN.indexOf("error") > -1 && t.login.indexOf("error") > -1 && t.space.indexOf("error") > -1 && (t.networkres = f.networkres = "你目前没有联网，请先联网")),
						t.matiltoUrl = x(f),
						t.laodingOK = !0,
						e.$digest()
				})
				.catch(function (e) {
				    t.laodingOK = !0,
						t.networkres = "检测失败"
				}) :
				(t.notshowProxy = !0,
					Promise.all([mydetector.testImageCDN(i[0]), mydetector.testNetWork(l), mydetector.testNetWork(c), mydetector.testWebSocket(s), mydetector.testWebSocket(a)])
					.then(function (r) {
					    t.networkres = "你的网络一切正常!",
							t.imgCDN = r[0] ? o : n,
							f.imgCDN = r[0],
							t.login = r[1] ? o : n,
							f.login = r[1],
							t.space = r[2] ? o : n,
							f.space = r[2],
							d[r[3].state].indexOf("error") === -1 || d[r[4].state].indexOf("error") === -1 ? (t.WS = o,
								f.WS = !0) : (t.WS = n,
								f.WS = !1),
							(t.imgCDN.indexOf("error") > -1 || t.login.indexOf("error") > -1 || t.space.indexOf("error") > -1 || t.WS.indexOf("error") > -1) && (t.networkres = "当前部分网络异常",
								t.isNormal = !1),
							t.WS.indexOf("error") > -1 && (!window.navigator.onLine && t.imgCDN.indexOf("error") > -1 && t.login.indexOf("error") > -1 && t.space.indexOf("error") > -1 ? t.networkres = f.networkres = "你目前没有联网，请先联网" : t.networkres = "当前部分网络异常"),
							t.matiltoUrl = x(f),
							t.laodingOK = !0,
							e.$digest()
					}))

		}]),
		module.exports = moduleName;
}, {
    "../../directive/widget/localTime": 171,
    "../ua": 690,
    "./modal": 480,
    "@ali/ding-detector": 783,
    "jsuri": 1039,
    "lodash": 1057,
    "path": 7
}]