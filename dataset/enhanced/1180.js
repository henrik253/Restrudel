setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: n("1 2 1 0 4 5 2 4 1 2 7 9 5 7 10 4").scale("c:major").s("sawtooth").lpf(2600).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 g1 a1 f1>").scale("c:major").s("square").lpf(600).release(.3).gain(.5)
