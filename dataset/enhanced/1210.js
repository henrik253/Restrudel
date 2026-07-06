setcpm(114/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ snare ~ snare").bank("RolandTR808").gain(.5)

$: s("~ rd ~ rd ~ rd ~ rd").gain(.2)

$: note("c1 ~ f1 g1").s("sawtooth")
  .decay(.15).sustain(.4).lpf(700).release(.2).gain(.5)

$: note("c2 f2 g2 c2 f2 g2 c2").s("square")
  .lpf(1400).release(.15).gain(.4)
