# Find the least common multiple of two expressions.



Eval_lcm = ->
	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		lcm()
		p1 = cdr(p1)

lcm = ->
	x = 0
	x = expanding
	save()
	yylcm()
	restore()
	expanding = x

yylcm = ->
	expanding = 1

	p2 = pop()
	p1 = pop()

	push(p1)
	push(p2)
	gcd()

	push(p1)
	divide()

	push(p2)
	divide()

	inverse()

