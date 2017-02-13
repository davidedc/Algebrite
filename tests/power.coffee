test_power = ->
	run_test [

		# according to the notorious
		# "PEMDAS" mnemonic, the power
		# operator has the most precedence.
		# Strangely, Mathematica parses
		# a^1/2 as sqrt(a), not following PEMDAS,
		# probably because of some fancy
		# euristics, since, contrarily to the
		# case above, it also parses
		# a^b/2 as (a^b)/2.
		# I think this more standard/uniform handling
		# a-la-sympy is ok.
		"a^1/2 + a^1/2",
		"a",

		"2^(1/2)",
		"2^(1/2)",

		"2^(3/2)",
		"2*2^(1/2)",

		"(-2)^(1/2)",
		"i*2^(1/2)",

		"3^(4/3)",
		"3*3^(1/3)",

		"3^(-4/3)",
		"1/(3*3^(1/3))",

		"3^(5/3)",
		"3*3^(2/3)",

		"3^(2/3)-9^(1/3)",
		"0",

		"3^(10/3)",
		"27*3^(1/3)",

		"3^(-10/3)",
		"1/(27*3^(1/3))",

		"(1/3)^(10/3)",
		"1/(27*3^(1/3))",

		"(1/3)^(-10/3)",
		"27*3^(1/3)",

		"27^(2/3)",
		"9",

		"27^(-2/3)",
		"1/9",

		"102^(1/2)",
		"2^(1/2)*3^(1/2)*17^(1/2)",

		"32^(1/3)",
		"2*2^(2/3)",

		"9999^(1/2)",
		"3*11^(1/2)*101^(1/2)",

		"8^(1/2)",
		"2*2^(1/2)",

		"10000^(1/3)",
		"10*2^(1/3)*5^(1/3)",

		# we could take out a "18" from the radix but
		# we only handle this for small numbers in
		# "quickfactor" routine. TODO
		"8204861575751304355842204^(1/2)",
		"8204861575751304355842204^(1/2)",

		# see above
		"simplify(8204861575751304355842204^(1/2))",
		"8204861575751304355842204^(1/2)",

		"sqrt(-1/2 -1/2 * x)",
		"(-1/2*x-1/2)^(1/2)",

		"sqrt(x*y)",
		"(x*y)^(1/2)",

		"sqrt(1/x)",
		"(1/x)^(1/2)",

		"sqrt(x^y)",
		"(x^y)^(1/2)",

		"sqrt(x)^2",
		"x",

		"sqrt(x^2)",
		"abs(x)",

		# always true, whether x is real or not
 		"sqrt(x^2)^2",
 		"x^2",

		"3^(1/2)*i/9",
		"1/9*i*3^(1/2)",

		"(-4.0)^(1.5)",
		"-8.0*i",

		"(-4.0)^(3/2)",
		"-8.0*i",

		# usually the rectangular form is returned.
		"(-1)^(1/3)",
		#"(-1)^(1/3)",
		"1/2+1/2*i*3^(1/2)",

		# note how the "double" type
		# is toxic i.e. it propagates through
		# everything it touches.
		"(-1.0)^(2/3)",
		"-0.5+0.866025*i",

		# this also has a nested radical
		# form but we are not calculating
		# that.
		"(-1)^(1/3)*2^(1/4)",
		#"(-1)^(1/3)*2^(1/4)",
		"1/2*2^(1/4)+1/2*i*2^(1/4)*3^(1/2)",

		"(-1)^(1/2)",
		"i",

		"sqrt(1000000)",
		"1000",

		"sqrt(-1000000)",
		"1000*i",

		"sqrt(2^60)",
		"1073741824",

		# this is why we factor irrationals

		"6^(1/3) 3^(2/3)",
		"3*2^(1/3)",

		# inverse of complex numbers

		"1/(2+3*i)",
		"2/13-3/13*i",

		"1/(2+3*i)^2",
		"-5/169-12/169*i",

		"(-1+3i)/(2-i)",
		"-1+i",

		# other

		"(0.0)^(0.0)",
		"1.0",

		"(-4.0)^(0.5)",
		"2.0*i",

		"(-4.0)^(-0.5)",
		"-0.5*i",

		"(-4.0)^(-1.5)",
		"0.125*i",

		# more complex number cases

		"(1+i)^2",
		"2*i",

		"(1+i)^(-2)",
		"-1/2*i",

		"(1+i)^(1/2)",
		#"(-1)^(1/8)*2^(1/4)",
		"i*2^(1/4)*sin(1/8*pi)+2^(1/4)*cos(1/8*pi)",

		"(1+i)^(-1/2)",
		"-(-1)^(7/8)/(2^(1/4))",

		"(1+i)^(0.5)",
		"1.09868+0.45509*i",

		"(1+i)^(-0.5)",
		"0.776887-0.321797*i",

		# test cases for simplification of polar forms, counterclockwise

		"exp(i*pi/2)",
		"i",

		"exp(i*pi)",
		"-1",

		"exp(i*3*pi/2)",
		"-i",

		"exp(i*2*pi)",
		"1",

		"exp(i*5*pi/2)",
		"i",

		"exp(i*3*pi)",
		"-1",

		"exp(i*7*pi/2)",
		"-i",

		"exp(i*4*pi)",
		"1",

		"exp(A+i*pi/2)",
		"i*exp(A)",

		"exp(A+i*pi)",
		"-exp(A)",

		"exp(A+i*3*pi/2)",
		"-i*exp(A)",

		"exp(A+i*2*pi)",
		"exp(A)",

		"exp(A+i*5*pi/2)",
		"i*exp(A)",

		"exp(A+i*3*pi)",
		"-exp(A)",

		"exp(A+i*7*pi/2)",
		"-i*exp(A)",

		"exp(A+i*4*pi)",
		"exp(A)",

		# test cases for simplification of polar forms, clockwise

		"exp(-i*pi/2)",
		"-i",

		"exp(-i*pi)",
		"-1",

		"exp(-i*3*pi/2)",
		"i",

		"exp(-i*2*pi)",
		"1",

		"exp(-i*5*pi/2)",
		"-i",

		"exp(-i*3*pi)",
		"-1",

		"exp(-i*7*pi/2)",
		"i",

		"exp(-i*4*pi)",
		"1",

		"exp(A-i*pi/2)",
		"-i*exp(A)",

		"exp(A-i*pi)",
		"-exp(A)",

		"exp(A-i*3*pi/2)",
		"i*exp(A)",

		"exp(A-i*2*pi)",
		"exp(A)",

		"exp(A-i*5*pi/2)",
		"-i*exp(A)",

		"exp(A-i*3*pi)",
		"-exp(A)",

		"exp(A-i*7*pi/2)",
		"i*exp(A)",

		"exp(A-i*4*pi)",
		"exp(A)",
	]
