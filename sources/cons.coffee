# Cons two things on the stack.



consCount = 0
cons = ->
	consCount++
	if DEBUG then console.log "cons tos: " + tos + " # " + consCount
	#if consCount == 444
	#	debugger
	# auto var ok, no opportunity for garbage collection after p = alloc()
	p = new U()
	p.k = CONS
	p.cons.cdr = pop()
	if p == p.cons.cdr
		debugger
		console.log "something wrong p == its cdr"

	p.cons.car = pop()


	###
	console.log "cons new cdr.k = " + p.cons.cdr.k + "\nor more in detail:"
	console.log print_list p.cons.cdr
	console.log "cons new car.k = " + p.cons.car.k + "\nor more in detail:"
	console.log print_list p.cons.car
	###

	push(p)
