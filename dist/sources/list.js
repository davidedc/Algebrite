"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeList = exports.list = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
// Create a list from n things on the stack.
// n is an integer
function list(n) {
    stack_1.push(defs_1.symbol(defs_1.NIL));
    for (let listIterator = 0; listIterator < n; listIterator++) {
        const arg2 = stack_1.pop();
        const arg1 = stack_1.pop();
        stack_1.push(new defs_1.Cons(arg1, arg2));
    }
}
exports.list = list;
// Convert an array into a CONS list.
function makeList(...items) {
    let node = defs_1.symbol(defs_1.NIL);
    for (let i = items.length - 1; i >= 0; i--) {
        node = new defs_1.Cons(items[i], node);
    }
    return node;
}
exports.makeList = makeList;
