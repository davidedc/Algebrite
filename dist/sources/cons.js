"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cons = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
let consCount = 0;
// Cons two things on the stack.
function cons() {
    consCount++;
    if (defs_1.DEBUG) {
        console.log(`cons tos: ${defs_1.defs.tos} # ${consCount}`);
    }
    //if consCount == 444
    //  breakpoint
    // auto var ok, no opportunity for garbage collection after p = alloc()
    const cdr = stack_1.pop();
    const car = stack_1.pop();
    const p = new defs_1.Cons(car, cdr);
    /*
    console.log "cons new cdr.k = " + p.cons.cdr.k + "\nor more in detail:"
    console.log print_list p.cons.cdr
    console.log "cons new car.k = " + p.cons.car.k + "\nor more in detail:"
    console.log print_list p.cons.car
    */
    return stack_1.push(p);
}
exports.cons = cons;
