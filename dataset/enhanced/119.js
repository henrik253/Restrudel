setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("~ a3 c4 ~").s("sawtooth")
  .lpf(800).decay(.1).resonance(5).release(.2).delay(.3).room(.4).gain(.4)

$: n("~ 3 ~ 5 5 6 6").scale("c:major").s("square")
  .lpf(1800).release(.15).gain(.35)

$: n("<c2 a1 f1 g1>").scale("c:major").s("sawtooth").lpf(600).release(.25).gain(.5)
