

Eval_clearall = ->
	if (test_flag == 0)
		clear_term()
	clear_symbols()
	defn()
	push(symbol(NIL))

# clearall from application GUI code

clearall = ->
	run("clearall")

