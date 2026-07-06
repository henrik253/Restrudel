setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ oh ~ oh").gain(.3)

$: note("c4 a3 b3 c4 d4 d#4 f4 f#4").s("sawtooth")
  .fm(1.6).lpf(2200).resonance(5).release(.12).delay(.35).gain(.4)

$: n("0 4 2 3 1 2 0 1").scale("c:minor").s("square")
  .lpf(1500).release(.15).gain(.4)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
