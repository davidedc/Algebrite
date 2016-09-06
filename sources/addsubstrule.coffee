###
	Add a substitution rule
###

# same as Eval_pattern but only leaves
# NIL on stack at return, hence gives no
# printout
Eval_silentpattern = ->
	Eval_pattern()
	pop()
	push_symbol(NIL)

Eval_pattern = ->
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	if (cdr(p1)+"") not in userSimplificationsInStringForm
		userSimplificationsInStringForm.push(cdr(p1)+"")
		userSimplificationsInListForm.push(cdr(p1))

	# return the pattern node itself so we can
	# give some printout feedback
	push_symbol(PATTERN)
	push cdr(p1)
	list(2)
	
