setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("oh*8").gain("[.2 .13]*4").pan(.5)

$: note("c4 e4 g4 e4").s("gm_bassoon")
  .gain(.4).room(.6).delay(.2).delaytime(.33).delayfeedback(.6).release(.2)

$: note("<c2 g1 eb2 bb1>").s("sawtooth").lpf(600).release(.25).gain(.5)

$: n("0 3 5 7").scale("c:minor").s("square").lpf(1800).release(.15).gain(.3)
