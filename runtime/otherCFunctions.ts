import {stop} from './run';
import {nativeInt} from '../sources/bignum';
import {isZeroAtomOrTensor} from '../sources/is';
import {defs, FORCE_FIXED_PRINTOUT, iscons, MAX_FIXED_PRINTOUT_DIGITS, PRINTMODE_LATEX, Sign, U,} from './defs';
import {get_binding, symbol} from './symbol';
import { makeList } from '../sources/list';

export function strcmp(str1: string, str2: string): Sign {
  if (str1 === str2) {
    return 0;
  } else if (str1 > str2) {
    return 1;
  } else {
    return -1;
  }
}

export function doubleToReasonableString(d: number) {
  // when generating code, print out
  // the standard JS Number printout
  let stringRepresentation: string;
  if (defs.codeGen || defs.fullDoubleOutput) {
    return '' + d;
  }

  if (isZeroAtomOrTensor(get_binding(symbol(FORCE_FIXED_PRINTOUT)))) {
    stringRepresentation = '' + d;
    // manipulate the string so that it can be parsed by
    // Algebrite (something like 1.23e-123 wouldn't cut it because
    // that would be parsed as 1.23*e - 123)

    if (defs.printMode === PRINTMODE_LATEX) {
      // 1.0\mathrm{e}{-10} looks much better than the plain 1.0e-10
      if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
        stringRepresentation = stringRepresentation.replace(
          /e(.*)/gm,
          '\\mathrm{e}{$1}'
        );
      } else {
        // if there is no dot in the mantissa, add it so we see it's
        // a double and not a perfect number
        // e.g. 1e-10 becomes 1.0\mathrm{e}{-10}
        stringRepresentation = stringRepresentation.replace(
          /(\d+)e(.*)/gm,
          '$1.0\\mathrm{e}{$2}'
        );
      }
    } else {
      if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
        stringRepresentation = stringRepresentation.replace(
          /e(.*)/gm,
          '*10^($1)'
        );
      } else {
        // if there is no dot in the mantissa, add it so we see it's
        // a double and not a perfect number
        // e.g. 1e-10 becomes 1.0e-10
        stringRepresentation = stringRepresentation.replace(
          /(\d+)e(.*)/gm,
          '$1.0*10^($2)'
        );
      }
    }
  } else {
    const maxFixedPrintoutDigits = nativeInt(
      get_binding(symbol(MAX_FIXED_PRINTOUT_DIGITS))
    );
    //console.log "maxFixedPrintoutDigits: " + maxFixedPrintoutDigits
    //console.log "type: " + typeof(maxFixedPrintoutDigits)
    //console.log "toFixed: " + d.toFixed(maxFixedPrintoutDigits)

    stringRepresentation = '' + d.toFixed(maxFixedPrintoutDigits);

    // remove any trailing zeroes after the dot
    // see https://stackoverflow.com/questions/26299160/using-regex-how-do-i-remove-the-trailing-zeros-from-a-decimal-number
    stringRepresentation = stringRepresentation.replace(
      /(\.\d*?[1-9])0+$/gm,
      '$1'
    );
    // in case there are only zeroes after the dot, removes the dot too
    stringRepresentation = stringRepresentation.replace(/\.0+$/gm, '');

    // we actually want to give a hint to user that
    // it's a double, so add a trailing ".0" if there
    // is no decimal point
    if (stringRepresentation.indexOf('.') === -1) {
      stringRepresentation += '.0';
    }

    if (parseFloat(stringRepresentation) !== d) {
      stringRepresentation = d.toFixed(maxFixedPrintoutDigits) + '...';
    }
  }

  return stringRepresentation;
}

// does nothing
export function clear_term() {}

// s is a string here anyways
export function isspace(s: string): boolean {
  if (s == null) {
    return false;
  }
  return (
    s === ' ' ||
    s === '\t' ||
    s === '\n' ||
    s === '\v' ||
    s === '\f' ||
    s === '\r'
  );
}

export function isdigit(str: string): boolean {
  if (str == null) {
    return false;
  }
  return /^\d+$/.test(str);
}

export function isalpha(str: string): boolean {
  if (str == null) {
    return false;
  }
  //Check for non-alphabetic characters and space
  return str.search(/[^A-Za-z]/) === -1;
}

function isalphaOrUnderscore(str: string): boolean {
  if (str == null) {
    return false;
  }
  //Check for non-alphabetic characters and space
  return str.search(/[^A-Za-z_]/) === -1;
}

function isunderscore(str: string): boolean {
  if (str == null) {
    return false;
  }
  return str.search(/_/) === -1;
}

export function isalnumorunderscore(str: string): boolean {
  if (str == null) {
    return false;
  }
  return isalphaOrUnderscore(str) || isdigit(str);
}

export function __range__(
  left: number,
  right: number,
  inclusive: boolean
): number[] {
  let range: number[] = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

// Append one list to another.
export function append(p1: U, p2: U): U {
  // from https://github.com/gbl08ma/eigenmath/blob/8be989f00f2f6f37989bb7fd2e75a83f882fdc49/src/append.cpp
  const arr = [];
  if (iscons(p1)) {
    arr.push(...p1);
  }
  if (iscons(p2)) {
    arr.push(...p2);
  }
  return makeList(...arr);
}

export function jn(n: number, x: number): number {
  stop('Not implemented');
  // See https://git.musl-libc.org/cgit/musl/tree/src/math/jn.c
  // https://github.com/SheetJS/bessel
}

export function yn(n: number, x: number): number {
  stop('Not implemented');
  // See https://git.musl-libc.org/cgit/musl/tree/src/math/jn.c
  // https://github.com/SheetJS/bessel
}
