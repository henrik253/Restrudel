setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("a1 g1*2 a1*2 g1 ~ g3 a3 ~").s("square")
  .lpf(650).release(.2).gain(.5)

$: n("9*2 8").scale("a:minor").s("sawtooth")
  .lpf(1800).resonance(6).release(.15).delay(.3).room(.3).gain(.4)

$: n("6").scale("a:minor").s("sawtooth").lpf(1200).release(.4).room(.5).gain(.3)
