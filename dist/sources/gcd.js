"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areunivarpolysfactoredorexpandedform = exports.gcd = exports.Eval_gcd = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const factorpoly_1 = require("./factorpoly");
const list_1 = require("./list");
// Greatest common denominator
// can also be run on polynomials, however
// it works only on the integers and it works
// by factoring the polynomials (not Euclidean algorithm)
function Eval_gcd(p1) {
    p1 = defs_1.cdr(p1);
    let result = eval_1.Eval(defs_1.car(p1));
    if (defs_1.iscons(p1)) {
        result = p1.tail().reduce((acc, p) => gcd(acc, eval_1.Eval(p)), result);
    }
    stack_1.push(result);
}
exports.Eval_gcd = Eval_gcd;
function gcd(p1, p2) {
    return defs_1.doexpand(gcd_main, p1, p2);
}
exports.gcd = gcd;
function gcd_main(p1, p2) {
    let polyVar;
    if (misc_1.equal(p1, p2)) {
        return p1;
    }
    if (defs_1.isrational(p1) && defs_1.isrational(p2)) {
        return bignum_1.gcd_numbers(p1, p2);
    }
    if (polyVar = areunivarpolysfactoredorexpandedform(p1, p2)) {
        return gcd_polys(p1, p2, polyVar);
    }
    if (defs_1.isadd(p1) && defs_1.isadd(p2)) {
        return gcd_sum_sum(p1, p2);
    }
    if (defs_1.isadd(p1)) {
        p1 = gcd_sum(p1);
    }
    if (defs_1.isadd(p2)) {
        p2 = gcd_sum(p2);
    }
    if (defs_1.ismultiply(p1)) {
        return gcd_sum_product(p1, p2);
    }
    if (defs_1.ismultiply(p2)) {
        return gcd_product_sum(p1, p2);
    }
    if (defs_1.ismultiply(p1) && defs_1.ismultiply(p2)) {
        return gcd_product_product(p1, p2);
    }
    return gcd_powers_with_same_base(p1, p2);
}
// TODO this should probably be in "is"?
function areunivarpolysfactoredorexpandedform(p1, p2) {
    let polyVar;
    if (polyVar = is_1.isunivarpolyfactoredorexpandedform(p1)) {
        if (is_1.isunivarpolyfactoredorexpandedform(p2, polyVar)) {
            return polyVar;
        }
    }
}
exports.areunivarpolysfactoredorexpandedform = areunivarpolysfactoredorexpandedform;
function gcd_polys(p1, p2, polyVar) {
    p1 = factorpoly_1.factorpoly(p1, polyVar);
    p2 = factorpoly_1.factorpoly(p2, polyVar);
    if (defs_1.ismultiply(p1) || defs_1.ismultiply(p2)) {
        if (!defs_1.ismultiply(p1)) {
            p1 = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), p1, defs_1.Constants.one);
        }
        if (!defs_1.ismultiply(p2)) {
            p2 = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), p2, defs_1.Constants.one);
        }
    }
    if (defs_1.ismultiply(p1) && defs_1.ismultiply(p2)) {
        return gcd_product_product(p1, p2);
    }
    return gcd_powers_with_same_base(p1, p2);
}
function gcd_product_product(p1, p2) {
    let p3 = defs_1.cdr(p1);
    let p4 = defs_1.cdr(p2);
    if (defs_1.iscons(p3)) {
        return [...p3].reduce((acc, pOuter) => {
            if (defs_1.iscons(p4)) {
                return multiply_1.multiply(acc, [...p4].reduce((innerAcc, pInner) => multiply_1.multiply(innerAcc, gcd(pOuter, pInner)), defs_1.Constants.one));
            }
        }, defs_1.Constants.one);
    }
    // another, (maybe more readable?) version:
    /*
    let totalProduct:U = Constants.one;
    let p3 = cdr(p1)
    while (iscons(p3)) {
  
      let p4: U = cdr(p2)
  
      if (iscons(p4)) {
        totalProduct = [...p4].reduce(
            ((acc: U, p: U) =>
                multiply(gcd(car(p3), p), acc))
            , totalProduct
        );
      }
  
      p3 = cdr(p3);
    }
  
    return totalProduct;
    */
}
function gcd_powers_with_same_base(base1, base2) {
    let exponent1, exponent2, p6;
    if (defs_1.ispower(base1)) {
        exponent1 = defs_1.caddr(base1); // exponent
        base1 = defs_1.cadr(base1); // base
    }
    else {
        exponent1 = defs_1.Constants.one;
    }
    if (defs_1.ispower(base2)) {
        exponent2 = defs_1.caddr(base2); // exponent
        base2 = defs_1.cadr(base2); // base
    }
    else {
        exponent2 = defs_1.Constants.one;
    }
    if (!misc_1.equal(base1, base2)) {
        return defs_1.Constants.one;
    }
    // are both exponents numerical?
    if (defs_1.isNumericAtom(exponent1) && defs_1.isNumericAtom(exponent2)) {
        const exponent = misc_1.lessp(exponent1, exponent2) ? exponent1 : exponent2;
        return power_1.power(base1, exponent);
    }
    // are the exponents multiples of eah other?
    let p5 = multiply_1.divide(exponent1, exponent2);
    if (defs_1.isNumericAtom(p5)) {
        // choose the smallest exponent
        p5 =
            defs_1.ismultiply(exponent1) && defs_1.isNumericAtom(defs_1.cadr(exponent1))
                ? defs_1.cadr(exponent1)
                : defs_1.Constants.one;
        p6 =
            defs_1.ismultiply(exponent2) && defs_1.isNumericAtom(defs_1.cadr(exponent2))
                ? defs_1.cadr(exponent2)
                : defs_1.Constants.one;
        const exponent = misc_1.lessp(p5, p6) ? exponent1 : exponent2;
        return power_1.power(base1, exponent);
    }
    p5 = add_1.subtract(exponent1, exponent2);
    if (!defs_1.isNumericAtom(p5)) {
        return defs_1.Constants.one;
    }
    // can't be equal because of test near beginning
    const exponent = is_1.isnegativenumber(p5) ? exponent1 : exponent2;
    return power_1.power(base1, exponent);
}
// in this case gcd is used as a composite function, i.e. gcd(gcd(gcd...
function gcd_sum_sum(p1, p2) {
    let p3, p4, p5, p6;
    if (misc_1.length(p1) !== misc_1.length(p2)) {
        return defs_1.Constants.one;
    }
    p3 = defs_1.iscons(p1) ? p1.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p1));
    p4 = defs_1.iscons(p2) ? p2.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p2));
    p5 = multiply_1.divide(p1, p3);
    p6 = multiply_1.divide(p2, p4);
    if (misc_1.equal(p5, p6)) {
        return multiply_1.multiply(p5, gcd(p3, p4));
    }
    return defs_1.Constants.one;
}
function gcd_sum(p) {
    return defs_1.iscons(p) ? p.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p));
}
function gcd_term_term(p1, p2) {
    if (!defs_1.iscons(p1) || !defs_1.iscons(p2)) {
        return defs_1.Constants.one;
    }
    return p1.tail().reduce((a, b) => {
        return p2.tail().reduce((x, y) => multiply_1.multiply(x, gcd(b, y)), a);
    }, defs_1.Constants.one);
}
function gcd_sum_product(p1, p2) {
    return defs_1.iscons(p1)
        ? p1.tail().reduce((a, b) => multiply_1.multiply(a, gcd(b, p2)), defs_1.Constants.one)
        : defs_1.Constants.one;
}
function gcd_product_sum(p1, p2) {
    return defs_1.iscons(p2)
        ? p2.tail().reduce((a, b) => multiply_1.multiply(a, gcd(p1, b)), defs_1.Constants.one)
        : defs_1.Constants.one;
}
