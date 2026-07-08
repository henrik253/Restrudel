setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("pulse*4").gain(.2).attack(.05).pan(.5)

$: note("a2*8").s("sawtooth").lpf(1000).release(.1).gain(.3)

$: note("c5 a4 g4 a4").s("square").lpf(4365)
  .release(.2).gain(.4)
