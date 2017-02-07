#-----------------------------------------------------------------------------
#
#	Hermite polynomial
#
#	Input:		tos-2		x	(can be a symbol or expr)
#
#			tos-1		n
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------



hermite = ->
	save()
	yyhermite()
	restore()

# uses the recurrence relation H(x,n+1)=2*x*H(x,n)-2*n*H(x,n-1)

#define X p1
#define N p2
#define Y p3
#define Y1 p4
#define Y0 p5

yyhermite = ->

	n = 0

	p2 = pop()
	p1 = pop()

	push(p2)
	n = pop_integer()

	if (n < 0 || isNaN(n))
		push_symbol(HERMITE)
		push(p1)
		push(p2)
		list(3)
		return

	if (issymbol(p1))
		yyhermite2(n)
	else
		p3 = p1;			# do this when X is an expr
		p1 = symbol(SECRETX)
		yyhermite2(n)
		p1 = p3
		push(symbol(SECRETX))
		push(p1)
		subst()
		Eval()

yyhermite2 = (n) ->
	i = 0

	push_integer(1)
	push_integer(0)

	p4 = pop()

	for i in [0...n]

		p5 = p4

		p4 = pop()

		push(p1)
		push(p4)
		multiply()

		push_integer(i)
		push(p5)
		multiply()

		subtract()

		push_integer(2)
		multiply()

