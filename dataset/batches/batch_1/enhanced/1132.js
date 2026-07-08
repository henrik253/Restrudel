setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("g2 c2 f2 a1").s("sawtooth").lpf(800)
  .release(.2).gain(.45)

$: note("a1@2 a1 g1*2 a1*2 g1 ~").s("square").lpf(600)
  .release(.2).gain(.4)
