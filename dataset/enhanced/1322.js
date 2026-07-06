setcpm(115/4)

$: s("bd ~ snare ~").bank("RolandTR808").gain(.8)

$: s("hh*4").gain(.2)

$: n("0 3 5 7").scale("a:minor").s("gm_ocarina")
  .lpf(2800).release(.3).room(.4).gain(.35)

$: n("<a1 e2 c2 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
