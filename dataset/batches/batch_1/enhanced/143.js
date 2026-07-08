setcpm(124/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("d4 d#4@4 ~ d#4").s("supersaw")
  .lpf(1441).room(.2).delay(.39).delaytime(.11).release(.2).gain(.4)

$: note("<d2 a1 f2 a1>").s("sawtooth").lpf(600).release(.25).gain(.5)

$: note("c4 e4 g4 e4").s("gm_clarinet").attack(.05).gain(.3).room(.4)
