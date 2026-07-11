setcpm(92/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: note("b2 d2").s("sawtooth").lpf(900).gain(.4)

$: note("<[g3 bb3 d4 f4] [c4 e4 g4 bb4] [f3 a3 c4 e4]>").s("piano").clip(1).room(.3).delay(.3).gain(.5)
