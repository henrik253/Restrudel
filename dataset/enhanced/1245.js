setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("woodblock:1 woodblock:2*2").gain(.35)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c4 e4 g4 e4").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: note("<c2 c2 g1 a1>").s("square")
  .lpf(600).release(.2).gain(.5)
