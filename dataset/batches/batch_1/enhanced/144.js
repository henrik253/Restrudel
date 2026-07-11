setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("d2 d2 d2 d2 c4 d4 eb4 d4").s("sawtooth").lpf(700).release(.2).gain(.5)

$: note("c2 g2 a2 f2").s("square").clip(.98).lpf(800).release(.25).gain(.4)

$: n("<0 3 5 7>").scale("c:minor").s("sawtooth")
  .lpf(1800).resonance(5).release(.15).delay(.3).gain(.3)
