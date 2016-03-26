# Create a list from n things on the stack.

#include "stdafx.h"
#include "defs.h"

# n is an integer
list = (n) ->
	push(symbol(NIL));
	for i in [0...n]
		cons()
