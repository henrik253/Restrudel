setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cr ~ ~").bank("RolandTR909").gain(.5)

$: s("hh*8").gain(.16)

$: n("0 3 5 7 5 3").scale("a:minor").s("gm_baritone_sax")
  .room(.3).release(.3).gain(.4)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
