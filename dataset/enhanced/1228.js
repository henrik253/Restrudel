setcpm(126/4)

$: s("bd!2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("c4 e4 g4 e4").s("gm_overdriven_guitar:3")
  .clip(1).lpf(2800).release(.2).room(.3).gain(.35)

$: note("<c2 c2 g1 a1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
