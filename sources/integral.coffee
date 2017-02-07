###
 Table of integrals

The symbol f is just a dummy symbol for creating a list f(A,B,C,C,...) where

	A	is the template expression

	B	is the result expression

	C	is an optional list of conditional expressions
###

itab = [
	# 1
	"f(a,a*x)",
	# 9 (need a caveat for 7 so we can put 9 after 7)
	"f(1/x,log(x))",
	# 7
	"f(x^a,x^(a+1)/(a+1))",
	# 12
	"f(exp(a*x),1/a*exp(a*x))",
	"f(exp(a*x+b),1/a*exp(a*x+b))",
	"f(x*exp(a*x^2),exp(a*x^2)/(2*a))",
	"f(x*exp(a*x^2+b),exp(a*x^2+b)/(2*a))",
	# 14
	"f(log(a*x),x*log(a*x)-x)",
	# 15
	"f(a^x,a^x/log(a),or(not(number(a)),a>0))",
	# 16
	"f(1/(a+x^2),1/sqrt(a)*arctan(x/sqrt(a)),or(not(number(a)),a>0))",
	# 17
	"f(1/(a-x^2),1/sqrt(a)*arctanh(x/sqrt(a)))",
	# 19
	"f(1/sqrt(a-x^2),arcsin(x/(sqrt(a))))",
	# 20
	"f(1/sqrt(a+x^2),log(x+sqrt(a+x^2)))",
	# 27
	"f(1/(a+b*x),1/b*log(a+b*x))",
	# 28
	"f(1/(a+b*x)^2,-1/(b*(a+b*x)))",
	# 29
	"f(1/(a+b*x)^3,-1/(2*b)*1/(a+b*x)^2)",
	# 30
	"f(x/(a+b*x),x/b-a*log(a+b*x)/b/b)",
	# 31
	"f(x/(a+b*x)^2,1/b^2*(log(a+b*x)+a/(a+b*x)))",
	# 33
	"f(x^2/(a+b*x),1/b^2*(1/2*(a+b*x)^2-2*a*(a+b*x)+a^2*log(a+b*x)))",
	# 34
	"f(x^2/(a+b*x)^2,1/b^3*(a+b*x-2*a*log(a+b*x)-a^2/(a+b*x)))",
	# 35
	"f(x^2/(a+b*x)^3,1/b^3*(log(a+b*x)+2*a/(a+b*x)-1/2*a^2/(a+b*x)^2))",
	# 37
	"f(1/x*1/(a+b*x),-1/a*log((a+b*x)/x))",
	# 38
	"f(1/x*1/(a+b*x)^2,1/a*1/(a+b*x)-1/a^2*log((a+b*x)/x))",
	# 39
	"f(1/x*1/(a+b*x)^3,1/a^3*(1/2*((2*a+b*x)/(a+b*x))^2+log(x/(a+b*x))))",
	# 40
	"f(1/x^2*1/(a+b*x),-1/(a*x)+b/a^2*log((a+b*x)/x))",
	# 41
	"f(1/x^3*1/(a+b*x),(2*b*x-a)/(2*a^2*x^2)+b^2/a^3*log(x/(a+b*x)))",
	# 42
	"f(1/x^2*1/(a+b*x)^2,-(a+2*b*x)/(a^2*x*(a+b*x))+2*b/a^3*log((a+b*x)/x))",
	# 60
	"f(1/(a+b*x^2),1/sqrt(a*b)*arctan(x*sqrt(a*b)/a),or(not(number(a*b)),a*b>0))",
	# 61
	"f(1/(a+b*x^2),1/(2*sqrt(-a*b))*log((a+x*sqrt(-a*b))/(a-x*sqrt(-a*b))),or(not(number(a*b)),a*b<0))",
	# 62 is the same as 60
	# 63
	"f(x/(a+b*x^2),1/2*1/b*log(a+b*x^2))",
	#64
	"f(x^2/(a+b*x^2),x/b-a/b*integral(1/(a+b*x^2),x))",
	#65
	"f(1/(a+b*x^2)^2,x/(2*a*(a+b*x^2))+1/2*1/a*integral(1/(a+b*x^2),x))",
	#66 is covered by 61
	#70
	"f(1/x*1/(a+b*x^2),1/2*1/a*log(x^2/(a+b*x^2)))",
	#71
	"f(1/x^2*1/(a+b*x^2),-1/(a*x)-b/a*integral(1/(a+b*x^2),x))",
	#74
	"f(1/(a+b*x^3),1/3*1/a*(a/b)^(1/3)*(1/2*log(((a/b)^(1/3)+x)^3/(a+b*x^3))+sqrt(3)*arctan((2*x-(a/b)^(1/3))*(a/b)^(-1/3)/sqrt(3))))",
	#76
	"f(x^2/(a+b*x^3),1/3*1/b*log(a+b*x^3))",
	# float(defint(1/(2+3*X^4),X,0,pi)) gave wrong result.
	# Also, the tests related to the indefinite integral
	# fail since we rationalise expressions "better", so I'm thinking
	# to take this out completely as it seemed to give the
	# wrong results in the first place.
	#77
	#"f(1/(a+b*x^4),1/2*1/a*(a/b/4)^(1/4)*(1/2*log((x^2+2*(a/b/4)^(1/4)*x+2*(a/b/4)^(1/2))/(x^2-2*(a/b/4)^(1/4)*x+2*(a/b/4)^(1/2)))+arctan(2*(a/b/4)^(1/4)*x/(2*(a/b/4)^(1/2)-x^2))),or(not(number(a*b)),a*b>0))",
	#78
	#"f(1/(a+b*x^4),1/2*(-a/b)^(1/4)/a*(1/2*log((x+(-a/b)^(1/4))/(x-(-a/b)^(1/4)))+arctan(x*(-a/b)^(-1/4))),or(not(number(a*b)),a*b<0))",
	#79
	"f(x/(a+b*x^4),1/2*sqrt(b/a)/b*arctan(x^2*sqrt(b/a)),or(not(number(a*b)),a*b>0))",
	#80
	"f(x/(a+b*x^4),1/4*sqrt(-b/a)/b*log((x^2-sqrt(-a/b))/(x^2+sqrt(-a/b))),or(not(number(a*b)),a*b<0))",

	# float(defint(X^2/(2+3*X^4),X,0,pi)) gave wrong result.
	# Also, the tests related to the indefinite integral
	# fail since we rationalise expressions "better", so I'm thinking
	# to take this out completely as it seemed to give the
	# wrong results in the first place.
	#81
	#"f(x^2/(a+b*x^4),1/4*1/b*(a/b/4)^(-1/4)*(1/2*log((x^2-2*(a/b/4)^(1/4)*x+2*sqrt(a/b/4))/(x^2+2*(a/b/4)^(1/4)*x+2*sqrt(a/b/4)))+arctan(2*(a/b/4)^(1/4)*x/(2*sqrt(a/b/4)-x^2))),or(not(number(a*b)),a*b>0))",
	#82
	#"f(x^2/(a+b*x^4),1/4*1/b*(-a/b)^(-1/4)*(log((x-(-a/b)^(1/4))/(x+(-a/b)^(1/4)))+2*arctan(x*(-a/b)^(-1/4))),or(not(number(a*b)),a*b<0))",
	#83
	"f(x^3/(a+b*x^4),1/4*1/b*log(a+b*x^4))",
	#124
	"f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))",
	#125
	"f(x*sqrt(a+b*x),-2*(2*a-3*b*x)*sqrt((a+b*x)^3)/15/b^2)",
	#126
	"f(x^2*sqrt(a+b*x),2*(8*a^2-12*a*b*x+15*b^2*x^2)*sqrt((a+b*x)^3)/105/b^3)",
	#128
	"f(sqrt(a+b*x)/x,2*sqrt(a+b*x)+a*integral(1/x*1/sqrt(a+b*x),x))",
	#129
	"f(sqrt(a+b*x)/x^2,-sqrt(a+b*x)/x+b/2*integral(1/x*1/sqrt(a+b*x),x))",
	#131
	"f(1/sqrt(a+b*x),2*sqrt(a+b*x)/b)",
	#132
	"f(x/sqrt(a+b*x),-2/3*(2*a-b*x)*sqrt(a+b*x)/b^2)",
	#133
	"f(x^2/sqrt(a+b*x),2/15*(8*a^2-4*a*b*x+3*b^2*x^2)*sqrt(a+b*x)/b^3)",
	#135
	"f(1/x*1/sqrt(a+b*x),1/sqrt(a)*log((sqrt(a+b*x)-sqrt(a))/(sqrt(a+b*x)+sqrt(a))),or(not(number(a)),a>0))",
	#136
	"f(1/x*1/sqrt(a+b*x),2/sqrt(-a)*arctan(sqrt(-(a+b*x)/a)),or(not(number(a)),a<0))",
	#137
	"f(1/x^2*1/sqrt(a+b*x),-sqrt(a+b*x)/a/x-1/2*b/a*integral(1/x*1/sqrt(a+b*x),x))",
	#156
	"f(sqrt(x^2+a),1/2*(x*sqrt(x^2+a)+a*log(x+sqrt(x^2+a))))",
	#157
	"f(1/sqrt(x^2+a),log(x+sqrt(x^2+a)))",
	#158
	"f(1/x*1/sqrt(x^2+a),arcsec(x/sqrt(-a))/sqrt(-a),or(not(number(a)),a<0))",
	#159
	"f(1/x*1/sqrt(x^2+a),-1/sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
	#160
	"f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
	#161
	"f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(-a)*arcsec(x/sqrt(-a)),or(not(number(a)),a<0))",
	#162
	"f(x/sqrt(x^2+a),sqrt(x^2+a))",
	#163
	"f(x*sqrt(x^2+a),1/3*sqrt((x^2+a)^3))",
	#164 need an unexpanded version?
	"f(sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2+a^(1/3))^3)+3/2*a^(1/3)*x*sqrt(x^2+a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2+a^(1/3)))))",
		# match doesn't work for the following
	"f(sqrt(-a+x^6-3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2-a^(1/3))^3)-3/2*a^(1/3)*x*sqrt(x^2-a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2-a^(1/3)))))",
	#165
	"f(1/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),x/a^(1/3)/sqrt(x^2+a^(1/3)))",
	#166
	"f(x/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),-1/sqrt(x^2+a^(1/3)))",
	#167
	"f(x*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/5*sqrt((x^2+a^(1/3))^5))",
	#168
	"f(x^2*sqrt(x^2+a),1/4*x*sqrt((x^2+a)^3)-1/8*a*x*sqrt(x^2+a)-1/8*a^2*log(x+sqrt(x^2+a)))",
	#169
	"f(x^3*sqrt(x^2+a),(1/5*x^2-2/15*a)*sqrt((x^2+a)^3),and(number(a),a>0))",
	#170
	"f(x^3*sqrt(x^2+a),sqrt((x^2+a)^5)/5-a*sqrt((x^2+a)^3)/3,and(number(a),a<0))",
	#171
	"f(x^2/sqrt(x^2+a),1/2*x*sqrt(x^2+a)-1/2*a*log(x+sqrt(x^2+a)))",
	#172
	"f(x^3/sqrt(x^2+a),1/3*sqrt((x^2+a)^3)-a*sqrt(x^2+a))",
	#173
	"f(1/x^2*1/sqrt(x^2+a),-sqrt(x^2+a)/a/x)",
	#174
	"f(1/x^3*1/sqrt(x^2+a),-1/2*sqrt(x^2+a)/a/x^2+1/2*log((sqrt(a)+sqrt(x^2+a))/x)/a^(3/2),or(not(number(a)),a>0))",
	#175
	"f(1/x^3*1/sqrt(x^2-a),1/2*sqrt(x^2-a)/a/x^2+1/2*1/(a^(3/2))*arcsec(x/(a^(1/2))),or(not(number(a)),a>0))",
	#176+
	"f(x^2*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/6*x*sqrt((x^2+a^(1/3))^5)-1/24*a^(1/3)*x*sqrt((x^2+a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2+a^(1/3))-1/16*a*log(x+sqrt(x^2+a^(1/3))),or(not(number(a)),a>0))",
	#176-
	"f(x^2*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/6*x*sqrt((x^2-a^(1/3))^5)+1/24*a^(1/3)*x*sqrt((x^2-a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2-a^(1/3))+1/16*a*log(x+sqrt(x^2-a^(1/3))),or(not(number(a)),a>0))",
	#177+
	"f(x^3*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/7*sqrt((x^2+a^(1/3))^7)-1/5*a^(1/3)*sqrt((x^2+a^(1/3))^5),or(not(number(a)),a>0))",
	#177-
	"f(x^3*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/7*sqrt((x^2-a^(1/3))^7)+1/5*a^(1/3)*sqrt((x^2-a^(1/3))^5),or(not(number(a)),a>0))",
	#196
	"f(1/(x-a)/sqrt(x^2-a^2),-sqrt(x^2-a^2)/a/(x-a))",
	#197
	"f(1/(x+a)/sqrt(x^2-a^2),sqrt(x^2-a^2)/a/(x+a))",
	#200+
	"f(sqrt(a-x^2),1/2*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(abs(a)))))",
	#201		(seems to be handled somewhere else)
	#202
	"f(1/x*1/sqrt(a-x^2),-1/sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))",
	#203
	"f(sqrt(a-x^2)/x,sqrt(a-x^2)-sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))",
	#204
	"f(x/sqrt(a-x^2),-sqrt(a-x^2))",
	#205
	"f(x*sqrt(a-x^2),-1/3*sqrt((a-x^2)^3))",
	#210
	"f(x^2*sqrt(a-x^2),-x/4*sqrt((a-x^2)^3)+1/8*a*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(a))),or(not(number(a)),a>0))",
	#211
	"f(x^3*sqrt(a-x^2),(-1/5*x^2-2/15*a)*sqrt((a-x^2)^3),or(not(number(a)),a>0))",
	#214
	"f(x^2/sqrt(a-x^2),-x/2*sqrt(a-x^2)+a/2*arcsin(x/sqrt(a)),or(not(number(a)),a>0))",
	#215
	"f(1/x^2*1/sqrt(a-x^2),-sqrt(a-x^2)/a/x,or(not(number(a)),a>0))",
	#216
	"f(sqrt(a-x^2)/x^2,-sqrt(a-x^2)/x-arcsin(x/sqrt(a)),or(not(number(a)),a>0))",
	#217
	"f(sqrt(a-x^2)/x^3,-1/2*sqrt(a-x^2)/x^2+1/2*log((sqrt(a)+sqrt(a-x^2))/x)/sqrt(a),or(not(number(a)),a>0))",
	#218
	"f(sqrt(a-x^2)/x^4,-1/3*sqrt((a-x^2)^3)/a/x^3,or(not(number(a)),a>0))",
	# 273
	"f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*log(x*sqrt(a)+sqrt(a*x^2+b))/2/sqrt(a),and(number(a),a>0))",
	# 274
	"f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*arcsin(x*sqrt(-a/b))/2/sqrt(-a),and(number(a),a<0))",
	# 290
	"f(sin(a*x),-cos(a*x)/a)",
	# 291
	"f(cos(a*x),sin(a*x)/a)",
	# 292
	"f(tan(a*x),-log(cos(a*x))/a)",
	# 293
	"f(1/tan(a*x),log(sin(a*x))/a)",
	# 294
	"f(1/cos(a*x),log(tan(pi/4+a*x/2))/a)",
	# 295
	"f(1/sin(a*x),log(tan(a*x/2))/a)",
	# 296
	"f(sin(a*x)^2,x/2-sin(2*a*x)/(4*a))",
	# 297
	"f(sin(a*x)^3,-cos(a*x)*(sin(a*x)^2+2)/(3*a))",
	# 298
	"f(sin(a*x)^4,3/8*x-sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))",
	# 302
	"f(cos(a*x)^2,x/2+sin(2*a*x)/(4*a))",
	# 303
	"f(cos(a*x)^3,sin(a*x)*(cos(a*x)^2+2)/(3*a))",
	# 304
	"f(cos(a*x)^4,3/8*x+sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))",
	# 308
	"f(1/sin(a*x)^2,-1/(a*tan(a*x)))",
	# 312
	"f(1/cos(a*x)^2,tan(a*x)/a)",
	# 318
	"f(sin(a*x)*cos(a*x),sin(a*x)^2/(2*a))",
	# 320
	"f(sin(a*x)^2*cos(a*x)^2,-sin(4*a*x)/(32*a)+x/8)",
	# 326
	"f(sin(a*x)/cos(a*x)^2,1/(a*cos(a*x)))",
	# 327
	"f(sin(a*x)^2/cos(a*x),(log(tan(pi/4+a*x/2))-sin(a*x))/a)",
	# 328
	"f(cos(a*x)/sin(a*x)^2,-1/(a*sin(a*x)))",
	# 329
	"f(1/(sin(a*x)*cos(a*x)),log(tan(a*x))/a)",
	# 330
	"f(1/(sin(a*x)*cos(a*x)^2),(1/cos(a*x)+log(tan(a*x/2)))/a)",
	# 331
	"f(1/(sin(a*x)^2*cos(a*x)),(log(tan(pi/4+a*x/2))-1/sin(a*x))/a)",
	# 333
	"f(1/(sin(a*x)^2*cos(a*x)^2),-2/(a*tan(2*a*x)))",
	# 335
	"f(sin(a+b*x),-cos(a+b*x)/b)",
	# 336
	"f(cos(a+b*x),sin(a+b*x)/b)",
	# 337+ (with the addition of b)
	"f(1/(b+b*sin(a*x)),-tan(pi/4-a*x/2)/a/b)",
	# 337- (with the addition of b)
	"f(1/(b-b*sin(a*x)),tan(pi/4+a*x/2)/a/b)",
	# 338 (with the addition of b)
	"f(1/(b+b*cos(a*x)),tan(a*x/2)/a/b)",
	# 339 (with the addition of b)
	"f(1/(b-b*cos(a*x)),-1/tan(a*x/2)/a/b)",
	# 340
	"f(1/(a+b*sin(x)),1/sqrt(b^2-a^2)*log((a*tan(x/2)+b-sqrt(b^2-a^2))/(a*tan(x/2)+b+sqrt(b^2-a^2))),b^2-a^2)", 	# check that b^2-a^2 is not zero
	# 341
	"f(1/(a+b*cos(x)),1/sqrt(b^2-a^2)*log((sqrt(b^2-a^2)*tan(x/2)+a+b)/(sqrt(b^2-a^2)*tan(x/2)-a-b)),b^2-a^2)", 	# check that b^2-a^2 is not zero
	# 389
	"f(x*sin(a*x),sin(a*x)/a^2-x*cos(a*x)/a)",
	# 390
	"f(x^2*sin(a*x),2*x*sin(a*x)/a^2-(a^2*x^2-2)*cos(a*x)/a^3)",
	# 393
	"f(x*cos(a*x),cos(a*x)/a^2+x*sin(a*x)/a)",
	# 394
	"f(x^2*cos(a*x),2*x*cos(a*x)/a^2+(a^2*x^2-2)*sin(a*x)/a^3)",
	# 441
	"f(arcsin(a*x),x*arcsin(a*x)+sqrt(1-a^2*x^2)/a)",
	# 442
	"f(arccos(a*x),x*arccos(a*x)-sqrt(1-a^2*x^2)/a)",
	# 443
	"f(arctan(a*x),x*arctan(a*x)-1/2*log(1+a^2*x^2)/a)",
	# 485 (with addition of a)
	"f(log(a*x),x*log(a*x)-x)",
	# 486 (with addition of a)
	"f(x*log(a*x),x^2*log(a*x)/2-x^2/4)",
	# 487 (with addition of a)
	"f(x^2*log(a*x),x^3*log(a*x)/3-1/9*x^3)",
	# 489
	"f(log(x)^2,x*log(x)^2-2*x*log(x)+2*x)",
	# 493 (with addition of a)
	"f(1/x*1/(a+log(x)),log(a+log(x)))",
	# 499
	"f(log(a*x+b),(a*x+b)*log(a*x+b)/a-x)",
	# 500
	"f(log(a*x+b)/x^2,a/b*log(x)-(a*x+b)*log(a*x+b)/b/x)",
	# 554
	"f(sinh(x),cosh(x))",
	# 555
	"f(cosh(x),sinh(x))",
	# 556
	"f(tanh(x),log(cosh(x)))",
	# 560
	"f(x*sinh(x),x*cosh(x)-sinh(x))",
	# 562
	"f(x*cosh(x),x*sinh(x)-cosh(x))",
	# 566
	"f(sinh(x)^2,sinh(2*x)/4-x/2)",
	# 569
	"f(tanh(x)^2,x-tanh(x))",
	# 572
	"f(cosh(x)^2,sinh(2*x)/4+x/2)",
	# ?
	"f(x^3*exp(a*x^2),exp(a*x^2)*(x^2/a-1/(a^2))/2)",
	# ?
	"f(x^3*exp(a*x^2+b),exp(a*x^2)*exp(b)*(x^2/a-1/(a^2))/2)",
	# ?
	"f(exp(a*x^2),-i*sqrt(pi)*erf(i*sqrt(a)*x)/sqrt(a)/2)",
	# ?
	"f(erf(a*x),x*erf(a*x)+exp(-a^2*x^2)/a/sqrt(pi))",

	# these are needed for the surface integral in the manual

	"f(x^2*(1-x^2)^(3/2),(x*sqrt(1-x^2)*(-8*x^4+14*x^2-3)+3*arcsin(x))/48)",
	"f(x^2*(1-x^2)^(5/2),(x*sqrt(1-x^2)*(48*x^6-136*x^4+118*x^2-15)+15*arcsin(x))/384)",
	"f(x^4*(1-x^2)^(3/2),(-x*sqrt(1-x^2)*(16*x^6-24*x^4+2*x^2+3)+3*arcsin(x))/128)",

	"f(x*exp(a*x),exp(a*x)*(a*x-1)/(a^2))",
	"f(x*exp(a*x+b),exp(a*x+b)*(a*x-1)/(a^2))",

	"f(x^2*exp(a*x),exp(a*x)*(a^2*x^2-2*a*x+2)/(a^3))",
	"f(x^2*exp(a*x+b),exp(a*x+b)*(a^2*x^2-2*a*x+2)/(a^3))",

	"f(x^3*exp(a*x),exp(a*x)*x^3/a-3/a*integral(x^2*exp(a*x),x))",
	"f(x^3*exp(a*x+b),exp(a*x+b)*x^3/a-3/a*integral(x^2*exp(a*x+b),x))",
	0

]


#define F p3
#define X p4
#define N p5

Eval_integral = ->
	i = 0
	n = 0

	# evaluate 1st arg to get function F

	p1 = cdr(p1)
	push(car(p1))
	Eval()

	# evaluate 2nd arg and then...

	# example		result of 2nd arg	what to do
	#
	# integral(f)		nil			guess X, N = nil
	# integral(f,2)	2			guess X, N = 2
	# integral(f,x)	x			X = x, N = nil
	# integral(f,x,2)	x			X = x, N = 2
	# integral(f,x,y)	x			X = x, N = y

	p1 = cdr(p1)
	push(car(p1))
	Eval()

	p2 = pop()
	if (p2 == symbol(NIL))
		guess()
		push(symbol(NIL))
	else if (isnum(p2))
		guess()
		push(p2)
	else
		push(p2)
		p1 = cdr(p1)
		push(car(p1))
		Eval()

	p5 = pop()
	p4 = pop()
	p3 = pop()

	while (1)

		# N might be a symbol instead of a number

		if (isnum(p5))
			push(p5)
			n = pop_integer()
			if (isNaN(n))
				stop("nth integral: check n")
		else
			n = 1

		push(p3)

		if (n >= 0)
			for i in [0...n]
				push(p4)
				integral()
		else
			n = -n
			for i in [0...n]
				push(p4)
				derivative()

		p3 = pop()

		# if N is nil then arglist is exhausted

		if (p5 == symbol(NIL))
			break

		# otherwise...

		# N		arg1		what to do
		#
		# number	nil		break
		# number	number		N = arg1, continue
		# number	symbol		X = arg1, N = arg2, continue
		#
		# symbol	nil		X = N, N = nil, continue
		# symbol	number		X = N, N = arg1, continue
		# symbol	symbol		X = N, N = arg1, continue

		if (isnum(p5))
			p1 = cdr(p1)
			push(car(p1))
			Eval()
			p5 = pop()
			if (p5 == symbol(NIL))
				break;		# arglist exhausted
			if (isnum(p5))
				doNothing = 1		# N = arg1
			else
				p4 = p5;		# X = arg1
				p1 = cdr(p1)
				push(car(p1))
				Eval()
				p5 = pop();	# N = arg2
		else
			p4 = p5;			# X = N
			p1 = cdr(p1)
			push(car(p1))
			Eval()
			p5 = pop();		# N = arg1

	push(p3);	# final result

integral = ->
	save()
	p2 = pop()
	p1 = pop()
	if (car(p1) == symbol(ADD))
		integral_of_sum()
	else if (car(p1) == symbol(MULTIPLY))
		integral_of_product()
	else
		integral_of_form()
	p1 = pop()
	if (Find(p1, symbol(INTEGRAL)))
		stop("integral: sorry, could not find a solution")
	push(p1)
	simplify();	# polish the result
	Eval();		# normalize the result
	restore()

integral_of_sum = ->
	p1 = cdr(p1)
	push(car(p1))
	push(p2)
	integral()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		push(p2)
		integral()
		add()
		p1 = cdr(p1)

integral_of_product = ->
	push(p1)
	push(p2)
	partition()
	p1 = pop();			# pop variable part
	integral_of_form()
	multiply();			# multiply constant part

integral_of_form = ->
	push(p1) # free variable
	push(p2) # input expression
	transform(itab, false)
	p3 = pop()
	if (p3 == symbol(NIL))
		push_symbol(INTEGRAL)
		push(p1)
		push(p2)
		list(3)
	else
		push(p3)


