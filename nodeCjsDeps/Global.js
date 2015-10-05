/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	Listener = Klass.Listener,
	vm = require('vm');

var nativeModules = Object.keys(process.binding('natives'))
	.filter(function (el) { return !/^internal/.test(el); })
	.reduce(function(accumulator, cur) {
		accumulator[cur] = require(cur);
		return accumulator;
	}, {});

module.exports = Klass.define('NodeCjsDeps.Global',{

	statics: {
		nodejs: nativeModules
	},

	constructor: function(){
		var me = this;

		me.extend({
			sandbox: null,
			listener: new Listener()
		});
	},

	getSandbox: function(){
		var me = this,
			sandbox = me.sandbox;

		if (sandbox) {
			return sandbox;
		}

		sandbox = vm.createContext({});

		sandbox.$createModuleScope = function(){
			return me.createModuleScope();
		};

		sandbox.$onModuleError = function(){
			me.listener.fire('error',me,arguments);
		};

		sandbox.$onModuleCreated = function(){
			me.listener.fire('created',me,arguments);
		};

		sandbox.$onRequire = function(file,module,exports,filename,dirname){
			var context = {
				exports: me.self.nodejs[file],
				isNode: file in me.self.nodejs
			};
			me.listener.fire('require',me,[context,file,module,exports,filename,dirname]);
			return context.exports;
		};

		sandbox.global = sandbox;
		sandbox.GLOBAL = sandbox;
		sandbox.process = process;
		sandbox.process.env = process.env;
		sandbox.Buffer = Buffer;
		sandbox.console = new console.constructor(console._stdout,console._stderr);

		return me.sandbox = sandbox;
	},

	createModuleScope: function(){
		return {
			exports: {},
			module: {
				exports: {}
			}
		};
	}
});