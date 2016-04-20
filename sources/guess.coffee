# Guess which symbol to use for derivative, integral, etc.



guess = ->
	p = pop()
	push(p)
	if (Find(p, symbol(SYMBOL_X)))
		push_symbol(SYMBOL_X)
	else if (Find(p, symbol(SYMBOL_Y)))
		push_symbol(SYMBOL_Y)
	else if (Find(p, symbol(SYMBOL_Z)))
		push_symbol(SYMBOL_Z)
	else if (Find(p, symbol(SYMBOL_T)))
		push_symbol(SYMBOL_T)
	else if (Find(p, symbol(SYMBOL_S)))
		push_symbol(SYMBOL_S)
	else
		push_symbol(SYMBOL_X)
