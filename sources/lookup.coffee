# now this might be a little confusing, so a
# clarification is in order.
# First off, at the scripting level most things
# as they are handled get evalled.
# That means that they are recursively "calculated"
# as much as possible, i.e. variables are recursively
# looked up for their values, operators are applied,
# functions are ivoked, etc.
# I.e. while scripting, most things are
# evalled all the times.
# e.g. if I type
#   x = 1+1
# then x is actually assigned 2, not 1+1
# Something that helps a little is "quote", e.g.
# If I assign
#   x = quote(1+1)
# then x actually contains 1+1, not 2.
# But then x is evaluated as soon as I type
#   x // gives "2" as x is evaluated
#
# Evaluation is great, but sometimes one wants
# to look at the actual structure of an expression
# or a content of a variable, without those
# being evaluated first.
#
# for example I might type
#   x = a + b
#   a = 1
#   b = 2
# and from this point on printing the actual
# structure of x is impossible, because from
# now on any evaluation of x will give "3"
# You might say "but you have x defined up there,
# what's the point of printing it out?", to which
# the answer is that one might do further
# substitutions or transformations of special kind
# to x. One might want to look at the structure
# and it might be complex or impossible.
#
# So this function does that.
# If it's passed a variable, then it
# DOES NOT eval the variable, RATHER
# it prints the content of the variable without
# evaluating it.
# In the other cases it works like "quote" e.g.
# it just gives the argument as is, again without
# evaluating it.
#
# In the following examples, for brevity, I just
# use
#   x = quote(1+2)
# instead of this:
#   x = a + b
#   a = 1
#   b = 2
# to put a structure in x that is easy to see whether
# it's avaulated or not.
#
# So lookup allows this:
#   x = quote(1+2)
#   print(lookup(x)) # gives 1+2
#
# Note that there would be potentially a way
# to achieve a similar result, you could do:
#   x = quote(quote(1+2))
#   print(x)
# but you can't always control x to contain
# two quotes like that...
# note how two "quotes" are needed because
# if you just put one, then
# x would indeed contain 1+2 instead of 3,
# but then print would evaluate that to 3:
#   x = quote(1+2) # now x contains 1+2, not 3
#   print(x) # but x evaluated here to 3
#
# Other workarounds would not work:
#   x = quote(1+2)
#   print(quote(x))
# would not work because quote(x) literally means 'x'
# so 'x' is printed instead of its content.
#
# Note also that lookup allows you to copy
# the structure of a variable to another:
#   x = a + b
#   a = 1
#   b = 2
# now:
#   y = x # y contains the number 3 and prints to 3
#   y = lookup(x) # y contains "a+b" and prints to 3
#   y = quote(x) # y contains "x" and prints to 3
# note that in the first and second case y is
# independent from x, i.e. changing x doesn't change y
# while in the last case it is.
#
# Another similar simple example is when doing something
# like this:
#    x = y
#    y = z
#    x
#       => gives z
#    lookup(x)
#       => gives y
#          i.e. lookup allows you to see the immediate
#          content of x, rather than the evaluation which
#          would end up in x -> y -> z
# Note that if you invert the order of the assignments i.e.
#    y = z
#    x = y
# Then at this point x immediately contains z, since the
# assignment x = y is not quoted, hence y is evaluated to z
# when assigned to x.
#    lookup(x)
#       => gives z

Eval_lookup = ->
	p1 = cadr(p1)
	if !iscons(p1) and cadr(p1).k == SYM
		p1 = get_binding(p1)
	push p1