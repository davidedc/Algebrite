import {
  car,
  cdr,
  DEBUG,
  defs,
  iscons,
  NIL,
  PATTERN,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import {push_symbol, symbol} from '../runtime/symbol';
import { equal, new_string } from '../sources/misc';
import { makeList } from './list';
import { print_list } from './print';

/*
  Add a pattern i.e. a substitution rule.
  Substitution rule needs a template as first argument
  and what to transform it to as second argument.
  Optional third argument is a boolean test which
  adds conditions to when the rule is applied.
*/

// same as Eval_pattern but only leaves
// NIL on stack at return, hence gives no
// printout
export function Eval_silentpattern(p1: U) {
  Eval_pattern(p1);
  pop();
  push_symbol(NIL);
}

export function Eval_pattern(p1: U) {
  // check that the parameters are allright
  let thirdArgument: U;
  if (!iscons(cdr(p1))) {
    stop('pattern needs at least a template and a transformed version');
  }
  const firstArgument = car(cdr(p1));
  const secondArgument = car(cdr(cdr(p1)));
  if (secondArgument === symbol(NIL)) {
    stop('pattern needs at least a template and a transformed version');
  }
  // third argument is optional and contains the tests
  if (!iscons(cdr(cdr(p1)))) {
    thirdArgument = symbol(NIL);
  } else {
    thirdArgument = car(cdr(cdr(cdr(p1))));
  }

  if (equal(firstArgument, secondArgument)) {
    stop('recursive pattern');
  }

  // console.log "Eval_pattern of " + cdr(p1)
  // this is likely to create garbage collection
  // problems in the C version as it's an
  // untracked reference
  let stringKey = 'template: ' + print_list(firstArgument);
  stringKey += ' tests: ' + print_list(thirdArgument);
  if (DEBUG) {
    console.log(`pattern stringkey: ${stringKey}`);
  }

  const patternPosition = defs.userSimplificationsInStringForm.indexOf(
    stringKey
  );
  // if pattern is not there yet, add it, otherwise replace it
  if (patternPosition === -1) {
    //console.log "adding pattern because it doesn't exist: " + cdr(p1)
    defs.userSimplificationsInStringForm.push(stringKey);
    defs.userSimplificationsInListForm.push(cdr(p1));
  } else {
    if (DEBUG) {
      console.log(`pattern already exists, replacing. ${cdr(p1)}`);
    }
    defs.userSimplificationsInStringForm[patternPosition] = stringKey;
    defs.userSimplificationsInListForm[patternPosition] = cdr(p1);
  }

  // return the pattern node itself so we can
  // give some printout feedback
  push(makeList(symbol(PATTERN), cdr(p1)));
}

/*
  Clear all patterns
*/
export function do_clearPatterns() {
  defs.userSimplificationsInListForm = [];
  defs.userSimplificationsInStringForm = [];
}

export function Eval_clearpatterns() {
  // this is likely to create garbage collection
  // problems in the C version as it's an
  // untracked reference
  do_clearPatterns();

  // return nothing
  push_symbol(NIL);
}

export function Eval_patternsinfo() {
  const patternsinfoToBePrinted = patternsinfo();

  if (patternsinfoToBePrinted !== '') {
    new_string(patternsinfoToBePrinted);
  } else {
    push_symbol(NIL);
  }
}

function patternsinfo() {
  let patternsinfoToBePrinted = '';
  for (let i of Array.from(defs.userSimplificationsInListForm)) {
    patternsinfoToBePrinted += defs.userSimplificationsInListForm + '\n';
  }
  return patternsinfoToBePrinted;
}
