setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh!6 hh*2").gain("[.18 .12]*4")

$: note("f4 c4 e4 g4").s("piano")
  .lpf(2471).room(.2).release(.2).gain(.4)

$: n("<c2 c2 a1 g1>").scale("c:major").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
