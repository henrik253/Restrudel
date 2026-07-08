setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("perc*3 ~").gain(.25).pan(.4)

$: note("a5 f5 ~ a5 ~ f5 ~").s("sawtooth").lpf(4000)
  .decay(.06).release(.15).delay(.3).gain(.35)

$: note("a2 f2 a2 g2").s("square").lpf(700)
  .release(.2).gain(.45)
