setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2)

$: n("3 4 0 7 6").scale("c:minor").s("gm_lead_1_square")
  .lpf(2200).room(.35).release(.2).gain(.35)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("pulse")
  .lpf(600).release(.3).gain(.5)
