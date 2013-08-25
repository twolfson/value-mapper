// Set up and return map middleware
module.exports = function (val, options) {
  // Prepare alias info
  var aliasesUsed = [],
      aliasesNotFound = [];

  // If it is an array, look up the values
  if (Array.isArray(val)) {
    val = val.map(function (item) {
      // Lookup the value
      var valObj = ValueMapper.aliasMiddleware.call(this, item, options);

      // Save the value info to aliasesUsed and aliasesNotFound
      aliasesUsed.push.apply(aliasesUsed, valObj.aliasesUsed);
      aliasesNotFound.push.apply(aliasesNotFound, valObj.aliasesNotFound);

      // Return the found value
      return valObj.value;
    }, this);
  }

  // Return the value
  return {
    value: val,
    aliasesUsed: aliasesUsed,
    aliasesNotFound: aliasesNotFound
  };
};