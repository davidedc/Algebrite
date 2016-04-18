# Bignum addition and subtraction



#static unsigned int *addf(unsigned int *, unsigned int *)
#static unsigned int *subf(unsigned int *, unsigned int *)
#static int ucmp(unsigned int *, unsigned int *)

madd = (a, b) ->

	return a.add b

msub = (a, b) ->
	return a.subtract b

addf = (a, b) ->

	return a.add b

subf = (a, b) ->
	return a.subtract b

# unsigned compare

ucmp = (a,b) ->
	return a.compareAbs b

