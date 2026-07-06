setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.8)

$: s("perc*3").gain(.35).pan(.6)

$: n("<0 3 5 7>").scale("a:minor").s("gm_electric_guitar_jazz")
  .lpf(2000).room(.4).release(.25).gain(.4)

$: n("0 ~ 3 ~ 5 ~ 7 ~").scale("a:minor").s("gm_cello")
  .lpf(1500).room(.4).release(.3).gain(.3)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(550).release(.25).gain(.5)
