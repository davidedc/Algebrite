
cached_runs = new LRUCache(100, 60000 * 60 * 24 * 265)


freeze = ->

	frozenSymbols = []
	frozenContents = []
	frozenPatterns = []
	frozenHash = ""

	for i in [0...symtab.length]
		#if symtab[i].printname == ""
		#	if isSymbolReclaimable == false
		#		break
		#	else
		#		continue
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

resetCache = ->
	if cached_runs?
		cached_runs.reset()
		if DEBUG then console.log "resetting cache"


getStateHash = ->
	frozenHash = ""

	for i in [NIL+1...symtab.length]
		if symtab[i].printname == ""
			if isSymbolReclaimable == false
				break
			else
				continue

		symtabi = symtab[i] + ""
		bindingi = (binding[i] + "")

		frozenHash += " //" + symtabi + " : " + bindingi

	for i in userSimplificationsInListForm
		frozenHash +=  " pattern: " + i


	return frozenHash
