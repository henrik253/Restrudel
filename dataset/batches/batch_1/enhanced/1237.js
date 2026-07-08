setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ snare ~ ~").room(.2).delay(.9).gain(.22)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: n("2 7 4 2 7 4 2 7").scale("c:ritusen").s("square")
  .transpose("<0 0 1 0>").lpf(2000).resonance(5).release(.15).delay(.35).gain(.4)

$: note("e3 g3 c4 e4 g4 c5 g4 g2").s("sawtooth")
  .lpf(700).release(.2).gain(.45)
