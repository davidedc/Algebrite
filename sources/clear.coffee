### clearall =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept


General description
-------------------

Completely wipes all variables from the environment.


###


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

# this transformation is done in run.coffee, see there
# for more info.
clearRenamedVariablesToAvoidBindingToExternalScope = ->
	for i in [0...symtab.length]
		if symtab[i].printname.indexOf("AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE") != -1
			# just clear it
			symtab[i].k = SYM
			symtab[i].printname = ""
			binding[i] = symtab[i]
			isSymbolReclaimable[i] = true

### clear =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Completely wipes a variable from the environment (while doing x = quote(x) just unassigns it).

###


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
