setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.16)

$: n("0 3 7 5 3 0 5 3").scale("a:minor").s("supersaw")
  .release(.4).lpf(2400).room(.3).gain(.4)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("gm_marimba")
  .release(.3).gain(.45)
