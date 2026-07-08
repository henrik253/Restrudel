setcpm(126/4)

$: s("bd*2 ~ bd sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: n("0 3 5 7 5 3").scale("c:minor").s("sawtooth")
  .lpf(3820).resonance(5).release(.15).room(1).delay(.4).gain(.4)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("square")
  .lpf(600).release(.2).gain(.5)
