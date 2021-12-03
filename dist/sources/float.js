"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yyfloat = exports.zzfloat = exports.Eval_float = void 0;
const count_1 = require("../runtime/count");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const list_1 = require("./list");
const tensor_1 = require("./tensor");
function Eval_float(p1) {
    defs_1.evalFloats(() => {
        const result = eval_1.Eval(yyfloat(eval_1.Eval(defs_1.cadr(p1))));
        stack_1.push(result);
    });
}
exports.Eval_float = Eval_float;
function checkFloatHasWorkedOutCompletely(nodeToCheck) {
    const numberOfPowers = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.POWER), nodeToCheck);
    const numberOfPIs = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.PI), nodeToCheck);
    const numberOfEs = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.E), nodeToCheck);
    const numberOfMults = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.MULTIPLY), nodeToCheck);
    const numberOfSums = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.ADD), nodeToCheck);
    if (defs_1.DEBUG) {
        console.log(`     ... numberOfPowers: ${numberOfPowers}`);
        console.log(`     ... numberOfPIs: ${numberOfPIs}`);
        console.log(`     ... numberOfEs: ${numberOfEs}`);
        console.log(`     ... numberOfMults: ${numberOfMults}`);
        console.log(`     ... numberOfSums: ${numberOfSums}`);
    }
    if (numberOfPowers > 1 ||
        numberOfPIs > 0 ||
        numberOfEs > 0 ||
        numberOfMults > 1 ||
        numberOfSums > 1) {
        return run_1.stop('float: some unevalued parts in ' + nodeToCheck);
    }
}
function zzfloat(p1) {
    return defs_1.evalFloats(() => eval_1.Eval(yyfloat(eval_1.Eval(p1))));
}
exports.zzfloat = zzfloat;
// zzfloat doesn't necessarily result in a double
// , for example if there are variables. But
// in many of the tests there should be indeed
// a float, this line comes handy to highlight
// when that doesn't happen for those tests.
//checkFloatHasWorkedOutCompletely(stack[tos-1])
function yyfloat(p1) {
    return defs_1.evalFloats(yyfloat_, p1);
}
exports.yyfloat = yyfloat;
function yyfloat_(p1) {
    if (defs_1.iscons(p1)) {
        return list_1.makeList(...p1.map(yyfloat_));
    }
    if (defs_1.istensor(p1)) {
        p1 = tensor_1.copy_tensor(p1);
        p1.tensor.elem = p1.tensor.elem.map(yyfloat_);
        return p1;
    }
    if (defs_1.isrational(p1)) {
        return bignum_1.bignum_float(p1);
    }
    if (p1 === defs_1.symbol(defs_1.PI)) {
        return defs_1.Constants.piAsDouble;
    }
    if (p1 === defs_1.symbol(defs_1.E)) {
        return bignum_1.double(Math.E);
    }
    return p1;
}
