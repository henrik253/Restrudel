setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2)

$: note("f4 d#4 g#3 c4").s("sawtooth")
  .lpf(3000).release(.25).room(.6).gain(.4)

$: note("<f1 c2 g#1 c1>").s("psaltery_pluck")
  .clip(1).release(1.2).gain(.35).room(.3)
