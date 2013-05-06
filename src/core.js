'use strict';

var util        = require('./util.js'),
    helper     = require('./job-helper.js'),
    phantom     = require('phantom'),
    clc         = require('cli-color'),
    style = {
        jobHeader: clc.green.bold,
        url: (clc.xtermSupported) ? clc.xterm(12).underline : clc.blue.underline,
        ajax: (clc.xtermSupported) ? clc.xterm(251).italic : clc.white.italic,
        stepHeader: (clc.xtermSupported) ? clc.xterm(208).bold : clc.yellowBright.bold,
        progress: (clc.xtermSupported) ? clc.xterm(75).italic : clc.cyan.italic,
        error: clc.red,
        success: (clc.xtermSupported) ? clc.xterm(10) : clc.greenBright
    };

module.exports.loadUrl = function(options) {
    var defaults = {
        url: 'http://www.google.com',
        success: function() {},
        error: function() {}
    };
    options = util.defaults(options, defaults);

    phantom.create('--load-images=no', function(ph) {
        ph.createPage(function(page) {
            // Create a reference so we can exit after we're done
            page.exit = ph.exit;

            page.open(options.url, function(status) {
                if (status !== 'success') {
                    options.error(status);
                } else {
                    options.success(page);
                }
            });
        });
    });
};

module.exports.init = function(job) {
    var log = (job.verbose) ? console.log : function(){};
    log('\nRunning: ' + style.jobHeader(job.name));

    log(style.ajax('Loading ') + style.url(job.initURL));
    module.exports.loadUrl({
        url: job.initURL,
        success: function(page) {
            log(style.success('Page successfully loaded'));
            job.setPage(page);
            job.emit('init', page);
        },
        error: function(status) {
            log(style.error('Failed to load initial URL: ') + style.url(job.initURL));
            job.emit('init-error', status);
        }
    });
};

module.exports.confirm = function(job, step) {
    var page = job.getPage(),
        log  = (job.verbose) ? console.log : function(){};

    page.set('onError', function(msg, trace) {
        job.emit('confirm-error', step, {
            confirmed: false,
            results: [],
            error: {
                msg: msg,
                trace: trace
            }
        });
    });

    log(style.progress('Confirming ') + style.stepHeader(step.name));
    page.evaluate(helper.confirmCondition, function(result) {
        if (result.confirmed) {
            log(style.stepHeader(step.name) + style.success(' Confirmed'));
            job.emit('confirm', step, result);
        } else {
            log(style.error('Failed to confirm ') + style.stepHeader(step.name));
            job.emit('confirm-error', step, result);
        }
    }, step.confirm);
};

module.exports.fillFields = function(job, step, data) {
    var page = job.getPage(),
        log  = (job.verbose) ? console.log : function(){};

    page.set('onError', function(msg, trace) {
        job.emit('fill-error', step, {
            success: false,
            results: [],
            error: {
                msg: msg,
                trace: trace
            }
        });
    });

    log('Running Step: ' + style.stepHeader(step.name));
    log(style.progress('Setting field values'));
    page.evaluate(helper.setFieldValues, function(result) {
        if (result.success) {
            log(style.success('Field values set'));
            job.emit('fill', step, result);
        } else {
            log(style.error('Failed to set field values'));
            job.emit('fill-error', step, result);
        }
    }, data.fields);
};

module.exports.followLink = function(job, step) {
    var page             = job.getPage(),
        log              = (job.verbose) ? console.log : function(){},
        link             = step.link,
        linkURL          = '',
        linkStatus       = 200,
        allow404         = !!link.allow404,
        waitForUrlChange = !!link.waitForUrlChange,
        waitForPageLoad  = !!link.waitForPageLoad || !!link.url;

    page.set('onError', function(msg, trace) {
        job.emit('link-error', step, {
            success: false,
            error: {
                msg: msg,
                trace: trace
            }
        });
    });

    page.set('onResourceReceived', function(response) {
        if (response.url === linkURL) {
            linkStatus = +response.status;
            if (!allow404 && linkStatus === 404) {
                job.emit('link-error', step, {
                    error: {
                        failedToLoad: true
                    }
                });
            }
        }
    });

    page.set('onUrlChanged', function(url) {
        linkURL = url;
        if (waitForUrlChange && allow404) {
            job.emit('link', step, { success: true });
        }
    });

    if (waitForPageLoad) {
        page.set('onLoadFinished', function(status) {
            if (!allow404 && linkStatus === 404) {
                return;
            }

            if (status === 'success') {
                job.emit('link', step, { success: true });
            } else {
                job.emit('link-error', step, {
                    success: false,
                    error: {
                        failedToLoad: true
                    }
                });
            }
        });
    }

    log(style.progress('Following link'));
    page.evaluate(helper.followLink, function(result) {
        if (!result.success) {
            log(style.error('Failed to complete linking'));
            job.emit('link-error', step, result);
            return;
        }

        if (!waitForUrlChange && !waitForPageLoad) {
            log(style.success('Finished linking'));
            job.emit('link', step, result);
        }
    }, link);
};