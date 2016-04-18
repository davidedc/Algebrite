#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	sgn sign function
#
#
#-----------------------------------------------------------------------------



Eval_sgn = ->
	push(cadr(p1))
	Eval()
	sgn()

sgn = ->
	save()
	yysgn()
	restore()

#define X p1

yysgn = ->
	
	p1 = pop()

	
	if (isdouble(p1))
		if (p1.d > 0) 
			push_integer(1)
			return
		else 
			if (p1.d == 0) 
				push_integer(1)
				return
			else
				push_integer(-1)
				return

	if (isrational(p1))
		if (MSIGN(mmul(p1.q.a,p1.q.b)) == -1) 
			push_integer(-1)
			return
		else 
			if (MZERO(mmul(p1.q.a,p1.q.b))) 
				push_integer(0)
				return
			else
				push_integer(1)
				return

	if (iscomplexnumber(p1))
		push_integer(-1)
		push(p1)
		absval()
		power()
		push(p1)
		multiply()
		return
	
	
	if (isnegativeterm(p1))
		push_symbol(SGN)
		push(p1)
		negate()
		list(2)
		push_integer(-1)
		multiply()
		return
	
	###
	push_integer(2)
	push(p1)
	heaviside()
	multiply()
	push_integer(-1)
	add()
	###
	
	push_symbol(SGN)
	push(p1)
	list(2)


