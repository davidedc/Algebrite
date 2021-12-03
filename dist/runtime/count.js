"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countsize = exports.countOccurrencesOfSymbol = exports.count = void 0;
const misc_1 = require("../sources/misc");
const defs_1 = require("./defs");
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
function count(p) {
    let n;
    if (defs_1.iscons(p)) {
        const items = [...p];
        n = sum(items.map(count)) + items.length;
    }
    else {
        n = 1;
    }
    return n;
}
exports.count = count;
// this probably works out to be
// more general than just counting symbols, it can
// probably count instances of anything you pass as
// first argument but didn't try it.
function countOccurrencesOfSymbol(needle, p) {
    let n = 0;
    if (defs_1.iscons(p)) {
        n = sum([...p].map((el) => countOccurrencesOfSymbol(needle, el)));
    }
    else if (misc_1.equal(needle, p)) {
        n = 1;
    }
    return n;
}
exports.countOccurrencesOfSymbol = countOccurrencesOfSymbol;
// returns the total number of elements
// in an expression
function countsize(p) {
    let n = 0;
    if (defs_1.istensor(p)) {
        for (let i = 0; i < p.tensor.nelem; i++) {
            n += count(p.tensor.elem[i]);
        }
    }
    else if (defs_1.iscons(p)) {
        const items = [...p];
        n = sum(items.map(count)) + items.length;
    }
    else {
        n = 1;
    }
    return n;
}
exports.countsize = countsize;
