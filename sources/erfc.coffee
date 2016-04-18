#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	erfc(x)
#
#	GW	Added erfc() from Numerical Recipes in C
#	
#-----------------------------------------------------------------------------



Eval_erfc = ->
	push(cadr(p1))
	Eval()
	yerfc()

yerfc = ->
	save()
	yyerfc()
	restore()

yyerfc = ->
	d = 0.0

	p1 = pop()

	if (isdouble(p1))
		d = erfc(p1.d)
		push_double(d)
		return

	push_symbol(ERFC)
	push(p1)
	list(2)
	return

# from Numerical Recipes in C

#ifndef LINUX
erfc = (x) ->
	t = 0.0
	z = 0.0
	ans = 0.0

	z = Math.abs(x)
	t = 1.0 / (1.0 + 0.5 * z)

	ans=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+
	t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+
	t*(-0.82215223+t*0.17087277)))))))))

	if x >= 0.0
		return ans
	else
		return 2.0-ans
#endif


###
	# commented-out test
	"float(erfc(1))",
	"0.157299",
###

