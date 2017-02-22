# mini test for distribution builds

mini_test = ->

	run_test [
		# static spherical metric

		"clearall",
		"",

		"gdd=[[-exp(2*Phi(r)),0,0,0],[0,exp(2*Lambda(r)),0,0],[0,0,r^2,0],[0,0,0,r^2*sin(theta)^2]]",
		"",

		"X=[t,r,theta,phi]",
		"",

		"guu=inv(gdd)",
		"",

		"gddd=d(gdd,X)",
		"",

		"GAMDDD=1/2*(gddd+transpose(gddd,2,3)-transpose(transpose(gddd,2,3),1,2))",
		"",

		"GAMUDD=contract(outer(guu,GAMDDD),2,3)",
		"",

		"T1=d(GAMUDD,X)",
		"",

		"T2=contract(outer(GAMUDD,GAMUDD),2,4)",
		"",

		"RUDDD=transpose(T1,3,4)-T1+transpose(T2,2,3)-transpose(transpose(T2,2,3),3,4)",
		"",

		"RDD=contract(RUDDD,1,3)",
		"",

		"R=contract(contract(outer(guu,RDD),2,3),1,2)",
		"",

		"GDD=RDD-1/2*gdd*R",
		"",

		"Gtt=1/r^2*exp(2 Phi(r)) d(r*(1 - exp(-2 Lambda(r))),r)",
		"",

		"Grr=-1/r^2*exp(2*Lambda(r))*(1-exp(-2*Lambda(r)))+2/r*d(Phi(r),r)",
		"",

		"Gthetatheta=r^2*exp(-2*Lambda(r))*(d(d(Phi(r),r),r)+d(Phi(r),r)^2+d(Phi(r),r)/r-d(Phi(r),r)*d(Lambda(r),r)-d(Lambda(r),r)/r)",
		"",

		"Gphiphi=sin(theta)^2*Gthetatheta",
		"",

		"T=[[Gtt,0,0,0],[0,Grr,0,0],[0,0,Gthetatheta,0],[0,0,0,Gphiphi]]",
		"",

		"GDD-T",
		"[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]",

		# surface integral example from the manual

		"clearall",
		"",

		"z=1-x^2-y^2",
		"",

		"F=[x*y^2*z,-2*x^3,y*z^2]",
		"",

		"S=[x,y,z]",
		"",

		"s=dot(F,cross(d(S,x),d(S,y)))",
		"",

		"defint(s,y,-sqrt(1-x^2),sqrt(1-x^2),x,-1,1)",
		"1/48*pi",

	# hydrogen wavefunction example

		"clearall",
		"",

		"laplacian(f)=1/r^2*d(r^2*d(f,r),r)+1/(r^2*sin(theta))*d(sin(theta)*d(f,theta),theta)+1/(r*sin(theta))^2*d(f,phi,phi)",
		"",

		"n=7",
		"",

		"l=3",
		"",

		"m=1",
		"",

		"R=r^l*exp(-r/n)*laguerre(2*r/n,n-l-1,2*l+1)",
		"",

		"Y=legendre(cos(theta),l,abs(m))*exp(i*m*phi)",
		"",

		"psi=R*Y",
		"",

		"E=psi/n^2",
		"",

		"K=laplacian(psi)",
		"",

		"V=2*psi/r",
		"",

		# after the changes to abs and mag of Jan 2017
		# , some abs/mag are introduced in the results of legendre
		# (correctly, I believe),
		# which makes this expression != 0.
		# TODO this can work only after all the absolute values
		# have been removed
		#"circexp(sin(theta)*(E-K-V))",
		#"0",

	# Green's theorem (surface integral)

		"clearall",
		"",

		"P=2x^3-y^3",
		"",

		"Q=x^3+y^3",
		"",

		"f=d(Q,x)-d(P,y)",
		"",

		"x=r*cos(theta)",
		"",

		"y=r*sin(theta)",
		"",

		"defint(f*r,r,0,1,theta,0,2pi)",
		"3/2*pi",

	# Green's theorem (line integral)

		"clearall",
		"",

		"x=cos(t)",
		"",

		"y=sin(t)",
		"",

		"P=2x^3-y^3",
		"",

		"Q=x^3+y^3",
		"",

		"f=P*d(x,t)+Q*d(y,t)",
		"",

		"f=circexp(f)",
		"",

		"defint(f,t,0,2pi)",
		"3/2*pi",

	# Stokes' theorem (surface integral)

		"clearall",
		"",

		"z=9-x^2-y^2",
		"",

		"F=[3y,4z,-6x]",
		"",

		"S=[x,y,z]",
		"",

		"f=dot(curl(F),cross(d(S,x),d(S,y)))",
		"",

		"x=r*cos(theta)",
		"",

		"y=r*sin(theta)",
		"",

		"defint(f*r,r,0,3,theta,0,2pi)",
		"-27*pi",

	# Stokes' theorem (line integral)

		"clearall",
		"",

		"x=3*cos(t)",
		"",

		"y=3*sin(t)",
		"",

		"z=9-x^2-y^2",
		"",

		"P=3y",
		"",

		"Q=4z",
		"",

		"R=-6x",
		"",

		"f=P*d(x,t)+Q*d(y,t)+R*d(z,t)",
		"",

		"f=circexp(f)",
		"",

		"defint(f,t,0,2pi)",
		"-27*pi",
	]

