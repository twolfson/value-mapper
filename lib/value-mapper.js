// Load in dependencies
var assert = require('assert');

// Create storage for middlewares
var MIDDLEWARES = {};

/**
 * Constructor for mapping values
 * @param {Object} input Key-value pairs to map values across
 * @param {Object} [options] Flags to adjust how the mapping is performed
 * @param {Function[]} [options.middlewares] Middlewares to process resolved value through
 */
function ValueMapper(input, options) {
  // Save input for later
  this.input = input;

  // Save placeholder middlewares
  this.middlewares = [];

  // Fallback options
  options = options || {};

  // Add each of the middlewares
  var middlewares = options.middlewares || [];
  middlewares.forEach(this.addMiddleware, this);
}
ValueMapper.prototype = {
  // Add middleware to instance
  addMiddleware: function (key) {
    // Assume the middleware is a function
    var middleware = key;

    // If the middleware is a string
    if (typeof middleware === 'string') {
      // Look it up and assert it was found
      middleware = MIDDLEWARES[key];
      assert(middleware, 'value-mapper middleware "' + key + '" could not be found."');
    }

    // Add the middleware to our stack
    this.middlewares.push(middleware);
  },

  // Resolve values of values via middleware
  process: function (val) {
    // Keep track of aliases used
    var aliasesUsed = [],
        aliasesNotFound = [],
        that = this;

    // Map the value through the middlewares
    var middlewares = this.middlewares;
    middlewares.forEach(function mapMiddlewareValue (fn) {
      // Process the value through middleware
      var valObj = fn.call(that, val, options);

      // Save the results
      val = valObj.value;
      aliasesUsed.push.apply(aliasesUsed, valObj.aliasesUsed);
      aliasesNotFound.push.apply(aliasesNotFound, valObj.aliasesNotFound);
    });

    // Return the value
    return {
      value: val,
      aliasesUsed: aliasesUsed,
      aliasesNotFound: aliasesNotFound
    };
  },

  /**
   * Resolve the value of a key
   * @param {String} key Name to lookup value by
   * @returns {Object} retObj Container for value and meta information
   * @returns {Mixed} retObj.value Aliased, mapped, and flattened copy of `key`
   * @returns {String[]} retObj.aliasesUsed Array of aliased keys used while looking up
   * @returns {String[]} retObj.aliasesNotFound Array of aliased not found while looking up
   */
  lookup: function (key) {
    // Look up the normal value
    var val = this.input[key];

    // Save the key for reference
    var _key = this.key;
    this.key = key;

    // Map our value through the middlewares
    val = this.process(val);

    // Restore the original key
    this.key = _key;

    // Return the value
    return val;
  }
};

// Set up helper to add middlewares
function addMiddleware(name, fn) {
  MIDDLEWARES[name] = fn;
}
ValueMapper.addMiddleware = addMiddleware;

// Set up common middlewares
addMiddleware('alias', require('./middleware/alias'));
addMiddleware('map', require('./middleware/map'));
addMiddleware('flatten', require('./middleware/flatten'));

// Export ValueMapper
module.exports = ValueMapper;