import { mint } from '../sources/bignum';
import { mdiv, mmod, mmul } from '../sources/mmul';
import { test } from '../test-harness';

function make_test(f: Function, expected: (i: number, j: number) => number) {
  test(f.name, t => {
    for (let i = -100; i <= 100; i++) {
      for (let j = -1000; j <= 100; j++) {
        const a = mint(i);
        const b = mint(j);
        const e = expected(i, j);
        if (!isFinite(e)) {
          continue;
        }
        const c = mint(e);
        t.is(c.toString(), f(a, b).toString(), `${f.name}(${a}, ${b})`);
      }
    }
  });
}

make_test(mmul, (i, j) => i * j);

make_test(mdiv, (i, j) => {
  if (i / j > 0) {
    return Math.floor(i / j);
  } else {
    return Math.ceil(i / j);
  }
});

make_test(mmod, (i, j) => i % j);
