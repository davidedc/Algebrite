import {
  ADD,
  breakpoint,
  caar,
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  DERIVATIVE,
  DOUBLE,
  Double,
  E,
  FACTORIAL,
  INDEX,
  isadd,
  iscons,
  isdouble,
  isfactorial,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  isstr,
  issymbol,
  istensor,
  MULTIPLY,
  NUM,
  POWER,
  SETQ,
  Sign,
  Str,
  Sym,
  Tensor,
  U,
} from '../runtime/defs';
import { doubleToReasonableString } from '../runtime/otherCFunctions';
import {get_printname, symbol} from '../runtime/symbol';
import { absval } from './abs';
import { mp_denominator, mp_numerator } from './bignum';
import { isfraction, isminusone, isnegativenumber, isplusone } from './is';
import { printline } from './print';

/*

Prints in "2d", e.g. instead of 1/(x+1)^2 :

      1
 ----------
         2
  (1 + x)

 Note that although this looks more natural, a) it's not parsable and
 b) it can be occasionally be ambiguous, such as:

   1
 ----
   2
 x

is 1/x^2 but it also looks a little like x^(1/2)

*/

//-----------------------------------------------------------------------------
//
//  Examples:
//
//     012345678
//  -2 .........
//  -1 .........
//   0 ..hello..  x=2, y=0, h=1, w=5
//   1 .........
//   2 .........
//
//     012345678
//  -2 .........
//  -1 ..355....
//   0 ..---....  x=2, y=-1, h=3, w=3
//   1 ..113....
//   2 .........
//
//-----------------------------------------------------------------------------

const YMAX = 10000;
class glyph {
  public c = 0;
  public x = 0;
  public y = 0;
}

// will contain glyphs
let chartab: glyph[] = [];
for (let charTabIndex = 0; charTabIndex < YMAX; charTabIndex++) {
  chartab[charTabIndex] = new glyph();
}

let yindex = 0;
let level = 0;
let emit_x = 0;
let expr_level = 0;

// this is not really the translated version,
// the original is in window.cpp and is
// rather more complex
function printchar_nowrap(character: string | number) {
  let accumulator = '';
  accumulator += character;
  return accumulator;
}

function printchar(character: string) {
  return printchar_nowrap(character);
}

export function print2dascii(p: U) {
  yindex = 0;
  level = 0;
  emit_x = 0;
  emit_top_expr(p);

  // if too wide then print flat
  const [h, w, y] = Array.from(get_size(0, yindex));

  if (w > 100) {
    printline(p);
    return;
  }

  const beenPrinted = print_glyphs();

  return beenPrinted;
}

function emit_top_expr(p: U) {
  if (car(p) === symbol(SETQ)) {
    emit_expr(cadr(p));
    __emit_str(' = ');
    emit_expr(caddr(p));
    return;
  }

  if (istensor(p)) {
    emit_tensor(p);
  } else {
    emit_expr(p);
  }
}

function will_be_displayed_as_fraction(p: U): boolean {
  if (level > 0) {
    return false;
  }
  if (isfraction(p)) {
    return true;
  }
  if (!ismultiply(p)) {
    return false;
  }
  if (isfraction(cadr(p))) {
    return true;
  }
  while (iscons(p)) {
    if (isdenominator(car(p))) {
      return true;
    }
    p = cdr(p);
  }
  return false;
}

function emit_expr(p: U) {
  //  if (level > 0) {
  //    printexpr(p)
  //    return
  //  }
  expr_level++;
  if (isadd(p)) {
    p = cdr(p);
    if (__is_negative(car(p))) {
      __emit_char('-');
      if (will_be_displayed_as_fraction(car(p))) {
        __emit_char(' ');
      }
    }
    emit_term(car(p));
    p = cdr(p);
    while (iscons(p)) {
      if (__is_negative(car(p))) {
        __emit_char(' ');
        __emit_char('-');
        __emit_char(' ');
      } else {
        __emit_char(' ');
        __emit_char('+');
        __emit_char(' ');
      }

      emit_term(car(p));
      p = cdr(p);
    }
  } else {
    if (__is_negative(p)) {
      __emit_char('-');
      if (will_be_displayed_as_fraction(p)) {
        __emit_char(' ');
      }
    }
    emit_term(p);
  }
  expr_level--;
}

function emit_unsigned_expr(p: U) {
  if (isadd(p)) {
    p = cdr(p);
    //    if (__is_negative(car(p)))
    //      __emit_char('-')
    emit_term(car(p));
    p = cdr(p);

    while (iscons(p)) {
      if (__is_negative(car(p))) {
        __emit_char(' ');
        __emit_char('-');
        __emit_char(' ');
      } else {
        __emit_char(' ');
        __emit_char('+');
        __emit_char(' ');
      }
      emit_term(car(p));
      p = cdr(p);
    }
  } else {
    //    if (__is_negative(p))
    //      __emit_char('-')
    emit_term(p);
  }
}

function __is_negative(p: U): boolean {
  if (isnegativenumber(p)) {
    return true;
  }
  if (ismultiply(p) && isnegativenumber(cadr(p))) {
    return true;
  }
  return false;
}

function emit_term(p: U) {
  if (ismultiply(p)) {
    const n = count_denominators(p);
    if (n && level === 0) {
      emit_fraction(p, n);
    } else {
      emit_multiply(p, n);
    }
  } else {
    emit_factor(p);
  }
}

function isdenominator(p: U): boolean {
  return ispower(p) && cadr(p) !== symbol(E) && __is_negative(caddr(p));
}

function count_denominators(p: U) {
  let count = 0;
  p = cdr(p);
  //  if (isfraction(car(p))) {
  //    count++
  //    p = cdr(p)
  //  }
  while (iscons(p)) {
    const q = car(p);
    if (isdenominator(q)) {
      count++;
    }
    p = cdr(p);
  }
  return count;
}

// n is the number of denominators, not counting a fraction like 1/2
function emit_multiply(p: U, n: number) {
  if (n === 0) {
    p = cdr(p);
    if (isplusone(car(p)) || isminusone(car(p))) {
      p = cdr(p);
    }
    emit_factor(car(p));
    p = cdr(p);

    while (iscons(p)) {
      __emit_char(' ');
      emit_factor(car(p));
      p = cdr(p);
    }
  } else {
    emit_numerators(p);
    __emit_char('/');
    // need grouping if more than one denominator
    if (n > 1 || isfraction(cadr(p))) {
      __emit_char('(');
      emit_denominators(p);
      __emit_char(')');
    } else {
      emit_denominators(p);
    }
  }
}

// sign of term has already been emitted
function emit_fraction(p: U, d: number) {
  let p1: U, p2: U;
  let count = 0;
  let k1 = 0;
  let k2 = 0;
  let n = 0;
  let x = 0;

  let A: U = Constants.one;
  let B: U = Constants.one;

  // handle numerical coefficient
  if (isrational(cadr(p))) {
    A = absval(mp_numerator(cadr(p)));
    B = mp_denominator(cadr(p));
  }

  if (isdouble(cadr(p))) {
    A = absval(cadr(p));
  }

  // count numerators
  n = isplusone(A) ? 0 : 1;
  p1 = cdr(p);
  if (isNumericAtom(car(p1))) {
    p1 = cdr(p1);
  }
  while (iscons(p1)) {
    p2 = car(p1);
    if (!isdenominator(p2)) {
      n++;
    }
    p1 = cdr(p1);
  }

  // emit numerators
  x = emit_x;

  k1 = yindex;

  count = 0;

  // emit numerical coefficient
  if (!isplusone(A)) {
    // p3 is A
    emit_number(A, 0); // p3 is A
    count++;
  }

  // skip over "multiply"
  p1 = cdr(p);

  // skip over numerical coefficient, already handled
  if (isNumericAtom(car(p1))) {
    p1 = cdr(p1);
  }

  while (iscons(p1)) {
    p2 = car(p1);
    if (!isdenominator(p2)) {
      if (count > 0) {
        __emit_char(' ');
      }
      if (n === 1) {
        emit_expr(p2);
      } else {
        emit_factor(p2);
      }
      count++;
    }
    p1 = cdr(p1);
  }

  if (count === 0) {
    __emit_char('1');
  }

  // emit denominators
  k2 = yindex;

  count = 0;

  if (!isplusone(B)) {
    emit_number(B, 0);
    count++;
    d++;
  }

  p1 = cdr(p);

  if (isrational(car(p1))) {
    p1 = cdr(p1);
  }

  while (iscons(p1)) {
    p2 = car(p1);
    if (isdenominator(p2)) {
      if (count > 0) {
        __emit_char(' ');
      }
      emit_denominator(p2, d);
      count++;
    }
    p1 = cdr(p1);
  }

  fixup_fraction(x, k1, k2);
}

// p points to a multiply
function emit_numerators(p: U) {
  let p1: U = Constants.one;

  p = cdr(p);

  if (isrational(car(p))) {
    p1 = absval(mp_numerator(car(p)));
    p = cdr(p);
  } else if (isdouble(car(p))) {
    p1 = absval(car(p));
    p = cdr(p);
  }

  let n = 0;

  if (!isplusone(p1)) {
    emit_number(p1, 0);
    n++;
  }

  while (iscons(p)) {
    if (!isdenominator(car(p))) {
      if (n > 0) {
        __emit_char(' ');
      }
      emit_factor(car(p));
      n++;
    }
    p = cdr(p);
  }

  if (n === 0) {
    __emit_char('1');
  }
}

// p points to a multiply
function emit_denominators(p: U) {
  let n = 0;

  p = cdr(p);

  if (isfraction(car(p))) {
    const p1 = mp_denominator(car(p));
    emit_number(p1, 0);
    n++;
    p = cdr(p);
  }

  while (iscons(p)) {
    if (isdenominator(car(p))) {
      if (n > 0) {
        __emit_char(' ');
      }
      emit_denominator(car(p), 0);
      n++;
    }
    p = cdr(p);
  }
}

function emit_factor(p: U) {
  if (istensor(p)) {
    if (level === 0) {
      //emit_tensor(p)
      emit_flat_tensor(p);
    } else {
      emit_flat_tensor(p);
    }
    return;
  }

  if (isdouble(p)) {
    emit_number(p, 0);
    return;
  }

  if (isadd(p) || ismultiply(p)) {
    emit_subexpr(p);
    return;
  }

  if (ispower(p)) {
    emit_power(p);
    return;
  }

  if (iscons(p)) {
    //if (car(p) == symbol(FORMAL) && cadr(p).k == SYM)
    //  emit_symbol(cadr(p))
    //else
    emit_function(p);
    return;
  }

  if (isNumericAtom(p)) {
    if (level === 0) {
      emit_numerical_fraction(p);
    } else {
      emit_number(p, 0);
    }
    return;
  }

  if (issymbol(p)) {
    emit_symbol(p);
    return;
  }

  if (isstr(p)) {
    emit_string(p);
  }
}

function emit_numerical_fraction(p: U) {
  const A = absval(mp_numerator(p));
  const B = mp_denominator(p);
  if (isplusone(B)) {
    emit_number(A, 0);
    return;
  }

  let x = emit_x;

  const k1 = yindex;

  emit_number(A, 0);

  const k2 = yindex;

  emit_number(B, 0);

  fixup_fraction(x, k1, k2);
}

// if it's a factor then it doesn't need parens around it, i.e. 1/sin(theta)^2
function isfactor(p: U): boolean {
  if (iscons(p) && !isadd(p) && !ismultiply(p) && !ispower(p)) {
    return true;
  }
  if (issymbol(p)) {
    return true;
  }
  if (isfraction(p)) {
    return false;
  }
  if (isnegativenumber(p)) {
    return false;
  }
  if (isNumericAtom(p)) {
    return true;
  }
  return false;
}

function emit_power(p: U) {
  let k1 = 0;
  let k2 = 0;
  let x = 0;

  if (cadr(p) === symbol(E)) {
    __emit_str('exp(');
    emit_expr(caddr(p));
    __emit_char(')');
    return;
  }

  if (level > 0) {
    if (isminusone(caddr(p))) {
      __emit_char('1');
      __emit_char('/');
      if (isfactor(cadr(p))) {
        emit_factor(cadr(p));
      } else {
        emit_subexpr(cadr(p));
      }
    } else {
      if (isfactor(cadr(p))) {
        emit_factor(cadr(p));
      } else {
        emit_subexpr(cadr(p));
      }
      __emit_char('^');
      if (isfactor(caddr(p))) {
        emit_factor(caddr(p));
      } else {
        emit_subexpr(caddr(p));
      }
    }
    return;
  }

  // special case: 1 over something
  if (__is_negative(caddr(p))) {
    x = emit_x;
    k1 = yindex;
    __emit_char('1');
    k2 = yindex;
    //level++
    emit_denominator(p, 1);
    //level--
    fixup_fraction(x, k1, k2);
    return;
  }

  k1 = yindex;
  if (isfactor(cadr(p))) {
    emit_factor(cadr(p));
  } else {
    emit_subexpr(cadr(p));
  }
  k2 = yindex;
  level++;
  emit_expr(caddr(p));
  level--;
  fixup_power(k1, k2);
}

// if n == 1 then emit as expr (no parens)
// p is a power
function emit_denominator(p: U, n: number) {
  let k1 = 0;
  let k2 = 0;

  // special case: 1 over something

  if (isminusone(caddr(p))) {
    if (n === 1) {
      emit_expr(cadr(p));
    } else {
      emit_factor(cadr(p));
    }
    return;
  }

  k1 = yindex;

  // emit base
  if (isfactor(cadr(p))) {
    emit_factor(cadr(p));
  } else {
    emit_subexpr(cadr(p));
  }

  k2 = yindex;

  // emit exponent, don't emit minus sign
  level++;

  emit_unsigned_expr(caddr(p));

  level--;

  fixup_power(k1, k2);
}

function emit_function(p: U) {
  if (car(p) === symbol(INDEX) && issymbol(cadr(p))) {
    emit_index_function(p);
    return;
  }

  if (isfactorial(p)) {
    emit_factorial_function(p);
    return;
  }

  if (car(p) === symbol(DERIVATIVE)) {
    __emit_char('d');
  } else {
    emit_symbol(car(p) as Sym);
  }
  __emit_char('(');
  p = cdr(p);
  if (iscons(p)) {
    emit_expr(car(p));
    p = cdr(p);
    while (iscons(p)) {
      __emit_char(',');
      //__emit_char(' ')
      emit_expr(car(p));
      p = cdr(p);
    }
  }
  __emit_char(')');
}

function emit_index_function(p: U) {
  p = cdr(p);
  if (
    caar(p) === symbol(ADD) ||
    caar(p) === symbol(MULTIPLY) ||
    caar(p) === symbol(POWER) ||
    caar(p) === symbol(FACTORIAL)
  ) {
    emit_subexpr(car(p));
  } else {
    emit_expr(car(p));
  }
  __emit_char('[');
  p = cdr(p);
  if (iscons(p)) {
    emit_expr(car(p));
    p = cdr(p);
    while (iscons(p)) {
      __emit_char(',');
      emit_expr(car(p));
      p = cdr(p);
    }
  }
  __emit_char(']');
}

function emit_factorial_function(p: U) {
  p = cadr(p);
  if (
    isfraction(p) ||
    isadd(p) ||
    ismultiply(p) ||
    ispower(p) ||
    isfactorial(p)
  ) {
    emit_subexpr(p);
  } else {
    emit_expr(p);
  }
  __emit_char('!');
}

function emit_subexpr(p: U) {
  __emit_char('(');
  emit_expr(p);
  __emit_char(')');
}

function emit_symbol(p: Sym) {
  if (p === symbol(E)) {
    __emit_str('exp(1)');
    return;
  }

  const pPrintName = get_printname(p);

  for (let i = 0; i < pPrintName.length; i++) {
    __emit_char(pPrintName[i]);
  }
}

function emit_string(p: Str) {
  const pString = p.str;
  __emit_char('"');
  for (let i = 0; i < pString.length; i++) {
    __emit_char(pString[i]);
  }
  __emit_char('"');
}

function fixup_fraction(x, k1: number, k2: number) {
  let dx = 0;
  let dy = 0;

  const [h1, w1, y1] = Array.from(get_size(k1, k2));
  const [h2, w2, y2] = Array.from(get_size(k2, yindex));

  if (w2 > w1) {
    dx = (w2 - w1) / 2; // shift numerator right
  } else {
    dx = 0;
  }

  dx++;
  // this is how much is below the baseline
  const y = y1 + h1 - 1;

  dy = -y - 1;

  move(k1, k2, dx, dy);

  if (w2 > w1) {
    dx = -w1;
  } else {
    dx = -w1 + (w1 - w2) / 2;
  }

  dx++;
  dy = -y2 + 1;

  move(k2, yindex, dx, dy);

  let w = 0;
  if (w2 > w1) {
    w = w2;
  } else {
    w = w1;
  }

  w += 2;
  emit_x = x;

  for (let i = 0; i < w; i++) {
    __emit_char('-');
  }
}

function fixup_power(k1: number, k2: number) {
  let dy = 0;
  let h1 = 0;
  let w1 = 0;
  let y1 = 0;
  let h2 = 0;
  let w2 = 0;
  let y2 = 0;

  [h1, w1, y1] = Array.from(get_size(k1, k2));
  [h2, w2, y2] = Array.from(get_size(k2, yindex));

  // move superscript to baseline
  dy = -y2 - h2 + 1;

  // now move above base
  dy += y1 - 1;

  move(k2, yindex, 0, dy);
}

function move(j: number, k: number, dx: number, dy: number) {
  for (let i = j; i < k; i++) {
    chartab[i].x += dx;
    chartab[i].y += dy;
  }
}

// finds the bounding rectangle and vertical position
function get_size(j: number, k: number) {
  let min_x = chartab[j].x;
  let max_x = chartab[j].x;
  let min_y = chartab[j].y;
  let max_y = chartab[j].y;
  for (let i = j + 1; i < k; i++) {
    if (chartab[i].x < min_x) {
      min_x = chartab[i].x;
    }
    if (chartab[i].x > max_x) {
      max_x = chartab[i].x;
    }
    if (chartab[i].y < min_y) {
      min_y = chartab[i].y;
    }
    if (chartab[i].y > max_y) {
      max_y = chartab[i].y;
    }
  }
  const h = max_y - min_y + 1;
  const w = max_x - min_x + 1;
  const y = min_y;
  return [h, w, y];
}

function __emit_char(c) {
  if (yindex === YMAX) {
    return;
  }
  if (chartab[yindex] == null) {
    breakpoint;
  }
  chartab[yindex].c = c;
  chartab[yindex].x = emit_x;
  chartab[yindex].y = 0;
  yindex++;
  return emit_x++;
}

function __emit_str(s: string) {
  for (let i = 0; i < s.length; i++) {
    __emit_char(s[i]);
  }
}

function emit_number(p: U, emit_sign: number) {
  let tmpString = '';
  switch (p.k) {
    case NUM:
      tmpString = p.q.a.toString();
      if (tmpString[0] === '-' && emit_sign === 0) {
        tmpString = tmpString.substring(1);
      }
      for (let i = 0; i < tmpString.length; i++) {
        __emit_char(tmpString[i]);
      }
      tmpString = p.q.b.toString();
      if (tmpString === '1') {
        break;
      }
      __emit_char('/');
      for (let i = 0; i < tmpString.length; i++) {
        __emit_char(tmpString[i]);
      }
      break;
    case DOUBLE:
      tmpString = doubleToReasonableString((p as Double).d);
      if (tmpString[0] === '-' && emit_sign === 0) {
        tmpString = tmpString.substring(1);
      }
      for (let i = 0; i < tmpString.length; i++) {
        __emit_char(tmpString[i]);
      }
      break;
  }
}

// a and b are glyphs
function cmpGlyphs(a: glyph, b: glyph): Sign {
  if (a.y < b.y) {
    return -1;
  }

  if (a.y > b.y) {
    return 1;
  }

  if (a.x < b.x) {
    return -1;
  }

  if (a.x > b.x) {
    return 1;
  }

  return 0;
}

function print_glyphs() {
  let accumulator = '';

  // now sort the glyphs by their vertical positions,
  // since we are going to build a string where obviously the
  // "upper" line has to printed out first, followed by
  // a new line, followed by the other lines.
  //qsort(chartab, yindex, sizeof (struct glyph), __cmp)
  const subsetOfStack = chartab.slice(0, yindex);
  subsetOfStack.sort(cmpGlyphs);
  chartab = [].concat(subsetOfStack).concat(chartab.slice(yindex));

  let x = 0;
  let { y } = chartab[0];

  for (let i = 0; i < yindex; i++) {
    while (chartab[i].y > y) {
      accumulator += printchar('\n');
      x = 0;
      y++;
    }

    while (chartab[i].x > x) {
      accumulator += printchar_nowrap(' ');
      x++;
    }

    accumulator += printchar_nowrap(chartab[i].c);

    x++;
  }

  return accumulator;
}

const N = 100;

class oneElement {
  public x = 0;
  public y = 0;
  public h = 0;
  public w = 0;
  public index = 0;
  public count = 0;
}

const elem: oneElement[] = [];
for (let elelmIndex = 0; elelmIndex < 10000; elelmIndex++) {
  elem[elelmIndex] = new oneElement();
}

const SPACE_BETWEEN_COLUMNS = 3;
const SPACE_BETWEEN_ROWS = 1;

function emit_tensor(p: Tensor<U>) {
  let ncol = 0;
  let dx = 0;
  let dy = 0;

  if (p.tensor.ndim > 2) {
    emit_flat_tensor(p);
    return;
  }

  const nrow = p.tensor.dim[0];

  if (p.tensor.ndim === 2) {
    ncol = p.tensor.dim[1];
  } else {
    ncol = 1;
  }

  const n = nrow * ncol;

  if (n > N) {
    emit_flat_tensor(p);
    return;
  }

  // horizontal coordinate of the matrix

  //if 0
  //emit_x += 2; # make space for left paren
  //endif

  const x = emit_x;

  // emit each element
  for (let i = 0; i < n; i++) {
    elem[i].index = yindex;
    elem[i].x = emit_x;
    emit_expr(p.tensor.elem[i]);
    elem[i].count = yindex - elem[i].index;
    [elem[i].h, elem[i].w, elem[i].y] = Array.from(
      get_size(elem[i].index, yindex)
    );
  }

  // find element height and width
  let eh = 0;
  let ew = 0;

  for (let i = 0; i < n; i++) {
    if (elem[i].h > eh) {
      eh = elem[i].h;
    }
    if (elem[i].w > ew) {
      ew = elem[i].w;
    }
  }

  // this is the overall height of the matrix
  const h = nrow * eh + (nrow - 1) * SPACE_BETWEEN_ROWS;

  // this is the overall width of the matrix
  const w = ncol * ew + (ncol - 1) * SPACE_BETWEEN_COLUMNS;

  // this is the vertical coordinate of the matrix
  const y = -(h / 2);

  // move elements around
  for (let row = 0; row < nrow; row++) {
    for (let col = 0; col < ncol; col++) {
      let i = row * ncol + col;

      // first move to upper left corner of matrix
      dx = x - elem[i].x;
      dy = y - elem[i].y;

      move(elem[i].index, elem[i].index + elem[i].count, dx, dy);

      // now move to official position
      dx = 0;

      if (col > 0) {
        dx = col * (ew + SPACE_BETWEEN_COLUMNS);
      }

      dy = 0;

      if (row > 0) {
        dy = row * (eh + SPACE_BETWEEN_ROWS);
      }

      // small correction for horizontal centering
      dx += (ew - elem[i].w) / 2;

      // small correction for vertical centering
      dy += (eh - elem[i].h) / 2;

      move(elem[i].index, elem[i].index + elem[i].count, dx, dy);
    }
  }

  emit_x = x + w;

  /*
  if 0

    * left brace

    for (i = 0; i < h; i++) {
      if (yindex == YMAX)
        break
      chartab[yindex].c = '|'
      chartab[yindex].x = x - 2
      chartab[yindex].y = y + i
      yindex++
    }

    * right brace

    emit_x++

    for (i = 0; i < h; i++) {
      if (yindex == YMAX)
        break
      chartab[yindex].c = '|'
      chartab[yindex].x = emit_x
      chartab[yindex].y = y + i
      yindex++
    }

    emit_x++

  endif
  */
}

function emit_flat_tensor(p: Tensor<U>) {
  emit_tensor_inner(p, 0, 0);
}

function emit_tensor_inner(p, j, k) {
  __emit_char('(');
  for (let i = 0; i < p.tensor.dim[j]; i++) {
    if (j + 1 === p.tensor.ndim) {
      emit_expr(p.tensor.elem[k]);
      k = k + 1;
    } else {
      k = emit_tensor_inner(p, j + 1, k);
    }
    if (i + 1 < p.tensor.dim[j]) {
      __emit_char(',');
    }
  }
  __emit_char(')');
  return k;
}
