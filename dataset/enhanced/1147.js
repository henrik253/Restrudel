setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("c4 e4 g4 e4").s("triangle").lpf(600)
  .room(.6).release(.3).gain(.4)

$: note("c2 g1 c2 f1").s("sawtooth").lpf(700)
  .release(.2).gain(.45)
