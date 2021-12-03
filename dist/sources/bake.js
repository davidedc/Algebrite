"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polyform = exports.bake = void 0;
const defs_1 = require("../runtime/defs");
const bignum_1 = require("./bignum");
const coeff_1 = require("./coeff");
const is_1 = require("./is");
const list_1 = require("./list");
function bake(p1) {
    return defs_1.doexpand(_bake, p1);
}
exports.bake = bake;
function _bake(p1) {
    const s = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_S));
    const t = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_T));
    const x = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_X));
    const y = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_Y));
    const z = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_Z));
    let result;
    if (s && !t && !x && !y && !z) {
        result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_S));
    }
    else if (!s && t && !x && !y && !z) {
        result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_T));
    }
    else if (!s && !t && x && !y && !z) {
        result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_X));
    }
    else if (!s && !t && !x && y && !z) {
        result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_Y));
    }
    else if (!s && !t && !x && !y && z) {
        result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_Z));
        // don't bake the contents of some constructs such as "for"
        // because we don't want to evaluate the body of
        // such constructs "statically", i.e. without fully running
        // the loops.
    }
    else if (defs_1.iscons(p1) && defs_1.car(p1) !== defs_1.symbol(defs_1.FOR)) {
        result = list_1.makeList(defs_1.car(p1), ...p1.tail().map(bake));
    }
    else {
        result = p1;
    }
    return result;
}
function polyform(p1, p2) {
    if (is_1.ispolyexpandedform(p1, p2)) {
        return bake_poly(p1, p2);
    }
    if (defs_1.iscons(p1)) {
        return list_1.makeList(defs_1.car(p1), ...p1.tail().map((el) => polyform(el, p2)));
    }
    return p1;
}
exports.polyform = polyform;
function bake_poly(poly, x) {
    const k = coeff_1.coeff(poly, x);
    const result = [];
    for (let i = k.length - 1; i >= 0; i--) {
        const term = k[i];
        result.push(...bake_poly_term(i, term, x));
    }
    if (result.length > 1) {
        return new defs_1.Cons(defs_1.symbol(defs_1.ADD), list_1.makeList(...result));
    }
    return result[0];
}
// p1 points to coefficient of p2 ^ k
// k is an int
function bake_poly_term(k, coefficient, term) {
    if (is_1.isZeroAtomOrTensor(coefficient)) {
        return [];
    }
    // constant term?
    if (k === 0) {
        if (defs_1.isadd(coefficient)) {
            return coefficient.tail();
        }
        return [coefficient];
    }
    const result = [];
    // coefficient
    if (defs_1.ismultiply(coefficient)) {
        result.push(...coefficient.tail());
    }
    else if (!is_1.equaln(coefficient, 1)) {
        result.push(coefficient);
    }
    // x ^ k
    if (k === 1) {
        result.push(term);
    }
    else {
        result.push(list_1.makeList(defs_1.symbol(defs_1.POWER), term, bignum_1.integer(k)));
    }
    if (result.length > 1) {
        return [list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), ...result)];
    }
    return result;
}
