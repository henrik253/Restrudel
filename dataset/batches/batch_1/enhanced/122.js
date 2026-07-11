setcpm(120/4)

$: s("bd*4").bank("RolandTR909").struct("[x ~]*8").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("a1 f1 a1 f1").s("sawtooth").lpf(600).release(.2).gain(.5)

$: note("c4 e4 g4 e4").s("gm_bandoneon")
  .lpf(2800).room(.6).delay(.4).release(.2).gain(.35)
