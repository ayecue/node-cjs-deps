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
	printf = Klass.printf,
	Collection = Klass.Collection,
	CONSTANTS = require('./Constants');

Klass.define('NodeCjsDeps.Module',{

	tpl: [
		'(function(){',
			'var $scope = $createModuleScope(this);',
			'(function(require,module,exports,__filename,__dirname){',
				'try {',
					'<%= code %>',
				'} catch(e) {',
					'$onModuleError(e,module,exports,__filename,__dirname);',
				'}',
			'	$onModuleCreated(module,exports,__filename,__dirname);',
			'})(function(file){',
				'return $onRequire(file,$scope.module,$scope.exports,"<%= filename %>","<%= dirname %>");',
			'},$scope.module,$scope.exports,"<%= filename %>","<%= dirname %>");',
		'})();'
	].join(''),

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

	getCode: function(){
		var me = this;

		return printf(me.tpl,{
			code: me.content,
			filename: me.source,
			dirname: me.directory
		});
	}
});