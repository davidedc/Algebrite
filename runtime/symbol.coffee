# The symbol table is a simple array of struct U.



# put symbol at index n
Eval_symbolsinfo = ->
	symbolsinfoToBePrinted = symbolsinfo()

	if symbolsinfoToBePrinted != ""
		new_string(symbolsinfoToBePrinted)
	else
		push_symbol(NIL)

symbolsinfo = ->
	symbolsinfoToBePrinted = ""
	for i in [NIL+1...symtab.length]
		if symtab[i].printname == ""
			if isSymbolReclaimable[i] == false
				break
			else
				continue
		symtabi = symtab[i] + ""
		bindingi = (binding[i] + "").substring(0,4)
		symbolsinfoToBePrinted +=  "symbol: " + symtabi + " size: " + countsize(binding[i]) +  " value: " + bindingi + "...\n"
	return symbolsinfoToBePrinted



# s is a string, n is an int
# TODO: elsewhere when we create a symbol we
# rather prefer to create a new entry. Here we just
# reuse the existing one. If that can never be a problem
# then explain why, otherwise do create a new entry.
std_symbol = (s, n, latexPrint) ->
	p = symtab[n]
	if !p?
		debugger
	p.printname = s
	if latexPrint?
		p.latexPrint = latexPrint
	else
		p.latexPrint = s

# symbol lookup, or symbol creation if symbol doesn't exist yet
# this happens often from the scanner. When the scanner sees something
# like myVar = 2, it create a tree (SETQ ("myVar" symbol as created/looked up here (2)))
# user-defined functions also have a usr symbol.
#
# Note that some symbols like, say, "abs",
# are picked up by the scanner directly as keywords,
# so they are not looked up via this.
# So in fact you could redefine abs to be abs(x) = x
# but still abs would be picked up by the scanner as a particular
# node type and calls to abs() will be always to the "native" abs
#
# Also note that some symbols such as "zero" are (strangely) not picked up by
# the scanner as special nodes, rather they are identified as keywords
# (e.g. not redefinable) at time of symbol lookup (in Eval_sym) and
# evalled, where eval has a case for ZERO.
#
# Also note that there are a number of symbols, such as a,b,c,x,y,z,...
# that are actually created by std_symbols.
# They are not special node types (like abs), they are normal symbols
# that are looked up, but the advantage is that since they are often
# used internally by algebrite, we create the symbol in advance and
# we can reference the symbol entry in a clean way
# (e.g. symbol(SYMBOL_X)) rather than
# by looking up a string.

# s is a string
usr_symbol = (s) ->

	#console.log "usr_symbol of " + s
	#if s == "aaa"
	#	debugger

	# find either the existing symbol, or if we
	# reach an empty symbol (printname == "") then
	# re-use that location.
	i = 0
	for i in [0...NSYM]
		if (symtab[i].printname == "")
			# found an entry in the symbol table
			# with no printname
			break
		if (s == symtab[i].printname)
			return symtab[i]
	if (i == NSYM)
		stop("symbol table overflow")


	symtab[i] =  new U()
	symtab[i].k = SYM
	symtab[i].printname = s
	# say that we just created the symbol
	# then, binding[the new symbol entry]
	# by default points to the symbol.
	# So the value of an unassigned symbol will
	# be just its name.
	binding[i] = symtab[i]
	isSymbolReclaimable[i] = false

	return symtab[i]

# get the symbol's printname

# p is a U
get_printname = (p) ->
	if (p.k != SYM)
		stop("symbol error")
	return p.printname


# p and q are both U
# there are two Us at play here. One belongs to the
# symtab array and is the variable name.
# The other one is the U with the content, and that
# one will go in the corresponding "binding" array entry.
set_binding = (p, q) ->
	if (p.k != SYM)
		stop("symbol error")


	#console.log "setting binding of " + p.toString() + " to: " + q.toString()
	#if p.toString() == "aaa"
	#	debugger

	indexFound = symtab.indexOf(p)
	###
	if indexFound == -1
		debugger
		for i in [0...symtab.length]
			if p.printname == symtab[i].printname
				indexFound = i
				console.log "remedied an index not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
				break
	###

	if symtab.indexOf(p, indexFound + 1) != -1
		console.log("ops, more than one element!")
		debugger
	if DEBUG then console.log("lookup >> set_binding lookup " + indexFound)
	isSymbolReclaimable[indexFound] = false
	binding[indexFound] = q

# p is a U
get_binding = (p) ->
	if (p.k != SYM)
		stop("symbol error")

	#console.log "getting binding of " + p.toString()
	#if p.toString() == "aaa"
	#	debugger

	indexFound = symtab.indexOf(p)
	###
	if indexFound == -1
		debugger
		for i in [0...symtab.length]
			if p.printname == symtab[i].printname
				indexFound = i
				console.log "remedied an index not found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
				break
	###

	if symtab.indexOf(p, indexFound + 1) != -1
		console.log("ops, more than one element!")
		debugger
	if DEBUG then console.log("lookup >> get_binding lookup " + indexFound)
	#if indexFound == 139
	#	debugger
	#if indexFound == 137
	#	debugger
	return binding[indexFound]

# the concept of user symbol is a little fuzzy
# beucase mathematics is full of symbols that actually
# have a special meaning, e.g. e,i,I in some cases j...
is_usr_symbol = (p) ->
	if (p.k != SYM)
		return false
	theSymnum = symnum(p)
	# see "defs" file for the naming of the symbols
	if theSymnum > PI and theSymnum != SYMBOL_I and theSymnum != SYMBOL_IDENTITY_MATRIX
		return true
	return false

# get symbol's number from ptr
# p is U
lookupsTotal = 0
symnum = (p) ->
	lookupsTotal++
	if (p.k != SYM)
		stop("symbol error")
	indexFound = symtab.indexOf(p)
	if symtab.indexOf(p, indexFound + 1) != -1
		console.log("ops, more than one element!")
		debugger
	if DEBUG then console.log("lookup >> symnum lookup " + indexFound + " lookup # " + lookupsTotal)
	#if lookupsTotal == 21
	#	debugger
	#if indexFound == 79
	#	debugger
	return indexFound

# push indexed symbol

# k is an int
push_symbol = (k) ->
	push(symtab[k])

clear_symbols = ->
	# we can clear just what's assignable.
	# everything before NIL is not assignable,
	# so there is no need to clear it.
	for i in [NIL+1...NSYM]

		# stop at the first empty
		# entry that is not reclaimable
		if symtab[i].printname == ""
			if isSymbolReclaimable[i] == false
				break
			else
				continue

		symtab[i] =  new U()
		symtab[i].k = SYM
		binding[i] = symtab[i]
		isSymbolReclaimable[i] = false
		#symtab[i].printname = ""
		#binding[i] = symtab[i]


# collect all the variables in a tree
collectUserSymbols = (p, accumulator = []) ->

	if is_usr_symbol(p)
		if accumulator.indexOf(p) == -1
			accumulator.push p
			return

	if (istensor(p))
		for i in [0...p.tensor.nelem]
			collectUserSymbols p.tensor.elem[i], accumulator
		return

	while (iscons(p))
		collectUserSymbols(car(p), accumulator)
		p = cdr(p)

	return

$.get_binding = get_binding
$.set_binding = set_binding
$.usr_symbol = usr_symbol
$.symbolsinfo = symbolsinfo
$.collectUserSymbols = collectUserSymbols
