

Eval_clear = ->
	if (test_flag == 0)
		clear_term()
	clear_symbols()
	defn()
	push(symbol(NIL))

# clear from application GUI code

clear = ->
	run("clear")
