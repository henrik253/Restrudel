setcpm(116/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ lt ~ lt").gain(.3)

$: note("a5 f5 ~ d5").s("sawtooth").lpf(700)
  .room(.6).release(.2).delay(.3).gain(.4)

$: note("a2 f2 a2 g2").s("saw").lpf(700)
  .release(.2).gain(.45)
