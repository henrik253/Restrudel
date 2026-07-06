setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c3 d#3 d#3 c#3").s("sawtooth")
  .lpf(1888).resonance(3).release(.2).delay(.3).gain(.4)

$: s("gm_overdriven_guitar:6").note("c4 g4 c5 g4").clip(.9).room(.5).gain(.35)

$: note("<c2 g1 eb2 bb1>").s("square").lpf(600).release(.25).gain(.5)
