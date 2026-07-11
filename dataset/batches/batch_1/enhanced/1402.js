setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).pan(.45)

$: s("~ oh ~ oh").gain(.25).pan(.4)

$: n("0 ~ 3 ~ 5 ~ 7 8 ~ 7 5 ~ 3").scale("a:minor").s("gm_drawbar_organ")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
