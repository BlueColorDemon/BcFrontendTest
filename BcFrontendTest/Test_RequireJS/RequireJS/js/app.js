/**
 * 
 */
requirejs.config({

	baseUrl: 'js/lib',

	paths: {
		app: '../app'
	}

});

/**
 * 
 */
require(['jquery', 'canvas', 'app/sub'],
	function($, canvas, sub) {

	});

define({
	color: "black",
	size: "unisize"
});

define(function() {
	//Do setup work here

	return {
		color: "balck",
		size: "unisize"
	};

});

define(["cart", "inventory"],
	function(cart, inventory) {

		return {
			color: "blue",
			size: "large",
			addToCart: function() {
				inventory.decrement(this);
				cart.add(this);
			}
		}

	});

define(["my/cart", "my/inventory"],
	function(cart, inventory) {
		//return a function to define "foo/title".
		//It gets or sets the window title.
		return function(title) {
			return title ? (window.title = title) :
				inventory.storeName + ' ' + cart.name;
		}

	}
);

define(function(require, exports, module) {
	var a = require('a'),
		b = require('b');

	//Return the module value
	return function() {};
});

define('foo/title', ["cart", "inventory"],
	function(cart, inventory) {
		//这些常由优化工具生成。你也可以自己显式指定模块名称，但这使模块更不具备移植性——就是说若你将文件移动到其他目录下，你就得重命名。一般最好避免对模块硬编码，而是交给优化工具去生成。优化工具需要生成模块名以将多个模块打成一个包，加快到浏览器的载人速度
	});
define(["require", "./relative/name"], function(require) {
	var mod = require("./relative/name");
});
define(function(require) {
	var mod = require("./relative/name");
});
define(["require"], function(require) {
	var cssUrl = require.toUrl("./style.css");
});