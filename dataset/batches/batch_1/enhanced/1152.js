setcpm(140/4)

$: s("bd ~ bd ~ sd ~ ~ sd").bank("RolandTR909").gain(.8).fast(2)

$: s("hh*8").gain(.2).pan(.5)

$: n("2 4 5 3 2 0 -3 0").scale("c:minor").s("sawtooth").lpf(2400).resonance(7).release(.15).gain(.4)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("square").lpf(700).release(.25).gain(.5)
