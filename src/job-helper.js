'use strict';

module.exports = {
    confirmCondition: function(options) {
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
                results: []
            };
        }

        var selector = options.selector,
            attribute = options.attribute,
            value = options.value,
            nodes,
            results = [];

        // Shortcut for a common confirmation
        if (selector === 'title' && (attribute === undefined || attribute === 'text')) {
            results.push(serializeHTMLNode(document.getElementsByTagName('title')[0]));
            return {
                confirmed: document.title === value,
                results: results,
                msg: 'title'
            };
        }

        if (attribute !== undefined && (attribute !== 'text' && attribute !== 'html')) {
            selector = selector + '[' + attribute;
            if (value !== undefined) {
                selector += '=' + value;
            }
            selector += ']';
        }

        nodes = [].map.call(document.querySelectorAll(selector), function(node){
            return serializeHTMLNode(node);
        });

        if (nodes.length === 0) {
            return {
                confirmed: false,
                results: results
            };
        } else if (selector.indexOf('[') >= 0) {
            return {
                confirmed: true,
                results: nodes
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
    },

    setFieldValues: function(fields) {
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
    },

    followLink: function(options) {
        if (options === undefined || options.selector === undefined) {
            return {
                success: false,
                error: 'selector'
            };
        }

        var selector = options.selector,
            click = options.click === true || options.follow === undefined,
            follow = options.follow === true || !click,
            nodes = document.querySelectorAll(selector);

        if (nodes) {
            var node = nodes[0];
            if (click) {
                if (node.fireEvent) {
                    node.fireEvent('onclick');
                } else {
                    var event = document.createEvent('Events');
                    event.initEvent('click', true, false);
                    node.dispatchEvent(event);
                }

                return {
                    success: true,
                    url: window.location.href
                };
            } else if (follow) {
                var href = node.getAttribute('href');
                if (href) {
                    window.location.href = href;
                    return {
                        success: true,
                        url: window.location.href
                    };
                } else {
                    return {
                        success: false,
                        error: 'follow'
                    };
                }
            } else {
                return {
                    success: false,
                    error: 'type'
                };
            }
        } else {
            return {
                success: false,
                error: 'nodes',
                selector: selector
            };
        }
    }
};