setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("LinnDrum").gain(.8)

$: s("hh*4").gain(.18).pan(.4)

$: note("<c4 eb4 g4 bb4>").s("gm_choir_aahs")
  .lpf(4925).attack(.3).release(1.5).room(.6).gain(.35)

$: note("<c5 eb5 g5 f5>").s("sine")
  .lpf(2000).release(.4).delay(.4).gain(.3).segment(4)

$: note("<c2 g1 ab1 g1>").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
