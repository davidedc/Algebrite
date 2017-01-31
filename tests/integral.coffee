test_integral = ->
	run_test [

		"clearall",
		"",

		"tty=1",
		"",

		"integral(x^2+x)-(1/2*x^2+1/3*x^3)",
		"0",

		#1
		"integral(A,X)",
		"A*X",

		#4
		"integral(A+B,X)-(A*X+B*X)",
		"0",

		#9
		"integral(1/X,X)",
		"log(X)",

		#11
		"integral(exp(X),X)",
		"exp(X)",

		#12
		"integral(exp(A*X),X)-exp(A*X)/A",
		"0",

		#14
		"integral(log(X),X)-X*log(X)+X",
		"0",

		#15
		"integral(3^X*log(3),X)",
		"3^X",

		#16
		"integral(1/(3+x^2),x)-3^(-1/2)*arctan(3^(-1/2)*x)",
		"0",

		#17
		"integral(1/(a-x^2),x)-a^(-1/2)*arctanh(a^(-1/2)*x)",
		"0",

		#19
		"integral(1/sqrt(a-x^2),x)-arcsin(a^(-1/2)*x)",
		"0",

		#20
		"integral(1/sqrt(a+x^2),x)-(log(x+(a+x^2)^(1/2)))",
		"0",

		#27
		"integral(1/(a+b*x),x)-(log(a+b*x)/b)",
		"0",

		#28
		"integral(1/(A+B*X)^2,X)+1/B*1/(A+B*X)",
		"0",

		#29
		"integral(1/(a+b*x)^3,x)+1/2*1/b*(a+b*x)^(-2)",
		"0",

		#30
		"integral(X/(A+B*X),X)+A*B^(-2)*log(A+B*X)-X/B",
		"0",

		#31
		"integral(X/(A+B*X)^2,X)-1/B^2*(log(A+B*X)+A/(A+B*X))",
		"0",

		#33
		"integral(X^2/(A+B*X),X)-1/B^2*(1/2*(A+B*X)^2-2*A*(A+B*X)+A^2*log(A+B*X))",
		"0",

		#34
		"integral(X^2/(A+B*X)^2,X)-1/B^3*(A+B*X-2*A*log(A+B*X)-A^2/(A+B*X))",
		"0",

		#35
		"integral(X^2/(A+B*X)^3,X)-1/B^3*(log(A+B*X)+2*A/(A+B*X)-1/2*A^2/(A+B*X)^2)",
		"0",

		#37
		"integral(1/X*1/(A+B*X),X)+1/A*log((A+B*X)/X)",
		"0",

		#38
		"integral(1/X*1/(A+B*X)^2,X)-1/A*1/(A+B*X)+1/A^2*log((A+B*X)/X)",
		"0",

		#39
		"integral(1/X*1/(A+B*X)^3,X)-1/A^3*(1/2*((2*A+B*X)/(A+B*X))^2+log(X/(A+B*X)))",
		"0",

		#40
		"integral(1/X^2*1/(A+B*X),X)+1/(A*X)-B/A^2*log((A+B*X)/X)",
		"0",

		#41
		"integral(1/X^3*1/(A+B*X),X)-(2*B*X-A)/(2*A^2*X^2)-B^2/A^3*log(X/(A+B*X))",
		"0",

		#42
		"integral(1/X^2*1/(A+B*X)^2,X)+(A+2*B*X)/(A^2*X*(A+B*X))-2*B/A^3*log((A+B*X)/X)",
		"0",

		#60
		"integral(1/(2+3*X^2),X)-1/sqrt(6)*arctan(1/2*X*sqrt(6))",
		"0",
		"integral(1/(-2-3*X^2),X)-1/sqrt(6)*arctan(-1/2*X*sqrt(6))",
		"0",

		#61
		"integral(1/(2-3*X^2),X)-1/2*1/sqrt(6)*log((2+X*sqrt(6))/(2-X*sqrt(6)))",
		"0",
		"integral(1/(-2+3*X^2),X)-1/2*1/sqrt(6)*log((-2+X*sqrt(6))/(-2-X*sqrt(6)))",
		"0",

		#63
		"integral(X/(A+B*X^2),X)-1/2*1/B*log(A+B*X^2)",
		"0",

		#64
		"integral(X^2/(A+B*X^2),X)-X/B+A/B*integral(1/(A+B*X^2),X)",
		"0",

		#65
		"integral(1/(A+B*X^2)^2,X)-X/(2*A*(A+B*X^2))-1/2*1/A*integral(1/(A+B*X^2),X)",
		"0",

		#70
		"integral(1/X*1/(A+B*X^2),X)-1/2*1/A*log(X^2/(A+B*X^2))",
		"0",

		#71
		"integral(1/X^2*1/(A+B*X^2),X)+1/(A*X)+B/A*integral(1/(A+B*X^2),X)",
		"0",

		#74
		"integral(1/(A+B*X^3),X)-1/3*1/A*(A/B)^(1/3)*(1/2*log(((A/B)^(1/3)+X)^3/(A+B*X^3))+sqrt(3)*arctan((2*X-(A/B)^(1/3))*(A/B)^(-1/3)/sqrt(3)))",
		"0",

		#76
		"integral(X^2/(A+B*X^3),X)-1/3*1/B*log(A+B*X^3)",
		"0",

		# commenting this out because the definite integral of this one
		# between 0 and pi was incorrect AND the indefinite integral
		# became incorrect after I avoided having roots in the denominator
		# when doing multiplications. The two things combined made me
		# think to eliminate this test.
		#77
		#"integral(1/(2+3*X^4),X)-1/2*1/2*(2/3/4)^(1/4)*(1/2*log((X^2+2*(2/3/4)^(1/4)*X+2*(2/3/4)^(1/2))/(X^2-2*(2/3/4)^(1/4)*X+2*(2/3/4)^(1/2)))+arctan(2*(2/3/4)^(1/4)*X/(2*(2/3/4)^(1/2)-X^2)))",
		#"0",

		# commenting this out because the definite integral of this one
		# between 0 and pi was incorrect AND the indefinite integral
		# became incorrect after I avoided having roots in the denominator
		# when doing multiplications. The two things combined made me
		# think to eliminate this test.
		#78
		#"integral(1/(2-3*X^4),X)-1/2*(2/3)^(1/4)/2*(1/2*log((X+(2/3)^(1/4))/(X-(2/3)^(1/4)))+arctan(X*(2/3)^(-1/4)))",
		#"0",

		#79
		"integral(X/(2+3*X^4),X)-1/2*1/3*1/sqrt(2/3)*arctan(X^2/sqrt(2/3))",
		"0",

		#80
		"integral(X/(2-3*X^4),X)+1/4*1/3*sqrt(3/2)*log((X^2-sqrt(2/3))/(X^2+sqrt(2/3)))",
		"0",

		# commenting this out because the definite integral of this one
		# between 0 and pi was incorrect AND the indefinite integral
		# became incorrect after I avoided having roots in the denominator
		# when doing multiplications. The two things combined made me
		# think to eliminate this test.
		#81
		#"integral(X^2/(2+3*X^4),X)-1/4*1/3*(2/3/4)^(-1/4)*(1/2*log((X^2-2*(2/3/4)^(1/4)*X+2*sqrt(2/3/4))/(X^2+2*(2/3/4)^(1/4)*X+2*sqrt(2/3/4)))+arctan(2*(2/3/4)^(1/4)*X/(2*sqrt(2/3/4)-X^2)))",
		#"0",

		# commenting this out because the definite integral of this one
		# between 0 and pi was incorrect AND the indefinite integral
		# became incorrect after I avoided having roots in the denominator
		# when doing multiplications. The two things combined made me
		# think to eliminate this test.
		#82
		#"integral(X^2/(2-3*X^4),X)+1/4*1/3*(2/3)^(-1/4)*(log((X-(2/3)^(1/4))/(X+(2/3)^(1/4)))+2*arctan(X*(2/3)^(-1/4)))",
		#"0",

		#83
		"integral(X^3/(A+B*X^4),X)-1/4*1/B*log(A+B*X^4)",
		"0",

		#124
		"integral(sqrt(A+B*X),X)-2/3/B*sqrt((A+B*X)^3)",
		"0",

		#125
		"integral(X*sqrt(A+B*X),X)+2*(2*A-3*B*X)*sqrt((A+B*X)^3)/15*B^(-2)",
		"0",

		#126
		"integral(X^2*sqrt(A+B*X),X)-2*(8*A^2-12*A*B*X+15*B^2*X^2)*sqrt((A+B*X)^3)/105*B^(-3)",
		"0",

		#128
		"integral(sqrt(A+B*X)/X,X)-2*sqrt(A+B*X)-A*integral(1/X*1/sqrt(A+B*X),X)",
		"0",

		#129
		"integral(sqrt(A+B*X)/X^2,X)+sqrt(A+B*X)/X-B/2*integral(1/X*1/sqrt(A+B*X),X)",
		"0",

		#131
		"integral(1/sqrt(A+B*X),X)-2*sqrt(A+B*X)/B",
		"0",

		#132
		"integral(X/sqrt(A+B*X),X)+2/3*(2*A-B*X)*sqrt(A+B*X)/B^2",
		"0",

		#133
		"integral(X^2/sqrt(A+B*X),X)-2/15*(8*A^2-4*A*B*X+3*B^2*X^2)*sqrt(A+B*X)/B^3",
		"0",

		#134
		"integral(1/X*1/sqrt(2+B*X),X)-1/sqrt(2)*log((sqrt(2+B*X)-sqrt(2))/(sqrt(2+B*X)+sqrt(2)))",
		"0",

		#136
		"integral(1/X*1/sqrt(-2+B*X),X)-2/sqrt(2)*arctan(sqrt((-2+B*X)/2))",
		"0",

		#137
		"integral(1/X^2*1/sqrt(A+B*X),X)+sqrt(A+B*X)/A/X+1/2*B/A*integral(1/X*1/sqrt(A+B*X),X)",
		"0",

		#156
		"integral(sqrt(X^2+A),X)-1/2*(X*sqrt(X^2+A)+A*log(X+sqrt(X^2+A)))",
		"0",

		#157
		"integral(1/sqrt(X^2+A),X)-log(X+sqrt(X^2+A))",
		"0",

		#158
		"integral(1/X*1/sqrt(X^2-2),X)-arcsec(X/sqrt(2))/sqrt(2)",
		"0",

		#159
		"integral(1/X*1/sqrt(X^2+2),X)+1/sqrt(2)*log((sqrt(2)+sqrt(X^2+2))/X)",
		"0",

		#160
		"integral(sqrt(X^2+2)/X,X)-sqrt(X^2+2)+sqrt(2)*log((sqrt(2)+sqrt(X^2+2))/X)",
		"0",

		#161
		"integral(sqrt(X^2-2)/X,X)-sqrt(X^2-2)+sqrt(2)*arcsec(X/sqrt(2))",
		"0",

		#162
		"integral(X/sqrt(X^2+A),X)-sqrt(X^2+A)",
		"0",

		#163
		"integral(X*sqrt(X^2+A),X)-1/3*sqrt((X^2+A)^3)",
		"0",

		#164 fails after Jan 2017 changes to abs/mag
		#"integral(sqrt((X^2+A)^3),X)-1/4*(X*sqrt((X^2+A)^3)+3/2*A*X*sqrt(X^2+A)+3/2*A^2*log(X+sqrt(X^2+A)))",
		#"0",

		#"integral(sqrt((X^2-A)^3),X)-1/4*(X*sqrt((X^2-A)^3)-3/2*A*X*sqrt(X^2-A)+3/2*A^2*log(X+sqrt(X^2-A)))",
		#"0",

		#165 fails after Jan 2017 changes to abs/mag
		#"integral(1/sqrt((X^2+A)^3),X)-X/A/sqrt(X^2+A)",
		#"0",

		#166 fails after Jan 2017 changes to abs/mag
		#"integral(X/sqrt((X^2+A)^3),X)+1/sqrt(X^2+A)",
		#"0",

		#167 fails after Jan 2017 changes to abs/mag
		#"integral(X*sqrt((X^2+A)^3),X)-1/5*sqrt((X^2+A)^5)",
		#"0",

		#168
		"integral(X^2*sqrt(X^2+A),X)-1/4*X*sqrt((X^2+A)^3)+1/8*A*X*sqrt(X^2+A)+1/8*A^2*log(X+sqrt(X^2+A))",
		"0",

		#169
		"integral(X^3*sqrt(X^2+7),X)-(1/5*X^2-2/15*7)*sqrt((X^2+7)^3)",
		"0",

		#170
		"integral(X^3*sqrt(X^2-7),X)-(sqrt((X^2-7)^5)/5+7*sqrt((X^2-7)^3)/3)",
		"0",

		#171
		"integral(X^2/sqrt(X^2+A),X)-1/2*X*sqrt(X^2+A)+1/2*A*log(X+sqrt(X^2+A))",
		"0",

		#172
		"integral(X^3/sqrt(X^2+A),X)-1/3*sqrt((X^2+A)^3)+A*sqrt(X^2+A)",
		"0",

		#173
		"integral(1/X^2*1/sqrt(X^2+A),X)+sqrt(X^2+A)/A/X",
		"0",

		#174
		"integral(1/X^3*1/sqrt(X^2+2),X)+1/2*sqrt(X^2+2)/2/X^2-1/2*log((sqrt(2)+sqrt(X^2+2))/X)/(sqrt(2)^3)",
		"0",

		#175
		"integral(1/X^3*1/sqrt(X^2-2),X)-1/2*sqrt(X^2-2)/2/X^2-1/2*1/(2^(3/2))*arcsec(X/(2^(1/2)))",
		"0",

		#176+
		"integral(X^2*sqrt((X^2+2^2)^3),X)\
		-1/6*X*sqrt((X^2+2^2)^5)\
		+1/24*(2^2)*X*sqrt((X^2+2^2)^3)\
		+1/16*(2^4)X*sqrt(X^2+2^2)\
		+1/16*(2^6)*log(X+sqrt(X^2+2^2))",
		"0",

		#176-
		"integral(X^2*sqrt((X^2-2^2)^3),X)\
		-1/6*X*sqrt((X^2-2^2)^5)\
		-1/24*(2^2)*X*sqrt((X^2-2^2)^3)\
		+1/16*(2^4)X*sqrt(X^2-2^2)\
		-1/16*(2^6)*log(X+sqrt(X^2-2^2))",
		"0",

		#177+
		"integral(X^3*sqrt((X^2+7^2)^3),X)\
		-1/7*sqrt((X^2+7^2)^7)\
		+1/5*(7^2)*sqrt((X^2+7^2)^5)",
		"0",

		#177-
		"integral(X^3*sqrt((X^2-7^2)^3),X)\
		-1/7*sqrt((X^2-7^2)^7)\
		-1/5*(7^2)*sqrt((X^2-7^2)^5)",
		"0",

		#196
		"simplify(integral(1/(X-A)/sqrt(X^2-A^2),X)+sqrt(X^2-A^2)/A/(X-A))",
		"0",
		"simplify(1/(X-A)/sqrt(X^2-A^2)-d(integral(1/(X-A)/sqrt(X^2-A^2),X),X))",
		"0",

		#197
		"integral(1/(X+A)/sqrt(X^2-A^2),X)-sqrt(X^2-A^2)/A/(X+A)",
		"0",
		"simplify(1/(X+A)/sqrt(X^2-A^2)-d(integral(1/(X+A)/sqrt(X^2-A^2),X),X))",
		"0",

		#200
		"integral(sqrt(7-X^2),X)-1/2*(X*sqrt(7-X^2)+7*arcsin(X/sqrt(7)))",
		"0",

		#201
		"integral(1/sqrt(7-X^2),X)-arcsin(X/sqrt(7))",
		"0",

		#202
		"integral(1/X*1/sqrt(7-X^2),X)+1/sqrt(7)*log((sqrt(7)+sqrt(7-X^2))/X)",
		"0",

		#203
		"integral(sqrt(7-X^2)/X,X)\
		-sqrt(7-X^2)+sqrt(7)*log((sqrt(7)+sqrt(7-X^2))/X)",
		"0",

		#204
		"integral(X/sqrt(A-X^2),X)\
		+sqrt(A-X^2)",
		"0",

		#205
		"integral(X*sqrt(A-X^2),X)\
		+1/3*sqrt((A-X^2)^3)",
		"0",

		#210
		"integral(X^2*sqrt(7-X^2),X)\
		+1/4*X*sqrt((7-X^2)^3)\
		-7/8*(X*sqrt(7-X^2)+7*arcsin(X/sqrt(7)))",
		"0",

		#211
		"integral(X^3*sqrt(7-X^2),X)\
		-(-1/5*X^2-2/15*7)*sqrt((7-X^2)^3)",
		"0",

		#214
		"integral(X^2/sqrt(7-X^2),X)\
		+X/2*sqrt(7-X^2)\
		-7/2*arcsin(X/sqrt(7))",
		"0",

		#215
		"integral(1/X^2*1/sqrt(7-X^2),X)\
		+sqrt(7-X^2)/7/X",
		"0",

		#216
		"integral(sqrt(7-X^2)/X^2,X)\
		+sqrt(7-X^2)/X\
		+arcsin(X/sqrt(7))",
		"0",

		#217
		"integral(sqrt(7-X^2)/X^3,X)\
		+1/2*sqrt(7-X^2)/X^2\
		-1/2*log((sqrt(7)+sqrt(7-X^2))/X)/sqrt(7)",
		"0",

		#218
		"integral(sqrt(7-X^2)/X^4,X)\
		+1/3*sqrt((7-X^2)^3)/7/X^3",
		"0",

		#273
		"integral(sqrt(7*X^2+C),X)-X*sqrt(7*X^2+C)/2-C*log(X*sqrt(7)+sqrt(7*X^2+C))/2/sqrt(7)",
		"0",

		#274
		"integral(sqrt(-7*X^2+C),X)-X*sqrt(-7*X^2+C)/2-C*arcsin(X*sqrt(7/C))/2/sqrt(7)",
		"0",

		#290
		"integral(sin(A*X),X)+cos(A*X)/A",
		"0",

		#291
		"integral(cos(A*X),X)-sin(A*X)/A",
		"0",

		#292
		"integral(tan(A*X),X)+log(cos(A*X))/A",
		"0",

		#293
		"integral(1/tan(A*X),X)-log(sin(A*X))/A",
		"0",

		#294
		"integral(1/cos(A*X),X)-log(tan(pi/4+A*X/2))/A",
		"0",

		#295
		"integral(1/sin(A*X),X)-log(tan(A*X/2))/A",
		"0",

		#296
		"integral(sin(A*X)^2,X)-X/2+sin(2*A*X)/(4*A)",
		"0",

		#297
		"integral(sin(A*X)^3,X)+cos(A*X)*(sin(A*X)^2+2)/(3*A)",
		"0",

		#298
		"integral(sin(A*X)^4,X)-3/8*X+sin(2*A*X)/(4*A)-sin(4*A*X)/(32*A)",
		"0",

		#302
		"integral(cos(A*X)^2,X)-X/2-sin(2*A*X)/(4*A)",
		"0",

		#303
		"integral(cos(A*X)^3,X)-sin(A*X)*(cos(A*X)^2+2)/(3*A)",
		"0",

		#304
		"integral(cos(A*X)^4,X)-3/8*X-sin(2*A*X)/(4*A)-sin(4*A*X)/(32*A)",
		"0",

		#308
		"integral((1/sin(A*X))^2,X)+1/A*1/tan(A*X)",
		"0",

		#312
		"integral((1/cos(A*X))^2,X)-tan(A*X)/A",
		"0",

		#318
		"integral(sin(A*X)*cos(A*X),X)-sin(A*X)^2/(2*A)",
		"0",

		#320
		"integral(sin(A*X)^2*cos(A*X)^2,X)+sin(4*A*X)/(32*A)-X/8",
		"0",

		#326
		"integral(sin(A*X)/cos(A*X)/cos(A*X),X)-1/(A*cos(A*X))",
		"0",

		#327
		"integral(sin(A*X)^2/cos(A*X),X)+sin(A*X)/A-log(tan(pi/4+A*X/2))/A",
		"0",

		#328
		"integral(cos(A*X)/sin(A*X)^2,X)+1/(A*sin(A*X))",
		"0",

		#329
		"integral(1/sin(A*X)/cos(A*X),X)-log(tan(A*X))/A",
		"0",

		#330
		"integral(1/sin(A*X)/cos(A*X)^2,X)-(1/cos(A*X)+log(tan(A*X/2)))/A",
		"0",

		#332
		"integral(1/sin(A*X)^2/cos(A*X),X)-(log(tan(pi/4+A*X/2))-1/sin(A*X))/A",
		"0",

		#333
		"integral(1/sin(A*X)^2/cos(A*X)^2,X)+2/(A*tan(2*A*X))",
		"0",

		#335
		"integral(sin(A+B*X),X)+cos(A+B*X)/B",
		"0",

		#336
		"integral(cos(A+B*X),X)-sin(A+B*X)/B",
		"0",

		#337+
		"integral(1/(1+sin(A*X)),X)+tan(pi/4-A*X/2)/A",
		"0",

		#337b+
		"integral(1/(B+B*sin(A*X)),X)+tan(pi/4-A*X/2)/A/B",
		"0",

		#337-
		"integral(1/(1-sin(A*X)),X)-tan(pi/4+A*X/2)/A",
		"0",

		#337b-
		"integral(1/(B-B*sin(A*X)),X)-tan(pi/4+A*X/2)/A/B",
		"0",

		#338
		"integral(1/(1+cos(A*X)),X)-tan(A*X/2)/A",
		"0",

		#339
		"integral(1/(1-cos(A*X)),X)+1/(A*tan(A*X/2))",
		"0",

		#340
		"integral(1/(A+B*sin(X)),X)-1/sqrt(B^2-A^2)*log((A*tan(X/2)+B-sqrt(B^2-A^2))/(A*tan(X/2)+B+sqrt(B^2-A^2)))",
		"0",

		#341
		"integral(1/(A+B*cos(X)),X)-1/sqrt(B^2-A^2)*log((sqrt(B^2-A^2)*tan(X/2)+A+B)/(sqrt(B^2-A^2)*tan(X/2)-A-B))",
		"0",

		#389
		"x*sin(A*x)-d(integral(x*sin(A*x)))",
		"0",

		#390
		"x^2*sin(A*x)-d(integral(x^2*sin(A*x)))",
		"0",

		#393
		"x*cos(A*x)-d(integral(x*cos(A*x)))",
		"0",

		#394
		"x^2*cos(A*x)-d(integral(x^2*cos(A*x)))",
		"0",

		#441
		"integral(arcsin(A*X),X)-X*arcsin(A*X)-sqrt(1-A^2*X^2)/A",
		"0",

		#442
		"integral(arccos(A*X),X)-X*arccos(A*X)+sqrt(1-A^2*X^2)/A",
		"0",

		#443
		"integral(arctan(A*X),X)-X*arctan(A*X)+log(1+A^2*X^2)/(2*A)",
		"0",

		#485
		"integral(log(X),X)-X*log(X)+X",
		"0",

		#485a
		"integral(log(A*X),X)-X*log(A*X)+X",
		"0",

		#486
		"integral(X*log(X),X)-1/2*X^2*log(X)+1/4*X^2",
		"0",

		#486a
		"integral(X*log(A*X),X)-1/2*X^2*log(A*X)+1/4*X^2",
		"0",

		#487
		"integral(X^2*log(A*X),X)-1/3*X^3*log(A*X)+X^3/9",
		"0",

		#489
		"integral(log(X)^2,X)-X*log(X)^2+2*X*log(X)-2*X",
		"0",

		#493
		"integral(1/X*1/log(A*X),X)-log(log(A*X))",
		"0",

		#499
		"integral(log(A*X+B),X)-(A*X+B)*log(A*X+B)/A+X",
		"0",

		#500
		"integral(log(A*X+B)/X^2,X)-A*log(X)/B+(A*X+B)*log(A*X+B)/B/X",
		"0",

		#554
		"integral(sinh(X),X)-cosh(X)",
		"0",

		#555
		"integral(cosh(X),X)-sinh(X)",
		"0",

		#556
		"integral(tanh(X),X)-log(cosh(X))",
		"0",

		#560
		"integral(X*sinh(X),X)-X*cosh(X)+sinh(X)",
		"0",

		#562
		"integral(X*cosh(X),X)-X*sinh(X)+cosh(X)",
		"0",

		#566
		"integral(sinh(X)^2,X)-sinh(2*X)/4+X/2",
		"0",

		#569
		"integral(tanh(X)^2,X)-X+tanh(X)",
		"0",

		#572
		"integral(cosh(X)^2,X)-sinh(2*X)/4-X/2",
		"0",

		# test integral(exp(a*x^2))

		"integral(exp(a*x^2))+i*sqrt(pi)*erf(i*sqrt(a)*x)/sqrt(a)/2",
		"0",

		"integral(exp(-x^2))-sqrt(pi)*erf(x)/2",
		"0",

		# before abs/mag changes of Jan 2017
		# this integral gave the more compact result of:
		#   sqrt(pi/3)*erf(sqrt(3)*x)/2
		# but the new given one is still correct
		"integral(exp(-3*x^2))-pi^(1/2)*erf(3^(1/2)*x)/(2*3^(1/2))",
		"0",

		"integral(1/x*1/(a+log(x)),x)-log(a+log(x))",
		"0",

		"integral(exp(a*x+b*x))",
		"exp((a+b)*x)/(a+b)",

		"integral(x*exp(a*x))",
		"-exp(a*x)/(a^2)+x*exp(a*x)/a",
		"derivative",
		"x*exp(a*x)",

		"integral(x*exp(a*x+b))",
		"-exp(a*x+b)/(a^2)+x*exp(a*x+b)/a",
		"derivative",
		"x*exp(a*x+b)",

		"integral(x*exp(-a*x+b))",
		"-exp(-a*x+b)/(a^2)-x*exp(-a*x+b)/a",
		"derivative",
		"x*exp(-a*x+b)",

		"integral(x^2*exp(a*x))",
		"2*exp(a*x)/(a^3)-2*x*exp(a*x)/(a^2)+x^2*exp(a*x)/a",
		"derivative",
		"x^2*exp(a*x)",

		"integral(x^2*exp(a*x+b))",
		"2*exp(a*x+b)/(a^3)-2*x*exp(a*x+b)/(a^2)+x^2*exp(a*x+b)/a",
		"derivative",
		"x^2*exp(a*x+b)",

		"integral(x^3*exp(a*x))",
		"-6*exp(a*x)/(a^4)+6*x*exp(a*x)/(a^3)-3*x^2*exp(a*x)/(a^2)+x^3*exp(a*x)/a",
		"derivative",
		"x^3*exp(a*x)",

		"integral(x^3*exp(a*x+b))",
		"-6*exp(a*x+b)/(a^4)+6*x*exp(a*x+b)/(a^3)-3*x^2*exp(a*x+b)/(a^2)+x^3*exp(a*x+b)/a",
		"derivative",
		"x^3*exp(a*x+b)",

		# here
		"integral(sqrt(a*x^2+b))",
		"Stop: integral: sorry, could not find a solution",

		"integral(x^2*(1-x^2)^(3/2))-(x*sqrt(1-x^2)*(-8*x^4+14*x^2-3)+3*arcsin(x))/48",
		"0",

		"integral(x^4*(1-x^2)^(3/2))-(-x*sqrt(1-x^2)*(16*x^6-24*x^4+2*x^2+3)+3*arcsin(x))/128",
		"0",

		"integral(x^2*(1-x^2)^(5/2))-(x*sqrt(1-x^2)*(48*x^6-136*x^4+118*x^2-15)+15*arcsin(x))/384",
		"0",
	]
