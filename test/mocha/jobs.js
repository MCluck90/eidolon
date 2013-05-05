'use strict';

var Job = require('../../src/job.js'),
    auto = require('../../src/core.js'),
    expect = require('expect.js'),
    verbose = false,
    job;

describe('Jobs', function() {
    describe('Loading', function() {
        afterEach(function() {
            if (!job) {
                return;
            }

            var page = job.getPage();
            if (page && page.exit) {
                page.exit();
            }
        });

        it('should load in the config with `loadConfig`', function(done) {
            job = new Job();
            job.loadConfig('../jobs/example-google.json');

            expect(job.name).to.be.eql('Example Job');
            done();
        });

        it('should fail to load invalid config file', function(done) {
            expect(function() {
                job = new Job();
                job.loadConfig('not-a-real-config-file.cfg');
            }).to.throwError();
            done();
        });

        it('should load data with `loadData`', function(done) {
            job = new Job();
            job.loadData('../jobs/data/example-google.json');

            expect(job.data.name).to.be.eql('Example Job');
            done();
        });

        it('should fail to load invalid data file', function(done) {
            expect(function() {
                job = new Job();
                job.loadConfig('not-a-real-data-file.data');
            }).to.throwError();
            done();
        });

        it('should automatically load in a config file', function(done) {
            job = new Job({
                configPath: '../jobs/example-google.json'
            });

            expect(job.name).to.be.eql('Example Job');
            done();
        });

        it('should automatically load in a data file', function(done) {
            job = new Job({
                dataPath: '../jobs/data/example-google.json'
            });

            expect(job.data.name).to.be.eql('Example Job');
            done();
        });
    });

    describe('Initialization', function() {
        afterEach(function() {
            if (!job) {
                return;
            }

            var page = job.getPage();
            if (page && page.exit) {
                page.exit();
            }
        });

        it('should initialize a basic job', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        expect(true).to.be.ok();
                        done();
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize job');
                        done();
                    }
                }
            });
        });

        it('should fail to initialize using an invalid URL', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                configPath: '../jobs/example-google.json',
                initURL: 'not a valid URL',
                verbose: verbose,
                events: {
                    'init': function() {
                        expect().fail('Initialized at an invalid URL');
                        done();
                    },
                    'init-error': function() {
                        expect(true).to.be.ok();
                        done();
                    }
                }
            });
        });
    });

    describe('Confirmation', function() {
        afterEach(function() {
            if (!job) {
                return;
            }

            var page = job.getPage();
            if (page && page.exit) {
                page.exit();
            }
        });

        it('should confirm the first step', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.confirm(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize job');
                        done();
                    },
                    'confirm': function(step, result) {
                        expect(result.confirmed).to.be.ok();
                        done();
                    },
                    'confirm-error': function() {
                        expect().fail('Failed to confirm step');
                        done();
                    }
                }
            });
        });

        it('should fail to confirm invalid step', function(done) {
            job = new Job({
                autorun: false,
                autostart: true,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
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
                        expect().fail('Failed to initialize job');
                        done();
                    },
                    'confirm': function() {
                        expect().fail('Incorrectly confirmed step');
                        done();
                    },
                    'confirm-error': function(step, result) {
                        expect(result.confirmed).to.not.be.ok();
                        done();
                    }
                }
            });
        });
    });

    describe('Fill Fields', function() {
        afterEach(function() {
            if (!job) {
                return;
            }

            var page = job.getPage();
            if (page && page.exit) {
                page.exit();
            }
        });

        it('should fill in fields for first step', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                configPath: '../jobs/example-google.json',
                dataPath: '../jobs/data/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.fillFields(job, job.getStep(), job.getData());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize job');
                        done();
                    },
                    'fill': function(step, result) {
                        expect(result.results[0].value).to.be.eql('I\'m Googling Google!');
                        done();
                    },
                    'fill-error': function() {
                        expect().fail('Failed to fill in fields');
                        done();
                    }
                }
            });
        });

        it('should fail to fill in bad fields', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                verbose: verbose,
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
                        expect().fail('Failed to initialize job');
                        done();
                    },
                    'fill': function() {
                        expect().fail('Filled fields with invalid selector');
                        done();
                    },
                    'fill-error': function() {
                        expect(true).to.be.ok();
                        done();
                    }
                }
            });
        });
    });

    describe('Linking', function() {
        afterEach(function() {
            if (!job) {
                return;
            }

            var page = job.getPage();
            if (page && page.exit) {
                page.exit();
            }
        });

        it('should be able to perform a link', function(done) {
            job = new Job({
                autostart: true,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.followLink(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize page');
                        done();
                    },
                    'link': function(step, result) {
                        expect(result.success).to.be.ok();
                        done();
                    },
                    'link-error': function() {
                        expect().fail('Failed to perform the link');
                        done();
                    }
                }
            });
        });

        it('should be able to click a link', function(done) {
            job = new Job({
                autostart: false,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.followLink(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize page');
                        done();
                    },
                    'link': function(step, result) {
                        expect(result.success).to.be.ok();
                        done();
                    },
                    'link-error': function() {
                        expect().fail('Failed to perform the link');
                        done();
                    }
                }
            });

            job.getStep().link = {
                selector: 'a[href]',
                click: true
            };
            auto.init(job);
        });

        it('should be able to submit a form', function(done) {
            job = new Job({
                autostart: false,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.followLink(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize page');
                        done();
                    },
                    'link': function(step, result) {
                        expect(result.success).to.be.ok();
                        done();
                    },
                    'link-error': function() {
                        expect().fail('Failed to perform the link');
                        done();
                    }
                }
            });

            job.getStep().link = {
                selector: 'form[action="/search"]',
                submit: true
            };
            auto.init(job);
        });

        it('should be able to follow a link', function(done) {
            job = new Job({
                autostart: false,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.followLink(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize page');
                        done();
                    },
                    'link': function(step, result) {
                        expect(result.success).to.be.ok();
                        done();
                    },
                    'link-error': function() {
                        expect().fail('Failed to perform the link');
                        done();
                    }
                }
            });

            job.getStep().link = {
                selector: 'a[href]',
                follow: true
            };
            auto.init(job);
        });

        it('should be able to go to a direct URL', function(done) {
            job = new Job({
                autostart: false,
                autorun: false,
                configPath: '../jobs/example-google.json',
                verbose: verbose,
                events: {
                    'init': function() {
                        auto.followLink(job, job.getStep());
                    },
                    'init-error': function() {
                        expect().fail('Failed to initialize page');
                        done();
                    },
                    'link': function(step, result) {
                        expect(result.success).to.be.ok();
                        done();
                    },
                    'link-error': function() {
                        expect().fail('Failed to perform the link');
                        done();
                    }
                }
            });

            job.getStep().link = {
                url: 'http://mail.google.com'
            };
            auto.init(job);
        });
    });
});