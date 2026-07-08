setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd ~ rd ~").gain(.22)

$: n("4 0 7 -4 -4 3 -2 7 4 3 1 2 1 0 4 5").scale("c:minor").s("sawtooth")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square")
  .lpf(650).release(.25).gain(.45)
