setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cowbell ~ cowbell").gain(.3).room(.4)

$: note("c3 d3 e3 f3").s("gm_baritone_sax").lpf(2000)
  .release(.2).room(.3).gain(.4)

$: note("<c2 c2 g1 f1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
