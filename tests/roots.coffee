test_roots = ->
	run_test [

		"roots(x)",
		"0",

		"roots(2^x-y,y)",
		"2^x",

		"roots(x^2)",
		"0",

		"roots(x^3)",
		"0",

		"roots(2 x)",
		"0",

		"roots(2 x^2)",
		"0",

		"roots(i*x^2-13*i*x+36*i)",
		"[4,9]",

		"roots(2 x^3)",
		"0",

		"roots(6+11*x+6*x^2+x^3)",
		"[-3,-2,-1]",

		"roots(a*x^2+b*x+c)",
		#"[-b/(2*a)-(-4*a*c+b^2)^(1/2)/(2*a),-b/(2*a)+(-4*a*c+b^2)^(1/2)/(2*a)]",
		"[-1/2*(b^2/(a^2)-4*c/a)^(1/2)-b/(2*a),1/2*(b^2/(a^2)-4*c/a)^(1/2)-b/(2*a)]",

		"roots(3+7*x+5*x^2+x^3)",
		"[-3,-1]",

		"roots(x^3+x^2+x+1)",
		"[-1,-i,i]",

		"roots(x^2==1)",
		"[-1,1]",

		"roots(3 x + 12 == 24)",
		"4",

		"y=roots(x^2+b*x+c/k)[1]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(x^2+b*x+c/k)[2]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(a*x^2+b*x+c/4)[1]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=roots(a*x^2+b*x+c/4)[2]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=quote(y)",
		"",

		# --------------------------------------------
		# some more tests with 3rd degree polynomials
		# including use of cubic formula.
		# Only the ones marked "DOES use cubic formula"
		# actually do so, all other examples manage to
		# be reduced via factoring.
		# --------------------------------------------

		"roots(x^3 + x^2 + x + 1)",
		"[-1,-i,i]",
		
		"roots(2*x^3 + 3*x^2 - 11*x - 6)",
		"[-3,-1/2,2]",

		"roots(x^3 - 7*x^2 + 4*x + 12)",
		"[-1,2,6]",

		"roots(x^3 + 1)",
		"[-1,1/2-1/2*i*3^(1/2),1/2+1/2*i*3^(1/2)]",
		# also: "[-1,-(-1)^(2/3),(-1)^(1/3))",
		
		"roots(x^3 - 1)",
		"[1,-1/2-1/2*i*3^(1/2),-1/2+1/2*i*3^(1/2)]",
		# also: "[1,-(-1)^(1/3),(-1)^(2/3))",
		
		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = x^3 + d",
		"",

		"roots(thePoly)",
		# also OK:
		#    "[-d^(1/3),1/2*d^(1/3)*(1-i*3^(1/2)),1/2*d^(1/3)*(1+i*3^(1/2)))",
		# or "[-(-1)^(2/3)*d^(1/3),-d^(1/3),(-1)^(1/3)*d^(1/3))",
		"[1/2*d^(1/3)-1/2*i*3^(1/2)*d^(1/3),1/2*d^(1/3)+1/2*i*3^(1/2)*d^(1/3),-d^(1/3)]",
			
		"and((simplify(subst(last[1],x,thePoly)) == 0),(simplify(subst(last[2],x,thePoly)) == 0),(simplify(subst(last[3],x,thePoly)) == 0))",
		"1",

		# DOES use cubic formula
		# the actual format of this solution might change, the important thing
		# is that the next few tests work, where we plug in the
		# symbolic solutions in the polynomial again and we check that we
		# get the zeroes.

		"clearall",
		"",

		"thePoly = a*x^3 + b*x^2 + c*x + d",
		"",
			
		"roots(thePoly)",
		"[-1/3*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3)-b^2/(3*a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3))-b/(3*a)+c/(a*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3)),(-1/3*a*b*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3)-1/2*a*c+1/6*b^2-1/2*i*3^(1/2)*a*c-1/6*i*3^(1/2)*a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(2/3)+1/6*i*3^(1/2)*b^2+1/6*a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(2/3))/(a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3)),(-1/3*a*b*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3)-1/2*a*c+1/6*b^2+1/2*i*3^(1/2)*a*c+1/6*i*3^(1/2)*a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(2/3)-1/6*i*3^(1/2)*b^2+1/6*a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(2/3))/(a^2*(1/2*(-27*b^2*c^2/(a^4)+108*b^3*d/(a^4)-486*b*c*d/(a^3)+108*c^3/(a^3)+729*d^2/(a^2))^(1/2)+b^3/(a^3)-9*b*c/(2*a^2)+27*d/(2*a))^(1/3))]",
			
		"and((simplify(subst(last[1],x,thePoly)) == 0),(simplify(subst(last[2],x,thePoly)) == 0),(simplify(subst(last[3],x,thePoly)) == 0))",
		"1",

		"roots(x^3 + 6x - 20)",
		"[2,-1-3*i,-1+3*i]",

		"roots(x^3 - 6x - 40)",
		"[4,-2-i*2^(1/2)*3^(1/2),-2+i*2^(1/2)*3^(1/2)]",
			
		"roots(x^3 + x^2 - 5x - 5)",
		"[-1,-5^(1/2),5^(1/2)]",
			
		"roots(x^3 - 8x + 3)",
		"[-3,3/2-1/2*5^(1/2),3/2+1/2*5^(1/2)]",
			
		"roots(x^3 - 8x - 3)",
		"[3,-3/2-1/2*5^(1/2),-3/2+1/2*5^(1/2)]",
			
		"roots(x^3 - 18x + 35)",
		"[-5,5/2-1/2*i*3^(1/2),5/2+1/2*i*3^(1/2)]",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = x^3 - 3x + 1",
		"",
			
		"roots(thePoly)",
		"[-(-1)^(1/9)+(-1)^(8/9),1/2*cos(1/9*pi)-1/2*cos(8/9*pi)+1/2*i*sin(1/9*pi)-1/2*i*sin(8/9*pi)-3^(1/2)*cos(11/18*pi),1/2*cos(1/9*pi)-1/2*cos(8/9*pi)+1/2*i*sin(1/9*pi)-1/2*i*sin(8/9*pi)+3^(1/2)*cos(11/18*pi)]",
		# also: "[(3+1/3*(27/2+27/2*i*3^(1/2))^(2/3)-3*i*3^(1/2)+1/3*i*3^(1/2)*(27/2+27/2*i*3^(1/2))^(2/3))/(2*(27/2+27/2*i*3^(1/2))^(1/3)),(3+1/3*(27/2+27/2*i*3^(1/2))^(2/3)+3*i*3^(1/2)-1/3*i*3^(1/2)*(27/2+27/2*i*3^(1/2))^(2/3))/(2*(27/2+27/2*i*3^(1/2))^(1/3)),(-3-1/3*(27/2+27/2*i*3^(1/2))^(2/3))/((27/2+27/2*i*3^(1/2))^(1/3)))",
					
		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))))",
		"1",
			
		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = x^3 - 3x - 1",
		"",
			
		"roots(thePoly)",
		"[-(-1)^(2/9)+(-1)^(7/9),1/2*cos(2/9*pi)-1/2*cos(7/9*pi)+1/2*i*sin(2/9*pi)-1/2*i*sin(7/9*pi)-3^(1/2)*cos(13/18*pi),1/2*cos(2/9*pi)-1/2*cos(7/9*pi)+1/2*i*sin(2/9*pi)-1/2*i*sin(7/9*pi)+3^(1/2)*cos(13/18*pi)]",
		# also: "[(3+1/3*(-27/2+27/2*i*3^(1/2))^(2/3)-3*i*3^(1/2)+1/3*i*3^(1/2)*(-27/2+27/2*i*3^(1/2))^(2/3))/(2*(-27/2+27/2*i*3^(1/2))^(1/3)),(3+1/3*(-27/2+27/2*i*3^(1/2))^(2/3)+3*i*3^(1/2)-1/3*i*3^(1/2)*(-27/2+27/2*i*3^(1/2))^(2/3))/(2*(-27/2+27/2*i*3^(1/2))^(1/3)),(-3-1/3*(-27/2+27/2*i*3^(1/2))^(2/3))/((-27/2+27/2*i*3^(1/2))^(1/3)))",
			
		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))))",
		"1",
			
		"roots(x^3 - 15x - 4)",
		"[4,-2-3^(1/2),-2+3^(1/2)]",
			
		"roots(2*x^3 - 4x^2 - 22*x + 24)",
		"[-3,1,4]",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 3*x^3 - 10*x^2 - 14*x + 27",
		"",
			
		"roots(thePoly)",
		"[1/3*(10/3-226/(9*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))-(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3)),1/3*(10/3+113/(9*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))+1/2*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3)-113*i*3^(1/2)/(9*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))+1/2*i*3^(1/2)*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3)),1/3*(10/3+113/(9*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))+1/2*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3)+113*i*3^(1/2)/(9*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))-1/2*i*3^(1/2)*(781/54+i*97^(1/2)*1933^(1/2)/(2*3^(1/2)))^(1/3))]",
			
		"and((subst(float(last[1]),x,thePoly) == 0),(subst(float(last[2]),x,thePoly) == 0),(subst(float(last[3]),x,thePoly)) == 0)",
		"1",
			

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 1*x^3 + 6*x^2 - 12*x + 8",
		"",
			
		"roots(thePoly)",
		"[-2+2^(1/3)+2^(2/3)-i*2^(1/3)*3^(1/2)+i*2^(2/3)*3^(1/2),-2+2^(1/3)+2^(2/3)+i*2^(1/3)*3^(1/2)-i*2^(2/3)*3^(1/2),-2*(1+2^(1/3)+2^(2/3))]",
			
		"and((subst(float(last[1]),x,thePoly) == 0),(subst(float(last[2]),x,thePoly) == 0),(subst(float(last[3]),x,thePoly) == 0))",
		"1",


		"roots(1*x^3 + 6*x^2 + 12*x + 8)",
		"-2",
			
		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 1*x^3 + 0*x^2 + 12*x - 10",
		"",
			
		"roots(thePoly)",
		"[(-6+1/6*(-135+27*89^(1/2))^(2/3)-6*i*3^(1/2)-1/6*i*3^(1/2)*(-135+27*89^(1/2))^(2/3))/((-135+27*89^(1/2))^(1/3)),(-6+1/6*(-135+27*89^(1/2))^(2/3)+6*i*3^(1/2)+1/6*i*3^(1/2)*(-135+27*89^(1/2))^(2/3))/((-135+27*89^(1/2))^(1/3)),(12-1/3*(-135+27*89^(1/2))^(2/3))/((-135+27*89^(1/2))^(1/3))]",
			
		"and((subst(float(last[1]),x,thePoly) < float(10^(-13))),(subst(float(last[2]),x,thePoly) < float(10^(-13))),(subst(float(last[3]),x,thePoly) < float(10^(-14))))",
		"1",
			
		"roots(1*x^3 + 0*x^2 - 18*x + 35)",
		"[-5,5/2-1/2*i*3^(1/2),5/2+1/2*i*3^(1/2)]",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 1*x^3 + 0*x^2 - 3*x - 6",
		"",
			
		"roots(thePoly)",
		"[(3+1/3*(-81+54*2^(1/2))^(2/3)-3*i*3^(1/2)+1/3*i*3^(1/2)*(-81+54*2^(1/2))^(2/3))/(2*(-81+54*2^(1/2))^(1/3)),(3+1/3*(-81+54*2^(1/2))^(2/3)+3*i*3^(1/2)-1/3*i*3^(1/2)*(-81+54*2^(1/2))^(2/3))/(2*(-81+54*2^(1/2))^(1/3)),(-3-1/3*(-81+54*2^(1/2))^(2/3))/((-81+54*2^(1/2))^(1/3))]",
			
		"and((subst(float(last[1]),x,thePoly) < float(10^(-14))),(subst(float(last[2]),x,thePoly) < float(10^(-14))),(subst(float(last[3]),x,thePoly) < float(10^(-14))))",
		"1",
			
		"roots(2*x^3 - 30*x^2 + 162*x - 350)",
		"[7,4-3*i,4+3*i]",

		"roots(1*x^3 - 4*x^2 - 6*x + 5)",
		"[5,-1/2-1/2*5^(1/2),-1/2+1/2*5^(1/2)]",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 3*x^3 + 6*x^2 + 4*x + 9",
		"",
			
		"roots(thePoly)",
		"[1/3*(-2-73^(1/3)),1/3*(-2+1/2*73^(1/3)-1/2*i*3^(1/2)*73^(1/3)),1/3*(-2+1/2*73^(1/3)+1/2*i*3^(1/2)*73^(1/3))]",
			
		"and((subst(float(last[1]),x,thePoly) < float(10^(-14))),(subst(float(last[2]),x,thePoly) < float(10^(-14))),(subst(float(last[3]),x,thePoly) < float(10^(-14))))",
		"1",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 3*x^3 + 21*x^2 + 2*x + 3",
		"",
			
		"roots(thePoly)",
		"[1/3*(-7-47/((671/2+1/2*34949^(1/2))^(1/3))-(671/2+1/2*34949^(1/2))^(1/3)),1/3*(-7+47/(2*(671/2+1/2*34949^(1/2))^(1/3))+1/2*(671/2+1/2*34949^(1/2))^(1/3)-47*i*3^(1/2)/(2*(671/2+1/2*34949^(1/2))^(1/3))+1/2*i*3^(1/2)*(671/2+1/2*34949^(1/2))^(1/3)),1/3*(-7+47/(2*(671/2+1/2*34949^(1/2))^(1/3))+1/2*(671/2+1/2*34949^(1/2))^(1/3)+47*i*3^(1/2)/(2*(671/2+1/2*34949^(1/2))^(1/3))-1/2*i*3^(1/2)*(671/2+1/2*34949^(1/2))^(1/3))]",
			
		"and((subst(float(last[1]),x,thePoly) < float(10^(-12))),(subst(float(last[2]),x,thePoly) < float(10^(-13))),(subst(float(last[3]),x,thePoly) < float(10^(-13))))",
		"1",

		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 3*x^3 - 6*x^2 + 4*x - 5",
		"",
			
		"roots(thePoly)",
		# also these ones could be sort of OK:
		#  "[2/3-1/3*(-1)^(1/3)*37^(1/3),2/3+1/6*(-1)^(1/3)*37^(1/3)-(-1)^(5/6)*37^(1/3)/(2*3^(1/2)),2/3+1/6*(-1)^(1/3)*37^(1/3)+(-1)^(5/6)*37^(1/3)/(2*3^(1/2)))",
		#  "[2/3-1/3*(-1)^(1/3)*37^(1/3),2/3-1/6*37^(1/3)+i*37^(1/3)/(2*3^(1/2)),2/3+1/3*37^(1/3))",
		#  "[1/3*(2-(-1)^(1/3)*37^(1/3)),1/3*(2-1/2*37^(1/3)+1/2*i*3^(1/2)*37^(1/3)),1/3*(2+37^(1/3)))",
		"[2/3-1/3*(-1)^(1/3)*37^(1/3),1/3*(2-1/2*37^(1/3)+1/2*i*3^(1/2)*37^(1/3)),1/3*(2+37^(1/3))]",
		
		"and((subst(float(last[1]),x,thePoly) < float(10^(-14))),(subst(float(last[2]),x,thePoly) < float(10^(-14))),(subst(float(last[3]),x,thePoly) < float(10^(-14))))",
		"1",

		"roots(8*x^3 - 36*x^2 + 54*x - 27)",
		"3/2",

		"roots(3*x^3 - 5*x^2 - 1*x - 2)",
		"[2,-1/6-1/6*i*11^(1/2),-1/6+1/6*i*11^(1/2)]",


		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = 3*x^3 - 6*x^2 + 4*x - i",
		"",
			
		"roots(thePoly)",
		"[1/3*(2-(8-9*i)^(1/3)),1/3*(2+1/2*(8-9*i)^(1/3)-1/2*i*3^(1/2)*(8-9*i)^(1/3)),1/3*(2+1/2*(8-9*i)^(1/3)+1/2*i*3^(1/2)*(8-9*i)^(1/3))]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))))",
		"1",


		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = x^3+i",
		"",
			
		"roots(thePoly)",
		# also these could be OK:
		# "[1/2*(-1)^(1/6)-1/2*(-1)^(2/3)*3^(1/2),-(-1)^(1/6),1/2*(-1)^(1/6)*(1+i*3^(1/2)))",
		# "[-1/2*i+1/2*3^(1/2),-(-1)^(1/6),i)",
		# "[-(-1)^(1/6),-(-1)^(5/6),i)",
		"[-1/2*i-1/2*3^(1/2),-1/2*i+1/2*3^(1/2),i]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))))",
		"1",


		"clearall",
		"",

		# DOES use cubic formula
		"thePoly = x^3-i",
		"",
			
		"roots(thePoly)",
		# "[-i,1/2*(i-3^(1/2)),1/2*(i+3^(1/2)))",
		# "[-i,(-1)^(1/6),(-1)^(5/6))",
		"[-3/4*i-1/2*(-1)^(5/6)-1/4*3^(1/2),3/4*i-1/2*(-1)^(5/6)+1/4*3^(1/2),(-1)^(5/6)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))))",
		"1",

		# some quartics

		"clearall",
		"",

		"thePoly = x^4 + 1",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		# "[-(-1)^(1/4),-(-1)^(3/4),(-1)^(1/4),(-1)^(3/4))",
		"[-1/2*2^(1/2)-1/2*i*2^(1/2),-1/2*2^(1/2)+1/2*i*2^(1/2),1/2*2^(1/2)-1/2*i*2^(1/2),1/2*2^(1/2)+1/2*i*2^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-15))))",
		"1",

		"clearall",
		"",

		"thePoly = 4*x^4 - 1*x^3 + 4*x^2 + 3*x + 5",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[1/16-1/2*(-125/96-447/(256*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2))-265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)-265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2)+1/2*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2),1/16-1/2*(-125/96+447/(256*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2))-265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)-265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2)-1/2*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2),1/16+1/2*(-125/96-447/(256*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2))-265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)-265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2)+1/2*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2),1/16+1/2*(-125/96+447/(256*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2))-265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)-265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2)-1/2*(-125/192+265/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))+1/3*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3)+265*i*3^(1/2)/(192*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))-1/3*i*3^(1/2)*(4417/1024+9/1024*i*461^(1/2)*1471^(1/2))^(1/3))^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^5 + 1",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		# "[-1,-(-1)^(2/5),-(-1)^(4/5),(-1)^(1/5),(-1)^(3/5))",
		"[-1,cos(1/5*pi)+i*sin(1/5*pi),cos(3/5*pi)+i*sin(3/5*pi),-cos(2/5*pi)-i*sin(2/5*pi),-cos(4/5*pi)-i*sin(4/5*pi)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[5]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = a*x^5 + k",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots[1] = simplify(theRoots[1])",
		"",

		"theRoots[1]",
		"-(-1)^(2/5)*((k/a)^(2/5))^(1/2)",

		"theRoots[2] = simplify(theRoots[2])",
		"",

		"theRoots[2]",
		"-(-1)^(4/5)*((k/a)^(2/5))^(1/2)",

		"theRoots[3] = circexp(theRoots[3])",
		"",

		"theRoots[3]",
		"exp(1/5*i*pi)*(k/a)^(1/5)",

		"theRoots[4] = circexp(theRoots[4])",
		"",

		"theRoots[4]",
		"exp(3/5*i*pi)*(k/a)^(1/5)",

		"theRoots[5] = simplify(theRoots[5])",
		"",

		"theRoots[5]",
		"-(k/a)^(1/5)",

		# unfortunately the comparison here doesn't work,
		# due to rounding errors float() produces expressions that still hve
		# a and k, albeit with really small
		# coefficients, and hence the "<" comparison finds variables with
		# undefined values and
		# fails.

		#"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[5]),x,thePoly))) < float(2*10^(-12))))",
		#"1",

		"clearall",
		"",

		"thePoly = x^3 - 7*x^2 + 41*x - 87",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[3,2-5*i,2+5*i]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = 398683376+1720835*x+2320*x^2+x^3",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		# root 1 ~= -961.79, root 2 ~= -895.12, root 3 ~= -463.09
		# all three of them have a very small "error" imaginary part ~= 10^-13
		"theRoots",
		"[-2320/3-219895/(3*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3))-1/3*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3),-2320/3+219895/(6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3))+1/6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3)-219895*i*3^(1/2)/(6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3))+1/6*i*3^(1/2)*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3),-2320/3+219895/(6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3))+1/6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3)+219895*i*3^(1/2)/(6*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3))-1/6*i*3^(1/2)*(-96123824+9*i*7^(1/2)*79^(1/2)*2297^(1/2)*13538519^(1/2))^(1/3)]",

		# the error here is particularly high because of the big coefficients
		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-7))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-7))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-7))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4 - 1*x^3 + 4*x^2 + 3*x + 5",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-1/2-1/2*i*3^(1/2),-1/2+1/2*i*3^(1/2),1-2*i,1+2*i]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4 - 2*x^3 - 7*x^2 + 8*x + 12",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-2,-1,2,3]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4+8*x^2+3",
		"",
		
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-(-4-13^(1/2))^(1/2),-(-4+13^(1/2))^(1/2),(-4-13^(1/2))^(1/2),(-4+13^(1/2))^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = -1*x^3-1*x^2+10*x - 8",
		"",
		
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-4,1,2]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = -3-9*x+3*x^2+x^3",
		"",
		
		"theRoots = roots(thePoly)",
		"",

		# these solutions are slightly verbose but they are essentially good,
		# take into account that ((108+108*i*3^(1/2))^(1/3)) is
		# really just a compact version (in terms of number of nodes)
		# for 3*2^(2/3)*(1+i*sqrt(3))^(1/3)
		# (just take out 108 from the radical, and 108 is 2x2x3x3x3)
		# so essentially these are written a little redundantly but
		# they actually are in pretty good form.
		"theRoots",
		# "[-1-12/((108+108*i*3^(1/2))^(1/3))-1/3*(108+108*i*3^(1/2))^(1/3),-1+6/((108+108*i*3^(1/2))^(1/3))+1/6*(108+108*i*3^(1/2))^(1/3)-6*i*3^(1/2)/((108+108*i*3^(1/2))^(1/3))+1/6*i*3^(1/2)*(108+108*i*3^(1/2))^(1/3),-1+6/((108+108*i*3^(1/2))^(1/3))+1/6*(108+108*i*3^(1/2))^(1/3)+6*i*3^(1/2)/((108+108*i*3^(1/2))^(1/3))-1/6*i*3^(1/2)*(108+108*i*3^(1/2))^(1/3))",
		"[-1+cos(1/9*pi)-cos(8/9*pi)+i*sin(1/9*pi)-i*sin(8/9*pi)-2*3^(1/2)*cos(11/18*pi),-1+cos(1/9*pi)-cos(8/9*pi)+i*sin(1/9*pi)-i*sin(8/9*pi)+2*3^(1/2)*cos(11/18*pi),-1-2*cos(1/9*pi)+2*cos(8/9*pi)-2*i*sin(1/9*pi)+2*i*sin(8/9*pi)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4 + 8*x^3 + 12*x^2 + (2*30^(1/2) -16)*x + 4*30^(1/2)-28",
		"",
		
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-2-1/2*(18-4*5^(1/2))^(1/2)+3^(1/2)/(2^(1/2)),-2-1/2*(18+4*5^(1/2))^(1/2)-1/2*2^(1/2)*3^(1/2),-2+1/2*(18-4*5^(1/2))^(1/2)+3^(1/2)/(2^(1/2)),-2+1/2*(18+4*5^(1/2))^(1/2)-1/2*2^(1/2)*3^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^3 + x - 2",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[1,-1/2-1/2*i*7^(1/2),-1/2+1/2*i*7^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))))",
		"1",


		"clearall",
		"",

		"thePoly = x^3 + x^2 - 7",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		# note how we can't use "last" here because the assignment returns nothing
		"and(abs(float(subst(theRoots[1],x,thePoly))) < float(2*10^(-12)),abs(float(subst(theRoots[2],x,thePoly))) < float(2*10^(-12)),abs(float(subst(theRoots[3],x,thePoly))) < float(2*10^(-12)))",
		"1",

		# some quartics

		"clearall",
		"",

		"thePoly = x^4 + 8*x^2 + 3",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-(-4-13^(1/2))^(1/2),-(-4+13^(1/2))^(1/2),(-4-13^(1/2))^(1/2),(-4+13^(1/2))^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(8*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(8*10^(-15))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-15))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4 - 10*x^3 + 21*x^2 + 40*x - 100",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-2,2,5]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = 2*x^4 - 8*x^3 + 2*x^2 + 24*x - 14",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"clearall",
		"",

		"thePoly = x^4 - 4*x^3 + x^2 + 12*x - 7",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-1/2-1/2*5^(1/2),-1/2+1/2*5^(1/2),5/2-1/2*i*3^(1/2),5/2+1/2*i*3^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = 2*x^4 - 8*x^3 + 2*x^2 + 24*x - 14",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-1/2-1/2*5^(1/2),-1/2+1/2*5^(1/2),5/2-1/2*i*3^(1/2),5/2+1/2*i*3^(1/2)]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		"clearall",
		"",

		"thePoly = x^4 - 9*x^3 + 22*x^2 + 28*x - 120",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-2,3,4-2*i,4+2*i]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		"1",

		
		#"thePoly = 4* x^4 - 9*x^3 + 22*x^2 + 28*x - 120",
		#"",
		#	
		# these are really ugly - sympy or wolfram alpha don't give clean symbolic solutions either
		#"theRoots = roots(thePoly)",
		#"",
		#
		#"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		#"1",
		#
		#"thePoly = -20*x^4 + 5*x^3 + 17*x^2 - 29*x + 87",
		#"",
		#	
		# these are really ugly - sympy or wolfram alpha don't give clean symbolic solutions either
		#"theRoots = roots(thePoly)",
		#"",
		#
		#"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-12))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-12))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-12))))",
		#"1",
		#

		"clearall",
		"",

		"thePoly = x^4 + 2*x^3 - 41*x^2 - 42*x + 360",
		"",
			
		"theRoots = roots(thePoly)",
		"",

		"theRoots",
		"[-6,-4,3,5]",

		"and((abs(float(subst(float(last[1]),x,thePoly))) < float(2*10^(-15))),(abs(float(subst(float(last[2]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[3]),x,thePoly))) < float(2*10^(-15))), (abs(float(subst(float(last[4]),x,thePoly))) < float(2*10^(-15))))",
		"1",



		# clean up
		"thePoly = quote(thePoly)",
		"",

		"theRoots = quote(theRoots)",
		"",

	]
