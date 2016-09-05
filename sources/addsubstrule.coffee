###
	Add a substitution rule
###


Eval_pattern = ->
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	if (cdr(p1)+"") not in userSimplificationsInStringForm
		userSimplificationsInStringForm.push(cdr(p1)+"")
		userSimplificationsInListForm.push(cdr(p1))
	
	# return nothing
	push_symbol(NIL)
