# 'for' function

###
x=0
y=2
for(do(x=sqrt(2+x),y=2*y/x),k,1,9)
float(y)

X: k
B: 1...9

1st parameter is the body
2nd parameter is the variable to loop with
3rd and 4th are the limits


###

#define A p3
#define B p4
#define I p5
#define X p6

Eval_for = ->
	i = 0
	j = 0
	k = 0

	loopingVariable = caddr(p1)
	if (!issymbol(loopingVariable))
		stop("for: 2nd arg should be the variable to loop over")

	push(cadddr(p1))
	Eval()
	j = pop_integer()
	if (isNaN(j))
		push p1
		return

	push(caddddr(p1))
	Eval()
	k = pop_integer()
	if (isNaN(k))
		push p1
		return


	# remember contents of the index
	# variable so we can put it back after the loop
	p4 = get_binding(loopingVariable)

	for i in [j..k]
		push_integer(i)
		p5 = pop()
		set_binding(loopingVariable, p5)
		push(cadr(p1))
		Eval()
		pop()

	# put back the index variable to original content
	set_binding(loopingVariable, p4)

	# return value

	push_symbol(NIL)

