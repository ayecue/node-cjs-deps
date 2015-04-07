/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	Collection = Klass.Collection,
	extend = Klass.extend,
	CONSTANTS = require('./Constants'),
	colors = require('colors'),
	vm = require('vm'),
	path = require('path'),
	Autoloader = require('node-cjs-autoloader');

module.exports = Klass.define('NodeCjsDeps.Finder',{

	requires: [
		'NodeCjsDeps.Global',
		'NodeCjsDeps.Module',
		'NodeCjsDeps.Stacktrace'
	],

	constructor: function(debugging){
		var me = this;

		me.extend({
			debugging: debugging,
			autoloader: new Autoloader(),
			global: new NodeCjsDeps.Global(),
			exports: {},
			stacktrace: new NodeCjsDeps.Stacktrace(),
			modules: new Collection({
				constructor: NodeCjsDeps.Module,
				searchProperty: 'source'
			})
		});

		me.initEvents();
	},

	initEvents: function(){
		var me = this,
			global = me.global;

		me.global.getListener()
			.on('require',{
				callback: me.onRequire,
				scope: me
			})
			.on('created',{
				callback: me.onCreated,
				scope: me
			})
			.on('error',{
				callback: me.onError,
				scope: me
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
			module, sandbox, code, script;

		source = me.ifPackage(source);
		sandbox = me.global.getSandbox();
		module = me.addModule(source,sandbox);
		code = module.getCode();
		script = new vm.Script(code,{
			filename: module.getSource(),
			displayErrors: false
		});

		me.stacktrace.push(module);
		script.runInContext(sandbox);
		me.stacktrace.pop();

		return me;
	},

	addModule: function(source,sandbox){
		var me = this,
			module = me.modules.get(source),
			position;

		if (module) {
			return module;
		}

		position = me.modules.push({
			source: path.resolve(source),
			sandbox: sandbox
		});

		return me.modules.getById(position);
	},

	onCreated: function(module,exports,filename,dirname){
		var me = this;

		me.exports[filename] = module.exports || {};
		extend(me.exports[filename],exports);
	},

	onRequire: function(context,file,module,exports,filename,dirname){
		var me = this,
			dest = me.autoloader.getSync(filename,file),
			moduleInstance,
			childModuleInstance,
			dependencies, parents;

		if (!dest) {
			me.onError(
				new Error('Required file ' + file + ' not found.'),
				module,
				exports,
				filename,
				dirname
			);

			return {};
		} else {
			moduleInstance = me.modules.get(filename);

			if (moduleInstance) {
				dependencies = moduleInstance.getDeps();
				dependencies.push({
					source: dest,
					orig: file
				});
			}

			childModuleInstance = me.addModule(dest);
			parents = childModuleInstance.getParents();
			parents.push({
				source: filename
			});

			if (context.isNode){
				return;
			}

			if (!(dest in me.exports)) {
				me.exports[dest] = {};
				me.iterate(dest);
			}
		}

		context.exports = me.exports[dest];
	},

	onError: function(error,module,exports,filename,dirname){
		var me = this;

		if (me.debugging) {
			console.log(filename.red.bold);
			console.log(error.stack.red.italic);
		}
	}
});