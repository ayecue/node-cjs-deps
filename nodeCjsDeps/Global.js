/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	assert = require('assert'),
	child_process = require('child_process'),
	console = require('console'),
	crypto = require('crypto'),
	dgram = require('dgram'),
	domain = require('domain'),
	freelist = require('freelist'),
	http = require('http'),
	_linklist = require('_linklist'),
	net = require('net'),
	path = require('path'),
	querystring = require('querystring'),
	repl = require('repl'),
	stream = require('stream'),
	_stream_readable = require('_stream_readable'),
	_stream_writable = require('_stream_writable'),
	sys = require('sys'),
	tls = require('tls'),
	url = require('url'),
	vm = require('vm'),
	buffer = require('buffer'),
	cluster = require('cluster'),
	constants = require('constants'),
	_debugger = require('_debugger'),
	dns = require('dns'),
	events = require('events'),
	fs = require('fs'),
	https = require('https'),
	module = require('module'),
	os = require('os'),
	punycode = require('punycode'),
	readline = require('readline'),
	_stream_duplex = require('_stream_duplex'),
	_stream_passthrough = require('_stream_passthrough'),
	_stream_transform = require('_stream_transform'),
	string_decoder = require('string_decoder'),
	timers = require('timers'),
	tty = require('tty'),
	util = require('util'),
	zlib = require('zlib'),
	forEach = Klass.forEach,
	Collection = Klass.Collection,
	extend = Klass.extend;

module.exports = Klass.define('NodeCjsDeps.Global',{

	requires: [
		'NodeCjsDeps.Module',
		'NodeCjsDeps.Stacktrace'
	],

	statics: {
		nodejs: {
			assert: assert,
			child_process: child_process,
			console: console,
			crypto: crypto,
			dgram: dgram,
			domain: domain,
			freelist: freelist,
			http: http,
			_linklist: _linklist,
			net: net,
			path: path,
			querystring: querystring,
			repl: repl,
			stream: stream,
			_stream_readable: _stream_readable,
			_stream_writable: _stream_writable,
			sys: sys,
			tls: tls,
			url: url,
			vm: vm,
			buffer: buffer,
			cluster: cluster,
			constants: constants,
			_debugger: _debugger,
			dns: dns,
			events: events,
			fs: fs,
			https: https,
			module: module,
			os: os,
			punycode: punycode,
			readline: readline,
			_stream_duplex: _stream_duplex,
			_stream_passthrough: _stream_passthrough,
			_stream_transform: _stream_transform,
			string_decoder: string_decoder,
			timers: timers,
			tty: tty,
			util: util,
			zlib: zlib
		}
	},

	constructor: function(finder){
		var me = this;

		me.extend({
			finder: finder,
			modules: new Collection({
				constructor: NodeCjsDeps.Module,
				searchProperty: 'source'
			}),
			exports: {},
			sandboxes: new NodeCjsDeps.Stacktrace(),
			stacktrace: new NodeCjsDeps.Stacktrace()
		});
	},

	createSandbox: function(){
		var me = this,
			sandbox = {};

		vm.createContext(sandbox);

		sandbox.require = function(file){
			return me.onRequire(me.stacktrace.get(),file);
		};

		sandbox.exports = {};
		sandbox.module = {
			exports: {}
		};
		sandbox.global = sandbox;
		sandbox.GLOBAL = sandbox;
		sandbox.process = process;
		sandbox.process.env = process.env;
		sandbox.Buffer = Buffer;
		sandbox.console = new console.constructor(console._stdout,console._stderr);

		me.sandboxes.push(sandbox);

		return sandbox;
	},

	applySandbox: function(sandbox){
		var me = this,
			module = me.stacktrace.get(),
			source = module.getSource();

		me.exports[source] = sandbox.module.exports || {};
		extend(me.exports[source],sandbox.exports);

		forEach(sandbox,function(prop,value){
			me.exports[prop] = value;
		});
	},

	set: function(key,value){
		this.exports[key] = value;
		return this;
	},

	get: function(key){
		return this.exports[key];
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

	onRequire: function(module,file){
		var me = this,
			scope = me.exports,
			source = module.getSource(),
			dest = me.finder.autoloader.getSync(source,file),
			deps, newModule, parents;

		if (module) {
			deps = module.getDeps();
			deps.push({
				source: dest,
				orig: file
			});
		}

		newModule = me.addModule(dest);
		parents = newModule.getParents();
		parents.push({
			source: source
		});

		if (file in me.self.nodejs){
			return me.self.nodejs[file];
		}

		if (!(dest in scope)) {
			scope[dest] = {};
			me.finder.iterate(dest);
		}

		return scope[dest];
	}
});