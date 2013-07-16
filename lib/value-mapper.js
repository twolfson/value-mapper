// Load in dependencies
var _ = require('underscore');

// Set up ValueMapper constructor
function ValueMapper(input) {
  // Save input for later
  this.input = input;
}

// Set up basic middlewares
ValueMapper.aliasMiddleware = function (val, options) {
  // If it is an alias, look it up
  if (typeof val === 'string') {
    val = this.lookup(val, options);
  }

  // Return the value
  return val;
};
ValueMapper.mapMiddleware = function (val, options) {
  // If it is an array, look up the values
  if (Array.isArray(val)) {
    val = val.map(function (item) {
      return ValueMapper.aliasMiddleware.call(this, item, options);
    }, this);
  }

  // Return the value
  return val;
};
ValueMapper.flattenMiddleware = function (val, options) {
  // If it is an array, flatten it
  if (Array.isArray(val)) {
    val = _.flatten(val);
  }

  // Return the value
  return val;
};

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
    var that = this;
    middlewares.forEach(function mapMiddlewareValue (fn) {
      val = fn.call(that, val, options);
    });

    // Return the value
    return val;
  },

  // Resolve the value of a key
  lookup: function (key, options) {
    // Look up the normal value
    var val = this.input[key];

    // Fallback options and map our value through the middlewares
    options = options || {};
    val = this.applyMiddlewares(val, options);

    // Return the value
    return val;
  }
};

// Export ValueMapper
module.exports = ValueMapper;