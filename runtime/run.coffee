

#jmp_buf stop_return, draw_stop_return

# s is a string here
stop = (s) ->
	#if (draw_flag == 2)
	#	longjmp(draw_stop_return, 1)
	#else
		errorMessage += "Stop: "
		errorMessage += s
		#debugger
		message = errorMessage

		errorMessage = ''
		tos = 0

		throw new Error(message)
		
		#longjmp(stop_return, 1)

# Figuring out dependencies is key to automatically
# generating a method signature when generating JS code
# from algebrite scripts.
# This is important because the user can keep using normal Algebrite
# scripting without special notations.
# Basically the process consists of figuring out
# the "ground variables" that are needed to compute each variable.
# Now there are two ways of doing this:
#   * at parse time
#   * after running the scripts
# Doing it at parse time means that we can't track simplifications
# canceling-out some variables for example. But on the other side
# it's very quick and the user can somehow see what the signature is
# going to look like (assuming tha code is rather simple), or anyways
# is going to easily make sense of the generated signature.
# Doing it after execution on the other hand would allow us to see
# if some variable cancel-out. But if variables cancel out then
# they might do so according to some run-time behaviour that the user
# might struggle to keep track of.
# So the effort for the user to make sense of the signature in the first case
# is similar to the effort of leeping tab of types in a typed language.
# While in the second case the effort is similar to running the
# code and simplifications in her head.
test_dependencies = ->
	do_clearall()

	testResult = findDependenciesInScript('1')
	if testResult[0] == "All local dependencies: . Symbols with reassignments: . All dependencies recursively: " and
		testResult[1] == "1" and
		testResult[2] == ""
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = x+1\n g = f\n h = g\n f = g')
	if testResult[0] == "All local dependencies:  variable f depends on: x, g, ;  variable g depends on: f, ;  variable h depends on: g, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: x, ;  f --> g -->  ... then f again,  variable g depends on: x, ;  g --> f -->  ... then g again,  variable h depends on: x, ;  h --> g --> f -->  ... then g again, " and
		testResult[1] == "" and
		testResult[2] == "// f is part of a cyclic dependency, no code generated.\n// g is part of a cyclic dependency, no code generated.\n// h is part of a cyclic dependency, no code generated."
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	if findDependenciesInScript('f = x+1\n g = f + y\n h = g')[0] == "All local dependencies:  variable f depends on: x, ;  variable g depends on: f, y, ;  variable h depends on: g, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: x, ;  variable g depends on: x, y, ;  variable h depends on: x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('g = h(x,y)')[0] == "All local dependencies:  variable g depends on: h, x, y, ; . Symbols with reassignments: . All dependencies recursively:  variable g depends on: h, x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('f(x,y) = k')[0] == "All local dependencies:  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = z\n f(x,y) = k')[0] == "All local dependencies:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = z\n g = f(x,y)')[0] == "All local dependencies:  variable x depends on: z, ;  variable g depends on: f, x, y, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: z, ;  variable g depends on: f, z, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = 1\n x = y\n x = z')[0] == "All local dependencies:  variable x depends on: y, z, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: y, z, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	testResult = findDependenciesInScript('x = y*y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( Math.pow(y, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = -sqrt(2)/2')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = -1/2*Math.pow(2, (1/2));"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = 2^(1/2-a)*2^a/10')
	if testResult[0] == "All local dependencies:  variable x depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "x = 1/10*Math.pow(2, (1/2));"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = rationalize(t*y/(t+y)+2*t^2*y*(2*t+y)^(-2))')
	if testResult[0] == "All local dependencies:  variable x depends on: t, y, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: t, y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (t, y) { return ( t*y*(6*Math.pow(t, 2) + Math.pow(y, 2) + 6*t*y) / ((t + y)*Math.pow((2*t + y), 2)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = mag((a+i*b)/(c+i*d))')
	if testResult[0] == "All local dependencies:  variable x depends on: a, b, c, d, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: a, b, c, d, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (a, b, c, d) { return ( Math.pow((Math.pow(a, 2) + Math.pow(b, 2)), (1/2)) / (Math.pow((Math.pow(c, 2) + Math.pow(d, 2)), (1/2))) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2 + y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( 1 + y ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = 1;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f(x) = x * x')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: 'x, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (x) { return ( x*x ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: 'x, g, y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (g, y, x) { return ( g(y) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('y = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . All dependencies recursively:  variable y depends on: ;  variable f depends on: 'x, g, ; " and
		testResult[1] == "" and
		testResult[2] == "y = 2;\nf = function (g, x) { return ( g(2) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('g(x) = x + 2\ny = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\ny = 2;\nf = function (x) { return ( 4 + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('g(x) = x + 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable f depends on: 'x, y, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\nf = function (y, x) { return ( 2 + y + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	###
	testResult = findDependenciesInScript('g(x) = f(x)\nf(x)=g(x)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, f, x, ;  variable f depends on: 'x, g, x, ; . Symbols with reassignments: . All dependencies recursively:  variable g depends on: 'x, ;  g --> f -->  ... then g again,  variable f depends on: 'x, x, ;  f --> g -->  ... then f again, " and
		testResult[1] == "" and
		testResult[2] == "// g is part of a cyclic dependency, no code generated.\n// f is part of a cyclic dependency, no code generated."
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()
	###

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c, x)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) + b / a),1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) - b / a)] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) + b / a),1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) - b / a)] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(integral(a*x + b))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: a, b, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b) { return ( [0,-2*b / a] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y,y,0,1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / (2*a) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y + z,y,0,1, z, 0, 1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / a ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = defint(2*x - 3*y,x,0,2*y)')
	if testResult[0] == "All local dependencies:  variable f depends on: y, ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (y) { return ( -2*Math.pow(y, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = defint(12 - x^2 - (y^2)/2,x,0,2,y,0,3)')
	if testResult[0] == "All local dependencies:  variable f depends on: ; . Symbols with reassignments: . All dependencies recursively:  variable f depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "f = 55;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# this example checks that functions are not meddled with,
	# in particular that in the function body, the variables
	# bound by the parameters remain "separate" from previous
	# variables with the same name.
	testResult = findDependenciesInScript('a = 2\nf(a) = a+1+b')
	if testResult[0] == "All local dependencies:  variable a depends on: ;  variable f depends on: 'a, b, ; . Symbols with reassignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: 'a, b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = 2;\nf = function (a, b) { return ( 1 + a + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# similar as test above but this time we are not
	# defining a function, so things are a bit different.
	testResult = findDependenciesInScript('a = 2\nf = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: ;  variable f depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "a = 2;\nf = 3;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# similar as test above but this time we do a
	# trick with the quote to see whether we
	# get confused with the indirection
	testResult = findDependenciesInScript('a := b\nf = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (b) { return ( 1 + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# another tricky case of indirection through quote
	testResult = findDependenciesInScript('a := b\nf(a) = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: 'a, ; . Symbols with reassignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: 'a, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (a) { return ( 1 + a ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# reassignment
	testResult = findDependenciesInScript('b = 1\nb=a+b+c')
	if testResult[0] == "All local dependencies:  variable b depends on: a, c, ; . Symbols with reassignments: b, . All dependencies recursively:  variable b depends on: a, c, ; " and
		testResult[1] == "" and
		testResult[2] == "b = function (a, c) { return ( 1 + a + c ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# reassignment
	testResult = findDependenciesInScript('a = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: ; . Symbols with reassignments: a, . All dependencies recursively:  variable a depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "" and
		testResult[5] == "Error: Stop: recursive evaluation of symbols: a -> a"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# reassignment
	testResult = computeDependenciesFromAlgebra('pattern(a,b)\nc= d\na=a+1')
	if testResult.affectsVariables.length is 3 and
		testResult.affectsVariables.indexOf("c") != -1 and
		testResult.affectsVariables.indexOf("a") != -1 and
		testResult.affectsVariables.indexOf("PATTERN_DEPENDENCY") != -1 and
		testResult.affectedBy.length is 3 and
		testResult.affectedBy.indexOf("d") != -1 and
		testResult.affectedBy.indexOf("a") != -1 and
		testResult.affectedBy.indexOf("PATTERN_DEPENDENCY") != -1
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('a = b\nf = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (b) { return ( 1 + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	console.log "-- done dependency tests"
	do_clearall()


findDependenciesInScript = (stringToBeParsed, dontGenerateCode) ->

	if DEBUG then console.log "stringToBeParsed: " + stringToBeParsed
	inited = true
	codeGen = true
	symbolsDependencies = {}
	symbolsHavingReassignments = []
	patternHasBeenFound = false
	indexOfPartRemainingToBeParsed = 0

	allReturnedPlainStrings = ""
	allReturnedLatexStrings = ""

	n = 0

	# we are going to store the dependencies _of the block as a whole_
	# so all affected variables in the whole block are lumped
	# together, and same for the variable that affect those, we
	# lump them all together.
	dependencyInfo =
		affectsVariables: []
		affectedBy: []

	while (1)

		try
			errorMessage = ""
			check_stack()
			if DEBUG then console.log "findDependenciesInScript: scanning"
			n = scan(stringToBeParsed.substring(indexOfPartRemainingToBeParsed))
			if DEBUG then console.log "scanned"
			pop()
			check_stack()
		catch error
			if PRINTOUTRESULT then console.log error
			errorMessage = error + ""
			#debugger
			init()
			break


		if (n == 0)
			break

		indexOfPartRemainingToBeParsed += n

	testableString = ""

	# print out all local dependencies as collected by this
	# parsing pass
	if DEBUG then console.log "all local dependencies ----------------"
	testableString += "All local dependencies: "
	for key, value of symbolsDependencies
		if DEBUG then console.log "variable " + key + " depends on: "
		dependencyInfo.affectsVariables.push key
		testableString +=  " variable " + key + " depends on: "
		for i in value
			if DEBUG then console.log "		" + i
			if i[0] != "'"
				dependencyInfo.affectedBy.push i
			testableString +=  i + ", "
		testableString += "; "
	testableString += ". "

	# print out the symbols with re-assignments:
	if DEBUG then console.log "Symbols with reassignments ----------------"
	testableString += "Symbols with reassignments: "
	for key in symbolsHavingReassignments
		if dependencyInfo.affectedBy.indexOf(key) == -1
			dependencyInfo.affectedBy.push key
			testableString +=  key + ", "
	testableString += ". "

	# ALL Algebrite code is affected by any pattern changing
	dependencyInfo.affectedBy.push "PATTERN_DEPENDENCY"

	if patternHasBeenFound
		dependencyInfo.affectsVariables.push "PATTERN_DEPENDENCY"
		testableString += " - PATTERN_DEPENDENCY inserted - "

	# print out all global dependencies as collected by this
	# parsing pass
	if DEBUG then console.log "All dependencies recursively ----------------"
	testableString += "All dependencies recursively: "

	scriptEvaluation = ["",""]
	generatedCode = ""
	readableSummaryOfGeneratedCode = ""

	if errorMessage == "" and !dontGenerateCode

		try
			allReturnedPlainStrings = ""
			allReturnedLatexStrings = ""
			scriptEvaluation = run(stringToBeParsed, true)
			allReturnedPlainStrings = ""
			allReturnedLatexStrings = ""
		catch error
			if PRINTOUTRESULT then console.log error
			errorMessage = error + ""
			#debugger
			init()

		if errorMessage == ""
			for key of symbolsDependencies


				codeGen = true
				if DEBUG then console.log "	variable " + key + " is: " + get_binding(usr_symbol(key)).toString()
				codeGen = false
				if DEBUG then console.log "	variable " + key + " depends on: "
				testableString +=  " variable " + key + " depends on: "

				recursedDependencies = []
				variablesWithCycles = []
				cyclesDescriptions = []

				recursiveDependencies key, recursedDependencies, [], variablesWithCycles, [], cyclesDescriptions

				for i in variablesWithCycles
					if DEBUG then console.log "		--> cycle through " + i

				for i in recursedDependencies
					if DEBUG then console.log "		" + i
					testableString +=  i + ", "
				testableString += "; "

				for i in cyclesDescriptions
					testableString += " " + i + ", "

				if DEBUG then console.log "	code generation:" + key + " is: " + get_binding(usr_symbol(key)).toString()

				# we really want to make an extra effort
				# to generate simplified code, so
				# run a "simplify" on the content of each
				# variable that we are generating code for.
				# Note that the variable
				# will still point to un-simplified structures,
				# we only simplify the generated code.
				push get_binding(usr_symbol(key))

				for eachDependency in recursedDependencies
					if eachDependency[0] == "'"
						if DEBUG then console.log "gotta do something I have to replace a parameter with something that doesn't bind " + eachDependency
						deQuotedDep = eachDependency.substring(1)
						push(usr_symbol(deQuotedDep))
						push(usr_symbol("DONTBIND"+deQuotedDep))
						subst()
						if DEBUG then console.log "after substitution: " + stack[tos-1]

				try
					simplifyForCodeGeneration()
				catch error
					if PRINTOUTRESULT then console.log error
					errorMessage = error + ""
					#debugger
					init()

				if errorMessage == ""
					toBePrinted = pop()

					# we have to get all the variables used on the right side
					# here. I.e. to print the arguments it's better to look at the
					# actual method body after simplification.
					userVariablesMentioned = []
					collectUserSymbols(toBePrinted, userVariablesMentioned)

					allReturnedPlainStrings = ""
					allReturnedLatexStrings = ""
					codeGen = true
					generatedBody = toBePrinted.toString()
					codeGen = false
					bodyForReadableSummaryOfGeneratedCode = toBePrinted.toString()

					generatedBody = generatedBody.replace(/DONTBIND/g,"")
					bodyForReadableSummaryOfGeneratedCode = bodyForReadableSummaryOfGeneratedCode.replace(/DONTBIND/g,"")


					if variablesWithCycles.indexOf(key) != -1
						generatedCode += "// " + key + " is part of a cyclic dependency, no code generated."
						readableSummaryOfGeneratedCode += "#" + key + " is part of a cyclic dependency, no code generated."
					else

						###
						# using this paragraph instead of the following one
						# creates methods signatures that
						# are slightly less efficient
						# i.e. variables compare even if they are
						# simplified away.
						# In theory these signatures are more stable, but
						# in practice signatures vary quite a bit anyways
						# depending on previous assignments for example,
						# so it's unclear whether going for stability
						# is sensible at all..
						if recursedDependencies.length != 0
							parameters = "("
							for i in recursedDependencies
								if i.indexOf("'") != 0
									parameters += i + ", "
								else
									if recursedDependencies.indexOf(i.substring(1)) == -1
										parameters += i.substring(1) + ", "
						###

						if userVariablesMentioned.length != 0
							parameters = "("
							for i in userVariablesMentioned
								if i.printname.replace(/DONTBIND/g,"") != key
									parameters += i.printname.replace(/DONTBIND/g,"") + ", "

							# eliminate the last ", " for printout clarity
							parameters = parameters.replace /, $/gm , ""
							parameters += ")"
							generatedCode += key + " = function " + parameters + " { return ( " + generatedBody + " ); }"
							readableSummaryOfGeneratedCode += key + parameters + " = " + bodyForReadableSummaryOfGeneratedCode
						else
							generatedCode += key + " = " + generatedBody + ";"
							readableSummaryOfGeneratedCode += key + " = " + bodyForReadableSummaryOfGeneratedCode

					generatedCode += "\n"
					readableSummaryOfGeneratedCode += "\n"

					if DEBUG then console.log "		" + generatedCode

	# eliminate the last new line
	generatedCode = generatedCode.replace /\n$/gm , ""
	readableSummaryOfGeneratedCode = readableSummaryOfGeneratedCode.replace /\n$/gm , ""

	symbolsDependencies = {}
	symbolsHavingReassignments = []
	patternHasBeenFound = false
	if DEBUG then console.log "testable string: " + testableString

	return [testableString, scriptEvaluation[0], generatedCode, readableSummaryOfGeneratedCode, scriptEvaluation[1], errorMessage, dependencyInfo]

recursiveDependencies = (variableToBeChecked, arrayWhereDependenciesWillBeAdded, variablesAlreadyFleshedOut, variablesWithCycles, chainBeingChecked, cyclesDescriptions) ->
	variablesAlreadyFleshedOut.push variableToBeChecked

	# recursive dependencies can only be descended if the variable is not bound to a parameter
	if symbolsDependencies[chainBeingChecked[chainBeingChecked.length-1]]?
		if symbolsDependencies[chainBeingChecked[chainBeingChecked.length-1]].indexOf("'"+variableToBeChecked) != -1
			if DEBUG then console.log "can't keep following the chain of " + variableToBeChecked + " because it's actually a variable bound to a parameter"
			if arrayWhereDependenciesWillBeAdded.indexOf("'"+variableToBeChecked) == -1 and arrayWhereDependenciesWillBeAdded.indexOf(variableToBeChecked) == -1
				arrayWhereDependenciesWillBeAdded.push variableToBeChecked
			return arrayWhereDependenciesWillBeAdded

	chainBeingChecked.push variableToBeChecked

	if !symbolsDependencies[variableToBeChecked]?
		# end case: the passed variable has no dependencies
		# so there is nothing else to do
		if arrayWhereDependenciesWillBeAdded.indexOf(variableToBeChecked) == -1
			arrayWhereDependenciesWillBeAdded.push variableToBeChecked
		return arrayWhereDependenciesWillBeAdded
	else
		# recursion case: we have to dig deeper
		for i in symbolsDependencies[variableToBeChecked]

			# check that there is no recursion in dependencies
			# we do that by keeping a list of variables that
			# have already been "fleshed-out". If we encounter
			# any of those "fleshed-out" variables while
			# fleshing out, then there is a cycle 

			if chainBeingChecked.indexOf(i) != -1
				if DEBUG then console.log "	found cycle:"
				cyclesDescription = ""
				for k in chainBeingChecked
					if variablesWithCycles.indexOf(k) == -1
						variablesWithCycles.push k
					if DEBUG then console.log k + " --> "
					cyclesDescription += k + " --> "
				if DEBUG then console.log " ... then " + i + " again"
				cyclesDescription += " ... then " + i + " again"
				cyclesDescriptions.push cyclesDescription
				#if DEBUG then console.log "		--> cycle through " + i
				# we want to flesh-out i but it's already been
				# fleshed-out, just add it to the variables
				# with cycles and move on
				# todo refactor this, there are two copies of these two lines
				if variablesWithCycles.indexOf(i) == -1
					variablesWithCycles.push i
			else
				# flesh-out i recursively
				recursiveDependencies i, arrayWhereDependenciesWillBeAdded, variablesAlreadyFleshedOut, variablesWithCycles, chainBeingChecked, cyclesDescriptions
				chainBeingChecked.pop()
				#variablesAlreadyFleshedOut.pop()

		return arrayWhereDependenciesWillBeAdded



# parses and runs one statement/expression at a time
inited = false

latexErrorSign = "\\rlap{\\large\\color{red}\\bigtriangleup}{\\ \\ \\tiny\\color{red}!}"
turnErrorMessageToLatex = (theErrorMessage) ->
	theErrorMessage = theErrorMessage.replace(/\n/g,"")
	theErrorMessage = theErrorMessage.replace(/_/g, "} \\\\_ \\text{");
	theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(transpose_unicode), 'g'), "}{}^{T}\\text{");
	theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(dotprod_unicode), 'g'),"}\\cdot \\text{");
	theErrorMessage = theErrorMessage.replace("Stop:","}  \\quad \\text{Stop:");
	theErrorMessage = theErrorMessage.replace("->","}  \\rightarrow \\text{");
	theErrorMessage = theErrorMessage.replace("?","}\\enspace " + latexErrorSign + " \\enspace  \\text{");
	theErrorMessage = "$$\\text{" + theErrorMessage.replace(/\n/g,"") + "}$$"
	#console.log "theErrorMessage: " + theErrorMessage
	return theErrorMessage

# there are around a dozen different unicodes that
# represent some sort of middle dot, let's catch the most
# common and turn them into what we can process
normaliseDots = (stringToNormalise) ->
	stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(8901), 'g'), String.fromCharCode(dotprod_unicode));
	stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(8226), 'g'), String.fromCharCode(dotprod_unicode));
	stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(12539), 'g'), String.fromCharCode(dotprod_unicode));
	stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(55296), 'g'), String.fromCharCode(dotprod_unicode));
	stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(65381), 'g'), String.fromCharCode(dotprod_unicode));
	return stringToNormalise


CACHE_DEBUGS = false
CACHE_HITSMISS_DEBUGS = false
TIMING_DEBUGS = false

cacheMissPenalty = 0

run = (stringToBeRun, generateLatex = false) ->

	timeStart = new Date().getTime()

	#stringToBeRun = stringToBeRun + "\n"
	stringToBeRun = normaliseDots stringToBeRun
	#console.log "run running: " + stringToBeRun

	if ENABLE_CACHING and stringToBeRun != "clearall"
		currentStateHash = getStateHash()
		cacheKey = currentStateHash + " stringToBeRun: " + stringToBeRun
		if CACHE_DEBUGS then console.log "cache key: " + cacheKey
		possiblyCached = cached_runs.get(cacheKey)
		#possiblyCached = null
		if possiblyCached?
			if CACHE_HITSMISS_DEBUGS then console.log "cache hit!"
			unfreeze(possiblyCached)
			# return the output string
			if TIMING_DEBUGS
				totalTime = new Date().getTime() - timeStart
				console.log "core Algebrite time: " + totalTime + "ms, saved " + (possiblyCached[possiblyCached.length-2] - totalTime) + "ms due to cache hit"
			return possiblyCached[possiblyCached.length - 1]
		else
			if CACHE_HITSMISS_DEBUGS then console.log "cache miss"
			if TIMING_DEBUGS
				cacheMissPenalty = (new Date().getTime() - timeStart)

	if stringToBeRun == "selftest"
		selftest()
		return

	#if (setjmp(stop_return))
	#	return

	if !inited
		inited = true
		init()

	i = 0
	n = 0
	indexOfPartRemainingToBeParsed = 0

	allReturnedPlainStrings = ""
	allReturnedLatexStrings = ""

	while (1)
		# while we can keep scanning commands out of the
		# passed input AND we can execute them...

		try
			errorMessage = ""
			check_stack()
			n = scan(stringToBeRun.substring(indexOfPartRemainingToBeParsed))
			p1 = pop()
			check_stack()
		catch error
			if PRINTOUTRESULT then console.log error
			#debugger
			allReturnedPlainStrings += error.message
			if generateLatex
				#debugger
				theErrorMessage = turnErrorMessageToLatex error.message
				allReturnedLatexStrings += theErrorMessage
			init()
			break



		if (n == 0)
			break

		# if debug mode then print the source text

		#if (equaln(get_binding(symbol(TRACE)), 1)) {
		#	for (i = 0 i < n i++)
		#		if (s[i] != '\r')
		#			printchar(s[i])
		#	if (s[n - 1] != '\n') # n is not zero, see above
		#		printchar('\n')
		#}

		indexOfPartRemainingToBeParsed += n

		push(p1)
		#debugger
		errorWhileExecution = false
		try
			stringsEmittedByUserPrintouts = ""
			top_level_eval()
			#console.log "emitted string after top_level_eval(): >" + stringsEmittedByUserPrintouts + "<"
			#console.log "allReturnedPlainStrings string after top_level_eval(): >" + allReturnedPlainStrings + "<"

			p2 = pop()
			check_stack()

			if (isstr(p2))
				if DEBUG then console.log(p2.str)
				if DEBUG then console.log("\n")

			# if the return value is nil there isn't much point
			# in adding "nil" to the printout
			if (p2 == symbol(NIL))
				#collectedPlainResult = stringsEmittedByUserPrintouts
				collectedPlainResult = stringsEmittedByUserPrintouts
				if generateLatex
					collectedLatexResult = "$$" + stringsEmittedByUserPrintouts + "$$"
			else
				#console.log "emitted string before collectPlainStringFromReturnValue: >" + stringsEmittedByUserPrintouts + "<"
				#console.log "allReturnedPlainStrings string before collectPlainStringFromReturnValue: >" + allReturnedPlainStrings + "<"
				collectedPlainResult = print_expr(p2)
				collectedPlainResult += "\n"
				#console.log "collectedPlainResult: >" + collectedPlainResult + "<"
				if generateLatex
					collectedLatexResult = "$$" + collectLatexStringFromReturnValue(p2) + "$$"
					if DEBUG then console.log "collectedLatexResult: " + collectedLatexResult
			
			allReturnedPlainStrings += collectedPlainResult
			if generateLatex then allReturnedLatexStrings += collectedLatexResult

			if PRINTOUTRESULT
				if DEBUG then console.log "printline"
				if DEBUG then console.log collectedPlainResult
			#alert collectedPlainResult
			if PRINTOUTRESULT
				if DEBUG then console.log "display:"
				print2dascii(p2)

			if generateLatex then allReturnedLatexStrings += "\n"

		catch error
			errorWhileExecution = true
			collectedPlainResult = error.message
			if generateLatex then collectedLatexResult = turnErrorMessageToLatex error.message

			if PRINTOUTRESULT then console.log collectedPlainResult

			allReturnedPlainStrings += collectedPlainResult
			if collectedPlainResult != ""
				allReturnedPlainStrings += "\n"

			if generateLatex
				allReturnedLatexStrings += collectedLatexResult
				allReturnedLatexStrings += "\n"

			resetCache()
			init()

	if allReturnedPlainStrings[allReturnedPlainStrings.length-1] == "\n"
		allReturnedPlainStrings = allReturnedPlainStrings.substring(0,allReturnedPlainStrings.length-1)

	if generateLatex
		if allReturnedLatexStrings[allReturnedLatexStrings.length-1] == "\n"
			allReturnedLatexStrings = allReturnedLatexStrings.substring(0,allReturnedLatexStrings.length-1)

	if generateLatex
		if DEBUG then console.log "allReturnedLatexStrings: " + allReturnedLatexStrings
		# TODO handle this case of caching
		stringToBeReturned = [allReturnedPlainStrings, allReturnedLatexStrings]
	else
		stringToBeReturned = allReturnedPlainStrings

	if ENABLE_CACHING and stringToBeRun != "clearall" and !errorWhileExecution
		frozen = freeze()
		toBeFrozen = [frozen[0], frozen[1], frozen[2], frozen[3], frozen[4], frozen[5], (new Date().getTime() - timeStart), stringToBeReturned]
		if CACHE_DEBUGS then console.log "setting cache on key: " + cacheKey
		cached_runs.set(cacheKey, toBeFrozen)

	if TIMING_DEBUGS
		timingDebugWrite = "core Algebrite time: " + (new Date().getTime() - timeStart) + "ms"
		if ENABLE_CACHING  and stringToBeRun != "clearall" then timingDebugWrite += ", of which cache miss penalty: " + cacheMissPenalty + "ms"
		console.log timingDebugWrite

	allReturnedPlainStrings = ""
	allReturnedLatexStrings = ""
	return stringToBeReturned

check_stack = ->
	if (tos != 0)
		debugger
		stop("stack error")
	if (frame != TOS)
		debugger
		stop("frame error")
	if chainOfUserSymbolsNotFunctionsBeingEvaluated.length != 0
		debugger
		stop("symbols evaluation ongoing?")

# cannot reference symbols yet

# returns nil on stack if no result to print

top_level_eval = ->
	if DEBUG then console.log "#### top level eval"
	save()

	trigmode = 0

	p1 = symbol(AUTOEXPAND)

	if (iszero(get_binding(p1)))
		expanding = 0
	else
		expanding = 1

	p1 = pop()
	push(p1)
	Eval()
	p2 = pop()

	# "draw", "for" and "setq" return "nil", there is no result to print

	if (p2 == symbol(NIL))
		push(p2)
		restore()
		return

	# update "last" to contain the last result
	set_binding(symbol(LAST), p2)

	if (!iszero(get_binding(symbol(BAKE))))
		push(p2)
		bake()
		p2 = pop()

	# If we evaluated the symbol "i" or "j" and the result was sqrt(-1)

	# then don't do anything.

	# Otherwise if "j" is an imaginary unit then subst.

	# Otherwise if "i" is an imaginary unit then subst.

	if ((p1 == symbol(SYMBOL_I) || p1 == symbol(SYMBOL_J)) && isimaginaryunit(p2))
		doNothing = 0
	else if (isimaginaryunit(get_binding(symbol(SYMBOL_J))))
		push(p2)
		push(imaginaryunit)
		push_symbol(SYMBOL_J)
		subst()
		p2 = pop()
	else if (isimaginaryunit(get_binding(symbol(SYMBOL_I))))
		push(p2)
		push(imaginaryunit)
		push_symbol(SYMBOL_I)
		subst()
		p2 = pop()

	#ifndef LINUX ----------------------

	# if we evaluated the symbol "a" and got "b" then print "a=b"

	# do not print "a=a"

	#if (issymbol(p1) && !iskeyword(p1) && p1 != p2 && test_flag == 0)
	#	push_symbol(SETQ)
	#	push(p1)
	#	push(p2)
	#	list(3)
	#	p2 = pop()
	#endif -----------------------------

	push(p2)

	restore()

check_esc_flag = ->
	if (esc_flag)
		stop("esc key")

# this is called when the whole notebook is re-run
# so we get the chance of clearing the whole state from
# scratch.
# In practice, the state we need to clear that persists
# across blocks are only the patterns, so
# just eject those.
clearAlgebraEnvironment = ->
	#console.log "CLEARING clearAlgebraEnvironment ============================================================="
	do_clearall()

computeDependenciesFromAlgebra = (codeFromAlgebraBlock) ->
	return findDependenciesInScript(codeFromAlgebraBlock, true)[6]

computeResultsAndJavaScriptFromAlgebra = (codeFromAlgebraBlock) ->

	keepState = true

	timeStartFromAlgebra  = new Date().getTime()
	# we start "clean" each time:
	# clear all the symbols and then re-define
	# the "starting" symbols.
	
	#console.log "codeFromAlgebraBlock: " + codeFromAlgebraBlock

	codeFromAlgebraBlock = normaliseDots codeFromAlgebraBlock

	##userSimplificationsInListForm = []
	userSimplificationsInProgramForm = ""

	if !keepState?
		for i in userSimplificationsInListForm
			#console.log "silentpattern(" + car(i) + ","+cdr(i)+")"
			userSimplificationsInProgramForm += "silentpattern(" + car(i) + ","+ car(cdr(i)) + "," + car(cdr(cdr(i))) + ")\n"

		do_clearall()

	codeFromAlgebraBlock = userSimplificationsInProgramForm + codeFromAlgebraBlock
	#console.log "codeFromAlgebraBlock including patterns: " + codeFromAlgebraBlock

	#debugger
	[testableStringIsIgnoredHere,result,code,readableSummaryOfCode, latexResult, errorMessage, dependencyInfo] =
		findDependenciesInScript(codeFromAlgebraBlock)

	if readableSummaryOfCode != "" or errorMessage != ""
		result += "\n" + readableSummaryOfCode
		if errorMessage != ""
			result += "\n" + errorMessage
		result = result.replace /\n/g,"\n\n"

		latexResult += "\n" + "$$" + readableSummaryOfCode + "$$"
		if errorMessage != ""
			latexResult += turnErrorMessageToLatex  errorMessage
		latexResult = latexResult.replace /\n/g,"\n\n"


	code = code.replace /Math\./g,""
	code = code.replace /\n/g,"\n\n"

	#console.log "code: " + code
	#console.log "result: " + result
	#console.log "latexResult: " + latexResult

	if TIMING_DEBUGS
		console.log "total time from notebook and back: " + ((new Date().getTime()) - timeStartFromAlgebra) + "ms"


	#code: "// no code generated yet\n//try again later"
	#code: "console.log('some passed code is run'); window.something = 1;"
	code: code

	# TODO temporarily pass latex in place of standard result too
	result: latexResult
	latexResult: latexResult
	dependencyInfo: dependencyInfo
	
(exports ? this).run = run
(exports ? this).findDependenciesInScript = findDependenciesInScript
(exports ? this).computeDependenciesFromAlgebra = computeDependenciesFromAlgebra
(exports ? this).computeResultsAndJavaScriptFromAlgebra = computeResultsAndJavaScriptFromAlgebra
(exports ? this).clearAlgebraEnvironment = clearAlgebraEnvironment
