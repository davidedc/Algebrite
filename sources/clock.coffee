###
 Convert complex z to clock form

	Input:		push	z

	Output:		Result on stack

	clock(z) = abs(z) * (-1) ^ (arg(z) / pi)

	For example, clock(exp(i pi/3)) gives the result (-1)^(1/3)
###

# P.S. I couldn't find independent definition/aknowledgment
# of the naming "clock form" anywhere on the web, seems like a
# naming specific to eigenmath.
# Clock form is another way to express a complex number, and
# it has three advantages
#   1) it's uniform with how for example
#      i is expressed i.e. (-1)^(1/2)
#   2) it's very compact
#   3) it's a straighforward notation for roots of 1 and -1


DEBUG_CLOCKFORM = false

Eval_clock = ->
	push(cadr(p1))
	Eval()
	clockform()

clockform = ->
	save()
	#if 1
	p1 = pop()
	push(p1)
	abs()
	if DEBUG_CLOCKFORM then console.log "clockform: abs of " + p1 + " : " + stack[tos-1]

	# pushing the expression (-1)^... but note
	# that we can't use "power", as "power" evaluates
	# clock forms into rectangular form (see "-1 ^ rational"
	# section in power)
	push_symbol(POWER)

	push_integer(-1)

	push(p1)
	arg()
	if DEBUG_CLOCKFORM then console.log "clockform: arg of " + p1 + " : " + stack[tos-1]
	if evaluatingAsFloats
		push_double(Math.PI)
	else
		push(symbol(PI))
	divide()
	if DEBUG_CLOCKFORM then console.log "clockform: divide : " + stack[tos-1]
	list(3)

	if DEBUG_CLOCKFORM then console.log "clockform: power : " + stack[tos-1]
	multiply()
	if DEBUG_CLOCKFORM then console.log "clockform: multiply : " + stack[tos-1]
	#else
	###
	p1 = pop()
	push(p1)
	abs()
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



