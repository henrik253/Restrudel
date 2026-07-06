setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: n("9 8 6 ~ 8 6 8 9").scale("a:minor").s("sawtooth")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<a1 e2 c2 e2>").scale("a:minor").s("square")
  .lpf(650).release(.25).gain(.45)
