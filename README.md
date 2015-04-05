# node-cjs-deps v0.1.0
[![Build Status](https://travis-ci.org/ayecue/node-cjs-deps.png?branch=master)](https://travis-ci.org/ayecue/node-cjs-deps)

> Search for all dependencies of an CommonJS project or file.


## Getting Started
Install this plugin with this command:

```shell
npm install node-cjs-deps
```


## Description

This finder search through your CommonJS project to collect all possible dependencies. The difference to many other projects which are doing the same thing is that this finder don't use some kind of script parser. Because of this reason it's able to not just find dependencies which are static but also to find dependencies which are dynamic.

The approach of this finder is to actually execute your CommonJS project with a wrapper which collect all informations about all the dependencies.


## Examples:

Simple console command:
```shell
node-cjs-deps --source tmp/klass.js --debugging
```


Basic script usage: 
```
require('node-cjs-deps');

NodeCjsDeps.finderWithDebug({
    source: '/home/user/projectA/package.json',
    debugging: true
});
```


Advanced script usage: 
```
require('node-cjs-deps');

var modules = NodeCjsDeps.finder('/home/ps681/workspace/klassmer/Klassmer.js');

modules.each(function(key,module){
	var deps = module.deps;

	console.log('Root: ' + module.getSource());

	deps.each(function(key,dep){
		console.log('	Child: ' + dep.getSource());
	});
});
```