// Load in dependencies
var _ = require('underscore');

// Set up ObjectMapper constructor
function ObjectMapper(input, options) {
  // Generate an array of middlewares
  this.middlewares = [];

  // Fallback options
  options = options || {};

  // Save input and options for later
  this.input = input;
  this.options = options;

  // If there is an alias, map, or flatten option, add their respective middlewares
  if (options.alias) { this.use(ObjectMapper.aliasMiddleware); }
  if (options.map) { this.use(ObjectMapper.mapMiddleware); }
  if (options.flatten) { this.use(ObjectMapper.flattenMiddleware); }

  // If there were middlewares specified, let them in
  var _middlewares = options.middlewares;
  if (_middlewares) {
    middlewares.push.apply(middlewares, _middlewares);
  }
}
ObjectMapper.aliasMiddleware = function (val) {
  // If it is an alias, look it up
  if (typeof val === 'string') {
    val = this.getValue(val);
  }

  // Return the value
  return val;
};
ObjectMapper.mapMiddleware = function (val) {
  // If it is an array, look up the values
  if (Array.isArray(val)) {
    val = val.map(ObjectMapper.aliasMiddleware, this);
  }

  // Return the value
  return val;
};
ObjectMapper.flattenMiddleware = function (val) {
  // If it is an array, flatten it
  if (Array.isArray(val)) {
    val = _.flatten(val);
  }

  // Return the value
  return val;
};

ObjectMapper.prototype = {
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
  getValue: function (key) {
    // Look up the normal value
    var val = this.input[key];

    // Map our value through the middlewares
    val = this.applyMiddlewares(val);

    // Return the value
    return val;
  },

  // Map out the input's value
  val: function () {
    // Prepare our return value and save this for later
    var retObj = {},
        keys = Object.getOwnPropertyNames(this.input),
        that = this;

    // Lookup and save each of the object's value
    keys.forEach(function lookupItem (key) {
      retObj[key] = that.getValue(key);
    });

    // Return the mapped result
    return retObj;
  }
};

// Set up sugar function
function objectMapper(input, options) {
  // Create a mapper
  var mapper = new ObjectMapper(input, options);

  // Get the value and return
  return mapper.val();
}

// Expose constructor on sugar
objectMapper.ObjectMapper = ObjectMapper;

// Export our sugar function
module.exports = objectMapper;