import {stop} from './run';
import {push} from './stack';
import {new_string} from '../sources/misc';
import {countsize} from './count';
import {BaseAtom, car, cdr, Cons, iscons, issymbol, istensor, NIL, Sym, SYM, U,} from './defs';

// The symbol table is a simple array of struct U.

// put symbol at index n
export function Eval_symbolsinfo() {
  const symbolsinfoToBePrinted = symbolsinfo();

  if (symbolsinfoToBePrinted !== '') {
    new_string(symbolsinfoToBePrinted);
  } else {
    push_symbol(NIL);
  }
}

function symbolsinfo() {
  return [...userScope.symbolinfo()].join('\n');
}

class Scope {
  private symbols = new Map<string, Sym>()
  private bindings = new Map<string, U>();

  constructor(private parent?:Scope) {}

  getOrCreate(name:string):Sym {
    const existing = this.getExisting(name);
    if (existing) return existing;
    const sym = new Sym(name);
    this.symbols.set(name, sym);
    return sym;
  }

  private getExisting(name:string):Sym|undefined {
    return this.parent?.getExisting(name) || this.symbols.get(name);
  }

  mustGet(name:string):Sym {
    return this.symbols.get(name) || this.parent?.mustGet(name) || stop(`${name} not defined`);
  }

  has(s:Sym):boolean {
    return this.symbols.has(s.printname);
  }

  binding(sym:Sym):U {
    return this.bindings.get(sym.printname) || this.parent?.binding(sym) || sym;
  }

  set(sym:Sym, value:U) {
    this.bindings.set(sym.printname, value);
  }

  clear() {
    this.bindings.clear();
  }

  delete(s:Sym) {
    this.symbols.delete(s.printname);
    this.bindings.delete(s.printname);
    this.parent?.delete(s);
  }

  *symbolinfo():Generator<string> {
    if (this.parent) {
      yield *this.parent.symbolinfo();
    }
    for (const [name, sym] of this.symbols.entries()) {
      const binding = this.bindings.get(name) || sym;
      const bindingi = (binding + '').substring(0, 4)
      yield `symbol: ${sym} size: ${countsize(binding)} value: ${bindingi}...`;
    }
  }

  clearRenamedVariablesToAvoidBindingToExternalScope() {
    for (const name of this.symbols.keys()) {
      if (name.indexOf('AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE') !== -1) {
        this.symbols.delete(name);
      }
    }
    for (const name of this.bindings.keys()) {
      if (name.indexOf('AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE') !== -1) {
        this.bindings.delete(name);
      }
    }
    this.parent?.clearRenamedVariablesToAvoidBindingToExternalScope();
  }
}

let keywordScope = new Scope();
let userScope = new Scope(keywordScope);

export function inChildScope<T>(f:()=>T):T{
  let savedScope = userScope;
  try {
    userScope = new Scope(userScope);
    return f();
  } finally {
    userScope = savedScope;
  }
}

export function std_symbol(s: string, keyword?:(p1:Cons)=>void) {
  // TODO: can we delete latexPrint?
  const sym = keywordScope.getOrCreate(s);
  sym.latexPrint = s;
  sym.keyword = keyword;
}

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
export function usr_symbol(s: string) {
  return userScope.getOrCreate(s);
}

// get the symbol's printname
export function get_printname(p: BaseAtom) {
  if (p.k !== SYM) {
    stop('symbol error');
  }
  return (p as Sym).printname;
}

// there are two Us at play here. One belongs to the
// symtab array and is the variable name.
// The other one is the U with the content, and that
// one will go in the corresponding "binding" array entry.
export function set_binding(p: U, q: U) {
  if (p.k !== SYM) {
    stop('symbol error');
  }
  userScope.set(p, q);
}

export function get_binding(p: U) {
  if (p.k !== SYM) {
    stop('symbol error');
  }
  return userScope.binding(p);
}

// the concept of user symbol is a little fuzzy
// beucase mathematics is full of symbols that actually
// have a special meaning, e.g. e,i,I in some cases j...
function is_usr_symbol(p: U): boolean {
  if (p.k !== SYM) {
    return false;
  }
  return /^[abcdjnrstxyz]_?$/.test(p.printname) || !keywordScope.has(p);
}

// push indexed symbol
export function push_symbol(k: string) {
  push(symbol(k));
}

// total clearout of symbol table
export function reset_symbols() {
  keywordScope = new Scope();
  userScope = new Scope(keywordScope);
}

export function clear_symbols() {
  userScope = new Scope(keywordScope);
  keywordScope.clear();
}

// collect all the variables in a tree
export function collectUserSymbols(p: U, accumulator: U[]) {
  if (accumulator == null) {
    accumulator = [];
  }
  if (is_usr_symbol(p)) {
    if (accumulator.indexOf(p) === -1) {
      accumulator.push(p);
      return;
    }
  }

  if (istensor(p)) {
    for (let i = 0; i < p.tensor.nelem; i++) {
      collectUserSymbols(p.tensor.elem[i], accumulator);
    }
    return;
  }

  while (iscons(p)) {
    collectUserSymbols(car(p), accumulator);
    p = cdr(p);
  }
}

export function symbol(name:string): Sym {
  // Should this just in the keywordScope?
  return userScope.mustGet(name);
}

export function iskeyword(p: U): boolean {
  return issymbol(p) && p.keyword != null;
} // this transformation is done in run.coffee, see there
// for more info.

export function clearRenamedVariablesToAvoidBindingToExternalScope() {
  userScope.clearRenamedVariablesToAvoidBindingToExternalScope();
}

export function clear_symbol(s:Sym) {
  userScope.delete(s);
}