setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").lpf(600).gain(.2)

$: note("~ a2 ~ a2").s("gm_electric_bass_pick")
  .lpf(400).resonance(13).gain(.6).release(.3).attack(.001)

$: note("c4 g#4 ~ g4 ~ f#4 f4 d#4 c#4").s("square")
  .lpf(3200).release(.2).gain(.3)
