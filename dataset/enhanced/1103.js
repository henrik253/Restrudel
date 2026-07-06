setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("~ e5 e5 c5 d5 e5 e5 ~").s("piano").lpf(2000)
  .gain(.4).room(.3)

$: note("a3 c4 f4 c4").s("sawtooth").lpf(800)
  .release(.15).gain(.4)
