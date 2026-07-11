setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cymbal ~ ~").gain(.25).room(.4)

$: s("hh*8").gain(.2).pan(.4)

$: n("0 3 7 5 7 5 3 0").scale("a:minor").s("gm_church_organ")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
