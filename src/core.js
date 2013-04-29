'use strict';

var util        = require('./util.js'),
    phantom     = require('phantom'),
    clc         = require('cli-color'),
    style = {
        jobHeader: clc.green.bold,
        url: (clc.xtermSupported) ? clc.xterm(12).underline : clc.blue.underline,
        ajax: (clc.xtermSupported) ? clc.xterm(251).italic : clc.white.italic,
        stepHeader: (clc.xtermSupported) ? clc.xterm(208).bold : clc.yellowBright.bold,
        progress: (clc.xtermSupported) ? clc.xterm(75).italic : clc.cyan.italic,
        error: clc.red.bold
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

function evaluateConfirmCondition(options) {
    options = options || null;
    // Phantom can't send back complex types (like HTMLElements)
    // so we 'serialize' them by storing all of their attributes in an object
    function serializeHTMLNode(node) {
        var attributes = node.attributes,
            serialized = {
                tagName: node.tagName.toLowerCase()
            };

        for (var i = 0, len = attributes.length; i < len; i++) {
            var attr = attributes.item(i);
            serialized[attr.nodeName] = attr.nodeValue;
        }

        return serialized;
    }

    if (options === null) {
        return {
            confirmed: true,
            results: [],
            msg: 'No options'
        };
    }

    var selector = options.selector,
        attribute = options.attribute,
        value = options.value,
        nodes,
        results = [];

    if (attribute !== undefined && (attribute !== 'text' && attribute !== 'html')) {
        selector = selector + '[' + attribute;
        if (value !== undefined) {
            selector += '=' + value;
        }
        selector += ']';
    }

    // Shortcut for a common confirmation
    if (selector === 'title' && (attribute === undefined || attribute === 'text')) {
        return {
            confirmed: document.title === value,
            results: serializeHTMLNode(document.getElementsByTagName('title')[0])
        };
    }

    nodes = [].map.call(document.querySelectorAll(selector), function(node){
        return serializeHTMLNode(node);
    });

    if (nodes.length === 0) {
        return {
            confirmed: false,
            results: results,
            msg: 'No matches'
        };
    } else if (selector.indexOf('[') >= 0) {
        return {
            confirmed: true,
            results: nodes,
            msg: 'Found your exact matches'
        };
    } else {
        var attr = (attribute === 'text') ? 'innerText' :
                   (attribute === 'html') ? 'innerHTML' : attribute;

        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            if (node[attr] === value) {
                results.push(node);
            }
        }

        return {
            confirmed: results.length > 0,
            results: results
        };
    }
}

function setFieldValues(fields) {
    fields = fields || [];
    // Phantom can't send back complex types (like HTMLElements)
    // so we 'serialize' them by storing all of their attributes in an object
    function serializeHTMLNode(node) {
        var attributes = node.attributes,
            serialized = {
                tagName: node.tagName.toLowerCase(),
                html: (node.innerHTML) ? node.innerHTML : null
            };

        for (var i = 0, len = attributes.length; i < len; i++) {
            var attr = attributes.item(i);
            serialized[attr.nodeName] = attr.nodeValue;
        }

        return serialized;
    }

    var results = [];

    for (var i = 0, len = fields.length; i < len; i++) {
        var field = fields[i],
            value = field.value,
            nodes = document.querySelectorAll(field.selector);

        for (var j = 0, len2 = nodes.length; j < len2; j++) {
            var node = nodes.item(j);
            if (node.tagName.toLowerCase() === 'textarea') {
                node.innerHTML = value;
            } else {
                node.setAttribute('value', value);
            }

            results.push(serializeHTMLNode(node));
        }
    }

    return {
        success: true,
        results: results
    };
}

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
            page.evaluate(evaluateConfirmCondition, function(result) {
                if (result.confirmed) {
                    log(style.progress('Initial confirmation completed'));
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
            job.error({
                status: status
            });
        }
    });
};

module.exports.confirmStep = function(page, step, enableLogging) {
    step.success = step.success || function(){};
    step.error = step.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};
    log('\nRunning Step: ' + style.stepHeader(step.name));

    log(style.progress('Confirming we\'re on the right page'));
    page.evaluate(evaluateConfirmCondition, function(result) {
        if (result.confirmed) {
            log(style.progress('Initial confirmation completed'));
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

module.exports.runStep = function(page, step, enableLogging) {
    step.success = step.success || function(){};
    step.error = step.error || function(){};

    var log = (enableLogging || enableLogging === undefined) ? console.log : function(){};
    log('\nRunning Step: ' + style.stepHeader(step.name));

    log(style.progress('Setting field values'));
    page.evaluate(setFieldValues, function(result) {
        if (result.success) {
            log(style.progress('Completed step'));
            step.success(page, result);
        } else {
            log(style.error('Failed to step'));
            step.error({
                fields: false
            });
        }
    }, step.fields);
};