'use strict';

var util = require('./util.js'),
    events = require('events'),
    auto = require('./core.js'),
    Step = require('./step.js'),

/**
 * Creates and handles running a job
 */
Job = function(options) {
    var defaults = {
        autostart: false,
        verbose: true,
        configPath: '',
        dataPath: '',
        data: null,
        name: '',
        initURL: '',
        confirm: null,
        steps: null,
        events: {}
    };
    options = util.defaults(options, defaults);

    if (options.configPath.length > 0) {
        this.loadConfig(options.configPath);
    }

    if (options.dataPath.length > 0) {
        this.loadData(options.dataPath);
    }

    this.__stepIndex = 0;
    this.name = (options.name.length > 0) ? options.name : this.name;
    this.initURL = (options.initURL.length > 0) ? options.initURL : this.initURL;
    this.confirm = (options.confirm) ? options.confirm : this.confirm;
    this.steps = (options.steps) ? options.steps : this.steps;
    this.data = (options.data !== null) ? options.data : this.data;

    /** Success event handlers **/
    this.on('init', function() {

    });

    this.on('confirm', function() {

    });

    this.on('fill', function() {

    });

    this.on('link', function() {

    });

    this.on('close', function() {

    });

    /** Error event handlers **/
    this.on('init-error', function() {

    });

    this.on('confirm-error', function() {

    });

    this.on('fill-error', function() {

    });

    this.on('link-error', function() {

    });

    // Bind any custom event handlers
    var events = ['init',       'confirm',       'fill',       'link',       'close',
                  'init-error', 'confirm-error', 'fill-error', 'link-error'];
    for (var i = 0, len = events.length; i < len; i++) {
        var eventType = events[i];
        if (options.events.hasOwnProperty(eventType) && typeof options.events[eventType] === 'function') {
            this.on(eventType, options.events[eventType]);
        }
    }

    if (options.autostart) {
        this.start();
    }
};

Job.prototype = new events.EventEmitter();

/**
 * Loads in configuration settings from a JSON file
 * @param {string} configPath   Path to the configuration file
 */
Job.prototype.loadConfig = function(configPath) {
    if (require.resolve(configPath)) {
        var config = JSON.parse(JSON.stringify(require(configPath)));

        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                if (key !== 'steps') {
                    this[key] = config[key];
                } else {
                    this.steps = [];
                    var steps = config[key];
                    for (var i = 0, len = steps.length; i < len; i++) {
                        this.steps.push(new Step(steps[i]));
                    }
                }
            }
        }
    }
};

/**
 * Loads in data from a JSON file for setting fields
 * @param {string} dataPath Path to the data file
 */
Job.prototype.loadData = function(dataPath) {
    if (require.resolve(dataPath)) {
        this.data = JSON.parse(JSON.stringify(require(dataPath)));
    }
};

Job.prototype.getStep = function(stepIndex) {
    stepIndex = (stepIndex === undefined) ? this.__stepIndex : stepIndex;

    return this.steps[stepIndex];
};

Job.prototype.nextStep = function() {
    return this.steps[++this.__stepIndex];
};

Job.prototype.getPage = function() {
    return this.__page;
};

Job.prototype.setPage = function(page) {
    this.__page = page;
};

Job.prototype.start = function() {
    auto.init(this);
};

module.exports = Job;