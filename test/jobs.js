'use strict';

var job,
    automation = require('../src/core.js'),
    showLogging = true;

module.exports.Jobs = {
    setUp: function(callback) {
        delete require.cache[require.resolve('../jobs/example-google.json')];
        callback();
    },

    'Load in Example Job': function(test) {
        job = require('../jobs/example-google.json');
        test.expect(1);
        test.equal(job.name, 'Example Job', 'Expected \'Example Job\' instead got ' + job.name);
        test.done();
    },

    'Loads in Initial Web Page': function(test) {
        job = require('../jobs/example-google.json');
        test.expect(0);
        job.success = function() {
            test.done();
        };
        job.error = function() {
            test.ok(false, 'Failed to load: ' + job.initURL);
            test.done();
        };

        automation.runJob(job, showLogging);
    },

    'Fail to Load Invalid URL': function(test) {
        job = require('../jobs/example-google.json');
        test.expect(1);
        job.initURL = 'this is not a valid url';
        job.error = function(error) {
            test.notEqual(error.status, 'success', 'Did not expect success in error handler');
            test.done();
        };
        job.success = function(page, result) {
            test.notEqual(result.confirmed, true, 'Should not be successful with a bad URL');
            test.done();
        };

        automation.runJob(job, showLogging);
    },

    'Confirm Google Example Start Page': function(test) {
        job = require('../jobs/example-google.json');
        test.expect(1);
        job.confirm = {
            selector: 'title',
            value: 'Google'
        };
        job.success = function(page, result) {
            test.ok(result.confirmed, 'Did not confirm status of first page');
            test.done();
        };
        job.error = test.done;

        automation.runJob(job, showLogging);
    }
};