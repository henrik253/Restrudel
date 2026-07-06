setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("<0 3 5 7>").scale("g:major").s("gm_choir_aahs:1")
  .room(.5).release(.4).gain(.3)

$: note("a2*8").s("sawtooth")
  .lpf(2000).room(.2).attack(.1).release(.3).gain(.4)

$: note("g4 g3 b3 d4").s("square")
  .lpf(1800).release(.2).gain(.35)
