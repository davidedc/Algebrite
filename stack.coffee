#	 _______
#	|	| <- stack
#	|	|
#	|_______|
#	|	| <- stack + tos
#	|	|
#	|	|
#	|_______|
#	|	| <- frame
#	|_______|
#		  <- stack + TOS
#
#	The stack grows from low memory towards high memory. This is so that
#	multiple expressions can be pushed on the stack and then accessed as an
#	array.
#
#	The frame area holds local variables and grows from high memory towards
#	low memory. The frame area makes local variables visible to the garbage
#	collector.

#include "stdafx.h"
#include "defs.h"

# !!!!
# U **frame, *stack[TOS]
tos = 0

# p is a U
push = (p) ->
	if (stack + tos >= frame)
		stop("stack overflow")
	stack[tos++] = p

# returns a U
pop = ->
	if (tos == 0)
		stop("stack underflow")
	return stack[--tos]

# n is an integer
push_frame = (n) ->
	i = 0
	frame -= n
	if (frame < stack + tos)
		stop("frame overflow, circular reference?")
	for i in [0...n]
		frame[i] = symbol(NIL)

# n is an integer
pop_frame = (n) ->
	frame += n
	if (frame > stack + TOS)
		stop("frame underflow")

save = ->
	frame -= 10
	if (frame < stack + tos)
		stop("frame overflow, circular reference?")
	frame[0] = p0
	frame[1] = p1
	frame[2] = p2
	frame[3] = p3
	frame[4] = p4
	frame[5] = p5
	frame[6] = p6
	frame[7] = p7
	frame[8] = p8
	frame[9] = p9

restore = ->
	if (frame > stack + TOS - 10)
		stop("frame underflow")
	p0 = frame[0]
	p1 = frame[1]
	p2 = frame[2]
	p3 = frame[3]
	p4 = frame[4]
	p5 = frame[5]
	p6 = frame[6]
	p7 = frame[7]
	p8 = frame[8]
	p9 = frame[9]
	frame += 10

# Local U * is OK here because there is no functional path to the garbage collector.

swap = ->
	#U *p, *q
	# p and q are both Us
	p = pop()
	q = pop()
	push(p)
	push(q)

# Local U * is OK here because there is no functional path to the garbage collector.

dupl = ->
	#U *p
	p = pop()
	push(p)
	push(p)
