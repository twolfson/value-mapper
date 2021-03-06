// Load in our library and dependencies
var ValueMapper = require('../lib/value-mapper.js'),
    assert = require('assert'),
    glob = require('glob');

// Find all input/output files
var inputFiles = glob.sync('*.input.*', {cwd: __dirname});

// Iterate over them
inputFiles.forEach(function beginTest (inputFile) {
  // Load in the input and output files
  var outputFile = inputFile.replace('input', 'output'),
      input = require('./' + inputFile),
      expectedOutput = require('./' + outputFile);

  // Create a context for the file
  describe('A ValueMapper for "' + inputFile + '"', function () {
    before(function () {
      this.mapper = new ValueMapper(input.dictionary, input.options);
    });

    // Begin the test
    it('has a lookedup value that matches the expected output', function testFn () {
      // Process the input via object-fusion
      var actualOutput = this.mapper.lookup(input.key);

      // If the output is undefined, delete it
      // DEV: This is required for alias-not-found tests
      if (actualOutput.value === undefined) {
        delete actualOutput.value;
      }

      // Compare it to the output
      assert.deepEqual(actualOutput, expectedOutput.value);
    });
  });
});