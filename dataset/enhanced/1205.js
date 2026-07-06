setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.4)

$: n("0 2 3 5 3 2").scale("d:minor").s("sawtooth")
  .struct("[~ x]*2").lpf(1600).resonance(6).release(.15).delay(.4).gain(.4)

$: n("<0 -2 -4 -3>").scale("d:minor").s("square")
  .lpf(600).release(.22).gain(.5)
