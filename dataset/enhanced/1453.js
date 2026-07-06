setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.8)

$: s("bongo:3 ~ bongo:3 bongo:3").gain(.4).pan(.6)

$: n("<0 5 7 5>").scale("a:minor").s("supersaw")
  .lpf(2000).resonance(4).release(.4).room(.5).delay(.3).gain(.35)

$: n("0 ~ 3 ~ 5 ~ 7 ~").scale("a:minor").s("ocarina")
  .lpf(3000).room(.4).gain(.3)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(550).release(.25).gain(.5)
