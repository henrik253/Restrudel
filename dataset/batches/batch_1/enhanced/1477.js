setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("amencutup*2").velocity(.4).gain(.4)

$: n("0 ~ 3 5 ~ 3 0 ~").scale("a:minor").s("gm_electric_guitar_clean")
  .velocity(.5).lpf(2000).room(.3).release(.2).gain(.4)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
