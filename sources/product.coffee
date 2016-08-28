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

	# 1st arg (quoted)

	p6 = cadr(p1)
	if (!issymbol(p6))
		stop("product: 1st arg?")

	# 2nd arg

	push(caddr(p1))
	Eval()
	j = pop_integer()
	if (j == 0x80000000)
		stop("product: 2nd arg?")

	# 3rd arg

	push(cadddr(p1))
	Eval()
	k = pop_integer()
	if (k == 0x80000000)
		stop("product: 3rd arg?")

	# 4th arg

	p1 = caddddr(p1)

	# remember contents of the index
	# variable so we can put it back after the loop
	p4 = get_binding(p6)

	push_integer(1)

	for i in [j..k]
		push_integer(i)
		p5 = pop()
		set_binding(p6, p5)
		push(p1)
		Eval()
		multiply()

	# put back the index variable to original content
	set_binding(p6, p4)
