'use strict';

module.exports.Automation = {
    'Can load the default web page': function(test) {
        var automation = require('../src/core.js');
        test.expect(1);
        automation.loadUrl({
            success: function() {
                test.ok(true, 'Successfully load the page');
                test.done();
            },
            error: function() {
                test.ok(false, 'Failed to load the page');
                test.done();
            }
        });
    }
};