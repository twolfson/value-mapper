# value-mapper [![Donate on Gittip](http://badgr.co/gittip/twolfson.png)](https://www.gittip.com/twolfson/)

Lookup values from a dictionary with aliasing, mapping, and flattenining.

This is used by [doubleshot][doubleshot] to map values inside of `content`.

[doubleshot]: https://github.com/twolfson/doubleshot

## Getting Started
Install the module with: `npm install value-mapper`

```javascript
// Create a mapper
var ValueMapper = require('value-mapper'),
    mapper = new ValueMapper({
      '1 + 2': ['One', 'plus two'],
      'One': function () {
        this.sum = 1;
      },
      'plus two': function () {
        this.sum += 2;
      },
      '= 3': 'equals three',
      'equals three': function () {
        assert.strictEqual(this.sum, 3);
      }
    });

// Lookup the values on a per-key basis
mapper.lookup('1 + 2', {
  alias: true,
  map: true
});
/*
[
  function () {
    this.sum = 1;
  },
  function () {
    this.sum += 2;
  }
]
*/
```

## Documentation
`ValueMapper` is a constructor function

```js
/**
 * Constructor for mapping values
 * @param {Object} input Key-value pairs to map values across
 */
```

To find values, use the `lookup` method

```js
mapper.lookup(key);
mapper.lookup(key, options);
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
```

## Examples
Here is an example using `map`, `alias`, and `flatten`.

```js
// A complex mapping
var mapper = ValueMapper({
      'A fruit': 'A banana',
      'A banana': function () {
        this.color = 'yellow';
        this.fruit = new Banana();
      },
      'is yellow': ['hasColor', 'assertColor'],
      'when peeled is white': ['when peeled', 'is white'],
      'when peeled': function () {
        this.color = 'white';
        this.fruit = this.fruit.peel();
      },
      'is white': ['hasColor', 'assertColor'],
      'hasColor': function () {
        assert(this.fruit.color);
      },
      'assertColor': function () {
        assert.strictEqual(this.fruit.color, this.color);
      }
    }, {
      alias: true,
      map: true,
      flatten: true
    });

// when mapped looks like
mapper.lookup('A fruit');
/*
function () {
  this.color = 'yellow';
  this.fruit = new Banana();
}
*/

mapper.lookup('is yellow');
/*
[
  function () {
    assert(this.fruit.color);
  },
   function () {
    assert.strictEqual(this.fruit.color, this.color);
  }
]
*/

mapper.lookup('when peeled is white');
/*
[
   function () {
    this.color = 'white';
    this.fruit = this.fruit.peel();
  },
  function () {
    assert(this.fruit.color);
  },
   function () {
    assert.strictEqual(this.fruit.color, this.color);
  }
]
*/
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
