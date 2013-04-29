'use strict';

var job,
    step,
    automation = require('../src/core.js'),
    showLogging = true;

module.exports.Steps = {
    setUp: function(callback) {
        delete require.cache[require.resolve('../jobs/example-google.json')];
        step = {};
        callback();
    },

    'Confirm a Step': function(test) {
        job = require('../jobs/example-google.json');
        step = job.steps[0];
        test.expect(1);

        var interval = setInterval(function() {
            return 0;
        }, 5000);

        step.success = function() {
            clearInterval(interval);
            test.ok(true);
            test.done();
        };
        step.error = function() {
            clearInterval(interval);
            test.done();
        };

        automation.loadUrl({
            url: job.initURL,
            success: function(page) {
                automation.confirm(page, step, showLogging);
            },
            error: function() {
                clearInterval(interval);
                test.done();
            }
        });
    },

    'Fill in the Search Field': function(test) {
        job = require('../jobs/example-google.json');
        step = job.steps[0];
        test.expect(1);

        var interval = setInterval(function() {
            return 0;
        }, 5000);

        step.success = function(page, result) {
            var actual = result.results[0].value,
                expected = step.fields[0].value;

            clearInterval(interval);
            test.ok(actual, expected, 'Field value was not set');
            test.done();
        };
        step.error = function() {
            clearInterval(interval);
            test.done();
        };

        automation.loadUrl({
            url: job.initURL,
            success: function(page) {
                automation.fillFields(page, step, showLogging);
            },
            error: function() {
                clearInterval(interval);
                test.done();
            }
        });
    },

    'Follow a Basic Link': function(test) {
        job = require('../jobs/example-google.json');
        step = job.steps[0];
        test.expect(1);

        var interval = setInterval(function() {
            return 0;
        }, 5000);

        step.success = function() {
            clearInterval(interval);
            test.ok(true);
            test.done();
        };
        step.error = function(result) {
            clearInterval(interval);
            console.log(result);
            test.done();
        };

        automation.loadUrl({
            url: job.initURL,
            success: function(page) {
                automation.finishStep(page, step, showLogging);
            },
            error: function() {
                clearInterval(interval);
                test.done();
            }
        });
    }
};