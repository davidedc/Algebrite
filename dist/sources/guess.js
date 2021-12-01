"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guess = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
// Guess which symbol to use for derivative, integral, etc.
function guess(p) {
    if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_X))) {
        return defs_1.symbol(defs_1.SYMBOL_X);
    }
    else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Y))) {
        return defs_1.symbol(defs_1.SYMBOL_Y);
    }
    else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Z))) {
        return defs_1.symbol(defs_1.SYMBOL_Z);
    }
    else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_T))) {
        return defs_1.symbol(defs_1.SYMBOL_T);
    }
    else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_S))) {
        return defs_1.symbol(defs_1.SYMBOL_S);
    }
    else {
        return defs_1.symbol(defs_1.SYMBOL_X);
    }
}
exports.guess = guess;
