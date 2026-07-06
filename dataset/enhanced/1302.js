setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ oh ~ oh").gain(.25)

$: n("0 3 5 7").scale("a:minor").s("gm_piccolo")
  .lpf(3000).gain(.35).pan(.45)

$: n("<a1 e2 f2 c2>").scale("a:minor").s("sawtooth")
  .lpf(500).release(.3).gain(.5)
