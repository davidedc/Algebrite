import {
  caddr,
  cadr,
  car,
  cdr,
  Cons,
  DEBUG,
  defs,
  isadd,
  iscons,
  ismultiply,
  NIL,
  symbol,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { push, top } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add_all } from './add';
import { Eval } from './eval';
import { guess } from './guess';
import { list, makeList } from './list';
import { multiply_all, negate } from './multiply';

// this function extract parts subtrees from a tree.
// It is used in two
// places that have to do with pattern matching.
// One is for integrals, where an expression or its
// subparts are matched against cases in an
// integrals table.
// Another one is for applyging tranformation patterns
// defined via PATTERN, again patterns are applied to
// either the whole expression or any of its parts.

// unclear to me at the moment
// why this is exposed as something that can
// be evalled. Never called.
export function Eval_decomp(p1: U) {
  console.log('Eval_decomp is being called!!!!!!!!!!!!!!!!!!!!');
  const arg = Eval(cadr(p1));
  p1 = Eval(caddr(p1));

  const variable = p1 === symbol(NIL) ? guess(arg) : p1;
  const result = decomp(false, arg, variable);
  push(makeList(symbol(NIL), ...result));
}

function pushTryNotToDuplicateLocal(localStack: U[], item: U) {
  if (localStack.length > 0 && equal(item, localStack[localStack.length - 1])) {
    return false;
  }
  localStack.push(item);
  return true;
}

// returns constant expressions on the stack
export function decomp(generalTransform: boolean, p1: U, p2: U): U[] {
  if (DEBUG) {
    console.log(`DECOMPOSING ${p1}`);
  }

  // is the entire expression constant?
  if (generalTransform) {
    if (!iscons(p1)) {
      if (DEBUG) {
        console.log(` ground thing: ${p1}`);
      }
      return [p1];
    }
  } else {
    if (!Find(p1, p2)) {
      if (DEBUG) {
        console.log(' entire expression is constant');
      }
      return [p1];
    }
  }

  // sum?
  if (isadd(p1)) {
    return decomp_sum(generalTransform, p1, p2);
  }

  // product?
  if (ismultiply(p1)) {
    return decomp_product(generalTransform, p1, p2);
  }

  let p3: U = cdr(p1);

  // naive decomp if not sum or product
  if (DEBUG) {
    console.log(' naive decomp');
    console.log(`startig p3: ${p3}`);
  }
  const stack = [];
  while (iscons(p3)) {
    // for a general transformations,
    // we want to match any part of the tree so
    // we need to push the subtree as well
    // as recurse to its parts
    if (generalTransform) {
      stack.push(car(p3));
    }

    if (DEBUG) {
      console.log('recursive decomposition');
      console.log(`car(p3): ${car(p3)}`);
      console.log(`p2: ${p2}`);
    }
    stack.push(...decomp(generalTransform, car(p3), p2));
    p3 = cdr(p3);
  }
  return stack;
}

function decomp_sum(generalTransform: boolean, p1: U, p2: U): U[] {
  if (DEBUG) {
    console.log(' decomposing the sum ');
  }

  // decomp terms involving x
  let p3: U = cdr(p1);

  const stack = [];
  while (iscons(p3)) {
    if (Find(car(p3), p2) || generalTransform) {
      stack.push(...decomp(generalTransform, car(p3), p2));
    }
    p3 = cdr(p3);
  }

  // add together all constant terms
  p3 = cdr(p1) as Cons;
  const constantTerms = [...p3].filter((t) => !Find(t, p2));
  if (constantTerms.length) {
    p3 = add_all(constantTerms);
    pushTryNotToDuplicateLocal(stack, p3);
    stack.push(negate(p3)); // need both +a, -a for some integrals
  }
  return stack;
}

function decomp_product(generalTransform: boolean, p1: U, p2: U): U[] {
  if (DEBUG) {
    console.log(' decomposing the product ');
  }

  // decomp factors involving x
  let p3: U = cdr(p1);
  const stack = [];
  while (iscons(p3)) {
    if (Find(car(p3), p2) || generalTransform) {
      stack.push(...decomp(generalTransform, car(p3), p2));
    }
    p3 = cdr(p3);
  }

  // multiply together all constant factors
  p3 = cdr(p1);

  const constantFactors: U[] = [];
  while (iscons(p3)) {
    if (!Find(car(p3), p2)) {
      const item = car(p3);
      if (
        constantFactors.length < 1 ||
        !equal(item, constantFactors[constantFactors.length - 1])
      ) {
        constantFactors.push(item);
      }
    }
    p3 = cdr(p3);
  }

  if (constantFactors.length > 0) {
    stack.push(multiply_all(constantFactors));
  }
  return stack;
}
