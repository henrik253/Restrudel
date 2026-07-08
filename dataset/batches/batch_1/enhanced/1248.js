setcpm(122/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85).release(.08)

$: s("~ cr ~ lt").gain(.25).hpf(400)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("c4 e4 g4 e4").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: note("<c2 c2 g1 a1>").s("square")
  .lpf(600).release(.2).gain(.5)
