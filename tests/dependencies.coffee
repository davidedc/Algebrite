test_dependencies = ->
	do_clearall()

	testResult = findDependenciesInScript('1')
	if testResult[0] == "All local dependencies: . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively: " and
		testResult[1] == "1" and
		testResult[2] == ""
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# check that floats in code are expressed with maximum precision -------------------
	testResult = findDependenciesInScript('a = float(1/3)')
	if testResult[0] == "All local dependencies:  variable a depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "a = 0.3333333333333333;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('a = float(10^50)')
	if testResult[0] == "All local dependencies:  variable a depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "a = 1e+50;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = x+1\n g = f\n h = g\n f = g')
	if testResult[0] == "All local dependencies:  variable f depends on: x, g, ;  variable g depends on: f, ;  variable h depends on: g, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: x, ;  f --> g -->  ... then f again,  variable g depends on: x, ;  g --> f -->  ... then g again,  variable h depends on: x, ;  h --> g --> f -->  ... then g again, " and
		testResult[1] == "" and
		testResult[2] == "// f is part of a cyclic dependency, no code generated.\n// g is part of a cyclic dependency, no code generated.\n// h is part of a cyclic dependency, no code generated."
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	if findDependenciesInScript('f = x+1\n g = f + y\n h = g')[0] == "All local dependencies:  variable f depends on: x, ;  variable g depends on: f, y, ;  variable h depends on: g, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: x, ;  variable g depends on: x, y, ;  variable h depends on: x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('g = h(x,y)')[0] == "All local dependencies:  variable g depends on: h, x, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: h, x, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('f(x,y) = k')[0] == "All local dependencies:  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = z\n f(x,y) = k')[0] == "All local dependencies:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: z, ;  variable f depends on: 'x, 'y, k, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = z\n g = f(x,y)')[0] == "All local dependencies:  variable x depends on: z, ;  variable g depends on: f, x, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: z, ;  variable g depends on: f, z, y, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	if findDependenciesInScript('x = 1\n x = y\n x = z')[0] == "All local dependencies:  variable x depends on: y, z, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, z, ; "
		console.log "ok dependency test"
	else
		console.log "fail dependency test"

	do_clearall()

	testResult = findDependenciesInScript('x = y*y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( Math.pow(y, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = e*e')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = Math.exp(2);"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	testResult = findDependenciesInScript('x = e')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = Math.E;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	testResult = findDependenciesInScript('x = -sqrt(2)/2')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = -1/2*Math.SQRT2;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = 2^(1/2-a)*2^a/10')
	if testResult[0] == "All local dependencies:  variable x depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "x = 1/10*Math.SQRT2;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = rationalize(t*y/(t+y)+2*t^2*y*(2*t+y)^(-2))')
	if testResult[0] == "All local dependencies:  variable x depends on: t, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: t, y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (t, y) { return ( t*y*(6*Math.pow(t, 2) + Math.pow(y, 2) + 6*t*y) / ((t + y)*Math.pow((2*t + y), 2)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = abs((a+i*b)/(c+i*d))')
	if testResult[0] == "All local dependencies:  variable x depends on: a, b, c, d, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, b, c, d, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (a, b, c, d) { return ( Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) / (Math.sqrt(Math.pow(c, 2) + Math.pow(d, 2))) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult[2] + " obtained: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2 + y')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( 1 + y ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = y + cos(1) + sin(1)')
	if testResult[0] == "All local dependencies:  variable x depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (y) { return ( y + Math.cos(1) + Math.sin(1) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = a + arccos(b) + arcsin(c)')
	if testResult[0] == "All local dependencies:  variable x depends on: a, arccos, b, arcsin, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: a, arccos, b, arcsin, c, ; " and
		testResult[1] == "" and
		testResult[2] == "x = function (a, b, c) { return ( a + Math.acos(b) + Math.asin(c) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('x = sin(1/10)^2 + cos(1/10)^2')
	if testResult[0] == "All local dependencies:  variable x depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable x depends on: ; " and
		testResult[1] == "" and
		testResult[2] == "x = 1;"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('a = unit(b) + c')
	if testResult[0] == "All local dependencies:  variable a depends on: b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (c, b) { return ( c + identity(b) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f(x) = x * x')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (x) { return ( x*x ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: 'x, g, y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (g, y, x) { return ( g(y) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('y = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable y depends on: ;  variable f depends on: 'x, g, ; " and
		testResult[1] == "" and
		testResult[2] == "y = 2;\nf = function (g, x) { return ( g(2) + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('g(x) = x + 2\ny = 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable y depends on: ;  variable f depends on: 'x, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\ny = 2;\nf = function (x) { return ( 4 + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('g(x) = x + 2\nf(x) = x * x + g(y)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, ;  variable f depends on: 'x, g, y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  variable f depends on: 'x, y, ; " and
		testResult[1] == "" and
		testResult[2] == "g = function (x) { return ( 2 + x ); }\nf = function (y, x) { return ( 2 + y + Math.pow(x, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	###
	testResult = findDependenciesInScript('g(x) = f(x)\nf(x)=g(x)')
	if testResult[0] == "All local dependencies:  variable g depends on: 'x, f, x, ;  variable f depends on: 'x, g, x, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable g depends on: 'x, ;  g --> f -->  ... then g again,  variable f depends on: 'x, x, ;  f --> g -->  ... then f again, " and
		testResult[1] == "" and
		testResult[2] == "// g is part of a cyclic dependency, no code generated.\n// f is part of a cyclic dependency, no code generated."
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()
	###

	testResult = findDependenciesInScript('piApprox = sum((-1)^k * (1/(2*k + 1)),k,0,iterations)*4')
	if testResult[0] == "All local dependencies:  variable piApprox depends on: iterations, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable piApprox depends on: iterations, ; " and
		testResult[1] == "" and
		testResult[2] == "piApprox = function (iterations) { return ( 4*(function(){ var k;  var holderSum = 0;  var lowerlimit = 0;  var upperlimit = iterations;  for (k = lowerlimit; k < upperlimit; k++) {    holderSum += Math.pow((-1), k) / (2*k + 1); }  return holderSum;})() ); }" and
		testResult[3] == "piApprox(iterations) = 4\\sum_{k=0}^{iterations}{\\frac{(-1)^k}{(2k+1)}}"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('piApprox = 2*product(4*k^2/(4*k^2-1),k,1,iterations)')
	if testResult[0] == "All local dependencies:  variable piApprox depends on: iterations, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable piApprox depends on: iterations, ; " and
		testResult[1] == "" and
		testResult[2] == "piApprox = function (iterations) { return ( 2*(function(){ var k;  var holderProduct = 1;  var lowerlimit = 1;  var upperlimit = iterations;  for (k = lowerlimit; k < upperlimit; k++) {    holderProduct *= 4*Math.pow(k, 2) / (4*Math.pow(k, 2) - 1); }  return holderProduct;})() ); }" and
		testResult[3] == "piApprox(iterations) = 2\\prod_{k=1}^{iterations}{\\frac{4k^2}{(4k^2-1)}}"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c, x)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.sqrt(Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a) + b / a),1/2*(Math.sqrt(Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a) - b / a)] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult[2] + " obtained: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(a*x^2 + b*x + c)')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, c, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, c, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b, c) { return ( [-1/2*(Math.sqrt(Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a) + b / a),1/2*(Math.sqrt(Math.pow(b, 2) / (Math.pow(a, 2)) - 4*c / a) - b / a)] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult[2] + " obtained: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(integral(a*x + b))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, b, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, b, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a, b) { return ( [0,-2*b / a] ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y,y,0,1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / (2*a) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = roots(defint(a*x + y + z,y,0,1, z, 0, 1))')
	if testResult[0] == "All local dependencies:  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: a, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (a) { return ( -1 / a ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = defint(2*x - 3*y,x,0,2*y)')
	if testResult[0] == "All local dependencies:  variable f depends on: y, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: y, ; " and
		testResult[1] == "" and
		testResult[2] == "f = function (y) { return ( -2*Math.pow(y, 2) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('f = defint(12 - x^2 - (y^2)/2,x,0,2,y,0,3)')
	if testResult[0] == "All local dependencies:  variable f depends on: ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable f depends on: ; " and
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
	if testResult[0] == "All local dependencies:  variable a depends on: ;  variable f depends on: 'a, b, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: 'a, b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = 2;\nf = function (a, b) { return ( 1 + a + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# similar as test above but this time we are not
	# defining a function, so things are a bit different.
	testResult = findDependenciesInScript('a = 2\nf = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ;  variable f depends on: ; " and
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
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (b) { return ( 1 + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# another tricky case of indirection through quote
	testResult = findDependenciesInScript('a := b\nf(a) = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: 'a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: 'a, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (a) { return ( 1 + a ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# reassignment
	testResult = findDependenciesInScript('b = 1\nb=a+b+c')
	if testResult[0] == "All local dependencies:  variable b depends on: a, c, ; . Symbols with reassignments: b, . Symbols in expressions without assignments: . All dependencies recursively:  variable b depends on: a, c, ; " and
		testResult[1] == "" and
		testResult[2] == "b = function (a, c) { return ( 1 + a + c ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	# reassignment
	testResult = findDependenciesInScript('a = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: ; . Symbols with reassignments: a, . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: ; " and
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

	testResult = computeDependenciesFromAlgebra('PCA(M) = eig(Mᵀ⋅M)')
	if testResult.affectsVariables.length is 1 and
		testResult.affectsVariables.indexOf("PCA") != -1 and
		testResult.affectsVariables.indexOf("PATTERN_DEPENDENCY") == -1 and
		testResult.affectedBy.length is 1 and
		testResult.affectedBy.indexOf("PATTERN_DEPENDENCY") != -1
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = computeDependenciesFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
	if testResult.affectsVariables.length is 1 and
		testResult.affectsVariables.indexOf("PATTERN_DEPENDENCY") != -1 and
		testResult.affectedBy.length is 1 and
		testResult.affectedBy.indexOf("PATTERN_DEPENDENCY") != -1
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('a = b\nf = a+1')
	if testResult[0] == "All local dependencies:  variable a depends on: b, ;  variable f depends on: a, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable a depends on: b, ;  variable f depends on: b, ; " and
		testResult[1] == "" and
		testResult[2] == "a = function (b) { return ( b ); }\nf = function (b) { return ( 1 + b ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	testResult = findDependenciesInScript('PCA(M) = eig(cov(M))')
	if testResult[0] == "All local dependencies:  variable PCA depends on: 'M, ; . Symbols with reassignments: . Symbols in expressions without assignments: . All dependencies recursively:  variable PCA depends on: 'M, ; " and
		testResult[1] == "" and
		testResult[2] == "PCA = function (M) { return ( eig(cov(M)) ); }"
			console.log "ok dependency test"
	else
			console.log "fail dependency test. expected: " + testResult

	do_clearall()

	computeResultsAndJavaScriptFromAlgebra('PCA(M) = eig(Mᵀ⋅M)')
	testResult = run('symbolsinfo')
	if testResult.indexOf('AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE') != -1 
			console.log "fail dependency tests. found AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE"
	else
			console.log "ok dependency test"

	do_clearall()

	# this checks error handling in case of pattern and syntax error
	# picked up during scanning.
	computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
	computeResultsAndJavaScriptFromAlgebra('simplify(')
	testResult = computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M')

	if testResult.code == "PCA = function (M) { return ( cov(M) ); }" and
		testResult.latexResult == "$$PCA(M) = cov(M)$$" and
		testResult.result == "$$PCA(M) = cov(M)$$" and
		testResult.dependencyInfo.affectedBy[0] == "M" and
		testResult.dependencyInfo.affectedBy[1] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 1 and
		testResult.dependencyInfo.affectsVariables[0] == "PCA"
				console.log "ok dependency test"
		else
				console.log "fail dependency tests. Error handling 1"
				console.log testResult
				return

	do_clearall()

	
	if ENABLE_CACHING
		console.log "checking hit/miss patterns ======================="
		resetCache()
		original_CACHE_HITSMISS_DEBUGS = CACHE_HITSMISS_DEBUGS
		CACHE_HITSMISS_DEBUGS = true

		# first two should miss because caches are completely empty
		# note that each call produces two misses because one is from
		# "findDependenciesInScript" itself and one is from "run" 
		# after these two, all the others should hit a cache
		computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
		computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M')

		if totalAllCachesHits() != 0
			console.log "test checking hit/miss patterns fail, got: " + totalAllCachesHits() + " instead of 0"

		clearAlgebraEnvironment()
		console.log "\nclearAlgebraEnvironment()"
		currentStateHash = getStateHash()
		console.log "state hash after nclearAlgebraEnvironment: " + currentStateHash
		console.log "\n"

		computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
		computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M')

		if totalAllCachesHits() != 2
			console.log "test checking hit/miss patterns fail, got: " + totalAllCachesHits() + " instead of 2"

		clearAlgebraEnvironment()
		console.log "\nclearAlgebraEnvironment()"
		currentStateHash = getStateHash()
		console.log "state hash after nclearAlgebraEnvironment: " + currentStateHash
		console.log "\n"

		computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
		computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M')
		CACHE_HITSMISS_DEBUGS = original_CACHE_HITSMISS_DEBUGS

		if totalAllCachesHits() != 4
			console.log "test checking hit/miss patterns fail, got: " + totalAllCachesHits() + " instead of 4"

		clearAlgebraEnvironment()
		console.log "\nclearAlgebraEnvironment()"
		currentStateHash = getStateHash()
		console.log "state hash after nclearAlgebraEnvironment: " + currentStateHash
		console.log "\n"

		computeResultsAndJavaScriptFromAlgebra('pattern(a_ᵀ⋅a_, cov(a_))')
		# note that in case of syntax error, "last" is not updated.
		# so if new symbols have been scanned yet, then they are not created
		# and the cache should hit
		# TODO ideally a scan resulting in an error should produce no new
		# symbols in the symbol table at all
		computeResultsAndJavaScriptFromAlgebra('simplify(')

		currentStateHash = getStateHash()
		console.log "state hash after syntax error: " + currentStateHash

		computeResultsAndJavaScriptFromAlgebra('PCA = Mᵀ·M')
		CACHE_HITSMISS_DEBUGS = original_CACHE_HITSMISS_DEBUGS

		if totalAllCachesHits() != 6
			console.log "test checking hit/miss patterns fail, got: " + totalAllCachesHits() + " instead of 6"

		if totalAllCachesMisses() != 5
			console.log "test checking hit/miss patterns fail, got: " + totalAllCachesMisses() + " instead of 5"


		resetCache()
		do_clearall()
		console.log "end of checking hit/miss patterns ======================="

	testResult = computeResultsAndJavaScriptFromAlgebra('x + x + x')

	if testResult.code == "" and
		testResult.latexResult == "$$3x$$" and
		testResult.result == "$$3x$$" and
		testResult.dependencyInfo.affectedBy.length == 2 and
		testResult.dependencyInfo.affectedBy[0] == "x" and
		testResult.dependencyInfo.affectedBy[1] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 0
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"

	do_clearall()

	computeResultsAndJavaScriptFromAlgebra('x = y + 2')
	testResult = computeResultsAndJavaScriptFromAlgebra('x + x + x')

	if testResult.code == "" and
		testResult.latexResult == "$$3y+6$$" and
		testResult.result == "$$3y+6$$" and
		testResult.dependencyInfo.affectedBy.length == 2 and
		testResult.dependencyInfo.affectedBy[0] == "x" and
		testResult.dependencyInfo.affectedBy[1] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 0
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"

	do_clearall()

	testResult = computeResultsAndJavaScriptFromAlgebra('[[0,1],[1,0]]')

	console.log "testResult.latexResult " + testResult.latexResult
	console.log "testResult.result " + testResult.result
	if testResult.latexResult == "$$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$" and
		testResult.result == "$$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$" and
		testResult.dependencyInfo.affectsVariables.length == 0
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"

	do_clearall()

	testResult = computeResultsAndJavaScriptFromAlgebra('x = [[0,1],[1,0]]')

	console.log "testResult.latexResult " + testResult.latexResult
	console.log "testResult.result " + testResult.result
	if testResult.code == "x = [[0,1],[1,0]];" and
		testResult.latexResult == "$$x = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$" and
		testResult.result == "$$x = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$$" and
		testResult.dependencyInfo.affectedBy.length == 1 and
		testResult.dependencyInfo.affectedBy[0] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 1 and
		testResult.dependencyInfo.affectsVariables[0] == "x"
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"

	do_clearall()

	# a simple array lookup like this is turned into
	# a function, which is slighly silly but
	# it's orthogonal, this works also if instead of
	# b we have an arbitrary non-trivial function
	# on b, maybe even symbolic e.g. the round
	# of the root of by = 6, i.e. round(root(by-6,y))
	testResult = computeResultsAndJavaScriptFromAlgebra('x = a[b]')

	console.log "testResult.latexResult " + testResult.latexResult
	console.log "testResult.result " + testResult.result
	console.log "testResult.code " + testResult.code
	console.log "testResult.dependencyInfo.affectedBy " + testResult.dependencyInfo.affectedBy
	if testResult.code == "x = function (a, b) { return ( a[b] ); }" and
		testResult.latexResult == "$$x(a, b) = a[b]$$" and
		testResult.result == "$$x(a, b) = a[b]$$" and
		testResult.dependencyInfo.affectedBy.length == 3 and
		testResult.dependencyInfo.affectedBy[0] == "a" and
		testResult.dependencyInfo.affectedBy[1] == "b" and
		testResult.dependencyInfo.affectedBy[2] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 1 and
		testResult.dependencyInfo.affectsVariables[0] == "x"
				console.log "ok dependency test"
		else
				console.log "fail dependency tests "

	do_clearall()

	testResult = computeResultsAndJavaScriptFromAlgebra('x = a ⋅ b')

	if testResult.code == "x = function (a, b) { return ( dot(a, b) ); }" and
		testResult.latexResult == "$$x(a, b) = a \\cdot b$$" and
		testResult.result == "$$x(a, b) = a \\cdot b$$" and
		testResult.dependencyInfo.affectedBy.length == 3 and
		testResult.dependencyInfo.affectedBy[0] == "a" and
		testResult.dependencyInfo.affectedBy[1] == "b" and
		testResult.dependencyInfo.affectedBy[2] == "PATTERN_DEPENDENCY" and
		testResult.dependencyInfo.affectsVariables.length == 1 and
		testResult.dependencyInfo.affectsVariables[0] == "x"
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"

	do_clearall()

	# Here we test an actual sequence of invokations form the
	# notebook.

	code1 = 'pattern(a_ᵀ⋅a_, cov(a_))'
	code2 = 'PCA = Mᵀ·M'

	# invokation sequence, we check that the
	# full evaluation of the last piece of code
	# gives the correct result.
	computeDependenciesFromAlgebra code1
	computeDependenciesFromAlgebra code2
	computeResultsAndJavaScriptFromAlgebra code1
	computeDependenciesFromAlgebra code1
	computeDependenciesFromAlgebra code2
	res = computeResultsAndJavaScriptFromAlgebra code2

	if res.code == 'PCA = function (M) { return ( cov(M) ); }' and
		res.latexResult == '$$PCA(M) = cov(M)$$' and
		res.dependencyInfo.affectsVariables.length == 1 and
		res.dependencyInfo.affectsVariables[0] == 'PCA' and
		res.dependencyInfo.affectedBy.length == 2 and
		res.dependencyInfo.affectedBy[0] == 'M' and
		res.dependencyInfo.affectedBy[1] == 'PATTERN_DEPENDENCY'
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"



	do_clearall()

	# overwriting a pattern, as seen from the notebook

	code1 = 'pattern(a_ + a_, 42 * a_)'
	code2 = 'pattern(a_ + a_, 21 * a_)'
	code3 = 'f = x + x'

	computeResultsAndJavaScriptFromAlgebra code1
	computeResultsAndJavaScriptFromAlgebra code2
	res = computeResultsAndJavaScriptFromAlgebra code3

	if res.code == 'f = function (x) { return ( 21*x ); }' and
		res.latexResult == '$$f(x) = 21x$$' and
		res.dependencyInfo.affectsVariables.length == 1 and
		res.dependencyInfo.affectsVariables[0] == 'f' and
		res.dependencyInfo.affectedBy.length == 2 and
		res.dependencyInfo.affectedBy[0] == 'x' and
		res.dependencyInfo.affectedBy[1] == 'PATTERN_DEPENDENCY'
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"



	do_clearall()

	# tests

	res = computeResultsAndJavaScriptFromAlgebra "f=test(x<1,-x-4,3<=x,x*x+7,120/x+5)"

	if res.code == 'f = function (x) { return ( (function(){if (((x) < (1))){return (-x - 4);} else if (((3) <= (x))){return (x*x + 7);}else {return (120 / x + 5);}})() ); }' and
		res.latexResult == '$$f(x) = \\left\\{ \\begin{array}{ll}{-x-4} & if & {x} < {1} \\\\\\\\{xx+7} & if & {3} \\leq {x} \\\\\\\\{\\frac{120}{x}+5} & otherwise  \\end{array} \\right.$$' and
		res.dependencyInfo.affectsVariables.length == 1 and
		res.dependencyInfo.affectsVariables[0] == 'f' and
		res.dependencyInfo.affectedBy.length == 2 and
		res.dependencyInfo.affectedBy[0] == 'x' and
		res.dependencyInfo.affectedBy[1] == 'PATTERN_DEPENDENCY'
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"


	do_clearall()

	# tests

	res = computeResultsAndJavaScriptFromAlgebra "f=floor(x) + ceiling(x) + round(x)"

	if res.code == 'f = function (x) { return ( ceiling(x) + floor(x) + round(x) ); }' and
		res.latexResult == '$$f(x) =  \\lceil {x} \\rceil + \\lfloor {x} \\rfloor +round(x)$$' and
		res.dependencyInfo.affectsVariables.length == 1 and
		res.dependencyInfo.affectsVariables[0] == 'f' and
		res.dependencyInfo.affectedBy.length == 2 and
		res.dependencyInfo.affectedBy[0] == 'x' and
		res.dependencyInfo.affectedBy[1] == 'PATTERN_DEPENDENCY'
				console.log "ok dependency test"
		else
				console.log "fail dependency tests"


	do_clearall()

	console.log "-- done dependency tests"
