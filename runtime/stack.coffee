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



tos = 0

# p is a U
nil_symbols = 0
push = (p) ->
	if !p?
		debugger
	if p.isZero?
		debugger

	#console.log "pushing "
	#console.log print_list(p)

	if p == symbol(NIL)
		nil_symbols++
		if DEBUG then console.log "pushing symbol(NIL) #" + nil_symbols
		#if nil_symbols == 111
		#	debugger
	if (tos >= frame)
		stop("stack overflow")
	stack[tos++] = p

# returns a U

moveTos = (stackPos) ->
	if tos <= stackPos
		# we are moving the stack pointer
		# "up" the stack (as if we were doing a push)
		tos = stackPos
		return
	# we are moving the stack pointer
	# "down" the stack i.e. as if we were
	# doing a pop, we can zero-
	# out all the elements that we pass
	# so we can reclaim the memory
	while tos > stackPos
		stack[tos] = null
		tos--
	return

top = ->
	stack[tos-1]

pop = ->
	#popsNum++
	#console.log "pop #" + popsNum
	if (tos == 0)
		debugger
		stop("stack underflow")
	if !stack[tos-1]?
		debugger
	elementToBeReturned = stack[--tos]
	
	# give a chance to the garbage
	# collection to reclaim space
	# This is JS-specific, it would
	# actually make the C garbage
	# collector useless.
	stack[tos] = null
	
	return elementToBeReturned

# n is an integer
push_frame = (n) ->
	i = 0
	frame -= n
	if (frame < tos)
		debugger
		stop("frame overflow, circular reference?")
	for i in [0...n]
		stack[frame + i] = symbol(NIL)

# n is an integer
pop_frame = (n) ->
	frame += n
	if (frame > TOS)
		stop("frame underflow")

save = ->
	frame -= 10
	if (frame < tos)
		debugger
		stop("frame overflow, circular reference?")
	stack[frame + 0] = p0
	stack[frame + 1] = p1
	stack[frame + 2] = p2
	stack[frame + 3] = p3
	stack[frame + 4] = p4
	stack[frame + 5] = p5
	stack[frame + 6] = p6
	stack[frame + 7] = p7
	stack[frame + 8] = p8
	stack[frame + 9] = p9

restore = ->
	if (frame > TOS - 10)
		stop("frame underflow")
	p0 = stack[frame + 0]
	p1 = stack[frame + 1]
	p2 = stack[frame + 2]
	p3 = stack[frame + 3]
	p4 = stack[frame + 4]
	p5 = stack[frame + 5]
	p6 = stack[frame + 6]
	p7 = stack[frame + 7]
	p8 = stack[frame + 8]
	p9 = stack[frame + 9]
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

$.dupl = dupl
$.swap = swap
$.restore = restore
$.save = save
$.push = push
$.pop = pop
