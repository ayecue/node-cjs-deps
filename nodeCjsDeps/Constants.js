/*
 * node-cjs-deps
 * https://github.com/ayecue/node-cjs-deps
 *
 * Copyright (c) 2015 "AyeCue" Sören Wehmeier, contributors
 * Licensed under the MIT license.
 */
'use strict';

exports.PACKAGES = {
	HOME: process.env.NODE_PATH,
	FILE_NAME: 'package.json',
	DIR_NAME: 'node_modules'
};

exports.READ = {
	ENCODING: 'utf8',
	FLAG: 'r'
};