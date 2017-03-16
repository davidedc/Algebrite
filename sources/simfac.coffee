###
 Simplify factorials

The following script

	F(n,k) = k binomial(n,k)
	(F(n,k) + F(n,k-1)) / F(n+1,k)

generates

       k! n!             n! (1 - k + n)!              k! n!
 -------------------- + -------------------- - ----------------------
 (-1 + k)! (1 + n)!     (1 + n)! (-k + n)!     k (-1 + k)! (1 + n)!

Simplify each term to get

    k       1 - k + n       1
 ------- + ----------- - -------
  1 + n       1 + n       1 + n

Then simplify the sum to get

    n
 -------
  1 + n

###



# simplify factorials term-by-term

Eval_simfac = ->
	push(cadr(p1))
	Eval()
	simfac()

#if 1

simfac = ->
	h = 0
	save()
	p1 = pop()
	if (car(p1) == symbol(ADD))
		h = tos
		p1 = cdr(p1)
		while (p1 != symbol(NIL))
			push(car(p1))
			simfac_term()
			p1 = cdr(p1)
		add_all(tos - h)
	else
		push(p1)
		simfac_term()
	restore()


#else
###
void
simfac(void)
{
	int h
	save()
	p1 = pop()
	if (car(p1) == symbol(ADD)) {
		h = tos
		p1 = cdr(p1)
		while (p1 != symbol(NIL)) {
			push(car(p1))
			simfac_term()
			p1 = cdr(p1)
		}
		addk(tos - h)
		p1 = pop()
		if (find(p1, symbol(FACTORIAL))) {
			push(p1)
			if (car(p1) == symbol(ADD)) {
				Condense()
				simfac_term()
			}
		}
	} else {
		push(p1)
		simfac_term()
	}
	restore()
}

#endif
###

simfac_term = ->
	h = 0

	save()

	p1 = pop()

	# if not a product of factors then done

	if (car(p1) != symbol(MULTIPLY))
		push(p1)
		restore()
		return

	# push all factors

	h = tos
	p1 = cdr(p1)
	while (p1 != symbol(NIL))
		push(car(p1))
		p1 = cdr(p1)

	# keep trying until no more to do

	while (yysimfac(h))
		doNothing = 1

	multiply_all_noexpand(tos - h)

	restore()

# try all pairs of factors

yysimfac = (h) ->
	i = 0
	j = 0

	for i in [h...tos]
		p1 = stack[i]
		for j in [h...tos]
			if (i == j)
				continue
			p2 = stack[j]

			#	n! / n		->	(n - 1)!

			if (car(p1) == symbol(FACTORIAL)\
			&& car(p2) == symbol(POWER)\
			&& isminusone(caddr(p2))\
			&& equal(cadr(p1), cadr(p2)))
				push(cadr(p1))
				push(one)
				subtract()
				factorial()
				stack[i] = pop()
				stack[j] = one
				return 1

			#	n / n!		->	1 / (n - 1)!

			if (car(p2) == symbol(POWER)\
			&& isminusone(caddr(p2))\
			&& caadr(p2) == symbol(FACTORIAL)\
			&& equal(p1, cadadr(p2)))
				push(p1)
				push_integer(-1)
				add()
				factorial()
				reciprocate()
				stack[i] = pop()
				stack[j] = one
				return 1

			#	(n + 1) n!	->	(n + 1)!

			if (car(p2) == symbol(FACTORIAL))
				push(p1)
				push(cadr(p2))
				subtract()
				p3 = pop()
				if (isplusone(p3))
					push(p1)
					factorial()
					stack[i] = pop()
					stack[j] = one
					return 1

			#	1 / ((n + 1) n!)	->	1 / (n + 1)!

			if (car(p1) == symbol(POWER)\
			&& isminusone(caddr(p1))\
			&& car(p2) == symbol(POWER)\
			&& isminusone(caddr(p2))\
			&& caadr(p2) == symbol(FACTORIAL))
				push(cadr(p1))
				push(cadr(cadr(p2)))
				subtract()
				p3 = pop()
				if (isplusone(p3))
					push(cadr(p1))
					factorial()
					reciprocate()
					stack[i] = pop()
					stack[j] = one
					return 1

			#	(n + 1)! / n!	->	n + 1

			#	n! / (n + 1)!	->	1 / (n + 1)

			if (car(p1) == symbol(FACTORIAL)\
			&& car(p2) == symbol(POWER)\
			&& isminusone(caddr(p2))\
			&& caadr(p2) == symbol(FACTORIAL))
				push(cadr(p1))
				push(cadr(cadr(p2)))
				subtract()
				p3 = pop()
				if (isplusone(p3))
					stack[i] = cadr(p1)
					stack[j] = one
					return 1
				if (isminusone(p3))
					push(cadr(cadr(p2)))
					reciprocate()
					stack[i] = pop()
					stack[j] = one
					return 1
				if (equaln(p3, 2))
					stack[i] = cadr(p1)
					push(cadr(p1))
					push_integer(-1)
					add()
					stack[j] = pop()
					return 1
				if (equaln(p3, -2))
					push(cadr(cadr(p2)))
					reciprocate()
					stack[i] = pop()
					push(cadr(cadr(p2)))
					push_integer(-1)
					add()
					reciprocate()
					stack[j] = pop()
					return 1
	return 0
