

Eval_clearall = ->
	do_clearall()
	push(symbol(NIL))

do_clearall = ->
	if (test_flag == 0)
		clear_term()
	
	do_clearPatterns()
	clear_symbols()
	defn()
	codeGen = false

# clearall from application GUI code
clearall = ->
	run("clearall")

Eval_clear = ->
	p2 = cdr(p1)

	while (iscons(p2))
		variableToBeCleared = car(p2)
		#console.log variableToBeCleared + ""


		if (variableToBeCleared.k != SYM)
			stop("symbol error")

		#console.log "getting binding of " + p.toString()
		#if p.toString() == "aaa"
		#	debugger

		indexFound = symtab.indexOf(variableToBeCleared)
		symtab[indexFound].k = SYM
		symtab[indexFound].printname = ""
		binding[indexFound] = symtab[indexFound]
		isSymbolReclaimable[indexFound] = true


		p2 = cdr(p2)

	push(symbol(NIL))
