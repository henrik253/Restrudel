setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd ~ rd ~ ~ hh ~ rim").gain(.25)

$: s("hh*4 ~").gain(.18).pan(.4)

$: note("c2 c2 g2 f2 c3 g2 a2 f2").s("sawtooth")
  .lpf(800).release(.2).gain(.45)
