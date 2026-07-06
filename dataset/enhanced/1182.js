setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("c5 g3 b3 d4 g4 a3 c4 e4 a4 f3 a3 c4 f4 c4 e4 g4").s("sawtooth").lpf(2600).resonance(5).release(.15).room(.3).gain(.4)

$: note("c4@2 c4!3 b3").s("square").speed("1.05").delay(.4).gain(.4).release(.2).lpf(1800)

$: note("<c2 g1 a1 f1>").s("sawtooth").lpf(600).release(.3).gain(.5)
