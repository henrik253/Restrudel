setcpm(120/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("hh*4").gain(.2)

$: note("e4 b3 e4 g#4").s("sawtooth")
  .lpf(2400).resonance(6).release(.2).gain(.4)

$: note("c2*8").s("square")
  .lpf(600).release(.15).gain(.45)
