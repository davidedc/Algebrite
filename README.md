<img src="https://raw.githubusercontent.com/davidedc/Algebrite/941de5515ec57baee3f5d2bacbd4db2ee382c461/readme-images/algebrite-logo-for-readme.png" width="150px" alt="algebrite header"/>

[![npm version](https://badge.fury.io/js/algebrite.svg)](https://badge.fury.io/js/algebrite)

Algebrite is a Javascript library for symbolic mathematics (technically, CoffeeScript) designed to be comprehensible and easily extensible.


```js
var Algebrite = require('algebrite')

Algebrite.run('x + x') // => "2 x"

Algebrite.factor('10!').toString() // => "2^8 3^4 5^2 7"

Algebrite.eval('integral(x^2)').toString() // => "1/3 x^3"

// composing...
Algebrite.integral(Algebrite.eval('x')).toString() // => "1/2 x^2"
```

# Features

Algebrite supports: arbitrary-precision arithmetic, complex quantities, simplification, expansion , substitution, symbolic and numeric roots, units of measurement, matrices, derivatives and gradients, tensors, integrals, multi-integrals, computing integrals and much more!

# Examples and manual

Please refer to [http://algebrite.org/](http://algebrite.org/)

All the built-in methods in Algebrite are exposed through a javascript interface. Strings are automatically parsed as expressions, numbers are converted into the appropriate representation, and the internal cons objects are returned. 

The cons objects have a `toString` method which converts it into a pretty-print notation.

# How to build

For node use:

1. make sure npm is installed
2. ```npm install```
3. ```npm run build```

To debug things, better use the debugger from Chrome, so build for the browser like so:

1. make sure npm is installed
2. make sure browserify is installed
3. ```npm install```
4. ```npm run build-for-browser```
5. open ```index.html```

# How to test

For full tests:

```
npm test
```

For the subset of tests in run-micro-tests.coffee:

```
npm run microtest
```

# Contribute
please take a look at the [contributing](https://github.com/davidedc/Algebrite/blob/master/contributing.md) file.

# References

Algebrite starts as an adaptation of [the EigenMath CAS by George Weigt](http://eigenmath.sourceforge.net/Eigenmath.pdf). Also you might want to check another fork of EigenMath: [SMIB by Philippe Billet](http://smib.sourceforge.net/).

Another CAS of similar nature is [SymPy](http://www.sympy.org/en/index.html) made in Python.

Three other Javascript CAS are

* [javascript-cas by Anthony Foster](https://github.com/aantthony/javascript-cas) supporting "differentiation, complex numbers, sums, vectors (dot products, cross products, gradient/curl etc)"
* [Coffeequate by Matthew Alger](http://coffeequate.readthedocs.org/) supporting "quadratic and linear equations, simplification of most algebraic expressions, uncertainties propagation, substitutions, variables, constants, and symbolic constants".
* [Algebra.js by Nicole White](http://algebra.js.org) which among other things can build and solve equations via a "chainable" API.
