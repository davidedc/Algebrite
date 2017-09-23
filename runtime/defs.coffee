bigInt = require('big-integer')

# also change the version in the package.json file
version = "1.1.2"

SELFTEST = 1

# size of the symbol table
NSYM = 1000

DEBUG = false
PRINTOUTRESULT = false

# printing-related constants
PRINTMODE_LATEX = "PRINTMODE_LATEX"
PRINTMODE_2DASCII = "PRINTMODE_2DASCII"
PRINTMODE_FULL = "PRINTMODE_FULL"
PRINTMODE_PLAIN = "PRINTMODE_PLAIN"
PRINTMODE_LIST = "PRINTMODE_LIST"

# when the user uses the generic "print" statement
# this setting kicks-in.
environment_printmode = PRINTMODE_PLAIN
printMode = PRINTMODE_PLAIN

dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = true
recursionLevelNestedRadicalsRemoval = 0
do_simplify_nested_radicals = true
avoidCalculatingPowersIntoArctans = true

# Symbolic expressions are built by connecting U structs.
#
# For example, (a b + c) is built like this:
#
#           _______      _______                                _______
#          |CONS   |--->|CONS   |----------------------------->|CONS   |
#          |       |    |       |                              |       |
#          |_______|    |_______|                              |_______|
#              |            |                                      |
#           ___v___      ___v___      _______      _______      ___v___
#          |ADD    |    |CONS   |--->|CONS   |--->|CONS   |    |SYM c  |
#          |       |    |       |    |       |    |       |    |       |
#          |_______|    |_______|    |_______|    |_______|    |_______|
#                           |            |            |
#                        ___v___      ___v___      ___v___
#                       |MUL    |    |SYM a  |    |SYM b  |
#                       |       |    |       |    |       |
#                       |_______|    |_______|    |_______|



class rational
	a: null # a bigInteger
	b: null # a bigInteger

class U
	cons: null # will have a car and cdr
	printname: ""
	str: ""
	tensor: null
	# rational number a over b
	q: null # will point to a rational
	d: 0.0 # a double
	k: 0
	tag: 0

	toString: -> print_expr(this)
	toLatexString: -> collectLatexStringFromReturnValue(this)

	constructor: ->
		@cons = {}
		@cons.car = null
		@cons.cdr = null
		@q = new rational()


errorMessage = ""


# the following enum is for struct U, member k

CONS = 0
NUM = 1
DOUBLE = 2
STR = 3
TENSOR = 4
SYM = 5

# the following enum is for indexing the symbol table

# standard functions first, then nil, then everything else

counter = 0
ABS = counter++
ADD = counter++
ADJ = counter++
AND = counter++
APPROXRATIO = counter++
ARCCOS = counter++
ARCCOSH = counter++
ARCSIN = counter++
ARCSINH = counter++
ARCTAN = counter++
ARCTANH = counter++
ARG = counter++
ATOMIZE = counter++
BESSELJ = counter++
BESSELY = counter++
BINDING = counter++
BINOMIAL = counter++
CEILING = counter++
CHECK = counter++
CHOOSE = counter++
CIRCEXP = counter++
CLEAR = counter++
CLEARALL = counter++
CLEARPATTERNS = counter++
CLOCK = counter++
COEFF = counter++
COFACTOR = counter++
CONDENSE = counter++
CONJ = counter++
CONTRACT = counter++
COS = counter++
COSH = counter++
DECOMP = counter++
DEFINT = counter++
DEGREE = counter++
DENOMINATOR = counter++
DERIVATIVE = counter++
DET = counter++
DIM = counter++
DIRAC = counter++
DIVISORS = counter++
DO = counter++
DOT = counter++
DRAW = counter++
DSOLVE = counter++
EIGEN = counter++
EIGENVAL = counter++
EIGENVEC = counter++
ERF = counter++
ERFC = counter++
EVAL = counter++
EXP = counter++
EXPAND = counter++
EXPCOS = counter++
EXPSIN = counter++
FACTOR = counter++
FACTORIAL = counter++
FACTORPOLY = counter++
FILTER = counter++
FLOATF = counter++
FLOOR = counter++
FOR = counter++
FUNCTION = counter++
GAMMA = counter++
GCD = counter++
HERMITE = counter++
HILBERT = counter++
IMAG = counter++
INDEX = counter++
INNER = counter++
INTEGRAL = counter++
INV = counter++
INVG = counter++
ISINTEGER = counter++
ISPRIME = counter++
LAGUERRE = counter++
#	LAPLACE = counter++
LCM = counter++
LEADING = counter++
LEGENDRE = counter++
LOG = counter++
LOOKUP = counter++
MOD = counter++
MULTIPLY = counter++
NOT = counter++
NROOTS = counter++
NUMBER = counter++
NUMERATOR = counter++
OPERATOR = counter++
OR = counter++
OUTER = counter++
PATTERN = counter++
PATTERNSINFO = counter++
POLAR = counter++
POWER = counter++
PRIME = counter++
PRINT_LEAVE_E_ALONE = counter++
PRINT_LEAVE_X_ALONE = counter++
PRINT = counter++
PRINT2DASCII = counter++
PRINTFULL = counter++
PRINTLATEX = counter++
PRINTLIST = counter++
PRINTPLAIN = counter++
PRODUCT = counter++
QUOTE = counter++
QUOTIENT = counter++
RANK = counter++
RATIONALIZE = counter++
REAL = counter++
ROUND = counter++
YYRECT = counter++
ROOTS = counter++
SETQ = counter++
SGN = counter++
SILENTPATTERN = counter++
SIMPLIFY = counter++
SIN = counter++
SINH = counter++
SHAPE = counter++
SQRT = counter++
STOP = counter++
SUBST = counter++
SUM = counter++
SYMBOLSINFO = counter++
TAN = counter++
TANH = counter++
TAYLOR = counter++
TEST = counter++
TESTEQ = counter++
TESTGE = counter++
TESTGT = counter++
TESTLE = counter++
TESTLT = counter++
TRANSPOSE = counter++
UNIT = counter++
ZERO = counter++

# ALL THE SYMBOLS ABOVE NIL ARE KEYWORDS,
# WHICH MEANS THAT USER CANNOT REDEFINE THEM
NIL = counter++	# nil goes here, after standard functions
LAST = counter++

LAST_PRINT = counter++
LAST_2DASCII_PRINT = counter++
LAST_FULL_PRINT = counter++
LAST_LATEX_PRINT = counter++
LAST_LIST_PRINT = counter++
LAST_PLAIN_PRINT = counter++

AUTOEXPAND = counter++
BAKE = counter++
ASSUME_REAL_VARIABLES = counter++
TRACE = counter++

YYE = counter++

DRAWX = counter++	# special purpose internal symbols
METAA = counter++
METAB = counter++
METAX = counter++
SECRETX = counter++

VERSION = counter++

PI = counter++
SYMBOL_A = counter++
SYMBOL_B = counter++
SYMBOL_C = counter++
SYMBOL_D = counter++
SYMBOL_I = counter++
SYMBOL_J = counter++
SYMBOL_N = counter++
SYMBOL_R = counter++
SYMBOL_S = counter++
SYMBOL_T = counter++
SYMBOL_X = counter++
SYMBOL_Y = counter++
SYMBOL_Z = counter++
SYMBOL_IDENTITY_MATRIX = counter++

SYMBOL_A_UNDERSCORE = counter++
SYMBOL_B_UNDERSCORE = counter++
SYMBOL_X_UNDERSCORE = counter++

C1 = counter++
C2 = counter++
C3 = counter++
C4 = counter++
C5 = counter++
C6 = counter++

USR_SYMBOLS = counter++	# this must be last

E = YYE

# TOS cannot be arbitrarily large because the OS seg faults on deep recursion.
# For example, a circular evaluation like x=x+1 can cause a seg fault.
# At this setting (100,000) the evaluation stack overruns before seg fault.

TOS = 100000

BUF = 10000

MAX_PROGRAM_SIZE = 100001
MAXPRIMETAB = 10000
MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = 5
MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = 10
ENABLE_CACHING = true
cached_runs = null # the LRU cache will go here
cached_findDependenciesInScript = null # the LRU cache will go here

#define _USE_MATH_DEFINES // for MS C++

MAXDIM = 24

# needed for the mechanism to
# find all dependencies between variables
# in a script
symbolsDependencies = {}
symbolsHavingReassignments = []
symbolsInExpressionsWithoutAssignments = []
patternHasBeenFound = false

predefinedSymbolsInGlobalScope_doNotTrackInDependencies = [
	"rationalize"
	"abs"
	"e"
	"i"
	"pi"
	"sin"
	"ceiling"
	"cos"
	"roots"
	"integral"
	"derivative"
	"defint"
	"sqrt"
	"eig"
	"cov"
	"deig"
	"dcov"
	"float"
	"floor"
	"product"
	"root"
	"round"
	"sum"
	"test"
	"unit"
]

# you can do some little simplifications
# at parse time, such as calculating away
# immediately simple operations on
# constants, removing 1s from products
# etc.
parse_time_simplifications = true

chainOfUserSymbolsNotFunctionsBeingEvaluated = []

stringsEmittedByUserPrintouts = ""

# flag use to potentially switch on/off some quirks "deep"
# in the code due to call from Algebra block.
# Currently not used.
called_from_Algebra_block = false


class tensor
	ndim: 0		# number of dimensions
	dim: null	# dimension length, for each dimension
	nelem: 0	# total number of elements
	elem: null	# an array containing all the data

	constructor: ->
		@dim = (0 for [0..MAXDIM])
		@elem = []


class display
	h: 0
	w: 0
	n: 0
	a: [] # will contain an array of c,x,y (color,x,y)


class text_metric
	ascent: 0
	descent: 0
	width: 0


tos = 0 # top of stack
expanding = 0
evaluatingAsFloats = 0
evaluatingPolar = 0
fmt_x = 0
fmt_index = 0
fmt_level = 0
verbosing = 0



primetab = do ->
	primes = [2]
	i = 3
	while primes.length < MAXPRIMETAB
		j = 0
		ceil = Math.sqrt(i)
		while j < primes.length and primes[j] <= ceil
			if i % primes[j] == 0
				j = -1
				break
			j++
		if j != -1
			primes.push(i)
		i += 2
	primes[MAXPRIMETAB] = 0
	return primes

	

esc_flag = 0
draw_flag = 0
mtotal = 0
trigmode = 0
logbuf = ""
program_buf = ""

# will contain the variable names
symtab = []
# will contain the contents of the variable
# in the corresponding position in symtab array
binding = []
isSymbolReclaimable = []

arglist = [] # will contain U
stack = [] # will contain *U
frame = 0
p0 = null # will contain U
p1 = null # will contain U
p2 = null # will contain U
p3 = null # will contain U
p4 = null # will contain U
p5 = null # will contain U
p6 = null # will contain U
p7 = null # will contain U
p8 = null # will contain U
p9 = null # will contain U

zero = null # will contain U
one = null # will contain U
one_as_double = null
imaginaryunit = null # will contain U

out_buf = ""
out_count = 0
test_flag = 0
codeGen = false
draw_stop_return = null # extern jmp_buf ?????
userSimplificationsInListForm = []
userSimplificationsInStringForm = []

transpose_unicode = 7488
dotprod_unicode = 183

symbol = (x) -> (symtab[x])
iscons = (p) -> (p.k == CONS)
isrational = (p) -> (p.k == NUM)
isdouble = (p) -> (p.k == DOUBLE)
isnum = (p) -> (isrational(p) || isdouble(p))
isstr = (p) -> (p.k == STR)
istensor = (p) -> (if !p? then debugger else p.k == TENSOR)

# because of recursion, we consider a scalar to be
# a tensor, so a numeric scalar will return true
isnumerictensor = (p) ->
	if isnum(p) or p == symbol(SYMBOL_IDENTITY_MATRIX)
		return 1

	if !istensor(p) and !isnum(p)
		#console.log "p not even a tensor: " + p
		return 0

	n = p.tensor.nelem
	a = p.tensor.elem

	for i in [0...n]
		if !isnumerictensor(a[i])
			#console.log "non-numeric element: " + a[i]
			return 0
	return 1

issymbol = (p) -> (p.k == SYM)
iskeyword = (p) -> (issymbol(p) && symnum(p) < NIL)

car = (p) -> if iscons(p) then p.cons.car else symbol(NIL)
cdr = (p) -> if iscons(p) then p.cons.cdr else symbol(NIL)
caar = (p) -> car(car(p))
cadr = (p) -> car(cdr(p))
cdar = (p) -> cdr(car(p))
cddr = (p) -> cdr(cdr(p))
caadr = (p) -> car(car(cdr(p)))
caddr = (p) -> car(cdr(cdr(p)))
cadar = (p) -> car(cdr(car(p)))
cdadr = (p) -> cdr(car(cdr(p)))
cddar = (p) -> cdr(cdr(car(p)))
cdddr = (p) -> cdr(cdr(cdr(p)))
caaddr = (p) -> car(car(cdr(cdr(p))))
cadadr = (p) -> car(cdr(car(cdr(p))))
caddar = (p) -> car(cdr(cdr(car(p))))
cdaddr = (p) -> cdr(car(cdr(cdr(p))))
cadddr = (p) -> car(cdr(cdr(cdr(p))))
cddddr = (p) -> cdr(cdr(cdr(cdr(p))))
caddddr = (p) -> car(cdr(cdr(cdr(cdr(p)))))
cadaddr = (p) -> car(cdr(car(cdr(cdr(p)))))
cddaddr = (p) -> cdr(cdr(car(cdr(cdr(p)))))
caddadr = (p) -> car(cdr(cdr(car(cdr(p)))))
cdddaddr = (p) -> cdr(cdr(cdr(car(cdr(cdr(p))))))
caddaddr = (p) -> car(cdr(cdr(car(cdr(cdr(p))))))

# not used yet
listLength = (p) ->
	startCount = -1

	while iscons(p)
		p = cdr(p)
		startCount++

	return startCount

# not used yet
nthCadr = (p,n) ->
	startCount = 0

	while startCount <= n
		p = cdr(p)
		startCount++

	return car(p)

isadd = (p) -> (car(p) == symbol(ADD))
ismultiply = (p) -> (car(p) == symbol(MULTIPLY))
ispower = (p) -> (car(p) == symbol(POWER))
isfactorial = (p) -> (car(p) == symbol(FACTORIAL))
isinnerordot = (p) -> ((car(p) == symbol(INNER)) or (car(p) == symbol(DOT)))
istranspose = (p) -> (car(p) == symbol(TRANSPOSE))
isinv = (p) -> (car(p) == symbol(INV))
# TODO this is a bit of a shallow check, we should
# check when we are passed an actual tensor and possibly
# cache the test result.
isidentitymatrix = (p) -> (p == symbol(SYMBOL_IDENTITY_MATRIX))

MSIGN = (p) ->
	if p.isPositive()
		return 1
	else if p.isZero()
		return 0
	else
		return -1

MLENGTH = (p) -> p.toString().length

MZERO = (p) -> p.isZero()
MEQUAL = (p, n) ->
	if !p?
		debugger
	p.equals(n)


reset_after_error = ->
	moveTos 0
	esc_flag = 0
	draw_flag = 0
	frame = TOS
	evaluatingAsFloats = 0
	evaluatingPolar = 0


$ = (exports ? this)

$.version = version

$.isadd = isadd
$.ismultiply = ismultiply
$.ispower = ispower
$.isfactorial = isfactorial



$.car            = car   
$.cdr            = cdr   
$.caar           = caar    
$.cadr           = cadr    
$.cdar           = cdar    
$.cddr           = cddr    
$.caadr          = caadr     
$.caddr          = caddr     
$.cadar          = cadar     
$.cdadr          = cdadr     
$.cddar          = cddar     
$.cdddr          = cdddr     
$.caaddr         = caaddr      
$.cadadr         = cadadr      
$.caddar         = caddar      
$.cdaddr         = cdaddr      
$.cadddr         = cadddr      
$.cddddr         = cddddr      
$.caddddr        = caddddr       
$.cadaddr        = cadaddr       
$.cddaddr        = cddaddr       
$.caddadr        = caddadr       
$.cdddaddr       = cdddaddr        
$.caddaddr       = caddaddr        



$.symbol         = symbol  
$.iscons         = iscons  
$.isrational     = isrational      
$.isdouble       = isdouble    
$.isnum          = isnum 
$.isstr          = isstr 
$.istensor       = istensor    
$.issymbol       = issymbol    
$.iskeyword      = iskeyword   




$.CONS =        CONS      
$.NUM =         NUM     
$.DOUBLE =      DOUBLE        
$.STR =         STR     
$.TENSOR =      TENSOR        
$.SYM =         SYM                 
