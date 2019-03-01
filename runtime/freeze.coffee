
freeze = ->

  frozenSymbols = []
  frozenContents = []
  frozenPatterns = []
  frozenHash = ""

  for i in [0...symtab.length]
    #if symtab[i].printname == ""
    #  if isSymbolReclaimable[i] == false
    #    break
    #  else
    #    continue
    if isSymbolReclaimable[i] == false
      frozenSymbols.push symtab[i]
      frozenContents.push binding[i]

  # just clone them
  frozenPatterns= userSimplificationsInListForm.slice(0)

  return [frozenSymbols, frozenContents, frozenPatterns, zero, one, imaginaryunit, getStateHash()]

unfreeze = (frozen) ->
  [frozenSymbols, frozenContents, frozenPatterns, zero, one, imaginaryunit ] = frozen

  #clear_symbols()

  for i in [0...frozenSymbols.length]
    symtab[i] = frozenSymbols[i]
    binding[i] = frozenContents[i]

  userSimplificationsInListForm = frozenPatterns.slice(0)


compareState = (previousHash) ->

  frozenHash = getStateHash()

  if frozenHash == previousHash
    return true
  else
    return false

getStateHash = ->
  frozenHash = ""

  for i in [NIL+1...symtab.length]
    if symtab[i].printname == ""
      if isSymbolReclaimable[i] == false
        break
      else
        continue

    symtabi = print_list(symtab[i])
    bindingi = print_list(binding[i])

    frozenHash += " //" + symtabi + " : " + bindingi

  for i in userSimplificationsInListForm
    frozenHash +=  " pattern: " + i


  if DEBUG then console.log "frozenHash: " + frozenHash
  return frozenHash
