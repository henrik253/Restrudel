setcpm(126/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("hh*4").gain(.2)

$: n("0 3 7 5").scale("a:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.08).gain(.4)

$: note("a2 f2").s("square")
  .lpf(600).release(.3).gain(.5)
