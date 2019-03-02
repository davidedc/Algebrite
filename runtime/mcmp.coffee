# Bignum compare
#
#  returns
#
#  -1    a < b
#
#  0    a = b
#
#  1    a > b



mcmp = (a,b) ->
  return a.compare b

# a is a bigint, n is a normal int
mcmpint = (a,n) ->
  b = bigInt(n)
  t = mcmp(a, b)
  return t

