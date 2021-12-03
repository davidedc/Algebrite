"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dupl = exports.swap = exports.restore = exports.save = exports.pop_n_items = exports.pop = exports.top = exports.moveTos = exports.push_all = exports.push = void 0;
const run_1 = require("./run");
const defs_1 = require("./defs");
//   _______
//  |  | <- stack
//  |  |
//  |_______|
//  |  | <- stack + tos
//  |  |
//  |  |
//  |_______|
//  |  | <- frame
//  |_______|
//      <- stack + TOS
//
//  The stack grows from low memory towards high memory. This is so that
//  multiple expressions can be pushed on the stack and then accessed as an
//  array.
//
//  The frame area holds local variables and grows from high memory towards
//  low memory. The frame area makes local variables visible to the garbage
//  collector.
// p is a U
let nil_symbols = 0;
// Push onto stack
function push(p) {
    if (p == null) {
        defs_1.breakpoint;
    }
    //console.log "pushing "
    //console.log print_list(p)
    if (p === defs_1.symbol(defs_1.NIL)) {
        nil_symbols++;
        if (defs_1.DEBUG) {
            console.log(`pushing symbol(NIL) #${nil_symbols}`);
        }
    }
    //if nil_symbols == 111
    //  breakpoint
    if (defs_1.defs.tos >= defs_1.defs.frame) {
        run_1.stop('stack overflow');
    }
    return (defs_1.defs.stack[defs_1.defs.tos++] = p);
}
exports.push = push;
/**
 * Temporary function to push an array of items onto the stack.
 * Useful when migrating a function to returning a U[], but its
 * caller still needs the items on the stack
 *
 * Destructive because the function producing the array is producing
 * a new array that will either be used as expected or pushed onto
 * the stack for compatibilty
 *
 * TODO: Delete when all functions are transitioned over to
 * normal arguments and outputs rather than using the stack
 *
 * Remaining Use: factorpoly.ts
 */
function push_all(items) {
    while (items.length > 0) {
        push(items.shift());
    }
}
exports.push_all = push_all;
// returns a U
function moveTos(stackPos) {
    if (defs_1.defs.tos <= stackPos) {
        // we are moving the stack pointer
        // "up" the stack (as if we were doing a push)
        defs_1.defs.tos = stackPos;
        return;
    }
    // we are moving the stack pointer
    // "down" the stack i.e. as if we were
    // doing a pop, we can zero-
    // out all the elements that we pass
    // so we can reclaim the memory
    while (defs_1.defs.tos > stackPos) {
        defs_1.defs.stack[defs_1.defs.tos] = null;
        defs_1.defs.tos--;
    }
}
exports.moveTos = moveTos;
function top() {
    return defs_1.defs.stack[defs_1.defs.tos - 1];
}
exports.top = top;
function pop() {
    //popsNum++
    //console.log "pop #" + popsNum
    if (defs_1.defs.tos === 0) {
        defs_1.breakpoint;
        run_1.stop('stack underflow');
    }
    if (top() == null) {
        defs_1.breakpoint;
    }
    const elementToBeReturned = defs_1.defs.stack[--defs_1.defs.tos];
    // give a chance to the garbage
    // collection to reclaim space
    // This is JS-specific, it would
    // actually make the C garbage
    // collector useless.
    defs_1.defs.stack[defs_1.defs.tos] = null;
    return elementToBeReturned;
}
exports.pop = pop;
/**
 * Temporary function to get n items off the stack at runtime.
 *
 * TODO: Delete when all functions are transitioned over to
 * normal arguments and outputs rather than using the stack
 *
 * Remaining Use: list.ts, multiply.ts
 */
function pop_n_items(n) {
    const items = [];
    for (let i = 0; i < n; i++) {
        items.push(pop());
    }
    return items;
}
exports.pop_n_items = pop_n_items;
function save() {
    let p0, p1, p2, p3, p4, p5, p6, p7, p8, p9;
    defs_1.defs.frame -= 10;
    if (defs_1.defs.frame < defs_1.defs.tos) {
        defs_1.breakpoint;
        run_1.stop('frame overflow, circular reference?');
    }
    defs_1.defs.stack[defs_1.defs.frame + 0] = p0;
    defs_1.defs.stack[defs_1.defs.frame + 1] = p1;
    defs_1.defs.stack[defs_1.defs.frame + 2] = p2;
    defs_1.defs.stack[defs_1.defs.frame + 3] = p3;
    defs_1.defs.stack[defs_1.defs.frame + 4] = p4;
    defs_1.defs.stack[defs_1.defs.frame + 5] = p5;
    defs_1.defs.stack[defs_1.defs.frame + 6] = p6;
    defs_1.defs.stack[defs_1.defs.frame + 7] = p7;
    defs_1.defs.stack[defs_1.defs.frame + 8] = p8;
    defs_1.defs.stack[defs_1.defs.frame + 9] = p9;
}
exports.save = save;
function restore() {
    let p0, p1, p2, p3, p4, p5, p6, p7, p8, p9;
    if (defs_1.defs.frame > defs_1.TOS - 10) {
        run_1.stop('frame underflow');
    }
    p0 = defs_1.defs.stack[defs_1.defs.frame + 0];
    p1 = defs_1.defs.stack[defs_1.defs.frame + 1];
    p2 = defs_1.defs.stack[defs_1.defs.frame + 2];
    p3 = defs_1.defs.stack[defs_1.defs.frame + 3];
    p4 = defs_1.defs.stack[defs_1.defs.frame + 4];
    p5 = defs_1.defs.stack[defs_1.defs.frame + 5];
    p6 = defs_1.defs.stack[defs_1.defs.frame + 6];
    p7 = defs_1.defs.stack[defs_1.defs.frame + 7];
    p8 = defs_1.defs.stack[defs_1.defs.frame + 8];
    p9 = defs_1.defs.stack[defs_1.defs.frame + 9];
    return (defs_1.defs.frame += 10);
}
exports.restore = restore;
// Local U * is OK here because there is no functional path to the garbage collector.
function swap() {
    //U *p, *q
    const p = pop();
    const q = pop();
    push(p);
    push(q);
}
exports.swap = swap;
// Local U * is OK here because there is no functional path to the garbage collector.
function dupl() {
    //U *p
    const p = pop();
    push(p);
    return push(p);
}
exports.dupl = dupl;
