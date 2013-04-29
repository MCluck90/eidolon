'use strict';

var util = require('./util.js'),

Step = function(options) {
    var defaults = {
        config: '',
        name: '',
        confirm: {
            selector: '',
            exists: true,
            count: -1
        },
        fields: [],
        waitForReload: true,
        link: {
            selector: '',
            click: true,
            follow: false
        }
    };
    options = util.defaults(options, defaults);

    if (options.config.length > 0) {
        this.loadConfig(options.config);
    }

    this.name = (options.name.length > 0) ? options.name : this.name;
    this.confirm = (options.confirm && options.confirm.selector.length > 0) ? options.confirm : this.confirm;
    this.fields = (options.fields.length > 0) ? options.fields : this.fields;
    this.waitForReload = (options.waitForReload || this.waitForReload);
    this.link = (options.link && options.link.selector.length > 0) ? options.link : this.link;
};

Step.prototype.loadConfig = function(configPath) {
    var path = require.resolve(configPath),
        config;

    if (path) {
        config = JSON.parse(JSON.stringify(require(configPath)));

        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                this[key] = config[key];
            }
        }
    }
};

module.exports = Step;