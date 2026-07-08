setcpm(94/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ cp ~ ~").gain(.5).room(.3)

$: s("hh*8").gain(.18)

$: note("c3 f3@2 f3!2 g3").s("sawtooth").lpf(800)
  .release(.2).gain(.45)
