#-----------------------------------------------------------------------------
#
#	Look up the nth prime
#
#	Input:		n on stack (0 < n < 10001)
#
#	Output:		nth prime on stack
#
#-----------------------------------------------------------------------------

Eval_prime = ->
	push(cadr(p1))
	Eval()
	prime()

prime = ->
	n = 0
	n = pop_integer()
	if (n < 1 || n > MAXPRIMETAB)
		stop("prime: Argument out of range.")
	n = primetab[n - 1]
	push_integer(n)
