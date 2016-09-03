###
	Add a substitution rule
###


Eval_pattern = ->
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	userSimplificationsInListForm.push(cdr(p1))
	
	# return nothing
	push_symbol(NIL)
