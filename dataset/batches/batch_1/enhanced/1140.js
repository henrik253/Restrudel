setcpm(94/4)

$: s("bd ~ sd ~ ~ ~ sd ~").bank("linn9000").gain(.8)

$: s("hh*8 12 16 24 32").gain(.18)

$: note("c4 e4 g4 e4").s("kalimba").lpf(2000)
  .release(.4).room(.5).gain(.35)

$: note("c2 g1 c2 f1").s("sawtooth").lpf(700)
  .release(.25).gain(.45)
