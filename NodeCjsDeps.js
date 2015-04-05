/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	vm = require('vm'),
	fs = require('fs'),
	path = require('path'),
	forEach = Klass.forEach,
	extend = Klass.extend;

module.exports = Klass.setSource(__filename).setScope(GLOBAL).define('NodeCjsDeps',{
	singleton: true,

	requires: [
		'NodeCjsDeps.Finder'
	],

	finderWithDebug: function(options){
		var me = this,
			modules,
			time = new Date().getTime();

		console.log('Start finder'.green.bold);

		modules = me.finder(options.source,options.debugging);

		console.log(('Finder successful ' + (new Date().getTime() - time) + 'ms').green.bold);
		console.log('	');

		modules.each(function(key,module){
			var deps = module.deps;

			console.log(('Module@' + module.getSource()).bold);

			deps.each(function(key,dep){
				console.log('└── ' + dep.getSource());
			});

			console.log('	');
		});

		return modules;
	},

	finder: function(source,debugging){
		var finder = new NodeCjsDeps.Finder(debugging),
			global;

		source = path.resolve(source);
		global = finder.iterate(source);

		return global.getModules();
	}
});