setcpm(118/4)

$: s("bd ~ bd:2 ~").bank("RolandTR909").gain(.82)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("bb3 d4 f4 bb4").s("psaltery_pluck")
  .lpf(3000).release(.4).room(.4).delay(.3).gain(.4)

$: note("<bb1 bb1 f1 g1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
