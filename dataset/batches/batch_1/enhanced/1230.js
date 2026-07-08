setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*2 cp ~").gain(.4)

$: note("c4 f4 g4 f4").s("gm_piano")
  .clip(.9).lpf(2500).release(.2).room(.3).gain(.4)

$: note("c5 g4 e5 g4").s("gm_piccolo")
  .lpf(2000).room(.24).delay(.5).gain(.35)

$: note("<c2 c2 f1 g1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
