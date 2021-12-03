import { run_test } from '../test-harness';

run_test([
  'numerator(2/3)',
  '2',

  'numerator(x)',
  'x',

  'numerator(1/x)',
  '1',

  'numerator(a+b)',
  'a+b',

  'numerator(1/a+1/b)',
  'a+b',
]);
