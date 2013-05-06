'use strict';

var Job = require('../../src/job.js'),
    auto = require('../../src/core.js'),
    expect = require('expect.js'),
    verbose = false,
    job;

describe('Jobs', function() {
    afterEach(function() {
        if (!job) {
            return;
        }

        var page = job.getPage();
        if (page && page.exit) {
            page.exit();
        }
    });

    describe('Loading', function() {
        describe('should succeed', function() {
            it('when loading with `loadConfig`', function(done) {
                job = new Job();
                job.loadConfig('../jobs/example-google.json');

                expect(job.name).to.be.eql('Example Job');
                done();
            });

            it('when loading data with `loadData`', function(done) {
                job = new Job();
                job.loadData('../jobs/data/example-google.json');

                expect(job.data.name).to.be.eql('Example Job');
                done();
            });

            it('when automatically loading in a config file', function(done) {
                job = new Job({
                    configPath: '../jobs/example-google.json'
                });

                expect(job.name).to.be.eql('Example Job');
                done();
            });

            it('when automatically loading in a data file', function(done) {
                job = new Job({
                    dataPath: '../jobs/data/example-google.json'
                });

                expect(job.data.name).to.be.eql('Example Job');
                done();
            });
        });

        describe('should fail', function() {
            it('when loading an invalid config file', function(done) {
                expect(function() {
                    job = new Job();
                    job.loadConfig('not-a-real-config-file.cfg');
                }).to.throwError();
                done();
            });

            it('when loading an invalid data file', function(done) {
                expect(function() {
                    job = new Job();
                    job.loadConfig('not-a-real-data-file.data');
                }).to.throwError();
                done();
            });

            it('when automatically loading in a bad config file', function(done) {
                expect(function() {
                    job = new Job({
                        configPath: 'not-a-real-config-file.cfg'
                    });
                }).to.throwError();
                done();
            });

            it('when automatically loading in a bad data file', function(done) {
                expect(function() {
                    job = new Job({
                        dataPath: 'not-a-real-data-file.data'
                    });
                }).to.throwError();
                done();
            });
        });
    });

    describe('Initialization', function() {
        describe('should succeed', function() {
            it('when initializing a basic job', function(done) {
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
        });

        describe('should fail', function() {
            it('when using an invalid URL', function(done) {
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
    });

    describe('Confirmation', function() {
        describe('should succeed', function() {
            it('when confirming the first step', function(done) {
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
        });

        describe('should fail', function() {
            it('when confirming an invalid step', function(done) {
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
    });

    describe('Fill Fields', function() {
        describe('should succeed', function() {
            it('when filling in fields for first step', function(done) {
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
        });

        describe('should fail', function() {
            it('when filling in bad fields', function(done) {
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
    });

    describe('Linking', function() {
        describe('should succeed', function() {
            it('when performing a link', function(done) {
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

            it('when clicking a link', function(done) {
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

            it('when submitting a form', function(done) {
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

            it('when following a link', function(done) {
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

            it('when going to a direct URL', function(done) {
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

        describe('should fail', function() {
            it('when link options are empty', function(done) {
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
                        'link': function() {
                            expect().fail('Incorrectly performed a link');
                            done();
                        },
                        'link-error': function() {
                            done();
                        }
                    }
                });

                job.getStep().link = {};
                auto.init(job);
            });

            it('when given a fake URL', function(done) {
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
                        'link': function() {
                            expect().fail('Incorrectly performed a link');
                            done();
                        },
                        'link-error': function() {
                            done();
                        }
                    }
                });

                job.getStep().link = {
                    url: 'http://this-site-does-not-exist.co.uk.de'
                };
                auto.init(job);
            });

            it('when given an invalid protocol', function(done) {
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
                        'link': function() {
                            expect().fail('Incorrectly performed a link');
                            done();
                        },
                        'link-error': function() {
                            done();
                        }
                    }
                });

                job.getStep().link = {
                    url: 'nope://totally not real at all'
                };
                auto.init(job);
            });
        });
    });
});