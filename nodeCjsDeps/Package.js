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

Klass.define('NodeCjsDeps.Package',{

	constructor: function(options){
		var me = this;

		options = extend({},options);

		me.extend({
			cwd: options.cwd,
			json: options.json
		});
	}

});