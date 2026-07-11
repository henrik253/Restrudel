setcpm(128/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ noise*4 ~ noise*2").hpf(4000).gain(.15)

$: n("3 ~ 5 ~ 8").scale("c:minor").s("triangle")
  .lpf(2400).release(.2).gain(.35)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
