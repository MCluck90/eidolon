'use strict';

module.exports = (function() {
    var
        // Contains all of the utility methods
        Util = {},

        // Establish the object that gets returned to break out of a loop iteration
        breaker = {},

        // Save bytes in the minified version (see Underscore.js)
        ArrayProto          = Array.prototype,
        ObjProto            = Object.prototype,

        // Quick references for common core functions
        slice               = ArrayProto.slice,
        hasOwnProperty      = ObjProto.hasOwnProperty,

        // Native ECMAScript 5 functions, which are hopefully available
        nativeForEach       = ArrayProto.forEach;

    /**
     * Checks to see if an object has a given property (not on the prototype)
     * @param   {Object}          obj
     * @param   {Number|String}   key
     * @return  {Boolean}
     */
    Util.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    /**
     * Iterates and acts upon arrays and objects.
     * Largely taken from Underscore.js
     * @param {Object}      obj
     * @param {Function}    iterator
     * @param {Object}      context
     */
    Util.forEach = function(obj, iterator, context) {
        if (obj === null || obj === undefined) {
            return;
        }

        if (nativeForEach && obj.forEach === nativeForEach) {
            // If the native foreach is available, just use that
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            // If the length is equal to the numeric length then this is an array
            for (var i = 0, len = obj.length; i < len; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            // No native foreach and it's an object
            for (var key in obj) {
                if (Util.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) {
                        return;
                    }
                }
            }
        }
    };

    /**
     * Fill in a given object with default properties
     * @param {Object} obj
     */
    Util.defaults = function(obj) {
        obj = obj || {};
        Util.forEach(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) {
                        obj[prop] = source[prop];
                    }
                }
            }
        });

        return obj;
    };

    return Util;
})();