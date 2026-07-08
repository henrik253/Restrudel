setcpm(120/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("c4 d4 e4").s("square")
  .lpf(2600).room(.3).delay(.5).gain(.35)

$: note("f2 ~ f2 c2").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
