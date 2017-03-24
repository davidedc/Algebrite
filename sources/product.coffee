# 'product' function

#define A p3
#define B p4
#define I p5
#define X p6

# leaves the product at the top of the stack

Eval_product = ->
	i = 0
	j = 0
	k = 0

	# 1st arg
	body = cadr(p1)

	# 2nd arg (index)
	indexVariable = caddr(p1)
	if (!issymbol(p6))
		stop("sum: 1st arg?")

	# 3rd arg (lower limit)
	push(cadddr(p1))
	Eval()
	j = pop_integer()
	if (isNaN(j))
		push p1
		return

	# 4th arg (upper limit)
	push(caddddr(p1))
	Eval()
	k = pop_integer()
	if (isNaN(k))
		push p1
		return

	# remember contents of the index
	# variable so we can put it back after the loop
	oldIndexVariableValue = get_binding(indexVariable)

	push_integer(1)

	for i in [j..k]
		push_integer(i)
		p5 = pop()
		set_binding(indexVariable, p5)
		push(body)
		Eval()
		if DEBUG
			console.log "product - factor 1: " + stack[tos-1].toString()
			console.log "product - factor 2: " + stack[tos-2].toString()
		multiply()
		if DEBUG
			console.log "product - result: " + stack[tos-1].toString()

	# put back the index variable to original content
	set_binding(indexVariable, oldIndexVariableValue)
