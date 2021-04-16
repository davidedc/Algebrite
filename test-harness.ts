import process from 'process';
import fs from 'fs';
import { defs } from './runtime/defs';
import { run } from './runtime/run';
import { init } from './runtime/init';

if (!defs.inited) {
  init();
}

const shardCount = Number(process.env['TEST_TOTAL_SHARDS']) || 1;
const shardIndex = Number(process.env['TEST_SHARD_INDEX']) || 0;

const testFilter = process.env['TESTBRIDGE_TEST_ONLY'];

if (process['TEST_SHARD_STATUS_FILE']) {
  fs.writeFileSync(process['TEST_SHARD_STATUS_FILE'], '');
}

let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

process.on('exit', () => {
  console.log(`${passedTests} passed, ${failedTests} failed`);
  if (failedTests > 0) {
    process.exit(1);
  }
});

function filterTrace(trace: string) {
  const filtered: string[] = [];
  for (const line of trace.split('\n')) {
    if (line.indexOf('(internal/modules/cjs/loader.js:') > 0) {
      continue;
    }
    filtered.push(line);
  }
  return filtered.join('\n');
}

class Asserts {
  is(a: unknown, b: unknown, msg?: string) {
    if (Object.is(a, b)) {
      return true;
    }
    console.log('FAIL');
    msg && console.log(msg);
    console.log('Expected: ', a);
    console.log('Actual:   ', b);
    throw new Error('Failed');
  }
  not(a: unknown, b: unknown, msg?: string) {
    if (!Object.is(a, b)) {
      return true;
    }
    console.log('FAIL');
    msg && console.log(msg);
    console.log('Should not b: ', a);
    throw new Error('Failed');
  }
}

let testIndex = 0;
let shouldFail = false;

function shouldSkip(name: string) {
  if (testIndex++ % shardCount != shardIndex) {
    skippedTests++;
    return true;
  } else if (testFilter && name.indexOf(testFilter) != -1) {
    skippedTests++;
    return true;
  }
  return false;
}

let beforeEach = () => {};

function _runTest<T extends unknown[]>(
  name: string,
  f: (t: Asserts, ...args: T) => void,
  ...args: T
) {
  beforeEach();
  console.time(name);
  try {
    console.log(name);
    f(new Asserts(), ...args);
  } finally {
    console.timeEnd(name);
  }
}

function test<T extends unknown[]>(
  name: string,
  f: (t: Asserts, ...args: T) => void,
  ...args: T
) {
  if (shouldSkip(name)) {
    return;
  }
  try {
    _runTest(name, f, ...args);
    passedTests++;
    console.log('OK');
  } catch (ex) {
    failedTests++;
    console.log(filterTrace(ex.stack));
  }
}
test.beforeEach = function(hook: () => void) {
  const head = beforeEach;
  beforeEach = () => {
    head();
    hook();
  };
};

test.failing = function failing<T extends unknown[]>(
  name: string,
  f: (t: Asserts, ...args: T) => void,
  ...args: T
) {
  if (shouldSkip(name)) {
    return;
  }
  let finished = false;
  try {
    _runTest(name, f, ...args);
    finished = true;
  } catch (ex) {
    passedTests++;
    console.log('Expected failure: ', ex);
  }
  if (finished) {
    console.log('FAIL: test marked as failing but passed');
    failedTests++;
  }
};

export { test };

export function setup_test(f: () => void) {
  defs.test_flag = true;

  run('clearall');

  run('e=quote(e)');
  try {
    f();
  } finally {
    defs.test_flag = false;
  }
}

// Use this when order of execution doesn't matter.
// (e.g. s doesn't set any variables)
export function run_shardable_test(s: string[], prefix = '') {
  setup_test(() => {
    for (let i = 0; i < s.length; i += 2) {
      test((prefix || `${testIndex}: `) + s[i], t => {
        defs.out_count = 0;

        t.is(s[i + 1], run(s[i]));
      });
    }
  });
}

export function run_test(s: string[], name?: string) {
  setup_test(() => {
    test(name || `${testIndex}`, t => {
      for (let i = 0; i < s.length; i += 2) {
        defs.out_count = 0;

        t.is(s[i + 1], run(s[i]), `${i}: ${s[i]}`);
      }
    });
  });
}

export function ava_run(t, input, expected) {
  setup_test(() => t.is(expected, run(input)));
}
