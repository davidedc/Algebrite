###
	Add a pattern i.e. a substitution rule.
	Substitution rule needs a template as first argument
	and what to transform it to as second argument.
	Optional third argument is a boolean test which
	adds conditions to when the rule is applied.
###

# same as Eval_pattern but only leaves
# NIL on stack at return, hence gives no
# printout
Eval_silentpattern = ->
	Eval_pattern()
	pop()
	push_symbol(NIL)

Eval_pattern = ->
	# check that the parameters are allright
	if !iscons(cdr(p1))
		stop("pattern needs at least a template and a transformed version")
	firstArgument = car(cdr(p1))
	secondArgument = car(cdr(cdr(p1)))
	if secondArgument == symbol(NIL)
		stop("pattern needs at least a template and a transformed version")
	# third argument is optional and contains the tests
	if !iscons(cdr(cdr(p1)))
		thirdArgument = symbol(NIL)
	else
		thirdArgument = car(cdr(cdr(cdr(p1))))

	if equal(firstArgument, secondArgument)
		stop("recursive pattern")

	# console.log "Eval_pattern of " + cdr(p1)
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	stringKey = "template: " + print_list(firstArgument)
	stringKey += " tests: " + print_list(thirdArgument)
	if DEBUG then console.log "pattern stringkey: " + stringKey

	patternPosition = userSimplificationsInStringForm.indexOf stringKey
	# if pattern is not there yet, add it, otherwise replace it
	if patternPosition == -1
		#console.log "adding pattern because it doesn't exist: " + cdr(p1)
		userSimplificationsInStringForm.push(stringKey)
		userSimplificationsInListForm.push(cdr(p1))
	else
		if DEBUG then console.log "pattern already exists, replacing. " + cdr(p1)
		userSimplificationsInStringForm[patternPosition] = stringKey
		userSimplificationsInListForm[patternPosition] = cdr(p1)

	# return the pattern node itself so we can
	# give some printout feedback
	push_symbol(PATTERN)
	push cdr(p1)
	list(2)
	

###
	Clear all patterns
###


do_clearPatterns = ->
	userSimplificationsInListForm = []
	userSimplificationsInStringForm = []

Eval_clearpatterns = ->
	# this is likely to create garbage collection
	# problems in the C version as it's an
	# untracked reference
	do_clearPatterns()
	
	# return nothing
	push_symbol(NIL)


Eval_patternsinfo = ->
	patternsinfoToBePrinted = patternsinfo()

	if patternsinfoToBePrinted != ""
		new_string(patternsinfoToBePrinted)
	else
		push_symbol(NIL)

patternsinfo = ->
	patternsinfoToBePrinted = ""
	for i in userSimplificationsInListForm
		patternsinfoToBePrinted +=  userSimplificationsInListForm + "\n"
	return patternsinfoToBePrinted
