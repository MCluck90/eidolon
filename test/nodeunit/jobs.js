'use strict';

var Job = require('../../src/job.js'),
    auto = require('../../src/core.js'),
    job;

module.exports.Jobs = {};

module.exports.Jobs.Handlers = {
    setUp: function(callback) {
        job = null;
        callback();
    },
/*
    'Initialize Job': function(test) {
        test.expect(0);

        job = new Job({
            autostart: true,
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
    },

    'Fail to Initialize Job': function(test) {
        test.expect(0);

        job = new Job({
            autostart: true,
            configPath: '../jobs/example-google.json',
            initURL: 'this is not a valid URL',
            events: {
                'init': function() {
                    test.ok(false, 'Should have failed to initialize a bad URL');
                    test.done();
                },
                'init-error': function() {
                    test.done();
                }
            }
        });
    },

    'Confirm the First Step': function(test) {
        test.expect(1);

        job = new Job({
            autorun: false,
            autostart: true,
            configPath: '../jobs/example-google.json',
            events: {
                'init': function() {
                    auto.confirm(job, job.getStep());
                },
                'init-error': function() {
                    test.done();
                },
                'confirm': function(step) {
                    test.equal(step.confirm.value, 'Google', 'Failed to confirm the first step');
                    test.done();
                },
                'confirm-error': function() {
                    test.done();
                }
            }
        });
    },

    'Fail to Confirm Invalid Step': function(test) {
        test.expect(1);

        job = new Job({
            autorun: false,
            autostart: true,
            configPath: '../jobs/example-google.json',
            steps: [
                {
                    confirm: {
                        selector: 'title',
                        value: 'Not Google'
                    }
                }
            ],
            events: {
                'init': function() {
                    auto.confirm(job, job.getStep());
                },
                'init-error': function() {
                    test.done();
                },
                'confirm': function() {
                    test.done();
                },
                'confirm-error': function(step, result) {
                    test.equal(result.confirmed, false, 'confirm-error handler incorrectly called');
                    test.done();
                }
            }
        });
    },

    'Fill in Field Values': function(test) {
        test.expect(1);

        job = new Job({
            autostart: false,
            autorun: false,
            configPath: '../jobs/example-google.json',
            dataPath: '../jobs/data/example-google.json',
            events: {
                'init': function() {
                    auto.fillFields(job, job.getStep(), job.getData());
                },
                'init-error': function() {
                    test.done();
                },
                'fill': function(step, result) {
                    test.equal(result.results[0].value, 'I\'m Googling Google!', 'Did not set proper value');
                    test.done();
                },
                'fill-error': function() {
                    test.done();
                }
            }
        });

        auto.init(job);
    },

    'Fail to Fill Bad Fields': function(test) {
        test.expect(1);

        job = new Job({
            autostart: false,
            autorun: false,
            configPath: '../jobs/example-google.json',
            data: {
                steps: [
                    {
                        fields: {
                            'input:bad-selector': 'This should not work'
                        }
                    }
                ]
            },
            events: {
                'init': function() {
                    auto.fillFields(job, job.getStep(), job.getData());
                },
                'init-error': function() {
                    test.done();
                },
                'fill': function() {
                    test.done();
                },
                'fill-error': function(step, result) {
                    test.ok(!result.success, 'fill-error handler incorrectly called');
                    test.done();
                }
            }
        });

        auto.init(job);
    },
*/
    'Click a Link': function(test) {
        test.expect(1);

        job = new Job({
            autostart: true,
            autorun: false,
            configPath: '../jobs/example-google.json',
            events: {
                'init': function() {
                    auto.followLink(job, job.getStep());
                    test.done();
                },
                'init-error': function() {
                    test.done();
                },
                'link': function(step, result) {
                    test.ok(result.success, 'link handler incorrectly called');
                    test.done();
                },
                'link-error': function() {
                    test.done();
                }
            }
        });
    },

    'Follow Direct Link': function(test) {
        test.expect(1);

        job = new Job({
            autostart: true,
            autorun: false,
            configPath: '../jobs/example-google.json',
            steps: [
                {
                    link: {
                        url: 'http://mail.google.com'
                    }
                }
            ],
            events: {
                'init': function() {
                    auto.followLink(job, job.getStep());
                },
                'init-error': function() {
                    test.done();
                },
                'link': function(step, result) {
                    test.ok(result.success, 'link handler incorrectly called');
                    test.done();
                },
                'link-error': function() {
                    test.done();
                }
            }
        });
    }
};