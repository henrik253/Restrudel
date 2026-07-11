setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("shaker_small:1*4").gain(.2)

$: note("~ a2 ~ c2").s("gm_electric_bass_finger")
  .lpf(500).release(.3).gain(.5)

$: note("d#5@2 c5").s("triangle")
  .lpf(2000).room(.35).delay(.5).gain(.35)
