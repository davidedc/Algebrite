import { stop } from './run';
import { pop, push } from './stack';
import { list } from '../sources/list';
import { print_list } from '../sources/print';
import {
  binding,
  Constants,
  DEBUG,
  defs,
  isSymbolReclaimable,
  NIL,
  Num,
  Sym,
  symtab,
  U,
} from './defs';
type FrozenState = [Sym[], U[], U[], Num, Num, U, string?];

function freeze(): FrozenState {
  const frozenSymbols: Sym[] = [];
  const frozenContents: U[] = [];
  let frozenPatterns: U[] = [];
  const frozenHash = '';

  for (let i = 0; i < symtab.length; i++) {
    //if symtab[i].printname == ""
    //  if isSymbolReclaimable[i] == false
    //    break
    //  else
    //    continue
    if (isSymbolReclaimable[i] === false) {
      frozenSymbols.push(symtab[i]);
      frozenContents.push(binding[i]);
    }
  }

  // just clone them
  frozenPatterns = defs.userSimplificationsInListForm.slice(0);

  return [
    frozenSymbols,
    frozenContents,
    frozenPatterns,
    Constants.zero,
    Constants.one,
    Constants.imaginaryunit,
    getStateHash(),
  ];
}

function unfreeze(frozen: FrozenState) {
  let frozenContents: U[],
    frozenPatterns: U[],
    frozenSymbols: Sym[],
    zero: Num,
    one: Num;
  [
    frozenSymbols,
    frozenContents,
    frozenPatterns,
    zero,
    one,
    Constants.imaginaryunit,
  ] = Array.from(frozen) as FrozenState;

  //clear_symbols()
  for (let i = 0; i < frozenSymbols.length; i++) {
    symtab[i] = frozenSymbols[i];
    binding[i] = frozenContents[i];
  }

  return (defs.userSimplificationsInListForm = frozenPatterns.slice(0));
}

function compareState(previousHash: string): boolean {
  const frozenHash = getStateHash();
  return frozenHash === previousHash;
}

function getStateHash() {
  let frozenHash = '';

  for (let i = NIL + 1; i < symtab.length; i++) {
    if (symtab[i].printname === '') {
      if (isSymbolReclaimable[i] === false) {
        break;
      } else {
        continue;
      }
    }

    const symtabi = print_list(symtab[i]);
    const bindingi = print_list(binding[i]);

    frozenHash += ' //' + symtabi + ' : ' + bindingi;
  }

  for (const i of Array.from(defs.userSimplificationsInListForm)) {
    frozenHash += ' pattern: ' + i;
  }

  if (DEBUG) {
    console.log(`frozenHash: ${frozenHash}`);
  }
  return frozenHash;
}
