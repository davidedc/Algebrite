# 'for' function

###
x=0
y=2
for(k,1,9,x=sqrt(2+x),y=2*y/x)
float(y)

X: k
B: 1...9


###

#define A p3
#define B p4
#define I p5
#define X p6

Eval_for = ->
	i = 0
	j = 0
	k = 0

	# 1st arg (quoted)

	p6 = cadr(p1)
	if (!issymbol(p6))
		stop("for: 1st arg?")

	# 2nd arg

	push(caddr(p1))
	Eval()
	j = pop_integer()
	if (isNaN(j))
		stop("for: 2nd arg?")

	# 3rd arg

	push(cadddr(p1))
	Eval()
	k = pop_integer()
	if (isNaN(k))
		stop("for: 3rd arg?")

	# remaining args

	p1 = cddddr(p1)

	# remember contents of the index
	# variable so we can put it back after the loop
	p4 = get_binding(p6)

	for i in [j..k]
		push_integer(i)
		p5 = pop()
		set_binding(p6, p5)
		p2 = p1
		while (iscons(p2))
			push(car(p2))
			Eval()
			pop()
			p2 = cdr(p2)

	# put back the index variable to original content
	set_binding(p6, p4)

	# return value

	push_symbol(NIL)

