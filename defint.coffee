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


test_defint = ->
	run_test [
		"defint(x^2,y,0,sqrt(1-x^2),x,-1,1)",
		"1/8*pi",

		# from the eigenmath manual

		"z=2",
		"",

		"P=(x,y,z)",
		"",

		"a=abs(cross(d(P,x),d(P,y)))",
		"",

		"defint(a,y,-sqrt(1-x^2),sqrt(1-x^2),x,-1,1)",
		"pi",

		# from the eigenmath manual

		"z=x^2+2y",
		"",

		"P=(x,y,z)",
		"",

		"a=abs(cross(d(P,x),d(P,y)))",
		"",

		"defint(a,x,0,1,y,0,1)",
		"3/2+5/8*log(5)",

		# from the eigenmath manual

		"x=u*cos(v)",
		"",

		"y=u*sin(v)",
		"",

		"z=v",
		"",

		"S=(x,y,z)",
		"",

		"a=abs(cross(d(S,u),d(S,v)))",
		"",

		"defint(a,u,0,1,v,0,3pi)",
		"3/2*pi*log(1+2^(1/2))+3*pi/(2^(1/2))",
	]