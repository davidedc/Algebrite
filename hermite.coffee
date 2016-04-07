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

	if (n < 0 || n == 0x80000000)
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

test_hermite = ->
	run_test [
		"hermite(x,n)",
		"hermite(x,n)",

		"hermite(x,0)-1",
		"0",

		"hermite(x,1)-2*x",
		"0",

		"hermite(x,2)-(4*x^2-2)",
		"0",

		"hermite(x,3)-(8*x^3-12*x)",
		"0",

		"hermite(x,4)-(16*x^4-48*x^2+12)",
		"0",

		"hermite(x,5)-(32*x^5-160*x^3+120*x)",
		"0",

		"hermite(x,6)-(64*x^6-480*x^4+720*x^2-120)",
		"0",

		"hermite(x,7)-(128*x^7-1344*x^5+3360*x^3-1680*x)",
		"0",

		"hermite(x,8)-(256*x^8-3584*x^6+13440*x^4-13440*x^2+1680)",
		"0",

		"hermite(x,9)-(512*x^9-9216*x^7+48384*x^5-80640*x^3+30240*x)",
		"0",

		"hermite(x,10)-(1024*x^10-23040*x^8+161280*x^6-403200*x^4+302400*x^2-30240)",
		"0",

		"hermite(a-b,10)-eval(subst(a-b,x,hermite(x,10)))",
		"0",
	]