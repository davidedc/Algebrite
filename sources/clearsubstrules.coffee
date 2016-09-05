###
	Clear all substitution rules
###


Eval_clearsubstrules = ->
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	userSimplificationsInListForm = []
	userSimplificationsInStringForm = []
	
	# return nothing
	push_symbol(NIL)
