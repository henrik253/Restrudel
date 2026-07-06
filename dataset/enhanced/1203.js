setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*16").gain("[.2 .12]*8").pan(.5)

$: note("<c4 eb4 g4 bb4>").s("gm_choir_aahs")
  .attack(.4).release(1.6).room(.6).gain(.35)

$: note("d#5 ~ a4 d#5").s("triangle")
  .lpf(3000).release(.3).delay(.4).gain(.35)

$: note("<c2 c2 ab1 bb1>").s("sawtooth")
  .lpf(600).release(.22).gain(.5)
