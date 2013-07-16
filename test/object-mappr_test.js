// Load in our library and dependencies
var objectMapper = require('../lib/object-mappr.js'),
    assert = require('assert'),
    glob = require('glob');

// Find all input/output files
var inputFiles = glob.sync('*.input.*', {cwd: __dirname});

// Iterate over them
describe('object-mappr', function () {
  // Create an `it` method for each input
  inputFiles.forEach(function beginTest (inputFile) {
    // Begin the test
    it('interpretting "' + inputFile + '" matches expected output', function testFn () {
      // Load in the input and output files
      var outputFile = inputFile.replace('input', 'output'),
          input = require('./' + inputFile),
          expectedOutput = require('./' + outputFile).value;

      // Process the input via object-fusion
      var actualOutput = objectMapper(input.value, input.options);

      // Compare it to the output
      assert.deepEqual(actualOutput, expectedOutput);
    });
  });
});