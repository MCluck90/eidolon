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

    'Run an Individual Step': function(test) {
        job = require('../jobs/example-google.json');
        step = job.initStep;
        test.expect(1);

        step.success = function() {
            test.ok(true);
            test.done();
        };
        step.error = test.done;

        automation.loadUrl({
            url: job.initURL,
            success: function(page) {
                automation.runStep(page, step, showLogging);
            },
            error: function() {
                test.ok(false, 'Failed to load given URL');
                test.done();
            }
        });
    },

    'Fill in the Search Field': function(test) {
        job = require('../jobs/example-google.json');
        step = job.initStep;
        test.expect(1);

        automation.loadUrl({
            url: job.initURL,
            success: function(page) {
                step.success = function(page, result) {
                    var actual = result.results[0].value,
                        expected = step.fields[0].value;

                    test.ok(actual, expected, 'Field value was not set');
                    test.done();
                };

                automation.runStep(page, step, showLogging);
            },
            error: function() {
                test.ok(false, 'Failed to load given URL');
                test.done();
            }
        });
    }
};