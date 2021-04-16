import { mint } from '../sources/bignum';
import { mpow } from '../sources/mpow';
import { test } from '../test-harness';

// small numbers
for (let i = -10; i < 10; i++) {
  const a = mint(i);
  let x = 1;
  for (let j = 0; j < 10; j++) {
    test(`${i}^${j}=${x}`, t => {
      const b = mpow(a, j);
      const c = mint(x);
      t.is(c.toString(), b.toString());
      x *= i;
    });
  }
}
