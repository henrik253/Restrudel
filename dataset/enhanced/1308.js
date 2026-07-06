setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd*4").gain(.2)

$: note("~ c4*2 d#4 c4").s("gm_reed_organ")
  .lpf(2800).release(.3).room(.5).gain(.35)

$: note("<c2 g1 g#1 a#1>").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
