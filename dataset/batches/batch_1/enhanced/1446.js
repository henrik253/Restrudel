setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain(.15).pan(.4)

$: note("g#4 ~ f#4 f#4 ~ f4 f4 ~").sound("sawtooth").lpf(2563)
  .release(.2).room(.3).gain(.4)

$: note("<g#1 g#1 d#1 f1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
