# value-mapper [![Build status](https://travis-ci.org/twolfson/value-mapper.png?branch=master)](https://travis-ci.org/twolfson/value-mapper)

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
    }, {
      middlewares: ['alias', 'map']
    });

// Lookup the values on a per-key basis
mapper.lookup('1 + 2');
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
new ValueMapper(input);
new ValueMapper(input, options);
/**
 * Constructor for mapping values
 * @param {Object} input Key-value pairs to map values across
 * @param {Object} [options] Flags to adjust how the mapping is performed
 * @param {Function[]} [options.middlewares] Middlewares to process resolved value through
 *   Built-in middlewares can be used via a 'string'.
 *   'alias': If `value` is a string, returns `value = input[value];`
 *   'map': If `value` is an array, each value will be processed via 'alias'
 *   'flatten': If `value` is an array and contains arrays, flatten it
 */
```

To find values, use the `lookup` method

```js
mapper.lookup(key);
/**
 * Resolve the value of a key
 * @param {String} key Name to lookup value by
 */
```

If you choose to write your own middleware, the method signature will have to look like

```js
/**
 * @param {Mixed} val Value to perform operations on
 * @returns {Object} retObj Container for value and meta information
 * @returns {Mixed} retObj.value Manipulated value of `val`
 * @returns {String[]} retObj.aliasesUsed Array of aliased keys used while looking up
 * @returns {String[]} retObj.aliasesNotFound Array of aliased not found while looking up
```

Inside of your middleware, you have the context (i.e. `this`) of `mapper` (allowing you to call `this.lookup`) and access to the `key` of the current lookup call via `this.key`.

Values can be procesed through middlewares via `process(val);`

New middlewares can be added to an instance via `addMiddleware(key);` (accepts built-in name or function)

Built-in middlewares can be added via `ValueMapper.addMiddleware(name, fn);`

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

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2013 Todd Wolfson

Licensed under the MIT license.
