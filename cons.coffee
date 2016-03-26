# Cons two things on the stack.

#include "stdafx.h"
#include "defs.h"

cons = ->
	# auto var ok, no opportunity for garbage collection after p = alloc()
	p = new U();
	p.k = CONS;
	p.cons.cdr = pop();
	p.cons.car = pop();
	console.log "cons new cdr.k = " + p.cons.cdr.k
	console.log "cons new car.k = " + p.cons.car.k
	push(p);
