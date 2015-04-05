'use strict';

var Autoloader = require('node-cjs-autoloader'),
    Klass = require('node-klass');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.klass = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    basic: function(test) {
        var autoloaderInstance = new Autoloader();

        Klass
            .setSource(__filename)
            .setScope(GLOBAL)
            .require([
                'NodeCjsDeps'
            ],function(){
                var actual,expected;

                expected = 'object';
                actual = NodeCjsDeps.finderWithDebug({
                    source: autoloaderInstance.getSync(__filename,'./fixtures/a.js'),
                    debugging: true
                });

                test.ok(typeof actual === expected, 'type needs to be ' + expected);

                test.done();
            });
    }
};
