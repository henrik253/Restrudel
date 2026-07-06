setcpm(122/4)

$: s("bd ~ sd:3 ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .14]*4").pan(.43)

$: n("7 3 ~ 4").scale("c:minor").s("gm_lead_6_voice")
  .lpf(2500).release(.2).delay(.3).room(.3).gain(.35)

$: note("c2 c2 g1 g1").s("triangle").lpf(600).release(.2).gain(.5)

$: n("<0 3 5 7>").scale("c:minor").s("sawtooth")
  .lpf(1800).release(.15).delay(.3).gain(.35)
