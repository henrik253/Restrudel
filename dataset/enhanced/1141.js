setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("shaker*8").gain(.18).attack(.001)

$: note("a2*8 a2*4 ~").s("gm_overdriven_guitar").lpf(1000)
  .release(.1).gain(.4)

$: note("c4 e4 g4 e4").s("gm_oboe").lpf(2000)
  .release(.2).room(.3).gain(.35)
