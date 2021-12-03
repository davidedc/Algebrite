"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yn = exports.jn = exports.append = exports.__range__ = exports.isalnumorunderscore = exports.isalpha = exports.isdigit = exports.isspace = exports.clear_term = exports.doubleToReasonableString = exports.strcmp = void 0;
const run_1 = require("./run");
const bignum_1 = require("../sources/bignum");
const is_1 = require("../sources/is");
const defs_1 = require("./defs");
const symbol_1 = require("./symbol");
const list_1 = require("../sources/list");
function strcmp(str1, str2) {
    if (str1 === str2) {
        return 0;
    }
    else if (str1 > str2) {
        return 1;
    }
    else {
        return -1;
    }
}
exports.strcmp = strcmp;
function doubleToReasonableString(d) {
    // when generating code, print out
    // the standard JS Number printout
    let stringRepresentation;
    if (defs_1.defs.codeGen || defs_1.defs.fullDoubleOutput) {
        return '' + d;
    }
    if (is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.FORCE_FIXED_PRINTOUT)))) {
        stringRepresentation = '' + d;
        // manipulate the string so that it can be parsed by
        // Algebrite (something like 1.23e-123 wouldn't cut it because
        // that would be parsed as 1.23*e - 123)
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            // 1.0\mathrm{e}{-10} looks much better than the plain 1.0e-10
            if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
                stringRepresentation = stringRepresentation.replace(/e(.*)/gm, '\\mathrm{e}{$1}');
            }
            else {
                // if there is no dot in the mantissa, add it so we see it's
                // a double and not a perfect number
                // e.g. 1e-10 becomes 1.0\mathrm{e}{-10}
                stringRepresentation = stringRepresentation.replace(/(\d+)e(.*)/gm, '$1.0\\mathrm{e}{$2}');
            }
        }
        else {
            if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
                stringRepresentation = stringRepresentation.replace(/e(.*)/gm, '*10^($1)');
            }
            else {
                // if there is no dot in the mantissa, add it so we see it's
                // a double and not a perfect number
                // e.g. 1e-10 becomes 1.0e-10
                stringRepresentation = stringRepresentation.replace(/(\d+)e(.*)/gm, '$1.0*10^($2)');
            }
        }
    }
    else {
        const maxFixedPrintoutDigits = bignum_1.nativeInt(symbol_1.get_binding(defs_1.symbol(defs_1.MAX_FIXED_PRINTOUT_DIGITS)));
        //console.log "maxFixedPrintoutDigits: " + maxFixedPrintoutDigits
        //console.log "type: " + typeof(maxFixedPrintoutDigits)
        //console.log "toFixed: " + d.toFixed(maxFixedPrintoutDigits)
        stringRepresentation = '' + d.toFixed(maxFixedPrintoutDigits);
        // remove any trailing zeroes after the dot
        // see https://stackoverflow.com/questions/26299160/using-regex-how-do-i-remove-the-trailing-zeros-from-a-decimal-number
        stringRepresentation = stringRepresentation.replace(/(\.\d*?[1-9])0+$/gm, '$1');
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
exports.doubleToReasonableString = doubleToReasonableString;
// does nothing
function clear_term() { }
exports.clear_term = clear_term;
// s is a string here anyways
function isspace(s) {
    if (s == null) {
        return false;
    }
    return (s === ' ' ||
        s === '\t' ||
        s === '\n' ||
        s === '\v' ||
        s === '\f' ||
        s === '\r');
}
exports.isspace = isspace;
function isdigit(str) {
    if (str == null) {
        return false;
    }
    return /^\d+$/.test(str);
}
exports.isdigit = isdigit;
function isalpha(str) {
    if (str == null) {
        return false;
    }
    //Check for non-alphabetic characters and space
    return str.search(/[^A-Za-z]/) === -1;
}
exports.isalpha = isalpha;
function isalphaOrUnderscore(str) {
    if (str == null) {
        return false;
    }
    //Check for non-alphabetic characters and space
    return str.search(/[^A-Za-z_]/) === -1;
}
function isunderscore(str) {
    if (str == null) {
        return false;
    }
    return str.search(/_/) === -1;
}
function isalnumorunderscore(str) {
    if (str == null) {
        return false;
    }
    return isalphaOrUnderscore(str) || isdigit(str);
}
exports.isalnumorunderscore = isalnumorunderscore;
function __range__(left, right, inclusive) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}
exports.__range__ = __range__;
// Append one list to another.
function append(p1, p2) {
    // from https://github.com/gbl08ma/eigenmath/blob/8be989f00f2f6f37989bb7fd2e75a83f882fdc49/src/append.cpp
    const arr = [];
    if (defs_1.iscons(p1)) {
        arr.push(...p1);
    }
    if (defs_1.iscons(p2)) {
        arr.push(...p2);
    }
    return list_1.makeList(...arr);
}
exports.append = append;
function jn(n, x) {
    run_1.stop('Not implemented');
    // See https://git.musl-libc.org/cgit/musl/tree/src/math/jn.c
    // https://github.com/SheetJS/bessel
}
exports.jn = jn;
function yn(n, x) {
    run_1.stop('Not implemented');
    // See https://git.musl-libc.org/cgit/musl/tree/src/math/jn.c
    // https://github.com/SheetJS/bessel
}
exports.yn = yn;
