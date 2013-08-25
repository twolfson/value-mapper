/**
 * Constructor for mapping values
 * @param {Object} input Key-value pairs to map values across
 */
function ValueMapper(input, options) {
  // Save input for later
  this.input = input;
  this.valStack = [];
}

ValueMapper.aliasMiddleware = require('./middleware/alias');
ValueMapper.mapMiddleware = require('./middleware/map');
ValueMapper.flattenMiddleware = require('./middleware/flatten');

ValueMapper.prototype = {
  // Resolve values of values via middleware
  applyMiddlewares: function (val, options) {
    // If there is an alias, map, or flatten option, add their respective middlewares
    var middlewares = [];
    if (options.alias) { middlewares.push(ValueMapper.aliasMiddleware); }
    if (options.map) { middlewares.push(ValueMapper.mapMiddleware); }
    if (options.flatten) { middlewares.push(ValueMapper.flattenMiddleware); }

    // If there were middlewares specified, let them in
    var _middlewares = options.middlewares;
    if (_middlewares) {
      middlewares.push.apply(middlewares, _middlewares);
    }

    // Map the value through the proxies
    var that = this,
        aliasesUsed = [],
        aliasesNotFound = [];
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
   * @param {Object} [options] Flags to adjust how the mapping is performed
   * @param {Boolean} [options.alias] If the value is a string, `value = input[value]`
   * @param {Boolean} [options.map] If a value is an array, its values will be processed via the aliasing proxy.
   * @param {Boolean} [options.flatten] If the value is an array and contains arrays, the array will be flattened.
   * @param {Function[]} [options.middlewares] If provided, these functions will be appended to the array of middlewares.
   * @returns {Object} retObj Container for value and meta information
   * @returns {Mixed} retObj.value Aliased, mapped, and flattened copy of `key`
   * @returns {String[]} retObj.aliasesUsed Array of aliased keys used while looking up
   * @returns {String[]} retObj.aliasesNotFound Array of aliased not found while looking up
   */
  lookup: function (key, options) {
    // Look up the normal value
    var val = this.input[key];

    // Save the key for reference
    var _key = this.key;
    this.key = key;

    // Fallback options and map our value through the middlewares
    options = options || {};
    val = this.applyMiddlewares(val, options);

    // Restore the original key
    this.key = _key;

    // Return the value
    return val;
  }
};

// Export ValueMapper
module.exports = ValueMapper;