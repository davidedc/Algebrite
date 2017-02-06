ok_tests = 0
ko_tests = 0

logout = (s) ->
	console.log s


run_test = (s) ->
	i = 0
	t = ""

	test_flag = 1

	run("clearall")

	run("e=quote(e)")

	for i in [0...s.length] by 2

		console.log("starting example: " + s[i])
		#alert("starting example: " + s[i])
		# document.write("starting example: " + s[i] )
		

		out_count = 0

		try
			resultFromRun = run(s[i])
		catch error
			console.log error
			init()


		if (resultFromRun == s[i+1])
			# document.write(" ...ok</br>")
			console.log("ok example: " + s[i])
			# alert("ok example: " + s[i])
			ok_tests++
			continue

		ko_tests++
		# document.write(" ...fail</br>")
		console.log("\n")
		console.log("test failed: " + s[i])

		console.log("expected: " + s[i+1])

		console.log("obtained: " + resultFromRun)
		console.log("\n")

		# alert "test failed: " + s[i] + " expected: " + s[i+1] + " obtained: " + resultFromRun


	test_flag = 0

# these tests do not use "run" but still need a "stop" context