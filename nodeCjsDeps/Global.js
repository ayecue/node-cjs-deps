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
	Listener = Klass.Listener;

module.exports = Klass.define('NodeCjsDeps.Global',{

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