setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.45)

$: s("vocal:1").gain("<0.4 0.45 0.5 0.6>").room(.4).delay(.3)

$: n("<0 3 5 7>").scale("a:minor").s("sawtooth")
  .lpf(3000).release(.3).gain(.4)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
