setcpm(120/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: n("9*2 9!2 6 7").scale("c:minor").s("sawtooth")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square")
  .lpf(650).release(.25).gain(.45)
