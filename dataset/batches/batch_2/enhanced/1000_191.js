setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh*2").gain(.2)

$: note("c3 f3 c3 f3").sound("sawtooth").lpf(900).gain(.4)

$: note("f4 a4 c5 c4 e4 g4 g4 b4").sound("sawtooth").gain(.3).room(.3)
