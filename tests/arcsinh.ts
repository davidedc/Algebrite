import { run_test } from '../test-harness';

run_test([
  'arcsinh(0.0)',
  '0.0',

  'arcsinh(0)',
  '0',

  'arcsinh(sinh(x))',
  'x'
]);
