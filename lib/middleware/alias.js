// Set up and return alias middleware
module.exports = function (key, options) {
  // Assume the key is our value by default
  var val = key,
      aliasesUsed = [],
      aliasesNotFound = [];

  // If it is an alias, look it up
  if (typeof key === 'string') {
    // Perform the lookup
    var valObj = this.lookup(key, options);

    // Add the key to our alias list
    aliasesUsed.push(key);

    // If the value was not found and this is the first not found alias, save it
    val = valObj.value;
    var _aliasesNotFound = valObj.aliasesNotFound;
    if (val === undefined && _aliasesNotFound.length === 0) {
      aliasesNotFound.push(key);
    }

    // Save the recursed valObj info
    aliasesUsed.push.apply(aliasesUsed, valObj.aliasesUsed);
    aliasesNotFound.push.apply(aliasesNotFound, valObj.aliasesNotFound);
  }

  // Return the value
  return {
    value: val,
    aliasesUsed: aliasesUsed,
    aliasesNotFound: aliasesNotFound
  };
};