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
import { pop, push, top } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add_all } from './add';
import { Eval } from './eval';
import { guess } from './guess';
import { list } from './list';
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
  const h = defs.tos;
  push(symbol(NIL));
  push(Eval(cadr(p1)));
  p1 = Eval(caddr(p1));

  const variable = p1 === symbol(NIL) ? guess(top()) : p1;
  push(variable);
  decomp(false);
  list(defs.tos - h);
}

function pushTryNotToDuplicate(toBePushed: U) {
  if (defs.tos > 0) {
    if (DEBUG) {
      console.log(`comparing ${toBePushed} to: ${top()}`);
    }
    if (equal(toBePushed, top())) {
      if (DEBUG) {
        console.log(`skipping ${toBePushed} because it's already on stack `);
      }
      return;
    }
  }
  push(toBePushed);
}

// returns constant expressions on the stack
export function decomp(generalTransform: boolean) {
  const p2 = pop();
  const p1 = pop();

  if (DEBUG) {
    console.log(`DECOMPOSING ${p1}`);
  }

  // is the entire expression constant?
  if (generalTransform) {
    if (!iscons(p1)) {
      if (DEBUG) {
        console.log(` ground thing: ${p1}`);
      }
      pushTryNotToDuplicate(p1);
      return;
    }
  } else {
    if (!Find(p1, p2)) {
      if (DEBUG) {
        console.log(' entire expression is constant');
      }
      pushTryNotToDuplicate(p1);
      return;
    }
  }

  // sum?
  if (isadd(p1)) {
    decomp_sum(generalTransform, p1, p2);
    return;
  }

  // product?
  if (ismultiply(p1)) {
    const result = decomp_product(generalTransform, p1, p2);
    if (result) {
      push(result);
    }
    return;
  }

  // naive decomp if not sum or product
  if (DEBUG) {
    console.log(' naive decomp');
  }
  let p3: U = cdr(p1);
  if (DEBUG) {
    console.log(`startig p3: ${p3}`);
  }
  while (iscons(p3)) {
    // for a general transformations,
    // we want to match any part of the tree so
    // we need to push the subtree as well
    // as recurse to its parts
    if (generalTransform) {
      push(car(p3));
    }

    if (DEBUG) {
      console.log('recursive decomposition');
    }
    push(car(p3));

    if (DEBUG) {
      console.log(`car(p3): ${car(p3)}`);
    }
    push(p2);
    if (DEBUG) {
      console.log(`p2: ${p2}`);
    }
    decomp(generalTransform);
    p3 = cdr(p3);
  }
}

function decomp_sum(generalTransform: boolean, p1: U, p2: U) {
  if (DEBUG) {
    console.log(' decomposing the sum ');
  }

  // decomp terms involving x
  let p3: U = cdr(p1);

  while (iscons(p3)) {
    if (Find(car(p3), p2) || generalTransform) {
      push(car(p3));
      push(p2);
      decomp(generalTransform);
    }
    p3 = cdr(p3);
  }

  // add together all constant terms
  const constantTerms = [];

  p3 = cdr(p1) as Cons;

  for (const t of p3) {
    if (!Find(t, p2)) {
      constantTerms.push(t);
    }
  }

  if (constantTerms.length) {
    p3 = add_all(constantTerms);
    pushTryNotToDuplicate(p3);
    push(negate(p3)); // need both +a, -a for some integrals
  }
}

function decomp_product(
  generalTransform: boolean,
  p1: U,
  p2: U
): U | undefined {
  if (DEBUG) {
    console.log(' decomposing the product ');
  }

  // decomp factors involving x

  let p3: U = cdr(p1);

  while (iscons(p3)) {
    if (Find(car(p3), p2) || generalTransform) {
      push(car(p3));
      push(p2);
      decomp(generalTransform);
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
    return multiply_all(constantFactors);
  }
  return undefined;
}
//p3 = pop();  # may need later for pushing both +a, -a
//push(p3)
//push(p3)
//negate()
