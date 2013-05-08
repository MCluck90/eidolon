'use strict';

var Job = require('../src/job.js'),
    auto = require('../src/core.js'),
    expect = require('expect.js'),
    verbose = false,
    job;

function asyncCheck(f, done) {
    try {
        f();
    } catch(e) {
        done(e);
    }
}

describe('Jobs', function() {
    describe('Core', function() {
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
                    job.loadConfig('../examples/example-google.json');

                    expect(job.name).to.be.eql('Example Job');
                    done();
                });

                it('when loading data with `loadData`', function(done) {
                    job = new Job();
                    job.loadData('../examples/data/example-google.json');

                    expect(job.data.name).to.be.eql('Example Job');
                    done();
                });

                it('when automatically loading in a config file', function(done) {
                    job = new Job({
                        configPath: '../examples/example-google.json'
                    });

                    expect(job.name).to.be.eql('Example Job');
                    done();
                });

                it('when automatically loading in a data file', function(done) {
                    job = new Job({
                        dataPath: '../examples/data/example-google.json'
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
                        verbose: verbose,
                        steps: [
                            {
                                confirm: {
                                    selector: 'title',
                                    value: 'Not Google',
                                    timeout: 0
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
                        configPath: '../examples/example-google.json',
                        dataPath: '../examples/data/example-google.json',
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
                                expect(result.results[0].value).to.be.eql('Google');
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
                        configPath: '../examples/example-google.json',
                        data: {
                            steps: [
                                {
                                    fields: {
                                        'no&way%this$should:work': {
                                            value: 'This should not work'
                                        }
                                    }
                                }
                            ]
                        },
                        events: {
                            'init': function() {
                                auto.fillFields(job, job.getStep(), job.getData());
                            },
                            'init-error': function() {
                                asyncCheck(function() {
                                    expect().fail('Failed to initialize job');
                                    done();
                                }, done);
                            },
                            'fill': function() {
                                asyncCheck(function() {
                                    expect().fail('Filled fields with invalid selector');
                                    done();
                                }, done);
                            },
                            'fill-error': function() {
                                asyncCheck(function() {
                                    expect(true).to.be.ok();
                                    done();
                                }, done);
                            }
                        }
                    });
                });
            });
        });

        describe('Linking', function() {
            describe('should succeed', function() {
                it('when clicking a link', function(done) {
                    job = new Job({
                        autostart: false,
                        autorun: false,
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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
                        configPath: '../examples/example-google.json',
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

                it('when directed to a hard 404', function(done) {
                    job = new Job({
                        autostart: false,
                        autorun: false,
                        configPath: '../examples/example-google.json',
                        verbose: verbose,
                        events: {
                            'init': function() {
                                auto.followLink(job, job.getStep());
                            },
                            'init-error': function() {
                                expect().fail('Failed to initialize page');
                            },
                            'link': function() {
                                asyncCheck(function() {
                                    expect().fail('Incorrectly performed a link');
                                    done();
                                }, done);
                            },
                            'link-error': function() {
                                done();
                            }
                        }
                    });

                    job.getStep().link = {
                        url: 'http://localhost/give-me-the-404'
                    };
                    auto.init(job);
                });

                it('when directed to a soft 404', function(done) {
                    job = new Job({
                        autostart: false,
                        autorun: false,
                        configPath: '../examples/example-google.json',
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
                        url: 'http://www.google.com/not-a-real-page'
                    };
                    auto.init(job);
                });

                it('when given an invalid protocol', function(done) {
                    job = new Job({
                        autostart: false,
                        autorun: false,
                        configPath: '../examples/example-google.json',
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

    describe('Run', function() {
        this.timeout(30000);

        describe('should succeed', function() {
            it('when basic job is run', function(done) {
                job = new Job({
                    autostart: true,
                    verbose: verbose,
                    configPath: '../examples/example-google.json',
                    dataPath: '../examples/data/example-google.json',
                    events: {
                        'init-error': function() {
                            asyncCheck(function() {
                                expect().fail('Failed to initialize');
                                done();
                            }, done);
                        },
                        'confirm-error': function() {
                            asyncCheck(function() {
                                expect().fail('Failed to confirm step');
                                done();
                            }, done);
                        },
                        'link-error': function() {
                            asyncCheck(function() {
                                expect().fail('Failed to complete link');
                            }, done);
                        },
                        'close': function() {
                            done();
                        }
                    }
                });
            });
        });
    });
});