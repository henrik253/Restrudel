setcpm(116/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("~ shaker_small ~ shaker_small").gain(.2).room(.4)

$: n("0 3 7 5").scale("c:minor").s("gm_bassoon")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: n("0 3 7 10 7 5 3 0").scale("c:minor").s("gm_lead_2_sawtooth")
  .lpf(403).release(.2).gain(.4)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
