/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	CONSTANTS = require('./Constants'),
	vm = require('vm'),
	path = require('path'),
	colors = require('colors'),
	Autoloader = require('node-cjs-autoloader');

module.exports = Klass.define('NodeCjsDeps.Finder',{

	requires: [
		'NodeCjsDeps.Global'
	],

	constructor: function(debugging){
		var me = this;

		me.extend({
			debugging: debugging,
			autoloader: new Autoloader(),
			global: new NodeCjsDeps.Global(me)
		});
	},

	ifPackage: function(src){
		var me = this,
			basename = path.basename(src),
			directory = path.dirname(src),
			pkg;

		if (CONSTANTS.PACKAGES.FILE_NAME === basename) {
			pkg = Autoloader.read(src);
			src = path.resolve(directory,pkg.main);
			console.log(src);
		}

		return src;
	},

	iterate: function(source){
		var me = this,
			module, sandbox, script;

		source = me.ifPackage(source);
		sandbox = me.global.createSandbox();
		module = me.global.addModule(source,sandbox);
		script = new vm.Script(module.getContent(),{
			filename: module.getSource(),
			displayErrors: false
		});

		me.global.stacktrace.push(module);
		module.process(sandbox);

		try {
			script.runInNewContext(sandbox);
		} catch (e) {
			if (me.debugging) {
				console.log(source.red.bold);
				console.log(e.stack.red.italic);
			}
		}

		me.global.applySandbox(sandbox);
		me.global.stacktrace.pop();

		return me.global;
	}
});