setcpm(124/4)

$: s("bd*3").bank("RolandTR909").struct("x*3").gain(.85)

$: s("oh*4").bank("Linn9000").hpf(4000).gain(.25)

$: n("0 3 7 5").scale("c:minor").s("gm_lead_6_voice")
  .lpf(2400).release(.2).room(.3).gain(.35)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
