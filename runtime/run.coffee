

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
	clear_symbols(); defn()

	testResult = findDependenciesInScript('1')
	if testResult[0] == "All local dependencies: . All dependencies recursively: " and
		testResult[1] == "1" and
		testResult[2] == ""
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = x+1\n g = f\n h = g\n f = g')
	if testResult[0] == "All local dependencies:  variable f depends on: x, g, ;  variable g depends on: f, ;  variable h depends on: g, ; . All dependencies recursively:  variable f depends on: x, ;  f --> g -->  ... then f again,  variable g depends on: x, ;  g --> f -->  ... then g again,  variable h depends on: x, ;  h --> g --> f -->  ... then g again, " and
		testResult[1] == "" and
		testResult[2] == "// f is part of a cyclic dependency, no code generated.\n// g is part of a cyclic dependency, no code generated.\n// h is part of a cyclic dependency, no code generated."
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	if findDependenciesInScript('f = x+1\n g = f + y\n h = g')[0] == "All local dependencies:  variable f depends on: x, ;  variable g depends on: f, y, ;  variable h depends on: g, ; . All dependencies recursively:  variable f depends on: x, ;  variable g depends on: x, y, ;  variable h depends on: x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	if findDependenciesInScript('g = h(x,y)')[0] == "All local dependencies:  variable g depends on: h, x, y, ; . All dependencies recursively:  variable g depends on: h, x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	if findDependenciesInScript('f(x,y) = k')[0] == "All local dependencies:  variable f depends on: 'x, 'y, k, ; . All dependencies recursively:  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	if findDependenciesInScript('x = z\n f(x,y) = k')[0] == "All local dependencies:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; . All dependencies recursively:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	if findDependenciesInScript('x = z\n g = f(x,y)')[0] == "All local dependencies:  variable x depends on: z, ;  variable g depends on: f, x, y, ; . All dependencies recursively:  variable x depends on: z, ;  variable g depends on: f, z, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	if findDependenciesInScript('x = 1\n x = y\n x = z')[0] == "All local dependencies:  variable x depends on: y, z, ; . All dependencies recursively:  variable x depends on: y, z, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = y*y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( Math.pow(y, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = -sqrt(2)/2')
	if testResult[0] == "All local dependencies:  variable x depends on: sqrt, ; . All dependencies recursively:  variable x depends on: sqrt, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (sqrt) { return ( -1/2*Math.pow(2, (1/2)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = 2^(1/2-a)*2^a/10')
	if testResult[0] == "All local dependencies:  variable x depends on: a, ; . All dependencies recursively:  variable x depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (a) { return ( 1/10*Math.pow(2, (1/2)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = rationalize(t*y/(t+y)+2*t^2*y*(2*t+y)^(-2))')
	if testResult[0] == "All local dependencies:  variable x depends on: t, y, ; . All dependencies recursively:  variable x depends on: t, y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (t, y) { return ( t*y*(6*Math.pow(t, 2) + Math.pow(y, 2) + 6*t*y) / ((t + y)*Math.pow((2*t + y), 2)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = mag((a+i*b)/(c+i*d))')
	if testResult[0] == "All local dependencies:  variable x depends on: a, b, c, d, ; . All dependencies recursively:  variable x depends on: a, b, c, d, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (a, b, c, d) { return ( Math.pow((Math.pow(a, 2) + Math.pow(b, 2)), (1/2)) / (Math.pow((Math.pow(c, 2) + Math.pow(d, 2)), (1/2))) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2 + y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( 1 + y ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = 1;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f(x) = x * x')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, x, ; . All dependencies recursively:  variable f depends on: 'x, x, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (x) { return ( x*x ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, x, g, y, ; . All dependencies recursively:  variable f depends on: 'x, x, g, y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (x, g, y) { return ( g(y) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('y = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable y depends on: ;  variable f depends on: 'x, x, g, y, ; . All dependencies recursively:  variable y depends on: ;  variable f depends on: 'x, x, g, ; " and
		testResult[1] == "" and
		testResult[2] == "y = 2;\nf = function (x, g) { return ( g(2) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('g(x) = x + 2\ny = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, x, ;  variable y depends on: ;  variable f depends on: 'x, x, g, y, ; . All dependencies recursively:  variable g depends on: 'x, x, ;  variable y depends on: ;  variable f depends on: 'x, x, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\ny = 2;\nf = function (x) { return ( 4 + Math.pow(x, 2) ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('g(x) = x + 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, x, ;  variable f depends on: 'x, x, g, y, ; . All dependencies recursively:  variable g depends on: 'x, x, ;  variable f depends on: 'x, x, y, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\nf = function (x, y) { return ( 2 + y + Math.pow(x, 2) ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	###
	testResult = findDependenciesInScript('g(x) = f(x)\nf(x)=g(x)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, f, x, ;  variable f depends on: 'x, g, x, ; . All dependencies recursively:  variable g depends on: 'x, x, ;  g --> f -->  ... then g again,  variable f depends on: 'x, x, ;  f --> g -->  ... then f again, " and
		testResult[1] == "" and
		testResult[2] == "// g is part of a cyclic dependency, no code generated.\n// f is part of a cyclic dependency, no code generated."
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()
	###

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c, x)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) + b / a),1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) - b / a)] ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) + b / a),1/2*(Math.pow((Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a), (1/2)) - b / a)] ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = roots(integral(a*x + b))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, ; . All dependencies recursively:  variable f depends on: a, b, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b) { return ( [0,-2*b / a] ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y,y,0,1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / (2*a) ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y + z,y,0,1, z, 0, 1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / a ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = defint(2*x - 3*y,x,0,2*y)')
	if testResult[0] == "All local dependencies:  variable f depends on: y, ; . All dependencies recursively:  variable f depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (y) { return ( -2*Math.pow(y, 2) ); }"
	else
			console.log "fail dependency test. expected: " + testResult

	clear_symbols(); defn()

	testResult = findDependenciesInScript('f = defint(12 - x^2 - (y^2)/2,x,0,2,y,0,3)')
	if testResult[0] == "All local dependencies:  variable f depends on: ; . All dependencies recursively:  variable f depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "f = 55;"
	else
			console.log "fail dependency test. expected: " + testResult

	console.log "-- done dependency tests"

findDependenciesInScript = (stringToBeParsed) ->

	if DEBUG then console.log "stringToBeParsed: " + stringToBeParsed
	inited = true
	codeGen = true
	symbolsDependencies = {}
	indexOfPartRemainingToBeParsed = 0

	allReturnedPlainStrings = ""
	n = 0
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
		testableString +=  " variable " + key + " depends on: "
		for i in value
			if DEBUG then console.log "		" + i
			testableString +=  i + ", "
		testableString += "; "
	testableString += ". "

	# print out all global dependencies as collected by this
	# parsing pass
	if DEBUG then console.log "All dependencies recursively ----------------"
	testableString += "All dependencies recursively: "

	scriptEvaluation = ["",""]
	generatedCode = ""
	readableSummaryOfGeneratedCode = ""

	if errorMessage == ""
		scriptEvaluation = run(stringToBeParsed, true)

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
			simplifyForCodeGeneration()
			toBePrinted = pop()

			codeGen = true
			generatedBody = toBePrinted.toString()
			codeGen = false
			bodyForReadableSummaryOfGeneratedCode = toBePrinted.toString()

			if variablesWithCycles.indexOf(key) != -1
				generatedCode += "// " + key + " is part of a cyclic dependency, no code generated."
				readableSummaryOfGeneratedCode += "#" + key + " is part of a cyclic dependency, no code generated."
			else
				if recursedDependencies.length != 0
					parameters = "("
					for i in recursedDependencies
						if i.indexOf("'") == -1
							parameters += i + ", "
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
	if DEBUG then console.log "testable string: " + testableString

	return [testableString, scriptEvaluation[0], generatedCode, readableSummaryOfGeneratedCode, scriptEvaluation[1], errorMessage]

recursiveDependencies = (variableToBeChecked, arrayWhereDependenciesWillBeAdded, variablesAlreadyFleshedOut, variablesWithCycles, chainBeingChecked, cyclesDescriptions) ->
	variablesAlreadyFleshedOut.push variableToBeChecked
	chainBeingChecked.push variableToBeChecked
	if !symbolsDependencies[variableToBeChecked]?
		# end case: there are no more dependencies
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
	theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(transpose_unicode), 'g'), "}{}^{T}\\text{");
	theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(dotprod_unicode), 'g'),"}\\cdot \\text{");
	theErrorMessage = theErrorMessage.replace("Stop:","} \\text{Stop:");
	theErrorMessage = theErrorMessage.replace("?","}\\quad " + latexErrorSign + " \\quad  \\text{");
	theErrorMessage = "$$\\text{" + theErrorMessage.replace(/\n/g,"") + "}$$"
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


run = (stringToBeRun, generateLatex = false) ->

	#stringToBeRun = stringToBeRun + "\n"
	stringToBeRun = normaliseDots stringToBeRun


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
	if generateLatex
		allReturnedLatexStrings = ""

	while (1)

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
		try
			top_level_eval()

			p2 = pop()
			check_stack()

			if (p2 == symbol(NIL))
				continue

			# print string w/o quotes

			if (isstr(p2))
				if DEBUG then console.log(p2.str)
				if DEBUG then console.log("\n")
				continue

			# in tty mode
			# also you could just have written 
			# printline(p2)
			collectedPlainResult = collectPlainResultLine(p2)
			if generateLatex
				collectedLatexResult = "$$" + collectLatexResultLine(p2) + "$$"
				if DEBUG then console.log "collectedLatexResult: " + collectedLatexResult
			
			allReturnedPlainStrings += collectedPlainResult
			if generateLatex then allReturnedLatexStrings += collectedLatexResult
			if PRINTOUTRESULT
				if DEBUG then console.log "printline"
				if DEBUG then console.log collectedPlainResult
			#alert collectedPlainResult
			if PRINTOUTRESULT
				if DEBUG then console.log "display:"
				display(p2)

			allReturnedPlainStrings += "\n"
			if generateLatex then allReturnedLatexStrings += "\n"

		catch error
			collectedPlainResult = error.message
			if generateLatex then collectedLatexResult = turnErrorMessageToLatex error.message

			if PRINTOUTRESULT then console.log collectedPlainResult

			allReturnedPlainStrings += collectedPlainResult
			allReturnedPlainStrings += "\n"

			if generateLatex
				allReturnedLatexStrings += collectedLatexResult
				allReturnedLatexStrings += "\n"

			init()

	if allReturnedPlainStrings[allReturnedPlainStrings.length-1] == "\n"
		allReturnedPlainStrings = allReturnedPlainStrings.substring(0,allReturnedPlainStrings.length-1)

	if generateLatex
		if allReturnedLatexStrings[allReturnedLatexStrings.length-1] == "\n"
			allReturnedLatexStrings = allReturnedLatexStrings.substring(0,allReturnedLatexStrings.length-1)

	if generateLatex
		if DEBUG then console.log "allReturnedLatexStrings: " + allReturnedLatexStrings
		return [allReturnedPlainStrings, allReturnedLatexStrings]
	else
		return allReturnedPlainStrings

check_stack = ->
	if (tos != 0)
		debugger
		stop("stack error")
	if (frame != TOS)
		debugger
		stop("frame error")

# cannot reference symbols yet

# s is a string here
echo_input = (s) ->
	console.log(s)
	console.log("\n")

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

	# update "last"

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

computeResultsAndJavaScriptFromAlgebra = (codeFromAlgebraBlock) ->
	# we start "clean" each time:
	# clear all the symbols and then re-define
	# the "starting" symbols.
	
	#console.log "codeFromAlgebraBlock: " + codeFromAlgebraBlock

	codeFromAlgebraBlock = normaliseDots codeFromAlgebraBlock

	##userSimplificationsInListForm = []
	userSimplificationsInProgramForm = ""
	for i in userSimplificationsInListForm
		#console.log "userSimplificationsInListForm: " + i
		#console.log "pattern(" + car(i) + ","+cdr(i)+")"
		userSimplificationsInProgramForm += "pattern(" + car(i) + ","+ car(cdr(i))+")\n"

	userSimplificationsInListForm = []
	userSimplificationsInStringForm = []
	clear_symbols()
	defn()

	codeFromAlgebraBlock = userSimplificationsInProgramForm + codeFromAlgebraBlock
	#console.log "codeFromAlgebraBlock including patterns: " + codeFromAlgebraBlock

	#debugger
	[testableStringIsIgnoredHere,result,code,readableSummaryOfCode, latexResult, errorMessage] =
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

	#code: "// no code generated yet\n//try again later"
	#code: "console.log('some passed code is run'); window.something = 1;"
	code: code

	# TODO temporarily pass latex in place of standard result too
	result: latexResult
	latexResult: latexResult
	
(exports ? this).run = run
(exports ? this).findDependenciesInScript = findDependenciesInScript
(exports ? this).computeResultsAndJavaScriptFromAlgebra = computeResultsAndJavaScriptFromAlgebra
