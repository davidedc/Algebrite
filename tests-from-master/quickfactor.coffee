test_quickfactor = ->
  logout "testing quickfactor\n"
  for i in [2...10001]
    if i % 1000 == 0
      console.log i
    base = i
    qf = quickfactor integer(base), integer(1)
    arr = []
    h = tos
    j = 0
    while base > 1
      expo = 0
      while base % primetab[j] == 0
        base /= primetab[j]
        expo++
      if expo
        arr.push quickpower(integer(primetab[j]), integer(expo))[0]
      j++
    p2 = multiply_all arr
    if !equal(qf, p2)
      logout "failed\n"
      logout qf
      logout p2
      errout()
  console.log "quickfactor is ok"
  logout "ok\n"
