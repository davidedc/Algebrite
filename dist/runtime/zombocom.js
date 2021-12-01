"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.parse = void 0;
const run_1 = require("./run");
const stack_1 = require("./stack");
const bignum_1 = require("../sources/bignum");
const list_1 = require("../sources/list");
const scan_1 = require("../sources/scan");
const defs_1 = require("./defs");
const init_1 = require("./init");
const symbol_1 = require("./symbol");
if (!defs_1.defs.inited) {
    defs_1.defs.inited = true;
    init_1.init();
}
function parse_internal(argu) {
    if (typeof argu === 'string') {
        scan_1.scan(argu);
        // now its in the stack
    }
    else if (typeof argu === 'number') {
        if (argu % 1 === 0) {
            bignum_1.push_integer(argu);
        }
        else {
            bignum_1.push_double(argu);
        }
    }
    else if (argu instanceof defs_1.BaseAtom) {
        // hey look its a U
        stack_1.push(argu);
    }
    else {
        console.warn('unknown argument type', argu);
        stack_1.push(defs_1.symbol(defs_1.NIL));
    }
}
function parse(argu) {
    let data;
    try {
        parse_internal(argu);
        data = stack_1.pop();
        run_1.check_stack();
    }
    catch (error) {
        defs_1.reset_after_error();
        throw error;
    }
    return data;
}
exports.parse = parse;
// exec handles the running ia JS of all the algebrite
// functions. The function name is passed in "name" and
// the corresponding function is pushed at the top of the stack
function exec(name, ...argus) {
    let result;
    const fn = symbol_1.get_binding(symbol_1.usr_symbol(name));
    run_1.check_stack();
    stack_1.push(fn);
    for (let argu of Array.from(argus)) {
        parse_internal(argu);
    }
    list_1.list(1 + argus.length);
    const p1 = stack_1.pop();
    stack_1.push(p1);
    try {
        run_1.top_level_eval();
        result = stack_1.pop();
        run_1.check_stack();
    }
    catch (error) {
        defs_1.reset_after_error();
        throw error;
    }
    return result;
}
exports.exec = exec;
