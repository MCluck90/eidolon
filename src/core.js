'use strict';

var util = require('./util.js'),
    phantom = require('phantom');

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
                    options.error();
                } else {
                    options.success(page);
                    ph.exit();
                }
            });
        });
    });
};
