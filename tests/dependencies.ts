import {
  computeDependenciesFromAlgebra,
  computeResultsAndJavaScriptFromAlgebra,
  findDependenciesInScript,
  run,
} from '../runtime/run';
import { do_clearall } from '../sources/clear';
import { test } from '../test-harness';

test.beforeEach(do_clearall);

test('0', t => {
  let testResult = findDependenciesInScript('1');

  t.is(
    'All local dependencies: . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively: ',
    testResult[0]
  );

  t.is('1', testResult[1]);
  t.is('', testResult[2]);
});

test('1', t => {
  // check that floats in code are expressed with maximum precision -------------------
  const testResult = findDependenciesInScript('a = float(1/3)');

  t.is(
    'All local dependencies:  variable a depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('a = 0.3333333333333333;', testResult[2]);
});

test('2', t => {
  const testResult = findDependenciesInScript('a = float(10^50)');

  t.is(
    'All local dependencies:  variable a depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('a = 1e+50;', testResult[2]);
});

test('3', t => {
  const testResult = findDependenciesInScript(
    'f = x+1\n g = f\n h = g\n f = g'
  );

  t.is(
    'All local dependencies:  variable f depends on: x, g, ;  variable g depends on: f, ;  variable h depends on: g, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: x, ;  f --> g -->  ... then f again,  variable g depends on: x, ;  g --> f -->  ... then g again,  variable h depends on: x, ;  h --> g --> f -->  ... then g again, ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    '// f is part of a cyclic dependency, no code generated.\n// g is part of a cyclic dependency, no code generated.\n// h is part of a cyclic dependency, no code generated.',
    testResult[2]
  );
});

test('4', t => {
  t.is(
    'All local dependencies:  variable f depends on: x, ;  variable g depends on: f, y, ;  variable h depends on: g, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: x, ;  variable g depends on: x, y, ;  variable h depends on: x, y, ; ',
    findDependenciesInScript('f = x+1\n g = f + y\n h = g')[0]
  );
});

test('5', t => {
  t.is(
    'All local dependencies:  variable g depends on: h, x, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: h, x, y, ; ',
    findDependenciesInScript('g = h(x,y)')[0]
  );
});

test('6', t => {
  t.is(
    "All local dependencies:  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, 'y, k, ; ",
    findDependenciesInScript('f(x,y) = k')[0]
  );
});

test('7', t => {
  t.is(
    "All local dependencies:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; ",
    findDependenciesInScript('x = z\n f(x,y) = k')[0]
  );
});

test('8', t => {
  t.is(
    'All local dependencies:  variable x depends on: z, ;  variable g depends on: f, x, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: z, ;  variable g depends on: f, z, y, ; ',
    findDependenciesInScript('x = z\n g = f(x,y)')[0]
  );
});

test('9', t => {
  t.is(
    'All local dependencies:  variable x depends on: y, z, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, z, ; ',
    findDependenciesInScript('x = 1\n x = y\n x = z')[0]
  );
});

test('10', t => {
  const testResult = findDependenciesInScript('x = y*y');

  t.is(
    'All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = function (y) { return ( Math.pow(y, 2) ); }', testResult[2]);
});

test('11', t => {
  let testResult = findDependenciesInScript('x = e*e');

  t.is(
    'All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = Math.exp(2);', testResult[2]);

  testResult = findDependenciesInScript('x = e');

  t.is(
    'All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = Math.E;', testResult[2]);

  testResult = findDependenciesInScript('x = -sqrt(2)/2');

  t.is(
    'All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = -1/2*Math.SQRT2;', testResult[2]);
});

test('12', t => {
  const testResult = findDependenciesInScript('x = 2^(1/2-a)*2^a/10');

  t.is(
    'All local dependencies:  variable x depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = 1/10*Math.SQRT2;', testResult[2]);
});

test('13', t => {
  const testResult = findDependenciesInScript(
    'x = rationalize(t*y/(t+y)+2*t^2*y*(2*t+y)^(-2))'
  );

  t.is(
    'All local dependencies:  variable x depends on: t, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: t, y, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'x = function (t, y) { return ( t*y*(6*Math.pow(t, 2)+Math.pow(y, 2)+6*t*y)/((t+y)*Math.pow((2*t+y), 2)) ); }',
    testResult[2]
  );
});

test('14', t => {
  const testResult = findDependenciesInScript('x = abs((a+i*b)/(c+i*d))');

  t.is(
    'All local dependencies:  variable x depends on: a, b, c, d, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, b, c, d, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'x = function (a, b, c, d) { return ( Math.sqrt(Math.pow(a, 2)+Math.pow(b, 2))/(Math.sqrt(Math.pow(c, 2)+Math.pow(d, 2))) ); }',
    testResult[2]
  );
});

test('15', t => {
  const testResult = findDependenciesInScript(
    'x = sin(1/10)^2 + cos(1/10)^2 + y'
  );

  t.is(
    'All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = function (y) { return ( 1+y ); }', testResult[2]);
});

test('16', t => {
  const testResult = findDependenciesInScript('x = y + cos(1) + sin(1)');

  t.is(
    'All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'x = function (y) { return ( y+Math.cos(1)+Math.sin(1) ); }',
    testResult[2]
  );
});

test('17', t => {
  const testResult = findDependenciesInScript('x = a + arccos(b) + arcsin(c)');

  t.is(
    'All local dependencies:  variable x depends on: a, arccos, b, arcsin, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, arccos, b, arcsin, c, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'x = function (a, b, c) { return ( a+Math.acos(b)+Math.asin(c) ); }',
    testResult[2]
  );
});

test('18', t => {
  const testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2');

  t.is(
    'All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('x = 1;', testResult[2]);
});

test('19', t => {
  const testResult = findDependenciesInScript('a = unit(b) + c');

  t.is(
    'All local dependencies:  variable a depends on: b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, c, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('a = function (c, b) { return ( c+identity(b) ); }', testResult[2]);
});

test('20', t => {
  const testResult = findDependenciesInScript('f(x) = x * x');

  t.is(
    "All local dependencies:  variable f depends on: 'x, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = function (x) { return ( Math.pow(x, 2) ); }', testResult[2]);
});

test('21', t => {
  const testResult = findDependenciesInScript('f(x) = x * x + g(y)');

  t.is(
    "All local dependencies:  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, g, y, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'f = function (g, y, x) { return ( g(y)+Math.pow(x, 2) ); }',
    testResult[2]
  );
});

test('22', t => {
  const testResult = findDependenciesInScript('y = 2\nf(x) = x * x + g(y)');

  t.is(
    "All local dependencies:  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable y depends on: ;  variable f depends on: 'x, g, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'y = 2;\nf = function (g, x) { return ( g(2)+Math.pow(x, 2) ); }',
    testResult[2]
  );
});

test('23', t => {
  const testResult = findDependenciesInScript(
    'g(x) = x + 2\ny = 2\nf(x) = x * x + g(y)'
  );

  t.is(
    "All local dependencies:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'g = function (x) { return ( 2+x ); }\ny = 2;\nf = function (x) { return ( 4+Math.pow(x, 2) ); }',
    testResult[2]
  );
});

test('24', t => {
  const testResult = findDependenciesInScript(
    'g(x) = x + 2\nf(x) = x * x + g(y)'
  );

  t.is(
    "All local dependencies:  variable g depends on: 'x, ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable f depends on: 'x, y, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'g = function (x) { return ( 2+x ); }\nf = function (y, x) { return ( 2+y+Math.pow(x, 2) ); }',
    testResult[2]
  );
});

test('25', t => {
  /*
  testResult = findDependenciesInScript('g(x) = f(x)\nf(x)=g(x)')
  if testResult[0] == "All local dependencies:  variable g depends on: 'x, f, x, ;  variable f depends on: 'x, g, x, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  g --> f -->  ... then g again,  variable f depends on: 'x, x, ;  f --> g -->  ... then f again, " and
    testResult[1] == "" and
    testResult[2] == "// g is part of a cyclic dependency, no code generated.\n// f is part of a cyclic dependency, no code generated."
      console.log "ok dependency test"
  else
      console.log "fail dependency test 28 expected: " + testResult

  do_clearall()
  */

  const testResult = findDependenciesInScript(
    'piApprox = sum((-1)^k * (1/(2*k + 1)),k,0,iterations)*4'
  );

  t.is(
    'All local dependencies:  variable piApprox depends on: iterations, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable piApprox depends on: iterations, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'piApprox = function (iterations) { return ( 4*(function(){ var k;  var holderSum = 0;  var lowerlimit = 0;  var upperlimit = iterations;  for (k = lowerlimit; k < upperlimit; k++) {    holderSum += Math.pow((-1), k)/(2*k+1); }  return holderSum;})() ); }',
    testResult[2]
  );

  t.is(
    'piApprox(iterations) = 4\\sum_{k=0}^{iterations}{\\frac{(-1)^k}{(2k+1)}}',
    testResult[3]
  );
});

test('26', t => {
  const testResult = findDependenciesInScript(
    'piApprox = 2*product(4*k^2/(4*k^2-1),k,1,iterations)'
  );

  t.is(
    'All local dependencies:  variable piApprox depends on: iterations, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable piApprox depends on: iterations, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'piApprox = function (iterations) { return ( 2*(function(){ var k;  var holderProduct = 1;  var lowerlimit = 1;  var upperlimit = iterations;  for (k = lowerlimit; k < upperlimit; k++) {    holderProduct *= 4*Math.pow(k, 2)/(4*Math.pow(k, 2)-1); }  return holderProduct;})() ); }',
    testResult[2]
  );

  t.is(
    'piApprox(iterations) = 2\\prod_{k=1}^{iterations}{\\frac{4k^2}{(4k^2-1)}}',
    testResult[3]
  );
});

test('27', t => {
  const testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c, x)');

  t.is(
    'All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, c, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'f = function (a, b, c) { return ( [-1/2*(Math.sqrt(Math.pow(b, 2)/(Math.pow(a, 2))-4*c/a)+b/a),1/2*(Math.sqrt(Math.pow(b, 2)/(Math.pow(a, 2))-4*c/a)-b/a)] ); }',
    testResult[2]
  );
});

test('28', t => {
  const testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c)');

  t.is(
    'All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, c, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'f = function (a, b, c) { return ( [-1/2*(Math.sqrt(Math.pow(b, 2)/(Math.pow(a, 2))-4*c/a)+b/a),1/2*(Math.sqrt(Math.pow(b, 2)/(Math.pow(a, 2))-4*c/a)-b/a)] ); }',
    testResult[2]
  );
});

test('29', t => {
  const testResult = findDependenciesInScript('f = roots(integral(a*x + b))');

  t.is(
    'All local dependencies:  variable f depends on: a, b, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = function (a, b) { return ( [0,-2*b/a] ); }', testResult[2]);
});

test('30', t => {
  const testResult = findDependenciesInScript(
    'f = roots(defint(a*x + y,y,0,1))'
  );

  t.is(
    'All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = function (a) { return ( -1/(2*a) ); }', testResult[2]);
});

test('31', t => {
  const testResult = findDependenciesInScript(
    'f = roots(defint(a*x + y + z,y,0,1, z, 0, 1))'
  );

  t.is(
    'All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = function (a) { return ( -1/a ); }', testResult[2]);
});

test('32', t => {
  const testResult = findDependenciesInScript('f = defint(2*x - 3*y,x,0,2*y)');

  t.is(
    'All local dependencies:  variable f depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: y, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = function (y) { return ( -2*Math.pow(y, 2) ); }', testResult[2]);
});

test('33', t => {
  const testResult = findDependenciesInScript(
    'f = defint(12 - x^2 - (y^2)/2,x,0,2,y,0,3)'
  );

  t.is(
    'All local dependencies:  variable f depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('f = 55;', testResult[2]);
});

test('34', t => {
  // this example checks that functions are not meddled with,
  // in particular that in the function body, the variables
  // bound by the parameters remain "separate" from previous
  // variables with the same name.
  const testResult = findDependenciesInScript('a = 2\nf(a) = a+1+b');

  t.is(
    "All local dependencies:  variable a depends on: ;  variable f depends on: 'a, b, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: 'a, b, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('a = 2;\nf = function (a, b) { return ( 1+a+b ); }', testResult[2]);
});

test('35', t => {
  // similar as test above but this time we are not
  // defining a function, so things are a bit different.
  const testResult = findDependenciesInScript('a = 2\nf = a+1');

  t.is(
    'All local dependencies:  variable a depends on: ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('a = 2;\nf = 3;', testResult[2]);
});

test('36', t => {
  // similar as test above but this time we do a
  // trick with the quote to see whether we
  // get confused with the indirection
  const testResult = findDependenciesInScript('a := b\nf = a+1');

  t.is(
    'All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'a = function (b) { return ( b ); }\nf = function (b) { return ( 1+b ); }',
    testResult[2]
  );
});

test('37', t => {
  // another tricky case of indirection through quote
  const testResult = findDependenciesInScript('a := b\nf(a) = a+1');

  t.is(
    "All local dependencies:  variable a depends on: b, ;  variable f depends on: 'a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: 'a, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'a = function (b) { return ( b ); }\nf = function (a) { return ( 1+a ); }',
    testResult[2]
  );
});

test('38', t => {
  // reassignment
  const testResult = findDependenciesInScript('b = 1\nb=a+b+c');

  t.is(
    'All local dependencies:  variable b depends on: a, c, ; . Symbols with reassignments: b, . Symbols in expressions without assignments: . All dependencies recursively:  variable b depends on: a, c, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('b = function (a, c) { return ( 1+a+c ); }', testResult[2]);
});

test('39', t => {
  // reassignment
  const testResult = findDependenciesInScript('a = a+1');

  t.is(
    'All local dependencies:  variable a depends on: ; . Symbols with reassignments: a, . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; ',
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('', testResult[2]);
  t.is('Error: Stop: recursive evaluation of symbols: a -> a', testResult[5]);
});

test('40', t => {
  // reassignment
  const testResult = computeDependenciesFromAlgebra(
    'pattern(a,b)\nc= d\na=a+1'
  );
  t.is(3, testResult.affectsVariables.length);
  t.is(3, testResult.affectedBy.length);
  t.is(true, testResult.affectsVariables.includes("c"));
  t.is(true, testResult.affectsVariables.includes("a"));
  t.is(true, testResult.affectsVariables.includes("PATTERN_DEPENDENCY"));
  t.is(true, testResult.affectedBy.includes("d"));
  t.is(true, testResult.affectedBy.includes("a"));
  t.is(true, testResult.affectedBy.includes("PATTERN_DEPENDENCY"));
});

test('41', t => {
  const testResult = computeDependenciesFromAlgebra('PCA(M) = eig(Mᵀ⋅M)');
  t.is(1, testResult.affectsVariables.length);
  t.is(1, testResult.affectedBy.length);
  t.is(true, testResult.affectsVariables.includes("PCA"));
  t.is(false, testResult.affectsVariables.includes("PATTERN_DEPENDENCY"));
  t.is(true, testResult.affectedBy.includes("PATTERN_DEPENDENCY"));
});

test('42', t => {
  const testResult = computeDependenciesFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))');
  t.is(1, testResult.affectsVariables.length);
  t.is(1, testResult.affectedBy.length);
  t.is(true, testResult.affectsVariables.includes("PATTERN_DEPENDENCY"));
  t.is(true, testResult.affectedBy.includes("PATTERN_DEPENDENCY"));
});

test('43', t => {
  const testResult = findDependenciesInScript('a = b\nf = a+1');

  t.is(
    'All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; ',
    testResult[0]
  );

  t.is('', testResult[1]);

  t.is(
    'a = function (b) { return ( b ); }\nf = function (b) { return ( 1+b ); }',
    testResult[2]
  );
});

test('44', t => {
  const testResult = findDependenciesInScript('PCA(M) = eig(cov(M))');

  t.is(
    "All local dependencies:  variable PCA depends on: 'M, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable PCA depends on: 'M, ; ",
    testResult[0]
  );

  t.is('', testResult[1]);
  t.is('PCA = function (M) { return ( eig(cov(M)) ); }', testResult[2]);
});

test('45', t => {
  computeResultsAndJavaScriptFromAlgebra('PCA(M) = eig(Mᵀ⋅M)');
  const testResult = run('symbolsinfo');
  t.is(false, testResult.includes('AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE'));
});

test('46', t => {
  // this checks error handling in case of pattern and syntax error
  // picked up during scanning.
  computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))');
  computeResultsAndJavaScriptFromAlgebra('simplify(');
  const testResult = computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M');

  t.is('PCA = function (M) { return ( cov(M) ); }', testResult.code);
  t.is('$$PCA(M) = cov(M)$$', testResult.latexResult);
  t.is('$$PCA(M) = cov(M)$$', testResult.result);
  t.is('M', testResult.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[1]);
  t.is(1, testResult.dependencyInfo.affectsVariables.length);
  t.is('PCA', testResult.dependencyInfo.affectsVariables[0]);
});

test('47', t => {
  const testResult = computeResultsAndJavaScriptFromAlgebra('x + x + x');

  t.is('', testResult.code);
  t.is('$$3x$$', testResult.latexResult);
  t.is('$$3x$$', testResult.result);
  t.is(2, testResult.dependencyInfo.affectedBy.length);
  t.is('x', testResult.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[1]);
  t.is(0, testResult.dependencyInfo.affectsVariables.length);
});

test('48', t => {
  computeResultsAndJavaScriptFromAlgebra('x = y + 2');
  const testResult = computeResultsAndJavaScriptFromAlgebra('x + x + x');

  t.is('', testResult.code);
  t.is('$$3y+6$$', testResult.latexResult);
  t.is('$$3y+6$$', testResult.result);
  t.is(2, testResult.dependencyInfo.affectedBy.length);
  t.is('x', testResult.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[1]);
  t.is(0, testResult.dependencyInfo.affectsVariables.length);
});

test('49', t => {
  const testResult = computeResultsAndJavaScriptFromAlgebra('[[0,1],[1,0]]');

  t.is(
    '$$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$',
    testResult.latexResult
  );

  t.is(
    '$$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$',
    testResult.result
  );
  t.is(0, testResult.dependencyInfo.affectsVariables.length);
});

test('50', t => {
  const testResult = computeResultsAndJavaScriptFromAlgebra(
    'x = [[0,1],[1,0]]'
  );

  t.is('x = [[0,1],[1,0]];', testResult.code);

  t.is(
    '$$x = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$',
    testResult.latexResult
  );

  t.is(
    '$$x = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$',
    testResult.result
  );

  t.is(1, testResult.dependencyInfo.affectedBy.length);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[0]);
  t.is(1, testResult.dependencyInfo.affectsVariables.length);
  t.is('x', testResult.dependencyInfo.affectsVariables[0]);
});

test('51', t => {
  // a simple array lookup like this is turned into
  // a function, which is slighly silly but
  // it's orthogonal, this works also if instead of
  // b we have an arbitrary non-trivial function
  // on b, maybe even symbolic e.g. the round
  // of the root of by = 6, i.e. round(root(by-6,y))
  // TODO wouldn't (a)[b] work just as well?
  const testResult = computeResultsAndJavaScriptFromAlgebra('x = a[b]');

  t.is('x = function (a, b) { return ( a[b] ); }', testResult.code);
  t.is('$$x(a, b) = a[b]$$', testResult.latexResult);
  t.is('$$x(a, b) = a[b]$$', testResult.result);
  t.is(3, testResult.dependencyInfo.affectedBy.length);
  t.is('a', testResult.dependencyInfo.affectedBy[0]);
  t.is('b', testResult.dependencyInfo.affectedBy[1]);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[2]);
  t.is(1, testResult.dependencyInfo.affectsVariables.length);
  t.is('x', testResult.dependencyInfo.affectsVariables[0]);
});

test('52', t => {
  const testResult = computeResultsAndJavaScriptFromAlgebra('x = a ⋅ b');
  // TODO is it really needed to wrap it in a function like this?
  t.is('x = function (a, b) { return ( dot(a, b) ); }', testResult.code);
  t.is('$$x(a, b) = a \\cdot b$$', testResult.latexResult);
  t.is('$$x(a, b) = a \\cdot b$$', testResult.result);
  t.is(3, testResult.dependencyInfo.affectedBy.length);
  t.is('a', testResult.dependencyInfo.affectedBy[0]);
  t.is('b', testResult.dependencyInfo.affectedBy[1]);
  t.is('PATTERN_DEPENDENCY', testResult.dependencyInfo.affectedBy[2]);
  t.is(1, testResult.dependencyInfo.affectsVariables.length);
  t.is('x', testResult.dependencyInfo.affectsVariables[0]);
});

test('53', t => {
  // Here we test an actual sequence of invokations form the
  // notebook.

  let code1 = 'pattern(a_ᵀ⋅a_, cov(a_))';
  let code2 = 'PCA = Mᵀ·M';

  // invokation sequence, we check that the
  // full evaluation of the last piece of code
  // gives the correct result.
  computeDependenciesFromAlgebra(code1);
  computeDependenciesFromAlgebra(code2);
  computeResultsAndJavaScriptFromAlgebra(code1);
  computeDependenciesFromAlgebra(code1);
  computeDependenciesFromAlgebra(code2);
  let res = computeResultsAndJavaScriptFromAlgebra(code2);

  t.is('PCA = function (M) { return ( cov(M) ); }', res.code);
  t.is('$$PCA(M) = cov(M)$$', res.latexResult);
  t.is(1, res.dependencyInfo.affectsVariables.length);
  t.is('PCA', res.dependencyInfo.affectsVariables[0]);
  t.is(2, res.dependencyInfo.affectedBy.length);
  t.is('M', res.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', res.dependencyInfo.affectedBy[1]);
});

test('54', t => {
  // overwriting a pattern, as seen from the notebook

  const code1 = 'pattern(a_ + a_, 42 * a_)';
  const code2 = 'pattern(a_ + a_, 21 * a_)';
  const code3 = 'f = x + x';

  computeResultsAndJavaScriptFromAlgebra(code1);
  computeResultsAndJavaScriptFromAlgebra(code2);
  const res = computeResultsAndJavaScriptFromAlgebra(code3);

  t.is('f = function (x) { return ( 21*x ); }', res.code);
  t.is('$$f(x) = 21x$$', res.latexResult);
  t.is(1, res.dependencyInfo.affectsVariables.length);
  t.is('f', res.dependencyInfo.affectsVariables[0]);
  t.is(2, res.dependencyInfo.affectedBy.length);
  t.is('x', res.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', res.dependencyInfo.affectedBy[1]);
});

test('55', t => {
  // tests

  const res = computeResultsAndJavaScriptFromAlgebra(
    'f=test(x<1,-x-4,3<=x,x*x+7,120/x+5)'
  );

  t.is(
    'f = function (x) { return ( (function(){if (((x) < (1))){return (-x-4);} else if (((3) <= (x))){return (x*x+7);}else {return (120/x+5);}})() ); }',
    res.code
  );

  t.is(
    '$$f(x) = \\left\\{ \\begin{array}{ll}{-x-4} & if & {x} < {1} \\\\\\\\{xx+7} & if & {3} \\leq {x} \\\\\\\\{\\frac{120}{x}+5} & otherwise  \\end{array} \\right.$$',
    res.latexResult
  );

  t.is(1, res.dependencyInfo.affectsVariables.length);
  t.is('f', res.dependencyInfo.affectsVariables[0]);
  t.is(2, res.dependencyInfo.affectedBy.length);
  t.is('x', res.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', res.dependencyInfo.affectedBy[1]);
});

test('56', t => {
  // tests

  const res = computeResultsAndJavaScriptFromAlgebra(
    'f=floor(x) + ceiling(x) + round(x)'
  );

  t.is(
    'f = function (x) { return ( ceiling(x)+floor(x)+round(x) ); }',
    res.code
  );

  t.is(
    '$$f(x) =  \\lceil {x} \\rceil + \\lfloor {x} \\rfloor +round(x)$$',
    res.latexResult
  );

  t.is(1, res.dependencyInfo.affectsVariables.length);
  t.is('f', res.dependencyInfo.affectsVariables[0]);
  t.is(2, res.dependencyInfo.affectedBy.length);
  t.is('x', res.dependencyInfo.affectedBy[0]);
  t.is('PATTERN_DEPENDENCY', res.dependencyInfo.affectedBy[1]);
});
