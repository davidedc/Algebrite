#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	Dirac function dirac(x)
#	dirac(-x)=dirac(x)
#  dirac(b-a)=dirac(a-b)
#-----------------------------------------------------------------------------



Eval_dirac = ->
	push(cadr(p1))
	Eval()
	dirac()

dirac = ->
	save()
	ydirac()
	restore()

#define p1 p1

ydirac = ->

	p1 = pop()


	
	if (isdouble(p1))
		if (p1.d == 0) 
			push_integer(1)
			return
		else 
			push_integer(0)
			return

	if (isrational(p1))
		if (MZERO(mmul(p1.q.a,p1.q.b))) 
			push_integer(1)
			return
		else 
			push_integer(0)
			return
		
	
	if (car(p1) == symbol(POWER))
		push_symbol(DIRAC)
		push(cadr(p1))
		list(2)
		return
	
	if (isnegativeterm(p1))
		push_symbol(DIRAC)
		push(p1)
		negate()
		list(2)
		return
	
	if (isnegativeterm(p1) || (car(p1) == symbol(ADD) && isnegativeterm(cadr(p1))))
		push(p1)
		negate()
		p1 = pop()
	
		 
	push_symbol(DIRAC)
	push(p1)
	list(2)

