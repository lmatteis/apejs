importPackage(java.util.logging);
var version = require('version.js');

var log = Logger.getLogger(version['package']+' '+version.number);

// Simple implementation of console.log and friends to be compatible with
// our expectations of other javascript environments.
var console = {
    info: function() {
        var str = Array.prototype.join.call(arguments, ' ');
        log.info(str);
    },
    warn: function() {
        var str = Array.prototype.join.call(arguments, ' ');
        log.warn(str);
    },
    error: function() {
        var str = Array.prototype.join.call(arguments, ' ');
        log.severe(str);
    },
    assert: function(expression) {
        if (expression) { return; }
        var args = Array.prototype.slice.call(arguments, 1);
        console.error.apply(console, args);
        throw new Error("Assertion failure: "+args.join(' '));
    }
};
console.debug = console.log = console.info;

exports = console;
