'use strict';

var util = require('./util.js'),
    events = require('events'),
    auto = require('./core.js'),

/**
 * Creates and handles running a job
 */
Job = function(options) {
    var defaults = {
        autostart: false,
        autorun: true,
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
    this.autorun = !!options.autorun;
    this.verbose = !!options.verbose;
    this.name = (options.name.length > 0) ? options.name : this.name;
    this.initURL = (options.initURL.length > 0) ? options.initURL : this.initURL;
    this.confirm = (options.confirm) ? options.confirm : this.confirm;
    this.steps = (options.steps) ? options.steps : this.steps;
    this.data = (options.data !== null) ? options.data : this.data;

    // Bind any custom event handlers
    var events = ['init',       'confirm',       'fill',       'link',       'close',
                  'init-error', 'confirm-error', 'fill-error', 'link-error'];
    for (var i = 0, len = events.length; i < len; i++) {
        var eventType = events[i];
        if (options.events.hasOwnProperty(eventType) && typeof options.events[eventType] === 'function') {
            this.on(eventType, options.events[eventType]);
        }
    }

    /** Success event handlers **/
    var self = this;
    this.on('init', function() {
        if (self.autorun) {
            auto.confirm(self, self.steps[0]);
        }
    });

    this.on('confirm', function() {
        if (self.autorun) {
            auto.fillFields(self, self.getStep(), self.getData());
        }
    });

    this.on('fill', function() {
        if (self.autorun) {
            auto.followLink(self, self.getStep());
        }
    });

    this.on('link', function() {
        if (self.autorun) {
            var step = self.nextStep();
            if (step !== undefined) {
                auto.confirm(self, step);
            } else {
                this.emit('close');
            }
        }
    });

    this.on('close', function() {
        if (self.autorun) {
            this.exit();
        }
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
                        this.steps.push(steps[i]);
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

Job.prototype.setCurrentStep = function(step) {
    if (typeof step === 'number') {
        if (step < this.steps.length) {
            this.__stepIndex = step;
        } else {
            throw new RangeError('Exceeded number of set steps');
        }
    } else {
        var index = this.steps.indexOf(step);
        if (index !== -1) {
            this.__stepIndex = index;
        } else {
            throw new ReferenceError('Could not find given step');
        }
    }
};

Job.prototype.nextStep = function() {
    return this.steps[++this.__stepIndex];
};

Job.prototype.getData = function(stepIndex) {
    stepIndex = (stepIndex === undefined) ? this.__stepIndex : stepIndex;

    if (this.data && this.data.steps !== undefined && this.data.steps.length > stepIndex) {
        return this.data.steps[stepIndex];
    } else {
        return { fields: {} };
    }
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

Job.prototype.exit = function() {
    if (this.page && typeof this.page.exit === 'function') {
        this.page.exit();
    }
};

module.exports = Job;