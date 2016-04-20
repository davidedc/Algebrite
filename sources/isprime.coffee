

Eval_isprime = ->
	push(cadr(p1))
	Eval()
	p1 = pop()
	if (isnonnegativeinteger(p1) && mprime(p1.q.a))
		push_integer(1)
	else
		push_integer(0)

