setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*8").gain(.2)

$: note("c4 a3 f3 e3").s("sawtooth").lpf(1200).release(.2).gain(.4)

$: note("e3 a3").sound("bd*2 ~").gain(.5)
