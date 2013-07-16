// Load in dependencies
var _ = require('underscore');

// Set up ValueMapper constructor
function ValueMapper(input, options) {
  // Generate an array of middlewares
  this.middlewares = [];

  // Fallback options
  options = options || {};

  // Save input and options for later
  this.input = input;
  this.options = options;

  // If there is an alias, map, or flatten option, add their respective middlewares
  if (options.alias) { this.use(ValueMapper.aliasMiddleware); }
  if (options.map) { this.use(ValueMapper.mapMiddleware); }
  if (options.flatten) { this.use(ValueMapper.flattenMiddleware); }

  // If there were middlewares specified, let them in
  var _middlewares = options.middlewares;
  if (_middlewares) {
    middlewares.push.apply(middlewares, _middlewares);
  }
}
ValueMapper.aliasMiddleware = function (val) {
  // If it is an alias, look it up
  if (typeof val === 'string') {
    val = this.getValue(val);
  }

  // Return the value
  return val;
};
ValueMapper.mapMiddleware = function (val) {
  // If it is an array, look up the values
  if (Array.isArray(val)) {
    val = val.map(ValueMapper.aliasMiddleware, this);
  }

  // Return the value
  return val;
};
ValueMapper.flattenMiddleware = function (val) {
  // If it is an array, flatten it
  if (Array.isArray(val)) {
    val = _.flatten(val);
  }

  // Return the value
  return val;
};

ValueMapper.prototype = {
  // Helper fn to add new middlewares
  use: function (fn) {
    this.middlewares.push(fn);
  },

  // Resolve values of values via middleware
  applyMiddlewares: function (val) {
    // Map the value through the proxies
    var that = this;
    this.middlewares.forEach(function mapMiddlewareValue (fn) {
      val = fn.call(that, val);
    });

    // Return the value
    return val;
  },

  // Resolve the value of a key
  lookup: function (key) {
    // Look up the normal value
    var val = this.input[key];

    // Map our value through the middlewares
    val = this.applyMiddlewares(val);

    // Return the value
    return val;
  }
};

// Export ValueMapper
module.exports = ValueMapper;