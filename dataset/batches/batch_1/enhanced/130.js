setcpm(126/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh hh hh").gain(.2).lpf(2800).pan(.7)

$: n("0 3 7 5 3 0").scale("c:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square").lpf(600).release(.25).gain(.5)
