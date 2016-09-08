

# p is a U
iszero = (p) ->
	i = 0
	switch (p.k)
		when NUM
			if (MZERO(p.q.a))
				return 1
		when DOUBLE
			if (p.d == 0.0)
				return 1
		when TENSOR
			for i in [0...p.tensor.nelem]
				if (!iszero(p.tensor.elem[i]))
					return 0
			return 1
	return 0

# p is a U
isnegativenumber = (p) ->
	switch (p.k)
		when NUM
			if (MSIGN(p.q.a) == -1)
				return 1
		when DOUBLE
			if (p.d < 0.0)
				return 1
	return 0

# p is a U
isplustwo = (p) ->
	switch (p.k)
		when NUM
			if (MEQUAL(p.q.a, 2) && MEQUAL(p.q.b, 1))
				return 1
		when DOUBLE
			if (p.d == 2.0)
				return 1
	return 0

# p is a U
isplusone = (p) ->
	switch (p.k)
		when NUM
			if (MEQUAL(p.q.a, 1) && MEQUAL(p.q.b, 1))
				return 1
		when DOUBLE
			if (p.d == 1.0)
				return 1
	return 0

isminusone = (p) ->
	switch (p.k)
		when NUM
			if (MEQUAL(p.q.a, -1) && MEQUAL(p.q.b, 1))
				return 1
		when DOUBLE
			if (p.d == -1.0)
				return 1
	return 0

isone = (p) ->
	return isplusone(p) or isminusone(p)

isinteger = (p) ->
	if (p.k == NUM && MEQUAL(p.q.b, 1))
		return 1
	else
		return 0

isnonnegativeinteger = (p) ->
	if (isrational(p) && MEQUAL(p.q.b, 1) && MSIGN(p.q.a) == 1)
		return 1
	else
		return 0

isposint = (p) ->
	if (isinteger(p) && MSIGN(p.q.a) == 1)
		return 1
	else
		return 0

# both p,x are U
ispoly = (p,x) ->
	if (Find(p, x))
		return ispoly_expr(p, x)
	else
		return 0

ispoly_expr = (p,x) ->
	if (car(p) == symbol(ADD))
		p = cdr(p)
		while (iscons(p))
			if (!ispoly_term(car(p), x))
				return 0
			p = cdr(p)
		return 1
	else
		return ispoly_term(p, x)

ispoly_term = (p,x) ->
	if (car(p) == symbol(MULTIPLY))
		p = cdr(p)
		while (iscons(p))
			if (!ispoly_factor(car(p), x))
				return 0
			p = cdr(p)
		return 1
	else
		return ispoly_factor(p, x)

ispoly_factor = (p,x) ->
	if (equal(p, x))
		return 1
	if (car(p) == symbol(POWER) && equal(cadr(p), x))
		if (isposint(caddr(p)))
			return 1
		else
			return 0
	if (Find(p, x))
		return 0
	else
		return 1

isnegativeterm = (p) ->
	if (isnegativenumber(p))
		return 1
	else if (car(p) == symbol(MULTIPLY) && isnegativenumber(cadr(p)))
		return 1
	else
		return 0

isimaginarynumberdouble = (p) ->
	if ((car(p) == symbol(MULTIPLY) \
	&& length(p) == 3 \
	&& isdouble(cadr(p)) \
	&& equal(caddr(p), imaginaryunit)) \
	|| equal(p, imaginaryunit))
		return 1
	else 
		return 0

isimaginarynumber = (p) ->
	if ((car(p) == symbol(MULTIPLY) \
	&& length(p) == 3 \
	&& isnum(cadr(p)) \
	&& equal(caddr(p), imaginaryunit)) \
	|| equal(p, imaginaryunit))
		return 1
	else 
		return 0

iscomplexnumberdouble = (p) ->
	if ((car(p) == symbol(ADD) \
	&& length(p) == 3 \
	&& isdouble(cadr(p)) \
	&& isimaginarynumberdouble(caddr(p))) \
	|| isimaginarynumberdouble(p))
		return 1
	else
		return 0

iscomplexnumber = (p) ->
	if ((car(p) == symbol(ADD) \
	&& length(p) == 3 \
	&& isnum(cadr(p)) \
	&& isimaginarynumber(caddr(p))) \
	|| isimaginarynumber(p))
		return 1
	else
		return 0

iseveninteger = (p) ->
	if isinteger(p) && p.q.a.isEven()
		return 1
	else
		return 0

isnegative = (p) ->
	if (car(p) == symbol(ADD) && isnegativeterm(cadr(p)))
		return 1
	else if (isnegativeterm(p))
		return 1
	else
		return 0

# returns 1 if there's a symbol somewhere

issymbolic = (p) ->
	if (issymbol(p))
		return 1
	else
		while (iscons(p))
			if (issymbolic(car(p)))
				return 1
			p = cdr(p)
		return 0

# i.e. 2, 2^3, etc.

isintegerfactor = (p) ->
	if (isinteger(p) || car(p) == symbol(POWER) \
	&& isinteger(cadr(p)) \
	&& isinteger(caddr(p)))
		return 1
	else
		return 0

isoneover = (p) ->
	if (car(p) == symbol(POWER) \
	&& isminusone(caddr(p)))
		return 1
	else
		return 0

isfraction = (p) ->
	if (p.k == NUM && !MEQUAL(p.q.b, 1))
		return 1
	else
		return 0

# p is a U, n an int
equaln = (p,n) ->
	switch (p.k)
		when NUM
			if (MEQUAL(p.q.a, n) && MEQUAL(p.q.b, 1))
				return 1
		when DOUBLE
			if (p.d == n)
				return 1
	return 0

# p is a U, a and b ints
equalq = (p, a, b) ->
	switch (p.k)
		when NUM
			if (MEQUAL(p.q.a, a) && MEQUAL(p.q.b, b))
				return 1
		when DOUBLE
			if (p.d == a / b)
				return 1
	return 0

# p == 1/2 ?

isoneovertwo = (p) ->
	if equalq(p, 1, 2)
		return 1
	else
		return 0

# p == -1/2 ?
isminusoneovertwo = (p) ->
	if equalq(p, -1, 2)
		return 1
	else
		return 0


# p == 1/sqrt(2) ?

isoneoversqrttwo = (p) ->
	if (car(p) == symbol(POWER) \
	&& equaln(cadr(p), 2) \
	&& equalq(caddr(p), -1, 2))
		return 1
	else
		return 0

# p == -1/sqrt(2) ?

isminusoneoversqrttwo = (p) ->
	if (car(p) == symbol(MULTIPLY) \
	&& equaln(cadr(p), -1) \
	&& isoneoversqrttwo(caddr(p)) \
	&& length(p) == 3)
		return 1
	else
		return 0

isfloating = (p) ->
	if (p.k == DOUBLE)
		return 1
	while (iscons(p))
		if (isfloating(car(p)))
			return 1
		p = cdr(p)
	return 0

isimaginaryunit = (p) ->
	if (equal(p, imaginaryunit))
		return 1
	else
		return 0

# n/2 * i * pi ?

# return value:

#	0	no

#	1	1

#	2	-1

#	3	i

#	4	-i

isquarterturn = (p) ->
	n = 0
	minussign = 0

	if (car(p) != symbol(MULTIPLY))
		return 0

	if (equal(cadr(p), imaginaryunit))

		if (caddr(p) != symbol(PI))
			return 0

		if (length(p) != 3)
			return 0

		return 2

	if (!isnum(cadr(p)))
		return 0

	if (!equal(caddr(p), imaginaryunit))
		return 0

	if (cadddr(p) != symbol(PI))
		return 0

	if (length(p) != 4)
		return 0

	push(cadr(p))
	push_integer(2)
	multiply()

	n = pop_integer()

	if (n == 0x80000000)
		return 0

	if (n < 1)
		minussign = 1
		n = -n

	switch (n % 4)
		when 0
			n = 1
		when 1
			if (minussign)
				n = 4
			else
				n = 3
		when 2
			n = 2
		when 3
			if (minussign)
				n = 3
			else
				n = 4

	return n

# special multiple of pi?

# returns for the following multiples of pi...

#	-4/2	-3/2	-2/2	-1/2	1/2	2/2	3/2	4/2

#	4	1	2	3	1	2	3	4

isnpi = (p) ->
	n = 0
	if (p == symbol(PI))
		return 2
	if (car(p) == symbol(MULTIPLY) \
	&& isnum(cadr(p)) \
	&& caddr(p) == symbol(PI) \
	&& length(p) == 3)
		doNothing = 0
	else
		return 0
	push(cadr(p))
	push_integer(2)
	multiply()
	n = pop_integer()
	if (n == 0x80000000)
		return 0
	if (n < 0)
		n = 4 - (-n) % 4
	else
		n = 1 + (n - 1) % 4
	return n

# this is needed because in the "transform"
# function we don't want to slot-in bare
# native functions in patterns. That is:
# if you have a pattern a_ -> K
# and you try it on an expression
#  add(m+n)
# then part of the transformation mechanism is to
# try "add" as a candidate for a_, and it would be
# evaluated on its own without anything being
# correctly on the stack for it to run, so
# all kind of mahiem happens.
# We want to avoid precisely that.
is_native_function_node = (toBeTested) ->
	if (!issymbol(toBeTested))
		return false

	# note that the FUNCTION case is also in the
	# switch for uniformity
	if symnum(toBeTested) == FUNCTION
		return false

	switch (symnum(toBeTested))
		when ABS then return true
		when ADD then return true
		when ADJ then return true
		when AND then return true
		when ARCCOS then return true
		when ARCCOSH then return true
		when ARCSIN then return true
		when ARCSINH then return true
		when ARCTAN then return true
		when ARCTANH then return true
		when ARG then return true
		when ATOMIZE then return true
		when BESSELJ then return true
		when BESSELY then return true
		when BINDING then return true
		when BINOMIAL then return true
		when CEILING then return true
		when CHECK then return true
		when CHOOSE then return true
		when CIRCEXP then return true
		when CLEAR then return true
		when CLEARSUBSTRULES then return true
		when CLOCK then return true
		when COEFF then return true
		when COFACTOR then return true
		when CONDENSE then return true
		when CONJ then return true
		when CONTRACT then return true
		when COS then return true
		when COSH then return true
		when DECOMP then return true
		when DEGREE then return true
		when DEFINT then return true
		when DENOMINATOR then return true
		when DERIVATIVE then return true
		when DET then return true
		when DIM then return true
		when DIRAC then return true
		when DISPLAY then return true
		when DIVISORS then return true
		when DO then return true
		when DOT then return true
		when DRAW then return true
		when DSOLVE then return true
		when EIGEN then return true
		when EIGENVAL then return true
		when EIGENVEC then return true
		when ERF then return true
		when ERFC then return true
		when EVAL then return true
		when EXP then return true
		when EXPAND then return true
		when EXPCOS then return true
		when EXPSIN then return true
		when FACTOR then return true
		when FACTORIAL then return true
		when FACTORPOLY then return true
		when FILTER then return true
		when FLOATF then return true
		when FLOOR then return true
		when FOR then return true
		# this is invoked only when we
		# evaluate a function that is NOT being called
		# e.g. when f is a function as we do
		#  g = f
		when FUNCTION then return true
		when GAMMA then return true
		when GCD then return true
		when HERMITE then return true
		when HILBERT then return true
		when IMAG then return true
		when INDEX then return true
		when INNER then return true
		when INTEGRAL then return true
		when INV then return true
		when INVG then return true
		when ISINTEGER then return true
		when ISPRIME then return true
		when LAGUERRE then return true
		#	when LAPLACE then return true
		when LCM then return true
		when LEADING then return true
		when LEGENDRE then return true
		when LOG then return true
		when LOOKUP then return true
		when MAG then return true
		when MOD then return true
		when MULTIPLY then return true
		when NOT then return true
		when NROOTS then return true
		when NUMBER then return true
		when NUMERATOR then return true
		when OPERATOR then return true
		when OR then return true
		when OUTER then return true
		when PATTERN then return true
		when POLAR then return true
		when POWER then return true
		when PRIME then return true
		when PRINT then return true
		when PRINTLATEX then return true
		when PRINTLIST then return true
		when PRODUCT then return true
		when QUOTE then return true
		when QUOTIENT then return true
		when RANK then return true
		when RATIONALIZE then return true
		when REAL then return true
		when YYRECT then return true
		when ROOTS then return true
		when SETQ then return true
		when SGN then return true
		when SILENTPATTERN then return true
		when SIMPLIFY then return true
		when SIN then return true
		when SINH then return true
		when SHAPE then return true
		when SQRT then return true
		when STOP then return true
		when SUBST then return true
		when SUM then return true
		when TAN then return true
		when TANH then return true
		when TAYLOR then return true
		when TEST then return true
		when TESTEQ then return true
		when TESTGE then return true
		when TESTGT then return true
		when TESTLE then return true
		when TESTLT then return true
		when TRANSPOSE then return true
		when UNIT then return true
		when ZERO then return true
		else
			return false



$.iszero                   = iszero
$.isnegativenumber         = isnegativenumber          
$.isplusone                = isplusone   
$.isminusone               = isminusone    
$.isinteger                = isinteger   
$.isnonnegativeinteger     = isnonnegativeinteger              
$.isposint                 = isposint  
$.isnegativeterm           = isnegativeterm        
$.isimaginarynumber        = isimaginarynumber           
$.iscomplexnumber          = iscomplexnumber         
$.iseveninteger            = iseveninteger       
$.isnegative               = isnegative    
$.issymbolic               = issymbolic    
$.isintegerfactor          = isintegerfactor         
$.isoneover                = isoneover   
$.isfraction               = isfraction    
$.isoneoversqrttwo         = isoneoversqrttwo          
$.isminusoneoversqrttwo    = isminusoneoversqrttwo               
$.isfloating               = isfloating    
$.isimaginaryunit          = isimaginaryunit         
$.isquarterturn            = isquarterturn       
$.isnpi                    = isnpi

