setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("perc*3 sd:1").gain(.4)

$: s("hh*8").gain("[.18 .12]*4")

$: n("0 ~ 3 5 ~ 3 0 ~").scale("e:minor").s("gm_electric_guitar_clean")
  .lpf(2000).room(.3).release(.2).gain(.4)

$: n("<e2 e2 c2 d2>").scale("e:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
