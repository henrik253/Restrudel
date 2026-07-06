setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.82)

$: s("~ ~ ~ crash").gain(.3)

$: s("tambourine*4").gain("[1 0.6]*2").gain(.25)

$: note("c2 g1 e2 g1").s("gm_tuba")
  .delay(.5).lpf(800).release(.2).gain(.5)

$: note("c4 e4 g4 e4").s("pulse")
  .lpf(1800).resonance(5).release(.15).delay(.4).gain(.4)
