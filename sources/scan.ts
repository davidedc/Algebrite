import { alloc_tensor } from '../runtime/alloc';
import {
  ADD,
  Cons,
  Constants,
  DEBUG,
  defs,
  dotprod_unicode,
  EVAL,
  FACTORIAL,
  INDEX,
  INNER,
  isNumericAtom,
  isrational,
  METAA,
  METAB,
  METAX,
  MULTIPLY,
  NIL,
  NOT,
  parse_time_simplifications,
  PATTERN,
  POWER,
  predefinedSymbolsInGlobalScope_doNotTrackInDependencies,
  QUOTE,
  SETQ,
  TESTEQ,
  TESTGE,
  TESTGT,
  TESTLE,
  TESTLT,
  TRANSPOSE,
  transpose_unicode, U,
} from '../runtime/defs';
import {
  isalnumorunderscore,
  isalpha,
  isdigit,
  isspace,
} from '../runtime/otherCFunctions';
import { stop } from '../runtime/run';
import { moveTos, pop, push, swap, top } from '../runtime/stack';
import {push_symbol, symbol, usr_symbol} from '../runtime/symbol';
import { new_string } from '../sources/misc';
import { bignum_scan_float, bignum_scan_integer } from './bignum';
import { equaln } from './is';
import { list } from './list';
import { inverse, multiply, negate } from './multiply';
import { check_tensor_dimensions } from './tensor';

// This scanner uses the recursive descent method.
//
// The char pointers token_str and scan_str are pointers to the input string as
// in the following example.
//
//  | g | a | m | m | a |   | a | l | p | h | a |
//    ^                   ^
//    token_str           scan_str
//
// The char pointer token_buf points to a malloc buffer.
//
//  | g | a | m | m | a | \0 |
//    ^
//    token_buf
//
// In the sequence of method invocations for scanning,
// first we do the calls for scanning the operands
// of the operators of least precedence.
// So, since precedence in maths goes something like
// (form high to low) exponents, mult/div, plus/minus
// so we scan first for terms, then factors, then powers.
// That's the general idea, but of course we also have to deal
// with things like parens, non-commutative
// dot (or inner) product, assignments and tests,
// function calls etc.
// Note that a^1/2 is, correctly, a/2, not, incorrectly, sqrt(a),
// see comment in related test in power.coffee for more about this.

//  Notes:
//
//  Formerly add() and multiply() were used to construct expressions but
//  this preevaluation caused problems.
//
//  For example, suppose A has the floating point value inf.
//
//  Before, the expression A/A resulted in 1 because the scanner would
//  divide the symbols.
//
//  After removing add() and multiply(), A/A results in nan which is the
//  correct result.
//
//  The functions negate() and inverse() are used but they do not cause
//  problems with preevaluation of symbols.

const T_INTEGER = 1001;
const T_DOUBLE = 1002;
const T_SYMBOL = 1003;
const T_FUNCTION = 1004;
const T_NEWLINE = 1006;
const T_STRING = 1007;
const T_GTEQ = 1008;
const T_LTEQ = 1009;
const T_EQ = 1010;
const T_NEQ = 1011;
const T_QUOTASSIGN = 1012;

let token: number | string = '';
let newline_flag = 0;
let meta_mode = 0;

let input_str = 0;
let scan_str = 0;
let token_str = 0;
let token_buf: string = '';

let lastFoundSymbol: string = null;
let symbolsRightOfAssignment: string[] = null;
let symbolsLeftOfAssignment: string[] = null;
let isSymbolLeftOfAssignment: boolean = null;
let scanningParameters: boolean[] = null;
let functionInvokationsScanningStack: string[] = null;
let skipRootVariableToBeSolved = false;
let assignmentFound: boolean = null;

// Returns number of chars scanned and expr on stack.
// Returns zero when nothing left to scan.
let scanned = '';
export function scan(s: string) {
  if (DEBUG) {
    console.log(`#### scanning ${s}`);
  }
  //if s=="y=x"
  //  breakpoint
  //if s=="y"
  //  breakpoint
  //if s=="i=sqrt(-1)"
  //  breakpoint

  lastFoundSymbol = null;
  symbolsRightOfAssignment = [];
  symbolsLeftOfAssignment = [];
  isSymbolLeftOfAssignment = true;
  scanningParameters = [];
  functionInvokationsScanningStack = [''];
  assignmentFound = false;

  scanned = s;
  meta_mode = 0;
  const prev_expanding = defs.expanding;
  defs.expanding = true;
  input_str = 0;
  scan_str = 0;
  get_next_token();
  if (token === '') {
    push(symbol(NIL));
    defs.expanding = prev_expanding;
    return 0;
  }
  scan_stmt();
  defs.expanding = prev_expanding;

  if (!assignmentFound) {
    defs.symbolsInExpressionsWithoutAssignments = defs.symbolsInExpressionsWithoutAssignments.concat(
      symbolsLeftOfAssignment
    );
  }

  return token_str - input_str;
}

export function scan_meta(s: string) {
  scanned = s;
  meta_mode = 1;
  const prev_expanding = defs.expanding;
  defs.expanding = true;
  input_str = 0;
  scan_str = 0;
  get_next_token();
  if (token === '') {
    push(symbol(NIL));
    defs.expanding = prev_expanding;
    return;
  }
  scan_stmt();
  defs.expanding = prev_expanding;
  token_str - input_str;
}

function scan_stmt() {
  scan_relation();

  let assignmentIsOfQuotedType = false;

  if (token === T_QUOTASSIGN) {
    assignmentIsOfQuotedType = true;
  }

  if (token === T_QUOTASSIGN || token === '=') {
    const symbolLeftOfAssignment = lastFoundSymbol;
    if (DEBUG) {
      console.log('assignment!');
    }
    assignmentFound = true;
    isSymbolLeftOfAssignment = false;

    get_next_token();
    push_symbol(SETQ);
    swap();

    // if it's a := then add a quote
    if (assignmentIsOfQuotedType) {
      push_symbol(QUOTE);
    }

    scan_relation();

    // if it's a := then you have to list
    // together the quote and its argument
    if (assignmentIsOfQuotedType) {
      list(2);
    }

    list(3);

    isSymbolLeftOfAssignment = true;

    if (defs.codeGen) {
      // in case of re-assignment, the symbol on the
      // left will also be in the set of the symbols
      // on the right. In that case just remove it from
      // the symbols on the right.
      const indexOfSymbolLeftOfAssignment = symbolsRightOfAssignment.indexOf(
        symbolLeftOfAssignment
      );
      if (indexOfSymbolLeftOfAssignment !== -1) {
        symbolsRightOfAssignment.splice(indexOfSymbolLeftOfAssignment, 1);
        defs.symbolsHavingReassignments.push(symbolLeftOfAssignment);
      }

      // print out the immediate dependencies
      if (DEBUG) {
        console.log(`locally, ${symbolLeftOfAssignment} depends on: `);
        for (const i of Array.from(symbolsRightOfAssignment)) {
          console.log(`  ${i}`);
        }
      }

      // ok add the local dependencies to the existing
      // dependencies of this left-value symbol

      // create the exiting dependencies list if it doesn't exist
      if (defs.symbolsDependencies[symbolLeftOfAssignment] == null) {
        defs.symbolsDependencies[symbolLeftOfAssignment] = [];
      }
      const existingDependencies =
        defs.symbolsDependencies[symbolLeftOfAssignment];

      // copy over the new dependencies to the existing
      // dependencies avoiding repetitions
      for (const i of Array.from(symbolsRightOfAssignment)) {
        if (existingDependencies.indexOf(i) === -1) {
          existingDependencies.push(i);
        }
      }

      symbolsRightOfAssignment = [];
    }
  }
}

function scan_relation() {
  scan_expression();
  switch (token) {
    case T_EQ:
      push_symbol(TESTEQ);
      swap();
      get_next_token();
      scan_expression();
      return list(3);
    case T_NEQ:
      push_symbol(NOT);
      swap();
      push_symbol(TESTEQ);
      swap();
      get_next_token();
      scan_expression();
      list(3);
      return list(2);
    case T_LTEQ:
      push_symbol(TESTLE);
      swap();
      get_next_token();
      scan_expression();
      return list(3);
    case T_GTEQ:
      push_symbol(TESTGE);
      swap();
      get_next_token();
      scan_expression();
      return list(3);
    case '<':
      push_symbol(TESTLT);
      swap();
      get_next_token();
      scan_expression();
      return list(3);
    case '>':
      push_symbol(TESTGT);
      swap();
      get_next_token();
      scan_expression();
      return list(3);
  }
}

function scan_expression() {
  const h = defs.tos;
  switch (token) {
    case '+':
      get_next_token();
      scan_term();
      break;
    case '-':
      get_next_token();
      scan_term();
      push(negate(pop()));
      break;
    default:
      scan_term();
  }

  while (newline_flag === 0 && (token === '+' || token === '-')) {
    if (token === '+') {
      get_next_token();
      scan_term();
    } else {
      get_next_token();
      scan_term();
      push(negate(pop()));
    }
  }

  if (defs.tos - h > 1) {
    list(defs.tos - h);
    push(new Cons(symbol(ADD), pop()));
  }
}

function tokenCharCode() {
  if (typeof token == 'string') {
    return token.charCodeAt(0);
  }
  return undefined;
}

function is_factor(): boolean {
  if (tokenCharCode() === dotprod_unicode) {
    return true;
  }

  switch (token) {
    case '*':
    case '/':
      return true;
    case '(':
    case T_SYMBOL:
    case T_FUNCTION:
    case T_INTEGER:
    case T_DOUBLE:
    case T_STRING:
      if (newline_flag) {
        // implicit mul can't cross line
        scan_str = token_str; // better error display
        return false;
      } else {
        return true;
      }
  }
  return false;
}

function simplify_1_in_products(tos: number, h: number) {
  if (
    tos > h &&
    isrational(defs.stack[tos - 1]) &&
    equaln(defs.stack[tos - 1], 1)
  ) {
    pop();
  }
}

// calculate away consecutive constants
function multiply_consecutive_constants(tos: number, h: number) {
  if (
    tos > h + 1 &&
    isNumericAtom(defs.stack[tos - 2]) &&
    isNumericAtom(defs.stack[tos - 1])
  ) {
    const arg2 = pop();
    const arg1 = pop();
    push(multiply(arg1, arg2));
  }
}

function scan_term() {
  const h = defs.tos;

  scan_factor();

  if (parse_time_simplifications) {
    simplify_1_in_products(defs.tos, h);
  }

  while (is_factor()) {
    if (token === '*') {
      get_next_token();
      scan_factor();
    } else if (token === '/') {
      // in case of 1/... then
      // we scanned the 1, we get rid
      // of it because otherwise it becomes
      // an extra factor that wasn't there and
      // things like
      // 1/(2*a) become 1*(1/(2*a))
      simplify_1_in_products(defs.tos, h);
      get_next_token();
      scan_factor();
      push(inverse(pop()));
    } else if (tokenCharCode() === dotprod_unicode) {
      get_next_token();
      push_symbol(INNER);
      swap();
      scan_factor();
      list(3);
    } else {
      scan_factor();
    }

    if (parse_time_simplifications) {
      multiply_consecutive_constants(defs.tos, h);
      simplify_1_in_products(defs.tos, h);
    }
  }

  if (h === defs.tos) {
    push(Constants.one);
  } else if (defs.tos - h > 1) {
    list(defs.tos - h);
    push(new Cons(symbol(MULTIPLY), pop()));
  }
}

function scan_power() {
  if (token === '^') {
    get_next_token();
    push_symbol(POWER);
    swap();
    scan_factor();
    list(3);
  }
}

function scan_index(h: number) {
  //console.log "[ as index"
  get_next_token();
  push_symbol(INDEX);
  swap();
  scan_expression();
  while (token === ',') {
    get_next_token();
    scan_expression();
  }
  if (token !== ']') {
    scan_error('] expected');
  }
  get_next_token();
  list(defs.tos - h);
}

function scan_factor() {
  const h = defs.tos;

  //console.log "scan_factor token: " + token

  let firstFactorIsNumber = false;

  if (token === '(') {
    scan_subexpr();
  } else if (token === T_SYMBOL) {
    scan_symbol();
  } else if (token === T_FUNCTION) {
    scan_function_call_with_function_name();
  } else if (token === '[') {
    //console.log "[ as tensor"
    //breakpoint
    scan_tensor();
  } else if (token === T_INTEGER) {
    firstFactorIsNumber = true;
    bignum_scan_integer(token_buf);
    get_next_token();
  } else if (token === T_DOUBLE) {
    firstFactorIsNumber = true;
    bignum_scan_float(token_buf);
    get_next_token();
  } else if (token === T_STRING) {
    scan_string();
  } else {
    scan_error('syntax error');
  }

  // after the main initial part of the factor that
  // we just scanned above,
  // we can get an arbitrary about of appendages
  // of the form ...[...](...)...
  // If the main part is not a number, then these are all, respectively,
  //  - index references (as opposed to tensor definition) and
  //  - function calls without an explicit function name
  //    (instead of subexpressions or parameters of function
  //    definitions or function calls with an explicit function
  //    name), respectively
  while (
    token === '[' ||
    (token === '(' && newline_flag === 0 && !firstFactorIsNumber)
  ) {
    if (token === '[') {
      scan_index(h);
    } else if (token === '(') {
      //console.log "( as function call without function name "
      scan_function_call_without_function_name();
    }
  }

  while (token === '!') {
    get_next_token();
    push_symbol(FACTORIAL);
    swap();
    list(2);
  }

  // in theory we could already count the
  // number of transposes and simplify them
  // away, but it's not that clean to have
  // multiple places where that happens, and
  // the parser is not the place.
  while (tokenCharCode() === transpose_unicode) {
    get_next_token();
    push_symbol(TRANSPOSE);
    swap();
    list(2);
  }

  scan_power();
}

function addSymbolRightOfAssignment(theSymbol: string) {
  if (
    predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(
      theSymbol
    ) === -1 &&
    symbolsRightOfAssignment.indexOf(theSymbol) === -1 &&
    symbolsRightOfAssignment.indexOf("'" + theSymbol) === -1 &&
    !skipRootVariableToBeSolved
  ) {
    if (DEBUG) {
      console.log(
        `... adding symbol: ${theSymbol} to the set of the symbols right of assignment`
      );
    }
    let prefixVar = '';
    for (let i = 1; i < functionInvokationsScanningStack.length; i++) {
      if (functionInvokationsScanningStack[i] !== '') {
        prefixVar += functionInvokationsScanningStack[i] + '_' + i + '_';
      }
    }

    theSymbol = prefixVar + theSymbol;
    symbolsRightOfAssignment.push(theSymbol);
  }
}

function addSymbolLeftOfAssignment(theSymbol: string) {
  if (
    predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(
      theSymbol
    ) === -1 &&
    symbolsLeftOfAssignment.indexOf(theSymbol) === -1 &&
    symbolsLeftOfAssignment.indexOf("'" + theSymbol) === -1 &&
    !skipRootVariableToBeSolved
  ) {
    if (DEBUG) {
      console.log(
        `... adding symbol: ${theSymbol} to the set of the symbols left of assignment`
      );
    }
    let prefixVar = '';
    for (let i = 1; i < functionInvokationsScanningStack.length; i++) {
      if (functionInvokationsScanningStack[i] !== '') {
        prefixVar += functionInvokationsScanningStack[i] + '_' + i + '_';
      }
    }

    theSymbol = prefixVar + theSymbol;
    symbolsLeftOfAssignment.push(theSymbol);
  }
}

function scan_symbol() {
  if (token !== T_SYMBOL) {
    scan_error('symbol expected');
  }
  if (meta_mode && typeof token_buf == 'string' && token_buf.length === 1) {
    switch (token_buf[0]) {
      case 'a':
        push(symbol(METAA));
        break;
      case 'b':
        push(symbol(METAB));
        break;
      case 'x':
        push(symbol(METAX));
        break;
      default:
        push(usr_symbol(token_buf));
    }
  } else {
    push(usr_symbol(token_buf));
  }
  //console.log "found symbol: " + token_buf
  if (scanningParameters.length === 0) {
    if (DEBUG) {
      console.log(`out of scanning parameters, processing ${token_buf}`);
    }
    lastFoundSymbol = token_buf;
    if (isSymbolLeftOfAssignment) {
      addSymbolLeftOfAssignment(token_buf);
    }
  } else {
    if (DEBUG) {
      console.log(`still scanning parameters, skipping ${token_buf}`);
    }
    if (isSymbolLeftOfAssignment) {
      addSymbolRightOfAssignment("'" + token_buf);
    }
  }

  if (DEBUG) {
    console.log(
      `found symbol: ${token_buf} left of assignment: ${isSymbolLeftOfAssignment}`
    );
  }

  // if we were looking at the right part of an assignment while we
  // found the symbol, then add it to the "symbolsRightOfAssignment"
  // set (we check for duplications)
  if (!isSymbolLeftOfAssignment) {
    addSymbolRightOfAssignment(token_buf);
  }
  get_next_token();
}

function scan_string() {
  new_string(token_buf);
  get_next_token();
}

function scan_function_call_with_function_name() {
  if (DEBUG) {
    console.log('-- scan_function_call_with_function_name start');
  }
  let n = 1; // the parameter number as we scan parameters
  const p = usr_symbol(token_buf);

  push(p);
  const functionName = token_buf;
  if (
    functionName === 'roots' ||
    functionName === 'defint' ||
    functionName === 'sum' ||
    functionName === 'product' ||
    functionName === 'for'
  ) {
    functionInvokationsScanningStack.push(token_buf);
  }
  lastFoundSymbol = token_buf;
  if (!isSymbolLeftOfAssignment) {
    addSymbolRightOfAssignment(token_buf);
  }

  get_next_token(); // open parens
  get_next_token(); // 1st parameter
  scanningParameters.push(true);
  if (token !== ')') {
    scan_stmt();
    n++;
    while (token === ',') {
      get_next_token();
      // roots' disappearing variable, if there, is the second one
      if (
        n === 2 &&
        functionInvokationsScanningStack[
          functionInvokationsScanningStack.length - 1
        ].indexOf('roots') !== -1
      ) {
        symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
          (x) =>
            !new RegExp(
              'roots_' +
                (functionInvokationsScanningStack.length - 1) +
                '_' +
                token_buf
            ).test(x)
        );
        skipRootVariableToBeSolved = true;
      }
      // sums' disappearing variable, is alsways the second one
      if (
        n === 2 &&
        functionInvokationsScanningStack[
          functionInvokationsScanningStack.length - 1
        ].indexOf('sum') !== -1
      ) {
        symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
          (x) =>
            !new RegExp(
              'sum_' +
                (functionInvokationsScanningStack.length - 1) +
                '_' +
                token_buf
            ).test(x)
        );
        skipRootVariableToBeSolved = true;
      }
      // product's disappearing variable, is alsways the second one
      if (
        n === 2 &&
        functionInvokationsScanningStack[
          functionInvokationsScanningStack.length - 1
        ].indexOf('product') !== -1
      ) {
        symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
          (x) =>
            !new RegExp(
              'product_' +
                (functionInvokationsScanningStack.length - 1) +
                '_' +
                token_buf
            ).test(x)
        );
        skipRootVariableToBeSolved = true;
      }
      // for's disappearing variable, is alsways the second one
      if (
        n === 2 &&
        functionInvokationsScanningStack[
          functionInvokationsScanningStack.length - 1
        ].indexOf('for') !== -1
      ) {
        symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
          (x) =>
            !new RegExp(
              'for_' +
                (functionInvokationsScanningStack.length - 1) +
                '_' +
                token_buf
            ).test(x)
        );
        skipRootVariableToBeSolved = true;
      }
      // defint's disappearing variables can be in positions 2,5,8...
      if (
        functionInvokationsScanningStack[
          functionInvokationsScanningStack.length - 1
        ].indexOf('defint') !== -1 &&
        (n === 2 || (n > 2 && (n - 2) % 3 === 0))
      ) {
        symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
          (x) =>
            !new RegExp(
              'defint_' +
                (functionInvokationsScanningStack.length - 1) +
                '_' +
                token_buf
            ).test(x)
        );
        skipRootVariableToBeSolved = true;
      }

      scan_stmt();
      skipRootVariableToBeSolved = false;
      n++;
    }

    // todo refactor this, there are two copies
    // this catches the case where the "roots" variable is not specified
    if (
      n === 2 &&
      functionInvokationsScanningStack[
        functionInvokationsScanningStack.length - 1
      ].indexOf('roots') !== -1
    ) {
      symbolsRightOfAssignment = symbolsRightOfAssignment.filter(
        (x) =>
          !new RegExp(
            'roots_' + (functionInvokationsScanningStack.length - 1) + '_' + 'x'
          ).test(x)
      );
    }
  }

  scanningParameters.pop();

  for (let i = 0; i <= symbolsRightOfAssignment.length; i++) {
    if (symbolsRightOfAssignment[i] != null) {
      if (functionName === 'roots') {
        symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(
          new RegExp(
            'roots_' + (functionInvokationsScanningStack.length - 1) + '_'
          ),
          ''
        );
      }
      if (functionName === 'defint') {
        symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(
          new RegExp(
            'defint_' + (functionInvokationsScanningStack.length - 1) + '_'
          ),
          ''
        );
      }
      if (functionName === 'sum') {
        symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(
          new RegExp(
            'sum_' + (functionInvokationsScanningStack.length - 1) + '_'
          ),
          ''
        );
      }
      if (functionName === 'product') {
        symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(
          new RegExp(
            'product_' + (functionInvokationsScanningStack.length - 1) + '_'
          ),
          ''
        );
      }
      if (functionName === 'for') {
        symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(
          new RegExp(
            'for_' + (functionInvokationsScanningStack.length - 1) + '_'
          ),
          ''
        );
      }
    }
  }

  if (token !== ')') {
    scan_error(') expected');
  }

  get_next_token();
  list(n);
  if (
    functionName === 'roots' ||
    functionName === 'defint' ||
    functionName === 'sum' ||
    functionName === 'product' ||
    functionName === 'for'
  ) {
    functionInvokationsScanningStack.pop();
  }
  if (functionName === symbol(PATTERN).printname) {
    defs.patternHasBeenFound = true;
  }

  if (DEBUG) {
    console.log('-- scan_function_call_with_function_name end');
  }
}

function scan_function_call_without_function_name() {
  if (DEBUG) {
    console.log('-- scan_function_call_without_function_name start');
  }

  // the function will have to be looked up
  // at runtime (i.e. we need to evaulate something to find it
  // e.g. it might be inside a tensor, so we'd need to evaluate
  // a tensor element access in that case)
  push_symbol(EVAL);
  swap();
  list(2);

  let n = 1; // the parameter number as we scan parameters
  get_next_token(); // left paren
  scanningParameters.push(true);
  if (token !== ')') {
    scan_stmt();
    n++;
    while (token === ',') {
      get_next_token();
      scan_stmt();
      n++;
    }
  }

  scanningParameters.pop();

  if (token !== ')') {
    scan_error(') expected');
  }

  get_next_token();
  list(n);

  if (DEBUG) {
    console.log(`-- scan_function_call_without_function_name end: ${top()}`);
  }
}

// scan subexpression
function scan_subexpr() {
  const n = 0;
  if (token !== '(') {
    scan_error('( expected');
  }
  get_next_token();
  scan_stmt();
  if (token !== ')') {
    scan_error(') expected');
  }
  get_next_token();
}

function scan_tensor() {
  if (token !== '[') {
    scan_error('[ expected');
  }

  get_next_token();

  //console.log "scanning the next statement"
  scan_stmt();
  const elements = [pop()];

  while (token === ',') {
    get_next_token();
    scan_stmt();
    elements.push(pop());
  }

  //console.log "building tensor with elements number: " + n
  push(build_tensor(elements));

  if (token !== ']') {
    scan_error('] expected');
  }
  get_next_token();
}

function scan_error(errmsg: string) {
  defs.errorMessage = '';

  // try not to put question mark on orphan line
  while (input_str !== scan_str) {
    if (
      (scanned[input_str] === '\n' || scanned[input_str] === '\r') &&
      input_str + 1 === scan_str
    ) {
      break;
    }
    defs.errorMessage += scanned[input_str++];
  }

  defs.errorMessage += ' ? ';

  while (
    scanned[input_str] &&
    scanned[input_str] !== '\n' &&
    scanned[input_str] !== '\r'
  ) {
    defs.errorMessage += scanned[input_str++];
  }

  defs.errorMessage += '\n';

  stop(errmsg);
}

// There are n expressions on the stack, possibly tensors.
//
// This function assembles the stack expressions into a single tensor.
//
// For example, at the top level of the expression ((a,b),(c,d)), the vectors
// (a,b) and (c,d) would be on the stack.

// takes an integer
function build_tensor(elements:U[]) {
  const p2 = alloc_tensor(elements.length);
  p2.tensor.ndim = 1;
  p2.tensor.dim[0] = elements.length;
  for (let i = 0; i < elements.length; i++) {
    p2.tensor.elem[i] = elements[i];
  }

  check_tensor_dimensions(p2);
  return p2;
}

function get_next_token() {
  newline_flag = 0;
  while (true) {
    get_token();
    if (token !== T_NEWLINE) {
      break;
    }
    newline_flag = 1;
  }
  if (DEBUG) {
    console.log(`get_next_token token: ${token}`);
  }
}
//if token == ')'
//  breakpoint

function get_token() {
  // skip spaces
  while (isspace(scanned[scan_str])) {
    if (scanned[scan_str] === '\n' || scanned[scan_str] === '\r') {
      token = T_NEWLINE;
      scan_str++;
      return;
    }
    scan_str++;
  }

  token_str = scan_str;

  // end of string?
  if (scan_str === scanned.length) {
    token = '';
    return;
  }

  // number?
  if (isdigit(scanned[scan_str]) || scanned[scan_str] === '.') {
    while (isdigit(scanned[scan_str])) {
      scan_str++;
    }
    if (scanned[scan_str] === '.') {
      scan_str++;
      while (isdigit(scanned[scan_str])) {
        scan_str++;
      }
      if (
        scanned[scan_str] === 'e' &&
        (scanned[scan_str + 1] === '+' ||
          scanned[scan_str + 1] === '-' ||
          isdigit(scanned[scan_str + 1]))
      ) {
        scan_str += 2;
        while (isdigit(scanned[scan_str])) {
          scan_str++;
        }
      }
      token = T_DOUBLE;
    } else {
      token = T_INTEGER;
    }
    update_token_buf(token_str, scan_str);
    return;
  }

  // symbol?
  if (isalpha(scanned[scan_str])) {
    while (isalnumorunderscore(scanned[scan_str])) {
      scan_str++;
    }
    if (scanned[scan_str] === '(') {
      token = T_FUNCTION;
    } else {
      token = T_SYMBOL;
    }
    update_token_buf(token_str, scan_str);
    return;
  }

  // string ?
  if (scanned[scan_str] === '"') {
    scan_str++;
    while (scanned[scan_str] !== '"') {
      //if (scan_str == scanned.length || scanned[scan_str] == '\n' || scanned[scan_str] == '\r')
      if (scan_str === scanned.length - 1) {
        scan_str++;
        scan_error('runaway string');
        scan_str--;
      }
      scan_str++;
    }
    scan_str++;
    token = T_STRING;
    update_token_buf(token_str + 1, scan_str - 1);
    return;
  }

  // comment?
  if (
    scanned[scan_str] === '#' ||
    (scanned[scan_str] === '-' && scanned[scan_str + 1] === '-')
  ) {
    while (
      scanned[scan_str] &&
      scanned[scan_str] !== '\n' &&
      scanned[scan_str] !== '\r'
    ) {
      scan_str++;
    }
    if (scanned[scan_str]) {
      scan_str++;
    }
    token = T_NEWLINE;
    return;
  }

  // quote-assignment
  if (scanned[scan_str] === ':' && scanned[scan_str + 1] === '=') {
    scan_str += 2;
    token = T_QUOTASSIGN;
    return;
  }

  // relational operator?
  if (scanned[scan_str] === '=' && scanned[scan_str + 1] === '=') {
    scan_str += 2;
    token = T_EQ;
    return;
  }

  // != operator. It's a little odd because
  // "!" is not a "not", which would make things consistent.
  // (it's used for factorial).
  // An alternative would be to use "<>" but it's not used
  // a lot in other languages...
  if (scanned[scan_str] === '!' && scanned[scan_str + 1] === '=') {
    scan_str += 2;
    token = T_NEQ;
    return;
  }

  if (scanned[scan_str] === '<' && scanned[scan_str + 1] === '=') {
    scan_str += 2;
    token = T_LTEQ;
    return;
  }

  if (scanned[scan_str] === '>' && scanned[scan_str + 1] === '=') {
    scan_str += 2;
    token = T_GTEQ;
    return;
  }

  // single char token
  token = scanned[scan_str++];
}

// both strings
function update_token_buf(a: number, b: number) {
  token_buf = scanned.substring(a, b);
}
