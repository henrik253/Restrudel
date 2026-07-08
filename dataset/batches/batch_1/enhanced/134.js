setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c3 f3 f3 f3 f3 g3").s("sawtooth").lpf(700).release(.2).gain(.5)

$: n("8 7 6 8 9 8 7 8 6 3 8 9").scale("c4:minor").s("square")
  .lpf(2000).resonance(5).release(.15).delay(.3).room(.3).gain(.35)

$: n("<0 3 5 4>").scale("c:minor").s("sawtooth").lpf(1800).release(.2).room(.4).gain(.3)
