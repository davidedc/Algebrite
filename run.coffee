#include "stdafx.h"
#include "defs.h"

#jmp_buf stop_return, draw_stop_return

# s is a string here
stop = (s) ->
	#if (draw_flag == 2)
	#	longjmp(draw_stop_return, 1)
	#else
		errorMessage += "Stop: "
		errorMessage += s
		#debugger
		throw new Error(errorMessage)
		#longjmp(stop_return, 1)

# s a string here
inited = false
run = (stringToBeRun) ->

	stringToBeRun = stringToBeRun # + "\n"

	if stringToBeRun == "selftest"
		selftest()
		return

	#if (setjmp(stop_return))
	#	return

	if !inited
		inited = true
		init()

	i = 0
	n = 0
	indexOfPartRemainingToBeParsed = 0

	allReturnedStrings = ""
	while (1)

		try
			errorMessage = ""
			check_stack()
			n = scan(stringToBeRun.substring(indexOfPartRemainingToBeParsed))
			p1 = pop()
			check_stack()
		catch error
			if PRINTOUTRESULT then console.log error
			#debugger
			allReturnedStrings += error.message
			init()
			break



		if (n == 0)
			break

		# if debug mode then print the source text

		#if (equaln(get_binding(symbol(TRACE)), 1)) {
		#	for (i = 0 i < n i++)
		#		if (s[i] != '\r')
		#			printchar(s[i])
		#	if (s[n - 1] != '\n') # n is not zero, see above
		#		printchar('\n')
		#}

		indexOfPartRemainingToBeParsed += n

		push(p1)
		#debugger
		try
			top_level_eval()

			p2 = pop()
			check_stack()

			if (p2 == symbol(NIL))
				continue

			# print string w/o quotes

			if (isstr(p2))
				console.log(p2.str)
				console.log("\n")
				continue

			# in tty mode
			# also you could just have written 
			# printline(p2)
			collectedResult = collectResultLine(p2)
			allReturnedStrings += collectedResult
			if PRINTOUTRESULT
				console.log "printline"
				console.log collectedResult
			#alert collectedResult
			if PRINTOUTRESULT
				console.log "display:"
				display(p2)
			allReturnedStrings += "\n"
		catch error
			collectedResult = error.message
			if PRINTOUTRESULT then console.log collectedResult
			allReturnedStrings += collectedResult
			allReturnedStrings += "\n"
			init()

	if allReturnedStrings[allReturnedStrings.length-1] == "\n"
		allReturnedStrings = allReturnedStrings.substring(0,allReturnedStrings.length-1)
	return allReturnedStrings

check_stack = ->
	if (tos != 0)
		debugger
		stop("stack error")
	if (frame != TOS)
		debugger
		stop("frame error")

# cannot reference symbols yet

# s is a string here
echo_input = (s) ->
	console.log(s)
	console.log("\n")

# returns nil on stack if no result to print

top_level_eval = ->
	if DEBUG then console.log "#### top level eval"
	save()

	trigmode = 0

	p1 = symbol(AUTOEXPAND)

	if (iszero(get_binding(p1)))
		expanding = 0
	else
		expanding = 1

	p1 = pop()
	push(p1)
	Eval()
	p2 = pop()

	# "draw", "for" and "setq" return "nil", there is no result to print

	if (p2 == symbol(NIL))
		push(p2)
		restore()
		return

	# update "last"

	set_binding(symbol(LAST), p2)

	if (!iszero(get_binding(symbol(BAKE))))
		push(p2)
		bake()
		p2 = pop()

	# If we evaluated the symbol "i" or "j" and the result was sqrt(-1)

	# then don't do anything.

	# Otherwise if "j" is an imaginary unit then subst.

	# Otherwise if "i" is an imaginary unit then subst.

	if ((p1 == symbol(SYMBOL_I) || p1 == symbol(SYMBOL_J)) && isimaginaryunit(p2))
		doNothing = 0
	else if (isimaginaryunit(get_binding(symbol(SYMBOL_J))))
		push(p2)
		push(imaginaryunit)
		push_symbol(SYMBOL_J)
		subst()
		p2 = pop()
	else if (isimaginaryunit(get_binding(symbol(SYMBOL_I))))
		push(p2)
		push(imaginaryunit)
		push_symbol(SYMBOL_I)
		subst()
		p2 = pop()

	#ifndef LINUX ----------------------

	# if we evaluated the symbol "a" and got "b" then print "a=b"

	# do not print "a=a"

	#if (issymbol(p1) && !iskeyword(p1) && p1 != p2 && test_flag == 0)
	#	push_symbol(SETQ)
	#	push(p1)
	#	push(p2)
	#	list(3)
	#	p2 = pop()
	#endif -----------------------------

	push(p2)

	restore()

check_esc_flag = ->
	if (esc_flag)
		stop("esc key")
