setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("g3 bb3 d4 f4 c3 e3 g3 bb3").sound("sawtooth").lpf(1000)
  .release(.2).room(.3).gain(.4)

$: n("0 ~ 2 ~ 4 5 ~ 4").scale("c:major").s("square")
  .lpf(1800).release(.2).gain(.4)

$: note("<g1 g1 c2 c2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
