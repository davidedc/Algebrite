import {
  breakpoint,
  caddr,
  cadr,
  car,
  cdddr,
  cddr,
  cdr,
  Constants,
  DEBUG,
  defs,
  iscons,
  isNumericAtom,
  METAA,
  METAB,
  METAX,
  NIL,
  symbol,
  SYMBOL_A_UNDERSCORE,
  SYMBOL_B_UNDERSCORE,
  SYMBOL_X_UNDERSCORE,
  U,
} from '../runtime/defs';
import { moveTos, pop, push, top } from '../runtime/stack';
import { get_binding, push_symbol, set_binding } from '../runtime/symbol';
import { subtract } from './add';
import { polyform } from './bake';
import { decomp } from './decomp';
import { Eval, Eval_noexpand } from './eval';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { scan_meta } from './scan';
import { subst } from './subst';

/*
Transform an expression using a pattern. The
pattern can come from the integrals table or
the user-defined patterns.

The expression and free variable are on the stack.

The argument s is a null terminated list of transform rules.

For example, see the itab (integrals table)

Internally, the following symbols are used:

  F  input expression

  X  free variable, i.e. F of X

  A  template expression

  B  result expression

  C  list of conditional expressions

Puts the final expression on top of stack
(whether it's transformed or not) and returns
true is successful, false if not.

*/

// p1 and p2 are tmps

//define F p3
//define X p4
//define A p5
//define B p6
//define C p7

export function transform(s: string[] | U, generalTransform: boolean) {
  let X = pop(); // X i.e. free variable
  let F = pop(); // F i.e. input expression

  if (DEBUG) {
    console.log(`         !!!!!!!!!   transform on: ${F}`);
  }

  saveMetaBindings();

  set_binding(symbol(METAX), X);

  // put constants in F(X) on the stack
  const transform_h = defs.tos;
  push(Constants.one);
  push(polyform(F, X)); // collect coefficients of x, x^2, etc.
  push(X);

  const bookmarkTosToPrintDecomps = defs.tos - 2;
  decomp(generalTransform);
  const numberOfDecomps = defs.tos - bookmarkTosToPrintDecomps;

  if (DEBUG) {
    console.log(`  ${numberOfDecomps} decomposed elements ====== `);
    for (let i = 0; i < numberOfDecomps; i++) {
      console.log(
        `  decomposition element ${i}: ${defs.stack[defs.tos - 1 - i]}`
      );
    }
  }

  let transformationSuccessful = false;
  let B: U;
  if (generalTransform) {
    // "general tranform" mode is supposed to be more generic than
    // "integrals" mode.
    // In general transform mode we get only one transformation
    // in s

    // simple numbers can end up matching complicated templates,
    // which we don't want.
    // for example "1" ends up matching "inner(transpose(a_),a_)"
    // since "1" is decomposed to "1" and replacing "a_" with "1"
    // there is a match.
    // Although this match is OK at some fundamental level, we want to
    // avoid it because that's not what the spirit of this match
    // is: "1" does not have any structural resemblance with
    // "inner(transpose(a_),a_)". There are probably better ways
    // to so this, for example we might notice that "inner" is an
    // anchor since it "sits above" any meta variables, so we
    // might want to mandate it to be matched at the top
    // of the tree. For the time
    // being let's just skip matching on simple numbers.
    if (!isNumericAtom(F)) {
      const theTransform = s as U;
      if (DEBUG) {
        console.log(`applying transform: ${theTransform}`);
        console.log(`scanning table entry ${theTransform}`);
      }

      // replacements of meta variables. Note that we don't
      // use scan_meta because the pattern is not a string
      // that we have to parse, it's a tree already.
      // replace a_ with METAA in the passed transformation
      let expr = subst(
        theTransform,
        symbol(SYMBOL_A_UNDERSCORE),
        symbol(METAA)
      );

      // replace b_ with METAB in the passed transformation
      expr = subst(expr, symbol(SYMBOL_B_UNDERSCORE), symbol(METAB));

      // replace x_ with METAX in the passed transformation
      const p1 = subst(expr, symbol(SYMBOL_X_UNDERSCORE), symbol(METAX));

      const A = car(p1);
      if (DEBUG) {
        console.log(`template expression: ${A}`);
      }
      B = cadr(p1);
      const C = cddr(p1);

      /*
      A = p1.tensor.elem[0]
      B = p1.tensor.elem[1]
      for i in [2..(p1.tensor.elem.length-1)]
        push p1.tensor.elem[i]
      list(p1.tensor.elem.length - 2)
      C = pop()
      */

      if (f_equals_a(transform_h, generalTransform, F, A, C)) {
        // successful transformation,
        // transformed result is in p6
        transformationSuccessful = true;
      } else {
        // the match failed but perhaps we can match
        // something lower down in the tree, so
        // let's recurse the tree

        if (DEBUG) {
          console.log(`p3 at this point: ${F}`);
          console.log(`car(p3): ${car(F)}`);
        }
        const transformedTerms: U[] = [];

        let restTerm: U = F;

        if (iscons(restTerm)) {
          transformedTerms.push(car(F));
          restTerm = cdr(F);
        }

        while (iscons(restTerm)) {
          const secondTerm = car(restTerm);
          restTerm = cdr(restTerm);

          if (DEBUG) {
            console.log('tos before recursive transform: ' + defs.tos);
          }

          push(secondTerm);
          push_symbol(NIL);
          if (DEBUG) {
            console.log(`testing: ${secondTerm}`);
          }
          //if (secondTerm+"") == "eig(A x,transpose(A x))()"
          //  breakpoint
          if (DEBUG) {
            console.log(`about to try to simplify other term: ${secondTerm}`);
          }
          const success = transform(s, generalTransform);
          transformationSuccessful = transformationSuccessful || success;

          transformedTerms.push(pop());

          if (DEBUG) {
            console.log(
              `tried to simplify other term: ${secondTerm} ...successful?: ${success} ...transformed: ${
                transformedTerms[transformedTerms.length - 1]
              }`
            );
          }
        }

        // recreate the tree we were passed,
        // but with all the terms being transformed
        if (transformedTerms.length !== 0) {
          B = makeList(...transformedTerms);
        }
      }
    }
  } else {
    // "integrals" mode
    for (let eachTransformEntry of Array.from(s as string[])) {
      if (DEBUG) {
        console.log(`scanning table entry ${eachTransformEntry}`);
        if (
          (eachTransformEntry + '').indexOf(
            'f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))'
          ) !== -1
        ) {
          breakpoint;
        }
      }
      if (eachTransformEntry) {
        scan_meta(eachTransformEntry as string);
        const temp = pop();

        const p5 = cadr(temp);
        B = caddr(temp);
        const p7 = cdddr(temp);

        /*
        p5 = p1.tensor.elem[0]
        p6 = p1.tensor.elem[1]
        for i in [2..(p1.tensor.elem.length-1)]
          push p1.tensor.elem[i]
        list(p1.tensor.elem.length - 2)
        p7 = pop()
        */

        if (f_equals_a(transform_h, generalTransform, F, p5, p7)) {
          // there is a successful transformation,
          // transformed result is in p6
          transformationSuccessful = true;
          break;
        }
      }
    }
  }

  moveTos(transform_h);

  let temp: U;
  if (transformationSuccessful) {
    //console.log "transformation successful"
    // a transformation was successful
    push(B);
    Eval();
    temp = pop();
    //console.log "...into: " + p1
    transformationSuccessful = true;
  } else {
    // transformations failed
    if (generalTransform) {
      // result = original expression
      temp = F;
    } else {
      temp = symbol(NIL);
    }
  }

  restoreMetaBindings();

  push(temp);

  return transformationSuccessful;
}

function saveMetaBindings() {
  push(get_binding(symbol(METAA)));
  push(get_binding(symbol(METAB)));
  push(get_binding(symbol(METAX)));
}

function restoreMetaBindings() {
  set_binding(symbol(METAX), pop());
  set_binding(symbol(METAB), pop());
  set_binding(symbol(METAA), pop());
}

// search for a METAA and METAB such that F = A
function f_equals_a(
  h: number,
  generalTransform: boolean,
  F: U,
  A: U,
  C: U
): boolean {
  for (let fea_i = h; fea_i < defs.tos; fea_i++) {
    set_binding(symbol(METAA), defs.stack[fea_i]);
    if (DEBUG) {
      console.log(`  binding METAA to ${get_binding(symbol(METAA))}`);
    }
    for (let fea_j = h; fea_j < defs.tos; fea_j++) {
      set_binding(symbol(METAB), defs.stack[fea_j]);
      if (DEBUG) {
        console.log(`  binding METAB to ${get_binding(symbol(METAB))}`);
      }

      // now test all the conditions (it's an and between them)
      let temp = C;
      while (iscons(temp)) {
        push(car(temp));
        Eval();
        const p2 = pop();
        if (isZeroAtomOrTensor(p2)) {
          break;
        }
        temp = cdr(temp);
      }

      if (iscons(temp)) {
        // conditions are not met,
        // skip to the next binding of metas
        continue;
      }
      push(F); // F = A?
      if (DEBUG) {
        console.log(
          `about to evaluate template expression: ${A} binding METAA to ${get_binding(
            symbol(METAA)
          )} and binding METAB to ${get_binding(
            symbol(METAB)
          )} and binding METAX to ${get_binding(symbol(METAX))}`
        );
      }
      push(A);
      if (generalTransform) {
        Eval_noexpand();
      } else {
        Eval();
      }
      if (DEBUG) {
        console.log(`  comparing ${top()} to: ${defs.stack[defs.tos - 2]}`);
      }
      const arg2 = pop();
      const arg1 = pop();
      temp = subtract(arg1, arg2);
      if (isZeroAtomOrTensor(temp)) {
        if (DEBUG) {
          console.log(`binding METAA to ${get_binding(symbol(METAA))}`);
          console.log(`binding METAB to ${get_binding(symbol(METAB))}`);
          console.log(`binding METAX to ${get_binding(symbol(METAX))}`);
          console.log(`comparing ${F} to: ${A}`);
        }
        return true; // yes
      }
    }
  }
  return false; // no
}
