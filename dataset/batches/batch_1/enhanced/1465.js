setcpm(120/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain("[.2 .14]*4")

$: note("c4*2 d#4 f4 ~").velocity(.6).s("square")
  .lpf(2000).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<c2 c2 ab1 f1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
