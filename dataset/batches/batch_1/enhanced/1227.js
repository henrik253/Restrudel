setcpm(118/4)

$: s("bd ~ sd ~ cp ~ sd ~").bank("RolandTR909").gain(.8).attack(.003)

$: s("rd*8").gain(.18)

$: note("c5 c4 e4 g4").s("bd")
  .lpf(3500).attack(.001).velocity(.55).gain(.3)

$: note("<c2 g1 ab1 g1>").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.5)

$: note("<c4 eb4 g4 bb4>").s("gm_oboe:2")
  .attack(.1).release(1).room(.4).gain(.3)
