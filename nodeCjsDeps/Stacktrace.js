/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	extend = Klass.extend;

module.exports = Klass.define('NodeCjsDeps.Stacktrace',{
	constructor: function(){
		extend(this,{
			trace: null,
			first: null
		});
	},

	push: function(object){
		var me = this,
			trace = me.trace;

		if (trace) {
			trace.$next = object;
			object.$last = trace;
		}

		me.trace = object;

		if (!me.first) {
			me.first = object;
		}
	},

	pop: function(){
		var me = this,
			trace = me.trace;

		if (trace.$last) {
			var last = trace;
			me.trace = trace.$last;
			last.$last = null;
			me.trace.$next = null;
		}

		if (me.trace == null) {
			me.first = null;
		}
	},

	get: function(){
		return this.trace;
	},

	iterate: function(callback){
		var me = this,
			trace = me.first,
			doContinue;

		if (!trace) {
			return;
		}

		do {
			doContinue = callback(trace);

			if (doContinue === false) {
				break;
			}
		} while(trace = trace.$next);

		return doContinue;
	}
});