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
            contains = !!options.contains,
            nodes,
            results = [];

        // Shortcut for a common confirmation
        if (selector === 'title' && (attribute === undefined || attribute === 'text')) {
            results.push(serializeHTMLNode(document.getElementsByTagName('title')[0]));

            return {
                confirmed: (contains) ? document.title.indexOf(value) !== -1 : document.title === value,
                results: results
            };
        }

        if (attribute !== undefined && (attribute !== 'text' && attribute !== 'html')) {
            selector = selector + '[' + attribute;
            if (value !== undefined) {
                selector += '=' + value;
            }
            selector += ']';
        }

        try {
            nodes = [].map.call(document.querySelectorAll(selector), function(node){
                return serializeHTMLNode(node);
            });
        } catch(e) {
            return {
                confirmed: false,
                results: [],
                error: e
            };
        }

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
                if ((contains && node[attr].indexOf(value) !== -1) || (!contains && node[attr] === value)) {
                    results.push(node);
                }
            }

            return {
                confirmed: results.length > 0,
                results: results
            };
        }
    },

    setFieldValues: function(data) {
        data = data || {};
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

        for (var selector in data) {
            if (data.hasOwnProperty(selector)) {
                var value = data[selector].value,
                    keypress = !!data[selector].keypress,
                    nodes;

                if (keypress === true) {
                    continue;
                }

                // Just in case we get a bad selector
                try {
                    nodes = document.querySelectorAll(selector);
                } catch (exc) {
                    return {
                        success: false,
                        results: [],
                        selector: selector
                    };
                }

                if (nodes.length === 0) {
                    return {
                        success: false,
                        results: [],
                        selector: selector
                    };
                }

                for (var i = 0, len = nodes.length; i < len; i++) {
                    var node = nodes.item(i);
                    if (node.tagName.toLowerCase() === 'textarea') {
                        node.innerHTML = value;
                    } else {
                        node.setAttribute('value', value);
                    }

                    results.push(serializeHTMLNode(node));
                }
            }
        }

        return {
            success: true,
            results: results
        };
    },

    simulateKeyPresses: function(page, data, callback) {
        var selectors = Object.keys(data),
            result = { success: true, results: [] };
        (function focusElements(selectorIndex) {
            if (selectorIndex >= selectors.length || !result.success) {
                callback(result);
                return;
            }

            var elSelector = selectors[selectorIndex],
                entry = data[elSelector],
                pressEnter = !!entry.enter;

            (function performKeyPresses(index, count) {
                if (count !== undefined && index >= count) {
                    focusElements(selectorIndex + 1);
                    return;
                }

                page.evaluate(function(selector, keypress, nodeIndex) {
                    var nodes;

                    if (!keypress) {
                        return {
                            success: true,
                            count: 0
                        };
                    }

                    // Just in case we get a bad selector
                    try {
                        nodes = document.querySelectorAll(selector);
                    } catch (exc) {
                        return {
                            success: false,
                            selector: selector,
                            count: -1
                        };
                    }

                    if (nodes.length === 0) {
                        return {
                            success: false,
                            selector: selector,
                            count: -1
                        };
                    }

                    nodes[nodeIndex].focus();

                    return {
                        success: true,
                        count: nodes.length
                    };
                }, function(newResult) {
                    result.success = newResult.success;
                    result.count = newResult.count;

                    if (!newResult.success || newResult.count <= 0) {
                        callback(result);
                        return;
                    } else if (newResult.success) {
                        page.sendEvent('keypress', entry.value, null, null, 0);
                        result.results.push({ selector: elSelector, value: entry.value });

                        if (pressEnter) {
                            page.sendEvent('keypress', 16777221, null, null, 0);
                        }
                    }

                    performKeyPresses(index + 1, result.count);
                }, elSelector, !!entry.keypress, index);
            })(0);
        })(0);
    },

    followLink: function(options) {
        var selector, click, follow, submit, nodes;
        options = options || {};

        if (typeof options.url !== 'undefined') {
            window.location.href = options.url;
            return {
                success: options.url
            };
        }

        if (typeof options.selector === 'undefined') {
            return {
                success: false,
                error: 'selector'
            };
        }

        try {
            selector = options.selector;
            click = options.click === true || typeof options.follow === 'undefined';
            follow = options.follow === true || !click;
            submit = options.submit === true || (!click && !follow);
            nodes = document.querySelectorAll(selector);
        } catch(e) {
            return {
                success: false,
                error: e
            };
        }

        if (nodes) {
            var node = nodes[0];
            // Click the link
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
            } else if (submit) {
                // Submit a form
                // TODO: Make check for 'form' selector
                if (node.tagName === 'FORM') {
                    node.submit();

                    return {
                        success: true,
                        url: window.location
                    };
                } else {
                    return {
                        success: false,
                        error: 'submit'
                    };
                }
            } else if (follow) {
                // Get the URL from an element and go there
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

        return {
            success: true,
            url: window.location.href
        };
    }
};