# Cons two things on the stack.

#include "stdafx.h"
#include "defs.h"

cons = ->
	console.log "cons tos: " + tos
	# auto var ok, no opportunity for garbage collection after p = alloc()
	p = new U();
	p.k = CONS;
	p.cons.cdr = pop();
	if p == p.cons.cdr
		debugger
		console.log "something wrong p == its cdr"
	#if p.cons.cdr == p.cons.cdr.cons.car
	#	debugger
	#	console.log "something wrong p == its cdr"
	#if p.cons.cdr == p.cons.cdr.cons.cdr
	#	debugger
	#	console.log "something wrong p == its cdr"

	p.cons.car = pop();

	#if p == p.cons.car
	#	debugger
	#	console.log "something wrong p == its car"
	#if p.cons.car == p.cons.car.cons.car
	#	debugger
	#	console.log "something wrong p == its car"
	#if p.cons.car == p.cons.car.cons.cdr
	#	debugger
	#	console.log "something wrong p == its car"

	console.log "cons new cdr.k = " + p.cons.cdr.k + "\nor more in detail:"
	print1 p.cons.cdr
	console.log "cons new car.k = " + p.cons.car.k + "\nor more in detail:"
	print1 p.cons.car
	push(p);
