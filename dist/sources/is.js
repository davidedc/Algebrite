"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isnpi = exports.isquarterturn = exports.isimaginaryunit = exports.isfloating = exports.isMinusSqrtThreeOverTwo = exports.isSqrtThreeOverTwo = exports.isminusoneoversqrttwo = exports.isoneoversqrttwo = exports.isminusoneovertwo = exports.isoneovertwo = exports.equalq = exports.equaln = exports.isfraction = exports.isoneover = exports.isNumberOneOverSomething = exports.isintegerfactor = exports.issymbolic = exports.isnegative = exports.iseveninteger = exports.iscomplexnumber = exports.iscomplexnumberdouble = exports.isimaginarynumber = exports.isnegativeterm = exports.ispolyexpandedform = exports.isunivarpolyfactoredorexpandedform = exports.isposint = exports.isnonnegativeinteger = exports.isintegerorintegerfloat = exports.isinteger = exports.isone = exports.isminusone = exports.isplusone = exports.isplustwo = exports.ispositivenumber = exports.isnegativenumber = exports.isZeroLikeOrNonZeroLikeOrUndetermined = exports.isZeroAtomOrTensor = exports.isZeroAtom = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const float_1 = require("./float");
const guess_1 = require("./guess");
const multiply_1 = require("./multiply");
const DEBUG_IS = false;
// this routine is a simple check on whether we have
// a basic zero in our hands. It doesn't perform any
// calculations or simplifications.
function isZeroAtom(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MZERO(p.q.a)) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d === 0.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.isZeroAtom = isZeroAtom;
// this routine is a simple check on whether we have
// a basic zero in our hands. It doesn't perform any
// calculations or simplifications.
function isZeroTensor(p) {
    if (!defs_1.istensor(p)) {
        return false;
    }
    return p.tensor.elem.every((el) => isZeroAtomOrTensor(el));
}
// this routine is a simple check on whether we have
// a basic zero in our hands. It doesn't perform any
// calculations or simplifications.
function isZeroAtomOrTensor(p) {
    return isZeroAtom(p) || isZeroTensor(p);
}
exports.isZeroAtomOrTensor = isZeroAtomOrTensor;
// This is a key routine to try to determine whether
// the argument looks like zero/false, or non-zero/true,
// or undetermined.
// This is useful in two instances:
//  * to determine if a predicate is true/false
//  * to determine if particular quantity is zero
// Note that if one wants to check if we have a simple
// zero atom or tensor in our hands, then the isZeroAtomOrTensor
// routine is sufficient.
function isZeroLikeOrNonZeroLikeOrUndetermined(valueOrPredicate) {
    // just like Eval but turns assignments into equality checks
    let evalledArgument = eval_1.Eval_predicate(valueOrPredicate);
    // OK first check if we already have
    // a simple zero (or simple zero tensor)
    if (isZeroAtomOrTensor(evalledArgument)) {
        return false;
    }
    // also check if we have a simple numeric value, or a tensor
    // full of simple numeric values (i.e. straight doubles or fractions).
    // In such cases, since we
    // just excluded they are zero, then we take it as
    // a "true"
    if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
        return true;
    }
    // if we are here we are in the case of value that
    // is not a zero and not a simple numeric value.
    // e.g. stuff like
    // 'sqrt(2)', or 'sin(45)' or '1+i', or 'a'
    // so in such cases let's try to do a float()
    // so we might get down to a simple numeric value
    // in some of those cases
    evalledArgument = float_1.zzfloat(evalledArgument);
    // anything that could be calculated down to a simple
    // numeric value is now indeed either a
    // double OR a double with an imaginary component
    // e.g. 2.0 or 2.4 + i*5.6
    // (Everything else are things that don't have a numeric
    // value e.g. 'a+b')
    // So, let's take care of the case where we have
    // a simple numeric value with NO imaginary component,
    // things like sqrt(2) or sin(PI)
    // by doing the simple numeric
    // values checks again
    if (isZeroAtomOrTensor(evalledArgument)) {
        return false;
    }
    if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
        return true;
    }
    // here we still have cases of simple numeric values
    // WITH an imaginary component e.g. '1+i',
    // or things that don't have a numeric value e.g. 'a'
    // so now let's take care of the imaginary numbers:
    // since we JUST have to spot "zeros" we can just
    // calculate the absolute value and re-do all the checks
    // we just did
    if (find_1.Find(evalledArgument, defs_1.Constants.imaginaryunit)) {
        evalledArgument = eval_1.Eval_predicate(abs_1.absValFloat(evalledArgument));
        // re-do the simple-number checks...
        if (isZeroAtomOrTensor(evalledArgument)) {
            return false;
        }
        if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
            return true;
        }
    }
    // here we have stuff that is not reconducible to any
    // numeric value (or tensor with numeric values) e.g.
    // 'a+b', so it just means that we just don't know the
    // truth value, so we have
    // to leave the whole thing unevalled
    return null;
}
exports.isZeroLikeOrNonZeroLikeOrUndetermined = isZeroLikeOrNonZeroLikeOrUndetermined;
function isnegativenumber(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MSIGN(p.q.a) === -1) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d < 0.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.isnegativenumber = isnegativenumber;
function ispositivenumber(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MSIGN(p.q.a) === 1) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d > 0.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.ispositivenumber = ispositivenumber;
function isplustwo(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, 2) && defs_1.MEQUAL(p.q.b, 1)) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d === 2.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.isplustwo = isplustwo;
function isplusone(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, 1) && defs_1.MEQUAL(p.q.b, 1)) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d === 1.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.isplusone = isplusone;
function isminusone(p) {
    switch (p.k) {
        case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, -1) && defs_1.MEQUAL(p.q.b, 1)) {
                return true;
            }
            break;
        case defs_1.DOUBLE:
            if (p.d === -1.0) {
                return true;
            }
            break;
    }
    return false;
}
exports.isminusone = isminusone;
function isone(p) {
    return isplusone(p) || isminusone(p);
}
exports.isone = isone;
function isinteger(p) {
    return p.k === defs_1.NUM && defs_1.MEQUAL(p.q.b, 1);
}
exports.isinteger = isinteger;
function isintegerorintegerfloat(p) {
    if (p.k === defs_1.DOUBLE) {
        if (p.d === Math.round(p.d)) {
            return true;
        }
        return false;
    }
    return isinteger(p);
}
exports.isintegerorintegerfloat = isintegerorintegerfloat;
function isnonnegativeinteger(p) {
    return defs_1.isrational(p) && defs_1.MEQUAL(p.q.b, 1) && defs_1.MSIGN(p.q.a) === 1;
}
exports.isnonnegativeinteger = isnonnegativeinteger;
function isposint(p) {
    return isinteger(p) && defs_1.MSIGN(p.q.a) === 1;
}
exports.isposint = isposint;
// --------------------------------------
function isunivarpolyfactoredorexpandedform(p, x) {
    if (x == null) {
        x = guess_1.guess(p);
    }
    if (ispolyfactoredorexpandedform(p, x) &&
        countTrue(find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_X)), find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Y)), find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Z))) === 1) {
        return x;
    }
    else {
        return;
    }
}
exports.isunivarpolyfactoredorexpandedform = isunivarpolyfactoredorexpandedform;
function countTrue(...a) {
    // Number(true) = 1
    return a.reduce((count, x) => count + Number(x), 0);
}
// --------------------------------------
// sometimes we want to check if we have a poly in our
// hands, however it's in factored form and we don't
// want to expand it.
function ispolyfactoredorexpandedform(p, x) {
    return ispolyfactoredorexpandedform_factor(p, x);
}
function ispolyfactoredorexpandedform_factor(p, x) {
    if (defs_1.ismultiply(p)) {
        return p.tail().every((el) => {
            const bool = ispolyfactoredorexpandedform_power(el, x);
            if (defs_1.DEBUG) {
                console.log(`ispolyfactoredorexpandedform_factor testing ${el}`);
                if (bool) {
                    console.log(`... tested negative:${el}`);
                }
            }
            return bool;
        });
    }
    else {
        return ispolyfactoredorexpandedform_power(p, x);
    }
}
function ispolyfactoredorexpandedform_power(p, x) {
    if (defs_1.ispower(p)) {
        if (defs_1.DEBUG) {
            console.log('ispolyfactoredorexpandedform_power (isposint(caddr(p)) ' +
                (isposint(defs_1.caddr(p)),
                    defs_1.DEBUG
                        ? console.log('ispolyfactoredorexpandedform_power ispolyexpandedform_expr(cadr(p), x)) ' +
                            ispolyexpandedform_expr(defs_1.cadr(p), x))
                        : undefined));
        }
        return isposint(defs_1.caddr(p)) && ispolyexpandedform_expr(defs_1.cadr(p), x);
    }
    else {
        if (defs_1.DEBUG) {
            console.log(`ispolyfactoredorexpandedform_power not a power, testing if this is exp form: ${p}`);
        }
        return ispolyexpandedform_expr(p, x);
    }
}
// --------------------------------------
function ispolyexpandedform(p, x) {
    if (find_1.Find(p, x)) {
        return ispolyexpandedform_expr(p, x);
    }
    return false;
}
exports.ispolyexpandedform = ispolyexpandedform;
function ispolyexpandedform_expr(p, x) {
    if (defs_1.isadd(p)) {
        return p.tail().every((el) => ispolyexpandedform_term(el, x));
    }
    else {
        return ispolyexpandedform_term(p, x);
    }
}
function ispolyexpandedform_term(p, x) {
    if (defs_1.ismultiply(p)) {
        return p.tail().every((el) => ispolyexpandedform_factor(el, x));
    }
    else {
        return ispolyexpandedform_factor(p, x);
    }
}
function ispolyexpandedform_factor(p, x) {
    if (misc_1.equal(p, x)) {
        return true;
    }
    if (defs_1.ispower(p) && misc_1.equal(defs_1.cadr(p), x)) {
        return isposint(defs_1.caddr(p));
    }
    return !find_1.Find(p, x);
}
// --------------------------------------
function isnegativeterm(p) {
    return isnegativenumber(p) || (defs_1.ismultiply(p) && isnegativenumber(defs_1.cadr(p)));
}
exports.isnegativeterm = isnegativeterm;
function hasNegativeRationalExponent(p) {
    if (defs_1.ispower(p) &&
        defs_1.isrational(defs_1.car(defs_1.cdr(defs_1.cdr(p)))) &&
        isnegativenumber(defs_1.car(defs_1.cdr(p)))) {
        if (DEBUG_IS) {
            console.log(`hasNegativeRationalExponent: ${p} has imaginary component`);
        }
        return true;
    }
    else {
        if (DEBUG_IS) {
            console.log(`hasNegativeRationalExponent: ${p} has NO imaginary component`);
        }
        return false;
    }
}
function isimaginarynumberdouble(p) {
    return ((defs_1.ismultiply(p) &&
        misc_1.length(p) === 3 &&
        defs_1.isdouble(defs_1.cadr(p)) &&
        hasNegativeRationalExponent(defs_1.caddr(p))) ||
        misc_1.equal(p, defs_1.Constants.imaginaryunit));
}
function isimaginarynumber(p) {
    if ((defs_1.ismultiply(p) &&
        misc_1.length(p) === 3 &&
        defs_1.isNumericAtom(defs_1.cadr(p)) &&
        misc_1.equal(defs_1.caddr(p), defs_1.Constants.imaginaryunit)) ||
        misc_1.equal(p, defs_1.Constants.imaginaryunit) ||
        hasNegativeRationalExponent(defs_1.caddr(p))) {
        if (DEBUG_IS) {
            console.log(`isimaginarynumber: ${p} is imaginary number`);
        }
        return true;
    }
    else {
        if (DEBUG_IS) {
            console.log(`isimaginarynumber: ${p} isn't an imaginary number`);
        }
        return false;
    }
}
exports.isimaginarynumber = isimaginarynumber;
function iscomplexnumberdouble(p) {
    return ((defs_1.isadd(p) &&
        misc_1.length(p) === 3 &&
        defs_1.isdouble(defs_1.cadr(p)) &&
        isimaginarynumberdouble(defs_1.caddr(p))) ||
        isimaginarynumberdouble(p));
}
exports.iscomplexnumberdouble = iscomplexnumberdouble;
function iscomplexnumber(p) {
    if (DEBUG_IS) {
        defs_1.breakpoint;
    }
    if ((defs_1.isadd(p) &&
        misc_1.length(p) === 3 &&
        defs_1.isNumericAtom(defs_1.cadr(p)) &&
        isimaginarynumber(defs_1.caddr(p))) ||
        isimaginarynumber(p)) {
        if (defs_1.DEBUG) {
            console.log(`iscomplexnumber: ${p} is imaginary number`);
        }
        return true;
    }
    else {
        if (defs_1.DEBUG) {
            console.log(`iscomplexnumber: ${p} is imaginary number`);
        }
        return false;
    }
}
exports.iscomplexnumber = iscomplexnumber;
function iseveninteger(p) {
    return isinteger(p) && p.q.a.isEven();
}
exports.iseveninteger = iseveninteger;
function isnegative(p) {
    return (defs_1.isadd(p) && isnegativeterm(defs_1.cadr(p))) || isnegativeterm(p);
}
exports.isnegative = isnegative;
// returns 1 if there's a symbol somewhere.
// not used anywhere. Note that PI and POWER are symbols,
// so for example 2^3 would be symbolic
// while -1^(1/2) i.e. 'i' is not, so this can
// be tricky to use.
function issymbolic(p) {
    if (defs_1.issymbol(p)) {
        return true;
    }
    if (defs_1.iscons(p)) {
        return [...p].some(issymbolic);
    }
    return false;
}
exports.issymbolic = issymbolic;
// i.e. 2, 2^3, etc.
function isintegerfactor(p) {
    return (isinteger(p) || (defs_1.ispower(p) && isinteger(defs_1.cadr(p)) && isinteger(defs_1.caddr(p))));
}
exports.isintegerfactor = isintegerfactor;
function isNumberOneOverSomething(p) {
    return isfraction(p) && defs_1.MEQUAL(p.q.a.abs(), 1);
}
exports.isNumberOneOverSomething = isNumberOneOverSomething;
function isoneover(p) {
    return defs_1.ispower(p) && isminusone(defs_1.caddr(p));
}
exports.isoneover = isoneover;
function isfraction(p) {
    return p.k === defs_1.NUM && !defs_1.MEQUAL(p.q.b, 1);
}
exports.isfraction = isfraction;
// n an int
function equaln(p, n) {
    switch (p.k) {
        case defs_1.NUM:
            return defs_1.MEQUAL(p.q.a, n) && defs_1.MEQUAL(p.q.b, 1);
        case defs_1.DOUBLE:
            return p.d === n;
        default:
            return false;
    }
}
exports.equaln = equaln;
// a and b ints
function equalq(p, a, b) {
    switch (p.k) {
        case defs_1.NUM:
            return defs_1.MEQUAL(p.q.a, a) && defs_1.MEQUAL(p.q.b, b);
        case defs_1.DOUBLE:
            return p.d === a / b;
        default:
            return false;
    }
}
exports.equalq = equalq;
// p == 1/2 ?
function isoneovertwo(p) {
    return equalq(p, 1, 2);
}
exports.isoneovertwo = isoneovertwo;
// p == -1/2 ?
function isminusoneovertwo(p) {
    return equalq(p, -1, 2);
}
exports.isminusoneovertwo = isminusoneovertwo;
// p == 1/sqrt(2) ?
function isoneoversqrttwo(p) {
    return defs_1.ispower(p) && equaln(defs_1.cadr(p), 2) && equalq(defs_1.caddr(p), -1, 2);
}
exports.isoneoversqrttwo = isoneoversqrttwo;
// p == -1/sqrt(2) ?
function isminusoneoversqrttwo(p) {
    return (defs_1.ismultiply(p) &&
        equaln(defs_1.cadr(p), -1) &&
        isoneoversqrttwo(defs_1.caddr(p)) &&
        misc_1.length(p) === 3);
}
exports.isminusoneoversqrttwo = isminusoneoversqrttwo;
// Check if the value is sqrt(3)/2
function isSqrtThreeOverTwo(p) {
    return (defs_1.ismultiply(p) &&
        isoneovertwo(defs_1.cadr(p)) &&
        isSqrtThree(defs_1.caddr(p)) &&
        misc_1.length(p) === 3);
}
exports.isSqrtThreeOverTwo = isSqrtThreeOverTwo;
// Check if the value is -sqrt(3)/2
function isMinusSqrtThreeOverTwo(p) {
    return (defs_1.ismultiply(p) &&
        isminusoneovertwo(defs_1.cadr(p)) &&
        isSqrtThree(defs_1.caddr(p)) &&
        misc_1.length(p) === 3);
}
exports.isMinusSqrtThreeOverTwo = isMinusSqrtThreeOverTwo;
// Check if value is sqrt(3)
function isSqrtThree(p) {
    return defs_1.ispower(p) && equaln(defs_1.cadr(p), 3) && isoneovertwo(defs_1.caddr(p));
}
function isfloating(p) {
    if (p.k === defs_1.DOUBLE || p === defs_1.symbol(defs_1.FLOATF)) {
        return true;
    }
    if (defs_1.iscons(p)) {
        return [...p].some(isfloating);
    }
    return false;
}
exports.isfloating = isfloating;
function isimaginaryunit(p) {
    return misc_1.equal(p, defs_1.Constants.imaginaryunit);
}
exports.isimaginaryunit = isimaginaryunit;
// n/2 * i * pi ?
// return value:
//  0  no
//  1  1
//  2  -1
//  3  i
//  4  -i
function isquarterturn(p) {
    let minussign = 0;
    if (!defs_1.ismultiply(p)) {
        return 0;
    }
    if (misc_1.equal(defs_1.cadr(p), defs_1.Constants.imaginaryunit)) {
        if (defs_1.caddr(p) !== defs_1.symbol(defs_1.PI)) {
            return 0;
        }
        if (misc_1.length(p) !== 3) {
            return 0;
        }
        return 2;
    }
    if (!defs_1.isNumericAtom(defs_1.cadr(p))) {
        return 0;
    }
    if (!misc_1.equal(defs_1.caddr(p), defs_1.Constants.imaginaryunit)) {
        return 0;
    }
    if (defs_1.cadddr(p) !== defs_1.symbol(defs_1.PI)) {
        return 0;
    }
    if (misc_1.length(p) !== 4) {
        return 0;
    }
    let n = bignum_1.nativeInt(multiply_1.multiply(defs_1.cadr(p), bignum_1.integer(2)));
    if (isNaN(n)) {
        return 0;
    }
    if (n < 1) {
        minussign = 1;
        n = -n;
    }
    switch (n % 4) {
        case 0:
            n = 1;
            break;
        case 1:
            n = minussign ? 4 : 3;
            break;
        case 2:
            n = 2;
            break;
        case 3:
            n = minussign ? 3 : 4;
    }
    return n;
}
exports.isquarterturn = isquarterturn;
// special multiple of pi?
// returns for the following multiples of pi...
//  -4/2  -3/2  -2/2  -1/2  1/2  2/2  3/2  4/2
//  4  1  2  3  1  2  3  4
function isnpi(p) {
    let n = 0;
    if (p === defs_1.symbol(defs_1.PI)) {
        return 2;
    }
    if (!defs_1.ismultiply(p) ||
        !defs_1.isNumericAtom(defs_1.cadr(p)) ||
        defs_1.caddr(p) !== defs_1.symbol(defs_1.PI) ||
        misc_1.length(p) !== 3) {
        return 0;
    }
    n = bignum_1.nativeInt(multiply_1.multiply(defs_1.cadr(p), bignum_1.integer(2)));
    if (isNaN(n)) {
        return 0;
    }
    if (n < 0) {
        n = 4 - (-n % 4);
    }
    else {
        n = 1 + ((n - 1) % 4);
    }
    return n;
}
exports.isnpi = isnpi;
