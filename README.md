<img src="https://raw.githubusercontent.com/davidedc/Algebrite/master/readme-images/algebrite-logo-for-readme.png" width="150px" alt="algebrite header"/>


Algebrite is a pure Javascript (technically, Coffeescript) port of the lightweight EigenMath Computer Algebra System. 


```
	var Algebrite = require('algebrite')
	
	Algebrite.run('x + x') // => "2 x"

	Algebrite.factor('10!').toString() // => "2^8 3^4 5^2 7"

	Algebrite.eval('integral(x^2)') // => "1/3 x^3"

```

# Features

Algebrite supports: arbitrary-precision arithmetic, complex quantities, simplification, expansion , substitution, symbolic and numeric roots, units of measurement, matrices, derivatives and gradients, tensors, integrals, multi-integrals, computing integrals and much more!

# Examples and manual

Please refer to [http://algebrite.org/](http://algebrite.org/)

All the built-in methods in EigenMath/Algebrite are exposed through a javascript interface. Strings are automatically parsed as expressions, numbers are converted into the appropriate representation, and the internal cons objects are returned. 

The cons objects have a `toString` method which converts it into a pretty-print notation.

# How to build

`sh compile.sh`

# How to test

1. `npm install`
2. `sh run-tests.sh`

# Contribute
please take a look at the [contributing](https://github.com/davidedc/Algebrite/blob/master/contributing.md) file.

# References

[The EigenMath CAS by George Weigt](http://eigenmath.sourceforge.net/Eigenmath.pdf). Also you might want to check another fork of EigenMath: [SMIB by Philippe Billet](http://smib.sourceforge.net/).

Another CAS of similar nature is [SymPy](http://www.sympy.org/en/index.html) made in Python.

Three other Javascript CAS are

* [javascript-cas by Anthony Foster](https://github.com/aantthony/javascript-cas) supporting "differentiation, complex numbers, sums, vectors (dot products, cross products, gradient/curl etc)"
* [Coffeequate by Matthew Alger](http://coffeequate.readthedocs.org/) supporting "quadratic and linear equations, simplification of most algebraic expressions, uncertainties propagation, substitutions, variables, constants, and symbolic constants".
* [Algebra.js by Nicole White](http://algebra.js.org) which among other things can build and solve equations via a "chainable" API.


# The MIT License (MIT)

Copyright © `2016` `all algebrite contributors`

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
