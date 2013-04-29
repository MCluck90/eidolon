'use strict';

var Job = require('../src/job.js'),
    job;

module.exports.Jobs = {
    setUp: function(callback) {
        callback();
    },

    'Load in Example Job': function(test) {
        test.expect(1);

        job = new Job({
            configPath: '../jobs/example-google.json'
        });

        test.equal(job.name, 'Example Job', 'Failed to properly load example job');
        test.done();
    },

    'Load in Config with loadConfig': function(test) {
        test.expect(1);

        job = new Job();
        job.loadConfig('../jobs/example-google.json');

        test.equal(job.name, 'Example Job', 'Failed to properly load example job');
        test.done();
    },

    'Load Data with loadData': function(test) {
        test.expect(1);

        job = new Job();
        job.loadData('../jobs/data/example-google.json');

        test.equal(job.data.steps[0].fields['input[name=\'q\']'], 'I\'m Googling Google!', 'Failed to load data');
        test.done();
    },

    'Load Example Job with Data': function(test) {
        test.expect(2);

        job = new Job({
            configPath: '../jobs/example-google.json',
            dataPath: '../jobs/data/example-google.json'
        });

        test.equal(job.name, 'Example Job', 'Failed to properly load example job');
        test.ok('input[name=\'q\']' in job.data.steps[0].fields, 'Failed to load data');
        test.done();
    },

    'Initialize Job': function(test) {
        test.expect(0);

        job = new Job({
            configPath: '../jobs/example-google.json',
            dataPath: '../jobs/data/example-google.json',
            events: {
                'init': function() {
                    test.done();
                },
                'init-error': function() {
                    test.ok(false, 'Failed to initialize Job');
                    test.done();
                }
            }
        });

        job.start();
    },

    'Fail to Initialize Job': function(test) {
        test.expect(0);

        job = new Job({
            configPath: '../jobs/example-google.json'
        })
    }
};