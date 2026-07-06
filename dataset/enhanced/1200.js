setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ cp ~ cp").bank("RolandTR909").gain(.6)

$: s("hh*8").gain("[.22 .14]*4").pan(.4)

$: n("0 ~ 3 5").scale("c:minor").s("clavisynth")
  .lpf(1800).resonance(6).release(.15).delay(.4).gain(.4)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
