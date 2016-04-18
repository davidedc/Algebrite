# definite integral



#define F p2
#define X p3
#define A p4
#define B p5

Eval_defint = ->
	push(cadr(p1))
	Eval()
	p2 = pop()

	p1 = cddr(p1)

	while (iscons(p1))

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p3 = pop()

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p4 = pop()

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p5 = pop()

		push(p2)
		push(p3)
		integral()
		p2 = pop()

		push(p2)
		push(p3)
		push(p5)
		subst()
		Eval()

		push(p2)
		push(p3)
		push(p4)
		subst()
		Eval()

		subtract()
		p2 = pop()

	push(p2)


