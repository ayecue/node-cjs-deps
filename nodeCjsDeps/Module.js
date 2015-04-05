/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

var Klass = require('node-klass'),
	path = require('path'),
	fs = require('fs'),
	extend = Klass.extend,
	Collection = Klass.Collection,
	CONSTANTS = require('./Constants');

Klass.define('NodeCjsDeps.Module',{

	constructor: function(options){
		var me = this,
			source;

		options = extend({},options);

		source = options.source;
		source = path.resolve(source);
		source = path.normalize(source);

		me.extend({
			source: source,
			directory: path.dirname(source),
			orig: options.orig,
			sandbox: options.sandbox,
			content: fs.readFileSync(source,{
				encoding : CONSTANTS.READ.ENCODING,
				flag : CONSTANTS.READ.FLAG
			}),
			parents: new Collection({
				constructor: NodeCjsDeps.Module,
				searchProperty: 'source',
				getProperty: 'source'
			}),
			deps: new Collection({
				constructor: NodeCjsDeps.Module,
				searchProperty: 'source',
				getProperty: 'source'
			})
		});
	},

	process: function(sandbox){
		var me = this;

		sandbox.__filename = me.source;
		sandbox.__dirname = me.directory;
	},

	isLoaded: function(){
		return this.loaded;
	}
});