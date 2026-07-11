setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ oh ~ oh").gain(.3)

$: s("vocal:1").room(.5).gain(.5).delay(.3)

$: n("0 ~ 3 5 ~ 3 0 ~").scale("a:minor").s("gm_overdriven_guitar")
  .lpf(2000).room(.3).gain(.35)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
