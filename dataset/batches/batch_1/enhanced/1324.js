setcpm(124/4)

$: s("bd ~ sd ~").bank("Linn9000").velocity(.6).pan(.55).gain(.85)

$: s("hh*4").gain(.2)

$: n("0 3 7 5").scale("c:minor").s("sawtooth")
  .lpf(1600).resonance(6).release(.2).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square")
  .lpf(600).release(.3).gain(.5)
