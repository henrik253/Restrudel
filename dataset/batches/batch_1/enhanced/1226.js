setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: n("-3 0 2 -3 -1 1 -4 -1").scale("c:minor").s("sawtooth")
  .lpf(650).lpq(.2).resonance(5).release(.15).delay(.4).gain(.4)

$: note("c4 e4 g4 e4").s("gm_electric_guitar_jazz")
  .release(.12).lpf(2500).gain(.3)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("square")
  .lpf(600).release(.2).gain(.5)
