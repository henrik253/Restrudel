setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ cp").bank("RolandTR909").room(.5).delay(.4).gain(.6)

$: s("hh*8").gain("[.2 .14]*4")

$: n("0 ~ 3 5 ~ 3 0 ~").scale("g:minor").s("square")
  .lpf(1800).resonance(6).release(.15).gain(.4)

$: n("<g1 g1 eb2 f1>").scale("g:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
