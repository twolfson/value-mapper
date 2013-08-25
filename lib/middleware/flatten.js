// Set up and return flatten middleware
var _ = require('underscore');
module.exports = function (val, options) {
  // If it is an array, flatten it
  if (Array.isArray(val)) {
    val = _.flatten(val);
  }

  // Return the value in an object
  return {
    value: val,
    aliasesUsed: [],
    aliasesNotUsed: []
  };
};