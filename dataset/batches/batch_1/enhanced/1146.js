setcpm(120/4)

$: s("bd*2 ~ ~ sd").bank("RolandTR909").gain(.8)

$: s("oh ~ oh ~ oh").gain(.4).delay(.5).room(.45)

$: note("a2*8 a2*4").s("sawtooth").lpf(600)
  .release(.1).gain(.35)

$: n("0 3 7 5").scale("a:minor").s("square")
  .lpf(1500).release(.2).gain(.4)
