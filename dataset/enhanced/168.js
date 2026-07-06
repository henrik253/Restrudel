setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ cp ~").bank("RolandTR909").gain(.4)

$: s("hh*8").gain(.16)

$: note("d2*4 c3@2 g#2 c3").s("sawtooth")
  .lpf(700).release(.25).gain(.5)

$: n("<5 7 0 4 8>").scale("d:dorian").s("gm_piccolo")
  .clip(.6).release(.2).room(.3).pan(.55).gain(.3)
