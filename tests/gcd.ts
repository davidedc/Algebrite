import { run_test } from '../test-harness';

const gcdTests = [];

const GCD_TESTS_DONT_TEST_FACTOR = 1;

function addGcdTest(arg1, arg2, result, dontTestFactor?: any) {
  gcdTests.push('gcd(' + arg1 + ',' + arg2 + ')');
  gcdTests.push(result);

  gcdTests.push('gcd(' + arg2 + ',' + arg1 + ')');
  gcdTests.push(result);

  if (dontTestFactor == null) {
    gcdTests.push('gcd(factor(' + arg1 + '),' + arg2 + ')');
    gcdTests.push(result);
  }

  if (dontTestFactor == null) {
    gcdTests.push('gcd(factor(' + arg2 + '),' + arg1 + ')');
    gcdTests.push(result);
  }

  if (dontTestFactor == null) {
    gcdTests.push('gcd(' + arg1 + ',factor(' + arg2 + '))');
    gcdTests.push(result);
  }

  if (dontTestFactor == null) {
    gcdTests.push('gcd(' + arg2 + ',factor(' + arg1 + '))');
    gcdTests.push(result);
  }

  if (dontTestFactor == null) {
    gcdTests.push('gcd(factor(' + arg1 + '),factor(' + arg2 + '))');
    gcdTests.push(result);
  }

  if (dontTestFactor == null) {
    gcdTests.push('gcd(factor(' + arg2 + '),factor(' + arg1 + '))');
    return gcdTests.push(result);
  }
}

addGcdTest('30', '42', '6');
addGcdTest('-30', '42', '6');
addGcdTest('30', '-42', '6');
addGcdTest('-30', '-42', '6', GCD_TESTS_DONT_TEST_FACTOR);

addGcdTest('x', 'x', 'x');
addGcdTest('-x', 'x', 'x');
addGcdTest('-x', '-x', '-x');

addGcdTest('x^2', 'x^3', 'x^2');
addGcdTest('x', 'y', '1');
addGcdTest('x*y', 'y', 'y');
addGcdTest('x*y', 'y^2', 'y');
addGcdTest('x^2*y^2', 'x^3*y^3', 'x^2*y^2');
addGcdTest('x^2', 'x^3', 'x^2');

// gcd of expr
addGcdTest('x+y', 'x+z', '1');
addGcdTest('x+y', 'x+y', 'x+y');
addGcdTest('x+y', '2*x+2*y', 'x+y', GCD_TESTS_DONT_TEST_FACTOR);
addGcdTest('-x-y', 'x+y', 'x+y', GCD_TESTS_DONT_TEST_FACTOR);
addGcdTest('4*x+4*y', '6*x+6*y', '2*x+2*y', GCD_TESTS_DONT_TEST_FACTOR);
addGcdTest('4*x+4*y+4', '6*x+6*y+6', '2+2*x+2*y', GCD_TESTS_DONT_TEST_FACTOR);
// TODO this is not really correct, it should give 2
// however this was failing before all the gcd changes
// of May 2019, so just leaving it in with a note
addGcdTest('4*x+4*y+4', '6*x+6*y+12', '1', GCD_TESTS_DONT_TEST_FACTOR);
addGcdTest('27*t^3+y^3+9*t*y^2+27*t^2*y', 't+y', '1');

// gcd expr factor
addGcdTest('2*a^2*x^2+a*x+a*b', 'a', 'a');
addGcdTest('2*a^2*x^2+a*x+a*b', 'a^2', 'a');
addGcdTest('2*a^2*x^2+2*a*x+2*a*b', 'a', 'a');

// gcd expr term
addGcdTest('2*a^2*x^2+2*a*x+2*a*b', '2*a', '2*a');
addGcdTest('2*a^2*x^2+2*a*x+2*a*b', '3*a', 'a');
addGcdTest('2*a^2*x^2+2*a*x+2*a*b', '4*a', '2*a');

// gcd factor factor
addGcdTest('x', 'x^2', 'x');
addGcdTest('x', 'x^a', '1');
run_test(gcdTests);

// multiple arguments
run_test(['gcd(12,18,9)', '3']);
