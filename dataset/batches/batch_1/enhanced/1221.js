setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.82)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c4 db4 f4 c4 g4 ab4").s("triangle")
  .lpf(2200).release(.2).delay(.35).room(.3).gain(.4)

$: note("<c2 c2 f1 g1>").s("supersaw")
  .lpf(700).release(.25).gain(.4)

$: note("<c3 f3 ab3 g3>").s("pad")
  .attack(.4).release(1.5).room(.5).gain(.25)
