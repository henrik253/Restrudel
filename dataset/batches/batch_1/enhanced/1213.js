setcpm(128/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.82)

$: s("~ hh ~ hh").gain(.2)

$: n("0 3 5 3 7 5").scale("a:minor").s("sawtooth")
  .lpf(1519).resonance(6).crush(4).release(.15).delay(.4).gain(.36)

$: n("<a1 a1 e2 c2>").scale("a:minor").s("square")
  .lpf(600).release(.2).gain(.5)
