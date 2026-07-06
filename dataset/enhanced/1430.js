setcpm(116/4)

$: s("bd ~ agogo ~").bank("RolandTR909").gain(.7)

$: s("hh*8").gain(.2).pan(.4)

$: n("~ 2 4 6 2 4").scale("c:major").s("sawtooth")
  .lpf(2000).release(.11).room(.3).gain(.4)

$: n("2 ~ ~ 2 1 ~ 2 3").scale("c:major").s("square")
  .lpf(1800).release(.2).gain(.4)

$: n("<c2 c2 g1 a1>").scale("c:major").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
