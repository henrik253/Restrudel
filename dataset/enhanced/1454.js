setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[.18 .12]*8").pan(.4)

$: s("hh*2 ~ hh ~").gain(.22)

$: note("b4 a4 b4 c5").s("square")
  .lpf(2200).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<e2 e2 c2 d2>").scale("e:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
