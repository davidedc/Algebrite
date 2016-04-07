###
 Convert complex z to clock form

	Input:		push	z

	Output:		Result on stack

	clock(z) = mag(z) * (-1) ^ (arg(z) / pi)

	For example, clock(exp(i pi/3)) gives the result (-1)^(1/3)
###



Eval_clock = ->
	push(cadr(p1))
	Eval()
	clockform()

clockform = ->
	save()
	#if 1
	p1 = pop()
	push(p1)
	mag()
	push_integer(-1)
	push(p1)
	arg()
	push(symbol(PI))
	divide()
	power()
	multiply()
	#else
	###
	p1 = pop()
	push(p1)
	mag()
	push(symbol(E))
	push(p1)
	arg()
	push(imaginaryunit)
	multiply()
	power()
	multiply()
	###
	#endif
	restore()



test_clock = ->
	run_test [

		"clock(exp(i pi/3))",
		"(-1)^(1/3)",

		"clock(exp(-i pi/3))",
		"-(-1)^(2/3)",

		"rect(clock(3+4*i))",	# needs sin(arctan(x)) and cos(arctan(x))
		"3+4*i",
	]
