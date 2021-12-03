"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectUserSymbols = exports.clear_symbols = exports.push_symbol = exports.symnum = exports.get_binding = exports.set_binding = exports.get_printname = exports.usr_symbol = exports.std_symbol = exports.Eval_symbolsinfo = void 0;
const run_1 = require("./run");
const stack_1 = require("./stack");
const misc_1 = require("../sources/misc");
const count_1 = require("./count");
const defs_1 = require("./defs");
// The symbol table is a simple array of struct U.
// put symbol at index n
function Eval_symbolsinfo() {
    const symbolsinfoToBePrinted = symbolsinfo();
    if (symbolsinfoToBePrinted !== '') {
        misc_1.new_string(symbolsinfoToBePrinted);
    }
    else {
        push_symbol(defs_1.NIL);
    }
}
exports.Eval_symbolsinfo = Eval_symbolsinfo;
function symbolsinfo() {
    let symbolsinfoToBePrinted = '';
    for (let i = defs_1.NIL + 1; i < defs_1.symtab.length; i++) {
        if (defs_1.symtab[i].printname === '') {
            if (defs_1.isSymbolReclaimable[i] === false) {
                break;
            }
            else {
                continue;
            }
        }
        const symtabi = defs_1.symtab[i] + '';
        const bindingi = (defs_1.binding[i] + '').substring(0, 4);
        symbolsinfoToBePrinted +=
            'symbol: ' +
                symtabi +
                ' size: ' +
                count_1.countsize(defs_1.binding[i]) +
                ' value: ' +
                bindingi +
                '...\n';
    }
    return symbolsinfoToBePrinted;
}
// s is a string, n is an int
// TODO: elsewhere when we create a symbol we
// rather prefer to create a new entry. Here we just
// reuse the existing one. If that can never be a problem
// then explain why, otherwise do create a new entry.
function std_symbol(s, n, latexPrint) {
    const p = defs_1.symtab[n];
    if (p == null) {
        defs_1.breakpoint;
    }
    p.printname = s;
    if (latexPrint != null) {
        p.latexPrint = latexPrint;
    }
    else {
        p.latexPrint = s;
    }
}
exports.std_symbol = std_symbol;
// symbol lookup, or symbol creation if symbol doesn't exist yet
// this happens often from the scanner. When the scanner sees something
// like myVar = 2, it create a tree (SETQ ("myVar" symbol as created/looked up here (2)))
// user-defined functions also have a usr symbol.
//
// Note that some symbols like, say, "abs",
// are picked up by the scanner directly as keywords,
// so they are not looked up via this.
// So in fact you could redefine abs to be abs(x) = x
// but still abs would be picked up by the scanner as a particular
// node type and calls to abs() will be always to the "native" abs
//
// Also note that some symbols such as "zero" are (strangely) not picked up by
// the scanner as special nodes, rather they are identified as keywords
// (e.g. not redefinable) at time of symbol lookup (in Eval_sym) and
// evalled, where eval has a case for ZERO.
//
// Also note that there are a number of symbols, such as a,b,c,x,y,z,...
// that are actually created by std_symbols.
// They are not special node types (like abs), they are normal symbols
// that are looked up, but the advantage is that since they are often
// used internally by algebrite, we create the symbol in advance and
// we can reference the symbol entry in a clean way
// (e.g. symbol(SYMBOL_X)) rather than
// by looking up a string.
function usr_symbol(s) {
    let i = 0;
    for (i = 0; i < defs_1.NSYM; i++) {
        if (s === defs_1.symtab[i].printname) {
            // found the symbol
            return defs_1.symtab[i];
        }
        if (defs_1.symtab[i].printname === '') {
            // found an entry in the symbol table
            // with no printname, exit the loop
            // and re-use this location
            break;
        }
    }
    if (i === defs_1.NSYM) {
        run_1.stop('symbol table overflow');
    }
    defs_1.symtab[i] = new defs_1.Sym(s);
    // say that we just created the symbol
    // then, binding[the new symbol entry]
    // by default points to the symbol.
    // So the value of an unassigned symbol will
    // be just its name.
    defs_1.binding[i] = defs_1.symtab[i];
    defs_1.isSymbolReclaimable[i] = false;
    return defs_1.symtab[i];
}
exports.usr_symbol = usr_symbol;
// get the symbol's printname
function get_printname(p) {
    if (p.k !== defs_1.SYM) {
        run_1.stop('symbol error');
    }
    return p.printname;
}
exports.get_printname = get_printname;
// there are two Us at play here. One belongs to the
// symtab array and is the variable name.
// The other one is the U with the content, and that
// one will go in the corresponding "binding" array entry.
function set_binding(p, q) {
    if (p.k !== defs_1.SYM) {
        run_1.stop('symbol error');
    }
    //console.log "setting binding of " + p.toString() + " to: " + q.toString()
    //if p.toString() == "aaa"
    //  breakpoint
    const indexFound = defs_1.symtab.indexOf(p);
    /*
    if indexFound == -1
      breakpoint
      for i in [0...symtab.length]
        if p.printname == symtab[i].printname
          indexFound = i
          console.log "remedied an index not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
          break
    */
    if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
        console.log('ops, more than one element!');
        defs_1.breakpoint;
    }
    if (defs_1.DEBUG) {
        console.log(`lookup >> set_binding lookup ${indexFound}`);
    }
    defs_1.isSymbolReclaimable[indexFound] = false;
    defs_1.binding[indexFound] = q;
}
exports.set_binding = set_binding;
function get_binding(p) {
    if (p.k !== defs_1.SYM) {
        run_1.stop('symbol error');
    }
    //console.log "getting binding of " + p.toString()
    //if p.toString() == "aaa"
    //  breakpoint
    const indexFound = defs_1.symtab.indexOf(p);
    /*
    if indexFound == -1
      breakpoint
      for i in [0...symtab.length]
        if p.printname == symtab[i].printname
          indexFound = i
          console.log "remedied an index not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
          break
    */
    if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
        console.log('ops, more than one element!');
        defs_1.breakpoint;
    }
    if (defs_1.DEBUG) {
        console.log(`lookup >> get_binding lookup ${indexFound}`);
    }
    //if indexFound == 139
    //  breakpoint
    //if indexFound == 137
    //  breakpoint
    return defs_1.binding[indexFound];
}
exports.get_binding = get_binding;
// the concept of user symbol is a little fuzzy
// beucase mathematics is full of symbols that actually
// have a special meaning, e.g. e,i,I in some cases j...
function is_usr_symbol(p) {
    if (p.k !== defs_1.SYM) {
        return false;
    }
    const theSymnum = symnum(p);
    // see "defs" file for the naming of the symbols
    if (theSymnum > defs_1.PI &&
        theSymnum !== defs_1.SYMBOL_I &&
        theSymnum !== defs_1.SYMBOL_IDENTITY_MATRIX) {
        return true;
    }
    return false;
}
// get symbol's number from ptr
let lookupsTotal = 0;
function symnum(p) {
    lookupsTotal++;
    if (p.k !== defs_1.SYM) {
        run_1.stop('symbol error');
    }
    const indexFound = defs_1.symtab.indexOf(p);
    if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
        console.log('ops, more than one element!');
        defs_1.breakpoint;
    }
    if (defs_1.DEBUG) {
        console.log(`lookup >> symnum lookup ${indexFound} lookup # ${lookupsTotal}`);
    }
    //if lookupsTotal == 21
    //  breakpoint
    //if indexFound == 79
    //  breakpoint
    return indexFound;
}
exports.symnum = symnum;
// push indexed symbol
// k is an int
function push_symbol(k) {
    stack_1.push(defs_1.symtab[k]);
}
exports.push_symbol = push_symbol;
function clear_symbols() {
    // we can clear just what's assignable.
    // everything before NIL is not assignable,
    // so there is no need to clear it.
    for (let i = defs_1.NIL + 1; i < defs_1.NSYM; i++) {
        // stop at the first empty
        // entry that is not reclaimable
        if (defs_1.symtab[i].printname === '') {
            if (defs_1.isSymbolReclaimable[i] === false) {
                break;
            }
            else {
                continue;
            }
        }
        defs_1.symtab[i] = new defs_1.Sym('');
        defs_1.binding[i] = defs_1.symtab[i];
        defs_1.isSymbolReclaimable[i] = false;
    }
}
exports.clear_symbols = clear_symbols;
//symtab[i].printname = ""
//binding[i] = symtab[i]
// collect all the variables in a tree
function collectUserSymbols(p, accumulator) {
    if (accumulator == null) {
        accumulator = [];
    }
    if (is_usr_symbol(p)) {
        if (accumulator.indexOf(p) === -1) {
            accumulator.push(p);
            return;
        }
    }
    if (defs_1.istensor(p)) {
        for (let i = 0; i < p.tensor.nelem; i++) {
            collectUserSymbols(p.tensor.elem[i], accumulator);
        }
        return;
    }
    while (defs_1.iscons(p)) {
        collectUserSymbols(defs_1.car(p), accumulator);
        p = defs_1.cdr(p);
    }
}
exports.collectUserSymbols = collectUserSymbols;
