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
            page.open(options.url, function(status) {
                if (status !== 'success') {
                    options.error(status);
                    ph.exit();
                } else {
                    options.success(page);
                    ph.exit();
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
        log = (job.verbose) ? console.log : function(){};

    log(style.progress('Confirming ') + style.stepHeader(step.name));
    page.evaluate(helper.confirmCondition, function(result) {
        if (result.confirmed) {
            log(style.stepHeader(step.name) + style.success(' Confirmed'));
            job.emit('confirm', result);
        } else {
            log(style.error('Failed to confirm ') + style.stepHeader(step.name));
            job.emit('confirm-error', result);
        }
    }, step.confirm);
};

module.exports.runJob = function(job, enableLogging) {
    job.success = job.success || function(){};
    job.error = job.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};
    log('\nRunning: ' + style.jobHeader(job.name));

    log(style.ajax('Loading ') + style.url(job.initURL));
    module.exports.loadUrl({
        url: job.initURL,
        success: function(page) {
            log(style.progress('Page successfully loaded'));
            page.evaluate(helper.confirmCondition, function(result) {
                if (result.confirmed) {
                    log(style.success('Initial confirmation completed'));
                    job.success(page, {
                        confirmed: true
                    });
                } else {
                    log(style.error('Failed to complete initial confirmation'));
                    job.error({
                        status: 'confirm',
                        confirmed: false
                    });
                }
            }, job.confirm);
        },
        error: function(status) {
            log(style.error('Failed to load initial URL: ') + style.url(job.initURL));
            job.error({
                status: status
            });
        }
    });
};

module.exports.confirm = function(page, step, enableLogging) {
    step.success = step.success || function(){};
    step.error = step.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};
    log('\nRunning Step: ' + style.stepHeader(step.name));

    log(style.progress('Confirming we\'re on the right page'));
    page.evaluate(helper.confirmCondition, function(result) {
        if (result.confirmed) {
            log(style.success('Confirmation successful'));
            step.success(page, result);
        } else {
            log(style.error('Failed to complete initial confirmation'));
            step.error({
                status: 'confirm',
                confirmed: false
            });
        }
    }, step.confirm);
};

module.exports.fillFields = function(page, step, enableLogging) {
    step.success = step.success || function(){};
    step.error = step.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};
    log('\nRunning Step: ' + style.stepHeader(step.name));

    log(style.progress('Setting field values'));
    page.evaluate(helper.setFieldValues, function(result) {
        if (result.success) {
            log(style.success('Field values set'));
            step.success(page, result);
        } else {
            log(style.error('Failed to set fields values'));
            step.error({
                fields: false
            });
        }
    }, step.fields);
};

module.exports.finishStep = function(page, step, enableLogging) {
    step.success = step.success || function(){};
    step.error = step.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};

    log(style.progress('Following link'));

    page.evaluate(helper.followLink, function(result) {
        if (result.success) {
            log(style.success('Finished linking'));
            step.success(page, result);
        } else {
            log(style.error('Failed to complete linking'));
            step.error(result);
        }
    }, step.link);
};