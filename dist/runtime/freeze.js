"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const print_1 = require("../sources/print");
const defs_1 = require("./defs");
function freeze() {
    const frozenSymbols = [];
    const frozenContents = [];
    let frozenPatterns = [];
    const frozenHash = '';
    for (let i = 0; i < defs_1.symtab.length; i++) {
        //if symtab[i].printname == ""
        //  if isSymbolReclaimable[i] == false
        //    break
        //  else
        //    continue
        if (defs_1.isSymbolReclaimable[i] === false) {
            frozenSymbols.push(defs_1.symtab[i]);
            frozenContents.push(defs_1.binding[i]);
        }
    }
    // just clone them
    frozenPatterns = defs_1.defs.userSimplificationsInListForm.slice(0);
    return [
        frozenSymbols,
        frozenContents,
        frozenPatterns,
        defs_1.Constants.zero,
        defs_1.Constants.one,
        defs_1.Constants.imaginaryunit,
        getStateHash(),
    ];
}
function unfreeze(frozen) {
    let frozenContents, frozenPatterns, frozenSymbols, zero, one;
    [
        frozenSymbols,
        frozenContents,
        frozenPatterns,
        zero,
        one,
        defs_1.Constants.imaginaryunit,
    ] = Array.from(frozen);
    //clear_symbols()
    for (let i = 0; i < frozenSymbols.length; i++) {
        defs_1.symtab[i] = frozenSymbols[i];
        defs_1.binding[i] = frozenContents[i];
    }
    return (defs_1.defs.userSimplificationsInListForm = frozenPatterns.slice(0));
}
function compareState(previousHash) {
    const frozenHash = getStateHash();
    return frozenHash === previousHash;
}
function getStateHash() {
    let frozenHash = '';
    for (let i = defs_1.NIL + 1; i < defs_1.symtab.length; i++) {
        if (defs_1.symtab[i].printname === '') {
            if (defs_1.isSymbolReclaimable[i] === false) {
                break;
            }
            else {
                continue;
            }
        }
        const symtabi = print_1.print_list(defs_1.symtab[i]);
        const bindingi = print_1.print_list(defs_1.binding[i]);
        frozenHash += ' //' + symtabi + ' : ' + bindingi;
    }
    for (const i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
        frozenHash += ' pattern: ' + i;
    }
    if (defs_1.DEBUG) {
        console.log(`frozenHash: ${frozenHash}`);
    }
    return frozenHash;
}
