
<img src="https://raw.githubusercontent.com/davidedc/Algebrite/master/readme-images/algebrite-logo-for-readme.png" width="150px" alt="algebrite header"/>

Algebrite is a Javascript library for symbolic mathematics (actually, mostly coffeescript resulting in Javascript) keeping the code as simple as possible in order to be comprehensible and easily extensible.

# Why Algebrite

Algebrite is...
* lightweight: made to be simple to comprehend and extend, it only depends on BigInteger.js by Peter Olson.
* self-contained: doesn't need connection to servers or another "backend" CAS
* a library: beyond use as an interactive tool, algebrite can be embedded in your applications and extended with custom functions.
* free: MIT-Licenced

# Features
Algebrite supports: arbitrary-precision arithmetic, complex quantities, simplification, expansion , substitution, units of measurement, derivatives and gradients, tensors, integrals, multi-integrals, computing integrals and much more!

# Examples and manual

Please refer to [http://algebrite.org/](http://algebrite.org/)

# How to build it
To recompile the tables (this should almost never be needed):

```coffee --compile --bare tables/itab.coffee```

```coffee --compile --bare tables/primetab.coffee```

...to recompile the actual sources as soon as they change:

```coffee --watch  -c --bare --join algebrite-0.1.0.js  *.coffee```

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
