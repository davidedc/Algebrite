

# quick and dirty way to run a few tests

run_test [

	"1+1",
	"2",
		
	"a·b",
	"inner(a,b)",
		
	"c·(b+a)ᵀ·inv((a+b)ᵀ)·d",
	"inner(c,d)",
		
	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)",
	"inner(c,d)",

	"d·(b+a)ᵀ·inv((a+b)ᵀ)",
	"d",
		
	"(b+a)ᵀ·inv((a+b)ᵀ)",
	"I",
		
	"a·b·c",
	"inner(a,inner(b,c))",
		
	"inner(a,b,c)",
	"inner(a,inner(b,c))",

	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(d)",
	"c",
				
	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(d)·inv(c)",
	"I",
		
	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)",
	"inner(c,d)",
		
	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(d)·inv(c)",
	"I",
		
	"c·d·(b+a)ᵀ·inv((a+b)ᵀ)·inv(c·d)",
	"I",
		
	"c·d·(a+b)ᵀ·inv(c·d·(b+a)ᵀ)",
	"I",
		
	"inv(c)·c",
	"I",
		
	"inv(c·a)·c·a",
	"I",
		
	"inv(c·b·c)·c·b·a",
	"I",
		
	"inv(c)·d·(a+b)ᵀ·inv(inv(c)·d·(b+a)ᵀ)",
	"I",
		
	"inv(c+f)·d·(a+b)ᵀ·inv(inv(f+c)·d·(b+a)ᵀ)",
	"I",
		
]


# alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
