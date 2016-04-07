###
 Laguerre function

Example

	laguerre(x,3)

Result

	   1   3    3   2
	- --- x  + --- x  - 3 x + 1
	   6        2

The computation uses the following recurrence relation.

	L(x,0,k) = 1

	L(x,1,k) = -x + k + 1

	n*L(x,n,k) = (2*(n-1)+1-x+k)*L(x,n-1,k) - (n-1+k)*L(x,n-2,k)

In the "for" loop i = n-1 so the recurrence relation becomes

	(i+1)*L(x,n,k) = (2*i+1-x+k)*L(x,n-1,k) - (i+k)*L(x,n-2,k)
###



Eval_laguerre = ->
	# 1st arg

	push(cadr(p1))
	Eval()

	# 2nd arg

	push(caddr(p1))
	Eval()

	# 3rd arg

	push(cadddr(p1))
	Eval()

	p2 = pop()
	if (p2 == symbol(NIL))
		push_integer(0)
	else
		push(p2)

	laguerre()

#define X p1
#define N p2
#define K p3
#define Y p4
#define Y0 p5
#define Y1 p6

laguerre = ->
	n = 0
	save()

	p3 = pop()
	p2 = pop()
	p1 = pop()

	push(p2)
	n = pop_integer()

	if (n < 0 || n == 0x80000000)
		push_symbol(LAGUERRE)
		push(p1)
		push(p2)
		push(p3)
		list(4)
		restore()
		return

	if (issymbol(p1))
		laguerre2(n)
	else
		p4 = p1;			# do this when p1 is an expr
		p1 = symbol(SECRETX)
		laguerre2(n)
		p1 = p4
		push(symbol(SECRETX))
		push(p1)
		subst()
		Eval()

	restore()

laguerre2 = (n) ->
	i = 0

	push_integer(1)
	push_integer(0)

	p6 = pop()

	for i in [0...n]

		p5 = p6

		p6 = pop()

		push_integer(2 * i + 1)
		push(p1)
		subtract()
		push(p3)
		add()
		push(p6)
		multiply()

		push_integer(i)
		push(p3)
		add()
		push(p5)
		multiply()

		subtract()

		push_integer(i + 1)
		divide()


test_laguerre = ->
	run_test [
		"laguerre(x,n)",
		"laguerre(x,n,0)",

		"laguerre(x,n,k)",
		"laguerre(x,n,k)",

		"laguerre(x,0)-1",
		"0",

		"laguerre(x,1)-(-x+1)",
		"0",

		"laguerre(x,2)-1/2*(x^2-4*x+2)",
		"0",

		"laguerre(x,3)-1/6*(-x^3+9*x^2-18*x+6)",
		"0",

		"laguerre(x,0,k)-1",
		"0",

		"laguerre(x,1,k)-(-x+k+1)",
		"0",

		"laguerre(x,2,k)-1/2*(x^2-2*(k+2)*x+(k+1)*(k+2))",
		"0",

		"laguerre(x,3,k)-1/6*(-x^3+3*(k+3)*x^2-3*(k+2)*(k+3)*x+(k+1)*(k+2)*(k+3))",
		"0",

		"laguerre(a-b,10)-eval(subst(a-b,x,laguerre(x,10)))",
		"0",
	]