###
Taylor expansion of a function

	push(F)
	push(X)
	push(N)
	push(A)
	taylor()
###



Eval_taylor = ->
	# 1st arg

	p1 = cdr(p1)
	push(car(p1))
	Eval()

	# 2nd arg

	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p2 = pop()
	if (p2 == symbol(NIL))
		guess()
	else
		push(p2)

	# 3rd arg

	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p2 = pop()
	if (p2 == symbol(NIL))
		push_integer(24); # default number of terms
	else
		push(p2)

	# 4th arg

	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p2 = pop()
	if (p2 == symbol(NIL))
		push_integer(0); # default expansion point
	else
		push(p2)

	taylor()

#define F p1
#define X p2
#define N p3
#define A p4
#define C p5

taylor = ->
	i = 0
	k = 0

	save()

	p4 = pop()
	p3 = pop()
	p2 = pop()
	p1 = pop()

	push(p3)
	k = pop_integer()
	if (isNaN(k))
		push_symbol(TAYLOR)
		push(p1)
		push(p2)
		push(p3)
		push(p4)
		list(5)
		restore()
		return

	push(p1);	# f(a)
	push(p2)
	push(p4)
	subst()
	Eval()

	push_integer(1)
	p5 = pop()

	for i in [1..k]

		push(p1);	# f = f'
		push(p2)
		derivative()
		p1 = pop()

		if (iszero(p1))
			break

		push(p5);	# c = c * (x - a)
		push(p2)
		push(p4)
		subtract()
		multiply()
		p5 = pop()

		push(p1);	# f(a)
		push(p2)
		push(p4)
		subst()
		Eval()

		push(p5)
		multiply()
		push_integer(i)
		factorial()
		divide()

		add()

	restore()


